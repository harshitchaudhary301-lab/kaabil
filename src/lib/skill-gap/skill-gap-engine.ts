// ==============================================================================
// KAABIL (काबिल) — Intelligent Skill Gap Analyzer Engine (Foundation v1.0)
// Deterministic, explainable competency evaluation across all 13 educational streams
// Compares student profile & verified evidence against council & industry benchmarks
// ==============================================================================

import crypto from "crypto";
import {
  CareerRequirement,
  SkillRequirement,
  getCareerRequirements,
} from "@/data/careerRequirementsData";
import { CAREER_PATHS_DATABASE } from "@/data/careersData";
import { KAABIL_ASSESSMENTS } from "@/data/assessmentsData";
import { devStore } from "@/lib/dev-store";
import { db, checkDatabaseConnection } from "@/lib/db";

export type GapStatus =
  | "DEMONSTRATED" // Verified evidence exists (assessment passed, evidence minted)
  | "DEVELOPING" // Attempted assessment or actively learning
  | "SELF_REPORTED" // Student claimed in profile, but not yet verified
  | "MISSING_EVIDENCE" // Mandatory skill, zero platform or verified evidence
  | "LEARNING_REQUIREMENT" // Recommended skill, not yet started
  | "EDUCATIONAL_PREREQUISITE"; // Educational milestone not yet met

export interface SkillGapItem {
  skillName: string;
  category: string;
  requiredLevel: number;
  currentLevel: number; // 0 if missing, 1-5 if evidence exists
  gapStatus: GapStatus;
  gapSeverity: "CRITICAL" | "MODERATE" | "MINOR" | "NONE";
  importanceWeight: number;
  isMandatory: boolean;
  evidenceSummary: string;
  recommendedAction: string;
  assessmentAvailable: boolean;
  relatedAssessmentSlug?: string;
  relatedAssessmentTitle?: string;
}

export interface EducationalGapItem {
  stage: string;
  requirement: string;
  isMandatory: boolean;
  isMet: boolean;
  gapNote: string;
}

export interface CertificationGapItem {
  name: string;
  issuingBody: string;
  isMandatory: boolean;
  isObtained: boolean;
  gapNote: string;
}

export interface SkillGapAnalysisResult {
  id: string;
  studentProfileId: string;
  targetCareerSlug: string;
  targetCareerTitle: string;
  targetStream: string;
  regulatoryBody?: string;
  analyzedAt: string;

  // Coverage metrics
  overallCoveragePercent: number; // 0-100, weighted by importance
  mandatoryCoveragePercent: number; // mandatory skills only
  evidenceQualityScore: number; // 0-100, proportion of verified evidence

  // Gap items
  skillGaps: SkillGapItem[];
  educationalGaps: EducationalGapItem[];
  certificationGaps: CertificationGapItem[];

  // Priority development
  priorityDevelopmentAreas: {
    skillName: string;
    reason: string;
    suggestedActivity: string;
    estimatedWeeks: number;
  }[];

  // Recommended assessments
  recommendedAssessments: {
    assessmentId: string;
    assessmentTitle: string;
    assessmentSlug: string;
    skillName: string;
    reason: string;
  }[];

  // Metadata & transparency
  algorithmVersion: string;
  disclaimer: string;
  scoringFormula: string;
}

const STAGE_HIERARCHY: Record<string, number> = {
  CLASS_8: 1,
  CLASS_9: 2,
  CLASS_10: 3,
  CLASS_11: 4,
  CLASS_12: 5,
  DIPLOMA: 6,
  ITI: 6,
  UNDERGRADUATE: 7,
  POSTGRADUATE: 8,
  WORKING_PROFESSIONAL: 9,
};

