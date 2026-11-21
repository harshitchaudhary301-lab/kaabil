import { describe, it, expect, beforeEach } from "vitest";
import { devStore } from "@/lib/dev-store";
import { AdminService } from "@/lib/admin/admin-service";

describe("Part G1: Admin Platform Governance & User Directorate", () => {
  beforeEach(() => {
    devStore.reset();
  });

  it("calculates real operational platform metrics across all streams", () => {
    const metrics = AdminService.getPlatformMetrics();

    expect(metrics).toBeDefined();
    expect(metrics.totalUsers).toBeGreaterThanOrEqual(1);
    expect(metrics.activeStudents).toBeGreaterThanOrEqual(0);
    expect(metrics.registeredInstitutions).toBeGreaterThanOrEqual(1);
    expect(metrics.registeredEmployers).toBeGreaterThanOrEqual(1);
    expect(metrics.pendingVerifications.total).toBe(
      metrics.pendingVerifications.institutions + metrics.pendingVerifications.employers
    );
    expect(metrics.assessmentStats.totalAssessments).toBeGreaterThan(0);
    expect(metrics.assessmentStats.passRatePct).toBeGreaterThanOrEqual(0);
    expect(metrics.assessmentStats.passRatePct).toBeLessThanOrEqual(100);
    expect(metrics.aiHealth.status).toBe("HEALTHY");
    expect(metrics.growthMetrics.studentGrowthPct).toBeGreaterThan(0);
  });

  it("filters users by role, account status, and search query", () => {
    const allUsers = AdminService.getUsers();
    expect(allUsers.length).toBeGreaterThan(0);

    const students = AdminService.getUsers({ role: "STUDENT" });
    expect(students.every((u) => u.role === "STUDENT")).toBe(true);

    const activeUsers = AdminService.getUsers({ status: "ACTIVE" });
    expect(activeUsers.every((u) => u.status === "ACTIVE")).toBe(true);

    const searchResults = AdminService.getUsers({ search: "Aryan" });
    expect(searchResults.some((u) => u.name.includes("Aryan"))).toBe(true);
  });

  it("suspends a user account with required reason and records audit trail", () => {
    const updated = AdminService.updateUserStatus({
      adminId: "admin-super-01",
      adminName: "Dr. Vikramaditya Sen",
      targetEmailOrId: "demo.student@kaabil.in",
      status: "SUSPENDED",
      reason: "Suspicious concurrent login telemetry review.",
    });

    expect(updated.status).toBe("SUSPENDED");
    expect(updated.suspensionReason).toContain("Suspicious concurrent login");

    // Check audit trail
    const auditLogs = AdminService.getAuditLogs(10);
    const log = auditLogs.find((l) => l.action === "USER_STATUS_UPDATED_SUSPENDED");
    expect(log).toBeDefined();
    expect(log?.adminName).toBe("Dr. Vikramaditya Sen");
    expect(log?.details).toContain("Suspicious concurrent login");
  });

  it("reactivates a suspended user account", () => {
    // First suspend
    AdminService.updateUserStatus({
      adminId: "admin-super-01",
      adminName: "Dr. Vikramaditya Sen",
      targetEmailOrId: "demo.student@kaabil.in",
      status: "SUSPENDED",
      reason: "Temporary audit hold.",
    });

    // Then reactivate
    const reactivated = AdminService.updateUserStatus({
      adminId: "admin-super-01",
      adminName: "Dr. Vikramaditya Sen",
      targetEmailOrId: "demo.student@kaabil.in",
      status: "ACTIVE",
    });

    expect(reactivated.status).toBe("ACTIVE");
    expect(reactivated.suspensionReason).toBeUndefined();
  });

  it("updates user role adhering to least-privilege administrative audit", () => {
    const updated = AdminService.updateUserRole({
      adminId: "admin-super-01",
      adminName: "Dr. Vikramaditya Sen",
      targetEmailOrId: "demo.student@kaabil.in",
      role: "FACULTY",
    });

    expect(updated.role).toBe("FACULTY");

    const auditLogs = AdminService.getAuditLogs(10);
    const roleLog = auditLogs.find((l) => l.action === "USER_ROLE_UPDATED");
    expect(roleLog).toBeDefined();
    expect(roleLog?.details).toContain("FACULTY");
  });

  it("handles DPDP right to be forgotten account deletion requests", () => {
    const result = devStore.requestAccountDeletion(
      "demo.student@kaabil.in",
      "Student exercised statutory DPDP Act right to be forgotten."
    );

    expect(result.status).toBe("PENDING_DELETION");
    expect(result.deletionRequestedAt).toBeDefined();
  });
});
