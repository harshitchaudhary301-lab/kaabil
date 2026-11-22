import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
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
      const devProf = devStore.getProfileByUserId(userId);
      if (devProf) {
        studentProfileId = devProf.id;
      }
    }
    if (!studentProfileId) {
      const devProfByEmail = devStore.getProfileByEmail(user.email);
      if (devProfByEmail) {
        studentProfileId = devProfByEmail.id;
      }
    }
    if (!studentProfileId) {
      studentProfileId = "prof-" + userId;
      devStore.saveProfile({
        id: studentProfileId,
        userId,
        educationStage: user.studentProfile?.educationStage || "CLASS_12",
        currentStream: user.studentProfile?.currentStream || "UNDECIDED",
        user: { name: user.name, email: user.email },
        targetCareerPathId: "exploring-paths",
        careerGoals: [{ careerPath: { title: "Exploring Career Pathways" } }],
      });
    }

    const context = await AiMentorService.getStudentLiveContext(studentProfileId);
    const aiEngineStatus = AiMentorService.getAiEngineStatus();
    return NextResponse.json({ success: true, context, aiEngineStatus });
  } catch (error: any) {
    console.error("[GET /api/student/mentor/context] Error:", error);
    return NextResponse.json({ error: "Failed to retrieve student context" }, { status: 500 });
  }
}
