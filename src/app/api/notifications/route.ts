import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const userId = sessionUser?.id || "aryan-sharma-pcm";
    const role = sessionUser?.role || "STUDENT";

    const allNotifications = devStore.getSystemNotifications(userId, role);

    return NextResponse.json({
      success: true,
      notifications: allNotifications,
      unreadCount: allNotifications.filter((n) => !n.read).length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load notifications." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const userId = sessionUser?.id || "aryan-sharma-pcm";

    const body = await req.json();
    const { notificationId, markAllRead } = body;

    const notifs = devStore.getSystemNotifications(userId);

    if (markAllRead) {
      notifs.forEach((n) => {
        n.read = true;
        devStore.saveSystemNotification(n);
      });
    } else if (notificationId) {
      const match = notifs.find((n) => n.id === notificationId);
      if (match) {
        match.read = true;
        devStore.saveSystemNotification(match);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Notifications updated.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update notification." },
      { status: 500 }
    );
  }
}
