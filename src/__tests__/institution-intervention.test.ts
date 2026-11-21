import { describe, it, expect, beforeEach } from "vitest";
import { InterventionService } from "@/lib/institution/intervention-service";
import { devStore } from "@/lib/dev-store";
import { StudentInterventionRecord } from "@/types/institution";

describe("KAABIL Proactive Student Intervention System (Milestone E2.2)", () => {
  const testRunId = `${Date.now().toString(36)}-${Math.floor(Math.random() * 100000)}`;
  const instId = `inst-int-${testRunId}`;

  beforeEach(() => {
    // Save institution
    devStore.saveInstitution({
      id: instId,
      name: `Delhi Institute of Technology ${testRunId}`,
      slug: `dit-${testRunId}`,
      orgType: "COLLEGE",
      verificationStatus: "VERIFIED",
      officialEmail: `admin@dit-${testRunId}.edu`,
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      supportedStreams: ["NON_MEDICAL_PCM", "COMMERCE"],
      authorizedPersonName: "Prof. S. Rao",
      authorizedPersonDesignation: "Principal",
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 1. Student with incomplete onboarding
    devStore.saveStudentEnrollment({
      id: `se-onb-${testRunId}`,
      institutionId: instId,
      studentName: "Rahul Verma",
      studentEmail: `rahul.${testRunId}@gmail.com`,
      rollNumber: "PCM-01",
      stream: "NON_MEDICAL_PCM",
      stage: "UNDERGRADUATE",
      isMinor: false,
      guardianConsent: "NOT_REQUIRED",
      onboardingCompleted: false,
      readinessIndex: 0,
      assessmentsCompletedCount: 0,
      verifiedSkillsCount: 0,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 2. Student with low readiness score
    devStore.saveStudentEnrollment({
      id: `se-low-${testRunId}`,
      institutionId: instId,
      studentProfileId: `sp-low-${testRunId}`,
      studentName: "Sneha Nair",
      studentEmail: `sneha.${testRunId}@gmail.com`,
      rollNumber: "COM-02",
      stream: "COMMERCE",
      stage: "UNDERGRADUATE",
      isMinor: false,
      guardianConsent: "NOT_REQUIRED",
      onboardingCompleted: true,
      readinessIndex: 28,
      assessmentsCompletedCount: 1,
      verifiedSkillsCount: 0,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  describe("Proactive Cohort Scan & Trigger Detection", () => {
    it("scans cohort and creates interventions for incomplete onboarding and low CRI", async () => {
      const scanResults = await InterventionService.scanCohortForInterventions(instId);
      expect(scanResults).toBeDefined();
      expect(scanResults.length).toBeGreaterThanOrEqual(2);

      const onbCase = scanResults.find(
        (i: StudentInterventionRecord) => i.triggerReason === "INCOMPLETE_ONBOARDING"
      );
      expect(onbCase).toBeDefined();
      expect(onbCase?.studentName).toBe("Rahul Verma");
      expect(onbCase?.status).toBe("NEW");
      expect(onbCase?.reviewDate).toBeDefined();

      const lowCriCase = scanResults.find(
        (i: StudentInterventionRecord) => i.triggerReason === "LOW_READINESS_SCORE"
      );
      expect(lowCriCase).toBeDefined();
      expect(lowCriCase?.studentName).toBe("Sneha Nair");
      expect(lowCriCase?.severity).toBe("URGENT");
    });

    it("does not create duplicate active intervention for the same student and trigger", async () => {
      // First scan
      await InterventionService.scanCohortForInterventions(instId);
      const initialCount = devStore.getInterventions(instId).length;

      // Second scan
      await InterventionService.scanCohortForInterventions(instId);
      const afterCount = devStore.getInterventions(instId).length;

      expect(afterCount).toBe(initialCount);
    });
  });

  describe("Intervention Lifecycle & Review Management", () => {
    it("updates status to IN_PROGRESS with assigned faculty and human review notes", async () => {
      await InterventionService.scanCohortForInterventions(instId);
      const interventions = InterventionService.getInterventions(instId);
      const target = interventions[0];

      const updated = InterventionService.updateInterventionStatus({
        institutionId: instId,
        interventionId: target.id,
        status: "IN_PROGRESS",
        assignedToFacultyId: "fac-101",
        assignedToFacultyName: "Dr. Sharma",
        resolutionNotes: "Scheduled 1-on-1 diagnostic advising session.",
      });

      expect(updated).toBeDefined();
      expect(updated?.status).toBe("IN_PROGRESS");
      expect(updated?.assignedToFacultyName).toBe("Dr. Sharma");
      expect(updated?.resolutionNotes).toContain("diagnostic advising");
    });

    it("resolves an intervention with non-punitive educational resolution", async () => {
      await InterventionService.scanCohortForInterventions(instId);
      const interventions = InterventionService.getInterventions(instId);
      const target = interventions[0];

      const resolved = InterventionService.updateInterventionStatus({
        institutionId: instId,
        interventionId: target.id,
        status: "RESOLVED",
        resolutionNotes: "Student completed onboarding and foundational career assessment successfully.",
      });

      expect(resolved?.status).toBe("RESOLVED");
    });
  });
});
