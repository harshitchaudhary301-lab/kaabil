// ==============================================================================
// KAABIL (काबिल) — Campus Placement Management & Explainable Eligibility Service
// Recruitment drives, student opportunity matching, and strict DPDP under-18 exclusion.
// Universal across tech, healthcare, commerce, legal, and vocational trades.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import {
  PlacementDriveRecord,
  PlacementApplicationRecord,
} from "@/types/institution";
import { EducationalStream, EducationStage } from "@/types";

const STAGE_HIERARCHY: Record<string, number> = {
  CLASS_8: 1,
  CLASS_9: 2,
  CLASS_10: 3,
  CLASS_11: 4,
  CLASS_12: 5,
  DIPLOMA: 6,
  ITI: 6,
  UNDERGRADUATE: 7,
  POSTGRADUATE: 8,
  WORKING_PROFESSIONAL: 9,
};

export class PlacementService {
  /**
   * Creates a new campus placement drive or recruitment event.
   */
  public static createPlacementDrive(params: {
    institutionId: string;
    companyName: string;
    companyLogo?: string;
    driveTitle: string;
    roleType: "FULL_TIME" | "INTERNSHIP" | "APPRENTICESHIP";
    streams: EducationalStream[];
    minStage: EducationStage;
    minCRI?: number;
    requiredSkills: string[];
    packageLPA?: string;
    stipendMonthly?: string;
    driveDate: string;
    deadline: string;
    venueOrLink: string;
    isVerifiedPartner?: boolean;
  }): PlacementDriveRecord {
    const id = `drv-${crypto.randomUUID()}`;
    const drive: PlacementDriveRecord = {
      id,
      institutionId: params.institutionId,
      companyName: params.companyName,
      companyLogo: params.companyLogo,
      driveTitle: params.driveTitle,
      roleType: params.roleType,
      streams: params.streams || ["NON_MEDICAL_PCM"],
      minStage: params.minStage,
      minCRI: params.minCRI,
      requiredSkills: params.requiredSkills || [],
      packageLPA: params.packageLPA,
      stipendMonthly: params.stipendMonthly,
      driveDate: params.driveDate,
      deadline: params.deadline,
      venueOrLink: params.venueOrLink,
      status: "SCHEDULED",
      totalApplicants: 0,
      shortlistedCount: 0,
      offeredCount: 0,
      isVerifiedPartner: params.isVerifiedPartner ?? true,
      createdAt: new Date().toISOString(),
    };

    return devStore.savePlacementDrive(drive);
  }

  /**
   * Retrieves all placement drives for an institution.
   */
  public static getPlacementDrives(
    institutionId: string,
    statusFilter?: string
  ): PlacementDriveRecord[] {
    let list: PlacementDriveRecord[] = devStore.getPlacementDrives(institutionId);
    if (statusFilter && statusFilter !== "ALL") {
      list = list.filter((d) => d.status === statusFilter);
    }
    return list;
  }

  public static getPlacementDrive(
    institutionId: string,
    driveId: string
  ): PlacementDriveRecord | null {
    return devStore.getPlacementDrive(institutionId, driveId);
  }

  /**
   * Explainable Placement Eligibility Engine:
   * Evaluates a student's eligibility transparently against drive criteria.
   * Strict Rule: Minor students (<18 or Class 8-10) are strictly excluded (DPDP Act 2023).
   */
  public static evaluateEligibility(
    drive: PlacementDriveRecord,
    studentEnrollmentId: string
  ): {
    isEligible: boolean;
    isMinor: boolean;
    reasons: string[];
    missingRequirements: string[];
  } {
    const student = devStore.getStudentEnrollment(drive.institutionId, studentEnrollmentId);
    if (!student) {
      return {
        isEligible: false,
        isMinor: false,
        reasons: ["Student enrollment record not found."],
        missingRequirements: ["Valid institutional enrollment"],
      };
    }

    const reasons: string[] = [];
    const missingRequirements: string[] = [];

    // 1. Strict DPDP Act Under-18 Minor Protection
    if (
      student.isMinor ||
      student.stage === "CLASS_8" ||
      student.stage === "CLASS_9" ||
      student.stage === "CLASS_10"
    ) {
      return {
        isEligible: false,
        isMinor: true,
        reasons: [
          "Minor student accounts (Class 8–10 or age <18) are strictly shielded from employer recruitment drives under the DPDP Act (2023).",
        ],
        missingRequirements: ["Adult Learner Eligibility (Age 18+)"],
      };
    }

    // 2. Stream Match Check
    if (!drive.streams.includes(student.stream)) {
      reasons.push(
        `Disciplinary stream '${student.stream.replace(/_/g, " ")}' is not among the targeted streams for this role.`
      );
      missingRequirements.push(
        `Stream requirement: ${drive.streams.map((s) => s.replace(/_/g, " ")).join(", ")}`
      );
    }

    // 3. Stage Level Check
    const studentStageRank = STAGE_HIERARCHY[student.stage] || 0;
    const requiredStageRank = STAGE_HIERARCHY[drive.minStage] || 0;
    if (studentStageRank < requiredStageRank) {
      reasons.push(
        `Current academic stage (${student.stage.replace(/_/g, " ")}) does not meet the minimum prerequisite stage (${drive.minStage.replace(/_/g, " ")}).`
      );
      missingRequirements.push(`Minimum stage: ${drive.minStage.replace(/_/g, " ")}`);
    }

    // 4. Minimum CRI Score Check
    if (drive.minCRI !== undefined && drive.minCRI > 0) {
      const studentCRI = student.readinessIndex || 0;
      if (studentCRI < drive.minCRI) {
        reasons.push(
          `Career Readiness Index (${studentCRI}/100) is below the recommended threshold of ${drive.minCRI}/100.`
        );
        missingRequirements.push(`Recommended CRI: ${drive.minCRI}`);
      }
    }

    // 5. Verified Skills Check
    if (drive.requiredSkills.length > 0 && student.studentProfileId) {
      const evidences = devStore.getSkillEvidences(student.studentProfileId);
      const verifiedSkillNames = new Set(
        evidences
          .filter((e) => e.isVerified || e.evidenceType === "PLATFORM_ASSESSED")
          .map((e) => e.skillName.toLowerCase())
      );

      for (const reqSkill of drive.requiredSkills) {
        if (!verifiedSkillNames.has(reqSkill.toLowerCase())) {
          missingRequirements.push(`Verified competency: ${reqSkill}`);
        }
      }

      if (missingRequirements.some((m) => m.startsWith("Verified competency:"))) {
        reasons.push("One or more required competencies have not been verified via assessments.");
      }
    }

    const isEligible = reasons.length === 0 && missingRequirements.length === 0;

    return {
      isEligible,
      isMinor: false,
      reasons: isEligible
        ? ["Student meets all academic stage, stream, and verified skill prerequisites."]
        : reasons,
      missingRequirements,
    };
  }

