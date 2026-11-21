import { describe, it, expect, beforeEach } from "vitest";
import { devStore } from "@/lib/dev-store";
import { IndustryDemandService } from "@/lib/analytics/industry-demand-service";

describe("Part G4: Industry Demand Intelligence, Notifications & Search", () => {
  beforeEach(() => {
    devStore.reset();
  });

  it("aggregates multi-stream industry demand intelligence across all 13 streams", () => {
    const insights = IndustryDemandService.getDemandInsights();

    expect(insights.length).toBe(13);

    for (const insight of insights) {
      expect(insight.stream).toBeDefined();
      expect(insight.demandIndex).toBeGreaterThan(0);
      expect(insight.demandIndex).toBeLessThanOrEqual(100);
      expect(insight.topSkillsInDemand.length).toBeGreaterThan(0);
      expect(insight.emergingSkills.length).toBeGreaterThan(0);
      expect(insight.averageEntrySalaryLPA).toBeGreaterThan(0);
      expect(insight.recommendedInterventions.length).toBeGreaterThan(0);
    }
  });

  it("delivers role-aware system notifications and updates read status", () => {
    const studentId = "aryan-sharma-pcm";

    // Add a notification
    devStore.saveSystemNotification({
      id: "notif-test-01",
      userId: studentId,
      recipientRole: "STUDENT",
      title: "New Career Assessment Available",
      message: "Take the Advanced Robotics Control Assessment to boost your CRI.",
      type: "ASSESSMENT",
      read: false,
      timestamp: new Date().toISOString(),
    });

    const notifs = devStore.getSystemNotifications(studentId, "STUDENT");
    expect(notifs.some((n) => n.id === "notif-test-01")).toBe(true);

    const testNotif = notifs.find((n) => n.id === "notif-test-01");
    expect(testNotif?.read).toBe(false);

    // Mark as read
    testNotif!.read = true;
    devStore.saveSystemNotification(testNotif!);

    const updatedNotifs = devStore.getSystemNotifications(studentId);
    const updated = updatedNotifs.find((n) => n.id === "notif-test-01");
    expect(updated?.read).toBe(true);
  });
});
