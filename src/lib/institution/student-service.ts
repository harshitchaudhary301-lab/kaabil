// ==============================================================================
// KAABIL (काबिल) — Institution Student Lifecycle & Privacy Service
// Multi-tenant student directory, enrollment, and DPDP Act 2023 minor safeguards.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import {
  StudentEnrollmentRecord,
  StudentEnrollmentStatus,
  GuardianConsentStatus,
} from "@/types/institution";
import { EducationalStream, EducationStage } from "@/types";

const MINOR_STAGES = new Set(["CLASS_8", "CLASS_9", "CLASS_10"]);

export class InstitutionStudentService {
  /**
   * Returns filtered, paginated student enrollments for an institution.
   */
  public static getStudents(
    institutionId: string,
    filters?: {
      search?: string;
      departmentId?: string;
      programId?: string;
      batchId?: string;
      stream?: string;
      status?: string;
    }
  ): StudentEnrollmentRecord[] {
    let list = devStore.getStudentEnrollments(institutionId);

    if (filters?.departmentId && filters.departmentId !== "ALL") {
      list = list.filter((s) => s.departmentId === filters.departmentId);
    }
    if (filters?.programId && filters.programId !== "ALL") {
      list = list.filter((s) => s.programId === filters.programId);
    }
    if (filters?.batchId && filters.batchId !== "ALL") {
      list = list.filter((s) => s.batchId === filters.batchId);
    }
    if (filters?.stream && filters.stream !== "ALL") {
      list = list.filter((s) => s.stream === filters.stream);
    }
    if (filters?.status && filters.status !== "ALL") {
      list = list.filter((s) => s.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          s.studentEmail.toLowerCase().includes(q) ||
          (s.rollNumber && s.rollNumber.toLowerCase().includes(q))
      );
    }

    return list;
  }

  public static getEnrolledStudents(
    institutionId: string,
    filters?: {
      search?: string;
      departmentId?: string;
      programId?: string;
      batchId?: string;
      stream?: string;
      status?: string;
    }
  ): StudentEnrollmentRecord[] {
    return this.getStudents(institutionId, filters);
  }

  public static getStudent(
    institutionId: string,
    enrollmentId: string
  ): StudentEnrollmentRecord | null {
    return devStore.getStudentEnrollment(institutionId, enrollmentId);
  }

  /**
   * Enrolls an individual student into an institution cohort.
   * Enforces DPDP Act 2023 minor checks: flags guardianConsent if under 18.
   */
  public static enrollStudent(params: {
    institutionId: string;
    studentProfileId?: string;
    studentName: string;
    studentEmail: string;
    rollNumber?: string;
    departmentId?: string;
    programId?: string;
    batchId?: string;
    stream: EducationalStream;
    stage: EducationStage;
  }): StudentEnrollmentRecord {
    const email = params.studentEmail.toLowerCase().trim();
    const existing = devStore
      .getStudentEnrollments(params.institutionId)
      .find((s) => s.studentEmail.toLowerCase() === email);

    if (existing) {
      throw new Error(`Student with email '${email}' is already enrolled in this institution.`);
    }

    // Check if a registered user exists with this email
    const registeredUser = devStore.getUserByEmail(email);
    let profile = registeredUser
      ? devStore.getProfileByUserId(registeredUser.id)
      : null;

    if (!profile) {
      const store = (devStore as any).loadStore();
      for (const pid in store.profiles || {}) {
        const p = store.profiles[pid];
        if (
          p?.email?.toLowerCase() === email ||
          p?.user?.email?.toLowerCase() === email ||
          p?.id === (params as any).studentProfileId
        ) {
          profile = p;
          break;
        }
      }
    }

    // Determine minor status (DPDP Act 2023)
    const isStageMinor = MINOR_STAGES.has(params.stage);
    const isMinor = registeredUser?.isMinor || profile?.isMinor || isStageMinor;

    const guardianConsent: GuardianConsentStatus = isMinor ? "PENDING" : "NOT_REQUIRED";

    const dept = params.departmentId
      ? devStore.getDepartment(params.institutionId, params.departmentId)
      : null;
    const prog = params.programId
      ? devStore.getProgram(params.institutionId, params.programId)
      : null;
    const batch = params.batchId
      ? devStore.getClassBatch(params.institutionId, params.batchId)
      : null;

    const id = `enr-${crypto.randomUUID()}`;

    const record: StudentEnrollmentRecord = {
      id,
      institutionId: params.institutionId,
      studentProfileId: profile?.id || `ext-profile-${Date.now()}`,
      userId: registeredUser?.id,
      studentName: params.studentName,
      studentEmail: email,
      rollNumber: params.rollNumber,
      departmentId: params.departmentId,
      programId: params.programId,
      batchId: params.batchId,
      departmentName: dept?.name,
      programName: prog?.name,
      batchName: batch?.name,
      stream: params.stream,
      stage: params.stage,
      status: "ACTIVE",
      guardianConsent,
      isMinor,
      enrolledAt: new Date().toISOString(),
      readinessIndex: profile?.careerReadinessIndex || null,
      onboardingCompleted: profile?.onboardingCompleted || false,
      assessmentsCompletedCount: profile?.id
        ? devStore.getAssessmentAttempts(profile.id).filter((a) => a.status === "COMPLETED").length
        : 0,
      verifiedSkillsCount: profile?.id
        ? devStore.getSkillEvidences(profile.id).filter((e) => e.isVerified).length
        : 0,
    };

    // Update batch enrolled count
    if (batch) {
      batch.enrolledCount = (batch.enrolledCount || 0) + 1;
      devStore.saveClassBatch(batch);
    }

    return devStore.saveStudentEnrollment(record);
  }

  /**
   * Approves guardian consent for a minor student (DPDP Act 2023).
   */
  public static approveGuardianConsent(
    institutionId: string,
    enrollmentId: string
  ): StudentEnrollmentRecord | null {
    const enr = devStore.getStudentEnrollment(institutionId, enrollmentId);
    if (!enr) return null;

    enr.guardianConsent = "APPROVED";
    return devStore.saveStudentEnrollment(enr);
  }

  /**
   * Updates student enrollment status (e.g. TRANSFERRED, ALUMNI, REVOKED).
   */
  public static updateEnrollmentStatus(
    institutionId: string,
    enrollmentId: string,
    status: StudentEnrollmentStatus
  ): StudentEnrollmentRecord | null {
    const enr = devStore.getStudentEnrollment(institutionId, enrollmentId);
    if (!enr) return null;

    enr.status = status;
    return devStore.saveStudentEnrollment(enr);
  }

  /**
   * Allows an authenticated student to join an institution using an invitation code.
   */
  public static async joinInstitutionByCode(
    studentProfileId: string,
    invitationCode: string
  ): Promise<StudentEnrollmentRecord> {
    const inst = devStore.getInstitutionByCode(invitationCode);
    if (!inst) {
      throw new Error("Invalid institution invitation code. Please verify with your campus administration.");
    }

    const profile = devStore.getProfile(studentProfileId);
    if (!profile) {
      throw new Error("Student profile not found.");
    }

    // Check if already enrolled
    const existing = devStore
      .getStudentEnrollments(inst.id)
      .find((s) => s.studentProfileId === studentProfileId);

    if (existing) {
      return existing;
    }

    return this.enrollStudent({
      institutionId: inst.id,
      studentName: profile.user?.name || "Student",
      studentEmail: profile.user?.email || "student@kaabil.in",
      stream: profile.currentStream || "NON_MEDICAL_PCM",
      stage: profile.educationStage || "UNDERGRADUATE",
    });
  }
}

export const StudentService = InstitutionStudentService;
