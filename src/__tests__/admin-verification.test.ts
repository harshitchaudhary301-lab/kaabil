import { describe, it, expect, beforeEach } from "vitest";
import { devStore } from "@/lib/dev-store";
import { AdminService } from "@/lib/admin/admin-service";

describe("Part G1: Trust & Safety Verification Directorate", () => {
  beforeEach(() => {
    devStore.reset();
  });

  it("retrieves verification requests filtered by organization type and status", () => {
    const queue = AdminService.getVerificationQueue();
    expect(queue.length).toBeGreaterThanOrEqual(2);

    const institutionQueue = AdminService.getVerificationQueue({ type: "INSTITUTION" });
    expect(institutionQueue.every((q) => q.organizationType === "INSTITUTION")).toBe(true);

    const employerQueue = AdminService.getVerificationQueue({ type: "EMPLOYER" });
    expect(employerQueue.every((q) => q.organizationType === "EMPLOYER")).toBe(true);
  });

  it("rejects decisions with empty or insufficient reviewer notes", () => {
    const queue = AdminService.getVerificationQueue();
    const reqId = queue[0].id;

    expect(() => {
      AdminService.processVerificationDecision({
        adminId: "admin-super-01",
        adminName: "Dr. Vikramaditya Sen",
        requestId: reqId,
        decision: "APPROVED",
        reviewNotes: "ok", // < 5 chars
      });
    }).toThrow(/review notes are required/i);
  });

  it("approves an institution verification and synchronizes organization status", () => {
    const req = AdminService.getVerificationQueue({ type: "INSTITUTION" })[0];

    const decision = AdminService.processVerificationDecision({
      adminId: "admin-super-01",
      adminName: "Dr. Vikramaditya Sen",
      requestId: req.id,
      decision: "APPROVED",
      reviewNotes: "AISHE Gazette notification verified against Ministry of Education portal.",
    });

    expect(decision.status).toBe("APPROVED");
    expect(decision.reviewedBy).toBe("Dr. Vikramaditya Sen");
    expect(decision.reviewedAt).toBeDefined();

    // Verify synchronization to institution store
    const inst = devStore.getInstitution(req.organizationId);
    if (inst) {
      expect(inst.verificationStatus).toBe("VERIFIED");
    }

    // Verify audit log
    const auditLogs = AdminService.getAuditLogs(10);
    const log = auditLogs.find((l) => l.action === "INSTITUTION_VERIFICATION_APPROVED");
    expect(log).toBeDefined();
    expect(log?.details).toContain("AISHE Gazette notification verified");
  });

  it("rejects an employer verification request with documented reason", () => {
    const req = AdminService.getVerificationQueue({ type: "EMPLOYER" })[0];

    const decision = AdminService.processVerificationDecision({
      adminId: "admin-super-01",
      adminName: "Dr. Vikramaditya Sen",
      requestId: req.id,
      decision: "REJECTED",
      reviewNotes: "CIN number does not reconcile with MCA database.",
    });

    expect(decision.status).toBe("REJECTED");
    expect(decision.reviewNotes).toContain("MCA database");

    // Verify synchronization to employer store
    const emp = devStore.getEmployerOrganization(req.organizationId);
    if (emp) {
      expect(emp.verificationStatus).toBe("REJECTED");
    }
  });

  it("requests additional info without premature approval", () => {
    const req = AdminService.getVerificationQueue()[0];

    const decision = AdminService.processVerificationDecision({
      adminId: "admin-super-01",
      adminName: "Dr. Vikramaditya Sen",
      requestId: req.id,
      decision: "ADDITIONAL_INFO_REQUIRED",
      reviewNotes: "Please upload official letterhead endorsement signed by Vice-Chancellor.",
    });

    expect(decision.status).toBe("ADDITIONAL_INFO_REQUIRED");
    expect(decision.reviewNotes).toContain("Vice-Chancellor");
  });
});
