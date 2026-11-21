// ==============================================================================
// KAABIL (काबिल) — Faculty & Staff Management Service
// Multi-tenant staff directory, least-privilege role assignment, and invitations.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import { FacultyMemberRecord, InstitutionRole } from "@/types/institution";

const ALLOWED_INSTITUTION_ROLES = new Set<InstitutionRole>([
  "INSTITUTION_ADMIN",
  "PRINCIPAL_DIRECTOR",
  "DEPARTMENT_HEAD",
  "FACULTY",
  "CAREER_COUNSELOR",
  "TRAINING_COORDINATOR",
  "PLACEMENT_OFFICER",
  "STAFF",
]);

export class FacultyService {
  public static getFacultyMembers(institutionId: string): FacultyMemberRecord[] {
    return devStore.getFacultyMembers(institutionId);
  }

  public static getFacultyMember(
    institutionId: string,
    facultyId: string
  ): FacultyMemberRecord | null {
    return devStore.getFacultyMember(institutionId, facultyId);
  }

  /**
   * Invites a new faculty or staff member with an expiring token.
   */
  public static inviteStaffMember(params: {
    institutionId: string;
    name: string;
    email: string;
    designation: string;
    role: InstitutionRole;
    departmentId?: string;
    specialization?: string;
    isLead?: boolean;
  }): FacultyMemberRecord {
    // Validate role to prevent privilege escalation to platform admin
    if (!ALLOWED_INSTITUTION_ROLES.has(params.role)) {
      throw new Error(
        `Invalid institution role '${params.role}'. Platform administrative roles cannot be assigned via the Institution Portal.`
      );
    }

    const dept = params.departmentId
      ? devStore.getDepartment(params.institutionId, params.departmentId)
      : null;

    const id = `fac-${crypto.randomUUID()}`;
    const token = crypto.randomBytes(24).toString("hex");

    const record: FacultyMemberRecord = {
      id,
      institutionId: params.institutionId,
      name: params.name,
      email: params.email.toLowerCase().trim(),
      designation: params.designation,
      role: params.role,
      departmentId: params.departmentId,
      departmentName: dept?.name,
      specialization: params.specialization,
      isLead: params.isLead ?? false,
      invitationStatus: "PENDING_INVITE",
      invitationToken: token,
      createdAt: new Date().toISOString(),
    };

    return devStore.saveFacultyMember(record);
  }

  /**
   * Updates an existing faculty member's role or department.
   */
  public static updateFacultyMember(
    institutionId: string,
    facultyId: string,
    updates: Partial<FacultyMemberRecord>
  ): FacultyMemberRecord | null {
    const fac = devStore.getFacultyMember(institutionId, facultyId);
    if (!fac) return null;

    if (updates.role && !ALLOWED_INSTITUTION_ROLES.has(updates.role)) {
      throw new Error(`Unauthorized role assignment: '${updates.role}'`);
    }

    const updated = {
      ...fac,
      ...updates,
    };

    return devStore.saveFacultyMember(updated);
  }

  /**
   * Revokes staff access.
   */
  public static revokeStaffAccess(
    institutionId: string,
    facultyId: string
  ): boolean {
    const fac = devStore.getFacultyMember(institutionId, facultyId);
    if (!fac) return false;

    fac.invitationStatus = "REVOKED";
    devStore.saveFacultyMember(fac);
    return true;
  }
}
