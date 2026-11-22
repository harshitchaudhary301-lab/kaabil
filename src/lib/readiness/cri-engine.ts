// ==============================================================================
// KAABIL (काबिल) — Career Readiness Index (CRI) Engine (v1.0 Elevated)
// Configurable, explainable multi-dimensional career preparation framework
// Strict Zero-Fabrication: Integrates Profile, Skill Tree, Diagnostic Evidence,
// Practical Project Deliverables, and Learning Sprint Sprints.
// ==============================================================================

import { prisma, checkDatabaseConnection } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { getCareerBySlug } from "@/data/careersData";

export type ReadinessStatus =
  | "UNASSESSED"
  | "INSUFFICIENT_EVIDENCE"
  | "DEVELOPING"
  | "COMPETENT"
  | "ADVANCED";

export interface ReadinessDimensionScore {
  name: string;
  weight: number; // percentage (e.g. 20%)
  score: number;  // 0 to 100
  weightedPoints: number;
  evidencePoints: string[];
  missingEvidence: string[];
}

export interface NextBestActionItem {
  title: string;
  titleHi?: string;
  titleHinglish?: string;
  description: string;
  actionUrl: string;
  impactPoints: number;
  category: "ASSESSMENT" | "PROJECT" | "LEARNING_TASK" | "PROFILE";
}

export interface CareerReadinessResult {
  overallScore: number | null; // null if unassessed or insufficient evidence
  status: ReadinessStatus;
  statusLabel: string;
  statusLabelHi?: string;
  statusLabelHinglish?: string;
  careerSlug: string;
  careerTitle: string;
  stream: string;
  dimensions: {
    careerKnowledge: ReadinessDimensionScore;
    educationalPreparation: ReadinessDimensionScore;
    skillDevelopment: ReadinessDimensionScore;
    practicalLearning: ReadinessDimensionScore;
    milestoneProgress: ReadinessDimensionScore;
  };
  evidenceSummary: {
    selfReportedCount: number;
    verifiedCount: number;
    completedMilestones: number;
    completedMissions: number;
    projectSubmissionsCount?: number;
    learningSprintTasksCount?: number;
  };
  nextBestAction?: NextBestActionItem;
  calculationFormula?: string;
  isInsufficientEvidence?: boolean;
  adaptationNote: string;
  algorithmVersion: string;
  disclaimer: string;
}

export const CRI_DISCLAIMER =
  "The Career Readiness Index (CRI) is an educational preparation assessment framework. It measures alignment with published educational benchmarks and does NOT predict admission probability, competitive exam rank, or guaranteed employment.";

export class CareerReadinessEngine {
  public static readonly VERSION = "v1.0";

