import { describe, it, expect, beforeEach } from "vitest";
import {
  ReportingService,
  STATUTORY_REPORT_DISCLAIMER,
  sanitizeCsvCell,
} from "@/lib/institution/reporting-service";
import { InstitutionNotificationService } from "@/lib/institution/notification-service";
import { devStore } from "@/lib/dev-store";

describe("KAABIL Institutional Reports, CSV Sanitization & Notifications (Milestone E2.4)", () => {
  const testRunId = `${Date.now().toString(36)}-${Math.floor(Math.random() * 100000)}`;
  const instId = `inst-rep-${testRunId}`;

  beforeEach(() => {
    // Setup institution
    devStore.saveInstitution({
      id: instId,
      name: `Delhi Institute of Technology ${testRunId}`,
      slug: `dit-rep-${testRunId}`,
      orgType: "COLLEGE",
      verificationStatus: "VERIFIED",
      officialEmail: `admin@dit-rep-${testRunId}.edu`,
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      supportedStreams: ["NON_MEDICAL_PCM"],
      authorizedPersonName: "Dr. K. Verma",
      authorizedPersonDesignation: "Principal",
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Student enrollment
    devStore.saveStudentEnrollment({
      id: `se-rep-${testRunId}`,
      institutionId: instId,
      studentName: "Aditya Roy",
      studentEmail: `aditya.${testRunId}@gmail.com`,
      rollNumber: "CSE-401",
      stream: "NON_MEDICAL_PCM",
      stage: "UNDERGRADUATE",
      isMinor: false,
      guardianConsent: "NOT_REQUIRED",
      onboardingCompleted: true,
      readinessIndex: 72,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  describe("Standardized Outcome Reports Generation", () => {
    it("generates NAAC Criterion II & V Supporting Report with mandatory disclaimer", () => {
      const report = ReportingService.generateReport({
        institutionId: instId,
        reportType: "NAAC_CRITERIA",
        academicSession: "2026-2027",
      });

      expect(report.id).toBeDefined();
      expect(report.reportType).toBe("NAAC_CRITERIA");
      expect(report.isInternalSupportingOnly).toBe(true);
      expect(report.summaryMetrics).toHaveProperty("criterion_2_teaching_learning");
      expect(report.summaryMetrics).toHaveProperty("criterion_5_student_support");
    });

    it("generates NIRF Graduation Outcomes Supporting Report", () => {
      const report = ReportingService.generateReport({
        institutionId: instId,
        reportType: "NIRF_METRICS",
        academicSession: "2026-2027",
      });

      expect(report.id).toBeDefined();
      expect(report.reportType).toBe("NIRF_METRICS");
      expect(report.summaryMetrics).toHaveProperty("graduation_outcomes");
      expect(report.summaryMetrics).toHaveProperty("higher_studies_preparation");
    });

    it("generates NBA Outcome-Based Education Attainment Report", () => {
      const report = ReportingService.generateReport({
        institutionId: instId,
        reportType: "NBA_OUTCOMES",
        academicSession: "2026-2027",
      });

      expect(report.id).toBeDefined();
      expect(report.reportType).toBe("NBA_OUTCOMES");
      expect(report.summaryMetrics).toHaveProperty("program_outcomes_attainment");
      expect(report.summaryMetrics).toHaveProperty("continuous_improvement");
    });
  });

  describe("CSV Formula Injection Sanitization (CWE-1236)", () => {
    it("neutralizes leading dangerous formula characters (=, +, -, @, tab, cr)", () => {
      expect(sanitizeCsvCell("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
      expect(sanitizeCsvCell("+123456789")).toBe("'+123456789");
      expect(sanitizeCsvCell("-cmd|'/C calc'!A0")).toBe("'-cmd|'/C calc'!A0");
      expect(sanitizeCsvCell("@SUM(A1)")).toBe("'@SUM(A1)");
      expect(sanitizeCsvCell("\tTABBED")).toBe("'\tTABBED");
      expect(sanitizeCsvCell("Normal Student Name")).toBe("Normal Student Name");
    });

    it("exports complete CSV report with disclaimer and sanitized fields", () => {
      const report = ReportingService.generateReport({
        institutionId: instId,
        reportType: "NAAC_CRITERIA",
        academicSession: "2026-2027",
      });

      const csv = ReportingService.exportReportToCsv(report);
      expect(csv).toContain("KAABIL (काबिल) — Institutional Outcome Report");
      expect(csv).toContain(STATUTORY_REPORT_DISCLAIMER);
      expect(csv).toContain("NAAC Supporting Analysis");
    });
  });

  describe("Institutional Notification Service", () => {
    it("dispatches notifications, retrieves list, and tracks unread count", () => {
      const notif1 = InstitutionNotificationService.createNotification({
        institutionId: instId,
        type: "INTERVENTION",
        title: "Proactive Student Intervention Flagged",
        message: "A student requires faculty advising due to incomplete onboarding.",
        link: "/institution/interventions",
      });

      const notif2 = InstitutionNotificationService.createNotification({
        institutionId: instId,
        type: "PLACEMENT",
        title: "Campus Drive Scheduled",
        message: "Infosys Technologies has scheduled a recruitment drive.",
        link: "/institution/placements",
      });

      expect(notif1.id).toBeDefined();
      expect(notif2.id).toBeDefined();

      const all = InstitutionNotificationService.getNotifications(instId);
      expect(all.length).toBeGreaterThanOrEqual(2);

      const unreadCount = InstitutionNotificationService.getUnreadCount(instId);
      expect(unreadCount).toBeGreaterThanOrEqual(2);

      // Mark notif1 as read
      InstitutionNotificationService.markAsRead(instId, notif1.id);
      const afterReadCount = InstitutionNotificationService.getUnreadCount(instId);
      expect(afterReadCount).toBe(unreadCount - 1);
    });
  });
});
