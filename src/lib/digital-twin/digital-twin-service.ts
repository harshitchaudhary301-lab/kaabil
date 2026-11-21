// ==============================================================================
// KAABIL (काबिल) — Career Digital Twin Service
// Dynamic, structured digital twin representing a student's educational & capability trajectory
// ==============================================================================

import { prisma } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { getCareerBySlug, ALL_CAREERS } from "@/data/careersData";

export interface DigitalTwinSkillItem {
  name: string;
  category?: string;
  proficiencyLevel: "NOVICE" | "BEGINNER" | "INTERMEDIATE" | "PROFICIENT" | "EXPERT";
  isVerified: boolean;
  scorePercentage: number;
}

export interface DigitalTwinMilestoneSummary {
  weekNumber: number;
  title: string;
  stage: string;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface CareerDigitalTwinData {
  studentProfileId: string;
  studentName: string;
  summaryHeadline: string;
  currentStage: string;
  currentStageLabel: string;
  primaryStream: string;
  primaryStreamLabel: string;
  selectedStreams: string[];
  targetCareers: {
    slug: string;
    title: string;
    stream: string;
    regulatoryBody?: string;
    priority: number;
  }[];
  interests: string[];
  skills: {
    selfReported: DigitalTwinSkillItem[];
    verified: DigitalTwinSkillItem[];
    totalCount: number;
    verifiedCount: number;
    selfReportedCount: number;
  };
  developmentAreas: {
    skillName: string;
    importance: string;
    targetCareerTitle: string;
  }[];
  learningProgress: {
    totalMilestones: number;
    completedMilestones: number;
    completionPercentage: number;
    recentMilestones: DigitalTwinMilestoneSummary[];
    dailyMissionsCompleted: number;
  };
  readinessStatus: "UNASSESSED" | "INSUFFICIENT_EVIDENCE" | "DEVELOPING" | "COMPETENT" | "ADVANCED";
  readinessScore: number | null; // null if unassessed
  learningVelocityScore: number; // 0-100 score based on activity consistency
  lastCalibratedAt: string;
  algorithmVersion: string;
  disclaimer: string;
}

export const DIGITAL_TWIN_DISCLAIMER =
  "KAABIL Career Digital Twin is an educational capability-mapping and self-reflection tool. It is not a psychometric diagnosis, predictive guarantee of academic admission, or promise of employment.";

export class CareerDigitalTwinService {
  public static readonly ALGORITHM_VERSION = "v1.0";

