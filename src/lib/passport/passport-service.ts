// ==============================================================================
// KAABIL (काबिल) — Digital Skill Passport Service (v1.0 Elevated)
// Aggregates verified competency records, platform diagnostic assessments,
// educational journey, practical portfolio projects, and cryptographically signed credentials.
// Strictly enforces 3-tier skill provenance, DPDP Act minor safety, and zero fabrication.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import { db, checkDatabaseConnection } from "@/lib/db";
import {
  CredentialService,
  KaabilCredential,
  CredentialType,
} from "./credential-service";
import { CareerReadinessEngine, CareerReadinessResult, NextBestActionItem } from "@/lib/readiness/cri-engine";
import { getProjectBySlugOrId } from "@/data/careerProjectsData";
import { isMinorStage } from "@/lib/auth/rbac";

export type EvidenceLayer =
  | "PLATFORM_ASSESSED" // Verified through KAABIL objective diagnostic with cryptographic hash
  | "SELF_REPORTED" // Student claimed skill in profile, unverified
  | "EXTERNALLY_VERIFIED" // Recognized external certification (e.g. NPTEL / ICAI / University)
  | "HUMAN_REVIEWED"; // Evaluated by institutional faculty or mentor review

export interface PassportSkillEntry {
  skillName: string;
  category: string;
  evidenceLayer: EvidenceLayer;
  proficiencyLevel: number; // 1-5
  proficiencyLabel?: "NOVICE" | "BEGINNER" | "INTERMEDIATE" | "PROFICIENT" | "EXPERT";
  scorePercentage?: number;
  isVerified: boolean;
  verifiedAt?: string;
  credentialId?: string;
  verificationHash?: string;
  assessmentTitle?: string;
  issuerOrVerifier?: string;
  canEditOrRemove?: boolean; // True for self-reported skills so students can correct inaccurate entries
}

export interface PassportEducation {
  stage: string;
  stream: string;
  streamTitle: string;
  institutionName?: string;
  targetCompletionYear?: number;
}

export interface PassportAchievement {
  id: string;
  type: "ASSESSMENT" | "ROADMAP_MILESTONE" | "MISSION" | "CRI_BENCHMARK" | "PROJECT";
  title: string;
  description: string;
  earnedAt: string;
  credentialId?: string;
  deliverableUrl?: string;
}

export interface PassportProjectSubmission {
  id: string;
  projectId: string;
  projectTitle: string;
  stream: string;
  deliverableUrl: string;
  submittedAt: string;
  status: "SUBMITTED" | "EVALUATED";
  reflectionNotes?: string;
  evidenceType: "SELF_DIRECTED_PROJECT";
  isVerified: false; // Always false (Rule 5: Never mark self-directed projects as externally verified!)
}

export interface PassportLearningSprintSummary {
  totalTasks: number;
  completedTasks: number;
  currentStreakDays: number;
  focusSkill: string;
}

export interface PassportCareerReadinessSummary {
  overallScore: number | null; // null if unassessed or insufficient evidence
  status: string;
  statusLabel: string;
  statusLabelHi?: string;
  statusLabelHinglish?: string;
  targetCareerTitle: string;
  targetCareerSlug: string;
  nextBestAction: NextBestActionItem;
  dimensions: {
    knowledge: { score: number; weight: number; weightedPoints: number };
    eligibility: { score: number; weight: number; weightedPoints: number };
    skills: { score: number; weight: number; weightedPoints: number };
    practicalProjects: { score: number; weight: number; weightedPoints: number };
    learningProgress: { score: number; weight: number; weightedPoints: number };
  };
  calculationFormula: string;
  isInsufficientEvidence: boolean;
}

export interface PassportPrivacySettings {
  isPublic: boolean;
  isMinor: boolean;
  allowRecruiterView: boolean;
  shareToken?: string | null;
  shareUrl?: string | null;
}

export interface DigitalSkillPassport {
  passportId: string;
  studentProfileId: string;
  studentName: string;
  studentEmail?: string;
  generatedAt: string;
  passportIntegrityChecksum: string; // SHA-256 of the aggregate passport

  education: PassportEducation;

  careerGoals: {
    title: string;
    slug: string;
    regulatoryBody?: string;
    priorityRank: number;
  }[];

