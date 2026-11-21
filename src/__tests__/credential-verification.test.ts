import { describe, it, expect, beforeEach } from "vitest";
import { PassportSharingService } from "@/lib/passport/sharing-service";
import { devStore } from "@/lib/dev-store";

describe("Passport Sharing & QR Verification Service (Milestone D2.3)", () => {
  const adultProfileId = "demo-profile-id";
  const minorProfileId = "minor-test-profile";

  beforeEach(() => {
    // Setup adult profile
    const adult = devStore.getProfile(adultProfileId);
    expect(adult).toBeDefined();

    // Setup minor profile for DPDP testing
    devStore.saveProfile({
      id: minorProfileId,
      userId: "minor-user-id",
      educationStage: "CLASS_9",
      currentStream: "UNDECIDED",
      onboardingCompleted: true,
      careerReadinessIndex: 45,
      isMinor: true,
      user: { name: "Aarav Minor", email: "aarav.minor@kaabil.in" },
      userSkills: [{ skill: { name: "Basic Math", category: "FOUNDATIONAL" }, isVerified: false }],
    });
  });

  it("generates an expiring share token for an adult student", async () => {
    const result = await PassportSharingService.createShareToken({
      studentProfileId: adultProfileId,
      expiryDays: 7,
    });

    expect(result.token).toBeDefined();
    expect(result.token.length).toBe(48); // 24 bytes in hex = 48 chars
    expect(result.shareUrl).toContain(`/verify/${result.token}`);
    expect(result.expiresAt).toBeDefined();
  });

  it("strictly blocks public sharing for under-18 minors under DPDP Act 2023", async () => {
    await expect(
      PassportSharingService.createShareToken({
        studentProfileId: minorProfileId,
        isMinor: true,
      })
    ).rejects.toThrow(/UNDER_18_PROTECTION/);

    // Also blocks if educationStage is CLASS_9 even if isMinor flag was omitted
    await expect(
      PassportSharingService.createShareToken({
        studentProfileId: minorProfileId,
      })
    ).rejects.toThrow(/UNDER_18_PROTECTION/);
  });

  it("verifies a valid share token and returns sanitized authentic passport", async () => {
    const { token } = await PassportSharingService.createShareToken({
      studentProfileId: adultProfileId,
      expiryDays: 5,
    });

    const verified = await PassportSharingService.verifyPublicShareToken(token);

    expect(verified.isValid).toBe(true);
    expect(verified.isExpired).toBe(false);
    expect(verified.isRevoked).toBe(false);
    expect(verified.student.displayName).toBe("Aryan Sharma");
    expect(verified.student.streamTitle).toBeDefined();
    expect(verified.passportIntegrityChecksum).toBeDefined();
    expect(verified.disclaimer).toContain("NOT government-issued");
  });

  it("detects expired share tokens", async () => {
    const { token } = await PassportSharingService.createShareToken({
      studentProfileId: adultProfileId,
      expiryDays: 1,
    });

    // Manually set expiration to past
    const record = devStore.getShareToken(token);
    record.expiresAt = new Date(Date.now() - 3600000).toISOString();
    devStore.saveShareToken(token, record);

    const verified = await PassportSharingService.verifyPublicShareToken(token);
    expect(verified.isValid).toBe(false);
    expect(verified.isExpired).toBe(true);
    expect(verified.verificationMessage).toContain("expired");
  });

  it("detects revoked share tokens", async () => {
    const { token } = await PassportSharingService.createShareToken({
      studentProfileId: adultProfileId,
      expiryDays: 7,
    });

    // Revoke token
    const revoked = PassportSharingService.revokeToken(token);
    expect(revoked).toBe(true);

    const verified = await PassportSharingService.verifyPublicShareToken(token);
    expect(verified.isValid).toBe(false);
    expect(verified.isRevoked).toBe(true);
    expect(verified.verificationMessage).toContain("revoked");
  });

  it("returns invalid status for non-existent token", async () => {
    const verified = await PassportSharingService.verifyPublicShareToken("invalid-token-1234");
    expect(verified.isValid).toBe(false);
    expect(verified.verificationMessage).toContain("Invalid");
  });

  it("increments audit view count on successful verification", async () => {
    const { token } = await PassportSharingService.createShareToken({
      studentProfileId: adultProfileId,
    });

    const initialRecord = devStore.getShareToken(token);
    expect(initialRecord.viewsCount).toBe(0);

    await PassportSharingService.verifyPublicShareToken(token);
    const updatedRecord = devStore.getShareToken(token);
    expect(updatedRecord.viewsCount).toBe(1);
    expect(updatedRecord.lastViewedAt).toBeDefined();
  });
});