  /**
   * Calculates explainable Career Readiness Index for a student against a target career.
   */
  static async calculateReadiness(
    studentProfileId: string,
    targetCareerSlug?: string
  ): Promise<CareerReadinessResult> {
    let profile: any = null;
    try {
      const conn = await checkDatabaseConnection();
      if (conn.connected) {
        profile = await prisma.studentProfile.findUnique({
          where: { id: studentProfileId },
          include: {
            educationalHistory: true,
            interests: true,
            userSkills: { include: { skill: true } },
            careerGoals: { include: { careerPath: true } },
            roadmaps: {
              where: { status: "ACTIVE" },
              include: { milestones: true },
              take: 1,
            },
            dailyMissions: {
              where: { status: "COMPLETED" },
            },
          },
        });
      }
    } catch {
      // Offline fallback: profile remains null
    }

    if (!profile) {
      profile = devStore.getProfile(studentProfileId);
    }

    if (!profile) {
      return this.buildEmptyResult("undecided", "Undecided Career", "UNDECIDED", "UNASSESSED");
    }

    // Determine target career
    const activeCareerSlug =
      targetCareerSlug ||
      profile.careerGoals?.[0]?.careerPath?.slug ||
      profile.careerGoals?.[0]?.targetRoleSlug ||
      "ai-systems-engineer";

    const careerData = getCareerBySlug(activeCareerSlug);
    const careerTitle = careerData?.title || "Career Pathway";
    const careerStream = careerData?.stream || profile.currentStream || "NON_MEDICAL_PCM";

    // Gather real student evidence from DB and devStore
    const userSkills = profile.userSkills || [];
    const interests = profile.interests || [];
    const roadmaps = profile.roadmaps || [];
    const dailyMissions = profile.dailyMissions || [];

    // Also load devStore evidences, project enrollments, and learning task states
    const devEvidences = devStore.getSkillEvidences(studentProfileId) || [];
    const projectEnrollmentsMap = devStore.getProjectEnrollments(studentProfileId) || {};
    const taskStatesMap = devStore.getLearningTaskStates(studentProfileId) || {};

    const submittedProjects = Object.values(projectEnrollmentsMap).filter(
      (e: any) => e.status === "SUBMITTED"
    );
    const completedSprintTasks = Object.values(taskStatesMap).filter(
      (t: any) => t.isCompleted
    );

    // Filter verified evidences
    const verifiedEvidences = devEvidences.filter(
      (e: any) => e.isVerified || e.verificationStatus === "VERIFIED"
    );

    // Calculate real counts
    let verifiedCount = 0;
    let selfReportedCount = 0;
    const seenSkills = new Set<string>();

    userSkills.forEach((us: any) => {
      const name = (us.skill?.name || us.name || "").toLowerCase().trim();
      if (name) seenSkills.add(name);
      if (us.isVerified) {
        verifiedCount++;
      } else {
        selfReportedCount++;
      }
    });

    verifiedEvidences.forEach((ev: any) => {
      const name = (ev.skillName || "").toLowerCase().trim();
      if (name && !seenSkills.has(name)) {
        seenSkills.add(name);
        verifiedCount++;
      }
    });

    const hasAnySkill = userSkills.length > 0 || devEvidences.length > 0;
    const hasAnyInterest = interests.length > 0;
    const hasRoadmap = roadmaps.length > 0;
    const hasMissions = dailyMissions.length > 0;
    const hasProjects = submittedProjects.length > 0;
    const hasTasks = completedSprintTasks.length > 0;

    // Check for unassessed or brand new profile (Requirement 10: Insufficient Evidence Guard)
    if (!hasAnySkill && !hasAnyInterest && !hasRoadmap && !hasMissions && !hasProjects && !hasTasks) {
      return this.buildEmptyResult(activeCareerSlug, careerTitle, careerStream, "UNASSESSED");
    }

    if (!hasAnySkill && !hasRoadmap && !hasProjects && !hasTasks) {
      return this.buildEmptyResult(
        activeCareerSlug,
        careerTitle,
        careerStream,
        "INSUFFICIENT_EVIDENCE",
        "Profile contains initial exploratory interests but lacks verified assessment scores, practical projects, or sprint activity."
      );
    }

    // =========================================================================
    // 1. Dimension 1: Career Knowledge (20%)
    // =========================================================================
    const knowledgeEvidence: string[] = [];
    const knowledgeMissing: string[] = [];
    let knowledgeScore = 40; // baseline for having chosen a target career

    if (hasAnyInterest) {
      knowledgeScore += 30;
      knowledgeEvidence.push(`Documented ${interests.length} academic & career interest vectors.`);
    } else {
      knowledgeMissing.push("No explicit interest profile recorded.");
    }

    if (dailyMissions.length > 0) {
      knowledgeScore += Math.min(30, dailyMissions.length * 10);
      knowledgeEvidence.push(`Completed ${dailyMissions.length} career discovery missions.`);
    } else {
      knowledgeMissing.push("No daily career discovery missions completed yet.");
    }
    knowledgeScore = Math.min(100, knowledgeScore);

    // =========================================================================
    // 2. Dimension 2: Educational Preparation (25%)
    // =========================================================================
    const eduEvidence: string[] = [];
    const eduMissing: string[] = [];
    let eduScore = 50;

    const isStageCompatible =
      profile.educationStage !== "CLASS_8" && profile.educationStage !== "CLASS_9";
    if (isStageCompatible) {
      eduScore += 30;
      eduEvidence.push(
        `Education stage (${(profile.educationStage || "UNDERGRADUATE").replace(/_/g, " ")}) meets baseline requirement.`
      );
    } else {
      eduMissing.push(
        "Early secondary stage: focus is exploratory foundations rather than terminal qualification."
      );
    }

    if (profile.currentStream === careerStream || careerStream === "UNDECIDED") {
      eduScore += 20;
      eduEvidence.push(`Stream alignment: Current stream matches ${(careerStream || "").replace(/_/g, " ")}.`);
    } else {
      eduScore += 10;
      eduEvidence.push(`Cross-stream transition: Will require bridge qualification under NEP 2020.`);
    }
    eduScore = Math.min(100, eduScore);

    // =========================================================================
    // 3. Dimension 3: Skill Development (25%)
    // =========================================================================
    const skillEvidence: string[] = [];
    const skillMissing: string[] = [];
    let skillScore = 0;

    if (verifiedCount > 0) {
      skillScore += Math.min(80, verifiedCount * 30);
      skillEvidence.push(`${verifiedCount} skill(s) verified through proctored diagnostic checkpoints.`);
    } else {
      skillMissing.push("Zero verified skills. Self-reported claims are discounted until objectively assessed.");
    }

    if (selfReportedCount > 0) {
      skillScore += Math.min(20, selfReportedCount * 5);
      skillEvidence.push(`${selfReportedCount} self-reported skill(s) documented in profile.`);
    }
    skillScore = Math.min(100, Math.max(15, skillScore));

    // =========================================================================
    // 4. Dimension 4: Practical Learning & Projects (15%)
    // =========================================================================
    const practicalEvidence: string[] = [];
    const practicalMissing: string[] = [];
    let practicalScore = 20; // baseline

    if (submittedProjects.length > 0) {
      practicalScore += Math.min(60, submittedProjects.length * 30);
      practicalEvidence.push(
        `Completed and submitted ${submittedProjects.length} real-world portfolio project(s).`
      );
    } else {
      practicalMissing.push("No practical projects submitted in Projects Hub yet.");
    }

    if (dailyMissions.length >= 2) {
      practicalScore += 20;
      practicalEvidence.push(`Completed ${dailyMissions.length} hands-on daily missions.`);
    }

    if (verifiedCount >= 1) {
      practicalScore += 20;
      practicalEvidence.push("Practical verification evidence on file.");
    }
    practicalScore = Math.min(100, practicalScore);

    // =========================================================================
    // 5. Dimension 5: Learning Consistency & Milestones (15%)
    // =========================================================================
    const milestoneEvidence: string[] = [];
    const milestoneMissing: string[] = [];
    let milestoneScore = 20;
    let completedMilestonesCount = 0;

    if (completedSprintTasks.length > 0) {
      const sprintPts = Math.min(50, completedSprintTasks.length * 10);
      milestoneScore += sprintPts;
      milestoneEvidence.push(
        `Completed ${completedSprintTasks.length} daily sprint tasks in Personalized Learning Plan.`
      );
    }

    if (roadmaps.length > 0) {
      const activeRoadmap = roadmaps[0];
      const milestones = activeRoadmap.milestones || [];
      const completed = milestones.filter((m: any) => m.isCompleted);
      completedMilestonesCount = completed.length;

      if (milestones.length > 0) {
        const pct = Math.round((completed.length / milestones.length) * 100);
        milestoneScore = Math.min(100, milestoneScore + Math.round(pct * 0.5));
        milestoneEvidence.push(`${completed.length} of ${milestones.length} roadmap milestones completed (${pct}%).`);
      }
    } else if (completedSprintTasks.length === 0) {
      milestoneMissing.push("Complete daily sprint tasks in your Learning Plan to establish habit consistency.");
    }
    milestoneScore = Math.min(100, milestoneScore);

    // =========================================================================
    // Overall Weighted Score
    // Formula: (Knowledge * 0.20) + (Edu * 0.25) + (Skill * 0.25) + (Practical * 0.15) + (Milestone * 0.15)
    // =========================================================================
    const weightedScore = Math.round(
      knowledgeScore * 0.20 +
      eduScore * 0.25 +
      skillScore * 0.25 +
      practicalScore * 0.15 +
      milestoneScore * 0.15
    );

    let status: ReadinessStatus = "DEVELOPING";
    let statusLabel = "Developing Foundations";
    let statusLabelHi = "बुनियादी विकास चरण";
    let statusLabelHinglish = "Developing Foundations";

    if (weightedScore >= 80 && verifiedCount >= 1) {
      status = "ADVANCED";
      statusLabel = "Advanced Preparation";
      statusLabelHi = "उन्नत तैयारी";
      statusLabelHinglish = "Advanced Preparation";
    } else if (weightedScore >= 65) {
      status = "COMPETENT";
      statusLabel = "Competent Benchmark";
      statusLabelHi = "सक्षम मानक";
      statusLabelHinglish = "Competent Benchmark";
    }

    // Determine Next Best Action (Requirement 11)
    let nextBestAction: NextBestActionItem;
    if (verifiedCount === 0) {
      nextBestAction = {
        title: "Verify Your First Competency Checkpoint",
        titleHi: "अपनी पहली कौशल जांच परीक्षा लें",
        titleHinglish: "Pehla skill diagnostic quiz complete karein",
        description: "Take an objective diagnostic assessment to verify foundational skills and earn verified credential points.",
        actionUrl: "/student/assessments",
        impactPoints: 15,
        category: "ASSESSMENT",
      };
    } else if (submittedProjects.length === 0) {
      nextBestAction = {
        title: "Submit a Practical Project Deliverable",
        titleHi: "व्यावहारिक प्रोजेक्ट सबमिट करें",
        titleHinglish: "Projects Hub me practical project submit karein",
        description: "Build and submit your first career project deliverable to boost your practical portfolio score.",
        actionUrl: "/student/learning-plan",
        impactPoints: 12,
        category: "PROJECT",
      };
    } else if (completedSprintTasks.length < 5) {
      nextBestAction = {
        title: "Complete Week 1 Daily Sprint Tasks",
        titleHi: "सप्ताह 1 के दैनिक कार्य पूरे करें",
        titleHinglish: "Week 1 sprint daily tasks complete karein",
        description: "Maintain your learning streak by finishing your curated daily tasks in the Learning Plan.",
        actionUrl: "/student/learning-plan",
        impactPoints: 8,
        category: "LEARNING_TASK",
      };
    } else {
      nextBestAction = {
        title: "Advance to Intermediate Skill Challenge",
        titleHi: "मध्यम स्तर की चुनौती लें",
        titleHinglish: "Next intermediate milestone unlock karein",
        description: "Tackle intermediate competency nodes in your Career Skill Tree to target higher readiness.",
        actionUrl: "/student/skill-tree",
        impactPoints: 10,
        category: "ASSESSMENT",
      };
    }

    const adaptationNote = this.getAdaptationNote(profile.educationStage || "UNDERGRADUATE", careerTitle);

    const result: CareerReadinessResult = {
      overallScore: weightedScore,
      status,
      statusLabel,
      statusLabelHi,
      statusLabelHinglish,
      careerSlug: activeCareerSlug,
      careerTitle,
      stream: careerStream,
      dimensions: {
        careerKnowledge: {
          name: "Career Domain Knowledge",
          weight: 20,
          score: knowledgeScore,
          weightedPoints: Math.round(knowledgeScore * 0.20),
          evidencePoints: knowledgeEvidence,
          missingEvidence: knowledgeMissing,
        },
        educationalPreparation: {
          name: "Educational & Subject Preparation",
          weight: 25,
          score: eduScore,
          weightedPoints: Math.round(eduScore * 0.25),
          evidencePoints: eduEvidence,
          missingEvidence: eduMissing,
        },
        skillDevelopment: {
          name: "Skill Genome & Verification",
          weight: 25,
          score: skillScore,
          weightedPoints: Math.round(skillScore * 0.25),
          evidencePoints: skillEvidence,
          missingEvidence: skillMissing,
        },
        practicalLearning: {
          name: "Practical Application & Projects",
          weight: 15,
          score: practicalScore,
          weightedPoints: Math.round(practicalScore * 0.15),
          evidencePoints: practicalEvidence,
          missingEvidence: practicalMissing,
        },
        milestoneProgress: {
          name: "Learning Consistency & Sprints",
          weight: 15,
          score: milestoneScore,
          weightedPoints: Math.round(milestoneScore * 0.15),
          evidencePoints: milestoneEvidence,
          missingEvidence: milestoneMissing,
        },
      },
      evidenceSummary: {
        selfReportedCount,
        verifiedCount,
        completedMilestones: completedMilestonesCount,
        completedMissions: dailyMissions.length,
        projectSubmissionsCount: submittedProjects.length,
        learningSprintTasksCount: completedSprintTasks.length,
      },
      nextBestAction,
      calculationFormula: "Readiness = (Domain Knowledge × 20%) + (Education Preparation × 25%) + (Skill Genome × 25%) + (Practical Projects × 15%) + (Learning Sprints × 15%)",
      isInsufficientEvidence: false,
      adaptationNote,
      algorithmVersion: CareerReadinessEngine.VERSION,
      disclaimer: CRI_DISCLAIMER,
    };

    // Asynchronously record snapshot if DB available
    this.recordSnapshot(studentProfileId, activeCareerSlug, result).catch(() => {});

    return result;
  }

