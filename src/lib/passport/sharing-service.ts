// ==============================================================================
// KAABIL (काबिल) — Passport Sharing & QR Verification Service
// DPDP Act 2023 Compliant: Strict under-18 sharing lock enforced server-side.
// Generates expiring, revocable, cryptographically signed share tokens for adult students.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import { db, checkDatabaseConnection } from "@/lib/db";
import { PassportService, DigitalSkillPassport } from "./passport-service";
import { CredentialService, KaabilCredential } from "./credential-service";

export interface ShareTokenData {
  token: string;
  studentProfileId: string;
  createdAt: string;
  expiresAt: string;
  isRevoked: boolean;
  revokedAt?: string;
  viewsCount: number;
  lastViewedAt?: string;
  options: {
    includeSkills: boolean;
    includeCredentials: boolean;
    includeAchievements: boolean;
    selectedCredentialIds?: string[];
  };
}

export interface PublicVerifiedPassport {
  isValid: boolean;
  isExpired: boolean;
  isRevoked: boolean;
  verifiedAt: string;
  verificationMessage: string;

  // Sanitized student details (no full address, phone, or raw email)
  student: {
    displayName: string;
    educationStage: string;
    streamTitle: string;
    institutionName?: string;
    careerReadinessIndex: number | null;
  };

  passportId: string;
  passportIntegrityChecksum: string;

  // Verified items
  verifiedSkills: {
    skillName: string;
    category: string;
    proficiencyLevel: number;
    scorePercentage?: number;
    verificationHash?: string;
  }[];

  verifiedCredentials: {
    id: string;
    title: string;
    credentialType: string;
    status: string;
    issuerName: string;
    issuedAt: string;
    digitalSignatureTruncated: string;
    verificationHashTruncated: string;
    isSignatureValid: boolean;
  }[];

  disclaimer: string;
}

const MINOR_STAGES = new Set(["CLASS_8", "CLASS_9", "CLASS_10"]);

export class PassportSharingService {
  /**
   * Generates a new shareable token with server-side minor protection.
   */
  public static async createShareToken(params: {
    studentProfileId: string;
    isMinor?: boolean;
    expiryDays?: number;
    options?: {
      includeSkills?: boolean;
      includeCredentials?: boolean;
      includeAchievements?: boolean;
      selectedCredentialIds?: string[];
    };
  }): Promise<{ token: string; shareUrl: string; expiresAt: string }> {
    // 1. Fetch Profile to verify age / stage
    let profile =
      devStore.getProfile(params.studentProfileId) ||
      devStore.getProfileByUserId(params.studentProfileId) ||
      devStore.getProfileByEmail(params.studentProfileId);

    if (!profile) {
      try {
        const conn = await checkDatabaseConnection();
        if (conn.connected && db) {
          const dbProfile = await db.studentProfile.findFirst({
            where: {
              OR: [
                { id: params.studentProfileId },
                { userId: params.studentProfileId },
              ],
            },
            include: { user: true },
          });

          if (dbProfile) {
            profile = {
              id: dbProfile.id,
              userId: dbProfile.userId,
              educationStage: dbProfile.educationStage,
              currentStream: dbProfile.currentStream,
              isMinor: dbProfile.user?.isMinor ?? false,
              user: dbProfile.user
                ? {
                    id: dbProfile.user.id,
                    name: dbProfile.user.name,
                    email: dbProfile.user.email,
                    isMinor: dbProfile.user.isMinor,
                  }
                : undefined,
            };
            devStore.saveProfile(profile);
          }
        }
      } catch (err) {
        console.warn("[PassportSharingService] DB lookup error:", err);
      }
    }

    if (!profile) {
      throw new Error("Student profile not found.");
    }

    // Server-Side Minor Protection (DPDP Act 2023)
    const isStageMinor = MINOR_STAGES.has(profile.educationStage);
    const isProfileMinor = params.isMinor || profile.isMinor || isStageMinor;

    if (isProfileMinor) {
      throw new Error(
        "UNDER_18_PROTECTION: In compliance with DPDP Act 2023 child safety provisions, public passport sharing and QR verification are restricted for school students under 18. Personal portfolio remains private."
      );
    }

    // 2. Generate random 24-byte crypto token
    const token = crypto.randomBytes(24).toString("hex");
    const expiryDays = params.expiryDays && params.expiryDays > 0 ? params.expiryDays : 7;
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + expiryDays);
    const expiresAt = expDate.toISOString();

    const record: ShareTokenData = {
      token,
      studentProfileId: params.studentProfileId,
      createdAt: new Date().toISOString(),
      expiresAt,
      isRevoked: false,
      viewsCount: 0,
      options: {
        includeSkills: params.options?.includeSkills ?? true,
        includeCredentials: params.options?.includeCredentials ?? true,
        includeAchievements: params.options?.includeAchievements ?? true,
        selectedCredentialIds: params.options?.selectedCredentialIds,
      },
    };

