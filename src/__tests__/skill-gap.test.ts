import { describe, it, expect, beforeEach } from "vitest";
import { SkillGapEngine } from "@/lib/skill-gap/skill-gap-engine";
import {
  CAREER_REQUIREMENTS,
  getCareerRequirements,
  getAllCareerSlugsWithRequirements,
} from "@/data/careerRequirementsData";
import { devStore } from "@/lib/dev-store";

describe("Intelligent Skill Gap Analyzer Engine", () => {
  const profileId = "demo-profile-id";

  beforeEach(() => {
    // Ensure demo student profile exists
    const profile = devStore.getProfile(profileId);
    expect(profile).toBeDefined();
  });

  it("covers all 13 educational streams with documented career benchmarks", () => {
    const slugs = getAllCareerSlugsWithRequirements();
    expect(slugs.length).toBeGreaterThanOrEqual(13);

    const streams = new Set(Object.values(CAREER_REQUIREMENTS).map((c) => c.stream));
    const required13Streams = [
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
    ];

    for (const st of required13Streams) {
      expect(streams.has(st), `Stream ${st} must have requirements defined`).toBe(true);
    }
  });

  it("calculates deterministic skill gap metrics for STEM (AI Systems Engineer)", async () => {
    const result = await SkillGapEngine.analyzeGaps(profileId, "ai-systems-engineer");

    expect(result).toBeDefined();
    expect(result.targetCareerSlug).toBe("ai-systems-engineer");
    expect(result.overallCoveragePercent).toBeGreaterThan(0);
    expect(result.overallCoveragePercent).toBeLessThanOrEqual(100);
    expect(result.mandatoryCoveragePercent).toBeGreaterThan(0);
    expect(result.evidenceQualityScore).toBeGreaterThanOrEqual(0);
    expect(result.skillGaps.length).toBeGreaterThan(0);
    expect(result.priorityDevelopmentAreas.length).toBeGreaterThan(0);
    expect(result.educationalGaps.length).toBeGreaterThan(0);
    expect(result.algorithmVersion).toBe("v1.0");
    expect(result.disclaimer).toContain("Missing evidence does NOT indicate incompetence");
  });

  it("calculates deterministic skill gap metrics for Medical (MBBS Doctor)", async () => {
    const result = await SkillGapEngine.analyzeGaps(profileId, "mbbs-doctor");

    expect(result).toBeDefined();
    expect(result.targetCareerSlug).toBe("mbbs-doctor");
    expect(result.targetStream).toBe("MEDICAL_PCB");
    expect(result.regulatoryBody).toBe("National Medical Commission (NMC)");
    expect(result.skillGaps.some((s) => s.skillName === "Human Physiology")).toBe(true);
  });

  it("identifies DEMONSTRATED skills when verified evidence exists", async () => {
    // Add verified evidence to devStore for demo profile
    devStore.saveSkillEvidence({
      id: "ev-test-python",
      studentProfileId: profileId,
      skillName: "Python",
      evidenceType: "ASSESSMENT_RESULT",
      verificationStatus: "VERIFIED",
      scorePercentage: 90,
      verificationHash: "hash-demo-python-12345678",
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    });

    const result = await SkillGapEngine.analyzeGaps(profileId, "ai-systems-engineer");
    const pythonGap = result.skillGaps.find((g) => g.skillName === "Python");

    expect(pythonGap).toBeDefined();
    expect(pythonGap?.gapStatus).toBe("DEMONSTRATED");
    expect(pythonGap?.currentLevel).toBeGreaterThanOrEqual(4);
    expect(pythonGap?.gapSeverity).toBe("NONE");
  });

  it("persists analysis in devStore and supports retrieval by ID", async () => {
    const analysis = await SkillGapEngine.analyzeGaps(profileId, "chartered-accountant-ca");
    expect(analysis.id).toBeDefined();

    const retrieved = await SkillGapEngine.getAnalysisById(analysis.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(analysis.id);
    expect(retrieved?.targetCareerSlug).toBe("chartered-accountant-ca");

    const pastAnalyses = await SkillGapEngine.getStudentAnalyses(profileId);
    expect(pastAnalyses.some((a) => a.id === analysis.id)).toBe(true);
  });

  it("recommends corresponding assessments for unverified skills with available challenges", async () => {
    const result = await SkillGapEngine.analyzeGaps(profileId, "ui-ux-product-designer");
    expect(result.recommendedAssessments.length).toBeGreaterThan(0);
    for (const rec of result.recommendedAssessments) {
      expect(rec.assessmentSlug).toBeDefined();
      expect(rec.assessmentTitle).toBeDefined();
      expect(rec.skillName).toBeDefined();
    }
  });
});