  private static buildEmptyResult(
    careerSlug: string,
    careerTitle: string,
    stream: string,
    status: ReadinessStatus,
    reason?: string
  ): CareerReadinessResult {
    return {
      overallScore: null,
      status,
      statusLabel: status === "UNASSESSED" ? "Unassessed (Not enough information yet)" : "Insufficient Evidence (Not enough information yet)",
      statusLabelHi: "अमूल्यांकित (पर्याप्त जानकारी उपलब्ध नहीं)",
      statusLabelHinglish: "Not enough information yet",
      careerSlug,
      careerTitle,
      stream,
      dimensions: {
        careerKnowledge: {
          name: "Career Domain Knowledge",
          weight: 20,
          score: 0,
          weightedPoints: 0,
          evidencePoints: [],
          missingEvidence: ["Explore career pathway details and document initial interests."],
        },
        educationalPreparation: {
          name: "Educational & Subject Preparation",
          weight: 25,
          score: 0,
          weightedPoints: 0,
          evidencePoints: [],
          missingEvidence: ["Set education stage and academic stream."],
        },
        skillDevelopment: {
          name: "Skill Genome & Verification",
          weight: 25,
          score: 0,
          weightedPoints: 0,
          evidencePoints: [],
          missingEvidence: ["Take a diagnostic checkpoint to verify your first skill."],
        },
        practicalLearning: {
          name: "Practical Application & Projects",
          weight: 15,
          score: 0,
          weightedPoints: 0,
          evidencePoints: [],
          missingEvidence: ["Build and submit a project in Projects Hub."],
        },
        milestoneProgress: {
          name: "Learning Consistency & Sprints",
          weight: 15,
          score: 0,
          weightedPoints: 0,
          evidencePoints: [],
          missingEvidence: ["Complete daily sprint tasks in your Learning Plan."],
        },
      },
      evidenceSummary: {
        selfReportedCount: 0,
        verifiedCount: 0,
        completedMilestones: 0,
        completedMissions: 0,
        projectSubmissionsCount: 0,
        learningSprintTasksCount: 0,
      },
      nextBestAction: {
        title: "Take Your First Diagnostic Checkpoint",
        titleHi: "अपनी पहली कौशल जांच परीक्षा लें",
        titleHinglish: "Apna first skill diagnostic quiz complete karein",
        description: "Verify your core foundational skills through a 10-minute diagnostic checkpoint to unlock your baseline Career Readiness score.",
        actionUrl: "/student/assessments",
        impactPoints: 15,
        category: "ASSESSMENT",
      },
      calculationFormula: "Readiness = (Domain Knowledge × 20%) + (Education Preparation × 25%) + (Skill Genome × 25%) + (Practical Projects × 15%) + (Learning Sprints × 15%)",
      isInsufficientEvidence: true,
      adaptationNote: reason || "Complete your first diagnostic checkpoint or project milestone to establish your verified readiness baseline.",
      algorithmVersion: CareerReadinessEngine.VERSION,
      disclaimer: CRI_DISCLAIMER,
    };
  }