    devStore.saveShareToken(token, record);

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/verify/${token}`;

    return { token, shareUrl, expiresAt };
  }

  /**
   * Validates a public share token and returns a sanitized, verified passport view.
   */
  public static async verifyPublicShareToken(
    token: string
  ): Promise<PublicVerifiedPassport> {
    const record: ShareTokenData | null = devStore.getShareToken(token);

    if (!record) {
      return {
        isValid: false,
        isExpired: false,
        isRevoked: false,
        verifiedAt: new Date().toISOString(),
        verificationMessage: "Invalid or unrecognized verification token.",
        student: {
          displayName: "Unknown",
          educationStage: "Unknown",
          streamTitle: "Unknown",
          careerReadinessIndex: null,
        },
        passportId: "",
        passportIntegrityChecksum: "",
        verifiedSkills: [],
        verifiedCredentials: [],
        disclaimer: "",
      };
    }

    // Check Revocation
    if (record.isRevoked) {
      return {
        isValid: false,
        isExpired: false,
        isRevoked: true,
        verifiedAt: new Date().toISOString(),
        verificationMessage: `This share link was revoked by the student at ${record.revokedAt}.`,
        student: {
          displayName: "Redacted",
          educationStage: "Redacted",
          streamTitle: "Redacted",
          careerReadinessIndex: null,
        },
        passportId: "",
        passportIntegrityChecksum: "",
        verifiedSkills: [],
        verifiedCredentials: [],
        disclaimer: "",
      };
    }

    // Check Expiration
    const isExpired = new Date(record.expiresAt) < new Date();
    if (isExpired) {
      return {
        isValid: false,
        isExpired: true,
        isRevoked: false,
        verifiedAt: new Date().toISOString(),
        verificationMessage: `This verification link expired at ${record.expiresAt}.`,
        student: {
          displayName: "Redacted",
          educationStage: "Redacted",
          streamTitle: "Redacted",
          careerReadinessIndex: null,
        },
        passportId: "",
        passportIntegrityChecksum: "",
        verifiedSkills: [],
        verifiedCredentials: [],
        disclaimer: "",
      };
    }

    // Increment view audit count
    record.viewsCount++;
    record.lastViewedAt = new Date().toISOString();
    devStore.saveShareToken(token, record);

    // Fetch full passport to sanitize
    const fullPassport: DigitalSkillPassport = await PassportService.generatePassport(
      record.studentProfileId
    );

    // Filter only verified skills
    const verifiedSkills = fullPassport.skills
      .filter((s) => s.isVerified)
      .map((s) => ({
        skillName: s.skillName,
        category: s.category,
        proficiencyLevel: s.proficiencyLevel,
        scorePercentage: s.scorePercentage,
        verificationHash: s.verificationHash,
      }));

    // Filter credentials (filter by selected if specified)
    let filteredCreds = fullPassport.credentials.filter((c) => c.status === "ACTIVE");
    if (record.options.selectedCredentialIds?.length) {
      const selected = new Set(record.options.selectedCredentialIds);
      filteredCreds = filteredCreds.filter((c) => selected.has(c.id));
    }

    const verifiedCredentials = filteredCreds.map((c) => {
      const check = CredentialService.verifyCredential(c);
      return {
        id: c.id,
        title: c.title,
        credentialType: c.credentialType,
        status: c.status,
        issuerName: c.issuerName,
        issuedAt: c.issuedAt,
        digitalSignatureTruncated: `${c.digitalSignature.substring(0, 16)}...`,
        verificationHashTruncated: `${c.verificationHash.substring(0, 16)}...`,
        isSignatureValid: check.isValid,
      };
    });

    return {
      isValid: true,
      isExpired: false,
      isRevoked: false,
      verifiedAt: new Date().toISOString(),
      verificationMessage: "Digital credential signatures verified intact by KAABIL Platform.",
      student: {
        displayName: fullPassport.studentName,
        educationStage: fullPassport.education.stage.replace(/_/g, " "),
        streamTitle: fullPassport.education.streamTitle,
        institutionName: fullPassport.education.institutionName,
        careerReadinessIndex: fullPassport.summary.currentCRI,
      },
      passportId: fullPassport.passportId,
      passportIntegrityChecksum: fullPassport.passportIntegrityChecksum,
      verifiedSkills,
      verifiedCredentials,
      disclaimer: fullPassport.disclaimer,
    };
  }

  /**
   * Revokes a share token immediately.
   */
  public static revokeToken(token: string): boolean {
    return devStore.revokeShareToken(token);
  }
}
