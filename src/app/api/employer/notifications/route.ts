import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { EmployerNotificationService } from "@/lib/employer/notification-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = EmployerNotificationService.getNotifications(orgId, unreadOnly);
    const unreadCount = EmployerNotificationService.getUnreadCount(orgId);

    return NextResponse.json({ success: true, notifications, unreadCount });
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
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const body = await req.json();
    const { action, notificationId } = body;

    if (action === "MARK_ALL_READ") {
      EmployerNotificationService.markAllAsRead(orgId);
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (action === "MARK_READ" && notificationId) {
      const updated = EmployerNotificationService.markAsRead(orgId, notificationId);
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
