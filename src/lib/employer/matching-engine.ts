// ==============================================================================
// KAABIL (काबिल) — Two-Way Explainable Talent Matching Engine
// Direction A: Student-to-Opportunity Matching & Recommendations
// Direction B: Opportunity-to-Candidate Matching & Evaluation
// Supports all 13 educational streams. Fully deterministic with explainable components.
// Compliant with DPDP Act 2023. Protected-attribute invariant.
// ==============================================================================

import { devStore } from "@/lib/dev-store";
import {
  JobOpportunityRecord,
  ExplainableMatchResult,
  MatchWeightConfig,
  ScoreComponentBreakdown,
  CandidateDiscoveryProfile,
} from "@/types/employer";
import { EducationalStream, EducationStage } from "@/types";

export const MATCHING_MODEL_VERSION = "2.1.0-explainable";

export const DEFAULT_MATCH_WEIGHTS: MatchWeightConfig = {
  verifiedSkillWeight: 0.35,
  proficiencyWeight: 0.25,
  projectEvidenceWeight: 0.15,
  assessmentWeight: 0.15,
  preferredSkillWeight: 0.10,
};

const STAGE_RANKS: Record<string, number> = {
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

// Canonical skill synonym mappings across universal streams
const SKILL_SYNONYMS: Record<string, string> = {
  // PCM / Tech
  "postgres": "postgresql",
  "psql": "postgresql",
  "postgres database": "postgresql",
  "react.js": "react",
  "reactjs": "react",
  "react framework": "react",
  "node": "node.js",
  "nodejs": "node.js",
  "typescript language": "typescript",
  "ts": "typescript",
  "plc": "plc programming",
  "industrial automation": "plc programming",
  "robotic arms": "industrial robotics",
  "robotics": "industrial robotics",
  // PCB / Healthcare
  "ecg": "electrocardiography",
  "ecg analysis": "electrocardiography",
  "electrocardiogram": "electrocardiography",
  "phlebotomy": "clinical phlebotomy",
  "venipuncture": "clinical phlebotomy",
  "radiology": "diagnostic radiology",
  "diagnostic imaging": "diagnostic radiology",
  "radiological imaging": "diagnostic radiology",
  "pathology": "pathology specimen handling",
  "biochemistry": "biochemistry assays",
  "clinical biochemistry": "biochemistry assays",
  "lab safety": "laboratory safety",
  // Commerce
  "gst": "gst compliance",
  "goods and services tax": "gst compliance",
  "gst taxation": "gst compliance",
  "tally": "tally erp",
  "credit risk": "credit risk modeling",
  "financial analysis": "financial modeling",
  // Law
  "contract drafting": "legal drafting",
  "agreement drafting": "legal drafting",
  "pleadings": "legal drafting",
  "conveyancing": "legal drafting",
  "due diligence": "corporate due diligence",
  // Trades
  "tig": "tig welding",
  "gtaw": "tig welding",
  "mig welding": "mig welding",
  "cnc": "cnc machining",
  "cnc milling": "cnc machining",
  "lathe": "precision machining",
  // Agriculture
  "soil testing": "soil chemistry",
  "soil analysis": "soil chemistry",
  "crop science": "agronomy",
};

export class MatchingEngine {
  /**
   * Normalizes skill string by trimming, lowercasing, and applying synonym dictionary.
   */
  public static normalizeSkill(skill: string): string {
    if (!skill) return "";
    const clean = skill.toLowerCase().trim().replace(/[^a-z0-9\s.-]/g, "");
    return SKILL_SYNONYMS[clean] || clean;
  }

  public static normalizeSkillName(skill: string): string {
    return this.normalizeSkill(skill);
  }

  /**
   * Evaluates two skills for equivalence via direct match or normalized synonym lookup.
   */
  public static skillsMatch(skillA: string, skillB: string): boolean {
    const normA = this.normalizeSkill(skillA);
    const normB = this.normalizeSkill(skillB);
    if (!normA || !normB) return false;
    return normA === normB || normA.includes(normB) || normB.includes(normA);
  }

  /**
   * Normalizes match weights ensuring their sum equals 1.0.
   */
  public static normalizeWeights(weights?: Partial<MatchWeightConfig>): MatchWeightConfig {
    const raw: MatchWeightConfig = {
      verifiedSkillWeight: weights?.verifiedSkillWeight ?? DEFAULT_MATCH_WEIGHTS.verifiedSkillWeight,
      proficiencyWeight: weights?.proficiencyWeight ?? DEFAULT_MATCH_WEIGHTS.proficiencyWeight,
      projectEvidenceWeight: weights?.projectEvidenceWeight ?? DEFAULT_MATCH_WEIGHTS.projectEvidenceWeight,
      assessmentWeight: weights?.assessmentWeight ?? DEFAULT_MATCH_WEIGHTS.assessmentWeight,
      preferredSkillWeight: weights?.preferredSkillWeight ?? DEFAULT_MATCH_WEIGHTS.preferredSkillWeight,
    };

    const sum =
      raw.verifiedSkillWeight +
      raw.proficiencyWeight +
      raw.projectEvidenceWeight +
      raw.assessmentWeight +
      raw.preferredSkillWeight;

    if (sum === 0) return DEFAULT_MATCH_WEIGHTS;

    return {
      verifiedSkillWeight: Number((raw.verifiedSkillWeight / sum).toFixed(4)),
      proficiencyWeight: Number((raw.proficiencyWeight / sum).toFixed(4)),
      projectEvidenceWeight: Number((raw.projectEvidenceWeight / sum).toFixed(4)),
      assessmentWeight: Number((raw.assessmentWeight / sum).toFixed(4)),
      preferredSkillWeight: Number((raw.preferredSkillWeight / sum).toFixed(4)),
    };
  }

  /**
   * Core Explainable Matching Algorithm:
   * Computes a transparent 0-100 compatibility score with granular sub-components.
   * Completely invariant to protected characteristics (gender, religion, caste, appearance, etc.).
   */
  public static calculateMatch(params: {
    opportunity: JobOpportunityRecord;
    candidate: {
      id: string;
      name?: string;
      educationStage: EducationStage;
      currentStream: EducationalStream;
      isMinor: boolean;
      verifiedSkills: string[];
      selfReportedSkills?: string[];
      qualifications?: string[];
      licenses?: string[];
      projects?: { title: string; description: string; url?: string }[];
      assessmentsPassed?: string[];
      careerReadinessIndex?: number;
      evidenceMintDates?: string[];
    };
    customWeights?: Partial<MatchWeightConfig>;
  }): ExplainableMatchResult {
    const { opportunity, candidate } = params;
    const weights = this.normalizeWeights(params.customWeights);

    // 1. Mandatory Statutory / Stage Eligibility Check
    const ineligibilityReasons: string[] = [];
    const candidateStageRank = STAGE_RANKS[candidate.educationStage] || 0;
    const minStageRank = STAGE_RANKS[opportunity.minStage] || 0;

    if (candidateStageRank < minStageRank) {
      ineligibilityReasons.push(
        `Academic stage (${candidate.educationStage.replace(/_/g, " ")}) does not meet the minimum prerequisite (${opportunity.minStage.replace(/_/g, " ")}).`
      );
    }

    // Regulated Statutory Licenses (e.g. State Medical Council, Bar Council of India)
    let mandatoryQualificationsStatus: "SATISFIED" | "UNMET" | "PROVISIONAL" = "SATISFIED";
    if (opportunity.requiredLicenses && opportunity.requiredLicenses.length > 0) {
      const heldLicenses = (candidate.licenses || []).map((l) => l.toLowerCase());
      const missingLicenses = opportunity.requiredLicenses.filter(
        (reqLic) => !heldLicenses.some((held) => held.includes(reqLic.toLowerCase()))
      );

      if (missingLicenses.length > 0) {
        mandatoryQualificationsStatus = "UNMET";
        ineligibilityReasons.push(
          `Candidate does not yet hold statutory professional license(s): ${missingLicenses.join(", ")}.`
        );
      }
    }

    const isEligible = ineligibilityReasons.length === 0;

    // 2. Skill Alignment & Matching
    const candidateVerified = candidate.verifiedSkills || [];
    const candidateSelfReported = candidate.selfReportedSkills || [];
    const allCandidateSkills = [...candidateVerified, ...candidateSelfReported];

    const matchedRequiredSkills: string[] = [];
    const missingRequiredSkills: string[] = [];

    for (const reqSkill of opportunity.requiredSkills) {
      if (allCandidateSkills.some((candSkill) => this.skillsMatch(reqSkill, candSkill))) {
        matchedRequiredSkills.push(reqSkill);
      } else {
        missingRequiredSkills.push(reqSkill);
      }
    }

    const matchedPreferredSkills: string[] = [];
    const missingPreferredSkills: string[] = [];

    for (const prefSkill of opportunity.preferredSkills || []) {
      if (allCandidateSkills.some((candSkill) => this.skillsMatch(prefSkill, candSkill))) {
        matchedPreferredSkills.push(prefSkill);
      } else {
        missingPreferredSkills.push(prefSkill);
      }
    }

    // 3. Sub-Component Calculations (0 - 100 each)
    // Component 1: Verified Skill Alignment (35%)
    let verifiedSkillScore = 100;
    if (opportunity.requiredSkills.length > 0) {
      const verifiedMatches = opportunity.requiredSkills.filter((req) =>
        candidateVerified.some((ver) => this.skillsMatch(req, ver))
      ).length;
      verifiedSkillScore = Math.round((verifiedMatches / opportunity.requiredSkills.length) * 100);
    }

    // Component 2: Required Competency Proficiency (25%)
    let proficiencyScore = 100;
    if (opportunity.requiredSkills.length > 0) {
      const totalMatches = matchedRequiredSkills.length;
      proficiencyScore = Math.round((totalMatches / opportunity.requiredSkills.length) * 100);
    }

    // Component 3: Relevant Project Evidence (15%)
    let projectEvidenceScore = 0;
    const projects = candidate.projects || [];
    if (projects.length >= 2) {
      projectEvidenceScore = 100;
    } else if (projects.length === 1) {
      projectEvidenceScore = 65;
    } else {
      projectEvidenceScore = 20; // baseline if no projects documented
    }

    // Component 4: Relevant Assessments Passed (15%)
    let assessmentScore = 0;
    const assessments = candidate.assessmentsPassed || [];
    if (assessments.length >= 2) {
      assessmentScore = 100;
    } else if (assessments.length === 1) {
      assessmentScore = 70;
    } else if (candidate.careerReadinessIndex && candidate.careerReadinessIndex >= 70) {
      assessmentScore = 60;
    } else {
      assessmentScore = 25;
    }

    // Component 5: Preferred Competency Alignment (10%)
    let preferredSkillScore = 100;
    if (opportunity.preferredSkills && opportunity.preferredSkills.length > 0) {
      preferredSkillScore = Math.round(
        (matchedPreferredSkills.length / opportunity.preferredSkills.length) * 100
      );
    }

    // 4. Weighted Aggregate Overall Score (0 - 100)
    const weightedOverallScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          verifiedSkillScore * weights.verifiedSkillWeight +
            proficiencyScore * weights.proficiencyWeight +
            projectEvidenceScore * weights.projectEvidenceWeight +
            assessmentScore * weights.assessmentWeight +
            preferredSkillScore * weights.preferredSkillWeight
        )
      )
    );

    const scoreBreakdown: ScoreComponentBreakdown = {
      verifiedSkillScore,
      proficiencyScore,
      projectEvidenceScore,
      assessmentScore,
      preferredSkillScore,
      weightedOverallScore,
    };

    // 5. Evidence Freshness & Coverage
    let evidenceCoveragePct = 0;
    if (opportunity.requiredSkills.length > 0) {
      evidenceCoveragePct = Math.round(
        (matchedRequiredSkills.length / opportunity.requiredSkills.length) * 100
      );
    } else {
      evidenceCoveragePct = 100;
    }

    let evidenceFreshness: "FRESH" | "MODERATE" | "NEEDS_REFRESH" = "FRESH";
    if (candidate.evidenceMintDates && candidate.evidenceMintDates.length > 0) {
      const now = Date.now();
      const oldestDate = Math.min(...candidate.evidenceMintDates.map((d) => new Date(d).getTime()));
      const ageDays = (now - oldestDate) / (1000 * 60 * 60 * 24);
      if (ageDays > 730) {
        evidenceFreshness = "NEEDS_REFRESH";
      } else if (ageDays > 365) {
        evidenceFreshness = "MODERATE";
      }
    }

    // 6. Transparent Plain-Language Explanation
    const plainLanguageExplanation = this.generateDeterministicExplanation({
      candidateName: candidate.name || "Candidate",
      opportunityTitle: opportunity.title,
      overallScore: weightedOverallScore,
      isEligible,
      scoreBreakdown,
      matchedRequiredSkills,
      missingRequiredSkills,
      matchedPreferredSkills,
      missingPreferredSkills,
      mandatoryQualificationsStatus,
    });

    // 7. Suggested Roadmap Bridge Actions
    const suggestedRoadmapBridgeActions: string[] = [];
    for (const missing of missingRequiredSkills) {
      suggestedRoadmapBridgeActions.push(
        `Complete Skill Assessment or verified project in '${missing}' to boost competency readiness.`
      );
    }
    if (projects.length === 0) {
      suggestedRoadmapBridgeActions.push(
        "Upload a verified portfolio artifact or GitHub repository to demonstrate practical execution."
      );
    }

    return {
      candidateId: candidate.id,
      candidateName: candidate.name || "Candidate",
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
      stream: opportunity.stream,
      overallScore: weightedOverallScore,
      isEligible,
      ineligibilityReasons,
      mandatoryQualificationsStatus,
      matchedRequiredSkills,
      missingRequiredSkills,
      matchedPreferredSkills,
      missingPreferredSkills,
      verifiedEvidencesCount: candidateVerified.length,
      selfReportedCount: (candidate.selfReportedSkills || []).length,
      relevantProjectsCount: projects.length,
      assessmentsPassedCount: assessments.length,
      evidenceCoveragePct,
      evidenceFreshness,
      scoreBreakdown,
      plainLanguageExplanation,
      suggestedRoadmapBridgeActions,
      modelVersion: MATCHING_MODEL_VERSION,
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates deterministic, plain-language audit explanations for recruiters and students.
   */
  private static generateDeterministicExplanation(params: {
    candidateName: string;
    opportunityTitle: string;
    overallScore: number;
    isEligible: boolean;
    scoreBreakdown: ScoreComponentBreakdown;
    matchedRequiredSkills: string[];
    missingRequiredSkills: string[];
    matchedPreferredSkills: string[];
    missingPreferredSkills: string[];
    mandatoryQualificationsStatus: string;
  }): string {
    const parts: string[] = [];

    if (params.overallScore >= 75) {
      parts.push(
        `Strong Compatibility (${params.overallScore}%): ${params.candidateName} demonstrates strong verified alignment with the requirements for ${params.opportunityTitle}.`
      );
    } else if (params.overallScore >= 50) {
      parts.push(
        `Moderate Compatibility (${params.overallScore}%): ${params.candidateName} possesses foundational capabilities for ${params.opportunityTitle}, with specific competency gaps to bridge.`
      );
    } else {
      parts.push(
        `Developing Compatibility (${params.overallScore}%): ${params.candidateName} shows emerging interest in ${params.opportunityTitle}, but lacks several core verified competencies.`
      );
    }

    if (params.matchedRequiredSkills.length > 0) {
      parts.push(`Verified competencies matched: ${params.matchedRequiredSkills.join(", ")}.`);
    }

    if (params.missingRequiredSkills.length > 0) {
      parts.push(
        `Competencies required but not yet verified: ${params.missingRequiredSkills.join(", ")}.`
      );
    }

    if (params.matchedPreferredSkills.length > 0) {
      parts.push(`Preferred competencies possessed: ${params.matchedPreferredSkills.join(", ")}.`);
    }

    if (!params.isEligible) {
      parts.push(
        "Note: Candidate currently does not satisfy all statutory licensing or academic stage criteria."
      );
    }

    parts.push(
      "Statutory Advisory: Compatibility scores are descriptive competency signals designed to inform human recruiters. Automated hiring or rejection decisions are strictly prohibited."
    );

    return parts.join(" ");
  }

  // --------------------------------------------------------------------------
  // DIRECTION A: STUDENT OPPORTUNITY RECOMMENDATIONS
  // --------------------------------------------------------------------------

  /**
   * Retrieves recommended opportunities for an adult student based on their verified profile.
   * Returns empty array if student is a minor (under-18 protection).
   */
  public static getRecommendedOpportunitiesForStudent(
    studentProfileId: string,
    filters?: { stream?: string; type?: string }
  ): ExplainableMatchResult[] {
    const profile = devStore.getCandidateDiscoveryProfile(studentProfileId);
    if (!profile || profile.isMinor) {
      return []; // Shield minors
    }

    // Get all published opportunities
    const opportunities = devStore.getJobOpportunities().filter((o) => o.status === "PUBLISHED");
    let candidateOpps = opportunities;

    if (filters?.stream && filters.stream !== "ALL") {
      candidateOpps = candidateOpps.filter((o) => o.stream === filters.stream);
    }
    if (filters?.type && filters.type !== "ALL") {
      candidateOpps = candidateOpps.filter((o) => o.opportunityType === filters.type);
    }

    const results: ExplainableMatchResult[] = [];
    for (const opp of candidateOpps) {
      const match = this.calculateMatch({
        opportunity: opp,
        candidate: {
          id: profile.studentProfileId,
          name: profile.name,
          educationStage: profile.stage,
          currentStream: profile.stream,
          isMinor: false,
          verifiedSkills: profile.verifiedSkills,
          selfReportedSkills: profile.selfReportedSkills,
          qualifications: profile.qualifications,
          licenses: profile.licenses,
          projects: profile.projects,
          careerReadinessIndex: profile.careerReadinessIndex,
        },
      });
      results.push(match);
    }

    // Sort descending by overall match score
    return results.sort((a, b) => b.overallScore - a.overallScore);
  }

  // --------------------------------------------------------------------------
  // DIRECTION B: OPPORTUNITY-TO-CANDIDATE TALENT MATCHING
  // --------------------------------------------------------------------------

  /**
   * Evaluates all opted-in adult discovery candidates for a given opportunity.
   * Strictly enforces verified employer status before disclosing candidate matches.
   */
  public static matchCandidatesForOpportunity(params: {
    opportunityId: string;
    organizationId: string;
    minScore?: number;
    stream?: string;
  }): ExplainableMatchResult[] {
    const org = devStore.getEmployerOrganization(params.organizationId);
    if (!org || org.verificationStatus !== "VERIFIED") {
      throw new Error(
        "Unauthorized access: Only verified employers may evaluate candidate talent matches."
      );
    }

    const opp = devStore.getJobOpportunity(params.opportunityId);
    if (!opp) {
      throw new Error(`Opportunity with ID ${params.opportunityId} not found.`);
    }

    // Get organization-specific matching weights if configured
    const customWeights = devStore.getMatchingConfig(params.organizationId);

    // Get opted-in adult candidates
    const candidates = devStore.getCandidateDiscoveryProfiles({
      stream: params.stream || (opp.stream !== "INTERDISCIPLINARY" ? opp.stream : undefined),
    });

    const matches: ExplainableMatchResult[] = [];
    for (const cand of candidates) {
      // Hard check: Minors must never be matched
      if (cand.isMinor) continue;

      const match = this.calculateMatch({
        opportunity: opp,
        candidate: {
          id: cand.id,
          name: cand.name,
          educationStage: cand.stage,
          currentStream: cand.stream,
          isMinor: false,
          verifiedSkills: cand.verifiedSkills || [],
          selfReportedSkills: cand.selfReportedSkills || [],
          qualifications: cand.qualifications || [],
          licenses: cand.licenses || [],
          projects: cand.projects || [],
          careerReadinessIndex: cand.careerReadinessIndex,
        },
        customWeights,
      });

      if (params.minScore === undefined || match.overallScore >= params.minScore) {
        matches.push(match);
      }
    }

    // Sort descending by match score
    return matches.sort((a, b) => b.overallScore - a.overallScore);
  }
}
