import { describe, it, expect, beforeEach } from "vitest";
import { OpportunityService } from "@/lib/employer/opportunity-service";
import { OrganizationService } from "@/lib/employer/organization-service";
import { devStore } from "@/lib/dev-store";

describe("Skills-First Opportunity Management across Universal Streams", () => {
  const verifiedOrgId = "emp-verified-org-02";

  beforeEach(() => {
    // Setup verified employer organization
    devStore.saveEmployerOrganization({
      id: verifiedOrgId,
      name: "Tata Precision Engineering & Infrastructure",
      slug: "tata-precision",
      industry: "Engineering & Heavy Industries",
      sector: "Public Limited",
      supportedStreams: ["NON_MEDICAL_PCM", "VOCATIONAL_TRADES", "MANAGEMENT"],
      officialEmail: "recruitment@tata-precision.in",
      registrationNumber: "L28920MH1945PLC004520",
      size: "1000+",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      description: "Pioneering manufacturing, mechanical robotics and precision tooling.",
      verificationStatus: "VERIFIED",
      verifiedAt: new Date().toISOString(),
      verifiedBy: "admin-system",
      authorizedPersonName: "Rajesh Kulkarni",
      authorizedPersonDesignation: "VP Talent Acquisition",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it("should create skills-first opportunity across Engineering stream with structured competencies", () => {
    const opp = OpportunityService.createOpportunity(verifiedOrgId, {
      title: "Robotics & Automation Engineer",
      stream: "NON_MEDICAL_PCM",
      department: "Advanced Manufacturing",
      opportunityType: "FULL_TIME",
      workplaceType: "HYBRID",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      description: "Design and implement PLC and robotic control algorithms for automated assembly lines.",
      responsibilities: [
        "Program industrial 6-axis robotic arms.",
        "Integrate sensor telemetry with SCADA architecture.",
      ],
      requiredSkills: ["PLC Programming", "Industrial Robotics"],
      preferredSkills: ["Python Automation", "CAD Modeling"],
      competencyRequirements: [
        {
          skillName: "PLC Programming",
          category: "TECHNICAL",
          importance: "MANDATORY",
          minProficiency: "ADVANCED",
          acceptableEvidence: ["PLATFORM_ASSESSMENT", "EXTERNAL_CREDENTIAL"],
        },
        {
          skillName: "Industrial Robotics",
          category: "PRACTICAL",
          importance: "MANDATORY",
          minProficiency: "INTERMEDIATE",
          acceptableEvidence: ["PROJECT_WORK"],
        },
        {
          skillName: "Python Automation",
          category: "TECHNICAL",
          importance: "PREFERRED",
          minProficiency: "BEGINNER",
          acceptableEvidence: ["ANY"],
        },
      ],
      minStage: "UNDERGRADUATE",
      requiredQualifications: ["B.Tech / B.E. in Mechanical, Electrical or Mechatronics"],
      experienceYearsMin: 1,
      experienceYearsMax: 3,
      compensation: {
        isDisclosed: true,
        minSalary: 8.5,
        maxSalary: 12.0,
        currency: "INR",
      },
      deadline: "2026-12-31",
      availablePositions: 4,
      status: "PUBLISHED",
    });

    expect(opp.id).toBeDefined();
    expect(opp.organizationName).toBe("Tata Precision Engineering & Infrastructure");
    expect(opp.status).toBe("PUBLISHED");
    expect(opp.competencyRequirements.length).toBe(3);
    expect(opp.requiredSkills).toContain("PLC Programming");
    expect(opp.preferredSkills).toContain("Python Automation");
  });

  it("should create Vocational / Trades craft opportunity with ITI qualification", () => {
    const opp = OpportunityService.createOpportunity(verifiedOrgId, {
      title: "Precision CNC Machinist & Tool Fabricator",
      stream: "VOCATIONAL_TRADES",
      department: "Toolroom Operations",
      opportunityType: "VOCATIONAL",
      workplaceType: "ON_SITE",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      description: "Operate 5-axis CNC vertical milling machines and precision lathe equipment.",
      responsibilities: ["Fabricate dies and tooling to sub-millimeter tolerances."],
      requiredSkills: ["CNC Milling", "G-Code Programming", "Workshop Safety"],
      preferredSkills: ["TIG Welding"],
      competencyRequirements: [
        {
          skillName: "CNC Milling",
          category: "PRACTICAL",
          importance: "MANDATORY",
          minProficiency: "ADVANCED",
          acceptableEvidence: ["PLATFORM_ASSESSMENT"],
        },
      ],
      minStage: "ITI",
      requiredQualifications: ["National Trade Certificate (NTC) / ITI Machinist or Turner"],
      experienceYearsMin: 0,
      compensation: {
        isDisclosed: true,
        minSalary: 3.5,
        maxSalary: 4.8,
        currency: "INR",
      },
      deadline: "2026-11-30",
      availablePositions: 6,
      status: "PUBLISHED",
    });

    expect(opp.minStage).toBe("ITI");
    expect(opp.stream).toBe("VOCATIONAL_TRADES");
    expect(opp.status).toBe("PUBLISHED");
  });

  it("should create Legal stream opportunity requiring Bar Council registration", () => {
    const opp = OpportunityService.createOpportunity(verifiedOrgId, {
      title: "Junior Corporate Counsel (Contracts & Compliance)",
      stream: "LAW",
      department: "Legal Affairs",
      opportunityType: "FULL_TIME",
      workplaceType: "HYBRID",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      description: "Draft, review, and negotiate enterprise industrial procurement agreements.",
      responsibilities: ["Conduct legal contract scrutiny and statutory compliance filings."],
      requiredSkills: ["Contract Law", "Legal Drafting"],
      preferredSkills: ["Arbitration Procedure"],
      competencyRequirements: [
        {
          skillName: "Contract Law",
          category: "DOMAIN",
          importance: "MANDATORY",
          minProficiency: "ADVANCED",
          acceptableEvidence: ["PLATFORM_ASSESSMENT"],
        },
      ],
      minStage: "UNDERGRADUATE",
      requiredQualifications: ["LL.B from a BCI-recognized university"],
      requiredLicenses: ["Bar Council of India Enrollment"],
      experienceYearsMin: 1,
      compensation: { isDisclosed: true, minSalary: 7.0, maxSalary: 10.0, currency: "INR" },
      deadline: "2026-12-15",
      availablePositions: 2,
      status: "PUBLISHED",
    });

    expect(opp.requiredLicenses).toContain("Bar Council of India Enrollment");
    expect(opp.stream).toBe("LAW");
  });

  it("should support lifecycle status transitions (DRAFT -> PUBLISHED -> PAUSED -> ARCHIVED)", () => {
    // 1. Create Draft
    const opp = OpportunityService.createOpportunity(verifiedOrgId, {
      title: "Graduate Apprentice 2026",
      stream: "NON_MEDICAL_PCM",
      opportunityType: "APPRENTICESHIP",
      workplaceType: "ON_SITE",
      city: "Pune",
      country: "India",
      description: "One-year apprenticeship training under NATS guidelines.",
      responsibilities: ["Complete rotating department assignments."],
      requiredSkills: ["Engineering Fundamentals"],
      preferredSkills: [],
      competencyRequirements: [],
      minStage: "UNDERGRADUATE",
      requiredQualifications: ["B.E. in any engineering discipline"],
      experienceYearsMin: 0,
      compensation: { isDisclosed: true, stipendMonthly: 20000, currency: "INR" },
      deadline: "2026-12-31",
      availablePositions: 10,
      status: "DRAFT",
    });

    expect(opp.status).toBe("DRAFT");

    // 2. Publish
    const published = OpportunityService.updateOpportunity(opp.id, verifiedOrgId, { status: "PUBLISHED" });
    expect(published.status).toBe("PUBLISHED");

    // 3. Pause
    const paused = OpportunityService.updateOpportunity(opp.id, verifiedOrgId, { status: "PAUSED" });
    expect(paused.status).toBe("PAUSED");

    // 4. Archive
    const archived = OpportunityService.archiveOpportunity(opp.id, verifiedOrgId);
    expect(archived.status).toBe("ARCHIVED");
  });

  it("should duplicate existing opportunity for rapid drafting", () => {
    const original = OpportunityService.createOpportunity(verifiedOrgId, {
      title: "Industrial Quality Auditor",
      stream: "NON_MEDICAL_PCM",
      opportunityType: "FULL_TIME",
      workplaceType: "ON_SITE",
      city: "Pune",
      country: "India",
      description: "ISO 9001 quality assurance.",
      responsibilities: ["Perform batch sampling and tolerance testing."],
      requiredSkills: ["Quality Auditing"],
      preferredSkills: [],
      competencyRequirements: [],
      minStage: "UNDERGRADUATE",
      requiredQualifications: ["B.Tech"],
      experienceYearsMin: 1,
      compensation: { isDisclosed: false, currency: "INR" },
      deadline: "2026-12-31",
      availablePositions: 1,
      status: "PUBLISHED",
    });

    const duplicated = OpportunityService.duplicateOpportunity(original.id, verifiedOrgId);
    expect(duplicated.id).not.toBe(original.id);
    expect(duplicated.title).toBe("Industrial Quality Auditor (Copy)");
    expect(duplicated.status).toBe("DRAFT"); // Copies start as DRAFT
  });
});