  /**
   * Registers a student application to a placement drive after validating eligibility and consent.
   */
  public static applyToDrive(params: {
    institutionId: string;
    driveId: string;
    studentEnrollmentId: string;
  }): PlacementApplicationRecord {
    const drive = devStore.getPlacementDrive(params.institutionId, params.driveId);
    if (!drive) {
      throw new Error("Placement drive not found.");
    }

    const student = devStore.getStudentEnrollment(params.institutionId, params.studentEnrollmentId);
    if (!student) {
      throw new Error("Student enrollment not found.");
    }

    // Enforce eligibility check
    const evalResult = this.evaluateEligibility(drive, params.studentEnrollmentId);
    if (evalResult.isMinor) {
      throw new Error(
        "Application blocked: Minor accounts (<18) cannot participate in employer recruitment drives under the DPDP Act (2023)."
      );
    }

    // Check duplicate application
    const existingApps = devStore.getPlacementApplications(params.driveId);
    const existing = existingApps.find(
      (a: PlacementApplicationRecord) =>
        a.studentEnrollmentId === params.studentEnrollmentId
    );
    if (existing) {
      throw new Error("Student has already applied to this placement drive.");
    }

    const id = `papp-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const application: PlacementApplicationRecord = {
      id,
      driveId: params.driveId,
      institutionId: params.institutionId,
      studentEnrollmentId: params.studentEnrollmentId,
      studentProfileId: student.studentProfileId,
      studentName: student.studentName,
      studentEmail: student.studentEmail,
      stream: student.stream,
      isMinor: false,
      eligibilityCheck: evalResult,
      status: "APPLIED",
      appliedAt: now,
      updatedAt: now,
    };

    devStore.savePlacementApplication(application);

    // Increment drive applicant counter
    drive.totalApplicants = (drive.totalApplicants || 0) + 1;
    devStore.savePlacementDrive(drive);

    return application;
  }

  /**
   * Updates application stage and tracks interview schedules or job offers.
   */
  public static updateApplicationStatus(params: {
    institutionId: string;
    driveId: string;
    applicationId: string;
    status: PlacementApplicationRecord["status"];
    interviewSlot?: string;
    offerDetails?: string;
  }): PlacementApplicationRecord | null {
    const applications = devStore.getPlacementApplications(params.driveId);
    const app = applications.find((a: PlacementApplicationRecord) => a.id === params.applicationId);
    if (!app) return null;

    const prevStatus = app.status;
    app.status = params.status;
    if (params.interviewSlot) app.interviewSlot = params.interviewSlot;
    if (params.offerDetails) app.offerDetails = params.offerDetails;
    app.updatedAt = new Date().toISOString();

    devStore.savePlacementApplication(app);

    // Update drive statistics
    const drive = devStore.getPlacementDrive(params.institutionId, params.driveId);
    if (drive) {
      if (params.status === "SHORTLISTED" && prevStatus !== "SHORTLISTED") {
        drive.shortlistedCount = (drive.shortlistedCount || 0) + 1;
      } else if (params.status === "OFFERED" && prevStatus !== "OFFERED") {
        drive.offeredCount = (drive.offeredCount || 0) + 1;
      }
      devStore.savePlacementDrive(drive);
    }

    return app;
  }

  /**
   * Retrieves applications for a specific drive.
   */
  public static getDriveApplications(driveId: string): PlacementApplicationRecord[] {
    return devStore.getPlacementApplications(driveId);
  }
}
