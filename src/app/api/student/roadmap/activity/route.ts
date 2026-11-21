import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { AdaptiveRoadmapEngine } from "@/lib/roadmap/adaptive-roadmap-engine";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to update roadmap activity." },
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
    const { roadmapId, milestoneId, activityId } = body;

    if (!roadmapId || !milestoneId || !activityId) {
      return NextResponse.json(
        { error: "Missing required roadmapId, milestoneId, or activityId." },
        { status: 400 }
      );
    }

    const updatedRoadmap = await AdaptiveRoadmapEngine.toggleActivityCompletion(
      studentProfile.id,
      roadmapId,
      milestoneId,
      activityId
    );

    if (!updatedRoadmap) {
      return NextResponse.json(
        { error: "Activity not found or unauthorized." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Activity progress updated successfully.",
      roadmap: updatedRoadmap,
    });
  } catch (error: any) {
    console.error("[PATCH /api/student/roadmap/activity] Error:", error);
    return NextResponse.json(
      { error: "Failed to update activity completion." },
      { status: 500 }
    );
  }
}
