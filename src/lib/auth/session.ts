// ==============================================================================
// KAABIL (काबिल) — Session & Cookie Manager
// Backed by PostgreSQL Prisma Session Table & Secure HTTP-Only Cookies
// ==============================================================================

import crypto from "crypto";
import { cookies } from "next/headers";
import { db, checkDatabaseConnection } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { UserRoleType, UserAccountStatus, EducationStage, EducationalStream } from "@prisma/client";

export const SESSION_COOKIE_NAME = "kaabil_session_token";
export const DEFAULT_SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
export const EXTENDED_SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRoleType;
  status: UserAccountStatus;
  isMinor: boolean;
  studentProfile?: {
    id: string;
    educationStage: EducationStage;
    currentStream: EducationalStream;
    onboardingCompleted: boolean;
    careerReadinessIndex: number;
    institutionName: string | null;
  } | null;
  organizations: {
    id: string;
    name: string;
    slug: string;
    roleInOrg: UserRoleType;
    isVerified: boolean;
  }[];
}

/**
 * Creates a database session and returns the secure token and expiration.
 */
export async function createDatabaseSession(
  userId: string,
  rememberMe: boolean = false
): Promise<{ token: string; expires: Date; maxAge: number }> {
  const token = crypto.randomBytes(32).toString("hex");
  const maxAge = rememberMe ? EXTENDED_SESSION_MAX_AGE : DEFAULT_SESSION_MAX_AGE;
  const expires = new Date(Date.now() + maxAge * 1000);

  const conn = await checkDatabaseConnection();
  if (conn.connected) {
    try {
      await db.session.create({
        data: {
          sessionToken: token,
          userId,
          expires,
        },
      });
    } catch (err: unknown) {
      console.error("Failed to insert session record:", err);
    }
  }

  return { token, expires, maxAge };
}

export function storeFallbackSession(
  token: string,
  user: AuthenticatedUser,
  expires: Date
): void {
  devStore.saveSession(token, user, expires);
}

export function getFallbackSession(token: string): AuthenticatedUser | null {
  return devStore.getSession(token);
}

export function removeFallbackSession(token: string): void {
  devStore.deleteSession(token);
}

/**
 * Resolves the currently authenticated user from incoming cookies.
 * Server-side only; safe to call in Server Components, Route Handlers, and Server Actions.
 */
export async function getSessionUser(): Promise<AuthenticatedUser | null> {
  let token: string | undefined;
  try {
    const cookieStore = cookies();
    token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  } catch {
    // Outside of request scope or test environment
    return null;
  }

  if (!token) {
    return null;
  }

  const conn = await checkDatabaseConnection();
  if (conn.connected) {
    try {
      const session = await db.session.findUnique({
        where: { sessionToken: token },
        include: {
          user: {
            include: {
              studentProfile: true,
              orgMemberships: {
                include: {
                  organization: true,
                },
              },
            },
          },
        },
      });

      if (!session) {
        return null;
      }

      if (session.expires < new Date()) {
        // Expired session - cleanup
        await db.session.delete({ where: { id: session.id } }).catch(() => {});
        return null;
      }

      const u = session.user;
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status,
        isMinor: u.isMinor,
        studentProfile: u.studentProfile
          ? {
              id: u.studentProfile.id,
              educationStage: u.studentProfile.educationStage,
              currentStream: u.studentProfile.currentStream,
              onboardingCompleted: u.studentProfile.onboardingCompleted,
              careerReadinessIndex: u.studentProfile.careerReadinessIndex,
              institutionName: u.studentProfile.institutionName,
            }
          : null,
        organizations: u.orgMemberships.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
          roleInOrg: m.roleInOrg,
          isVerified: m.organization.isVerified,
        })),
      };
    } catch (err: unknown) {
      console.error("getSessionUser error:", err);
    }
  }

  // Check fallback store
  return getFallbackSession(token);
}

/**
 * Destroys a session in the database and removes the fallback.
 */
export async function destroySession(token: string): Promise<void> {
  removeFallbackSession(token);

  const conn = await checkDatabaseConnection();
  if (conn.connected) {
    try {
      await db.session.delete({ where: { sessionToken: token } }).catch(() => {});
    } catch {
      // Ignored if session already deleted
    }
  }
}
