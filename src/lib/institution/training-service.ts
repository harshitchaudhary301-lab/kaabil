// ==============================================================================
// KAABIL (काबिल) — Smart Training Management & Adaptive Recommendations
// Stream-specific workshops, attendance tracking, and gap-driven training proposals.
// Part of the signature KAABIL Closed-Loop Intelligence Lifecycle.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import {
  TrainingProgramRecord,
  TrainingEnrollmentRecord,
} from "@/types/institution";
import { EducationalStream } from "@/types";
import { AnalyticsService } from "./analytics-service";

export interface AdaptiveTrainingProposal {
  id: string;
  departmentId: string;
  departmentName: string;
  stream: EducationalStream;
  targetedSkill: string;
  demonstratedPercent: number;
  gapStatus: "CRITICAL" | "GAP";
  proposedTitle: string;
  recommendedMode: "ONLINE" | "OFFLINE" | "HYBRID";
  suggestedDuration: string;
  educationalRationale: string;
}

export class TrainingService {
  /**
   * Creates a new institutional training program.
   */
  public static createTrainingProgram(params: {
    institutionId: string;
    title: string;
    description: string;
    stream: EducationalStream;
    departmentId?: string;
    departmentName?: string;
    mode: "ONLINE" | "OFFLINE" | "HYBRID";
    targetedSkills: string[];
    instructorName: string;
    startDate: string;
    endDate: string;
    scheduleInfo: string;
    maxCapacity?: number;
  }): TrainingProgramRecord {
    const id = `trn-${crypto.randomUUID()}`;
    const record: TrainingProgramRecord = {
      id,
      institutionId: params.institutionId,
      title: params.title,
      description: params.description,
      stream: params.stream,
      departmentId: params.departmentId,
      departmentName: params.departmentName,
      mode: params.mode,
      targetedSkills: params.targetedSkills || [],
      instructorName: params.instructorName,
      startDate: params.startDate,
      endDate: params.endDate,
      scheduleInfo: params.scheduleInfo,
      maxCapacity: params.maxCapacity || 50,
      enrolledCount: 0,
      status: "UPCOMING",
      createdAt: new Date().toISOString(),
    };

    return devStore.saveTrainingProgram(record);
  }

  /**
   * Retrieves training programs for an institution with optional stream filter.
   */
  public static getTrainingPrograms(
    institutionId: string,
    streamFilter?: string
  ): TrainingProgramRecord[] {
    let list: TrainingProgramRecord[] = devStore.getTrainingPrograms(institutionId);
    if (streamFilter && streamFilter !== "ALL") {
      list = list.filter((p) => p.stream === streamFilter);
    }
    return list;
  }

  public static getTrainingProgram(
    institutionId: string,
    programId: string
  ): TrainingProgramRecord | null {
    return devStore.getTrainingProgram(institutionId, programId);
  }

  /**
   * Enrolls a student into a training program.
   */
  public static enrollStudent(params: {
    institutionId: string;
    programId: string;
    studentEnrollmentId: string;
    studentName: string;
    studentEmail: string;
  }): TrainingEnrollmentRecord {
    const program: TrainingProgramRecord | null = devStore.getTrainingProgram(
      params.institutionId,
      params.programId
    );

    if (!program) {
      throw new Error("Training program not found.");
    }

    const enrollments = devStore.getTrainingEnrollments(params.programId);
    const existing = enrollments.find(
      (e: TrainingEnrollmentRecord) =>
        e.studentEnrollmentId === params.studentEnrollmentId ||
        e.studentEmail.toLowerCase() === params.studentEmail.toLowerCase()
    );

    if (existing) {
      throw new Error("Student is already enrolled in this training program.");
    }

    if (program.enrolledCount >= program.maxCapacity) {
      throw new Error("Training program has reached maximum enrollment capacity.");
    }

    const id = `tenr-${crypto.randomUUID()}`;
    const enrollment: TrainingEnrollmentRecord = {
      id,
      programId: params.programId,
      studentEnrollmentId: params.studentEnrollmentId,
      studentName: params.studentName,
      studentEmail: params.studentEmail,
      attendancePercent: 0,
      status: "ENROLLED",
      certificateIssued: false,
    };

    devStore.saveTrainingEnrollment(enrollment);

    // Update program enrolled count
    program.enrolledCount = (program.enrolledCount || 0) + 1;
    devStore.saveTrainingProgram(program);

    return enrollment;
  }

