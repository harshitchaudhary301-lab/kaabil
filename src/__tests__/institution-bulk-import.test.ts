import { describe, it, expect, beforeEach } from "vitest";
import { BulkImportService } from "@/lib/institution/bulk-import-service";
import { InstitutionStudentService } from "@/lib/institution/student-service";
import { devStore } from "@/lib/dev-store";

describe("KAABIL Bulk Student CSV Import & Security Sanitization (Milestone E1.3)", () => {
  const testRunId = Date.now().toString(36);
  const instId = `inst-bulk-${testRunId}`;

  beforeEach(() => {
    devStore.saveInstitution({
      id: instId,
      name: `Delhi Technical Institute ${testRunId}`,
      slug: `dti-bulk-${testRunId}`,
      orgType: "ENGINEERING_COLLEGE",
      verificationStatus: "VERIFIED",
      officialEmail: `admin@dti-${testRunId}.edu`,
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      supportedStreams: ["NON_MEDICAL_PCM", "COMMERCE", "MEDICAL_PCB"],
      authorizedPersonName: "Dean Academic",
      authorizedPersonDesignation: "Dean",
      isVerified: true,
      invitationCode: `DTB-${testRunId.substring(0, 4).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  describe("CSV Template Generation", () => {
    it("generates a valid CSV template with required institutional headers", () => {
      const template = BulkImportService.getCsvTemplate();

      expect(template).toContain("Full Name");
      expect(template).toContain("Email Address");
      expect(template).toContain("Roll Number");
      expect(template).toContain("Stream");
      expect(template).toContain("Education Stage");
    });
  });

  describe("Formula Injection Sanitization (CWE-1236)", () => {
    it("neutralizes malicious formula injection characters with leading apostrophe", () => {
      expect(BulkImportService.sanitizeCell("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
      expect(BulkImportService.sanitizeCell("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");
      expect(BulkImportService.sanitizeCell("-2+3*cmd|' /C calc'!A0")).toBe("'-2+3*cmd|' /C calc'!A0");
      expect(BulkImportService.sanitizeCell("@HYPERLINK('http://evil.com')")).toBe("'@HYPERLINK('http://evil.com')");
      expect(BulkImportService.sanitizeCell("\tTabbedPayload")).toBe("'\tTabbedPayload");
    });

    it("leaves safe regular text untouched", () => {
      expect(BulkImportService.sanitizeCell("Aarav Sharma")).toBe("Aarav Sharma");
      expect(BulkImportService.sanitizeCell("CS-2026-042")).toBe("CS-2026-042");
    });
  });

  describe("CSV Validation & Parsing", () => {
    it("parses valid CSV rows with stream and stage normalization", () => {
      const csv = [
        "Full Name,Email Address,Roll Number,Stream,Education Stage",
        `Rhea Roy,rhea.${testRunId}@dtu.ac.in,CS-01,NON_MEDICAL_PCM,UNDERGRADUATE`,
        `Sameer Khan,sameer.${testRunId}@dtu.ac.in,CS-02,COMMERCE,UNDERGRADUATE`,
      ].join("\n");

      const { validRows, errors } = BulkImportService.parseCsv(csv);

      expect(errors.length).toBe(0);
      expect(validRows.length).toBe(2);
      expect(validRows[0].data.name).toBe("Rhea Roy");
      expect(validRows[0].data.email).toBe(`rhea.${testRunId}@dtu.ac.in`);
      expect(validRows[0].data.stream).toBe("NON_MEDICAL_PCM");
      expect(validRows[1].data.stream).toBe("COMMERCE");
    });

    it("flags duplicate email within the same CSV batch", () => {
      const dupEmail = `dup.${testRunId}@dtu.ac.in`;
      const csv = [
        "Full Name,Email Address,Roll Number,Stream,Education Stage",
        `Student One,${dupEmail},CS-01,NON_MEDICAL_PCM,UNDERGRADUATE`,
        `Student Two,${dupEmail},CS-02,NON_MEDICAL_PCM,UNDERGRADUATE`,
      ].join("\n");

      const { validRows, errors } = BulkImportService.parseCsv(csv);

      expect(validRows.length).toBe(1);
      expect(errors.length).toBe(1);
      expect(errors[0].error).toMatch(/duplicate email/i);
    });

    it("flags invalid email format and missing names", () => {
      const csv = [
        "Full Name,Email Address,Roll Number,Stream,Education Stage",
        `,invalid-email,CS-01,NON_MEDICAL_PCM,UNDERGRADUATE`,
        `A,good.${testRunId}@dtu.ac.in,CS-02,NON_MEDICAL_PCM,UNDERGRADUATE`,
      ].join("\n");

      const { validRows, errors } = BulkImportService.parseCsv(csv);

      expect(errors.length).toBe(2);
      expect(validRows.length).toBe(0);
    });

    it("enforces 500-row batch boundary limit", () => {
      const header = "Full Name,Email Address,Roll Number,Stream,Education Stage";
      const rows = [header];
      for (let i = 1; i <= 505; i++) {
        rows.push(`Student ${i},stu${i}.${testRunId}@dtu.ac.in,CS-${i},NON_MEDICAL_PCM,UNDERGRADUATE`);
      }

      const { errors } = BulkImportService.parseCsv(rows.join("\n"));
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].error).toMatch(/exceeds 500 row limit/i);
    });
  });

  describe("Bulk Import Execution", () => {
    it("executes batch enrollment and creates active student records", async () => {
      const csv = [
        "Full Name,Email Address,Roll Number,Stream,Education Stage",
        `Student Alpha,alpha.${testRunId}@dti.edu,CS-101,NON_MEDICAL_PCM,UNDERGRADUATE`,
        `Student Beta,beta.${testRunId}@dti.edu,CS-102,MEDICAL_PCB,UNDERGRADUATE`,
      ].join("\n");

      const result = await BulkImportService.executeBulkImport({
        institutionId: instId,
        fileName: "batch_enrollment_test.csv",
        csvContent: csv,
      });

      expect(result.totalRows).toBe(2);
      expect(result.successfulCount).toBe(2);
      expect(result.failedCount).toBe(0);

      // Verify enrollments in student directory
      const enrolled = InstitutionStudentService.getStudents(instId);
      expect(enrolled.some((s) => s.studentEmail === `alpha.${testRunId}@dti.edu`)).toBe(true);
      expect(enrolled.some((s) => s.studentEmail === `beta.${testRunId}@dti.edu`)).toBe(true);
    });

    it("skips and reports already-enrolled students on subsequent imports", async () => {
      const csv = [
        "Full Name,Email Address,Roll Number,Stream,Education Stage",
        `Student Gamma,gamma.${testRunId}@dti.edu,CS-103,NON_MEDICAL_PCM,UNDERGRADUATE`,
      ].join("\n");

      // First import
      await BulkImportService.executeBulkImport({
        institutionId: instId,
        fileName: "batch1.csv",
        csvContent: csv,
      });

      // Second import with same email
      const repeatResult = await BulkImportService.executeBulkImport({
        institutionId: instId,
        fileName: "batch2.csv",
        csvContent: csv,
      });

      expect(repeatResult.totalRows).toBe(1);
      expect(repeatResult.successfulCount).toBe(0);
      expect(repeatResult.failedCount).toBe(1);
      expect(repeatResult.errors[0].error).toMatch(/already enrolled/i);
    });
  });
});
