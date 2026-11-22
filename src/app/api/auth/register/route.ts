// ==============================================================================
// KAABIL (काबिल) — Secure Registration API Endpoint
// Supports Student, Institution, and Employer Onboarding with Minor Safety Locks
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, checkDatabaseConnection } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { hashPassword, evaluatePasswordStrength } from "@/lib/auth/password";
import { checkRateLimit } from "@/lib/auth/rate-limiter";
import {
  createDatabaseSession,
  storeFallbackSession,
  SESSION_COOKIE_NAME,
  AuthenticatedUser,
} from "@/lib/auth/session";
import {
  UserRoleType,
  UserAccountStatus,
  EducationStage,
  EducationalStream,
  OrgType,
  VerificationStatus,
} from "@prisma/client";
import { isMinorStage } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  role: z.enum(["STUDENT", "INSTITUTION_ADMIN", "EMPLOYER_ADMIN"]),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // Student-specific fields
  educationStage: z
    .enum([
      "CLASS_8",
      "CLASS_9",
      "CLASS_10",
      "CLASS_11",
      "CLASS_12",
      "DIPLOMA",
      "ITI",
      "UNDERGRADUATE",
      "POSTGRADUATE",
      "WORKING_PROFESSIONAL",
      "OTHER",
    ])
    .optional(),
  currentStream: z
    .enum([
      "MEDICAL_PCB",
      "NON_MEDICAL_PCM",
      "COMMERCE",
      "ARTS_HUMANITIES",
      "LAW",
      "MANAGEMENT",
      "CREATIVE_DESIGN",
      "AGRICULTURE",
      "VOCATIONAL_TRADES",
      "SPORTS_PHYSICAL_ED",
      "HOSPITALITY_TOURISM",
      "INTERDISCIPLINARY",
      "UNDECIDED",
    ])
    .optional(),
  institutionName: z.string().max(150).optional(),
  guardianConsent: z.boolean().optional(),
  // Organization-specific fields
  organizationName: z.string().min(2).max(150).optional(),
  orgType: z
    .enum([
      "SCHOOL",
      "COLLEGE_UNIVERSITY",
      "VOCATIONAL_INSTITUTE",
      "CORPORATE_EMPLOYER",
      "HEALTHCARE_ORG",
      "LEGAL_FIRM",
      "GOVERNMENT_PSU",
      "NON_PROFIT",
    ])
    .optional(),
  industry: z.string().max(100).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(80).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 0. Check rate limiting (10 attempts per 15 minutes)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`register:${ip}`, 10, 900);
    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts from your network. Please wait ${rateLimit.resetInSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // Explicitly reject Admin registration attempts
    if (body.role && ["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"].includes(body.role)) {
      return NextResponse.json(
        { error: "Administrative accounts cannot be registered publicly." },
        { status: 403 }
      );
    }

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      role,
      name,
      email,
      password,
      educationStage,
      currentStream,
      institutionName,
      guardianConsent,
      organizationName,
      orgType,
      industry,
      city,
      state,
    } = parsed.data;

    // Disallow public registration as Super Admin or Content Admin
    if (role !== "STUDENT" && role !== "INSTITUTION_ADMIN" && role !== "EMPLOYER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized role assignment." },
        { status: 403 }
      );
    }

    // Evaluate password strength: require minimum score of 2 and 8+ characters
    const strength = evaluatePasswordStrength(password);
    if (password.length < 8 || strength.score < 2) {
      return NextResponse.json(
        {
          error: "Password is too weak. Must be at least 8 characters long and include uppercase, lowercase, numbers, or symbols.",
          details: strength.feedback,
        },
        { status: 400 }
      );
    }

    const conn = await checkDatabaseConnection();
    const passwordHash = await hashPassword(password);
    const stage = educationStage || EducationStage.CLASS_12;
    const isMinor = role === "STUDENT" && isMinorStage(stage);

    if (isMinor && !guardianConsent) {
      return NextResponse.json(
        {
          error:
            "Parent or legal guardian consent is mandatory under the DPDP Act 2023 for school-aged students.",
        },
        { status: 400 }
      );
    }

    let createdUser: AuthenticatedUser | null = null;

    if (conn.connected) {
      // 1. Check for duplicate account
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "An account with this email address already exists." },
          { status: 409 }
        );
      }

      // 2. Transactional creation
      const userRecord = await db.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            email,
            name,
            passwordHash,
            role: role as UserRoleType,
            status:
              role === "STUDENT"
                ? UserAccountStatus.ACTIVE
                : UserAccountStatus.PENDING_VERIFICATION,
            isMinor,
            isActive: true,
          },
        });

        // Record consent
        await tx.consentRecord.create({
          data: {
            userId: u.id,
            consentType: isMinor
              ? "PARENTAL_GUARDIAN_CONSENT"
              : "TERMS_AND_DATA_PROCESSING",
            isGranted: isMinor ? !!guardianConsent : true,
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
            userAgent: req.headers.get("user-agent") || "unknown",
          },
        });

        // Student Profile
        if (role === "STUDENT") {
          const profile = await tx.studentProfile.create({
            data: {
              userId: u.id,
              educationStage: stage as EducationStage,
              currentStream: (currentStream as EducationalStream) || EducationalStream.UNDECIDED,
              institutionName: institutionName || null,
              city: city || null,
              state: state || null,
              guardianConsent: !!guardianConsent,
            },
          });

          await tx.privacyPreference.create({
            data: {
              studentProfileId: profile.id,
              isProfilePublic: false,
              allowRecruiterView: !isMinor, // Strict minor lock
              allowAnalytics: true,
            },
          });
        }

        // Organization Profile (Institution or Employer)
        if (role === "INSTITUTION_ADMIN" || role === "EMPLOYER_ADMIN") {
          const orgSlug = (organizationName || name)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-") + "-" + Math.floor(1000 + Math.random() * 9000);

          const org = await tx.organization.create({
            data: {
              name: organizationName || name,
              slug: orgSlug,
              orgType: (orgType as OrgType) || (role === "INSTITUTION_ADMIN" ? OrgType.COLLEGE_UNIVERSITY : OrgType.CORPORATE_EMPLOYER),
              verificationStatus: VerificationStatus.PENDING_REVIEW,
              officialEmail: email,
              city: city || "New Delhi",
              state: state || "Delhi",
              isVerified: false,
            },
          });

          await tx.organizationMember.create({
            data: {
              organizationId: org.id,
              userId: u.id,
              roleInOrg: role as UserRoleType,
              isLead: true,
              title: "Authorized Representative",
            },
          });
        }

        return u;
      });

      // Refetch full user data
      const fullUser = await db.user.findUnique({
        where: { id: userRecord.id },
        include: {
          studentProfile: true,
          orgMemberships: { include: { organization: true } },
        },
      });

      if (fullUser) {
        createdUser = {
          id: fullUser.id,
          email: fullUser.email,
          name: fullUser.name,
          role: fullUser.role,
          status: fullUser.status,
          isMinor: fullUser.isMinor,
          studentProfile: fullUser.studentProfile
            ? {
                id: fullUser.studentProfile.id,
                educationStage: fullUser.studentProfile.educationStage,
                currentStream: fullUser.studentProfile.currentStream,
                onboardingCompleted: fullUser.studentProfile.onboardingCompleted,
                careerReadinessIndex: fullUser.studentProfile.careerReadinessIndex,
                institutionName: fullUser.studentProfile.institutionName,
              }
            : null,
          organizations: fullUser.orgMemberships.map((m) => ({
            id: m.organization.id,
            name: m.organization.name,
            slug: m.organization.slug,
            roleInOrg: m.roleInOrg,
            isVerified: m.organization.isVerified,
          })),
        };

        // Mirror to devStore for local resilience and test compatibility
        devStore.saveUser({ ...createdUser, passwordHash });
        if (role === "STUDENT" && createdUser.studentProfile) {
          devStore.saveProfile({
            id: createdUser.studentProfile.id,
            userId: createdUser.id,
            educationStage: stage,
            currentStream: currentStream || "UNDECIDED",
            onboardingCompleted: false,
            careerReadinessIndex: 0,
            user: { name, email },
            interests: [],
            careerGoals: [],
            skills: [],
          });
        }
      }
    } else {
      // Offline fallback: check devStore for existing user
      const existingOffline = devStore.getUserByEmail(email);
      if (existingOffline) {
        return NextResponse.json(
          { error: "An account with this email address already exists." },
          { status: 409 }
        );
      }

      const fallbackId = "fallback-user-" + Date.now();
      const fallbackProfId = "fallback-prof-" + Date.now();
      createdUser = {
        id: fallbackId,
        email,
        name,
        role: role as UserRoleType,
        status:
          role === "STUDENT"
            ? UserAccountStatus.ACTIVE
            : UserAccountStatus.PENDING_VERIFICATION,
        isMinor,
        studentProfile:
          role === "STUDENT"
            ? {
                id: fallbackProfId,
                educationStage: stage as EducationStage,
                currentStream: (currentStream as EducationalStream) || EducationalStream.UNDECIDED,
                onboardingCompleted: false,
                careerReadinessIndex: 0,
                institutionName: institutionName || null,
              }
            : null,
        organizations:
          role !== "STUDENT"
            ? [
                {
                  id: "fallback-org-" + Date.now(),
                  name: organizationName || name,
                  slug: "fallback-org",
                  roleInOrg: role as UserRoleType,
                  isVerified: false,
                },
              ]
            : [],
      };

      // Persist in devStore so user survives restarts
      devStore.saveUser({ ...createdUser, passwordHash });
      if (role === "STUDENT") {
        devStore.saveProfile({
          id: fallbackProfId,
          userId: fallbackId,
          educationStage: stage,
          currentStream: currentStream || "UNDECIDED",
          onboardingCompleted: false,
          careerReadinessIndex: 0,
          user: { name, email },
          interests: [],
          careerGoals: [],
          userSkills: [],
          roadmaps: [],
          dailyMissions: [],
        });
      } else if (role === "INSTITUTION_ADMIN") {
        const orgId = createdUser.organizations[0]?.id || "fallback-inst-" + Date.now();
        devStore.saveInstitution({
          id: orgId,
          name: organizationName || name,
          slug: (organizationName || name).toLowerCase().replace(/[^a-z0-9]/g, "-"),
          type: orgType || "COLLEGE_UNIVERSITY",
          city: city || "New Delhi",
          state: state || "Delhi",
          officialEmail: email,
          verificationStatus: "PENDING_REVIEW",
          isVerified: false,
        });
      } else if (role === "EMPLOYER_ADMIN") {
        const orgId = createdUser.organizations[0]?.id || "fallback-emp-" + Date.now();
        devStore.saveEmployerOrganization({
          id: orgId,
          name: organizationName || name,
          slug: (organizationName || name).toLowerCase().replace(/[^a-z0-9]/g, "-"),
          industry: industry || orgType || "Corporate",
          officialEmail: email,
          city: city || "New Delhi",
          state: state || "Delhi",
          isVerified: false,
        });
      }
    }

    if (!createdUser) {
      return NextResponse.json(
        { error: "Could not create user account." },
        { status: 500 }
      );
    }

    // 3. Create Session & Set Cookie
    const session = await createDatabaseSession(createdUser.id, false);
    if (!conn.connected) {
      storeFallbackSession(session.token, createdUser, session.expires);
    }

    const response = NextResponse.json({
      success: true,
      message: "Account registered successfully.",
      user: createdUser,
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
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Registration service encountered an error.", details: err.message },
      { status: 500 }
    );
  }
}
