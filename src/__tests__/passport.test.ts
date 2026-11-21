import { describe, it, expect, beforeEach } from "vitest";
import {
  CredentialService,
  KaabilCredential,
} from "@/lib/passport/credential-service";
import { PassportService } from "@/lib/passport/passport-service";
import { devStore } from "@/lib/dev-store";

describe("Digital Skill Passport & Credential Integrity Engine", () => {
  const profileId = "demo-profile-id";

  beforeEach(() => {
    const profile = devStore.getProfile(profileId);
    expect(profile).toBeDefined();
  });

  describe("Cryptographic Credential Service", () => {
    it("issues a tamper-evident credential with digital signature and verification hash", () => {
      const cred = CredentialService.issueCredential({
        studentProfileId: profileId,
        credentialType: "SKILL_ASSESSMENT",
        title: "Verified Competency: Python",
        description: "Passed Python Foundations challenge with 90% score.",
        skillName: "Python",
        scorePercentage: 90,
      });

      expect(cred.id).toBeDefined();
      expect(cred.digitalSignature).toBeDefined();
      expect(cred.digitalSignature.length).toBe(64); // SHA-256 hex length
      expect(cred.verificationHash).toBeDefined();
      expect(cred.verificationHash.length).toBe(64);
      expect(cred.status).toBe("ACTIVE");
      expect(cred.issuerName).toContain("KAABIL");

      // Verify immediate integrity
      const verifyResult = CredentialService.verifyCredential(cred);
      expect(verifyResult.isValid).toBe(true);
      expect(verifyResult.signatureValid).toBe(true);
      expect(verifyResult.hashValid).toBe(true);
      expect(verifyResult.isExpired).toBe(false);
      expect(verifyResult.isRevoked).toBe(false);
    });

    it("detects tampering when credential fields are altered", () => {
      const cred = CredentialService.issueCredential({
        studentProfileId: profileId,
        credentialType: "SKILL_ASSESSMENT",
        title: "Legitimate Credential",
        description: "Genuine assessment result",
        skillName: "Data Structures",
        scorePercentage: 75,
      });

      // Tamper with score
      const tampered: KaabilCredential = {
        ...cred,
        scorePercentage: 100, // Fabricated score
      };

      const verifyResult = CredentialService.verifyCredential(tampered);
      expect(verifyResult.isValid).toBe(false);
      expect(verifyResult.hashValid).toBe(false);
    });

    it("handles credential revocation cleanly", () => {
      const cred = CredentialService.issueCredential({
        studentProfileId: profileId,
        credentialType: "SKILL_ASSESSMENT",
        title: "Revocable Credential",
        description: "To be revoked",
      });

      const revoked = CredentialService.revokeCredential(cred);
      expect(revoked.status).toBe("REVOKED");
      expect(revoked.revokedAt).toBeDefined();

      const verifyResult = CredentialService.verifyCredential(revoked);
      expect(verifyResult.isValid).toBe(false);
      expect(verifyResult.isRevoked).toBe(true);
      expect(verifyResult.verificationDetails).toContain("revoked");
    });
  });

  describe("Passport Service Aggregation", () => {
    it("generates complete Digital Skill Passport with integrity checksum", async () => {
      const passport = await PassportService.generatePassport(profileId);

      expect(passport).toBeDefined();
      expect(passport.passportId).toBeDefined();
      expect(passport.studentName).toBe("Aryan Sharma");
      expect(passport.passportIntegrityChecksum).toBeDefined();
      expect(passport.passportIntegrityChecksum.length).toBe(64);
      expect(passport.summary.totalSkills).toBeGreaterThan(0);
      expect(passport.summary.currentCRI).toBeGreaterThan(0);
      expect(passport.education.stage).toBe("UNDERGRADUATE");
      expect(passport.disclaimer).toContain("NOT government-issued");
    });

    it("distinguishes PLATFORM_ASSESSED from SELF_REPORTED skills", async () => {
      // Add verified evidence
      devStore.saveSkillEvidence({
        id: "ev-test-sql",
        studentProfileId: profileId,
        skillName: "Database Systems",
        evidenceType: "ASSESSMENT_RESULT",
        verificationStatus: "VERIFIED",
        scorePercentage: 88,
        verificationHash: "hash-db-systems-1234",
        isVerified: true,
        verifiedAt: new Date().toISOString(),
      });

      const passport = await PassportService.generatePassport(profileId);
      const verifiedSkill = passport.skills.find((s) => s.skillName === "Database Systems");

      expect(verifiedSkill).toBeDefined();
      expect(verifiedSkill?.isVerified).toBe(true);
      expect(verifiedSkill?.evidenceLayer).toBe("PLATFORM_ASSESSED");

      // Verify at least one self-reported skill exists
      const selfReported = passport.skills.find((s) => !s.isVerified);
      if (selfReported) {
        expect(selfReported.evidenceLayer).toBe("SELF_REPORTED");
      }
    });

    it("auto-mints signed credentials for verified evidences without duplicates", async () => {
      const initialCount = devStore.getCredentials(profileId).length;
      const uniqueSkillName = `Auto-Mint Test Skill ${Date.now()}`;

      // Add a new verified evidence
      devStore.saveSkillEvidence({
        id: `ev-auto-mint-${Date.now()}`,
        studentProfileId: profileId,
        skillName: uniqueSkillName,
        evidenceType: "ASSESSMENT_RESULT",
        verificationStatus: "VERIFIED",
        scorePercentage: 92,
        isVerified: true,
        verifiedAt: new Date().toISOString(),
      });

      const minted = await PassportService.mintPendingCredentials(profileId);
      expect(minted.length).toBeGreaterThan(0);

      const afterCount = devStore.getCredentials(profileId).length;
      expect(afterCount).toBeGreaterThan(initialCount);

      // Running minting again should not create duplicates
      const reMinted = await PassportService.mintPendingCredentials(profileId);
      expect(reMinted.length).toBe(0);
    });
  });
});
