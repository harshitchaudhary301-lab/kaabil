// ==============================================================================
// KAABIL (काबिल) — Universal Employer Organization & Identity Service
// Organization management, multi-stream support, team permissions, and verification.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import {
  EmployerOrganizationRecord,
  EmployerMemberRecord,
  EmployerRole,
  EmployerVerificationStatus,
} from "@/types/employer";
import { EducationalStream } from "@/types";

export class EmployerOrganizationService {
  /**
   * Registers a new employer organization with initial admin member.
   */
  public static createOrganization(params: {
    name: string;
    industry: string;
    sector: string;
    supportedStreams: EducationalStream[];
    officialEmail: string;
    website?: string;
    registrationNumber?: string;
    size?: EmployerOrganizationRecord["size"];
    city: string;
    state: string;
    country?: string;
    description: string;
    authorizedPersonName: string;
    authorizedPersonDesignation: string;
    adminUserId?: string;
  }): { organization: EmployerOrganizationRecord; adminMember: EmployerMemberRecord } {
    const orgId = `emp-${crypto.randomUUID()}`;
    const slug = params.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const now = new Date().toISOString();

    const organization: EmployerOrganizationRecord = {
      id: orgId,
      name: params.name,
      slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
      industry: params.industry,
      sector: params.sector,
      supportedStreams: params.supportedStreams.length > 0 ? params.supportedStreams : ["NON_MEDICAL_PCM"],
      website: params.website,
      officialEmail: params.officialEmail,
      registrationNumber: params.registrationNumber,
      size: params.size || "11-50",
      city: params.city,
      state: params.state,
      country: params.country || "India",
      description: params.description,
      verificationStatus: "NOT_SUBMITTED",
      authorizedPersonName: params.authorizedPersonName,
      authorizedPersonDesignation: params.authorizedPersonDesignation,
      createdAt: now,
      updatedAt: now,
    };

    devStore.saveEmployerOrganization(organization);

    // Create the organization admin member
    const memberId = `emem-${crypto.randomUUID()}`;
    const adminMember: EmployerMemberRecord = {
      id: memberId,
      organizationId: orgId,
      userId: params.adminUserId,
      name: params.authorizedPersonName,
      email: params.officialEmail,
      role: "ORGANIZATION_ADMIN",
      title: params.authorizedPersonDesignation,
      invitationStatus: "ACCEPTED",
      invitedAt: now,
      joinedAt: now,
      createdAt: now,
    };

    devStore.saveEmployerMember(adminMember);

    return { organization, adminMember };
  }

  /**
   * Retrieves an employer organization by ID.
   */
  public static getOrganization(id: string): EmployerOrganizationRecord | null {
    return devStore.getEmployerOrganization(id);
  }

  /**
   * Updates organization profile fields.
   */
  public static updateOrganization(
    id: string,
    updates: Partial<EmployerOrganizationRecord>
  ): EmployerOrganizationRecord {
    const org = devStore.getEmployerOrganization(id);
    if (!org) {
      throw new Error(`Organization with ID ${id} not found.`);
    }

    const updated = {
      ...org,
      ...updates,
      id: org.id, // prevent overwriting ID
      updatedAt: new Date().toISOString(),
    };

    return devStore.saveEmployerOrganization(updated);
  }

  /**
   * Submits an organization verification application for human review.
   * Supports both (params) or (orgId, updates).
   */
  public static submitForVerification(
    orgIdOrParams: string | any,
    maybeUpdates?: any
  ): EmployerOrganizationRecord {
    const params =
      typeof orgIdOrParams === "string"
        ? { organizationId: orgIdOrParams, ...maybeUpdates }
        : orgIdOrParams;

    return this.submitVerification(params);
  }

