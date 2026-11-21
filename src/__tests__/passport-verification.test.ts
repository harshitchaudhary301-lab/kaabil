import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import { CredentialService, KaabilCredential } from "@/lib/passport/credential-service";
import { PassportSharingService } from "@/lib/passport/sharing-service";
import { devStore } from "@/lib/dev-store";

describe("Digital Skill Passport Verification & Cryptographic Integrity (Part F2)", () => {
  beforeEach(() => {
    devStore.reset();
  });

  it("verifies genuine HMAC-SHA256 digital signature and SHA-256 content hash", () => {
    const issued = CredentialService.issueCredential({
      studentProfileId: "sp-aryan-01",
      title: "Certified Clinical Biochemistry Case Analyst",
      issuerCategory: "INDUSTRY_EMPLOYER",
      issuerName: "Apex Diagnostics & Healthcare",
      stream: "MEDICAL_PCB",
      credentialLevel: "PROFICIENT",
      evidenceIds: ["ev-01", "ev-02"],
      skillsVerified: ["Clinical Biochemistry", "Phlebotomy"],
    });

    const verification = CredentialService.verifyCredential(issued);
    expect(verification.isValid).toBe(true);
    expect(verification.signatureValid).toBe(true);
    expect(verification.hashValid).toBe(true);
    expect(verification.isExpired).toBe(false);
    expect(verification.isRevoked).toBe(false);
  });

  it("detects payload tampering when skill, title, or evidence count is altered", () => {
    const issued = CredentialService.issueCredential({
      studentProfileId: "sp-aryan-01",
      title: "Basic Medical Lab Assistant",
      issuerCategory: "INDUSTRY_EMPLOYER",
      issuerName: "Apex Diagnostics & Healthcare",
      stream: "MEDICAL_PCB",
      credentialLevel: "BEGINNER",
      evidenceIds: ["ev-01"],
      skillsVerified: ["Phlebotomy"],
    });

    // Malicious actor tampers with title and level to claim expert status
    const tampered: KaabilCredential = {
      ...issued,
      title: "Senior Chief Medical Consultant",
      credentialLevel: "EXPERT",
    };

    const verification = CredentialService.verifyCredential(tampered);
    expect(verification.isValid).toBe(false);
    expect(verification.hashValid).toBe(false); // Hash mismatch detected!
  });

  it("detects forged signatures created without platform secret", () => {
    const issued = CredentialService.issueCredential({
      studentProfileId: "sp-aryan-01",
      title: "Certified Python Developer",
      issuerCategory: "INDUSTRY_EMPLOYER",
      issuerName: "Tech Corp",
      stream: "NON_MEDICAL_PCM",
      credentialLevel: "PROFICIENT",
      evidenceIds: ["ev-01"],
      skillsVerified: ["Python"],
    });

    // Attacker signs payload with their own fake key
    const forgedSignature = crypto
      .createHmac("sha256", "malicious-attacker-forged-secret-key")
      .update(issued.signedPayload)
      .digest("hex");

    const forgedCredential = {
      ...issued,
      digitalSignature: forgedSignature,
    };

    const verification = CredentialService.verifyCredential(forgedCredential);
    expect(verification.isValid).toBe(false);
    expect(verification.signatureValid).toBe(false);
  });

  it("flags revoked credentials as invalid", () => {
    const issued = CredentialService.issueCredential({
      studentProfileId: "sp-aryan-01",
      title: "Certified Phlebotomist",
      issuerCategory: "HEALTHCARE_PARTNER",
      issuerName: "Apex Diagnostics",
      stream: "MEDICAL_PCB",
      credentialLevel: "PROFICIENT",
      evidenceIds: ["ev-01"],
      skillsVerified: ["Phlebotomy"],
    });

    devStore.saveCredential("sp-aryan-01", issued);

    // Revoke credential
    const revoked = CredentialService.revokeCredential(issued);
    expect(revoked.status).toBe("REVOKED");

    devStore.saveCredential("sp-aryan-01", revoked);

    const credInStore = devStore.getCredential("sp-aryan-01", issued.id);
    const verification = CredentialService.verifyCredential(credInStore);
    expect(verification.isValid).toBe(false);
    expect(verification.isRevoked).toBe(true);
  });

  it("verifies public share tokens generated for employer verification", async () => {
    // Generate share token with 30-day expiration
    const shareResult = await PassportSharingService.createShareToken({
      studentProfileId: "sp-aryan-01",
      expiryDays: 30,
    });

    expect(shareResult.token).toBeDefined();

    // Verify token
    const verifiedView = await PassportSharingService.verifyPublicShareToken(shareResult.token);
    expect(verifiedView.isValid).toBe(true);
    expect(verifiedView.student.displayName).toBe("Aryan Sharma");
    expect(verifiedView.passportIntegrityChecksum).toBeDefined();
  });
});
