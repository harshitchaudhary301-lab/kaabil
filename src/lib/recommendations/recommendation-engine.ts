// ==============================================================================
// KAABIL (काबिल) — Hybrid Recommendation Engine (Layer 2)
// Transparent, explainable, and multi-factor career compatibility calculation
// Provisional Product Heuristic — Not a black-box probability or aptitude score
// ==============================================================================

import { CareerPathData, EducationalStream, EducationStage } from "@/types";
import { CAREER_PATHS_DATABASE } from "@/data/careersData";

export interface StudentProfileContext {
  id: string;
  name: string;
  educationStage: EducationStage | string;
  primaryStream: EducationalStream | string;
  selectedStreams: (EducationalStream | string)[];
  interests: string[];
  skills: {
    name: string;
    proficiency: "NOVICE" | "BEGINNER" | "INTERMEDIATE" | "PROFICIENT" | "EXPERT";
    isVerified?: boolean;
  }[];
  careerGoal?: {
    goalType?: string;
    targetRole?: string | null;
  };
  learningPreferences?: {
    preferredPace?: string;
    preferredStyle?: string;
    weeklyHoursAvailable?: number;
    primaryLanguage?: string;
  };
}

export interface CompatibilityReport {
  career: CareerPathData;
  compatibilityScore: number; // 0 to 100%
  scoreCategory: "STRONG_FIT" | "GOOD_FIT" | "EXPLORATORY_FIT" | "BRIDGE_REQUIRED";
  breakdown: {
    interestScore: number; // Max 30
    streamScore: number;   // Max 20
    skillScore: number;    // Max 20
    goalScore: number;     // Max 20
    preferenceScore: number; // Max 10
  };
  matchedInterests: string[];
  matchedSkills: string[];
  skillsToDevelop: string[];
  isBridgePath: boolean;
  isSelfReportedSkillOnly: boolean;
  explanationPoints: string[];
}

export class CareerRecommendationEngine {
  // Configurable heuristic weights
  private static WEIGHTS = {
    INTEREST: 30,
    STREAM: 20,
    SKILL: 20,
    GOAL: 20,
    PREFERENCE: 10,
  };

  /**
   * Computes personalized recommendations across all career paths for a student profile.
   */
  static getRecommendations(
    profile: StudentProfileContext,
    catalog: CareerPathData[] = CAREER_PATHS_DATABASE,
    limit: number = 6
  ): CompatibilityReport[] {
    const scoredReports: CompatibilityReport[] = catalog.map((career) =>
      this.evaluateCareerCompatibility(profile, career)
    );

    // Sort by descending compatibility score, then title
    scoredReports.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return scoredReports.slice(0, limit);
  }

  /**
   * Evaluates compatibility between one student profile and one career path.
   */
  static evaluateCareerCompatibility(
    profile: StudentProfileContext,
    career: CareerPathData
  ): CompatibilityReport {
    // 1. Interest Alignment (Max 30)
    const { interestScore, matchedInterests } = this.calculateInterestScore(profile.interests, career);

    // 2. Stream & Educational Alignment (Max 20)
    const { streamScore, isBridgePath } = this.calculateStreamScore(
      profile.primaryStream,
      profile.selectedStreams,
      career.stream
    );

    // 3. Skill Alignment (Max 20)
    const { skillScore, matchedSkills, skillsToDevelop, isSelfReportedOnly } = this.calculateSkillScore(
      profile.skills,
      career.skills
    );

    // 4. Career Goal Alignment (Max 20)
    const goalScore = this.calculateGoalScore(profile.careerGoal, career);

    // 5. Learning Preferences (Max 10)
    const preferenceScore = this.calculatePreferenceScore(profile.learningPreferences, career);

    const totalRawScore = interestScore + streamScore + skillScore + goalScore + preferenceScore;
    const finalScore = Math.min(98, Math.max(25, Math.round(totalRawScore))); // Bounded heuristic

    let scoreCategory: CompatibilityReport["scoreCategory"] = "EXPLORATORY_FIT";
    if (finalScore >= 80) scoreCategory = "STRONG_FIT";
    else if (finalScore >= 65) scoreCategory = "GOOD_FIT";
    else if (isBridgePath) scoreCategory = "BRIDGE_REQUIRED";

    const explanationPoints = this.buildExplanationPoints(
      profile,
      career,
      matchedInterests,
      matchedSkills,
      isBridgePath
    );

    return {
      career,
      compatibilityScore: finalScore,
      scoreCategory,
      breakdown: {
        interestScore: Math.round(interestScore),
        streamScore: Math.round(streamScore),
        skillScore: Math.round(skillScore),
        goalScore: Math.round(goalScore),
        preferenceScore: Math.round(preferenceScore),
      },
      matchedInterests,
      matchedSkills,
      skillsToDevelop,
      isBridgePath,
      isSelfReportedSkillOnly: isSelfReportedOnly,
      explanationPoints,
    };
  }

  /**
   * Evaluates interest overlap against career title, overview, and domain
   */
  private static calculateInterestScore(
    interests: string[],
    career: CareerPathData
  ): { interestScore: number; matchedInterests: string[] } {
    if (!interests || interests.length === 0) {
      return { interestScore: 15, matchedInterests: [] }; // Neutral baseline for missing data
    }

    const matchedInterests: string[] = [];
    const textBlob = `${career.title} ${career.overview} ${career.domainName} ${career.tagline}`.toLowerCase();

    for (const interest of interests) {
      const words = interest.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const isMatch = words.some((w) => textBlob.includes(w));
      if (isMatch) {
        matchedInterests.push(interest);
      }
    }

    // Ratio of matches scaled to max weight 30
    const matchRatio = Math.min(1.0, matchedInterests.length / Math.min(4, interests.length));
    const score = Math.max(10, matchRatio * this.WEIGHTS.INTEREST);

    return { interestScore: score, matchedInterests };
  }

