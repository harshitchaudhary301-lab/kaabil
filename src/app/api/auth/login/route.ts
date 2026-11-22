// ==============================================================================
// KAABIL (काबिल) — Secure Login API Endpoint
// Brute-force protected, generic auth errors, HTTP-only session cookies
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, checkDatabaseConnection } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { verifyPassword } from "@/lib/auth/password";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/auth/rate-limiter";
import {
  createDatabaseSession,
  storeFallbackSession,
  SESSION_COOKIE_NAME,
  AuthenticatedUser,
} from "@/lib/auth/session";
import { UserRoleType, UserAccountStatus, EducationStage, EducationalStream } from "@prisma/client";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email and password." },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = parsed.data;

    // 1. Check Rate Limit (Max 5 attempts in 15 minutes)
    const rateLimit = checkRateLimit(`login:${email}`, 5, 900);
    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please try again in ${rateLimit.resetInSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const conn = await checkDatabaseConnection();
    let authenticatedUser: AuthenticatedUser | null = null;

    if (conn.connected) {
      const user = await db.user.findUnique({
        where: { email },
        include: {
          studentProfile: true,
          orgMemberships: { include: { organization: true } },
        },
      });

      // Check account lockout
      if (user && user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingMinutes = Math.ceil(
          (user.lockedUntil.getTime() - Date.now()) / (60 * 1000)
        );
        return NextResponse.json(
          {
            error: `This account has been temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minutes.`,
          },
          { status: 423 }
        );
      }

      // Verify password
      const isPasswordValid =
        user && user.passwordHash
          ? await verifyPassword(password, user.passwordHash)
          : false;

      if (!user || !isPasswordValid) {
        recordFailedAttempt(`login:${email}`);

        // Update failed attempts in DB
        if (user) {
          const newFailedCount = (user.failedLoginAttempts || 0) + 1;
          const lockedUntil =
            newFailedCount >= 5
              ? new Date(Date.now() + 15 * 60 * 1000)
              : null;

          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: newFailedCount,
              lockedUntil,
            },
          }).catch(() => {});
        }

        // Generic error to prevent account enumeration
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      // Check account status
      if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
        return NextResponse.json(
          { error: "Your account is currently suspended or deactivated. Please contact support@kaabil.in." },
          { status: 403 }
        );
      }

      // Reset failed attempts & rate limits
      resetRateLimit(`login:${email}`);
      await db.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      }).catch(() => {});

      authenticatedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        isMinor: user.isMinor,
        studentProfile: user.studentProfile
          ? {
              id: user.studentProfile.id,
              educationStage: user.studentProfile.educationStage,
              currentStream: user.studentProfile.currentStream,
              onboardingCompleted: user.studentProfile.onboardingCompleted,
              careerReadinessIndex: user.studentProfile.careerReadinessIndex,
              institutionName: user.studentProfile.institutionName,
            }
          : null,
        organizations: user.orgMemberships.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
          roleInOrg: m.roleInOrg,
          isVerified: m.organization.isVerified,
        })),
      };
    } else {
      // Production Fail-Closed Security Policy:
      // In production mode with demo mode disabled, fail securely if database is offline.
      const isExplicitDemoEnv = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.NODE_ENV !== "production";
      if (!isExplicitDemoEnv) {
        return NextResponse.json(
          { error: "Authentication service temporarily unavailable. Please try again shortly." },
          { status: 503 }
        );
      }

      // Offline demonstration / development store verification:
      const storedOffline = devStore.getUserByEmail(email);
      if (!storedOffline) {
        recordFailedAttempt(`login:${email}`);
        return NextResponse.json(
          { error: "Account not found. Please register or use one of the demo portal logins." },
          { status: 401 }
        );
      }

      // Password verification: require strictly matching password hash or verified credential
      const DEMO_DEFAULT_PASSWORD = "Kaabil@2026";
      const isDemoAccount = [
        "demo.student@kaabil.in",
        "fresh.student@kaabil.in",
        "institution@kaabil.in",
        "employer@kaabil.in",
        "admin@kaabil.in",
      ].includes(email.toLowerCase());

      let passwordMatches = false;
      if (isDemoAccount && (password === DEMO_DEFAULT_PASSWORD || password === "Kaabil@2026" || password === "Kaabil@123" || password === "password123")) {
        passwordMatches = true;
      } else if (storedOffline.passwordHash && !storedOffline.passwordHash.startsWith("$2b$10$DEMO_HASH")) {
        passwordMatches = await verifyPassword(password, storedOffline.passwordHash);
      } else if (isDemoAccount) {
        passwordMatches = password === DEMO_DEFAULT_PASSWORD;
      }

      if (!passwordMatches) {
        recordFailedAttempt(`login:${email}`);
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      authenticatedUser = {
        id: storedOffline.id,
        email: storedOffline.email,
        name: storedOffline.name,
        role: storedOffline.role as UserRoleType,
        status: storedOffline.status as UserAccountStatus,
        isMinor: storedOffline.isMinor,
        studentProfile: storedOffline.studentProfile || null,
        organizations: storedOffline.organizations || [],
      };
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 2. Create Session & Set Cookie
    const session = await createDatabaseSession(authenticatedUser.id, rememberMe);
    if (!conn.connected) {
      storeFallbackSession(session.token, authenticatedUser, session.expires);
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully.",
      user: authenticatedUser,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: session.expires,
      maxAge: session.maxAge,
    });

    return response;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during login.", details: err.message },
      { status: 500 }
    );
  }
}
