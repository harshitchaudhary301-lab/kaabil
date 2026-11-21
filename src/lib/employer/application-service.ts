// ==============================================================================
// KAABIL (काबिल) — Applicant Tracking System & Recruitment Pipeline Service
// Student opportunity applications, explainable eligibility, and strict under-18 exclusion.
// Compliant with DPDP Act 2023. Human-in-the-loop review only — zero auto-rejection.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import {
  EmployerJobApplicationRecord,
  ApplicationStage,
  JobOpportunityRecord,
} from "@/types/employer";

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

export class ApplicationService {
  /**
   * Evaluates candidate eligibility against an opportunity with transparent explainability.
   * Strictly blocks minor accounts (<18 or Class 8-10) under the DPDP Act (2023).
   */
  public static evaluateCandidateEligibility(
    opportunity: JobOpportunityRecord,
    studentProfile: any
  ): {
    isEligible: boolean;
    isMinor: boolean;
    reasons: string[];
    missingRequirements: string[];
    matchScore: number;
  } {
    if (!studentProfile) {
      return {
        isEligible: false,
        isMinor: false,
        reasons: ["Student profile not found."],
        missingRequirements: ["Valid student account"],
        matchScore: 0,
      };
    }

    const reasons: string[] = [];
    const missingRequirements: string[] = [];

    // 1. Strict DPDP Act Under-18 Minor Exclusion
    const isMinor =
      studentProfile.isMinor ||
      studentProfile.stage === "CLASS_8" ||
      studentProfile.stage === "CLASS_9" ||
      studentProfile.stage === "CLASS_10" ||
      studentProfile.educationStage === "CLASS_8" ||
      studentProfile.educationStage === "CLASS_9" ||
      studentProfile.educationStage === "CLASS_10";

    if (isMinor) {
      return {
        isEligible: false,
        isMinor: true,
        reasons: [
          "Minor student accounts (Class 8–10 or age <18) are strictly shielded from corporate recruitment discovery and job applications under India's DPDP Act (2023).",
        ],
        missingRequirements: ["Adult Learner Eligibility (Age 18+)"],
        matchScore: 0,
      };
    }

    // 2. Stream Match Check
    const studentStream = studentProfile.currentStream || studentProfile.stream;
    if (opportunity.stream !== "INTERDISCIPLINARY" && studentStream !== opportunity.stream) {
      reasons.push(
        `Disciplinary stream '${studentStream?.replace(/_/g, " ")}' differs from opportunity target stream '${opportunity.stream.replace(/_/g, " ")}'.`
      );
      missingRequirements.push(`Stream prerequisite: ${opportunity.stream.replace(/_/g, " ")}`);
    }

    // 3. Academic Stage Check
    const studentStage = studentProfile.educationStage || studentProfile.stage || "UNDERGRADUATE";
    const studentStageRank = STAGE_HIERARCHY[studentStage] || 0;
    const requiredStageRank = STAGE_HIERARCHY[opportunity.minStage] || 0;

    if (studentStageRank < requiredStageRank) {
      reasons.push(
        `Current academic stage (${studentStage.replace(/_/g, " ")}) does not meet the minimum requirement (${opportunity.minStage.replace(/_/g, " ")}).`
      );
      missingRequirements.push(`Minimum stage: ${opportunity.minStage.replace(/_/g, " ")}`);
    }

    // 4. Required Skills / Competencies Check
    const studentProfileId = studentProfile.id || studentProfile.studentProfileId;
    const evidences = studentProfileId ? devStore.getSkillEvidences(studentProfileId) : [];
    const directVerified = Array.isArray(studentProfile.verifiedSkills)
      ? studentProfile.verifiedSkills.map((s: string) => s.toLowerCase())
      : [];

    const verifiedSkills = new Set([
      ...evidences
        .filter((e) => e.isVerified || e.evidenceType === "PLATFORM_ASSESSED")
        .map((e) => e.skillName.toLowerCase()),
      ...directVerified,
    ]);

    let matchedSkillCount = 0;
    for (const reqSkill of opportunity.requiredSkills) {
      if (verifiedSkills.has(reqSkill.toLowerCase())) {
        matchedSkillCount++;
      } else {
        missingRequirements.push(`Verified competency: ${reqSkill}`);
      }
    }

    if (opportunity.requiredSkills.length > 0 && matchedSkillCount < opportunity.requiredSkills.length) {
      reasons.push(
        `Missing ${opportunity.requiredSkills.length - matchedSkillCount} required verified competencies.`
      );
    }

    // Compute explainable match score (25% stream, 25% stage, 50% skills)
    let score = 0;
    if (studentStream === opportunity.stream) score += 25;
    if (studentStageRank >= requiredStageRank) score += 25;
    if (opportunity.requiredSkills.length > 0) {
      const skillRatio = matchedSkillCount / opportunity.requiredSkills.length;
      score += Math.round(skillRatio * 50);
    } else {
      score += 50;
    }

    const isEligible = missingRequirements.length === 0;

    return {
      isEligible,
      isMinor: false,
      reasons: isEligible
        ? ["Candidate satisfies all stream, academic stage, and verified competency prerequisites."]
        : reasons,
      missingRequirements,
      matchScore: Math.min(100, Math.max(0, score)),
    };
  }