  /**
   * Generates or retrieves the complete Career Digital Twin for a student profile.
   */
  static async getDigitalTwin(studentProfileId: string): Promise<CareerDigitalTwinData | null> {
    try {
      let profile: any = null;
      try {
      profile = await prisma.studentProfile.findUnique({
        where: { id: studentProfileId },
        include: {
          user: { select: { name: true, email: true } },
          interests: true,
          careerGoals: { include: { careerPath: true } },
          userSkills: { include: { skill: true } },
          roadmaps: {
            where: { status: "ACTIVE" },
            include: { milestones: { orderBy: { weekNumber: "asc" } } },
            take: 1,
          },
          dailyMissions: {
            where: { status: "COMPLETED" },
            select: { id: true },
          },
          digitalTwin: true,
        },
      });
    } catch {
      // Offline fallback
    }

    if (!profile) {
      profile = devStore.getProfile(studentProfileId);
    }

    if (!profile) return null;

      // Extract Target Careers
      const targetCareers: CareerDigitalTwinData["targetCareers"] = [];
      if (profile.careerGoals && profile.careerGoals.length > 0) {
        profile.careerGoals.forEach((goal: any, idx: number) => {
          targetCareers.push({
            slug: goal.careerPath.slug,
            title: goal.careerPath.title,
            stream: getCareerBySlug(goal.careerPath.slug)?.stream || profile.currentStream,
            regulatoryBody: goal.careerPath.regulatoryBody || undefined,
            priority: goal.priorityRank || idx + 1,
          });
        });
      } else if (profile.targetCareerPathId) {
        const found = ALL_CAREERS.find((c) => c.id === profile.targetCareerPathId || c.slug === profile.targetCareerPathId);
        if (found) {
          targetCareers.push({
            slug: found.slug,
            title: found.title,
            stream: found.stream,
            regulatoryBody: found.regulatoryBody,
            priority: 1,
          });
        }
      }

      // If no career goal is chosen yet, provide default exploratory target from stream
      if (targetCareers.length === 0) {
        const streamCareers = ALL_CAREERS.filter((c) => c.stream === profile.currentStream);
        const firstCareer = streamCareers[0] || ALL_CAREERS[0];
        if (firstCareer) {
          targetCareers.push({
            slug: firstCareer.slug,
            title: firstCareer.title,
            stream: firstCareer.stream,
            regulatoryBody: firstCareer.regulatoryBody,
            priority: 1,
          });
        }
      }

      // Categorize Skills (Self-reported vs Verified)
      const selfReportedSkills: DigitalTwinSkillItem[] = [];
      const verifiedSkills: DigitalTwinSkillItem[] = [];

      profile.userSkills.forEach((us: any) => {
        const skillName = us.skill?.name || us.name || "Skill";
        const item: DigitalTwinSkillItem = {
          name: skillName,
          category: us.skill?.category || us.skill?.categoryId || us.category || undefined,
          proficiencyLevel: us.proficiencyLevel as any,
          isVerified: us.isVerified,
          scorePercentage: us.scorePercentage,
        };
        if (us.isVerified) {
          verifiedSkills.push(item);
        } else {
          selfReportedSkills.push(item);
        }
      });

      // Calculate Development Areas (Gaps between target career skills and student skills)
      const primaryTarget = targetCareers[0];
      const targetCareerData = primaryTarget ? getCareerBySlug(primaryTarget.slug) : null;
      const studentSkillNames = new Set((profile.userSkills || []).map((us: any) => (us.skill?.name || us.name || "").toLowerCase()));

      const developmentAreas: CareerDigitalTwinData["developmentAreas"] = [];
      if (targetCareerData && targetCareerData.skills) {
        targetCareerData.skills.forEach((b) => {
          if (!studentSkillNames.has(b.name.toLowerCase())) {
            developmentAreas.push({
              skillName: b.name,
              importance: b.isMandatory ? "Mandatory" : "Recommended",
              targetCareerTitle: targetCareerData.title,
            });
          }
        });
      }

      // Learning Progress from Active Roadmap
      const activeRoadmap = (profile.roadmaps || [])[0];
      const milestones = activeRoadmap?.milestones || [];
      const completedMilestones = milestones.filter((m: any) => m.isCompleted);
      const completionPercentage =
        milestones.length > 0 ? Math.round((completedMilestones.length / milestones.length) * 100) : 0;

      const recentMilestones: DigitalTwinMilestoneSummary[] = milestones.slice(0, 5).map((m: any) => ({
        weekNumber: m.weekNumber,
        title: m.title,
        stage: m.stage || "FOUNDATION",
        isCompleted: m.isCompleted,
        completedAt: m.completedAt ? (typeof m.completedAt === "string" ? m.completedAt : m.completedAt.toISOString()) : null,
      }));

      // Calculate Readiness Status
      let readinessStatus: CareerDigitalTwinData["readinessStatus"] = "DEVELOPING";
      let readinessScore: number | null = profile.careerReadinessIndex > 0 ? profile.careerReadinessIndex : null;

      if ((profile.userSkills || []).length === 0 && milestones.length === 0) {
        readinessStatus = "INSUFFICIENT_EVIDENCE";
        readinessScore = null;
      } else if (profile.careerReadinessIndex >= 80 && verifiedSkills.length >= 2) {
        readinessStatus = "ADVANCED";
      } else if (profile.careerReadinessIndex >= 60) {
        readinessStatus = "COMPETENT";
      } else {
        readinessStatus = "DEVELOPING";
      }

      // Calculate Learning Velocity (Consistency index: missions + milestone progress)
      const missionCount = profile.dailyMissions ? profile.dailyMissions.length : 0;
      const milestoneCount = completedMilestones.length;
      const learningVelocityScore = Math.min(100, Math.round(missionCount * 5 + milestoneCount * 10));

      const stageLabel = (profile.educationStage || "CLASS_12").replace(/_/g, " ");
      const streamLabel = (profile.currentStream || "NON_MEDICAL_PCM").replace(/_/g, " ");

      const twinData: CareerDigitalTwinData = {
        studentProfileId: profile.id,
        studentName: profile.user?.name || "Student",
        summaryHeadline: `${stageLabel} • ${streamLabel} • Aspiring ${targetCareers[0]?.title || "Professional"}`,
        currentStage: profile.educationStage,
        currentStageLabel: stageLabel,
        primaryStream: profile.currentStream,
        primaryStreamLabel: streamLabel,
        selectedStreams: profile.selectedStreams || [profile.currentStream],
        targetCareers,
        interests: (profile.interests || []).map((i: any) => i.interestName || i.domain || "Exploration"),
        skills: {
          selfReported: selfReportedSkills,
          verified: verifiedSkills,
          totalCount: profile.userSkills.length,
          verifiedCount: verifiedSkills.length,
          selfReportedCount: selfReportedSkills.length,
        },
        developmentAreas: developmentAreas.slice(0, 6),
        learningProgress: {
          totalMilestones: milestones.length,
          completedMilestones: completedMilestones.length,
          completionPercentage,
          recentMilestones,
          dailyMissionsCompleted: missionCount,
        },
        readinessStatus,
        readinessScore,
        learningVelocityScore,
        lastCalibratedAt: new Date().toISOString(),
        algorithmVersion: CareerDigitalTwinService.ALGORITHM_VERSION,
        disclaimer: DIGITAL_TWIN_DISCLAIMER,
      };

      // Persist snapshot to CareerDigitalTwin table asynchronously
      CareerDigitalTwinService.persistSnapshot(profile.id, twinData).catch(() => {
        // Safe asynchronous background sync
      });

      return twinData;
    } catch (error) {
      console.error("[CareerDigitalTwinService.getDigitalTwin] Error:", error);
      return null;
    }
  }

