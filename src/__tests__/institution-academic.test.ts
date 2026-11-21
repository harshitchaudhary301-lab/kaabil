import { describe, it, expect, beforeEach } from "vitest";
import { AcademicService } from "@/lib/institution/academic-service";
import { devStore } from "@/lib/dev-store";

describe("KAABIL Universal Academic Structure Engine (Milestone E1.2)", () => {
  const testRunId = Date.now().toString(36);
  const instId = `inst-acad-${testRunId}`;

  beforeEach(() => {
    devStore.saveInstitution({
      id: instId,
      name: `Polytechnic & ITI Center ${testRunId}`,
      slug: `poly-iti-${testRunId}`,
      orgType: "POLYTECHNIC",
      verificationStatus: "VERIFIED",
      officialEmail: `admin@poly-${testRunId}.edu`,
      city: "Bhopal",
      state: "Madhya Pradesh",
      country: "India",
      supportedStreams: ["VOCATIONAL_TRADES", "NON_MEDICAL_PCM"],
      authorizedPersonName: "Er. K. Mishra",
      authorizedPersonDesignation: "Principal",
      isVerified: true,
      invitationCode: `PIT-${testRunId.substring(0, 4).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  describe("Academic Department Management", () => {
    it("creates multi-disciplinary departments with unique codes", () => {
      const dept = AcademicService.createDepartment({
        institutionId: instId,
        name: "Department of Electrical & Mechatronics",
        code: `ELEC-${testRunId}`,
        stream: "NON_MEDICAL_PCM",
        headOfDepartmentName: "Prof. S. Nambiar",
        headOfDepartmentEmail: `s.nambiar@poly-${testRunId}.edu`,
      });

      expect(dept.id).toBeDefined();
      expect(dept.institutionId).toBe(instId);
      expect(dept.code).toBe(`ELEC-${testRunId.toUpperCase()}`);
      expect(dept.headOfDepartmentName).toBe("Prof. S. Nambiar");

      const allDepts = AcademicService.getDepartments(instId);
      expect(allDepts.some((d) => d.id === dept.id)).toBe(true);
    });

    it("prevents duplicate department codes within the same institution", () => {
      AcademicService.createDepartment({
        institutionId: instId,
        name: "Dept of Welder Trades",
        code: `WELD-${testRunId}`,
        stream: "VOCATIONAL_TRADES",
      });

      expect(() => {
        AcademicService.createDepartment({
          institutionId: instId,
          name: "Dept of Advanced Welding",
          code: `WELD-${testRunId}`,
          stream: "VOCATIONAL_TRADES",
        });
      }).toThrow(/already exists/i);
    });
  });

  describe("Academic Programs & Degrees", () => {
    it("configures programs across secondary, diploma, and undergraduate levels", () => {
      const dept = AcademicService.createDepartment({
        institutionId: instId,
        name: "Dept of Mechanical Maintenance",
        code: `MECH-${testRunId}`,
        stream: "VOCATIONAL_TRADES",
      });

      const diplomaProg = AcademicService.createProgram({
        institutionId: instId,
        departmentId: dept.id,
        name: "Diploma in Tool & Die Making",
        code: `DIP-TDM-${testRunId}`,
        stage: "DIPLOMA",
        stream: "VOCATIONAL_TRADES",
        durationYears: 3,
        totalSemestersOrYears: 6,
      });

      expect(diplomaProg.id).toBeDefined();
      expect(diplomaProg.stage).toBe("DIPLOMA");
      expect(diplomaProg.durationYears).toBe(3);

      const allProgs = AcademicService.getPrograms(instId);
      expect(allProgs.some((p) => p.id === diplomaProg.id)).toBe(true);
    });
  });

  describe("Academic Sessions & Calendar Management", () => {
    it("creates academic sessions and enforces single active current session", () => {
      const sess2025 = AcademicService.createAcademicSession({
        institutionId: instId,
        name: "2025–2026 Academic Year",
        startDate: "2025-07-01",
        endDate: "2026-06-30",
        isCurrent: true,
      });

      expect(sess2025.isCurrent).toBe(true);

      const sess2026 = AcademicService.createAcademicSession({
        institutionId: instId,
        name: "2026–2027 Academic Year",
        startDate: "2026-07-01",
        endDate: "2027-06-30",
        isCurrent: true, // Setting new current session should deactivate prior
      });

      expect(sess2026.isCurrent).toBe(true);

      const sessions = AcademicService.getAcademicSessions(instId);
      const prev = sessions.find((s) => s.id === sess2025.id);
      expect(prev?.isCurrent).toBe(false);
    });
  });

  describe("Classes & Cohort Batches with Capacity", () => {
    it("creates cohort batches and tracks capacity fill correctly", () => {
      const sess = AcademicService.createAcademicSession({
        institutionId: instId,
        name: `Session ${testRunId}`,
        startDate: "2025-07-01",
        endDate: "2026-06-30",
        isCurrent: true,
      });

      const batch = AcademicService.createClassBatch({
        institutionId: instId,
        sessionId: sess.id,
        name: "Electrician Trade Batch 1",
        semesterOrYearNumber: 1,
        sectionName: "A",
        stream: "VOCATIONAL_TRADES",
        academicYear: "2025-2026",
        maxCapacity: 40,
      });

      expect(batch.id).toBeDefined();
      expect(batch.maxCapacity).toBe(40);
      expect(batch.enrolledCount).toBe(0);

      // Increment capacity
      const updated = AcademicService.updateClassCapacity(batch.id, 5);
      expect(updated?.enrolledCount).toBe(5);
    });
  });
});
