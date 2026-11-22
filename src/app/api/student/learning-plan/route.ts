// ==============================================================================
// KAABIL (काबिल) — Student Personalized Learning Plan API Route
// GET: Fetch personalized 4-week learning sprints, daily tasks, and curated resources
// POST / PATCH: Update student weekly learning time commitment and budget preferences
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { LearningPlanService } from "@/lib/learning/learning-plan-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const preferencesSchema = z.object({
  weeklyTimeCommitmentHours: z.union([
    z.literal(5),
    z.literal(10),
    z.literal(15),
    z.literal(20),
  ]).optional(),
  budgetPreference: z.enum(["FREE_ONLY", "AFFORDABLE_PAID", "ANY"]).optional(),
  learningPace: z.enum(["STEADY", "ACCELERATED", "WEEKEND_FOCUS"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    let sessionUser: any = null;
    try {
      sessionUser = await getSessionUser();
    } catch {
      // Non-cookie environment fallback
    }

    const identifier = sessionUser?.email || sessionUser?.id || "demo.student@kaabil.in";
    const plan = await LearningPlanService.getLearningPlan(identifier);

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error: any) {
    console.error("[GET /api/student/learning-plan] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to load personalized learning plan.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let sessionUser: any = null;
    try {
      sessionUser = await getSessionUser();
    } catch {
      // Non-cookie environment fallback
    }

    const identifier = sessionUser?.email || sessionUser?.id || "demo.student@kaabil.in";
    const body = await req.json();
    const validated = preferencesSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid learning preferences.",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    const updatedPrefs = await LearningPlanService.updatePreferences(
      identifier,
      validated.data
    );

    const updatedPlan = await LearningPlanService.getLearningPlan(identifier);

    return NextResponse.json({
      success: true,
      message: "Learning preferences updated successfully.",
      preferences: updatedPrefs,
      plan: updatedPlan,
    });
  } catch (error: any) {
    console.error("[POST /api/student/learning-plan] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update learning preferences.",
      },
      { status: 500 }
    );
  }
}
