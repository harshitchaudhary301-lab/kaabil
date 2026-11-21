import { describe, it, expect, beforeEach } from "vitest";
import { SkillGapEngine } from "@/lib/skill-gap/skill-gap-engine";
import { AssessmentEngine } from "@/lib/assessment/assessment-engine";
import { PassportService } from "@/lib/passport/passport-service";
import { CredentialService } from "@/lib/passport/credential-service";
import { PassportSharingService } from "@/lib/passport/sharing-service";
import { CareerReadinessEngine } from "@/lib/readiness/cri-engine";
import { devStore } from "@/lib/dev-store";

describe("Unified Student Intelligence Engine — End-to-End Integration (Milestone D2.4)", () => {
  const profileId = "demo-profile-id";

  beforeEach(() => {
    // Ensure test environment initialized
    AssessmentEngine.initializeAssessmentBank();
  });

  it("executes the complete closed-loop feedback lifecycle: Gap -> Assessment -> Evidence -> Passport -> Re-evaluation", async () => {
    // 1. Initial Gap Analysis
    const initialGap = await SkillGapEngine.analyzeGaps(profileId, "ai-systems-engineer");
    expect(initialGap).toBeDefined();
    const initialCoverage = initialGap.overallCoveragePercent;

    // 2. Identify an assessment challenge for an unverified skill
    const targetSkill = "Data Structures & Algorithms";
    const asm = devStore.getAssessmentBySlug("algorithmic-thinking-python");
    expect(asm).toBeDefined();

    // 3. Student takes the assessment and passes
    const attempt = await AssessmentEngine.startAttempt(profileId, asm.id);
    expect(attempt).toBeDefined();

    // Build perfect answers
    const answers: Record<string, { selectedOptionKey: string }> = {};
    for (const q of asm.questions) {
      const correct = q.options.find((o: any) => o.isCorrect);
      if (correct) {
        answers[q.id] = { selectedOptionKey: correct.optionKey };
      }
    }

    const submission = await AssessmentEngine.submitAttempt(
      attempt.id,
      profileId,
      answers
    );

    expect(submission.passed).toBe(true);
    expect(submission.evidenceGenerated).toBe(true);
    expect(submission.evidenceId).toBeDefined();

    // 4. Verify that SkillEvidence is recorded
    const evidences = devStore.getSkillEvidences(profileId);
    const dsaEvidence = evidences.find((e) => e.id === submission.evidenceId);
    expect(dsaEvidence).toBeDefined();
    expect(dsaEvidence.isVerified).toBe(true);
    expect(dsaEvidence.verificationHash).toBeDefined();

    // 5. Verify that Digital Skill Passport auto-minted the signed credential
    const passport = await PassportService.generatePassport(profileId);
    expect(passport).toBeDefined();
    expect(passport.credentials.length).toBeGreaterThan(0);

    const dsaCred = passport.credentials.find(
      (c) => c.evidenceId === submission.evidenceId || c.title.includes("Data Structures")
    );
    expect(dsaCred).toBeDefined();
    expect(dsaCred?.status).toBe("ACTIVE");

    // Cryptographic signature verification
    const sigCheck = CredentialService.verifyCredential(dsaCred!);
    expect(sigCheck.isValid).toBe(true);
    expect(sigCheck.signatureValid).toBe(true);
    expect(sigCheck.hashValid).toBe(true);

    // 6. Re-evaluate Skill Gap Analysis: should now mark the skill as DEMONSTRATED
    const updatedGap = await SkillGapEngine.analyzeGaps(profileId, "ai-systems-engineer");
    expect(updatedGap).toBeDefined();

    const dsaGap = updatedGap.skillGaps.find(
      (g) => g.skillName.toLowerCase() === targetSkill.toLowerCase()
    );
    expect(dsaGap).toBeDefined();
    expect(dsaGap?.gapStatus).toBe("DEMONSTRATED");
    expect(dsaGap?.gapSeverity).toBe("NONE");

    // Coverage percentage should have increased or remained high
    expect(updatedGap.overallCoveragePercent).toBeGreaterThanOrEqual(initialCoverage);

    // 7. Adult student generates QR share link and third party verifies authentic passport
    const { token } = await PassportSharingService.createShareToken({
      studentProfileId: profileId,
      expiryDays: 7,
    });
    expect(token).toBeDefined();

    const publicView = await PassportSharingService.verifyPublicShareToken(token);
    expect(publicView.isValid).toBe(true);
    expect(publicView.student.displayName).toBe("Aryan Sharma");
    expect(publicView.verifiedCredentials.length).toBeGreaterThan(0);
    expect(publicView.disclaimer).toContain("NOT government-issued");
  });

  it("maintains cross-account isolation and ownership boundaries", async () => {
    const studentA = "profile-alice-isolated";
    const studentB = "profile-bob-isolated";

    devStore.saveProfile({
      id: studentA,
      userId: "user-alice",
      educationStage: "UNDERGRADUATE",
      currentStream: "COMMERCE",
      onboardingCompleted: true,
      careerReadinessIndex: 70,
      user: { name: "Alice Commerce", email: "alice@kaabil.in" },
    });

    devStore.saveProfile({
      id: studentB,
      userId: "user-bob",
      educationStage: "UNDERGRADUATE",
      currentStream: "LAW",
      onboardingCompleted: true,
      careerReadinessIndex: 65,
      user: { name: "Bob Legal", email: "bob@kaabil.in" },
    });

    // Mint credential for Alice
    const aliceCred = CredentialService.issueCredential({
      studentProfileId: studentA,
      credentialType: "SKILL_ASSESSMENT",
      title: "Alice Accounting Credential",
      description: "Financial Accounting verification",
      skillName: "Financial Accounting",
    });
    devStore.saveCredential(studentA, aliceCred);

    // Bob should not see Alice's credentials
    const bobCreds = PassportService.getCredentials(studentB);
    expect(bobCreds.some((c) => c.id === aliceCred.id)).toBe(false);

    // Bob cannot revoke Alice's credential
    const revoked = PassportService.revokeCredential(studentB, aliceCred.id);
    expect(revoked).toBeNull();

    // Alice's credential remains active
    const aliceCredRetrieved = devStore.getCredential(studentA, aliceCred.id);
    expect(aliceCredRetrieved.status).toBe("ACTIVE");
  });
});
