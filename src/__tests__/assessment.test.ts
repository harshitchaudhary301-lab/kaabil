// ==============================================================================
// KAABIL (काबिल) — Intelligent Skill Assessment Engine Tests
// Tests 13-stream coverage, objective scoring, rubric, SkillEvidence minting & CRI updates
// ==============================================================================

import { describe, it, expect } from "vitest";
import { AssessmentEngine } from "@/lib/assessment/assessment-engine";
import { KAABIL_ASSESSMENTS } from "@/data/assessmentsData";
import { devStore } from "@/lib/dev-store";

describe("Intelligent Skill Assessment Engine", () => {
  const testProfileId = "demo-profile-id";

  it("covers all 13 educational streams in assessment catalogue with realistic metadata", async () => {
    const list = await AssessmentEngine.getAssessments();
    expect(list.length).toBeGreaterThanOrEqual(13);

    const streams = new Set(list.map((a) => a.stream));
    expect(streams.has("MEDICAL_PCB")).toBe(true);
    expect(streams.has("NON_MEDICAL_PCM")).toBe(true);
    expect(streams.has("COMMERCE")).toBe(true);
    expect(streams.has("ARTS_HUMANITIES")).toBe(true);
    expect(streams.has("LAW")).toBe(true);
    expect(streams.has("MANAGEMENT")).toBe(true);
    expect(streams.has("CREATIVE_ARTS_DESIGN")).toBe(true);
    expect(streams.has("AGRICULTURE")).toBe(true);
    expect(streams.has("VOCATIONAL_SKILLED")).toBe(true);
    expect(streams.has("SPORTS")).toBe(true);
    expect(streams.has("HOSPITALITY_TOURISM")).toBe(true);
    expect(streams.has("INTERDISCIPLINARY")).toBe(true);
    expect(streams.has("UNDECIDED")).toBe(true);
  });

  it("strips isCorrect answers when preparing assessment for student test-taking", async () => {
    const asm = await AssessmentEngine.getAssessmentForTaking("asm-stem-01");
    expect(asm).not.toBeNull();
    expect(asm?.questions.length).toBeGreaterThan(0);

    // Verify answers are stripped
    for (const q of asm!.questions) {
      for (const opt of q.options) {
        expect((opt as any).isCorrect).toBeUndefined();
      }
    }
  });

  it("starts assessment attempt and initializes IN_PROGRESS state", async () => {
    const attempt = await AssessmentEngine.startAttempt(testProfileId, "asm-stem-01");
    expect(attempt).toBeDefined();
    expect(attempt.status).toBe("IN_PROGRESS");
    expect(attempt.assessmentId).toBe("asm-stem-01");
    expect(attempt.studentProfileId).toBe(testProfileId);
  });

  it("auto-evaluates passing submission, mints verified SkillEvidence, and updates student CRI", async () => {
    const asm = KAABIL_ASSESSMENTS.find((a) => a.id === "asm-stem-01")!;
    const attempt = await AssessmentEngine.startAttempt(testProfileId, asm.id);

    // Build 100% correct answers
    const answers: Record<string, { selectedOptionKey: string }> = {};
    for (const q of asm.questions) {
      const correctOpt = q.options.find((o) => o.isCorrect)!;
      answers[q.id] = { selectedOptionKey: correctOpt.optionKey };
    }

    const result = await AssessmentEngine.submitAttempt(attempt.id, testProfileId, answers);

    expect(result.scorePercentage).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.evidenceGenerated).toBe(true);
    expect(result.evidenceId).toBeDefined();
    expect(result.criImpactSummary).toContain("Verified Skill Added");

    // Verify SkillEvidence was saved into devStore
    const evidences = devStore.getSkillEvidences(testProfileId);
    const minted = evidences.find((e) => e.skillName === asm.targetSkillName);
    expect(minted).toBeDefined();
    expect(minted?.verificationStatus).toBe("VERIFIED");
    expect(minted?.verificationHash).toBeDefined();

    // Verify student profile skill is marked verified
    const profile = devStore.getProfile(testProfileId);
    const verifiedSkill = profile.userSkills.find(
      (s: any) => (s.skill?.name || s.name) === asm.targetSkillName
    );
    expect(verifiedSkill?.isVerified).toBe(true);
  });

  it("handles non-passing submission non-punitively with constructive feedback and no penalty", async () => {
    const asm = KAABIL_ASSESSMENTS.find((a) => a.id === "asm-med-01")!;
    const attempt = await AssessmentEngine.startAttempt(testProfileId, asm.id);

    // Build incorrect answers
    const answers: Record<string, { selectedOptionKey: string }> = {};
    for (const q of asm.questions) {
      const wrongOpt = q.options.find((o) => !o.isCorrect)!;
      answers[q.id] = { selectedOptionKey: wrongOpt.optionKey };
    }

    const result = await AssessmentEngine.submitAttempt(attempt.id, testProfileId, answers);

    expect(result.scorePercentage).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.evidenceGenerated).toBe(false);
    expect(result.criImpactSummary).toContain("No penalty incurred");
    expect(result.improvements.length).toBeGreaterThan(0);
  });
});
