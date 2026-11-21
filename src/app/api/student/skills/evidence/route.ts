import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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

    const evidences = devStore.getSkillEvidences(studentProfileId);

    return NextResponse.json({
      success: true,
      studentProfileId,
      evidences,
    });
  } catch (error: any) {
    console.error("[GET /api/student/skills/evidence] Error:", error);
    return NextResponse.json({ error: "Failed to retrieve skill evidence" }, { status: 500 });
  }
}