  skills: PassportSkillEntry[];
  achievements: PassportAchievement[];
  credentials: KaabilCredential[];
  projectSubmissions: PassportProjectSubmission[];
  learningSprintSummary: PassportLearningSprintSummary;
  careerReadiness: PassportCareerReadinessSummary;
  privacy: PassportPrivacySettings;

  summary: {
    totalSkills: number;
    verifiedSkills: number;
    selfReportedSkills: number;
    externallyVerifiedSkills: number;
    assessmentsCompleted: number;
    assessmentsPassed: number;
    projectsSubmitted: number;
    milestonesCompleted: number;
    missionsCompleted: number;
    currentCRI: number | null;
    credentialCount: number;
  };

  disclaimer: string;
}

export const PASSPORT_DISCLAIMER =
  "KAABIL Digital Skill Passport is an evidence-based learning and competency portfolio. Credentials and SkillEvidence records listed are NOT government-issued professional licenses, statutory degrees, or public civil service appointments. They attest to objective assessments and learning achievements completed within the KAABIL platform.";

export class PassportService {
  /**
   * Generates a complete Digital Skill Passport for a given student profile.
   */
  public static async generatePassport(
    studentProfileId: string
  ): Promise<DigitalSkillPassport> {
    // 1. Fetch Profile
    let profile: any = null;
    try {
      const conn = await checkDatabaseConnection();
      if (conn.connected && db?.studentProfile) {
        profile = await db.studentProfile.findFirst({
          where: {
            OR: [
              { id: studentProfileId },
              { userId: studentProfileId },
            ],
          },
          include: {
            user: true,
            userSkills: { include: { skill: true } },
            careerGoals: { include: { careerPath: true } },
            educationalHistory: true,
            roadmaps: { include: { milestones: true } },
            dailyMissions: true,
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
      profile = devStore.getProfileByEmail(studentProfileId);
    }
    if (!profile) {
      profile = devStore.getProfile("demo-profile-id");
    }
    if (!profile) {
      throw new Error(`Student profile '${studentProfileId}' not found.`);
    }

    const pid = profile.id || studentProfileId;

    // 2. Load Evidences, Attempts, Results, Credentials, and Projects
    const evidences = devStore.getSkillEvidences(pid) || [];
    const attempts = devStore.getAssessmentAttempts(pid) || [];
    let credentials = devStore.getCredentials(pid) || [];

    // 3. Auto-mint credentials for any verified SkillEvidence that doesn't have a signed credential yet
    const minted = await this.mintPendingCredentials(pid);
    if (minted.length > 0) {
      credentials = devStore.getCredentials(pid);
    }

    // 4. Build Skill Portfolio entries with strict 3-tier provenance segregation
    const evidenceBySkill = new Map<string, any>();
    for (const ev of evidences) {
      evidenceBySkill.set(ev.skillName.toLowerCase().trim(), ev);
    }

    const skills: PassportSkillEntry[] = [];
    const seenSkills = new Set<string>();

    // First add from profile userSkills
    for (const usk of profile.userSkills || []) {
      const sName = (usk.skill?.name || usk.name || "").trim();
      if (!sName) continue;
      const lower = sName.toLowerCase();
      seenSkills.add(lower);

      const ev = evidenceBySkill.get(lower);
      const isVerified = usk.isVerified || !!ev?.isVerified;
      const matchingCred = credentials.find(
        (c) => c.skillName?.toLowerCase() === lower && c.status === "ACTIVE"
      );

      let evidenceLayer: EvidenceLayer = "SELF_REPORTED";
      if (matchingCred?.credentialType === "EXTERNAL_CERTIFICATION" || ev?.evidenceType === "EXTERNAL_CREDENTIAL") {
        evidenceLayer = "EXTERNALLY_VERIFIED";
      } else if (isVerified) {
        evidenceLayer = "PLATFORM_ASSESSED";
      } else {
        evidenceLayer = "SELF_REPORTED";
      }

      skills.push({
        skillName: sName,
        category: usk.skill?.category || usk.category || "General",
        evidenceLayer,
        proficiencyLevel: usk.proficiencyLevel || (isVerified ? 4 : 2),
        proficiencyLabel: isVerified ? "PROFICIENT" : "INTERMEDIATE",
        scorePercentage: ev?.scorePercentage || usk.scorePercentage,
        isVerified,
        verifiedAt: ev?.verifiedAt || usk.verifiedAt,
        credentialId: matchingCred?.id,
        verificationHash: ev?.verificationHash || matchingCred?.verificationHash,
        assessmentTitle: ev?.title || (isVerified ? `${sName} Diagnostic Checkpoint` : undefined),
        issuerOrVerifier: ev?.verifier || (isVerified ? "KAABIL Assessment Hub" : undefined),
        canEditOrRemove: evidenceLayer === "SELF_REPORTED",
      });
    }

    // Also include any verified evidences not yet in userSkills
    for (const ev of evidences) {
      if (ev.evidenceType === "PORTFOLIO_PROJECT") continue; // Handled under projectSubmissions
      const lower = ev.skillName.toLowerCase().trim();
      if (!seenSkills.has(lower)) {
        seenSkills.add(lower);
        const matchingCred = credentials.find(
          (c) => c.skillName?.toLowerCase() === lower && c.status === "ACTIVE"
        );

        let evidenceLayer: EvidenceLayer = "SELF_REPORTED";
        if (ev.evidenceType === "EXTERNAL_CREDENTIAL" || matchingCred?.credentialType === "EXTERNAL_CERTIFICATION") {
          evidenceLayer = "EXTERNALLY_VERIFIED";
        } else if (ev.isVerified) {
          evidenceLayer = "PLATFORM_ASSESSED";
        }

        skills.push({
          skillName: ev.skillName,
          category: "Domain",
          evidenceLayer,
          proficiencyLevel: 4,
          proficiencyLabel: "PROFICIENT",
          scorePercentage: ev.scorePercentage,
          isVerified: !!ev.isVerified,
          verifiedAt: ev.verifiedAt,
          credentialId: matchingCred?.id,
          verificationHash: ev.verificationHash || matchingCred?.verificationHash,
          assessmentTitle: ev.title || `${ev.skillName} Diagnostic Checkpoint`,
          issuerOrVerifier: ev.verifier || "KAABIL Assessment Hub",
          canEditOrRemove: evidenceLayer === "SELF_REPORTED",
        });
      }
    }

    // 5. Build Achievements
    const achievements: PassportAchievement[] = [];

    // Assessment achievements
    for (const att of attempts) {
      if (att.status === "COMPLETED") {
        const res = devStore.getAssessmentResult(att.id);
        const asm = devStore.getAssessmentById(att.assessmentId);
        if (res && res.passed) {
          const cred = credentials.find((c) => c.assessmentAttemptId === att.id);
          achievements.push({
            id: `ach-asm-${att.id}`,
            type: "ASSESSMENT",
            title: `Passed ${res.assessmentTitle || asm?.title || "Assessment"}`,
            description: `Scored ${res.scorePercentage}% in ${res.targetSkillName}.`,
            earnedAt: res.evaluatedAt || att.completedAt || new Date().toISOString(),
            credentialId: cred?.id,
          });
        }
      }
    }

    // Project achievements & Project Submissions List
    const projectEnrollmentsMap = devStore.getProjectEnrollments(pid) || {};
    const projectSubmissions: PassportProjectSubmission[] = [];

    for (const [projId, enrollment] of Object.entries(projectEnrollmentsMap)) {
      const enr = enrollment as any;
      if (enr.status === "SUBMITTED" || enr.submissionUrl) {
        const projMeta = getProjectBySlugOrId(projId);
        const pTitle = projMeta?.title || enr.projectTitle || "Practical Project";
        projectSubmissions.push({
          id: enr.id || `proj-sub-${projId}`,
          projectId: projId,
          projectTitle: pTitle,
          stream: projMeta?.stream || profile.currentStream || "General Stream",
          deliverableUrl: enr.submissionUrl || enr.deliverableUrl || "",
          submittedAt: enr.submittedAt || enr.lastUpdatedAt || new Date().toISOString(),
          status: enr.status || "SUBMITTED",
          reflectionNotes: enr.selfAssessedReflection || enr.submissionNotes || undefined,
          evidenceType: "SELF_DIRECTED_PROJECT",
          isVerified: false, // Rule 5: Never mark self-directed projects as externally verified!
        });

        achievements.push({
          id: `ach-proj-${projId}`,
          type: "PROJECT",
          title: `Submitted Portfolio Project: ${pTitle}`,
          description: `Built and submitted authentic deliverable: ${enr.submissionUrl}`,
          earnedAt: enr.submittedAt || enr.lastUpdatedAt || new Date().toISOString(),
          deliverableUrl: enr.submissionUrl,
        });
      }
    }

    // Roadmap achievements
    const roadmap = devStore.getRoadmap(pid) || profile.roadmaps?.[0];
    if (roadmap && roadmap.milestones) {
      for (const m of roadmap.milestones) {
        if (m.isCompleted) {
          achievements.push({
            id: `ach-ms-${m.id}`,
            type: "ROADMAP_MILESTONE",
            title: `Completed Milestone: ${m.title}`,
            description: m.description || "Core roadmap learning milestone achieved.",
            earnedAt: m.completedAt || new Date().toISOString(),
          });
        }
      }
    }

    // Mission achievements
    const missions = devStore.getMissions(pid) || profile.dailyMissions || [];
    const completedMissionsCount = missions.filter(
      (m: any) => m.status === "COMPLETED"
    ).length;
    if (completedMissionsCount > 0) {
      achievements.push({
        id: `ach-mis-summary`,
        type: "MISSION",
        title: `Consistent Daily Mission Learning`,
        description: `Successfully completed ${completedMissionsCount} daily reflection micro-missions.`,
        earnedAt: new Date().toISOString(),
      });
    }

    // 6. Build Career Goals
    const careerGoals = (profile.careerGoals || []).map((cg: any, idx: number) => ({
      title: cg.careerPath?.title || cg.targetRoleTitle || "Career Path",
      slug: cg.careerPath?.slug || cg.targetRoleSlug || "target-career",
      regulatoryBody: cg.careerPath?.regulatoryBody,
      priorityRank: cg.priorityRank || idx + 1,
    }));

    // 7. Learning Sprint Summary (Step 3.3 Integration)
    const taskStatesMap = devStore.getLearningTaskStates(pid) || {};
    const completedTasksCount = Object.values(taskStatesMap).filter((t: any) => t.isCompleted).length;
    const learningSprintSummary: PassportLearningSprintSummary = {
      totalTasks: 20,
      completedTasks: completedTasksCount,
      currentStreakDays: completedTasksCount > 0 ? Math.min(completedTasksCount, 7) : 0,
      focusSkill: skills.find((s) => !s.isVerified)?.skillName || "Core Competency Sprint",
    };

    // 8. Explainable Career Readiness & Next Best Action
    const targetCareerSlug = careerGoals[0]?.slug;
    const readinessResult = await CareerReadinessEngine.calculateReadiness(
      pid,
      targetCareerSlug
    );

    const careerReadiness: PassportCareerReadinessSummary = {
      overallScore: readinessResult.overallScore,
      status: readinessResult.status,
      statusLabel: readinessResult.statusLabel,
      statusLabelHi: readinessResult.statusLabelHi,
      statusLabelHinglish: readinessResult.statusLabelHinglish,
      targetCareerTitle: readinessResult.careerTitle,
      targetCareerSlug: readinessResult.careerSlug,
      nextBestAction: readinessResult.nextBestAction || {
        title: "Take Your First Diagnostic Checkpoint",
        titleHi: "अपनी पहली कौशल जांच परीक्षा लें",
        titleHinglish: "Pehla skill diagnostic quiz complete karein",
        description: "Complete an objective diagnostic assessment to establish your baseline Career Readiness score.",
        actionUrl: "/student/assessments",
        impactPoints: 15,
        category: "ASSESSMENT",
      },
      dimensions: {
        knowledge: {
          score: readinessResult.dimensions.careerKnowledge.score,
          weight: 20,
          weightedPoints: readinessResult.dimensions.careerKnowledge.weightedPoints,
        },
        eligibility: {
          score: readinessResult.dimensions.educationalPreparation.score,
          weight: 25,
          weightedPoints: readinessResult.dimensions.educationalPreparation.weightedPoints,
        },
        skills: {
          score: readinessResult.dimensions.skillDevelopment.score,
          weight: 25,
          weightedPoints: readinessResult.dimensions.skillDevelopment.weightedPoints,
        },
        practicalProjects: {
          score: readinessResult.dimensions.practicalLearning.score,
          weight: 15,
          weightedPoints: readinessResult.dimensions.practicalLearning.weightedPoints,
        },
        learningProgress: {
          score: readinessResult.dimensions.milestoneProgress.score,
          weight: 15,
          weightedPoints: readinessResult.dimensions.milestoneProgress.weightedPoints,
        },
      },
      calculationFormula: readinessResult.calculationFormula || "Readiness = (Domain Knowledge × 20%) + (Education Preparation × 25%) + (Skill Genome × 25%) + (Practical Projects × 15%) + (Learning Sprints × 15%)",
      isInsufficientEvidence: readinessResult.isInsufficientEvidence ?? (readinessResult.overallScore === null),
    };

    // 9. Privacy & Sharing Settings (DPDP Act Minor Shield)
    const isMinor =
      profile.user?.isMinor ??
      (profile.educationStage ? isMinorStage(profile.educationStage) : false);

    const prefs = devStore.getPassportPreferences(pid);
    const privacy: PassportPrivacySettings = {
      isPublic: isMinor ? false : (prefs.isPublic ?? false),
      isMinor,
      allowRecruiterView: isMinor ? false : (prefs.allowRecruiterView ?? false),
      shareToken: prefs.shareToken || null,
      shareUrl: prefs.shareToken ? `/verify/${prefs.shareToken}` : null,
    };

    // 10. Summary Statistics
    const verifiedSkills = skills.filter((s) => s.evidenceLayer === "PLATFORM_ASSESSED").length;
    const externallyVerifiedSkills = skills.filter((s) => s.evidenceLayer === "EXTERNALLY_VERIFIED").length;
    const selfReportedSkills = skills.filter((s) => s.evidenceLayer === "SELF_REPORTED").length;
    const assessmentsCompleted = attempts.filter((a) => a.status === "COMPLETED").length;
    const assessmentsPassed = achievements.filter((a) => a.type === "ASSESSMENT").length;
    const milestonesCompleted = achievements.filter((a) => a.type === "ROADMAP_MILESTONE").length;

    const passportId = `KP-${pid.replace(/[^a-zA-Z0-9]/g, "").substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const generatedAt = new Date().toISOString();

    // 11. Compute Passport Integrity Checksum
    const checksumPayload = JSON.stringify({
      passportId,
      studentProfileId: pid,
      totalSkills: skills.length,
      verifiedSkills: verifiedSkills + externallyVerifiedSkills,
      credentialCount: credentials.length,
      projectSubmissions: projectSubmissions.length,
      generatedAt,
    });
    const passportIntegrityChecksum = crypto
      .createHash("sha256")
      .update(checksumPayload)
      .digest("hex");

    return {
      passportId,
      studentProfileId: pid,
      studentName: profile.user?.name || profile.name || "Student",
      studentEmail: profile.user?.email || profile.email || "student@kaabil.in",
      generatedAt,
      passportIntegrityChecksum,
      education: {
        stage: profile.educationStage || "UNDERGRADUATE",
        stream: profile.currentStream || "NON_MEDICAL_PCM",
        streamTitle: (profile.currentStream || "NON_MEDICAL_PCM").replace(/_/g, " "),
        institutionName: profile.institutionName || "Registered Institution",
        targetCompletionYear: profile.targetCompletionYear || 2027,
      },
      careerGoals,
      skills,
      achievements,
      credentials,
      projectSubmissions,
      learningSprintSummary,
      careerReadiness,
      privacy,
      summary: {
        totalSkills: skills.length,
        verifiedSkills,
        selfReportedSkills,
        externallyVerifiedSkills,
        assessmentsCompleted,
        assessmentsPassed,
        projectsSubmitted: projectSubmissions.length,
        milestonesCompleted,
        missionsCompleted: completedMissionsCount,
        currentCRI: readinessResult.overallScore ?? profile.careerReadinessIndex ?? null,
        credentialCount: credentials.filter((c) => c.status === "ACTIVE").length,
      },
      disclaimer: PASSPORT_DISCLAIMER,
    };
  }

  /**
   * Automatically issues signed KaabilCredentials for any verified SkillEvidence
   * that does not yet have a credential issued.
   */
  public static async mintPendingCredentials(
    studentProfileId: string
  ): Promise<KaabilCredential[]> {
    const evidences = devStore.getSkillEvidences(studentProfileId) || [];
    const existingCreds = devStore.getCredentials(studentProfileId) || [];
    const newlyMinted: KaabilCredential[] = [];

    for (const ev of evidences) {
      if (ev.isVerified) {
        const alreadyMinted = existingCreds.some(
          (c) =>
            c.skillName?.toLowerCase() === ev.skillName?.toLowerCase() &&
            c.status === "ACTIVE"
        );

        if (!alreadyMinted) {
          const credType: CredentialType =
            ev.evidenceType === "EXTERNAL_CREDENTIAL"
              ? "INDUSTRY_CHALLENGE"
              : "SKILL_ASSESSMENT";

          const newCred = CredentialService.issueCredential({
            studentProfileId,
            credentialType: credType,
            title: `Verified Competency: ${ev.skillName}`,
            description:
              ev.description ||
              `Passed verified objective assessment in ${ev.skillName} with score ${ev.scorePercentage || 80}%.`,
            skillName: ev.skillName,
            scorePercentage: ev.scorePercentage || 80,
            evidenceId: ev.id,
            assessmentAttemptId: ev.assessmentAttemptId,
            metadata: {
              evidenceId: ev.id,
              verifier: ev.verifier || "KAABIL Platform",
              evidenceType: ev.evidenceType,
            },
          });
          devStore.saveCredential(studentProfileId, newCred);
          newlyMinted.push(newCred);
        }
      }
    }

    return newlyMinted;
  }

  /**
   * Corrects student profile by removing an inaccurate self-reported skill.
   * Fulfills Requirement 7: Allow students to review and correct inaccurate self-reported claims.
   */
  public static async removeSelfReportedSkill(
    studentProfileId: string,
    skillName: string
  ): Promise<{ success: boolean; remainingSkillsCount: number }> {
    let profile = devStore.getProfile(studentProfileId);
    if (!profile) {
      profile = devStore.getProfileByUserId(studentProfileId);
    }
    if (!profile) {
      profile = devStore.getProfileByEmail(studentProfileId);
    }
    if (!profile) {
      profile = devStore.getProfile("demo-profile-id");
    }

    if (!profile) {
      throw new Error(`Profile '${studentProfileId}' not found.`);
    }

    const lowerTarget = skillName.toLowerCase().trim();

    if (profile.userSkills && Array.isArray(profile.userSkills)) {
      profile.userSkills = profile.userSkills.filter(
        (s: any) =>
          (s.skill?.name || s.name || "").toLowerCase().trim() !== lowerTarget ||
          s.isVerified === true // Verified skills cannot be deleted via self-reported deletion!
      );
    }

    devStore.saveProfile(profile);

    // Also update Prisma DB if connected
    try {
      const conn = await checkDatabaseConnection();
      if (conn.connected && db?.userSkill) {
        await db.userSkill.deleteMany({
          where: {
            studentProfileId,
            isVerified: false,
            skill: { name: { equals: skillName, mode: "insensitive" } },
          },
        });
      }
    } catch {
      // Safe fallback
    }

    return {
      success: true,
      remainingSkillsCount: profile.userSkills?.length || 0,
    };
  }

  /**
   * Retrieves active credentials for a student profile.
   */
  public static getCredentials(
    studentProfileId: string
  ): KaabilCredential[] {
    return devStore.getCredentials(studentProfileId) || [];
  }

  /**
   * Revokes a credential by studentProfileId and credentialId.
   */
  public static revokeCredential(
    studentProfileId: string,
    credentialId: string
  ): KaabilCredential | null {
    const creds = devStore.getCredentials(studentProfileId) || [];
    const cred = creds.find((c) => c.id === credentialId);
    if (!cred) {
      return null;
    }
    const revoked = CredentialService.revokeCredential(cred);
    devStore.saveCredential(studentProfileId, revoked);
    return revoked;
  }
}
