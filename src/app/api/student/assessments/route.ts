import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { AssessmentEngine } from "@/lib/assessment/assessment-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    let studentProfileId = user?.studentProfile?.id;
    if (userId && !studentProfileId) {
      try {
        const prof = await prisma.studentProfile.findUnique({
          where: { userId },
          select: { id: true },
        });
        studentProfileId = prof?.id;
      } catch {}
    }
    if (!studentProfileId && user) {
      studentProfileId = "demo-profile-id";
    }

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || undefined;
    const category = searchParams.get("category") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;

    const assessments = await AssessmentEngine.getAssessments({
      stream,
      category,
      difficulty,
      studentProfileId,
    });

    return NextResponse.json({ success: true, assessments });
  } catch (error: any) {
    console.error("[GET /api/student/assessments] Error:", error);
    return NextResponse.json({ error: "Failed to retrieve assessments" }, { status: 500 });
  }
}
