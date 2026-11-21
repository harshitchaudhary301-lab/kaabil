// ==============================================================================
// KAABIL (काबिल) — Employer Notification & Recruitment Alert Service
// Event notifications for applications, stage updates, verification, and partnerships.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import { EmployerNotificationRecord } from "@/types/employer";

export class EmployerNotificationService {
  /**
   * Dispatches a new notification to an employer organization.
   */
  public static createNotification(params: {
    organizationId: string;
    userId?: string;
    type: EmployerNotificationRecord["type"];
    title: string;
    message: string;
    link?: string;
  }): EmployerNotificationRecord {
    const notification: EmployerNotificationRecord = {
      id: `enotif-${crypto.randomUUID()}`,
      organizationId: params.organizationId,
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    return devStore.saveEmployerNotification(notification);
  }

  /**
   * Retrieves all notifications for an employer organization.
   */
  public static getNotifications(
    organizationId: string,
    unreadOnly?: boolean
  ): EmployerNotificationRecord[] {
    let list: EmployerNotificationRecord[] = devStore.getEmployerNotifications(organizationId);

    if (unreadOnly) {
      list = list.filter((n) => !n.isRead);
    }

    return list;
  }

  /**
   * Marks a notification as read.
   */
  public static markAsRead(
    organizationId: string,
    notificationId: string
  ): EmployerNotificationRecord | null {
    const list = devStore.getEmployerNotifications(organizationId);
    const item = list.find((n: EmployerNotificationRecord) => n.id === notificationId);
    if (!item) return null;

    item.isRead = true;
    return devStore.saveEmployerNotification(item);
  }

  /**
   * Marks all notifications as read for an organization.
   */
  public static markAllAsRead(organizationId: string): void {
    const list = devStore.getEmployerNotifications(organizationId);
    for (const item of list) {
      if (!item.isRead) {
        item.isRead = true;
        devStore.saveEmployerNotification(item);
      }
    }
  }

  /**
   * Gets unread notification count.
   */
  public static getUnreadCount(organizationId: string): number {
    const list = devStore.getEmployerNotifications(organizationId);
    return list.filter((n: EmployerNotificationRecord) => !n.isRead).length;
  }
}
