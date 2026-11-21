import { describe, it, expect, beforeEach } from "vitest";
import { OrganizationService } from "@/lib/employer/organization-service";
import { OpportunityService } from "@/lib/employer/opportunity-service";
import { devStore } from "@/lib/dev-store";

describe("Universal Employer Organization Management & Verification", () => {
  const testOrgId = "emp-test-org-01";

  beforeEach(() => {
    // Reset or prepare test organization
    devStore.saveEmployerOrganization({
      id: testOrgId,
      name: "BioGen Diagnostics & Research Ltd",
      slug: "biogen-diagnostics",
      industry: "Healthcare & Diagnostics",
      sector: "Private Limited",
      supportedStreams: ["MEDICAL_PCB", "NON_MEDICAL_PCM"],
      officialEmail: "careers@biogen.in",
      registrationNumber: "U85110DL2020PTC368900",
      size: "51-200",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      description: "Leading pathology diagnostic laboratory and healthcare research center.",
      verificationStatus: "NOT_SUBMITTED",
      authorizedPersonName: "Dr. Arvind Rao",
      authorizedPersonDesignation: "Chief Medical Officer",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    devStore.saveEmployerMember({
      id: "mem-test-admin-01",
      organizationId: testOrgId,
      name: "Dr. Arvind Rao",
      email: "careers@biogen.in",
      role: "ORGANIZATION_ADMIN",
      title: "Chief Medical Officer",
      invitationStatus: "ACCEPTED",
      invitedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  });

  it("should retrieve organization details and active team members", () => {
    const org = OrganizationService.getOrganization(testOrgId);
    expect(org).toBeDefined();
    expect(org?.name).toBe("BioGen Diagnostics & Research Ltd");
    expect(org?.verificationStatus).toBe("NOT_SUBMITTED");

    const team = OrganizationService.getTeamMembers(testOrgId);
    expect(team.length).toBeGreaterThanOrEqual(1);
    expect(team[0].role).toBe("ORGANIZATION_ADMIN");
  });

  it("should update organization profile successfully", () => {
    const updated = OrganizationService.updateOrganization(testOrgId, {
      city: "Gurugram",
      state: "Haryana",
      size: "201-500",
    });

    expect(updated.city).toBe("Gurugram");
    expect(updated.state).toBe("Haryana");
    expect(updated.size).toBe("201-500");
  });

  it("should manage complete organization verification lifecycle with human review requirement", () => {
    // 1. Submit for verification
    const submitted = OrganizationService.submitForVerification(testOrgId, {
      registrationNumber: "U85110DL2020PTC368900",
      businessProofUrl: "https://documents.mca.gov.in/certs/biogen-cin.pdf",
      authorizedPersonName: "Dr. Arvind Rao",
      authorizedPersonDesignation: "Chief Medical Officer",
    });

    expect(submitted.verificationStatus).toBe("PENDING_REVIEW");

    // 2. Automated domain-only verification is prohibited; requires compliance reviewer
    const reviewed = OrganizationService.reviewVerification(testOrgId, {
      reviewerId: "admin-gov-officer-01",
      status: "ADDITIONAL_INFO_REQUIRED",
      notes: "Please upload official GSTIN registration certificate in addition to MCA Certificate of Incorporation.",
    });

    expect(reviewed.verificationStatus).toBe("ADDITIONAL_INFO_REQUIRED");
    expect(reviewed.verificationNotes).toContain("GSTIN registration");

    // 3. Human compliance reviewer approves verification
    const verified = OrganizationService.reviewVerification(testOrgId, {
      reviewerId: "admin-gov-officer-01",
      status: "VERIFIED",
      notes: "MCA and GSTIN records verified against Ministry of Corporate Affairs database.",
    });

    expect(verified.verificationStatus).toBe("VERIFIED");
    expect(verified.verifiedBy).toBe("admin-gov-officer-01");
    expect(verified.verifiedAt).toBeDefined();
  });

  it("should invite and manage multi-role team members (RBAC)", () => {
    // Invite Recruiter
    const recruiterMember = OrganizationService.inviteMember(testOrgId, {
      name: "Pooja Sharma",
      email: "pooja.recruiter@biogen.in",
      role: "RECRUITER",
      title: "Senior Technical Recruiter",
      department: "Human Resources",
    });

    expect(recruiterMember.id).toBeDefined();
    expect(recruiterMember.role).toBe("RECRUITER");
    expect(recruiterMember.invitationStatus).toBe("PENDING_INVITE");

    // Invite Hiring Manager
    const hiringManager = OrganizationService.inviteMember(testOrgId, {
      name: "Dr. Priya Nair",
      email: "priya.nair@biogen.in",
      role: "HIRING_MANAGER",
      title: "Head of Clinical Pathology",
      department: "Diagnostic Services",
    });

    expect(hiringManager.role).toBe("HIRING_MANAGER");

    // Check updated team list
    const team = OrganizationService.getTeamMembers(testOrgId);
    expect(team.length).toBe(3);

    // Remove member
    const removed = OrganizationService.removeMember(testOrgId, recruiterMember.id);
    expect(removed).toBe(true);

    const updatedTeam = OrganizationService.getTeamMembers(testOrgId);
    expect(updatedTeam.length).toBe(2);
    expect(updatedTeam.some((m) => m.id === recruiterMember.id)).toBe(false);
  });

  it("should strictly prevent unverified employers from publishing live opportunities", () => {
    // Organization is NOT_SUBMITTED
    const org = OrganizationService.getOrganization(testOrgId);
    expect(org?.verificationStatus).toBe("NOT_SUBMITTED");

    // Attempting to publish must throw an error
    expect(() => {
      OpportunityService.createOpportunity(testOrgId, {
        title: "Clinical Laboratory Intern",
        stream: "MEDICAL_PCB",
        opportunityType: "INTERNSHIP",
        workplaceType: "ON_SITE",
        city: "Delhi",
        state: "Delhi",
        country: "India",
        description: "Pathology specimen testing and documentation.",
        responsibilities: ["Assist laboratory technologists."],
        requiredSkills: ["Pathology Specimen Handling"],
        preferredSkills: [],
        competencyRequirements: [
          {
            skillName: "Pathology Specimen Handling",
            category: "TECHNICAL",
            importance: "MANDATORY",
            minProficiency: "INTERMEDIATE",
            acceptableEvidence: ["PLATFORM_ASSESSMENT"],
          },
        ],
        minStage: "UNDERGRADUATE",
        requiredQualifications: ["B.Sc Medical Laboratory Technology"],
        experienceYearsMin: 0,
        compensation: { isDisclosed: true, stipendMonthly: 18000, currency: "INR" },
        deadline: "2026-12-31",
        availablePositions: 3,
        status: "PUBLISHED", // <--- Must be rejected!
      });
    }).toThrow(/Unauthorized publication.*verified/i);
  });
});
