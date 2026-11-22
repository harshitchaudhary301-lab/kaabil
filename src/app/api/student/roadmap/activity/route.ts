import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { getSessionUser } from "@/lib/auth/session";
import { AdaptiveRoadmapEngine } from "@/lib/roadmap/adaptive-roadmap-engine";

export const dynamic = "force-dynamic";

async function handleUpdateActivity(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to update roadmap activity." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { roadmapId, milestoneId, activityId, completed } = body;

    if (!milestoneId || !activityId) {
      return NextResponse.json(
        { error: "Missing required milestoneId or activityId." },
        { status: 400 }
      );
    }

    let studentProfileId: string = user.studentProfile?.id || "";
    if (!studentProfileId) {
      try {
        const prof = await prisma.studentProfile.findUnique({
          where: { userId },
          select: { id: true },
        });
        if (prof?.id) studentProfileId = prof.id;
      } catch {}
    }
    if (!studentProfileId) {
      const devProf = devStore.getProfileByUserId(userId);
      studentProfileId = devProf?.id || "demo-profile-id";
    }

    let updatedRoadmap = null;
    try {
      if (roadmapId) {
        updatedRoadmap = await AdaptiveRoadmapEngine.toggleActivityCompletion(
          studentProfileId,
          roadmapId,
          milestoneId,
          activityId
        );
      }
    } catch {
      // Fallback to devStore
    }

    if (!updatedRoadmap) {
      updatedRoadmap = devStore.updateRoadmapActivity(
        milestoneId,
        activityId,
        completed !== undefined ? Boolean(completed) : true
      );
    }

    return NextResponse.json({
      success: true,
      message: "Activity progress updated successfully.",
      roadmap: updatedRoadmap,
    });
  } catch (error: any) {
    console.error("[Roadmap Activity API] Error:", error);
    return NextResponse.json(
      { error: "Failed to update activity completion.", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return handleUpdateActivity(req);
}

export async function PATCH(req: NextRequest) {
  return handleUpdateActivity(req);
}
