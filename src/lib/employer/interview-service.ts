// ==============================================================================
// KAABIL (काबिल) — Interview Management & Structured Evaluation Service
// Interview scheduling, recruiter assignments, structured rubric scoring, and status sync.
// Connected directly to Applicant Tracking System (ATS).
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import { ApplicationService } from "@/lib/employer/application-service";
import {
  InterviewRecord,
  InterviewType,
  InterviewStatus,
} from "@/types/employer";

export class InterviewService {
  /**
   * Schedules a new interview for a candidate application.
   */
  public static scheduleInterview(params: {
    organizationId: string;
    applicationId: string;
    recruiterId: string;
    recruiterName: string;
    interviewType: InterviewType;
    scheduledDate: string;
    startTime: string;
    durationMinutes?: number;
    venueOrMeetingLink: string;
    notes?: string;
  }): InterviewRecord {
    const org = devStore.getEmployerOrganization(params.organizationId);
    if (!org) {
      throw new Error("Employer organization not found.");
    }

    const app = devStore.getJobApplication(params.applicationId);
    if (!app || app.organizationId !== params.organizationId) {
      throw new Error("Candidate application not found for this organization.");
    }

    const id = `intv-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const interview: InterviewRecord = {
      id,
      organizationId: params.organizationId,
      applicationId: app.id,
      candidateName: app.studentName,
      candidateEmail: app.studentEmail,
      opportunityTitle: app.opportunityTitle,
      recruiterId: params.recruiterId,
      recruiterName: params.recruiterName,
      interviewType: params.interviewType,
      scheduledDate: params.scheduledDate,
      startTime: params.startTime,
      durationMinutes: params.durationMinutes || 45,
      venueOrMeetingLink: params.venueOrMeetingLink,
      notes: params.notes,
      status: "SCHEDULED",
      createdAt: now,
      updatedAt: now,
    };

    devStore.saveInterview(interview);

    // Update application stage in ATS
    ApplicationService.updateApplicationStage({
      organizationId: params.organizationId,
      applicationId: app.id,
      stage: "INTERVIEW_SCHEDULED",
      recruiterName: params.recruiterName,
      recruiterId: params.recruiterId,
      interviewSlot: `${params.scheduledDate} ${params.startTime} (${params.venueOrMeetingLink})`,
      recruiterNotes: `Interview scheduled: ${params.interviewType.replace(/_/g, " ")} on ${params.scheduledDate} at ${params.startTime}.`,
    });

    return interview;
  }

  /**
   * Retrieves interviews for an organization or specific application.
   */
  public static getInterviews(params: {
    organizationId: string;
    applicationId?: string;
    status?: string;
  }): InterviewRecord[] {
    let list = devStore.getInterviews(params.organizationId, params.applicationId);
    if (params.status && params.status !== "ALL") {
      list = list.filter((i: InterviewRecord) => i.status === params.status);
    }
    return list;
  }

  /**
   * Reschedules an interview with candidate notification.
   */
  public static rescheduleInterview(params: {
    interviewId: string;
    organizationId: string;
    newDate: string;
    newTime: string;
    newVenueOrLink?: string;
    reason?: string;
  }): InterviewRecord {
    const interview = devStore.getInterview(params.interviewId);
    if (!interview || interview.organizationId !== params.organizationId) {
      throw new Error("Interview not found.");
    }

    interview.scheduledDate = params.newDate;
    interview.startTime = params.newTime;
    if (params.newVenueOrLink) {
      interview.venueOrMeetingLink = params.newVenueOrLink;
    }
    interview.status = "RESCHEDULED";
    interview.notes = params.reason
      ? `${interview.notes || ""}\nRescheduled: ${params.reason}`
      : interview.notes;
    interview.updatedAt = new Date().toISOString();

    devStore.saveInterview(interview);

    // Update application slot
    const app = devStore.getJobApplication(interview.applicationId);
    if (app) {
      ApplicationService.updateApplicationStage({
        organizationId: params.organizationId,
        applicationId: app.id,
        stage: "INTERVIEW_SCHEDULED",
        recruiterName: interview.recruiterName,
        interviewSlot: `${params.newDate} ${params.newTime} (${interview.venueOrMeetingLink})`,
        recruiterNotes: `Interview rescheduled to ${params.newDate} at ${params.newTime}. Reason: ${params.reason || "Slot update"}`,
      });
    }

    return interview;
  }

  /**
   * Cancels a scheduled interview.
   */
  public static cancelInterview(params: {
    interviewId: string;
    organizationId: string;
    cancellationReason: string;
  }): InterviewRecord {
    const interview = devStore.getInterview(params.interviewId);
    if (!interview || interview.organizationId !== params.organizationId) {
      throw new Error("Interview not found.");
    }

    interview.status = "CANCELLED";
    interview.cancellationReason = params.cancellationReason;
    interview.updatedAt = new Date().toISOString();

    devStore.saveInterview(interview);
    return interview;
  }

  /**
   * Submits structured competency feedback with rubric scores and hiring recommendation.
   * Completes the interview.
   */
  public static submitInterviewFeedback(params: {
    interviewId: string;
    organizationId: string;
    rubricScores: {
      technicalCompetency: number; // 1 to 5
      domainKnowledge: number;
      problemSolving: number;
      communication: number;
    };
    recommendation: "STRONG_YES" | "YES" | "NEUTRAL" | "NO";
    feedbackNotes: string;
  }): InterviewRecord {
    const interview = devStore.getInterview(params.interviewId);
    if (!interview || interview.organizationId !== params.organizationId) {
      throw new Error("Interview not found.");
    }

    // Validate 1-5 rubric scoring bounds
    const scores = params.rubricScores;
    for (const [key, val] of Object.entries(scores)) {
      if (val < 1 || val > 5) {
        throw new Error(`Rubric score for ${key} must be between 1 and 5.`);
      }
    }

    interview.status = "COMPLETED";
    interview.rubricScores = scores;
    interview.recommendation = params.recommendation;
    interview.feedbackNotes = params.feedbackNotes;
    interview.updatedAt = new Date().toISOString();

    devStore.saveInterview(interview);

    // Update application stage in ATS to INTERVIEW_COMPLETED
    const app = devStore.getJobApplication(interview.applicationId);
    if (app) {
      ApplicationService.updateApplicationStage({
        organizationId: params.organizationId,
        applicationId: app.id,
        stage: "INTERVIEW_COMPLETED",
        recruiterName: interview.recruiterName,
        recruiterNotes: `Interview completed with recommendation '${params.recommendation}'. Rubric Average: ${(
          (scores.technicalCompetency + scores.domainKnowledge + scores.problemSolving + scores.communication) /
          4
        ).toFixed(1)}/5. Feedback: ${params.feedbackNotes}`,
      });
    }

    return interview;
  }
}