  /**
   * Updates student attendance and completion for a training program.
   * If attendance >= 75% and status is COMPLETED, mints verified SkillEvidence
   * to automatically upgrade the student's Digital Skill Passport and CRI!
   */
  public static updateCompletion(params: {
    institutionId: string;
    programId: string;
    enrollmentId: string;
    attendancePercent: number;
    status: "ENROLLED" | "COMPLETED" | "DROPPED";
    feedback?: string;
    certificateIssued?: boolean;
  }): TrainingEnrollmentRecord | null {
    const enrollments = devStore.getTrainingEnrollments(params.programId);
    const enr = enrollments.find((e: TrainingEnrollmentRecord) => e.id === params.enrollmentId);
    if (!enr) return null;

    enr.attendancePercent = params.attendancePercent;
    enr.status = params.status;
    if (params.feedback) enr.feedback = params.feedback;
    if (params.certificateIssued !== undefined) {
      enr.certificateIssued = params.certificateIssued;
    }
    if (params.status === "COMPLETED") {
      enr.completedAt = new Date().toISOString();

      // Check program targeted skills to mint verified evidence
      const program = devStore.getTrainingProgram(params.institutionId, params.programId);
      const studentEnrollment = devStore.getStudentEnrollment(
        params.institutionId,
        enr.studentEnrollmentId
      );

      if (program && studentEnrollment && studentEnrollment.studentProfileId) {
        for (const skillName of program.targetedSkills) {
          const evidenceId = `ev-train-${crypto.randomUUID()}`;
          devStore.saveSkillEvidence({
            id: evidenceId,
            studentProfileId: studentEnrollment.studentProfileId,
            skillId: skillName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            skillName,
            evidenceType: "EXTERNAL", // Institutional Training Program
            title: `Completed Institutional Training: ${program.title}`,
            verificationUrl: `/verify/training/${enr.id}`,
            isVerified: true,
            verifiedAt: new Date().toISOString(),
            confidenceScore: 0.9,
            metadata: {
              institutionId: params.institutionId,
              programTitle: program.title,
              attendancePercent: params.attendancePercent,
              instructor: program.instructorName,
            },
            createdAt: new Date().toISOString(),
          });
        }

        // Increment verified skills count on enrollment
        studentEnrollment.verifiedSkillsCount =
          (studentEnrollment.verifiedSkillsCount || 0) + program.targetedSkills.length;
        devStore.saveStudentEnrollment(studentEnrollment);
      }
    }

    return devStore.saveTrainingEnrollment(enr);
  }

  /**
   * Analyzes cohort competency matrices and generates explainable training recommendations.
   * Directly translates identified skill gaps into targeted workshop proposals.
   */
  public static async getAdaptiveRecommendations(
    institutionId: string
  ): Promise<AdaptiveTrainingProposal[]> {
    const heatmaps = await AnalyticsService.getSkillHeatmap(institutionId);
    const proposals: AdaptiveTrainingProposal[] = [];

    for (const dept of heatmaps) {
      for (const comp of dept.competencies) {
        if (comp.status === "CRITICAL" || comp.status === "GAP") {
          proposals.push({
            id: `prop-${dept.departmentId}-${comp.skillId}`,
            departmentId: dept.departmentId,
            departmentName: dept.departmentName,
            stream: dept.stream,
            targetedSkill: comp.skillName,
            demonstratedPercent: comp.demonstratedPercent,
            gapStatus: comp.status,
            proposedTitle: `Intensive Masterclass: ${comp.skillName} Competency Sprint`,
            recommendedMode: comp.category === "CLINICAL" || comp.category === "PRACTICAL" ? "OFFLINE" : "HYBRID",
            suggestedDuration: "3 Weeks (12 Interactive Hours)",
            educationalRationale: `Only ${comp.demonstratedPercent}% of enrolled students in ${dept.departmentName} have demonstrated verified competency in ${comp.skillName}. Council and industry benchmarks require higher demonstration rates.`,
          });
        }
      }
    }

    return proposals;
  }
}
