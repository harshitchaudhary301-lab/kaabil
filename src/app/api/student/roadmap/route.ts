import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { AdaptiveRoadmapEngine } from "@/lib/roadmap/adaptive-roadmap-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to access Adaptive Roadmap." },
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

    const { searchParams } = new URL(req.url);
    const careerSlug = searchParams.get("careerSlug") || undefined;

    const roadmap = await AdaptiveRoadmapEngine.getOrGenerateRoadmap(studentProfileId, careerSlug);

    return NextResponse.json({
      success: true,
      roadmap,
    });
  } catch (error: any) {
    console.error("[GET /api/student/roadmap] Error:", error);
    return NextResponse.json(
      { error: "Internal error retrieving Adaptive Roadmap." },
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
        { error: "Authentication required to generate Adaptive Roadmap." },
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

    const body = await req.json();
    const careerSlug = body.careerSlug || "ai-systems-engineer";

    const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(studentProfileId, careerSlug);

    return NextResponse.json({
      success: true,
      message: "Adaptive Roadmap generated successfully.",
      roadmap,
    });
  } catch (error: any) {
    console.error("[POST /api/student/roadmap] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate Adaptive Roadmap." },
      { status: 500 }
    );
  }
}
