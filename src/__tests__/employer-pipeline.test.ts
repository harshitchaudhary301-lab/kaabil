import { describe, it, expect, beforeEach } from "vitest";
import { ApplicationService } from "@/lib/employer/application-service";
import { OpportunityService } from "@/lib/employer/opportunity-service";
import { devStore } from "@/lib/dev-store";

describe("Recruitment Pipeline (Kanban) Stage Coordination", () => {
  let orgId: string;
  let opp1Id: string;
  let opp2Id: string;

  beforeEach(() => {
    orgId = `emp-fintech-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Verified Commerce / FinTech Employer
    devStore.saveEmployerOrganization({
      id: orgId,
      name: "Bharat FinServ & Analytics Corp",
      slug: "bharat-finserv",
      industry: "Financial Services",
      sector: "Private",
      supportedStreams: ["COMMERCE", "NON_MEDICAL_PCM"],
      officialEmail: "talent@bharatfinserv.in",
      registrationNumber: "U65999MH2018PTC310000",
      size: "201-500",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      description: "Digital lending, risk analytics and banking infrastructure.",
      verificationStatus: "VERIFIED",
      verifiedAt: new Date().toISOString(),
      authorizedPersonName: "Vivek Deshmukh",
      authorizedPersonDesignation: "Director of HR",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const opp1 = OpportunityService.createOpportunity(orgId, {
      title: "Credit Risk Analyst",
      stream: "COMMERCE",
      opportunityType: "FULL_TIME",
      workplaceType: "HYBRID",
      city: "Mumbai",
      country: "India",
      description: "Evaluate borrower financial statements, debt ratios and credit risk models.",
      responsibilities: ["Review P&L statements."],
      requiredSkills: ["Financial Analysis", "Credit Risk Modeling"],
      preferredSkills: ["SQL"],
      competencyRequirements: [],
      minStage: "UNDERGRADUATE",
      requiredQualifications: ["B.Com / BBA / CA Inter"],
      experienceYearsMin: 0,
      compensation: { isDisclosed: true, minSalary: 6.0, maxSalary: 8.5, currency: "INR" },
      deadline: "2026-12-31",
      availablePositions: 3,
      status: "PUBLISHED",
    });
    opp1Id = opp1.id;

    const opp2 = OpportunityService.createOpportunity(orgId, {
      title: "FinTech Backend Developer",
      stream: "NON_MEDICAL_PCM",
      opportunityType: "FULL_TIME",
      workplaceType: "HYBRID",
      city: "Mumbai",
      country: "India",
      description: "Build payment gateway integrations.",
      responsibilities: ["Develop resilient payment APIs."],
      requiredSkills: ["Node.js", "PostgreSQL"],
      preferredSkills: ["Redis"],
      competencyRequirements: [],
      minStage: "UNDERGRADUATE",
      requiredQualifications: ["B.Tech"],
      experienceYearsMin: 1,
      compensation: { isDisclosed: true, minSalary: 9.0, maxSalary: 14.0, currency: "INR" },
      deadline: "2026-12-31",
      availablePositions: 2,
      status: "PUBLISHED",
    });
    opp2Id = opp2.id;
  });

  it("should organize applications into distinct pipeline stages", () => {
    // Create 3 student applications
    const studentA = {
      id: "sp-cand-a",
      name: "Akash Mehra",
      email: "akash@example.in",
      educationStage: "UNDERGRADUATE" as const,
      currentStream: "COMMERCE" as const,
      isMinor: false,
      readinessIndex: 80,
      verifiedSkills: ["Financial Analysis"],
    };

    const studentB = {
      id: "sp-cand-b",
      name: "Bhavna Patel",
      email: "bhavna@example.in",
      educationStage: "UNDERGRADUATE" as const,
      currentStream: "COMMERCE" as const,
      isMinor: false,
      readinessIndex: 85,
      verifiedSkills: ["Credit Risk Modeling", "Financial Analysis"],
    };

    const studentC = {
      id: "sp-cand-c",
      name: "Chetan Joshi",
      email: "chetan@example.in",
      educationStage: "UNDERGRADUATE" as const,
      currentStream: "NON_MEDICAL_PCM" as const,
      isMinor: false,
      readinessIndex: 78,
      verifiedSkills: ["Node.js", "PostgreSQL"],
    };

    const appA = ApplicationService.applyToOpportunity({ opportunityId: opp1Id, studentProfile: studentA });
    const appB = ApplicationService.applyToOpportunity({ opportunityId: opp1Id, studentProfile: studentB });
    const appC = ApplicationService.applyToOpportunity({ opportunityId: opp2Id, studentProfile: studentC });

    // Progress appB to SHORTLISTED and appC to INTERVIEW_SCHEDULED
    ApplicationService.updateApplicationStage({
      applicationId: appB.id,
      organizationId: orgId,
      newStage: "SHORTLISTED",
      updatedBy: "HR Admin",
    });

    ApplicationService.updateApplicationStage({
      applicationId: appC.id,
      organizationId: orgId,
      newStage: "INTERVIEW_SCHEDULED",
      updatedBy: "HR Admin",
    });

    // Fetch complete pipeline for organization
    const pipeline = ApplicationService.getRecruitmentPipeline(orgId);
    expect(pipeline.APPLIED.length).toBe(1);
    expect(pipeline.APPLIED[0].id).toBe(appA.id);

    expect(pipeline.SHORTLISTED.length).toBe(1);
    expect(pipeline.SHORTLISTED[0].id).toBe(appB.id);

    expect(pipeline.INTERVIEW_SCHEDULED.length).toBe(1);
    expect(pipeline.INTERVIEW_SCHEDULED[0].id).toBe(appC.id);

    // Fetch opportunity-specific pipeline
    const opp1Pipeline = ApplicationService.getRecruitmentPipeline(orgId, opp1Id);
    expect(opp1Pipeline.APPLIED.length).toBe(1);
    expect(opp1Pipeline.SHORTLISTED.length).toBe(1);
    expect(opp1Pipeline.INTERVIEW_SCHEDULED.length).toBe(0); // Chetan is in opp2
  });
});