  /**
   * Submits an organization verification application for human review.
   */
  public static submitVerification(params: {
    organizationId: string;
    registrationNumber: string;
    businessProofUrl?: string;
    authorizedPersonName?: string;
    authorizedPersonDesignation?: string;
    notes?: string;
  }): EmployerOrganizationRecord {
    const org = devStore.getEmployerOrganization(params.organizationId);
    if (!org) {
      throw new Error("Organization not found.");
    }

    org.registrationNumber = params.registrationNumber;
    if (params.businessProofUrl) {
      org.businessProofUrl = params.businessProofUrl;
    }
    if (params.authorizedPersonName) {
      org.authorizedPersonName = params.authorizedPersonName;
    }
    if (params.authorizedPersonDesignation) {
      org.authorizedPersonDesignation = params.authorizedPersonDesignation;
    }
    org.verificationStatus = "PENDING_REVIEW";
    if (params.notes) {
      org.verificationNotes = params.notes;
    }
    org.updatedAt = new Date().toISOString();

    return devStore.saveEmployerOrganization(org);
  }

  /**
   * Reviewer/Admin workflow: Updates verification status with authorized notes.
   * Strictly human approval — never auto-verifies based on email domain.
   * Supports (params) or (orgId, updates).
   */
  public static reviewVerification(
    orgIdOrParams: string | any,
    maybeUpdates?: any
  ): EmployerOrganizationRecord {
    const raw =
      typeof orgIdOrParams === "string"
        ? { organizationId: orgIdOrParams, ...maybeUpdates }
        : orgIdOrParams;

    const reviewerName = raw.reviewerName || raw.reviewerId || "admin-system";

    const org = devStore.getEmployerOrganization(raw.organizationId);
    if (!org) {
      throw new Error("Organization not found.");
    }

    org.verificationStatus = raw.status;
    org.verificationNotes = raw.notes;
    if (raw.status === "VERIFIED") {
      org.verifiedAt = new Date().toISOString();
      org.verifiedBy = reviewerName;
    } else {
      org.verifiedAt = undefined;
      org.verifiedBy = undefined;
    }
    org.updatedAt = new Date().toISOString();

    return devStore.saveEmployerOrganization(org);
  }

  // --------------------------------------------------------------------------
  // TEAM & STAFF PERMISSIONS
  // --------------------------------------------------------------------------

  /**
   * Invites a new team member with granular role assignment.
   * Supports (params) or (orgId, params).
   */
  public static inviteMember(
    orgIdOrParams: string | any,
    maybeParams?: any
  ): EmployerMemberRecord {
    const params =
      typeof orgIdOrParams === "string"
        ? { organizationId: orgIdOrParams, ...maybeParams }
        : orgIdOrParams;

    const org = devStore.getEmployerOrganization(params.organizationId);
    if (!org) {
      throw new Error("Organization not found.");
    }

    const members = devStore.getEmployerMembers(params.organizationId);
    const existing = members.find((m: EmployerMemberRecord) => m.email.toLowerCase() === params.email.toLowerCase());
    if (existing) {
      throw new Error("A staff member with this email address already exists.");
    }

    const id = `emem-${crypto.randomUUID()}`;
    const token = crypto.randomBytes(24).toString("hex");
    const now = new Date().toISOString();

    const member: EmployerMemberRecord = {
      id,
      organizationId: params.organizationId,
      name: params.name,
      email: params.email,
      role: params.role,
      title: params.title,
      department: params.department,
      invitationStatus: "PENDING_INVITE",
      invitationToken: token,
      invitedAt: now,
      createdAt: now,
    };

    return devStore.saveEmployerMember(member);
  }

  /**
   * Retrieves all members of an organization.
   */
  public static getMembers(organizationId: string): EmployerMemberRecord[] {
    return devStore.getEmployerMembers(organizationId);
  }

  /**
   * Alias for getMembers.
   */
  public static getTeamMembers(organizationId: string): EmployerMemberRecord[] {
    return this.getMembers(organizationId);
  }

  /**
   * Updates a member's role or title.
   */
  public static updateMemberRole(params: {
    organizationId: string;
    memberId: string;
    role: EmployerRole;
    title?: string;
  }): EmployerMemberRecord | null {
    const members = devStore.getEmployerMembers(params.organizationId);
    const member = members.find((m: EmployerMemberRecord) => m.id === params.memberId);
    if (!member) return null;

    member.role = params.role;
    if (params.title) member.title = params.title;

    return devStore.saveEmployerMember(member);
  }

  /**
   * Revokes or deletes a team member.
   */
  public static removeMember(organizationId: string, memberId: string): boolean {
    return devStore.deleteEmployerMember(organizationId, memberId);
  }
}

export const OrganizationService = EmployerOrganizationService;
