// ==============================================================================
// KAABIL (काबिल) — Smart Student Intervention System
// Transparent rule-based academic support, early warnings, and faculty review.
// Compliant with DPDP Act 2023. Never labels students as failures or infers mental health.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import {
  StudentInterventionRecord,
  InterventionTrigger,
  InterventionSeverity,
  InterventionStatus,
} from "@/types/institution";

export class InterventionService {
  /**
   * Scans an institution's enrolled student roster and automatically identifies students
   * who could benefit from educational interventions and faculty guidance.
   */
  public static async scanCohortForInterventions(
    institutionId: string
  ): Promise<StudentInterventionRecord[]> {
    const students = devStore.getStudentEnrollments(institutionId);
    const existingInterventions = devStore.getInterventions(institutionId);

    const activeInterventionKeys = new Set(
      existingInterventions
        .filter((i) => i.status !== "RESOLVED" && i.status !== "DISMISSED")
        .map((i) => `${i.studentEnrollmentId}:${i.triggerReason}`)
    );

    const newInterventions: StudentInterventionRecord[] = [];
    const now = new Date().toISOString();
    const reviewDate = new Date(Date.now() + 14 * 86400000)
      .toISOString()
      .split("T")[0]; // 14 days review SLA

    for (const stu of students) {
      if (stu.status !== "ACTIVE") continue;

      // Rule 1: Incomplete Onboarding
      if (!stu.onboardingCompleted) {
        const key = `${stu.id}:INCOMPLETE_ONBOARDING`;
        if (!activeInterventionKeys.has(key)) {
          const rec: StudentInterventionRecord = {
            id: `intv-${crypto.randomUUID()}`,
            institutionId,
            studentEnrollmentId: stu.id,
            studentProfileId: stu.studentProfileId,
            studentName: stu.studentName,
            studentEmail: stu.studentEmail,
            rollNumber: stu.rollNumber,
            stream: stu.stream,
            departmentName: stu.departmentName,
            triggerReason: "INCOMPLETE_ONBOARDING",
            severity: "MEDIUM",
            status: "NEW",
            evidenceSummary:
              "Student has been enrolled but has not finished the multi-stream career onboarding profile setup.",
            suggestedAction:
              "Academic counselor to reach out and guide student through initial stream and interest discovery onboarding.",
            reviewDate,
            createdAt: now,
            updatedAt: now,
          };
          devStore.saveIntervention(rec);
          newInterventions.push(rec);
          activeInterventionKeys.add(key);
        }
      }

      // Rule 2: No Objective Assessment Attempts
      if (stu.assessmentsCompletedCount === 0 && stu.onboardingCompleted) {
        const key = `${stu.id}:NO_ASSESSMENT_ATTEMPTS`;
        if (!activeInterventionKeys.has(key)) {
          const rec: StudentInterventionRecord = {
            id: `intv-${crypto.randomUUID()}`,
            institutionId,
            studentEnrollmentId: stu.id,
            studentProfileId: stu.studentProfileId,
            studentName: stu.studentName,
            studentEmail: stu.studentEmail,
            rollNumber: stu.rollNumber,
            stream: stu.stream,
            departmentName: stu.departmentName,
            triggerReason: "NO_ASSESSMENT_ATTEMPTS",
            severity: "HIGH",
            status: "NEW",
            evidenceSummary:
              "Student has not completed any objective skill assessments to date; skill competency relies purely on unverified self-reporting.",
            suggestedAction:
              "Assign core stream diagnostic assessment to establish baseline verified skill evidence.",
            reviewDate,
            createdAt: now,
            updatedAt: now,
          };
          devStore.saveIntervention(rec);
          newInterventions.push(rec);
          activeInterventionKeys.add(key);
        }
      }

      // Rule 3: Low Career Readiness Score (CRI < 45)
      if (
        stu.readinessIndex !== null &&
        stu.readinessIndex !== undefined &&
        stu.readinessIndex < 45
      ) {
        const key = `${stu.id}:LOW_READINESS_SCORE`;
        if (!activeInterventionKeys.has(key)) {
          const rec: StudentInterventionRecord = {
            id: `intv-${crypto.randomUUID()}`,
            institutionId,
            studentEnrollmentId: stu.id,
            studentProfileId: stu.studentProfileId,
            studentName: stu.studentName,
            studentEmail: stu.studentEmail,
            rollNumber: stu.rollNumber,
            stream: stu.stream,
            departmentName: stu.departmentName,
            triggerReason: "LOW_READINESS_SCORE",
            severity: "URGENT",
            status: "NEW",
            evidenceSummary: `Student's Career Readiness Index is currently ${stu.readinessIndex}/100, indicating major developmental gaps across technical or domain preparation dimensions.`,
            suggestedAction:
              "Department HOD/Mentor to review adaptive roadmap and schedule mandatory skill enhancement workshops.",
            reviewDate,
            createdAt: now,
            updatedAt: now,
          };
          devStore.saveIntervention(rec);
          newInterventions.push(rec);
          activeInterventionKeys.add(key);
        }
      }

      // Rule 4: Critical Skill Gap (< 2 verified skills)
      if (stu.verifiedSkillsCount < 2 && stu.assessmentsCompletedCount > 0) {
        const key = `${stu.id}:CRITICAL_SKILL_GAP`;
        if (!activeInterventionKeys.has(key)) {
          const rec: StudentInterventionRecord = {
            id: `intv-${crypto.randomUUID()}`,
            institutionId,
            studentEnrollmentId: stu.id,
            studentProfileId: stu.studentProfileId,
            studentName: stu.studentName,
            studentEmail: stu.studentEmail,
            rollNumber: stu.rollNumber,
            stream: stu.stream,
            departmentName: stu.departmentName,
            triggerReason: "CRITICAL_SKILL_GAP",
            severity: "HIGH",
            status: "NEW",
            evidenceSummary:
              "Student has attempted assessments but holds fewer than 2 passing verified skill credentials against target career requirements.",
            suggestedAction:
              "Encourage re-taking foundational diagnostic assessments and enrolling in remedial skill labs.",
            reviewDate,
            createdAt: now,
            updatedAt: now,
          };
          devStore.saveIntervention(rec);
          newInterventions.push(rec);
          activeInterventionKeys.add(key);
        }
      }
    }

    return devStore.getInterventions(institutionId);
  }

