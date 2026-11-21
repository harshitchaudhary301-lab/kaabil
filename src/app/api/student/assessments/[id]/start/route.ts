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

    const attempt = await AssessmentEngine.startAttempt(studentProfileId, params.id);
    return NextResponse.json({ success: true, attempt });
  } catch (error: any) {
    console.error("[POST /api/student/assessments/[id]/start] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to start assessment attempt" }, { status: 500 });
  }
}
