// ==============================================================================
// KAABIL (काबिल) — Institutional Notification & Alert Service
// Event notifications for interventions, training, assessments, and placement drives.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import { InstitutionNotificationRecord, InstitutionRole } from "@/types/institution";

export class InstitutionNotificationService {
  /**
   * Dispatches a new notification to institutional staff / faculty.
   */
  public static createNotification(params: {
    institutionId: string;
    userId?: string;
    targetRole?: InstitutionRole | "ALL";
    title: string;
    message: string;
    type: InstitutionNotificationRecord["type"];
    link?: string;
  }): InstitutionNotificationRecord {
    const notification: InstitutionNotificationRecord = {
      id: `notif-${crypto.randomUUID()}`,
      institutionId: params.institutionId,
      userId: params.userId,
      targetRole: params.targetRole || "ALL",
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    return devStore.saveInstitutionNotification(notification);
  }

  /**
   * Retrieves all notifications for an institution.
   */
  public static getNotifications(
    institutionId: string,
    unreadOnly?: boolean
  ): InstitutionNotificationRecord[] {
    let list: InstitutionNotificationRecord[] =
      devStore.getInstitutionNotifications(institutionId);

    if (unreadOnly) {
      list = list.filter((n) => !n.isRead);
    }

    return list;
  }

  /**
   * Marks a specific notification as read.
   */
  public static markAsRead(
    institutionId: string,
    notificationId: string
  ): InstitutionNotificationRecord | null {
    const list = devStore.getInstitutionNotifications(institutionId);
    const item = list.find((n: InstitutionNotificationRecord) => n.id === notificationId);
    if (!item) return null;

    item.isRead = true;
    return devStore.saveInstitutionNotification(item);
  }

  /**
   * Marks all notifications as read for an institution.
   */
  public static markAllAsRead(institutionId: string): void {
    const list = devStore.getInstitutionNotifications(institutionId);
    for (const item of list) {
      if (!item.isRead) {
        item.isRead = true;
        devStore.saveInstitutionNotification(item);
      }
    }
  }

  /**
   * Gets the unread count.
   */
  public static getUnreadCount(institutionId: string): number {
    const list = devStore.getInstitutionNotifications(institutionId);
    return list.filter((n: InstitutionNotificationRecord) => !n.isRead).length;
  }
}
