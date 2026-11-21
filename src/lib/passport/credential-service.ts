// ==============================================================================
// KAABIL (काबिल) — Digital Skill Passport: Credential Service
// Cryptographic credential signing and verification using Node.js crypto.
// Provides tamper-evident, verifiable credentials for student achievements.
// ==============================================================================

import crypto from "crypto";

const SIGNING_SECRET =
  process.env.CREDENTIAL_SIGNING_SECRET || "kaabil-dev-credential-secret-2026";
const ISSUER_NAME = "KAABIL Platform (काबिल)";
const ISSUER_VERSION = "v1.0";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CredentialType =
  | "SKILL_ASSESSMENT"   // Passed a KAABIL assessment
  | "READINESS_SNAPSHOT" // CRI score checkpoint
  | "LEARNING_MILESTONE" // Completed roadmap milestone
  | "MISSION_ACHIEVEMENT" // Daily missions achievement
  | "INDUSTRY_CHALLENGE"  // Industry challenge project evaluation
  | "SELF_DECLARATION";  // Student self-reported

export type CredentialStatus = "ACTIVE" | "REVOKED" | "EXPIRED";

export interface KaabilCredential {
  id: string;
  studentProfileId: string;
  credentialType: CredentialType;
  status: CredentialStatus;

  // Content
  title: string;
  description: string;
  skillName?: string;
  skillsVerified?: string[];
  scorePercentage?: number;
  credentialLevel?: string;
  issuerCategory?: string;
  stream?: string;

  // Evidence chain
  evidenceId?: string;
  evidenceIds?: string[];
  assessmentAttemptId?: string;

  // Cryptographic integrity
  digitalSignature: string;   // HMAC-SHA256 of credential data
  verificationHash: string;   // SHA-256 of full payload
  signedPayload: string;      // JSON of signed fields

  // Issuer
  issuerName: string;
  issuerVersion: string;

  // Timestamps
  issuedAt: string;
  expiresAt?: string;
  revokedAt?: string;

