import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { InstitutionNotificationService } from "@/lib/institution/notification-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = InstitutionNotificationService.getNotifications(
      instId,
      unreadOnly
    );
    const unreadCount = InstitutionNotificationService.getUnreadCount(instId);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    const { action, notificationId } = body;

    if (action === "MARK_ALL_READ") {
      InstitutionNotificationService.markAllAsRead(instId);
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (action === "MARK_READ" && notificationId) {
      const updated = InstitutionNotificationService.markAsRead(instId, notificationId);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Notification not found." },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, notification: updated });
    }

    return NextResponse.json(
      { success: false, error: "Valid action ('MARK_READ' or 'MARK_ALL_READ') is required." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process notification update" },
      { status: 500 }
    );
  }
}
