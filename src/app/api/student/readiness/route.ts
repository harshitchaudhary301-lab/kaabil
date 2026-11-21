import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { CareerReadinessEngine } from "@/lib/readiness/cri-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to view Career Readiness Index." },
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

    const readiness = await CareerReadinessEngine.calculateReadiness(studentProfileId, careerSlug);

    return NextResponse.json({
      success: true,
      readiness,
    });
  } catch (error: any) {
    console.error("[GET /api/student/readiness] Error:", error);
    return NextResponse.json(
      { error: "Internal error calculating Career Readiness Index." },
      { status: 500 }
    );
  }
}