export class SkillGapEngine {
  public static readonly VERSION = "v1.0";
  public static readonly SCORING_FORMULA =
    "Coverage = Σ(min(currentLevel / requiredLevel, 1) × importanceWeight) / Σ(importanceWeight) × 100";
  public static readonly DISCLAIMER =
    "Skill gap analysis reflects alignment with published career competency benchmarks. Missing evidence does NOT indicate incompetence — it highlights areas where objective assessment or verified projects will strengthen your profile.";

  /**
   * Performs an explainable skill gap analysis for a student against a target career.
   */
  public static async analyzeGaps(
    studentProfileId: string,
    targetCareerSlug: string
  ): Promise<SkillGapAnalysisResult> {
    // 1. Fetch Student Profile
    let profile: any = null;
    try {
      const conn = await checkDatabaseConnection();
      if (conn.connected && db?.studentProfile) {
        profile = await db.studentProfile.findUnique({
          where: { id: studentProfileId },
          include: {
            userSkills: { include: { skill: true } },
            educationalHistory: true,
            careerGoals: true,
          },
        });
      }
    } catch {
      // Fallback
    }

    if (!profile) {
      profile = devStore.getProfile(studentProfileId);
    }
    if (!profile) {
      profile = devStore.getProfileByUserId(studentProfileId);
    }
    if (!profile) {
      throw new Error(`Student profile with ID '${studentProfileId}' not found.`);
    }

    // 2. Fetch Career Requirements
    let reqs = getCareerRequirements(targetCareerSlug);

    // Dynamic synthesis fallback if career exists in careersData but not yet in requirements table
    if (!reqs) {
      const dbCareer = CAREER_PATHS_DATABASE.find(
        (c) => c.slug === targetCareerSlug || c.id === targetCareerSlug
      );
      if (dbCareer) {
        reqs = {
          careerSlug: dbCareer.slug,
          careerTitle: dbCareer.title,
          stream: dbCareer.stream,
          regulatoryBody: dbCareer.regulatoryBody,
          mandatorySkills: dbCareer.skills.map((s) => ({
            skillName: s.name,
            category: s.category as any,
            minimumLevel: s.requiredLevel,
            importanceWeight: s.importanceWeight,
            description: s.description,
            assessmentAvailable: KAABIL_ASSESSMENTS.some(
              (a) =>
                a.targetSkillName.toLowerCase().includes(s.name.toLowerCase()) ||
                s.name.toLowerCase().includes(a.targetSkillName.toLowerCase())
            ),
          })),
          recommendedSkills: [],
          educationalPrerequisites: [
            {
              stage: dbCareer.minEducationStage,
              requirement: `Minimum education stage: ${dbCareer.minEducationStage.replace("_", " ")}`,
              isMandatory: true,
            },
          ],
          certifications: dbCareer.licensingRequirement
            ? [
                {
                  name: dbCareer.licensingRequirement,
                  issuingBody: dbCareer.regulatoryBody || "Statutory Authority",
                  isMandatory: true,
                  description: dbCareer.licensingRequirement,
                },
              ]
            : [],
          experienceAreas: [
            {
              area: "Practical / Industry Training",
              recommendedMonths: 6,
              description: "Hands-on projects or practical internship exposure",
            },
          ],
        };
      }
    }

    if (!reqs) {
      throw new Error(
        `Career requirements benchmark for slug '${targetCareerSlug}' not found.`
      );
    }

    // 3. Fetch Student Evidences and Assessment Attempts
    const evidences = devStore.getSkillEvidences(profile.id) || [];
    const attempts = devStore.getAssessmentAttempts(profile.id) || [];

    // Map of verified skills from evidences
    const evidenceMap = new Map<string, any>();
    for (const ev of evidences) {
      evidenceMap.set(ev.skillName.toLowerCase().trim(), ev);
    }

    // Map of user skills from profile (handles both Prisma userSkills relation and devStore skills array)
    const userSkillMap = new Map<string, any>();
    for (const usk of profile.userSkills || profile.skills || []) {
      const name = (usk.skill?.name || usk.name || usk.skillName || "").toLowerCase().trim();
      if (name) userSkillMap.set(name, usk);
    }

    // Map of assessment attempts
    const attemptSkillMap = new Map<string, any>();
    for (const att of attempts) {
      const asm = devStore.getAssessmentById(att.assessmentId);
      if (asm?.targetSkillName) {
        attemptSkillMap.set(asm.targetSkillName.toLowerCase().trim(), att);
      }
    }

    // Helper to find matching assessment with intelligent token and stream matching
    const findAssessmentForSkill = (skillName: string, stream?: string) => {
      const lower = skillName.toLowerCase();
      // Direct substring match on targetSkillName or title
      const direct = KAABIL_ASSESSMENTS.find(
        (a) =>
          a.targetSkillName.toLowerCase().includes(lower) ||
          lower.includes(a.targetSkillName.toLowerCase()) ||
          a.title.toLowerCase().includes(lower) ||
          lower.includes(a.title.toLowerCase())
      );
      if (direct) return direct;

      // Token-based keyword matching
      const keywords = lower
        .replace(/[^a-z0-9 ]/g, " ")
        .split(" ")
        .filter((w) => w.length > 3);

      for (const kw of keywords) {
        const found = KAABIL_ASSESSMENTS.find(
          (a) =>
            a.targetSkillName.toLowerCase().includes(kw) ||
            a.title.toLowerCase().includes(kw)
        );
        if (found) return found;
      }

      // Stream fallback
      if (stream) {
        const streamAsm = KAABIL_ASSESSMENTS.find((a) => a.stream === stream);
        if (streamAsm) return streamAsm;
      }

      return undefined;
    };

    // 4. Evaluate Skill Gaps
    const allSkills: { req: SkillRequirement; isMandatory: boolean }[] = [
      ...reqs.mandatorySkills.map((s) => ({ req: s, isMandatory: true })),
      ...reqs.recommendedSkills.map((s) => ({ req: s, isMandatory: false })),
    ];

    const skillGaps: SkillGapItem[] = [];
    let totalWeightedScore = 0;
    let totalWeight = 0;
    let mandatoryWeightedScore = 0;
    let mandatoryWeight = 0;
    let verifiedCount = 0;

    for (const item of allSkills) {
      const { req, isMandatory } = item;
      const lowerName = req.skillName.toLowerCase().trim();

      // Check evidence
      const ev = evidenceMap.get(lowerName);
      const usk = userSkillMap.get(lowerName);
      const att = attemptSkillMap.get(lowerName);
      const matchingAsm = findAssessmentForSkill(req.skillName, reqs.stream);

      let currentLevel = 0;
      let gapStatus: GapStatus = isMandatory
        ? "MISSING_EVIDENCE"
        : "LEARNING_REQUIREMENT";
      let evidenceSummary = "";
      let recommendedAction = "";

      if (ev && ev.isVerified) {
        // Platform verified evidence exists
        currentLevel = SkillGapEngine.scoreToLevel(ev.scorePercentage || 80);
        gapStatus = "DEMONSTRATED";
        evidenceSummary = `Verified by KAABIL Assessment (${ev.scorePercentage || 80}% score, Hash: ${ev.verificationHash?.substring(0, 8)}...).`;
        recommendedAction = "Maintain demonstrated proficiency through advanced real-world applications.";
        verifiedCount++;
      } else if (usk?.isVerified) {
        // Profile verified skill
        currentLevel = usk.proficiencyLevel || 4;
        gapStatus = "DEMONSTRATED";
        evidenceSummary = `Verified competence recorded on student profile.`;
        recommendedAction = "Competency verified. Ready for deployment in projects and challenges.";
        verifiedCount++;
      } else if (att && att.status === "COMPLETED") {
        // Attempted but unverified or failed
        currentLevel = 2;
        gapStatus = "DEVELOPING";
        evidenceSummary = "Assessment attempted. Developing competency identified.";
        recommendedAction = matchingAsm
          ? `Review study recommendations and re-take the '${matchingAsm.title}' assessment.`
          : "Continue focused learning in this domain.";
      } else if (usk) {
        // Self-reported by student
        currentLevel = usk.proficiencyLevel || 2;
        gapStatus = "SELF_REPORTED";
        evidenceSummary = "Skill self-reported on profile. No formal platform verification yet.";
        recommendedAction = matchingAsm
          ? `Verify this self-reported skill by taking the '${matchingAsm.title}' assessment.`
          : "Build project evidence to demonstrate competence.";
      } else {
        // Missing evidence
        currentLevel = 0;
        gapStatus = isMandatory ? "MISSING_EVIDENCE" : "LEARNING_REQUIREMENT";
        evidenceSummary = isMandatory
          ? "No documented skill evidence or self-report on record."
          : "Recommended capability for career differentiation.";
        recommendedAction = matchingAsm
          ? `Take the foundational '${matchingAsm.title}' assessment to verify competency.`
          : `Add '${req.skillName}' to your active Roadmap learning milestones.`;
      }

      // Calculate gap severity
      let gapSeverity: "CRITICAL" | "MODERATE" | "MINOR" | "NONE" = "NONE";
      const levelDiff = req.minimumLevel - currentLevel;

      if (levelDiff > 0) {
        if (isMandatory && (currentLevel === 0 || levelDiff >= 2)) {
          gapSeverity = "CRITICAL";
        } else if (levelDiff >= 2 || (isMandatory && levelDiff === 1)) {
          gapSeverity = "MODERATE";
        } else {
          gapSeverity = "MINOR";
        }
      }

      // Weights and coverage contribution
      const cappedRatio = Math.min(currentLevel / req.minimumLevel, 1);
      const contribution = cappedRatio * req.importanceWeight;

      totalWeightedScore += contribution;
      totalWeight += req.importanceWeight;

      if (isMandatory) {
        mandatoryWeightedScore += contribution;
        mandatoryWeight += req.importanceWeight;
      }

      skillGaps.push({
        skillName: req.skillName,
        category: req.category,
        requiredLevel: req.minimumLevel,
        currentLevel,
        gapStatus,
        gapSeverity,
        importanceWeight: req.importanceWeight,
        isMandatory,
        evidenceSummary,
        recommendedAction,
        assessmentAvailable: !!matchingAsm,
        relatedAssessmentSlug: matchingAsm?.slug,
        relatedAssessmentTitle: matchingAsm?.title,
      });
    }

    // 5. Educational Prerequisite Checks
    const studentStageIndex =
      STAGE_HIERARCHY[profile.educationStage || "CLASS_10"] || 3;
    const educationalGaps: EducationalGapItem[] =
      reqs.educationalPrerequisites.map((ep) => {
        const requiredStageIndex = STAGE_HIERARCHY[ep.stage] || 5;
        const isMet = studentStageIndex >= requiredStageIndex;
        return {
          stage: ep.stage,
          requirement: ep.requirement,
          isMandatory: ep.isMandatory,
          isMet,
          gapNote: isMet
            ? `Educational milestone satisfied (Current: ${profile.educationStage}).`
            : `Educational progression in progress. Expected milestone: ${ep.stage}.`,
        };
      });

    // 6. Certification Gap Checks
    const certificationGaps: CertificationGapItem[] = reqs.certifications.map(
      (cert) => ({
        name: cert.name,
        issuingBody: cert.issuingBody,
        isMandatory: cert.isMandatory,
        isObtained: false, // KAABIL does not verify statutory external licenses automatically
        gapNote: cert.isMandatory
          ? `Statutory requirement: Must be obtained from ${cert.issuingBody} after completing accredited degree/internship.`
          : `Recommended industry certification: Enhances professional standing.`,
      })
    );

    // 7. Calculate Aggregates
    const overallCoveragePercent =
      totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;
    const mandatoryCoveragePercent =
      mandatoryWeight > 0
        ? Math.round((mandatoryWeightedScore / mandatoryWeight) * 100)
        : 0;
    const evidenceQualityScore =
      allSkills.length > 0
        ? Math.round((verifiedCount / allSkills.length) * 100)
        : 0;

    // 8. Priority Development Areas (Top 5 gaps prioritized by severity and importance)
    const severityRank = { CRITICAL: 3, MODERATE: 2, MINOR: 1, NONE: 0 };
    const priorityDevelopmentAreas = skillGaps
      .filter((g) => g.gapSeverity !== "NONE")
      .sort((a, b) => {
        const sevDiff = severityRank[b.gapSeverity] - severityRank[a.gapSeverity];
        if (sevDiff !== 0) return sevDiff;
        return b.importanceWeight - a.importanceWeight;
      })
      .slice(0, 5)
      .map((g) => ({
        skillName: g.skillName,
        reason: `${g.gapSeverity} Gap: Required level ${g.requiredLevel}/5, currently at ${g.currentLevel}/5. (${g.isMandatory ? "Mandatory" : "Recommended"}).`,
        suggestedActivity: g.recommendedAction,
        estimatedWeeks: Math.max(
          2,
          (g.requiredLevel - g.currentLevel) * (g.isMandatory ? 3 : 2)
        ),
      }));

    // 9. Recommended Assessments
    const recommendedAssessments = skillGaps
      .filter(
        (g) =>
          g.assessmentAvailable &&
          g.gapStatus !== "DEMONSTRATED" &&
          g.relatedAssessmentSlug
      )
      .slice(0, 4)
      .map((g) => {
        const asm = findAssessmentForSkill(g.skillName, reqs.stream);
        return {
          assessmentId: asm?.id || "asm-unknown",
          assessmentTitle: g.relatedAssessmentTitle || g.skillName,
          assessmentSlug: g.relatedAssessmentSlug || "",
          skillName: g.skillName,
          reason: `Take this assessment to transform '${g.skillName}' into verified SkillEvidence and boost your CRI.`,
        };
      });

    // 10. Construct Result
    const result: SkillGapAnalysisResult = {
      id: `gap-${crypto.randomUUID()}`,
      studentProfileId: profile.id,
      targetCareerSlug: reqs.careerSlug,
      targetCareerTitle: reqs.careerTitle,
      targetStream: reqs.stream,
      regulatoryBody: reqs.regulatoryBody,
      analyzedAt: new Date().toISOString(),
      overallCoveragePercent,
      mandatoryCoveragePercent,
      evidenceQualityScore,
      skillGaps,
      educationalGaps,
      certificationGaps,
      priorityDevelopmentAreas,
      recommendedAssessments,
      algorithmVersion: SkillGapEngine.VERSION,
      disclaimer: SkillGapEngine.DISCLAIMER,
      scoringFormula: SkillGapEngine.SCORING_FORMULA,
    };

    // Save into devStore for offline persistence
    devStore.saveSkillGapAnalysis(result);

    return result;
  }

  /**
   * Retrieves past skill gap analyses for a student profile.
   */
  public static async getStudentAnalyses(
    studentProfileId: string
  ): Promise<SkillGapAnalysisResult[]> {
    return devStore.getSkillGapAnalyses(studentProfileId);
  }

  /**
   * Retrieves a specific analysis result by ID.
   */
  public static async getAnalysisById(
    analysisId: string
  ): Promise<SkillGapAnalysisResult | null> {
    return devStore.getSkillGapAnalysis(analysisId);
  }

  /**
   * Helper: maps a percentage score to proficiency level 1-5.
   */
  public static scoreToLevel(scorePercentage: number): number {
    if (scorePercentage >= 85) return 5;
    if (scorePercentage >= 70) return 4;
    if (scorePercentage >= 50) return 3;
    if (scorePercentage >= 35) return 2;
    return 1;
  }
}
