// ==============================================================================
// KAABIL (काबिल) — Universal Opportunity Management & Skills-First Requirement Builder
// Multi-stream recruitment across all 13 educational categories.
// Strictly enforces verified employer status for publication.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import {
  JobOpportunityRecord,
  OpportunityType,
  WorkplaceType,
  OpportunityStatus,
  StructuredCompetencyRequirement,
} from "@/types/employer";
import { EducationalStream, EducationStage } from "@/types";

export class OpportunityService {
  /**
   * Creates a new job or training opportunity. Supports both single object params or (orgId, params) signatures.
   */
  public static createOpportunity(
    orgIdOrParams: string | any,
    maybeParams?: any
  ): JobOpportunityRecord {
    const rawParams =
      typeof orgIdOrParams === "string"
        ? { ...maybeParams, organizationId: orgIdOrParams }
        : orgIdOrParams;

    const org = devStore.getEmployerOrganization(rawParams.organizationId);
    if (!org) {
      throw new Error("Employer organization not found.");
    }

    const params = {
      ...rawParams,
      industry: rawParams.industry || org.industry || "General Industry",
    };

    const requestedStatus = params.status || "DRAFT";

    // Strictly enforce verified employer status for publishing
    if (requestedStatus === "PUBLISHED" && org.verificationStatus !== "VERIFIED") {
      throw new Error(
        "Unauthorized publication: Your organization must be verified by the KAABIL Trust & Verification Directorate before publishing live opportunities."
      );
    }

    const id = `opp-${crypto.randomUUID()}`;
    const slug = `${params.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const now = new Date().toISOString();

    const opportunity: JobOpportunityRecord = {
      id,
      organizationId: params.organizationId,
      organizationName: org.name,
      organizationLogo: org.logoUrl,
      title: params.title,
      slug,
      industry: params.industry,
      stream: params.stream,
      department: params.department,
      opportunityType: params.opportunityType,
      workplaceType: params.workplaceType,
      city: params.city || org.city,
      state: params.state || org.state,
      country: params.country || org.country || "India",
      description: params.description,
      responsibilities: params.responsibilities || [],
      requiredSkills: params.requiredSkills || [],
      preferredSkills: params.preferredSkills || [],
      competencyRequirements: params.competencyRequirements || [],
      minStage: params.minStage || "UNDERGRADUATE",
      requiredQualifications: params.requiredQualifications || [],
      requiredLicenses: params.requiredLicenses || [],
      experienceYearsMin: params.experienceYearsMin ?? 0,
      experienceYearsMax: params.experienceYearsMax,
      compensation: params.compensation || {
        currency: "INR",
        isDisclosed: false,
      },
      deadline: params.deadline,
      availablePositions: params.availablePositions || 1,
      status: requestedStatus,
      totalApplications: 0,
      shortlistedCount: 0,
      hiredCount: 0,
      isCampusDrive: params.isCampusDrive || false,
      partnerInstitutionId: params.partnerInstitutionId,
      createdAt: now,
      updatedAt: now,
    };

    return devStore.saveJobOpportunity(opportunity);
  }

  /**
   * Retrieves opportunities for an organization or all opportunities.
   */
  public static getOpportunities(filters?: {
    organizationId?: string;
    stream?: string;
    industry?: string;
    opportunityType?: string;
    status?: string;
    search?: string;
  }): JobOpportunityRecord[] {
    let list: JobOpportunityRecord[] = devStore.getJobOpportunities(filters?.organizationId);

    if (filters?.stream && filters.stream !== "ALL") {
      list = list.filter((o) => o.stream === filters.stream);
    }
    if (filters?.industry && filters.industry !== "ALL") {
      list = list.filter((o) => o.industry === filters.industry);
    }
    if (filters?.opportunityType && filters.opportunityType !== "ALL") {
      list = list.filter((o) => o.opportunityType === filters.opportunityType);
    }
    if (filters?.status && filters.status !== "ALL") {
      list = list.filter((o) => o.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.organizationName.toLowerCase().includes(q) ||
          o.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * Retrieves a single opportunity by ID.
   */
  public static getOpportunityById(id: string): JobOpportunityRecord | null {
    return devStore.getJobOpportunity(id);
  }

  /**
   * Updates an existing opportunity. Supports (id, updates) or (id, orgId, updates).
   */
  public static updateOpportunity(
    id: string,
    orgIdOrUpdates: string | Partial<JobOpportunityRecord>,
    maybeUpdates?: Partial<JobOpportunityRecord>
  ): JobOpportunityRecord {
    const opp = devStore.getJobOpportunity(id);
    if (!opp) {
      throw new Error(`Opportunity with ID ${id} not found.`);
    }

    const updates =
      typeof orgIdOrUpdates === "string" ? maybeUpdates || {} : orgIdOrUpdates;

    // If publishing, verify organization status
    if (updates.status === "PUBLISHED" && opp.status !== "PUBLISHED") {
      const org = devStore.getEmployerOrganization(opp.organizationId);
      if (!org || org.verificationStatus !== "VERIFIED") {
        throw new Error(
          "Unauthorized publication: Your organization must be verified by the KAABIL Trust & Verification Directorate before publishing live opportunities."
        );
      }
    }

    const updated = {
      ...opp,
      ...updates,
      id: opp.id,
      organizationId: opp.organizationId,
      updatedAt: new Date().toISOString(),
    };

    return devStore.saveJobOpportunity(updated);
  }

  /**
   * Archives an opportunity. Supports (id) or (id, orgId).
   */
  public static archiveOpportunity(id: string, orgId?: string): JobOpportunityRecord {
    return this.updateOpportunity(id, { status: "ARCHIVED" });
  }

  /**
   * Duplicates an existing opportunity as a new DRAFT.
   */
  public static duplicateOpportunity(id: string, orgId?: string): JobOpportunityRecord {
    const opp = devStore.getJobOpportunity(id);
    if (!opp) {
      throw new Error(`Opportunity with ID ${id} not found.`);
    }

    const dupId = `opp-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const duplicated: JobOpportunityRecord = {
      ...opp,
      id: dupId,
      title: `${opp.title} (Copy)`,
      slug: `${opp.slug}-copy-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "DRAFT",
      totalApplications: 0,
      shortlistedCount: 0,
      hiredCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    return devStore.saveJobOpportunity(duplicated);
  }

  /**
   * Sets opportunity status (e.g. PAUSED, CLOSED, ARCHIVED).
   */
  public static setOpportunityStatus(
    id: string,
    status: OpportunityStatus
  ): JobOpportunityRecord {
    return this.updateOpportunity(id, { status });
  }
}