  /**
   * Submits a student job application after verifying adult age and consent.
   */
  public static applyToOpportunity(params: {
    opportunityId: string;
    studentProfile: any;
    coverNote?: string;
    resumeUrl?: string;
  }): EmployerJobApplicationRecord {
    const opp = devStore.getJobOpportunity(params.opportunityId);
    if (!opp) {
      throw new Error("Job opportunity not found.");
    }

    if (opp.status !== "PUBLISHED") {
      throw new Error("This opportunity is not currently accepting applications.");
    }

    // Server-side Under-18 Protection Enforcement
    const evalResult = this.evaluateCandidateEligibility(opp, params.studentProfile);
    if (evalResult.isMinor) {
      throw new Error(
        "Application rejected: Minor student accounts are legally shielded from employment recruitment drives under the DPDP Act (2023)."
      );
    }

    const profileId = params.studentProfile.id || params.studentProfile.studentProfileId;

    // Check duplicate applications
    const existingApps = devStore.getJobApplications(opp.organizationId, opp.id);
    const existing = existingApps.find((a: EmployerJobApplicationRecord) => a.studentProfileId === profileId);
    if (existing) {
      if (existing.stage === "WITHDRAWN") {
        // Re-activate application
        existing.stage = "APPLIED";
        existing.updatedAt = new Date().toISOString();
        existing.statusHistory.push({
          stage: "APPLIED",
          updatedBy: params.studentProfile.name || "Student",
          updatedAt: new Date().toISOString(),
          notes: "Application resubmitted by candidate.",
        });
        return devStore.saveJobApplication(existing);
      }
      throw new Error("You have already applied for this opportunity.");
    }

    const id = `app-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const application: EmployerJobApplicationRecord = {
      id,
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      organizationId: opp.organizationId,
      organizationName: opp.organizationName,
      studentProfileId: profileId,
      studentName: params.studentProfile.name || "Student Candidate",
      studentEmail: params.studentProfile.email || "student@kaabil.in",
      studentPhone: params.studentProfile.phone,
      studentStage: params.studentProfile.educationStage || params.studentProfile.stage || "UNDERGRADUATE",
      studentStream: params.studentProfile.currentStream || params.studentProfile.stream || "NON_MEDICAL_PCM",
      isMinor: false,
      readinessIndex: params.studentProfile.readinessIndex || params.studentProfile.careerReadinessIndex || 0,
      verifiedSkills: params.studentProfile.verifiedSkills || [],
      coverNote: params.coverNote,
      resumeUrl: params.resumeUrl,
      matchScore: evalResult.matchScore,
      matchExplanation: {
        streamMatch: params.studentProfile.currentStream === opp.stream,
        stageMatch: true,
        criQualified: (params.studentProfile.readinessIndex || 0) >= 50,
        matchedSkills: opp.requiredSkills.filter((s: string) => !evalResult.missingRequirements.includes(`Verified competency: ${s}`)),
        missingSkills: evalResult.missingRequirements,
      },
      stage: "APPLIED",
      recruiterNotes: "",
      statusHistory: [
        {
          stage: "APPLIED",
          updatedBy: params.studentProfile.name || "Student Candidate",
          updatedAt: now,
          notes: "Application submitted via KAABIL Opportunity Discovery.",
        },
      ],
      appliedAt: now,
      updatedAt: now,
    };

    devStore.saveJobApplication(application);

    // Increment opportunity application counter
    opp.totalApplications = (opp.totalApplications || 0) + 1;
    devStore.saveJobOpportunity(opp);

    return application;
  }

  /**
   * Allows an eligible adult student to withdraw their application.
   */
  public static withdrawApplication(
    applicationId: string,
    studentProfileId: string
  ): EmployerJobApplicationRecord | null {
    const app = devStore.getJobApplication(applicationId);
    if (!app) return null;

    if (app.studentProfileId !== studentProfileId) {
      throw new Error("Unauthorized to withdraw this application.");
    }

    app.stage = "WITHDRAWN";
    app.updatedAt = new Date().toISOString();
    app.statusHistory.push({
      stage: "WITHDRAWN",
      updatedBy: "Candidate",
      updatedAt: new Date().toISOString(),
      notes: "Candidate voluntarily withdrew application.",
    });

    return devStore.saveJobApplication(app);
  }

  /**
   * Retrieves applications for an employer with filters.
   */
  public static getApplications(filters: {
    organizationId: string;
    opportunityId?: string;
    stage?: string;
    stream?: string;
    search?: string;
  }): EmployerJobApplicationRecord[] {
    let list: EmployerJobApplicationRecord[] = devStore.getJobApplications(
      filters.organizationId,
      filters.opportunityId
    );

    if (filters.stage && filters.stage !== "ALL") {
      list = list.filter((a) => a.stage === filters.stage);
    }
    if (filters.stream && filters.stream !== "ALL") {
      list = list.filter((a) => a.studentStream === filters.stream);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.studentName.toLowerCase().includes(q) ||
          a.studentEmail.toLowerCase().includes(q) ||
          a.opportunityTitle.toLowerCase().includes(q)
      );
    }

    return list;
  }

  /**
   * Retrieves a single application by ID.
   */
  public static getApplicationById(id: string): EmployerJobApplicationRecord | null {
    return devStore.getJobApplication(id);
  }

  /**
   * Human Recruiter Action: Updates candidate recruitment stage with notes.
   * Strictly human-in-the-loop — no automatic AI rejections.
   */
  public static updateApplicationStage(params: {
    organizationId?: string;
    applicationId: string;
    stage?: ApplicationStage;
    newStage?: ApplicationStage;
    recruiterName?: string;
    updatedBy?: string;
    recruiterId?: string;
    recruiterNotes?: string;
    interviewSlot?: string;
    offerDetails?: string;
  }): EmployerJobApplicationRecord {
    const app = devStore.getJobApplication(params.applicationId);
    if (!app) {
      throw new Error(`Job application with ID ${params.applicationId} not found.`);
    }

    const targetStage: ApplicationStage = params.stage || params.newStage || app.stage;
    const author = params.recruiterName || params.updatedBy || "Recruiter";
    const prevStage = app.stage;
    app.stage = targetStage;

    if (params.recruiterNotes !== undefined) {
      app.recruiterNotes = params.recruiterNotes;
    }
    if (params.recruiterId) {
      app.assignedRecruiterId = params.recruiterId;
      app.assignedRecruiterName = author;
    }
    if (params.interviewSlot) {
      app.interviewSlot = params.interviewSlot;
    }
    if (params.offerDetails) {
      app.offerDetails = params.offerDetails;
    }

    app.updatedAt = new Date().toISOString();
    app.statusHistory.push({
      stage: targetStage,
      updatedBy: author,
      updatedAt: new Date().toISOString(),
      notes: params.recruiterNotes || `Recruitment stage updated to ${targetStage.replace(/_/g, " ")}.`,
    });

    devStore.saveJobApplication(app);

    // Update opportunity stats counters
    const opp = devStore.getJobOpportunity(app.opportunityId);
    if (opp) {
      if (targetStage === "SHORTLISTED" && prevStage !== "SHORTLISTED") {
        opp.shortlistedCount = (opp.shortlistedCount || 0) + 1;
      } else if (targetStage === "HIRED" && prevStage !== "HIRED") {
        opp.hiredCount = (opp.hiredCount || 0) + 1;
      }
      devStore.saveJobOpportunity(opp);
    }

    return app;
  }

  /**
   * Retrieves Kanban pipeline data grouped by stage for an organization or opportunity.
   */
  public static getPipelineData(
    organizationId: string,
    opportunityId?: string
  ): Record<ApplicationStage, EmployerJobApplicationRecord[]> {
    const apps = devStore.getJobApplications(organizationId, opportunityId);
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

    const result: Record<ApplicationStage, EmployerJobApplicationRecord[]> = {} as any;
    for (const stage of stages) {
      result[stage] = apps.filter((a) => a.stage === stage);
    }

    return result;
  }

  /**
   * Alias for getPipelineData.
   */
  public static getRecruitmentPipeline(
    organizationId: string,
    opportunityId?: string
  ): Record<ApplicationStage, EmployerJobApplicationRecord[]> {
    return this.getPipelineData(organizationId, opportunityId);
  }
}
