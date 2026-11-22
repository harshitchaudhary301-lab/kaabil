import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
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

    const studentProfileId = resolveStudentProfileId(user);
    if (conversation.studentProfileId && conversation.studentProfileId !== studentProfileId) {
      return NextResponse.json({ error: "Unauthorized access to conversation" }, { status: 403 });
    }

    return NextResponse.json({ success: true, conversation });
  } catch (error: any) {
    console.error("[GET /api/student/mentor/conversations/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to retrieve conversation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const conversation = await AiMentorService.getConversation(params.id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const studentProfileId = resolveStudentProfileId(user);
    if (conversation.studentProfileId && conversation.studentProfileId !== studentProfileId) {
      return NextResponse.json({ error: "Unauthorized access to conversation" }, { status: 403 });
    }

    const deleted = await AiMentorService.deleteConversation(params.id);
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    console.error("[DELETE /api/student/mentor/conversations/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
