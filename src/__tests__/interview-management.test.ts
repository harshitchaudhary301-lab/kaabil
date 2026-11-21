import { describe, it, expect, beforeEach } from "vitest";
import { InterviewService } from "@/lib/employer/interview-service";
import { devStore } from "@/lib/dev-store";

describe("Interview Management & Structured Rubric Evaluation (Part F2)", () => {
  beforeEach(() => {
    devStore.reset();
  });

  it("schedules an interview and advances application stage to INTERVIEW_SCHEDULED in ATS", () => {
    const opp = devStore.getJobOpportunities("emp-apex-diag")[0];
    const app = devStore.saveJobApplication({
      id: "app-test-intv-01",
      organizationId: "emp-apex-diag",
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      studentProfileId: "sp-aryan-01",
      studentName: "Aryan Sharma",
      studentEmail: "aryan.sharma@example.com",
      stage: "SHORTLISTED",
      criScore: 78,
      statusHistory: [],
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const interview = InterviewService.scheduleInterview({
      organizationId: "emp-apex-diag",
      applicationId: app.id,
      recruiterId: "rec-dr-verma",
      recruiterName: "Dr. Rohit Verma",
      interviewType: "TECHNICAL",
      scheduledDate: "2026-12-05",
      startTime: "14:00",
      durationMinutes: 45,
      venueOrMeetingLink: "https://meet.google.com/kaabil-tech-round",
      notes: "Reviewing clinical pathology and biochemical protocols.",
    });

    expect(interview.id).toBeDefined();
    expect(interview.status).toBe("SCHEDULED");
    expect(interview.recruiterName).toBe("Dr. Rohit Verma");

    // Verify ATS application stage was updated
    const updatedApp = devStore.getJobApplication(app.id);
    expect(updatedApp?.stage).toBe("INTERVIEW_SCHEDULED");
  });

  it("reschedules an interview and updates slot time in ATS", () => {
    const opp = devStore.getJobOpportunities("emp-apex-diag")[0];
    const app = devStore.saveJobApplication({
      id: "app-test-intv-02",
      organizationId: "emp-apex-diag",
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      studentProfileId: "sp-aryan-01",
      studentName: "Aryan Sharma",
      studentEmail: "aryan.sharma@example.com",
      stage: "SHORTLISTED",
      statusHistory: [],
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const interview = InterviewService.scheduleInterview({
      organizationId: "emp-apex-diag",
      applicationId: app.id,
      recruiterId: "rec-dr-verma",
      recruiterName: "Dr. Rohit Verma",
      interviewType: "HR_FIT",
      scheduledDate: "2026-12-06",
      startTime: "10:00",
      venueOrMeetingLink: "https://meet.google.com/kaabil-hr-round",
    });

    const rescheduled = InterviewService.rescheduleInterview({
      interviewId: interview.id,
      organizationId: "emp-apex-diag",
      newDate: "2026-12-08",
      newTime: "15:00",
      reason: "Candidate clinical shift conflict",
    });

    expect(rescheduled.status).toBe("RESCHEDULED");
    expect(rescheduled.scheduledDate).toBe("2026-12-08");
    expect(rescheduled.startTime).toBe("15:00");
  });

  it("cancels an interview with cancellation reason", () => {
    const opp = devStore.getJobOpportunities("emp-apex-diag")[0];
    const app = devStore.saveJobApplication({
      id: "app-test-intv-03",
      organizationId: "emp-apex-diag",
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      studentProfileId: "sp-aryan-01",
      studentName: "Aryan Sharma",
      studentEmail: "aryan.sharma@example.com",
      stage: "SHORTLISTED",
      statusHistory: [],
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const interview = InterviewService.scheduleInterview({
      organizationId: "emp-apex-diag",
      applicationId: app.id,
      recruiterId: "rec-dr-verma",
      recruiterName: "Dr. Rohit Verma",
      interviewType: "CASE_STUDY",
      scheduledDate: "2026-12-10",
      startTime: "11:00",
      venueOrMeetingLink: "https://meet.google.com/kaabil-case-round",
    });

    const cancelled = InterviewService.cancelInterview({
      interviewId: interview.id,
      organizationId: "emp-apex-diag",
      cancellationReason: "Candidate position already filled",
    });

    expect(cancelled.status).toBe("CANCELLED");
    expect(cancelled.cancellationReason).toBe("Candidate position already filled");
  });

  it("enforces 1–5 rubric scoring bounds and updates ATS stage to INTERVIEW_COMPLETED", () => {
    const opp = devStore.getJobOpportunities("emp-apex-diag")[0];
    const app = devStore.saveJobApplication({
      id: "app-test-intv-04",
      organizationId: "emp-apex-diag",
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      studentProfileId: "sp-aryan-01",
      studentName: "Aryan Sharma",
      studentEmail: "aryan.sharma@example.com",
      stage: "SHORTLISTED",
      statusHistory: [],
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const interview = InterviewService.scheduleInterview({
      organizationId: "emp-apex-diag",
      applicationId: app.id,
      recruiterId: "rec-dr-verma",
      recruiterName: "Dr. Rohit Verma",
      interviewType: "TECHNICAL",
      scheduledDate: "2026-12-12",
      startTime: "16:00",
      venueOrMeetingLink: "https://meet.google.com/kaabil-tech-round",
    });

    // 1. Rejects invalid rubric scores out of bounds (< 1 or > 5)
    expect(() => {
      InterviewService.submitInterviewFeedback({
        interviewId: interview.id,
        organizationId: "emp-apex-diag",
        rubricScores: {
          technicalCompetency: 6, // Invalid (>5)
          domainKnowledge: 4,
          problemSolving: 5,
          communication: 4,
        },
        recommendation: "STRONG_YES",
        feedbackNotes: "Outstanding case analysis",
      });
    }).toThrow(/between 1 and 5/i);

    // 2. Accepts valid rubric scores
    const completed = InterviewService.submitInterviewFeedback({
      interviewId: interview.id,
      organizationId: "emp-apex-diag",
      rubricScores: {
        technicalCompetency: 5,
        domainKnowledge: 4,
        problemSolving: 5,
        communication: 4,
      },
      recommendation: "STRONG_YES",
      feedbackNotes: "Candidate demonstrated exceptional diagnostic reasoning under pressure.",
    });

    expect(completed.status).toBe("COMPLETED");
    expect(completed.recommendation).toBe("STRONG_YES");

    // 3. Verifies application was updated in ATS to INTERVIEW_COMPLETED
    const updatedApp = devStore.getJobApplication(app.id);
    expect(updatedApp?.stage).toBe("INTERVIEW_COMPLETED");
  });
});
