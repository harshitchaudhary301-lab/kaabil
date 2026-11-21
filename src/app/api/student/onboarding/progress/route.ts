// ==============================================================================
// KAABIL (काबिल) — Onboarding Draft Progress & State Persistence
// Allows students to save progress at any step and resume later
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, checkDatabaseConnection } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const progressSchema = z.object({
  currentStep: z.number().int().min(1).max(7),
  stepData: z.record(z.any()),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conn = await checkDatabaseConnection();
    if (!conn.connected) {
      return NextResponse.json({
        currentStep: 1,
        stepData: null,
        isCompleted: false,
      });
    }

    const profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
      include: { onboardingProgress: true },
    });

    if (!profile || !profile.onboardingProgress) {
      return NextResponse.json({
        currentStep: 1,
        stepData: null,
        isCompleted: false,
      });
    }

    let parsedData = null;
    if (profile.onboardingProgress.stepDataJson) {
      try {
        parsedData = typeof profile.onboardingProgress.stepDataJson === "string"
          ? JSON.parse(profile.onboardingProgress.stepDataJson)
          : profile.onboardingProgress.stepDataJson;
      } catch {
        parsedData = null;
      }
    }

    return NextResponse.json({
      currentStep: profile.onboardingProgress.currentStep,
      stepData: parsedData,
      isCompleted: profile.onboardingProgress.isCompleted,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Failed to fetch onboarding progress.", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = progressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid progress parameters", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { currentStep, stepData } = parsed.data;
    const conn = await checkDatabaseConnection();

    if (conn.connected) {
      let profile = await db.studentProfile.findUnique({
        where: { userId: user.id },
      });

      if (!profile) {
        profile = await db.studentProfile.create({
          data: {
            userId: user.id,
          },
        });
      }

      await db.onboardingProgress.upsert({
        where: { studentProfileId: profile.id },
        update: {
          currentStep,
          stepDataJson: JSON.stringify(stepData),
        },
        create: {
          studentProfileId: profile.id,
          currentStep,
          stepDataJson: JSON.stringify(stepData),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Step ${currentStep} progress saved.`,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Could not persist onboarding progress.", details: err.message },
      { status: 500 }
    );
  }
}
