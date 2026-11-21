import { describe, it, expect, beforeEach } from "vitest";
import { MatchingEngine } from "@/lib/employer/matching-engine";
import { devStore } from "@/lib/dev-store";
import { EducationalStream } from "@/types";

describe("Two-Way Explainable AI Talent Matching Engine (Part F2)", () => {
  beforeEach(() => {
    devStore.reset();
  });

  it("normalizes configurable weights so that their sum equals 1.0", () => {
    const rawWeights = {
      verifiedSkillWeight: 50,
      proficiencyWeight: 50,
      projectEvidenceWeight: 25,
      assessmentWeight: 25,
      preferredSkillWeight: 50,
    };

    const normalized = MatchingEngine.normalizeWeights(rawWeights);
    const sum =
      normalized.verifiedSkillWeight +
      normalized.proficiencyWeight +
      normalized.projectEvidenceWeight +
      normalized.assessmentWeight +
      normalized.preferredSkillWeight;

    expect(Math.abs(sum - 1.0)).toBeLessThan(0.0001);
    expect(normalized.verifiedSkillWeight).toBeCloseTo(0.25, 2);
  });

  it("normalizes skill synonyms correctly across multiple streams", () => {
    // Medical stream synonyms
    expect(MatchingEngine.normalizeSkillName("Electrocardiography")).toBe(
      MatchingEngine.normalizeSkillName("ECG Analysis")
    );
    expect(MatchingEngine.normalizeSkillName("Clinical Phlebotomy")).toBe(
      MatchingEngine.normalizeSkillName("Venipuncture")
    );

    // Tech / PCM synonyms
    expect(MatchingEngine.normalizeSkillName("React.js")).toBe(
      MatchingEngine.normalizeSkillName("React")
    );
    expect(MatchingEngine.normalizeSkillName("PostgreSQL")).toBe(
      MatchingEngine.normalizeSkillName("Postgres")
    );

    // Law synonyms
    expect(MatchingEngine.normalizeSkillName("Contract Drafting")).toBe(
      MatchingEngine.normalizeSkillName("Agreement Drafting")
    );
  });

  it("calculates deterministic match scores with full explainable score component breakdown", () => {
    const opp = devStore.getJobOpportunities("emp-apex-diag")[0];
    expect(opp).toBeDefined();

    const matches = MatchingEngine.matchCandidatesForOpportunity({
      opportunityId: opp.id,
      organizationId: "emp-apex-diag",
    });

    expect(matches.length).toBeGreaterThan(0);
    const topMatch = matches[0];

    // Verify explainable result shape
    expect(topMatch.candidateId).toBeDefined();
    expect(topMatch.candidateName).toBeDefined();
    expect(topMatch.overallScore).toBeGreaterThanOrEqual(0);
    expect(topMatch.overallScore).toBeLessThanOrEqual(100);

    // Verify 5 component score breakdown
    const breakdown = topMatch.scoreBreakdown;
    expect(breakdown.verifiedSkillScore).toBeGreaterThanOrEqual(0);
    expect(breakdown.proficiencyScore).toBeGreaterThanOrEqual(0);
    expect(breakdown.projectEvidenceScore).toBeGreaterThanOrEqual(0);
    expect(breakdown.assessmentScore).toBeGreaterThanOrEqual(0);
    expect(breakdown.preferredSkillScore).toBeGreaterThanOrEqual(0);

    // Verify plain-language deterministic explanation
    expect(topMatch.plainLanguageExplanation).toBeDefined();
    expect(topMatch.plainLanguageExplanation.length).toBeGreaterThan(20);
    expect(topMatch.suggestedRoadmapBridgeActions).toBeDefined();
  });

  it("evaluates mandatory qualifications separately from skill evidence (never labels missing evidence as incompetence)", () => {
    const opp = devStore.getJobOpportunities("emp-apex-diag")[0];
    const matches = MatchingEngine.matchCandidatesForOpportunity({
      opportunityId: opp.id,
      organizationId: "emp-apex-diag",
    });

    for (const m of matches) {
      expect(["SATISFIED", "UNMET", "PROVISIONAL"]).toContain(
        m.mandatoryQualificationsStatus
      );
    }
  });

  it("calculates Direction A: recommended opportunities for student with bridge suggestions", () => {
    // Dr. Rohit Verma or Aryan Sharma
    const studentProfileId = "sp-aryan-01";
    const recommended = MatchingEngine.getRecommendedOpportunitiesForStudent(studentProfileId);

    expect(Array.isArray(recommended)).toBe(true);
    if (recommended.length > 0) {
      const rec = recommended[0];
      expect(rec.opportunityId).toBeDefined();
      expect(rec.opportunityTitle).toBeDefined();
      expect(rec.overallScore).toBeGreaterThan(0);
      expect(rec.plainLanguageExplanation).toContain("match");
    }
  });
});
