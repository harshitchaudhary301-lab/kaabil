import { describe, it, expect, beforeEach } from "vitest";
import { TrainingService } from "@/lib/institution/training-service";
import { devStore } from "@/lib/dev-store";

describe("KAABIL Smart Training Management & Closed-Loop Evidence Minting (Milestone E2.2)", () => {
  const testRunId = `${Date.now().toString(36)}-${Math.floor(Math.random() * 100000)}`;
  const instId = `inst-tr-${testRunId}`;
  const profileId = `sp-tr-${testRunId}`;

  beforeEach(() => {
    // Setup student enrollment
    devStore.saveStudentEnrollment({
      id: `se-tr-${testRunId}`,
      institutionId: instId,
      studentProfileId: profileId,
      studentName: "Aman Gupta",
      studentEmail: `aman.${testRunId}@gmail.com`,
      rollNumber: "PCM-50",
      stream: "NON_MEDICAL_PCM",
      stage: "UNDERGRADUATE",
      isMinor: false,
      guardianConsent: "NOT_REQUIRED",
      onboardingCompleted: true,
      readinessIndex: 55,
      verifiedSkillsCount: 0,
      assessmentsCompletedCount: 1,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  describe("Training Program Management", () => {
    it("creates a new training workshop program", () => {
      const program = TrainingService.createTrainingProgram({
        institutionId: instId,
        title: "Hands-on Full-Stack Cloud Architecture",
        description: "Intensive 3-week workshop on Docker, Next.js, and PostgreSQL.",
        stream: "NON_MEDICAL_PCM",
        mode: "HYBRID",
        targetedSkills: ["Docker", "PostgreSQL", "Next.js"],
        instructorName: "Er. Vikram Rathore",
        startDate: "2026-11-25",
        endDate: "2026-12-15",
        scheduleInfo: "Mon/Wed/Fri 4:00 PM - 6:00 PM",
      });

      expect(program.id).toBeDefined();
      expect(program.title).toBe("Hands-on Full-Stack Cloud Architecture");
      expect(program.status).toBe("UPCOMING");
      expect(program.enrolledCount).toBe(0);
      expect(program.targetedSkills).toContain("PostgreSQL");
    });

    it("enrolls student into the training program", () => {
      const program = TrainingService.createTrainingProgram({
        institutionId: instId,
        title: "Financial Modeling with Python",
        description: "Comprehensive financial analytics with Python and pandas.",
        stream: "COMMERCE",
        mode: "ONLINE",
        targetedSkills: ["Financial Modeling"],
        instructorName: "Prof. Anjali Roy",
        startDate: "2026-11-25",
        endDate: "2026-12-15",
        scheduleInfo: "Tue/Thu 5:00 PM - 7:00 PM",
      });

      const enrollment = TrainingService.enrollStudent({
        institutionId: instId,
        programId: program.id,
        studentEnrollmentId: `se-tr-${testRunId}`,
        studentName: "Aman Gupta",
        studentEmail: `aman.${testRunId}@gmail.com`,
      });

      expect(enrollment.id).toBeDefined();
      expect(enrollment.studentName).toBe("Aman Gupta");
      expect(enrollment.status).toBe("ENROLLED");
      expect(enrollment.attendancePercent).toBe(0);

      const refreshed = TrainingService.getTrainingPrograms(instId);
      const prog = refreshed.find((p) => p.id === program.id);
      expect(prog?.enrolledCount).toBe(1);
    });
  });

  describe("KAABIL Closed-Loop Evidence Minting on Completion", () => {
    it("mints verified SkillEvidence for student passport when attendance >= 75%", () => {
      const program = TrainingService.createTrainingProgram({
        institutionId: instId,
        title: "Clinical Bioethics & Patient Communication",
        description: "Foundational bioethics standards and patient interaction protocols.",
        stream: "MEDICAL_PCB",
        mode: "HYBRID",
        targetedSkills: ["Clinical Bioethics", "Patient Communication"],
        instructorName: "Dr. Sunita Kapoor",
        startDate: "2026-11-10",
        endDate: "2026-11-20",
        scheduleInfo: "Daily 9:00 AM - 11:00 AM",
      });

      const enrollment = TrainingService.enrollStudent({
        institutionId: instId,
        programId: program.id,
        studentEnrollmentId: `se-tr-${testRunId}`,
        studentName: "Aman Gupta",
        studentEmail: `aman.${testRunId}@gmail.com`,
      });

      // Update completion with 85% attendance
      const completed = TrainingService.updateCompletion({
        institutionId: instId,
        programId: program.id,
        enrollmentId: enrollment.id,
        attendancePercent: 85,
        status: "COMPLETED",
        certificateIssued: true,
      });

      expect(completed).toBeDefined();
      expect(completed?.status).toBe("COMPLETED");

      // Verify SkillEvidence was minted in student passport
      const evidences = devStore.getSkillEvidences(profileId);
      expect(evidences.length).toBeGreaterThan(0);

      const bioethicsEv = evidences.find((e) => e.skillName === "Clinical Bioethics");
      expect(bioethicsEv).toBeDefined();
      expect(bioethicsEv?.isVerified).toBe(true);
    });
  });

  describe("Adaptive Training Proposals", () => {
    it("generates adaptive workshop recommendations derived from identified cohort gaps", async () => {
      // Save department with stream
      devStore.saveDepartment({
        id: `dept-auto-${testRunId}`,
        institutionId: instId,
        name: "Mechanical & Automotive Engineering",
        code: "MECH",
        stream: "NON_MEDICAL_PCM",
        studentCount: 10,
        facultyCount: 3,
        createdAt: new Date().toISOString(),
      });

      const recommendations = await TrainingService.getAdaptiveRecommendations(instId);
      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);

      const rec = recommendations[0];
      expect(rec).toHaveProperty("proposedTitle");
      expect(rec).toHaveProperty("stream");
      expect(rec).toHaveProperty("targetedSkill");
      expect(rec).toHaveProperty("suggestedDuration");
    });
  });
});
