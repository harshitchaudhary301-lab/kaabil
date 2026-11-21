// ==============================================================================
// KAABIL (काबिल) — Authentication & Security Unit Tests
// Tests password hashing, rate limiting, RBAC, and DPDP minor protection
// ==============================================================================

import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
} from "../lib/auth/password";
import { evaluatePasswordStrengthClient } from "../lib/auth/client-password";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "../lib/auth/rate-limiter";
import { isMinorStage, buildRecruiterMinorProtectionFilter } from "../lib/auth/rbac";
import { EducationStage } from "@prisma/client";

describe("KAABIL Security: Native Scrypt Password Hashing", () => {
  it("should generate valid scrypt format with unique salt", async () => {
    const pass = "KaabilSuperSecret2026!";
    const hash1 = await hashPassword(pass);
    const hash2 = await hashPassword(pass);

    expect(hash1).toMatch(/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/);
    expect(hash2).toMatch(/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/);
    // Uniqueness: Different random salts must produce different hashes
    expect(hash1).not.toBe(hash2);
  });

  it("should verify correct password successfully", async () => {
    const pass = "StrongPassword@123";
    const hash = await hashPassword(pass);

    const match = await verifyPassword(pass, hash);
    expect(match).toBe(true);
  });

  it("should reject incorrect password safely", async () => {
    const pass = "CorrectPassword123#";
    const hash = await hashPassword(pass);

    const wrongMatch = await verifyPassword("WrongPassword123#", hash);
    expect(wrongMatch).toBe(false);
  });

  it("should return false for malformed or empty hash without throwing", async () => {
    expect(await verifyPassword("test", "")).toBe(false);
    expect(await verifyPassword("test", "plain-text-hash")).toBe(false);
    expect(await verifyPassword("test", "scrypt:invalid")).toBe(false);
  });
});

describe("KAABIL Security: Password Strength Evaluation", () => {
  it("should evaluate weak passwords correctly", () => {
    const result = evaluatePasswordStrengthClient("12345");
    expect(result.score).toBeLessThanOrEqual(2);
    expect(result.label).toBe("Too Weak");
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it("should evaluate strong multi-character passwords as Strong", () => {
    const result = evaluatePasswordStrengthClient("KaabilSecurePass#2026");
    expect(result.score).toBeGreaterThanOrEqual(4);
    expect(result.label).toBe("Strong");
    expect(result.feedback).toHaveLength(0);
  });
});

describe("KAABIL Security: Sliding-Window Rate Limiter", () => {
  it("should track remaining attempts and block upon exceeding limit", () => {
    const testKey = "test-rate-key";
    resetRateLimit(testKey);

    const r0 = checkRateLimit(testKey, 3, 60);
    expect(r0.isAllowed).toBe(true);
    expect(r0.remaining).toBe(3);

    recordFailedAttempt(testKey);
    const r1 = checkRateLimit(testKey, 3, 60);
    expect(r1.isAllowed).toBe(true);
    expect(r1.remaining).toBe(2);

    recordFailedAttempt(testKey);
    const r2 = checkRateLimit(testKey, 3, 60);
    expect(r2.isAllowed).toBe(true);
    expect(r2.remaining).toBe(1);

    recordFailedAttempt(testKey);
    const r3 = checkRateLimit(testKey, 3, 60);
    expect(r3.isAllowed).toBe(false);
    expect(r3.remaining).toBe(0);
    expect(r3.resetInSeconds).toBeGreaterThan(0);

    resetRateLimit(testKey);
  });
});

describe("KAABIL Security & DPDP Act 2023: Minor Protection & RBAC", () => {
  it("should classify secondary and senior secondary school stages as minors", () => {
    expect(isMinorStage(EducationStage.CLASS_8)).toBe(true);
    expect(isMinorStage(EducationStage.CLASS_9)).toBe(true);
    expect(isMinorStage(EducationStage.CLASS_10)).toBe(true);
    expect(isMinorStage(EducationStage.CLASS_11)).toBe(true);
    expect(isMinorStage(EducationStage.CLASS_12)).toBe(true);
  });

  it("should classify college, vocational and working professional stages as adults", () => {
    expect(isMinorStage(EducationStage.DIPLOMA)).toBe(false);
    expect(isMinorStage(EducationStage.ITI)).toBe(false);
    expect(isMinorStage(EducationStage.UNDERGRADUATE)).toBe(false);
    expect(isMinorStage(EducationStage.POSTGRADUATE)).toBe(false);
    expect(isMinorStage(EducationStage.WORKING_PROFESSIONAL)).toBe(false);
    expect(isMinorStage(EducationStage.OTHER)).toBe(false);
  });

  it("should construct recruiter filter that strictly excludes minor students", () => {
    const filter = buildRecruiterMinorProtectionFilter();
    expect(filter.isMinor).toBe(false);
    expect(filter.studentProfile.educationStage.notIn).toContain(EducationStage.CLASS_8);
    expect(filter.studentProfile.educationStage.notIn).toContain(EducationStage.CLASS_12);
    expect(filter.studentProfile.privacyPreference.allowRecruiterView).toBe(true);
  });
});