  // Metadata
  metadata: Record<string, any>;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class CredentialService {
  /**
   * Sign a credential payload and return the fully-formed KaabilCredential.
   */
  static issueCredential(params: {
    studentProfileId: string;
    credentialType?: CredentialType;
    title: string;
    description?: string;
    skillName?: string;
    skillsVerified?: string[];
    scorePercentage?: number;
    evidenceId?: string;
    evidenceIds?: string[];
    assessmentAttemptId?: string;
    credentialLevel?: string;
    issuerName?: string;
    issuerCategory?: string;
    stream?: string;
    metadata?: Record<string, any>;
    expiresInDays?: number;
  }): KaabilCredential {
    const id = crypto.randomUUID();
    const issuedAt = new Date().toISOString();

    let expiresAt: string | undefined;
    if (params.expiresInDays && params.expiresInDays > 0) {
      const exp = new Date();
      exp.setDate(exp.getDate() + params.expiresInDays);
      expiresAt = exp.toISOString();
    }

    // Build the deterministic signing payload from key fields
    const signingFields: Record<string, any> = {
      id,
      studentProfileId: params.studentProfileId,
      credentialType: params.credentialType,
      title: params.title,
      skillName: params.skillName ?? null,
      scorePercentage: params.scorePercentage ?? null,
      issuedAt,
    };
    const signedPayload = CredentialService.generateSigningPayload(signingFields);

    // Create HMAC-SHA256 digital signature of the signed payload
    const digitalSignature = CredentialService.sign(signedPayload);

    // Build the full credential (without verificationHash yet)
    const credential: KaabilCredential = {
      id,
      studentProfileId: params.studentProfileId,
      credentialType: params.credentialType || "SKILL_ASSESSMENT",
      status: "ACTIVE",
      title: params.title,
      description: params.description || "",
      skillName: params.skillName,
      skillsVerified: params.skillsVerified,
      scorePercentage: params.scorePercentage,
      evidenceId: params.evidenceId,
      evidenceIds: params.evidenceIds,
      assessmentAttemptId: params.assessmentAttemptId,
      digitalSignature,
      verificationHash: "", // placeholder — computed below
      signedPayload,
      issuerName: params.issuerName || ISSUER_NAME,
      issuerCategory: params.issuerCategory,
      credentialLevel: params.credentialLevel,
      issuerVersion: ISSUER_VERSION,
      stream: params.stream,
      issuedAt,
      expiresAt,
      revokedAt: undefined,
      metadata: params.metadata ?? {},
    };

    // Create SHA-256 verification hash of the full credential JSON
    credential.verificationHash = CredentialService.hash(
      JSON.stringify(credential)
    );

    return credential;
  }

  /**
   * Verify a credential's integrity: signature validity, hash integrity,
   * expiration, and revocation status.
   */
  static verifyCredential(credential: KaabilCredential): {
    isValid: boolean;
    signatureValid: boolean;
    hashValid: boolean;
    isExpired: boolean;
    isRevoked: boolean;
    verificationDetails: string;
  } {
    // 1. Verify HMAC-SHA256 signature against the signedPayload
    const expectedSignature = CredentialService.sign(credential.signedPayload);
    const signatureValid = expectedSignature === credential.digitalSignature;

    // 2. Verify SHA-256 hash of the full credential
    //    Re-build the credential with an empty verificationHash to replicate
    //    the hash that was computed at issuance time.
    const credentialCopy = { ...credential, verificationHash: "" };
    const expectedHash = CredentialService.hash(JSON.stringify(credentialCopy));
    const hashValid = expectedHash === credential.verificationHash;

    // 3. Check expiration
    const isExpired = credential.expiresAt
      ? new Date(credential.expiresAt) < new Date()
      : false;

    // 4. Check revocation
    const isRevoked = credential.status === "REVOKED";

    // Build overall validity
    const isValid = signatureValid && hashValid && !isExpired && !isRevoked;

    // Readable details
    const details: string[] = [];
    if (!signatureValid) details.push("Digital signature mismatch — credential may have been tampered with");
    if (!hashValid) details.push("Verification hash mismatch — credential payload was modified after issuance");
    if (isExpired) details.push(`Credential expired at ${credential.expiresAt}`);
    if (isRevoked) details.push(`Credential was revoked at ${credential.revokedAt}`);
    if (isValid) details.push("Credential is valid and intact");

    return {
      isValid,
      signatureValid,
      hashValid,
      isExpired,
      isRevoked,
      verificationDetails: details.join("; "),
    };
  }

  /**
   * Revoke a credential: sets status to REVOKED, stamps revokedAt, and
   * re-signs the credential with updated data.
   */
  static revokeCredential(credential: KaabilCredential): KaabilCredential {
    const revoked: KaabilCredential = {
      ...credential,
      status: "REVOKED",
      revokedAt: new Date().toISOString(),
    };

    // Re-generate the signing payload to include updated status
    const signingFields: Record<string, any> = {
      id: revoked.id,
      studentProfileId: revoked.studentProfileId,
      credentialType: revoked.credentialType,
      title: revoked.title,
      skillName: revoked.skillName ?? null,
      scorePercentage: revoked.scorePercentage ?? null,
      issuedAt: revoked.issuedAt,
      status: revoked.status,
      revokedAt: revoked.revokedAt,
    };
    revoked.signedPayload = CredentialService.generateSigningPayload(signingFields);
    revoked.digitalSignature = CredentialService.sign(revoked.signedPayload);

    // Re-compute verification hash
    revoked.verificationHash = "";
    revoked.verificationHash = CredentialService.hash(JSON.stringify(revoked));

    return revoked;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Generate a deterministic signing payload by sorting object keys and
   * stringifying. This ensures the same fields always produce the same output.
   */
  private static generateSigningPayload(fields: Record<string, any>): string {
    const sorted: Record<string, any> = {};
    for (const key of Object.keys(fields).sort()) {
      sorted[key] = fields[key];
    }
    return JSON.stringify(sorted);
  }

  /**
   * Create an HMAC-SHA256 signature of the given payload using the
   * platform signing secret.
   */
  private static sign(payload: string): string {
    return crypto
      .createHmac("sha256", SIGNING_SECRET)
      .update(payload)
      .digest("hex");
  }

  /**
   * Create a SHA-256 hash of arbitrary data.
   */
  private static hash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }
}
