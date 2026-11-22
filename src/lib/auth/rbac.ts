// ==============================================================================
// KAABIL (काबिल) — Role-Based Access Control (RBAC) & Authorization Guards
// Server-side permission enforcement and tenant boundary isolation
// ==============================================================================

import { UserRoleType, UserAccountStatus, EducationStage } from "@prisma/client";
import { getSessionUser, AuthenticatedUser } from "./session";

export class AuthorizationError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
  }
}

/**
 * Checks whether an education stage indicates a minor learner (under 18).
 */
export function isMinorStage(stage: EducationStage | string): boolean {
  return [
    "CLASS_8",
    "CLASS_9",
    "CLASS_10",
    "CLASS_11",
    "CLASS_12",
  ].includes(stage);
}

/**
 * Evaluates whether a user is classified as a minor under DPDP Act 2023.
 */
export function isUserMinor(user: AuthenticatedUser): boolean {
  if (user.isMinor) return true;
  if (user.studentProfile && isMinorStage(user.studentProfile.educationStage)) {
    return true;
  }
  return false;
}

/**
 * Role Permission Definition
 */
export const ROLE_PERMISSIONS: Record<UserRoleType, string[]> = {
  STUDENT: [
    "student:profile:read",
    "student:profile:update",
    "student:onboarding:submit",
    "career:read",
    "assessment:take",
    "roadmap:read",
    "roadmap:update",
  ],
  INSTITUTION_ADMIN: [
    "institution:profile:manage",
    "institution:cohorts:manage",
    "institution:students:view",
    "institution:analytics:view",
    "institution:reports:export",
  ],
  FACULTY: [
    "institution:cohorts:view",
    "institution:students:view",
    "institution:skills:assess",
  ],
  EMPLOYER_ADMIN: [
    "employer:profile:manage",
    "employer:jobs:manage",
    "employer:candidates:search",
    "employer:applications:review",
    "employer:interviews:manage",
  ],
  RECRUITER: [
    "employer:jobs:view",
    "employer:candidates:search",
    "employer:applications:review",
  ],
  SUPER_ADMIN: [
    "admin:system:manage",
    "admin:users:manage",
    "admin:organizations:verify",
    "admin:taxonomy:manage",
    "admin:audit:view",
  ],
  CONTENT_ADMIN: [
    "admin:taxonomy:manage",
    "career:manage",
    "skill:manage",
  ],
};

/**
 * Ensures the request is from an authenticated user.
 * Throws AuthorizationError with status 401 if unauthenticated.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AuthorizationError("Authentication required to access this resource.", 401);
  }
  if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
    throw new AuthorizationError("Your account has been suspended or deactivated.", 403);
  }
  return user;
}

/**
 * Ensures the authenticated user possesses one of the allowed roles.
 * Throws AuthorizationError with status 403 if role is disallowed.
 */
export async function requireRole(
  allowedRoles: UserRoleType[]
): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(
      `Access denied. Role '${user.role}' is not authorized for this action.`,
      403
    );
  }

  return user;
}

/**
 * Enforces organization-level data isolation.
 * Verifies that the authenticated user is an authorized member of the organization.
 */
export async function requireOrgAccess(
  organizationId: string,
  allowedRoles?: UserRoleType[]
): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  // Super admins bypass tenant boundaries for administrative audit
  if (user.role === "SUPER_ADMIN") {
    return user;
  }

  const membership = user.organizations.find((org) => org.id === organizationId);
  if (!membership) {
    throw new AuthorizationError(
      "Access denied. You are not a registered member of this organization.",
      403
    );
  }

  if (allowedRoles && !allowedRoles.includes(membership.roleInOrg)) {
    throw new AuthorizationError(
      `Access denied. Role '${membership.roleInOrg}' inside organization is unauthorized.`,
      403
    );
  }

  return user;
}

/**
 * Generates Prisma query constraints to strictly exclude minors from recruiter queries.
 */
export function buildRecruiterMinorProtectionFilter() {
  return {
    isMinor: false,
    studentProfile: {
      educationStage: {
        notIn: [
          EducationStage.CLASS_8,
          EducationStage.CLASS_9,
          EducationStage.CLASS_10,
          EducationStage.CLASS_11,
          EducationStage.CLASS_12,
        ],
      },
      privacyPreference: {
        allowRecruiterView: true,
      },
    },
  };
}

/**
 * Resolves session, enforces portal role authorization, and provides tenant organization context.
 * In production (`NEXT_PUBLIC_DEMO_MODE !== "true"`), strictly fails closed with 401/403.
 */
export async function getAuthenticatedPortalSession(
  allowedRoles: (UserRoleType | string)[],
  fallbackOrgId?: string
): Promise<{
  isAuthorized: boolean;
  status: number;
  error?: string;
  user: AuthenticatedUser | null;
  organizationId: string;
}> {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  let user: AuthenticatedUser | null = null;
  try {
    user = await getSessionUser();
  } catch {
    user = null;
  }

  if (!user) {
    if (isDemo && fallbackOrgId) {
      return {
        isAuthorized: true,
        status: 200,
        user: null,
        organizationId: fallbackOrgId,
      };
    }
    return {
      isAuthorized: false,
      status: 401,
      error: "Authentication required to access this resource.",
      user: null,
      organizationId: "",
    };
  }

  if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
    return {
      isAuthorized: false,
      status: 403,
      error: "Your account has been suspended or deactivated. Please contact support@kaabil.in.",
      user,
      organizationId: "",
    };
  }

  const hasAllowedRole =
    allowedRoles.includes(user.role) ||
    user.role === "SUPER_ADMIN" ||
    allowedRoles.includes("*");

  if (!hasAllowedRole) {
    return {
      isAuthorized: false,
      status: 403,
      error: `Access denied. Role '${user.role}' is not authorized for this resource.`,
      user,
      organizationId: "",
    };
  }

  const userOrgId =
    user.organizations?.[0]?.id ||
    (isDemo ? fallbackOrgId : undefined) ||
    "";

  return {
    isAuthorized: true,
    status: 200,
    user,
    organizationId: userOrgId,
  };
}
