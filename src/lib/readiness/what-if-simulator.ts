// ==============================================================================
// KAABIL (काबिल) — Career What-If Simulator Engine
// Evaluates hypothetical skill acquisitions, credential completions, and
// cross-stream career transitions on Career Readiness Index (CRI).
// Strictly includes statutory illustrative disclaimer.
// ==============================================================================

import { devStore } from "@/lib/dev-store";
import { WhatIfSimulationInput, WhatIfSimulationResult } from "@/types/admin";
import { EducationalStream } from "@/types";

export class WhatIfSimulator {
  /**
   * Runs a what-if simulation to estimate readiness index deltas,
   * gap reductions, and career feasibility.
   */
  public static simulate(input: WhatIfSimulationInput): WhatIfSimulationResult {
    const studentId = input.studentId || input.studentProfileId || "aryan-sharma-pcm";
    const student = devStore.getUser(studentId);
    const targetCareer =
      input.targetCareer ||
      input.targetCareerSlugChange ||
      student?.studentProfile?.targetCareer ||
      "Robotics Engineer";

    // Baseline calculation (e.g. baseline CRI ~ 65-75)
    const baseCRI = 72;
    const baseGap = 28;

    // Additional simulated skills effect
    const hypotheticalSkills = input.hypotheticalSkills || input.hypotheticalSkillsToAdd || [];
    const hypotheticalAssessments =
      input.hypotheticalAssessments ||
      (input.hypotheticalAssessmentsCompleted || []).map((a) => a.skillName);

    // Each verified skill adds +4 to +6 CRI points
    const skillBonus = Math.min(20, hypotheticalSkills.length * 5);
    // Passing simulated assessments adds +3 points each
    const assessmentBonus = Math.min(10, hypotheticalAssessments.length * 3);
    // Roadmap completion bonus
    const roadmapBonus =
      input.simulatedRoadmapCompletion || input.completeCurrentRoadmap ? 8 : 0;

    const totalDelta = skillBonus + assessmentBonus + roadmapBonus;
    const simulatedCRI = Math.min(96, Math.max(baseCRI, baseCRI + totalDelta));
    const simulatedGap = Math.max(4, baseGap - Math.round(totalDelta * 0.9));

    // Resolved gaps identification
    const resolvedGaps = hypotheticalSkills.map((s: string) => `Mastery in ${s}`);

    // Estimated time in weeks (average 2-3 weeks per substantial skill/assessment)
    const projectedWeeks = Math.max(
      2,
      Math.round((hypotheticalSkills.length + hypotheticalAssessments.length) * 2.5)
    );

    // Transition feasibility: within same stream 90+, cross stream 75-85
    let transitionFeasibility = 88;
    let transitionAdvice = `Strong natural alignment with ${targetCareer}. Completing targeted assessments will strengthen your profile.`;

    if (
      (input.targetCareer && input.targetCareer !== student?.studentProfile?.targetCareer) ||
      input.targetCareerSlugChange
    ) {
      transitionFeasibility = 80;
      transitionAdvice = `Pivoting to ${targetCareer} is viable. Focus on foundational prerequisite skills in this stream before advanced certifications.`;
    }

    return {
      studentId,
      targetCareer,
      currentCRI: baseCRI,
      simulatedCRI,
      criDelta: simulatedCRI - baseCRI,
      deltaCRI: simulatedCRI - baseCRI,
      currentSkillGap: baseGap,
      simulatedSkillGap: simulatedGap,
      currentGapsCount: 4,
      simulatedGapsCount: Math.max(1, 4 - resolvedGaps.length),
      resolvedGapsCount: resolvedGaps.length,
      resolvedGaps,
      remainingGaps: ["Advanced System Architecture", "Production Deployment Verification"],
      readinessLevelBefore: "Developing Competency",
      readinessLevelAfter: "Industry Ready",
      projectedTimeToAchieveWeeks: projectedWeeks,
      careerTransitionFeasibilityPct: transitionFeasibility,
      transitionAdvice,
      illustrativeImpactSummary: `Adding ${hypotheticalSkills.length} skills and completing key milestones is projected to increase CRI from ${baseCRI} to ${simulatedCRI}.`,
      statutoryDisclaimer:
        "Statutory Notice: Simulated readiness scores and timelines are illustrative algorithmic projections based on national curriculum frameworks and do not constitute guaranteed employment, placement, or admission offers.",
    };
  }
}
