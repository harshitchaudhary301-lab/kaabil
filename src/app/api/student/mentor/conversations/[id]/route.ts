import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
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

    const deleted = await AiMentorService.deleteConversation(params.id);
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    console.error("[DELETE /api/student/mentor/conversations/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
