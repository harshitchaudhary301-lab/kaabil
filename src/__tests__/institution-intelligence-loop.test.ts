import { describe, it, expect, beforeEach } from "vitest";
import { AnalyticsService } from "@/lib/institution/analytics-service";
import { InterventionService } from "@/lib/institution/intervention-service";
import { TrainingService } from "@/lib/institution/training-service";
import { PlacementService } from "@/lib/institution/placement-service";
import { ReportingService } from "@/lib/institution/reporting-service";
import { devStore } from "@/lib/dev-store";
import { DepartmentSkillHeatmap, StudentInterventionRecord } from "@/types/institution";

describe("KAABIL Complete Closed-Loop Intelligence Lifecycle (Milestone E2.4)", () => {
  const testRunId = `${Date.now().toString(36)}-${Math.floor(Math.random() * 100000)}`;
  const instId = `inst-loop-${testRunId}`;
  const profileId = `sp-loop-${testRunId}`;
  const studentEnrollmentId = `se-loop-${testRunId}`;
  const deptId = `dept-cs-${testRunId}`;

  beforeEach(() => {
    // 1. Institution Setup
    devStore.saveInstitution({
      id: instId,
      name: `Apex University of Engineering & Technology ${testRunId}`,
      slug: `apex-${testRunId}`,
      orgType: "UNIVERSITY",
      verificationStatus: "VERIFIED",
      officialEmail: `admin@apex-${testRunId}.edu`,
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      supportedStreams: ["NON_MEDICAL_PCM"],
      authorizedPersonName: "Prof. R. Natarajan",
      authorizedPersonDesignation: "Vice Chancellor",
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 2. Department Setup
    devStore.saveDepartment({
      id: deptId,
      institutionId: instId,
      name: "Computer Science & Engineering",
      code: "CSE",
      stream: "NON_MEDICAL_PCM",
      studentCount: 1,
      facultyCount: 2,
      createdAt: new Date().toISOString(),
    });

    // 3. Student Setup (Initially with low readiness and unverified skills)
    devStore.saveStudentEnrollment({
      id: studentEnrollmentId,
      institutionId: instId,
      studentProfileId: profileId,
      studentName: "Karthik Raja",
      studentEmail: `karthik.${testRunId}@gmail.com`,
      rollNumber: "CSE-2026-088",
      departmentId: deptId,
      departmentName: "Computer Science & Engineering",
      stream: "NON_MEDICAL_PCM",
      stage: "UNDERGRADUATE",
      isMinor: false,
      guardianConsent: "NOT_REQUIRED",
      onboardingCompleted: true,
      readinessIndex: 35, // Low score triggering intervention
      verifiedSkillsCount: 0,
      assessmentsCompletedCount: 1,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it("executes the full closed loop: Diagnostic Gap -> Cohort Heatmap -> Intervention -> Workshop -> Evidence Minting -> Passport Update -> Placement Offer", async () => {
    // STEP 1: Analytics Heatmap identifies competency status
    const heatmaps = await AnalyticsService.getSkillHeatmap(instId);
    expect(heatmaps.length).toBeGreaterThan(0);
    const cseHeatmap = heatmaps.find((h: DepartmentSkillHeatmap) => h.departmentId === deptId);
    expect(cseHeatmap).toBeDefined();

    // STEP 2: Proactive Cohort Scan flags the student for low CRI
    const interventions = await InterventionService.scanCohortForInterventions(instId);
    expect(interventions.length).toBeGreaterThan(0);
    const studentIntervention = interventions.find(
      (i: StudentInterventionRecord) => i.studentEnrollmentId === studentEnrollmentId
    );
    expect(studentIntervention).toBeDefined();
    expect(["LOW_READINESS_SCORE", "CRITICAL_SKILL_GAP"]).toContain(
      studentIntervention?.triggerReason
    );

    // Faculty reviews intervention and plans intervention
    const reviewed = InterventionService.updateInterventionStatus({
      institutionId: instId,
      interventionId: studentIntervention!.id,
      status: "IN_PROGRESS",
      assignedToFacultyName: "Dr. Natarajan",
      resolutionNotes: "Student assigned to upcoming Cloud Architecture Bootcamp.",
    });
    expect(reviewed?.status).toBe("IN_PROGRESS");

    // STEP 3: Check Placement Eligibility BEFORE training (Should FAIL due to missing skill and low CRI)
    const placementDrive = PlacementService.createPlacementDrive({
      institutionId: instId,
      companyName: "Amazon Web Services",
      driveTitle: "Cloud Support Associate",
      roleType: "FULL_TIME",
      streams: ["NON_MEDICAL_PCM"],
      minStage: "UNDERGRADUATE",
      minCRI: 60,
      requiredSkills: ["Cloud Architecture"],
      packageLPA: "12.0",
      driveDate: "2026-12-25",
      deadline: "2026-12-20",
      venueOrLink: "Bengaluru Tech Campus",
    });

    const preEval = PlacementService.evaluateEligibility(placementDrive, studentEnrollmentId);
    expect(preEval.isEligible).toBe(false);
    expect(preEval.missingRequirements).toContain("Recommended CRI: 60");
    expect(preEval.missingRequirements).toContain("Verified competency: Cloud Architecture");

    // STEP 4: Institution creates and conducts targeted workshop
    const workshop = TrainingService.createTrainingProgram({
      institutionId: instId,
      title: "Cloud Architecture & Microservices Bootcamp",
      description: "Hands-on cloud engineering and architecture workshop.",
      stream: "NON_MEDICAL_PCM",
      departmentId: deptId,
      mode: "HYBRID",
      targetedSkills: ["Cloud Architecture"],
      instructorName: "Er. Ramesh Sundaram",
      startDate: "2026-11-20",
      endDate: "2026-12-05",
      scheduleInfo: "Mon/Wed/Fri 4:00 PM - 6:00 PM",
    });

    const enrollment = TrainingService.enrollStudent({
      institutionId: instId,
      programId: workshop.id,
      studentEnrollmentId,
      studentName: "Karthik Raja",
      studentEmail: `karthik.${testRunId}@gmail.com`,
    });
    expect(enrollment.status).toBe("ENROLLED");

    // STEP 5: Student completes workshop with 90% attendance
    const completion = TrainingService.updateCompletion({
      institutionId: instId,
      programId: workshop.id,
      enrollmentId: enrollment.id,
      attendancePercent: 90,
      status: "COMPLETED",
      certificateIssued: true,
    });
    expect(completion?.status).toBe("COMPLETED");

    // Verify verified SkillEvidence is minted in devStore
    const evidences = devStore.getSkillEvidences(profileId);
    const cloudEvidence = evidences.find((e) => e.skillName === "Cloud Architecture");
    expect(cloudEvidence).toBeDefined();
    expect(cloudEvidence?.isVerified).toBe(true);

    // Refresh student record - verified skills count incremented
    const updatedStudent = devStore.getStudentEnrollment(instId, studentEnrollmentId);
    expect(updatedStudent?.verifiedSkillsCount).toBeGreaterThanOrEqual(1);

    // Update student readiness index post-workshop
    updatedStudent.readinessIndex = 72;
    devStore.saveStudentEnrollment(updatedStudent);

    // Resolve intervention
    const resolvedIntervention = InterventionService.updateInterventionStatus({
      institutionId: instId,
      interventionId: studentIntervention!.id,
      status: "RESOLVED",
      resolutionNotes: "Student successfully verified Cloud Architecture with 90% attendance.",
    });
    expect(resolvedIntervention?.status).toBe("RESOLVED");

    // STEP 6: Re-evaluate Placement Eligibility AFTER Training (Should SUCCEED!)
    const postEval = PlacementService.evaluateEligibility(placementDrive, studentEnrollmentId);
    expect(postEval.isEligible).toBe(true);
    expect(postEval.missingRequirements.length).toBe(0);

    // STEP 7: Student applies, gets shortlisted, interviews, and receives offer
    const application = PlacementService.applyToDrive({
      institutionId: instId,
      driveId: placementDrive.id,
      studentEnrollmentId,
    });
    expect(application.status).toBe("APPLIED");

    // Advance to OFFERED
    const offeredApp = PlacementService.updateApplicationStatus({
      institutionId: instId,
      driveId: placementDrive.id,
      applicationId: application.id,
      status: "OFFERED",
      offerDetails: "12 LPA CTC - AWS Bengaluru",
    });
    expect(offeredApp?.status).toBe("OFFERED");

    // STEP 8: Generate Outcome Report reflecting the new placement offer and verified skills
    const naacReport = ReportingService.generateReport({
      institutionId: instId,
      reportType: "NAAC_CRITERIA",
      academicSession: "2026-2027",
    });

    expect(
      naacReport.summaryMetrics.criterion_5_student_support.verifiedSkillEvidencesAwarded
    ).toBeGreaterThanOrEqual(1);
    expect(
      naacReport.summaryMetrics.criterion_5_student_support.interventionsResolved
    ).toBeGreaterThanOrEqual(1);
  });
});
