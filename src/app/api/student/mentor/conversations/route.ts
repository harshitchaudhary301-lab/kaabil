import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { AiMentorService } from "@/lib/mentor/ai-mentor-service";

export const dynamic = "force-dynamic";

function resolveStudentProfileId(user: any): string {
  if (user?.studentProfile?.id) return user.studentProfile.id;
  const devProf = devStore.getProfileByUserId(user.id);
  if (devProf) return devProf.id;
  const byEmail = devStore.getProfileByEmail(user.email);
  if (byEmail) return byEmail.id;
  return "prof-" + user.id;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let studentProfileId = resolveStudentProfileId(user);

    const conversations = await AiMentorService.getConversations(studentProfileId);
    const aiEngineStatus = AiMentorService.getAiEngineStatus();
    return NextResponse.json({ success: true, conversations, aiEngineStatus });
  } catch (error: any) {
    console.error("[GET /api/student/mentor/conversations] Error:", error);
    return NextResponse.json({ error: "Failed to retrieve conversations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let studentProfileId = resolveStudentProfileId(user);

    const body = await req.json().catch(() => ({}));
    const { initialMessage, language } = body;

    const conversation = await AiMentorService.createConversation(
      studentProfileId,
      initialMessage,
      language || "en"
    );

    return NextResponse.json({ success: true, conversation });
  } catch (error: any) {
    console.error("[POST /api/student/mentor/conversations] Error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
