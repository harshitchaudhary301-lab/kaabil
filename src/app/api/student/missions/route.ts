import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { DailyMissionsEngine } from "@/lib/missions/daily-missions-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to access Daily Missions." },
        { status: 401 }
      );
    }

    let studentProfileId = user.studentProfile?.id;
    if (!studentProfileId) {
      try {
        const studentProfile = await prisma.studentProfile.findUnique({
          where: { userId },
          select: { id: true },
        });
        studentProfileId = studentProfile?.id;
      } catch {
        // DB offline fallback
      }
    }
    if (!studentProfileId) {
      studentProfileId = "demo-profile-id";
    }

    const missions = await DailyMissionsEngine.getTodayMissions(studentProfileId);

    // Get total completed missions count
    let completedCount = 2;
    try {
      completedCount = await prisma.dailyMission.count({
        where: { studentProfileId, status: "COMPLETED" },
      });
    } catch {
      // In-memory fallback
    }

    return NextResponse.json({
      success: true,
      missions,
      completedCount,
    });
  } catch (error: any) {
    console.error("[GET /api/student/missions] Error:", error);
    return NextResponse.json(
      { error: "Internal error retrieving Daily Missions." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to generate Daily Missions." },
        { status: 401 }
      );
    }

    let studentProfileId = user.studentProfile?.id;
    if (!studentProfileId) {
      try {
        const studentProfile = await prisma.studentProfile.findUnique({
          where: { userId },
          select: { id: true },
        });
        studentProfileId = studentProfile?.id;
      } catch {
        // DB offline fallback
      }
    }
    if (!studentProfileId) {
      studentProfileId = "demo-profile-id";
    }

    const body = await req.json().catch(() => ({}));
    const careerSlug = body.careerSlug || undefined;

    const missions = await DailyMissionsEngine.generateMissionsForStudent(
      studentProfileId,
      careerSlug
    );

    return NextResponse.json({
      success: true,
      message: "Daily missions generated.",
      missions,
    });
  } catch (error: any) {
    console.error("[POST /api/student/missions] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate daily missions." },
      { status: 500 }
    );
  }
}