  /**
   * Retrieves interventions with optional filtering by status, severity, and stream.
   */
  public static getInterventions(
    institutionId: string,
    filters?: {
      status?: string;
      severity?: string;
      stream?: string;
      search?: string;
    }
  ): StudentInterventionRecord[] {
    let list: StudentInterventionRecord[] =
      devStore.getInterventions(institutionId);

    if (filters?.status && filters.status !== "ALL") {
      list = list.filter((i) => i.status === filters.status);
    }
    if (filters?.severity && filters.severity !== "ALL") {
      list = list.filter((i) => i.severity === filters.severity);
    }
    if (filters?.stream && filters.stream !== "ALL") {
      list = list.filter((i) => i.stream === filters.stream);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.studentName.toLowerCase().includes(q) ||
          i.studentEmail.toLowerCase().includes(q) ||
          (i.rollNumber && i.rollNumber.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * Updates intervention status and records authorized faculty review notes.
   */
  public static updateInterventionStatus(params: {
    institutionId: string;
    interventionId: string;
    status: InterventionStatus;
    resolutionNotes?: string;
    assignedToFacultyId?: string;
    assignedToFacultyName?: string;
  }): StudentInterventionRecord | null {
    const item: StudentInterventionRecord | null = devStore.getIntervention(
      params.institutionId,
      params.interventionId
    );
    if (!item) return null;

    item.status = params.status;
    if (params.resolutionNotes) {
      item.resolutionNotes = params.resolutionNotes;
    }
    if (params.assignedToFacultyId) {
      item.assignedToFacultyId = params.assignedToFacultyId;
    }
    if (params.assignedToFacultyName) {
      item.assignedToFacultyName = params.assignedToFacultyName;
    }
    item.updatedAt = new Date().toISOString();

    return devStore.saveIntervention(item);
  }
}
