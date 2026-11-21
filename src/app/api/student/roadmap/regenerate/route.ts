import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { AdaptiveRoadmapEngine } from "@/lib/roadmap/adaptive-roadmap-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to regenerate roadmap." },
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
    const { roadmapId } = body;

    if (!roadmapId) {
      return NextResponse.json(
        { error: "Missing required roadmapId." },
        { status: 400 }
      );
    }

    const updated = await AdaptiveRoadmapEngine.regenerateFutureMilestones(
      studentProfile.id,
      roadmapId
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Roadmap not found or unauthorized." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Future milestones regenerated while preserving completed progress.",
      roadmap: updated,
    });
  } catch (error: any) {
    console.error("[POST /api/student/roadmap/regenerate] Error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate roadmap milestones." },
      { status: 500 }
    );
  }
}