  private static getAdaptationNote(stage: string, careerTitle: string): string {
    if (stage.includes("CLASS_8") || stage.includes("CLASS_9") || stage.includes("CLASS_10")) {
      return `Secondary Stage Calibration: Evaluated primarily on foundational curiosity, subject awareness, and exploratory habit. Professional licensure criteria are not penalized at this stage.`;
    }
    if (stage.includes("CLASS_11") || stage.includes("CLASS_12")) {
      return `Senior Secondary Calibration: Evaluated on entrance examination syllabus alignment and foundational prerequisite mastery for ${careerTitle}.`;
    }
    return `Higher Education & Professional Calibration: Evaluated on verifiable competencies, portfolio projects, and statutory qualification milestones.`;
  }

  private static async recordSnapshot(
    studentProfileId: string,
    careerSlug: string,
    result: CareerReadinessResult
  ) {
    if (result.overallScore === null) return;
    try {
      const conn = await checkDatabaseConnection();
      if (conn.connected) {
        await prisma.careerReadinessSnapshot.create({
          data: {
            studentProfileId,
            careerSlug,
            criScore: result.overallScore,
            readinessStatus: result.status,
            weightedCoverage: result.dimensions.skillDevelopment.score / 100,
            practicalRatio: result.dimensions.practicalLearning.score / 100,
            academicRatio: result.dimensions.educationalPreparation.score / 100,
            verifiedRatio: result.evidenceSummary.verifiedCount > 0 ? 1.0 : 0.0,
            dimensionBreakdown: result.dimensions as any,
            algorithmVersion: CareerReadinessEngine.VERSION,
          },
        });

        // Update student profile CRI cache
        await prisma.studentProfile.update({
          where: { id: studentProfileId },
          data: { careerReadinessIndex: result.overallScore },
        });
      }
    } catch {
      // Safe fallback
    }
  }
}
