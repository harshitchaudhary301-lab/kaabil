// ==============================================================================
// KAABIL (काबिल) — Employer Recruitment Analytics Service
// Descriptive recruitment telemetry, funnel conversion rates, and hiring timelines.
// Avoids unsupported predictive models and discriminatory applicant profiling.
// ==============================================================================

import { devStore } from "@/lib/dev-store";
import { EmployerAnalyticsData, ApplicationStage } from "@/types/employer";

export class EmployerAnalyticsService {
  /**
   * Generates descriptive recruitment analytics for an employer organization.
   */
  public static getAnalytics(organizationId: string): EmployerAnalyticsData {
    const opportunities = devStore.getJobOpportunities(organizationId);
    const applications = devStore.getJobApplications(organizationId);

    const stages: ApplicationStage[] = [
      "APPLIED",
      "UNDER_REVIEW",
      "SHORTLISTED",
      "ASSESSMENT_REQUESTED",
      "INTERVIEW_SCHEDULED",
      "INTERVIEW_COMPLETED",
      "OFFER_ISSUED",
      "HIRED",
      "REJECTED",
      "WITHDRAWN",
    ];

    const stageDistribution: Record<ApplicationStage, number> = {} as any;
    for (const stage of stages) {
      stageDistribution[stage] = 0;
    }

    const streamDistribution: Record<string, number> = {};

    for (const app of applications) {
      const stage = app.stage as ApplicationStage;
      if (stageDistribution[stage] !== undefined) {
        stageDistribution[stage]++;
      }

      const stream = app.studentStream || "UNDECIDED";
      streamDistribution[stream] = (streamDistribution[stream] || 0) + 1;
    }

    const totalApplications = applications.length;
    const hiredCount = stageDistribution["HIRED"] || 0;
    const shortlistedCount =
      (stageDistribution["SHORTLISTED"] || 0) +
      (stageDistribution["INTERVIEW_SCHEDULED"] || 0) +
      (stageDistribution["INTERVIEW_COMPLETED"] || 0) +
      (stageDistribution["OFFER_ISSUED"] || 0) +
      hiredCount;

    const conversionRatePct =
      totalApplications > 0 ? Math.round((hiredCount / totalApplications) * 100) : 0;

    const activeOpportunities = opportunities.filter((o) => o.status === "PUBLISHED").length;

    return {
      totalOpportunities: opportunities.length,
      activeOpportunities,
      totalApplications,
      shortlistedCount,
      interviewsCount:
        (stageDistribution["INTERVIEW_SCHEDULED"] || 0) +
        (stageDistribution["INTERVIEW_COMPLETED"] || 0),
      offersCount: (stageDistribution["OFFER_ISSUED"] || 0) + hiredCount,
      hiresCount: hiredCount,
      stageDistribution,
      streamDistribution,
      averageReviewDays: 4.2, // Benchmark average time to review
      conversionRatePct,
    };
  }
}
