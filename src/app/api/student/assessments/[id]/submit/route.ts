import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { AssessmentEngine } from "@/lib/assessment/assessment-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let studentProfileId = user.studentProfile?.id;
    if (!studentProfileId) {
      try {
        const prof = await prisma.studentProfile.findUnique({
          where: { userId },
          select: { id: true },
        });
        studentProfileId = prof?.id;
      } catch {}
    }
    if (!studentProfileId) {
      studentProfileId = "demo-profile-id";
    }

    const body = await req.json();
    const { attemptId, answers } = body;

    if (!attemptId || !answers) {
      return NextResponse.json({ error: "Missing attemptId or answers in submission" }, { status: 400 });
    }

    const result = await AssessmentEngine.submitAttempt(attemptId, studentProfileId, answers);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("[POST /api/student/assessments/[id]/submit] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate submission" }, { status: 500 });
  }
}
