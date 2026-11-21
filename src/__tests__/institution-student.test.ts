import { describe, it, expect, beforeEach } from "vitest";
import { InstitutionStudentService } from "@/lib/institution/student-service";
import { devStore } from "@/lib/dev-store";

describe("KAABIL Student Directory, Enrollment & DPDP Minor Safeguards (Milestone E1.3)", () => {
  const testRunId = `${Date.now().toString(36)}-${Math.floor(Math.random() * 100000)}`;
  const instId = `inst-stu-${testRunId}`;
  const invitationCode = `KBL-${testRunId.toUpperCase()}`;

  beforeEach(() => {
    devStore.saveInstitution({
      id: instId,
      name: `Delhi Public Academy ${testRunId}`,
      slug: `dpa-${testRunId}`,
      orgType: "SCHOOL",
      verificationStatus: "VERIFIED",
      officialEmail: `admin@dpa-${testRunId}.edu`,
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      supportedStreams: ["NON_MEDICAL_PCM", "COMMERCE", "ARTS_HUMANITIES"],
      authorizedPersonName: "Mrs. R. Sen",
      authorizedPersonDesignation: "Principal",
      isVerified: true,
      invitationCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  describe("DPDP Act 2023 Child Safety & Minor Consent Flow", () => {
    it("flags student in CLASS_8 stage as minor with PENDING guardian consent", () => {
      const student = InstitutionStudentService.enrollStudent({
        institutionId: instId,
        studentName: "Ananya Sharma",
        studentEmail: `ananya.${testRunId}@gmail.com`,
        rollNumber: `SEC-8-042`,
        stream: "NON_MEDICAL_PCM",
        stage: "CLASS_8",
      });

      expect(student.id).toBeDefined();
      expect(student.isMinor).toBe(true);
      expect(student.guardianConsent).toBe("PENDING");
      expect(student.status).toBe("ACTIVE");
    });

    it("marks adult undergraduate student with NOT_REQUIRED guardian consent", () => {
      const student = InstitutionStudentService.enrollStudent({
        institutionId: instId,
        studentName: "Vikram Malhotra",
        studentEmail: `vikram.${testRunId}@gmail.com`,
        rollNumber: `BBA-2026-11`,
        stream: "COMMERCE",
        stage: "UNDERGRADUATE",
      });

      expect(student.id).toBeDefined();
      expect(student.isMinor).toBe(false);
      expect(student.guardianConsent).toBe("NOT_REQUIRED");
    });

    it("approves guardian consent for a minor student upon parent/guardian verification", () => {
      const student = InstitutionStudentService.enrollStudent({
        institutionId: instId,
        studentName: "Karan Johar Jr",
        studentEmail: `karan.jr.${testRunId}@gmail.com`,
        rollNumber: `SEC-9-015`,
        stream: "ARTS_HUMANITIES",
        stage: "CLASS_9",
      });

      expect(student.guardianConsent).toBe("PENDING");

      const approved = InstitutionStudentService.approveGuardianConsent(
        instId,
        student.id
      );

      expect(approved?.guardianConsent).toBe("APPROVED");
    });
  });

  describe("Duplicate Prevention & Status Transitions", () => {
    it("prevents enrolling the same student email twice in the same institution", () => {
      InstitutionStudentService.enrollStudent({
        institutionId: instId,
        studentName: "Meera Nair",
        studentEmail: `meera.${testRunId}@gmail.com`,
        stream: "COMMERCE",
        stage: "CLASS_12",
      });

      expect(() => {
        InstitutionStudentService.enrollStudent({
          institutionId: instId,
          studentName: "Meera Nair Duplicate",
          studentEmail: `meera.${testRunId}@gmail.com`,
          stream: "COMMERCE",
          stage: "CLASS_12",
        });
      }).toThrow(/already enrolled/i);
    });

    it("updates student enrollment status to ALUMNI or REVOKED safely", () => {
      const student = InstitutionStudentService.enrollStudent({
        institutionId: instId,
        studentName: "Rajesh Koothrappali",
        studentEmail: `rajesh.${testRunId}@gmail.com`,
        stream: "NON_MEDICAL_PCM",
        stage: "UNDERGRADUATE",
      });

      expect(student.status).toBe("ACTIVE");

      const alumni = InstitutionStudentService.updateEnrollmentStatus(
        instId,
        student.id,
        "ALUMNI"
      );
      expect(alumni?.status).toBe("ALUMNI");

      const revoked = InstitutionStudentService.updateEnrollmentStatus(
        instId,
        student.id,
        "REVOKED"
      );
      expect(revoked?.status).toBe("REVOKED");
    });
  });

  describe("Self-Enrollment via Campus Join Code", () => {
    it("allows registered student profile to self-enroll using campus invitation code", async () => {
      // Seed student profile
      const profId = `prof-self-${testRunId}`;
      devStore.saveProfile({
        id: profId,
        userId: `user-self-${testRunId}`,
        name: "Dev Patel",
        email: `dev.${testRunId}@student.in`,
        currentStream: "COMMERCE",
        educationStage: "UNDERGRADUATE",
        careerReadinessIndex: 78,
        onboardingCompleted: true,
        user: {
          name: "Dev Patel",
          email: `dev.${testRunId}@student.in`,
        },
      } as any);

      const enrolled = await InstitutionStudentService.joinInstitutionByCode(
        profId,
        invitationCode
      );

      expect(enrolled.institutionId).toBe(instId);
      expect(enrolled.studentName).toBe("Dev Patel");
      expect(enrolled.studentEmail).toBe(`dev.${testRunId}@student.in`);
      expect(enrolled.readinessIndex).toBe(78);
    });

    it("rejects invalid invitation codes with clear error", async () => {
      const profId = `prof-err-${testRunId}`;
      devStore.saveProfile({
        id: profId,
        userId: `user-err-${testRunId}`,
        name: "Error Tester",
        email: `err.${testRunId}@test.in`,
      } as any);

      await expect(
        InstitutionStudentService.joinInstitutionByCode(profId, "INVALID-CODE-999")
      ).rejects.toThrow(/invalid institution invitation code/i);
    });
  });

  describe("Student Directory Search & Filter Engine", () => {
    it("filters students by search query, stream, and status", () => {
      InstitutionStudentService.enrollStudent({
        institutionId: instId,
        studentName: "Aditi Rao",
        studentEmail: `aditi.${testRunId}@gmail.com`,
        rollNumber: `COM-2026-99`,
        stream: "COMMERCE",
        stage: "UNDERGRADUATE",
      });

      InstitutionStudentService.enrollStudent({
        institutionId: instId,
        studentName: "Zoya Akhtar",
        studentEmail: `zoya.${testRunId}@gmail.com`,
        rollNumber: `ART-2026-44`,
        stream: "ARTS_HUMANITIES",
        stage: "UNDERGRADUATE",
      });

      // Search by name
      const searchRes = InstitutionStudentService.getStudents(instId, {
        search: "Aditi",
      });
      expect(searchRes.length).toBe(1);
      expect(searchRes[0].studentName).toBe("Aditi Rao");

      // Filter by stream
      const streamRes = InstitutionStudentService.getStudents(instId, {
        stream: "ARTS_HUMANITIES",
      });
      expect(streamRes.some((s) => s.studentName === "Zoya Akhtar")).toBe(true);
      expect(streamRes.some((s) => s.studentName === "Aditi Rao")).toBe(false);
    });
  });
});