  /**
   * Persists or updates the CareerDigitalTwin record in PostgreSQL.
   */
  private static async persistSnapshot(studentProfileId: string, twinData: CareerDigitalTwinData) {
    try {
      await prisma.careerDigitalTwin.upsert({
        where: { studentProfileId },
        update: {
          summaryHeadline: twinData.summaryHeadline,
          currentStageLabel: twinData.currentStageLabel,
          primaryStreamLabel: twinData.primaryStreamLabel,
          targetCareerTitles: twinData.targetCareers.map((c) => c.title),
          topStrengths: twinData.skills.selfReported.slice(0, 5).map((s) => s.name),
          verifiedSkillCount: twinData.skills.verifiedCount,
          selfReportedSkillCount: twinData.skills.selfReportedCount,
          developmentAreas: twinData.developmentAreas.map((d) => d.skillName),
          milestonesCompletedCount: twinData.learningProgress.completedMilestones,
          learningVelocityScore: twinData.learningVelocityScore,
          readinessStatus: twinData.readinessStatus,
          lastCalibratedAt: new Date(),
          algorithmVersion: CareerDigitalTwinService.ALGORITHM_VERSION,
          twinJson: twinData as any,
        },
        create: {
          studentProfileId,
          summaryHeadline: twinData.summaryHeadline,
          currentStageLabel: twinData.currentStageLabel,
          primaryStreamLabel: twinData.primaryStreamLabel,
          targetCareerTitles: twinData.targetCareers.map((c) => c.title),
          topStrengths: twinData.skills.selfReported.slice(0, 5).map((s) => s.name),
          verifiedSkillCount: twinData.skills.verifiedCount,
          selfReportedSkillCount: twinData.skills.selfReportedCount,
          developmentAreas: twinData.developmentAreas.map((d) => d.skillName),
          milestonesCompletedCount: twinData.learningProgress.completedMilestones,
          learningVelocityScore: twinData.learningVelocityScore,
          readinessStatus: twinData.readinessStatus,
          lastCalibratedAt: new Date(),
          algorithmVersion: CareerDigitalTwinService.ALGORITHM_VERSION,
          twinJson: twinData as any,
        },
      });
    } catch (e) {
      // Ignored for graceful degradation
    }
  }
}
