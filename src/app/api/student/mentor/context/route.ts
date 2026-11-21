import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { AiMentorService } from "@/lib/mentor/ai-mentor-service";

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

    const context = await AiMentorService.getStudentLiveContext(studentProfileId);
    return NextResponse.json({ success: true, context });
  } catch (error: any) {
    console.error("[GET /api/student/mentor/context] Error:", error);
    return NextResponse.json({ error: "Failed to retrieve student context" }, { status: 500 });
  }
}
