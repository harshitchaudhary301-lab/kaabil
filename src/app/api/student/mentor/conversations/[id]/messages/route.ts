import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { AiMentorService } from "@/lib/mentor/ai-mentor-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const conversation = await AiMentorService.getConversation(params.id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, messages: conversation.messages || [] });
  } catch (error: any) {
    console.error("[GET /api/student/mentor/conversations/[id]/messages] Error:", error);
    return NextResponse.json({ error: "Failed to retrieve messages" }, { status: 500 });
  }
}

function resolveStudentProfileId(user: any): string {
  if (user?.studentProfile?.id) return user.studentProfile.id;
  const devProf = devStore.getProfileByUserId(user.id);
  if (devProf) return devProf.id;
  const byEmail = devStore.getProfileByEmail(user.email);
  if (byEmail) return byEmail.id;
  return "prof-" + user.id;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let studentProfileId = resolveStudentProfileId(user);

    const body = await req.json();
    const { content, language } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    // Ensure conversation exists or create on the fly
    let conv = await AiMentorService.getConversation(params.id);
    if (!conv) {
      conv = await AiMentorService.createConversation(studentProfileId, undefined, language || "en");
    }

    const convId = conv.id;

    // Save student message
    const studentMessage = {
      id: `msg-${Date.now()}-u`,
      conversationId: convId,
      sender: "STUDENT",
      content: content.trim(),
      language: language || conv.language || "en",
      createdAt: new Date().toISOString(),
    };
    devStore.addMentorMessage(convId, studentMessage);

    // Generate AI mentor reply
    const mentorReply = await AiMentorService.generateMentorResponse(
      studentProfileId,
      convId,
      content.trim(),
      language || conv.language || "en"
    );

    return NextResponse.json({
      success: true,
      userMessage: studentMessage,
      mentorReply,
    });
  } catch (error: any) {
    console.error("[POST /api/student/mentor/conversations/[id]/messages] Error:", error);
    return NextResponse.json({ error: "Failed to process mentor message" }, { status: 500 });
  }
}
