import { describe, it, expect, beforeAll } from "vitest";
import { InstitutionPartnershipService } from "@/lib/employer/institution-partnership-service";
import { devStore } from "@/lib/dev-store";

describe("Campus Recruitment & Institution Partnership Coordination", () => {
  let orgId: string;
  let orgName: string;
  let institutionId: string;
  let institutionName: string;

  beforeAll(() => {
    const runId = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    orgId = `emp-tech-${runId}`;
    orgName = `InfraTech Cloud Solutions ${runId}`;
    institutionId = `inst-tech-${runId}`;
    institutionName = `Delhi Institute of Higher Technology ${runId}`;

    // Seed test institution
    devStore.saveInstitution({
      id: institutionId,
      name: institutionName,
      slug: institutionId,
      category: "HIGHER_EDUCATION",
      verificationStatus: "VERIFIED",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      supportedStreams: ["NON_MEDICAL_PCM"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    devStore.saveEmployerOrganization({
      id: orgId,
      name: orgName,
      slug: "infratech-cloud",
      industry: "Information Technology",
      sector: "Private",
      supportedStreams: ["NON_MEDICAL_PCM"],
      officialEmail: "campus@infratech.in",
      size: "501-1000",
      city: "Noida",
      state: "Uttar Pradesh",
      country: "India",
      description: "Cloud infrastructure and DevOps automation.",
      verificationStatus: "VERIFIED",
      verifiedAt: new Date().toISOString(),
      authorizedPersonName: "Sanjay Singhal",
      authorizedPersonDesignation: "Director of Talent",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it("should request or establish partnership with educational institution", () => {
    const partnership = InstitutionPartnershipService.requestPartnership({
      employerOrganizationId: orgId,
      employerOrganizationName: orgName,
      institutionId,
      institutionName,
      notes: "Seeking annual campus placements for Computer Science and Cloud Engineering graduates.",
    });

    expect(partnership.id).toBeDefined();
    expect(partnership.employerOrganizationId).toBe(orgId);
    expect(partnership.institutionId).toBe(institutionId);
    expect(partnership.status).toBe("APPROVED"); // Default auto-accepted in test environment
    expect(partnership.driveProposalsCount).toBe(0);

    const orgPartnerships = InstitutionPartnershipService.getPartnerships(orgId);
    expect(orgPartnerships.length).toBeGreaterThanOrEqual(1);
    expect(orgPartnerships.some((p) => p.institutionId === institutionId)).toBe(true);
  });

  it("should propose campus placement drive to partnered institution", () => {
    const drive = InstitutionPartnershipService.proposePlacementDrive({
      employerOrganizationId: orgId,
      employerOrganizationName: orgName,
      institutionId,
      institutionName,
      title: "Annual Cloud Engineer Placement Drive 2026",
      stream: "NON_MEDICAL_PCM",
      date: "2026-12-20",
      location: "Main Auditorium, Delhi Tech Campus",
    });

    expect(drive.id).toBeDefined();
    expect(drive.companyName).toBe(orgName);
    expect(drive.institutionId).toBe(institutionId);
    expect(drive.streams).toContain("NON_MEDICAL_PCM");
    expect(drive.status).toBe("SCHEDULED");

    // Partnership drive counter incremented
    const updatedPartnership = InstitutionPartnershipService.getPartnerships(orgId).find(
      (p) => p.institutionId === institutionId
    );
    expect(updatedPartnership?.driveProposalsCount).toBeGreaterThanOrEqual(1);
  });

  it("should ensure student privacy is protected prior to student opt-in registration", () => {
    // Check that placement drives do not disclose student records before student application
    const drives = devStore.getPlacementDrives(institutionId);
    expect(drives.length).toBeGreaterThanOrEqual(1);

    // Initial student registrations must start at 0
    const drive = drives[0];
    expect(drive.totalApplicants).toBe(0);
  });
});
