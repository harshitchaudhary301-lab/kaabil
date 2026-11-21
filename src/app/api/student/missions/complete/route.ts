import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { DailyMissionsEngine } from "@/lib/missions/daily-missions-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to complete mission." },
        { status: 401 }
      );
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { missionId, reflectionText, feedbackRating } = body;

    if (!missionId) {
      return NextResponse.json(
        { error: "Missing required missionId." },
        { status: 400 }
      );
    }

    const completed = await DailyMissionsEngine.completeMission(
      studentProfile.id,
      missionId,
      reflectionText || "",
      feedbackRating || 5
    );

    if (!completed) {
      return NextResponse.json(
        { error: "Mission not found or unauthorized." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Daily mission completed successfully! Meaningful reflection logged.",
      mission: completed,
    });
  } catch (error: any) {
    console.error("[POST /api/student/missions/complete] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit mission completion." },
      { status: 500 }
    );
  }
}
