import { describe, it, expect, beforeEach } from "vitest";
import { PlacementService } from "@/lib/institution/placement-service";
import { devStore } from "@/lib/dev-store";

describe("KAABIL Campus Placement Management & Explainable Eligibility (Milestone E2.3)", () => {
  const testRunId = `${Date.now().toString(36)}-${Math.floor(Math.random() * 100000)}`;
  const instId = `inst-plc-${testRunId}`;

  beforeEach(() => {
    // Setup institution
    devStore.saveInstitution({
      id: instId,
      name: `Delhi Institute of Technology ${testRunId}`,
      slug: `dit-plc-${testRunId}`,
      orgType: "UNIVERSITY",
      verificationStatus: "VERIFIED",
      officialEmail: `admin@dit-plc-${testRunId}.edu`,
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      supportedStreams: ["NON_MEDICAL_PCM", "COMMERCE", "MEDICAL_PCB"],
      authorizedPersonName: "Prof. S. Rao",
      authorizedPersonDesignation: "Dean Placements",
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 1. Eligible Adult Undergraduate Student
    devStore.saveStudentEnrollment({
      id: `se-adult-${testRunId}`,
      institutionId: instId,
      studentProfileId: `sp-adult-${testRunId}`,
      studentName: "Rohan Khanna",
      studentEmail: `rohan.${testRunId}@gmail.com`,
      rollNumber: "UG-CS-101",
      stream: "NON_MEDICAL_PCM",
      stage: "UNDERGRADUATE",
      isMinor: false,
      guardianConsent: "NOT_REQUIRED",
      onboardingCompleted: true,
      readinessIndex: 75,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Save verified skill for adult student
    devStore.saveSkillEvidence({
      id: `ev-rohan-${testRunId}`,
      studentProfileId: `sp-adult-${testRunId}`,
      skillId: "react",
      skillName: "React",
      stream: "NON_MEDICAL_PCM",
      category: "TECHNICAL_CORE",
      evidenceType: "PLATFORM_ASSESSED",
      title: "Frontend Engineering Assessment",
      issuer: "KAABIL Assessment Engine",
      score: 88,
      isVerified: true,
      createdAt: new Date().toISOString(),
    });

    // 2. Minor Secondary School Student (Class 10)
    devStore.saveStudentEnrollment({
      id: `se-minor-${testRunId}`,
      institutionId: instId,
      studentProfileId: `sp-minor-${testRunId}`,
      studentName: "Priya Sharma",
      studentEmail: `priya.${testRunId}@gmail.com`,
      rollNumber: "SCH-10-05",
      stream: "NON_MEDICAL_PCM",
      stage: "CLASS_10",
      isMinor: true,
      guardianConsent: "ACCEPTED",
      onboardingCompleted: true,
      readinessIndex: 82,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  describe("Drive Creation & Explainable Eligibility", () => {
    it("creates a campus placement drive", () => {
      const drive = PlacementService.createPlacementDrive({
        institutionId: instId,
        companyName: "Infosys Technologies",
        driveTitle: "Systems Engineer Trainee",
        roleType: "FULL_TIME",
        streams: ["NON_MEDICAL_PCM"],
        minStage: "UNDERGRADUATE",
        minCRI: 65,
        requiredSkills: ["React"],
        packageLPA: "6.5",
        driveDate: "2026-12-10",
        deadline: "2026-12-05",
        venueOrLink: "Auditorium Hall A",
      });

      expect(drive.id).toBeDefined();
      expect(drive.status).toBe("SCHEDULED");
      expect(drive.totalApplicants).toBe(0);
      expect(drive.packageLPA).toBe("6.5");
    });

    it("evaluates eligible adult undergraduate student as eligible", () => {
      const drive = PlacementService.createPlacementDrive({
        institutionId: instId,
        companyName: "Tata Consultancy Services",
        driveTitle: "Assistant System Engineer",
        roleType: "FULL_TIME",
        streams: ["NON_MEDICAL_PCM"],
        minStage: "UNDERGRADUATE",
        minCRI: 60,
        requiredSkills: ["React"],
        driveDate: "2026-12-15",
        deadline: "2026-12-10",
        venueOrLink: "Online",
      });

      const evalResult = PlacementService.evaluateEligibility(drive, `se-adult-${testRunId}`);
      expect(evalResult.isEligible).toBe(true);
      expect(evalResult.isMinor).toBe(false);
      expect(evalResult.missingRequirements.length).toBe(0);
    });

    it("STRICT DPDP ACT UNDER-18 SHIELD: blocks minor student from recruitment drive", () => {
      const drive = PlacementService.createPlacementDrive({
        institutionId: instId,
        companyName: "Google Cloud",
        driveTitle: "Cloud Apprenticeship",
        roleType: "APPRENTICESHIP",
        streams: ["NON_MEDICAL_PCM"],
        minStage: "UNDERGRADUATE",
        requiredSkills: [],
        driveDate: "2026-12-20",
        deadline: "2026-12-15",
        venueOrLink: "Online",
      });

      const evalResult = PlacementService.evaluateEligibility(drive, `se-minor-${testRunId}`);
      expect(evalResult.isEligible).toBe(false);
      expect(evalResult.isMinor).toBe(true);
      expect(evalResult.reasons[0]).toContain("DPDP Act (2023)");
      expect(evalResult.missingRequirements).toContain("Adult Learner Eligibility (Age 18+)");
    });
  });

  describe("Application Pipeline & Offer Management", () => {
    it("submits application and prevents duplicate applications", () => {
      const drive = PlacementService.createPlacementDrive({
        institutionId: instId,
        companyName: "Wipro",
        driveTitle: "Project Engineer",
        roleType: "FULL_TIME",
        streams: ["NON_MEDICAL_PCM"],
        minStage: "UNDERGRADUATE",
        requiredSkills: [],
        driveDate: "2026-12-18",
        deadline: "2026-12-12",
        venueOrLink: "Campus Placement Cell",
      });

      // Submit application
      const app = PlacementService.applyToDrive({
        institutionId: instId,
        driveId: drive.id,
        studentEnrollmentId: `se-adult-${testRunId}`,
      });

      expect(app.id).toBeDefined();
      expect(app.status).toBe("APPLIED");

      // Verify drive applicants incremented
      const refreshedDrive = PlacementService.getPlacementDrive(instId, drive.id);
      expect(refreshedDrive?.totalApplicants).toBe(1);

      // Attempt duplicate application
      expect(() =>
        PlacementService.applyToDrive({
          institutionId: instId,
          driveId: drive.id,
          studentEnrollmentId: `se-adult-${testRunId}`,
        })
      ).toThrow("Student has already applied to this placement drive.");
    });

    it("advances application status through shortlisting, interview slot, and offer recording", () => {
      const drive = PlacementService.createPlacementDrive({
        institutionId: instId,
        companyName: "Accenture",
        driveTitle: "Associate Software Engineer",
        roleType: "FULL_TIME",
        streams: ["NON_MEDICAL_PCM"],
        minStage: "UNDERGRADUATE",
        requiredSkills: [],
        driveDate: "2026-12-22",
        deadline: "2026-12-15",
        venueOrLink: "Online",
      });

      const app = PlacementService.applyToDrive({
        institutionId: instId,
        driveId: drive.id,
        studentEnrollmentId: `se-adult-${testRunId}`,
      });

      // 1. Shortlist
      const shortlisted = PlacementService.updateApplicationStatus({
        institutionId: instId,
        driveId: drive.id,
        applicationId: app.id,
        status: "SHORTLISTED",
      });
      expect(shortlisted?.status).toBe("SHORTLISTED");

      // 2. Schedule Interview
      const interviewed = PlacementService.updateApplicationStatus({
        institutionId: instId,
        driveId: drive.id,
        applicationId: app.id,
        status: "INTERVIEW_SCHEDULED",
        interviewSlot: "2026-12-22 10:30 AM IST",
      });
      expect(interviewed?.status).toBe("INTERVIEW_SCHEDULED");
      expect(interviewed?.interviewSlot).toBe("2026-12-22 10:30 AM IST");

      // 3. Record Offer
      const offered = PlacementService.updateApplicationStatus({
        institutionId: instId,
        driveId: drive.id,
        applicationId: app.id,
        status: "OFFERED",
        offerDetails: "CTC: 8.5 LPA, Location: Bengaluru",
      });
      expect(offered?.status).toBe("OFFERED");
      expect(offered?.offerDetails).toContain("8.5 LPA");

      // Verify drive offer counter incremented
      const refreshedDrive = PlacementService.getPlacementDrive(instId, drive.id);
      expect(refreshedDrive?.offeredCount).toBe(1);
    });
  });
});
