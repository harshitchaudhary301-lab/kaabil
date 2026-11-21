import { describe, it, expect, beforeEach } from "vitest";
import { EmployerAnalyticsService } from "@/lib/employer/analytics-service";
import { OpportunityService } from "@/lib/employer/opportunity-service";
import { ApplicationService } from "@/lib/employer/application-service";
import { devStore } from "@/lib/dev-store";

describe("Employer Recruitment Intelligence & Analytics", () => {
  let orgId: string;

  beforeEach(() => {
    orgId = `emp-analytics-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // 1. Setup verified organization
    devStore.saveEmployerOrganization({
      id: orgId,
      name: "AgriTech Innovations India",
      slug: "agritech-innovations",
      industry: "Agriculture & Allied Sciences",
      sector: "Private",
      supportedStreams: ["AGRICULTURE", "NON_MEDICAL_PCM"],
      officialEmail: "careers@agritech.in",
      size: "51-200",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      description: "Precision farming and soil microbiome sensor analytics.",
      verificationStatus: "VERIFIED",
      verifiedAt: new Date().toISOString(),
      authorizedPersonName: "K. R. Rao",
      authorizedPersonDesignation: "Director of HR",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 2. Setup 2 opportunities
    const opp1 = OpportunityService.createOpportunity(orgId, {
      title: "Soil Chemist & Sensor Analyst",
      stream: "AGRICULTURE",
      opportunityType: "FULL_TIME",
      workplaceType: "ON_SITE",
      city: "Hyderabad",
      country: "India",
      description: "Analyze soil moisture and nutrient assays.",
      responsibilities: ["Field data collection."],
      requiredSkills: ["Soil Chemistry", "Field Testing"],
      preferredSkills: [],
      competencyRequirements: [],
      minStage: "UNDERGRADUATE",
      requiredQualifications: ["B.Sc Agriculture"],
      experienceYearsMin: 0,
      compensation: { isDisclosed: true, minSalary: 4.5, maxSalary: 6.0, currency: "INR" },
      deadline: "2026-12-31",
      availablePositions: 2,
      status: "PUBLISHED",
    });

    const opp2 = OpportunityService.createOpportunity(orgId, {
      title: "Agronomy Research Intern",
      stream: "AGRICULTURE",
      opportunityType: "INTERNSHIP",
      workplaceType: "HYBRID",
      city: "Hyderabad",
      country: "India",
      description: "Crop yield experimentation.",
      responsibilities: ["Maintain test plot logs."],
      requiredSkills: ["Crop Science"],
      preferredSkills: [],
      competencyRequirements: [],
      minStage: "UNDERGRADUATE",
      requiredQualifications: ["B.Sc Agriculture"],
      experienceYearsMin: 0,
      compensation: { isDisclosed: true, stipendMonthly: 15000, currency: "INR" },
      deadline: "2026-12-31",
      availablePositions: 4,
      status: "PUBLISHED",
    });

    // 3. Setup candidate applications
    const student1 = {
      id: "sp-agri-cand-1",
      name: "Ramesh Reddy",
      email: "ramesh@agri.edu",
      educationStage: "UNDERGRADUATE" as const,
      currentStream: "AGRICULTURE" as const,
      isMinor: false,
      readinessIndex: 82,
      verifiedSkills: ["Soil Chemistry"],
    };

    const student2 = {
      id: "sp-agri-cand-2",
      name: "Deepa Nair",
      email: "deepa@agri.edu",
      educationStage: "UNDERGRADUATE" as const,
      currentStream: "AGRICULTURE" as const,
      isMinor: false,
      readinessIndex: 78,
      verifiedSkills: ["Crop Science"],
    };

    const app1 = ApplicationService.applyToOpportunity({ opportunityId: opp1.id, studentProfile: student1 });
    const app2 = ApplicationService.applyToOpportunity({ opportunityId: opp2.id, studentProfile: student2 });

    // Progress app1 to HIRED and app2 to INTERVIEW_SCHEDULED
    ApplicationService.updateApplicationStage({
      applicationId: app1.id,
      organizationId: orgId,
      newStage: "HIRED",
      updatedBy: "HR Director",
    });

    ApplicationService.updateApplicationStage({
      applicationId: app2.id,
      organizationId: orgId,
      newStage: "INTERVIEW_SCHEDULED",
      updatedBy: "HR Director",
    });
  });

  it("should calculate recruitment metrics and funnel conversions accurately", () => {
    const analytics = EmployerAnalyticsService.getAnalytics(orgId);

    expect(analytics.totalOpportunities).toBe(2);
    expect(analytics.activeOpportunities).toBe(2);
    expect(analytics.totalApplications).toBe(2);
    expect(analytics.hiresCount).toBe(1);
    expect(analytics.interviewsCount).toBe(1);

    // Conversion rate: 1 hired / 2 applied = 50%
    expect(analytics.conversionRatePct).toBe(50);

    // Stream distribution
    expect(analytics.streamDistribution["AGRICULTURE"]).toBe(2);

    // Stage distribution
    expect(analytics.stageDistribution["HIRED"]).toBe(1);
    expect(analytics.stageDistribution["INTERVIEW_SCHEDULED"]).toBe(1);
  });
});