  /**
   * Evaluates stream direct fit vs bridge fit
   */
  private static calculateStreamScore(
    primaryStream: string,
    selectedStreams: string[],
    careerStream: string
  ): { streamScore: number; isBridgePath: boolean } {
    // Exact primary match
    if (primaryStream === careerStream) {
      return { streamScore: this.WEIGHTS.STREAM, isBridgePath: false };
    }

    // Secondary selected stream match
    if (selectedStreams && selectedStreams.includes(careerStream)) {
      return { streamScore: 16, isBridgePath: false };
    }

    // Undecided exploration or interdisciplinary bridge
    if (careerStream === "UNDECIDED" || primaryStream === "UNDECIDED" || careerStream === "INTERDISCIPLINARY") {
      return { streamScore: 14, isBridgePath: true };
    }

    // Cross-stream bridge pathway (e.g. Commerce entering Design, STEM entering Law)
    return { streamScore: 10, isBridgePath: true };
  }

  /**
   * Evaluates self-reported and verified skill overlap
   */
  private static calculateSkillScore(
    studentSkills: StudentProfileContext["skills"],
    careerSkills: CareerPathData["skills"]
  ): {
    skillScore: number;
    matchedSkills: string[];
    skillsToDevelop: string[];
    isSelfReportedOnly: boolean;
  } {
    if (!studentSkills || studentSkills.length === 0) {
      const defaultToDevelop = careerSkills.slice(0, 3).map((s) => s.name);
      return {
        skillScore: 10,
        matchedSkills: [],
        skillsToDevelop: defaultToDevelop,
        isSelfReportedOnly: true,
      };
    }

    const matchedSkills: string[] = [];
    let hasVerifiedMatch = false;

    for (const sk of studentSkills) {
      const match = careerSkills.find(
        (cs) => cs.name.toLowerCase().includes(sk.name.toLowerCase()) ||
                sk.name.toLowerCase().includes(cs.name.toLowerCase())
      );
      if (match) {
        matchedSkills.push(match.name);
        if (sk.isVerified) hasVerifiedMatch = true;
      }
    }

    const skillsToDevelop = careerSkills
      .filter((cs) => !matchedSkills.includes(cs.name))
      .slice(0, 3)
      .map((cs) => cs.name);

    const matchRatio = Math.min(1.0, matchedSkills.length / Math.min(3, careerSkills.length));
    const score = Math.max(8, matchRatio * this.WEIGHTS.SKILL);

    return {
      skillScore: score,
      matchedSkills,
      skillsToDevelop,
      isSelfReportedOnly: !hasVerifiedMatch,
    };
  }

  /**
   * Evaluates career goal overlap
   */
  private static calculateGoalScore(
    goal: StudentProfileContext["careerGoal"],
    career: CareerPathData
  ): number {
    if (!goal || !goal.targetRole) return 12; // Neutral default

    const target = goal.targetRole.toLowerCase();
    const title = career.title.toLowerCase();

    if (title.includes(target) || target.includes(title)) {
      return this.WEIGHTS.GOAL; // 20
    }

    // Partial word match
    const targetWords = target.split(/\s+/).filter((w) => w.length > 3);
    if (targetWords.some((w) => title.includes(w) || career.overview.toLowerCase().includes(w))) {
      return 16;
    }

    return 10;
  }

  /**
   * Evaluates learning style & pace preferences
   */
  private static calculatePreferenceScore(
    prefs: StudentProfileContext["learningPreferences"],
    career: CareerPathData
  ): number {
    if (!prefs) return 7;

    let score = 7;
    // Practical style match with hands-on careers
    if (prefs.preferredStyle === "PRACTICAL" && (career.stream === "NON_MEDICAL_PCM" || career.stream === "VOCATIONAL_TRADES" || career.stream === "CREATIVE_DESIGN")) {
      score += 3;
    } else if (prefs.preferredStyle === "THEORETICAL" && (career.stream === "LAW" || career.stream === "ARTS_HUMANITIES" || career.stream === "COMMERCE")) {
      score += 3;
    } else {
      score += 2;
    }

    return Math.min(this.WEIGHTS.PREFERENCE, score);
  }

  /**
   * Constructs human-readable explanation points
   */
  private static buildExplanationPoints(
    profile: StudentProfileContext,
    career: CareerPathData,
    matchedInterests: string[],
    matchedSkills: string[],
    isBridgePath: boolean
  ): string[] {
    const points: string[] = [];

    if (matchedInterests.length > 0) {
      points.push(`Aligned with your stated interest in ${matchedInterests.slice(0, 2).join(" and ")}.`);
    }

    if (matchedSkills.length > 0) {
      points.push(`Builds upon your existing competency in ${matchedSkills.slice(0, 2).join(" and ")}.`);
    }

    if (isBridgePath) {
      points.push(`Exploratory or bridge pathway accessible from your educational stage through recognized gateway entrance pathways.`);
    } else {
      points.push(`Direct traditional fit for your primary educational stream (${career.streamTitle}).`);
    }

    if (career.regulatoryBody) {
      points.push(`Regulated Indian profession accredited under ${career.regulatoryBody}.`);
    }

    return points;
  }
}
