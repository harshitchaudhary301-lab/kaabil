import { CareerRole, CAREER_ROLES, SkillRequirement } from '../data/roles';

export interface UserSkillProfile {
  [skillName: string]: number; // 0 - 100 proficiency level
}

export interface SkillMathBreakdown {
  skill: string;
  current: number;
  required: number;
  weight: number;
  ratio: number;
  cappedRatio: number;
  contribution: number; // weight * cappedRatio
  gap: number;
  importance: number;
  priority: number;
}

export interface RoleFitScore {
  role: CareerRole;
  fitPercentage: number; // 0 - 100
  coverageScore: number; // 0 - 1
  textSimilarityScore: number; // 0 - 1
  interestScore: number; // 0 - 1
  breakdown: SkillMathBreakdown[];
  strongestSkills: SkillMathBreakdown[];
  criticalGaps: SkillMathBreakdown[];
  mathSummary: {
    coveragePart: number; // 0.7 * coverage
    textPart: number;     // 0.2 * textSimilarity
    interestPart: number; // 0.1 * interest
    totalWeighted: number;
  };
}

/**
 * Basic word-level TF-IDF vectorizer for text cosine similarity
 */
function computeTfIdfCosine(docA: string, docB: string): number {
  if (!docA || !docB) return 0.2; // default neutral similarity

  const tokenize = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9+#\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  };

  const tokensA = tokenize(docA);
  const tokensB = tokenize(docB);

  const freqA = new Map<string, number>();
  const freqB = new Map<string, number>();

  tokensA.forEach(t => freqA.set(t, (freqA.get(t) || 0) + 1));
  tokensB.forEach(t => freqB.set(t, (freqB.get(t) || 0) + 1));

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  freqA.forEach((countA, token) => {
    normA += countA * countA;
    if (freqB.has(token)) {
      dotProduct += countA * freqB.get(token)!;
    }
  });

  freqB.forEach(countB => {
    normB += countB * countB;
  });

  if (normA === 0 || normB === 0) return 0.2;
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  // Bound to 0.15 - 0.95 range for realistic resume texts
  return Math.max(0.1, Math.min(0.98, similarity * 1.5));
}

/**
 * Calculates interest overlap ratio
 */
function computeInterestOverlap(userInterests: string[], roleTags: string[]): number {
  if (!userInterests || userInterests.length === 0) return 0.5; // neutral assumption if skipped
  const roleSet = new Set(roleTags.map(t => t.toLowerCase()));
  const matches = userInterests.filter(i => roleSet.has(i.toLowerCase()));
  const overlap = matches.length / Math.max(1, Math.min(userInterests.length, roleTags.length));
  return Math.min(1.0, Math.max(0.2, overlap));
}

/**
 * Computes explainable role fit score for a specific role
 */
export function calculateRoleFit(
  role: CareerRole,
  skills: UserSkillProfile,
  rawResumeText: string,
  userInterests: string[]
): RoleFitScore {
  let sumWeights = 0;
  let weightedCoverageSum = 0;

  const breakdown: SkillMathBreakdown[] = role.skillRequirements.map(req => {
    const current = skills[req.skill] !== undefined ? skills[req.skill] : 0;
    const required = req.required;
    const weight = req.weight;
    const importance = req.importance;

    const ratio = required > 0 ? current / required : 1;
    const cappedRatio = Math.min(ratio, 1.0);
    const contribution = weight * cappedRatio;

    const gap = Math.max(required - current, 0);
    const priority = Number((importance * gap).toFixed(1));

    sumWeights += weight;
    weightedCoverageSum += contribution;

    return {
      skill: req.skill,
      current,
      required,
      weight,
      ratio,
      cappedRatio,
      contribution,
      gap,
      importance,
      priority
    };
  });

  // Safe fallback if sumWeights != 1
  const coverageScore = sumWeights > 0 ? weightedCoverageSum / sumWeights : 0;

  // Text similarity
  const profileCorpus = rawResumeText && rawResumeText.trim().length > 20
    ? rawResumeText
    : Object.keys(skills).join(' ') + ' ' + userInterests.join(' ');
  const textSimilarityScore = computeTfIdfCosine(profileCorpus, role.corpus);

  // Interest score
  const interestScore = computeInterestOverlap(userInterests, role.interestTags);

  // Fit = round((0.7×coverage + 0.2×text_similarity + 0.1×interest) × 100)
  const coveragePart = 0.7 * coverageScore;
  const textPart = 0.2 * textSimilarityScore;
  const interestPart = 0.1 * interestScore;
  const totalWeighted = coveragePart + textPart + interestPart;
  const fitPercentage = Math.min(99, Math.max(12, Math.round(totalWeighted * 100)));

  // Ranked strongest skills (highest capped ratio or current level)
  const strongestSkills = [...breakdown]
    .sort((a, b) => b.cappedRatio - a.cappedRatio || b.current - a.current)
    .filter(s => s.current > 0);

  // Ranked critical gaps (highest priority = importance * gap)
  const criticalGaps = [...breakdown]
    .filter(s => s.gap > 0)
    .sort((a, b) => b.priority - a.priority);

  return {
    role,
    fitPercentage,
    coverageScore,
    textSimilarityScore,
    interestScore,
    breakdown,
    strongestSkills,
    criticalGaps,
    mathSummary: {
      coveragePart,
      textPart,
      interestPart,
      totalWeighted
    }
  };
}

/**
 * Computes scores across all 8 roles and ranks them descending by Fit %
 */
export function rankAllRoles(
  skills: UserSkillProfile,
  rawResumeText: string,
  userInterests: string[]
): RoleFitScore[] {
  return CAREER_ROLES.map(role => calculateRoleFit(role, skills, rawResumeText, userInterests))
    .sort((a, b) => b.fitPercentage - a.fitPercentage);
}
