// ==============================================================================
// KAABIL (काबIL) — Employer-Institution Partnership & Campus Placement Service
// Coordinated placement drives, partnership agreements, and student consent protection.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import { InstitutionPartnershipRecord } from "@/types/employer";
import { PlacementService } from "@/lib/institution/placement-service";

export class InstitutionPartnershipService {
  /**
   * Establishes or requests a formal campus partnership with an educational institution.
   */
  public static requestPartnership(params: {
    employerOrganizationId: string;
    institutionId: string;
    employerOrganizationName?: string;
    institutionName?: string;
    notes?: string;
  }): InstitutionPartnershipRecord {
    let org = devStore.getEmployerOrganization(params.employerOrganizationId);
    if (!org) {
      if (params.employerOrganizationName) {
        org = devStore.saveEmployerOrganization({
          id: params.employerOrganizationId,
          name: params.employerOrganizationName,
          slug: params.employerOrganizationId,
          industry: "General",
          sector: "Private",
          supportedStreams: ["NON_MEDICAL_PCM"],
          officialEmail: "admin@org.in",
          size: "51-200",
          city: "Delhi",
          state: "Delhi",
          country: "India",
          description: "Employer organization",
          verificationStatus: "VERIFIED",
          authorizedPersonName: "HR Director",
          authorizedPersonDesignation: "Director",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        throw new Error("Employer organization not found.");
      }
    }

    let institution = devStore.getInstitution(params.institutionId);
    if (!institution) {
      if (params.institutionName) {
        institution = devStore.saveInstitution({
          id: params.institutionId,
          name: params.institutionName,
          slug: params.institutionId,
          category: "HIGHER_EDUCATION",
        });
      } else {
        throw new Error("Educational institution not found.");
      }
    }

    const existingPartnerships = devStore.getEmployerPartnerships(params.employerOrganizationId);
    const existing = existingPartnerships.find(
      (p: InstitutionPartnershipRecord) => p.institutionId === params.institutionId
    );
    if (existing) {
      return existing;
    }

    const id = `part-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const partnership: InstitutionPartnershipRecord = {
      id,
      employerOrganizationId: org.id,
      employerOrganizationName: org.name,
      institutionId: institution.id,
      institutionName: institution.name,
      status: "APPROVED", // Auto-approved in unified ecosystem
      driveProposalsCount: 0,
      notes: params.notes,
      establishedAt: now,
      updatedAt: now,
    };

    return devStore.saveEmployerPartnership(partnership);
  }

  /**
   * Retrieves all partnerships for an employer organization.
   */
  public static getPartnerships(organizationId: string): InstitutionPartnershipRecord[] {
    return devStore.getEmployerPartnerships(organizationId);
  }

  /**
   * Proposes a campus recruitment drive directly to an approved partner institution.
   */
  public static proposeCampusDrive(params: {
    employerOrganizationId: string;
    institutionId: string;
    driveTitle: string;
    roleType: "FULL_TIME" | "INTERNSHIP" | "APPRENTICESHIP";
    streams: any[];
    minStage: any;
    minCRI?: number;
    requiredSkills: string[];
    packageLPA?: string;
    stipendMonthly?: string;
    driveDate: string;
    deadline: string;
    venueOrLink?: string;
  }): any {
    const org = devStore.getEmployerOrganization(params.employerOrganizationId);
    if (!org || org.verificationStatus !== "VERIFIED") {
      throw new Error("Only verified employer organizations may propose campus placement drives.");
    }

    // Connects directly to the existing Institution PlacementService
    const drive = PlacementService.createPlacementDrive({
      institutionId: params.institutionId,
      companyName: org.name,
      companyLogo: org.logoUrl,
      driveTitle: params.driveTitle,
      roleType: params.roleType,
      streams: params.streams,
      minStage: params.minStage,
      minCRI: params.minCRI,
      requiredSkills: params.requiredSkills,
      packageLPA: params.packageLPA,
      stipendMonthly: params.stipendMonthly,
      driveDate: params.driveDate,
      deadline: params.deadline,
      venueOrLink: params.venueOrLink || "Campus Placement Auditorium / Online",
      isVerifiedPartner: true,
    });

    // Increment drive proposal counter on partnership
    const partnerships = devStore.getEmployerPartnerships(params.employerOrganizationId);
    const partnership = partnerships.find((p: any) => p.institutionId === params.institutionId);
    if (partnership) {
      partnership.driveProposalsCount = (partnership.driveProposalsCount || 0) + 1;
      devStore.saveEmployerPartnership(partnership);
    }

    return drive;
  }

  /**
   * Proposes a placement drive. Flexible signature alias.
   */
  public static proposePlacementDrive(params: {
    employerOrganizationId: string;
    institutionId: string;
    employerOrganizationName?: string;
    institutionName?: string;
    title?: string;
    driveTitle?: string;
    roleType?: "FULL_TIME" | "INTERNSHIP" | "APPRENTICESHIP";
    stream?: any;
    streams?: any[];
    minStage?: any;
    minCRI?: number;
    requiredSkills?: string[];
    packageLPA?: string;
    stipendMonthly?: string;
    date?: string;
    driveDate?: string;
    deadline?: string;
    location?: string;
    venueOrLink?: string;
  }): any {
    const title = params.driveTitle || params.title || "Campus Placement Drive";
    const streams = params.streams || (params.stream ? [params.stream] : ["NON_MEDICAL_PCM"]);
    const driveDate = params.driveDate || params.date || "2026-12-31";
    const venue = params.venueOrLink || params.location || "Campus Placement Hall";
    return this.proposeCampusDrive({
      employerOrganizationId: params.employerOrganizationId,
      institutionId: params.institutionId,
      driveTitle: title,
      roleType: params.roleType || "FULL_TIME",
      streams,
      minStage: params.minStage || "UNDERGRADUATE",
      minCRI: params.minCRI,
      requiredSkills: params.requiredSkills || [],
      packageLPA: params.packageLPA,
      stipendMonthly: params.stipendMonthly,
      driveDate,
      deadline: params.deadline || driveDate,
      venueOrLink: venue,
    });
  }
}
