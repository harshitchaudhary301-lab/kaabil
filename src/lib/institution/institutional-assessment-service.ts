// ==============================================================================
// KAABIL (काबिल) — Institutional Assessment Scheduling & Management Service
// Scheduling assessments, cohort assignment, and integration with the Student Assessment Engine.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import { InstitutionalAssessmentSchedule } from "@/types/institution";
import { KAABIL_ASSESSMENTS, AssessmentData } from "@/data/assessmentsData";

export class InstitutionalAssessmentService {
  /**
   * Retrieves all available standardized stream assessments.
   */
  public static getAssessmentCatalogue(streamFilter?: string): AssessmentData[] {
    if (streamFilter && streamFilter !== "ALL") {
      return KAABIL_ASSESSMENTS.filter((a: AssessmentData) => a.stream === streamFilter);
    }
    return KAABIL_ASSESSMENTS;
  }

  /**
   * Schedules an institutional assessment for a specific cohort or department.
   */
  public static scheduleAssessment(params: {
    institutionId: string;
    title: string;
    assessmentId: string;
    departmentId?: string;
    batchId?: string;
    scheduledDate: string;
    deadline: string;
  }): InstitutionalAssessmentSchedule {
    const students = devStore.getStudentEnrollments(params.institutionId);
    let assignedCount = students.length;

    if (params.batchId) {
      assignedCount = students.filter((s) => s.batchId === params.batchId).length;
    } else if (params.departmentId) {
      assignedCount = students.filter((s) => s.departmentId === params.departmentId).length;
    }

    const id = `asch-${crypto.randomUUID()}`;
    const schedule: InstitutionalAssessmentSchedule = {
      id,
      institutionId: params.institutionId,
      title: params.title,
      assessmentId: params.assessmentId,
      departmentId: params.departmentId,
      batchId: params.batchId,
      scheduledDate: params.scheduledDate,
      deadline: params.deadline,
      totalAssigned: Math.max(assignedCount, 1),
      totalSubmitted: 0,
      status: "ACTIVE",
    };

    return devStore.saveAssessmentSchedule(schedule);
  }

  /**
   * Retrieves all scheduled assessments for an institution.
   */
  public static getScheduledAssessments(
    institutionId: string
  ): InstitutionalAssessmentSchedule[] {
    return devStore.getAssessmentSchedules(institutionId);
  }
}
