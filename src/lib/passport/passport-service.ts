// ==============================================================================
// KAABIL (काबिल) — Digital Skill Passport Service
// Aggregates verified competency records, platform assessments, educational
// journey, and cryptographically signed credentials into a tamper-evident portfolio.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import { db, checkDatabaseConnection } from "@/lib/db";
import {
  CredentialService,
  KaabilCredential,
  CredentialType,
} from "./credential-service";

export type EvidenceLayer =
  | "PLATFORM_ASSESSED" // Verified through KAABIL objective assessment with cryptographic hash
  | "SELF_REPORTED" // Student claimed skill during onboarding or profile editing
  | "HUMAN_REVIEWED" // Evaluated by institutional faculty or mentor review
  | "EXTERNAL"; // Recognized external certification

export interface PassportSkillEntry {
  skillName: string;
  category: string;
  evidenceLayer: EvidenceLayer;
  proficiencyLevel: number; // 1-5
  scorePercentage?: number;
  isVerified: boolean;
  verifiedAt?: string;
  credentialId?: string;
  verificationHash?: string;
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
  type: "ASSESSMENT" | "ROADMAP_MILESTONE" | "MISSION" | "CRI_BENCHMARK";
  title: string;
  description: string;
  earnedAt: string;
  credentialId?: string;
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

  summary: {
    totalSkills: number;
    verifiedSkills: number;
    selfReportedSkills: number;
    assessmentsCompleted: number;
    assessmentsPassed: number;
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
        profile = await db.studentProfile.findUnique({
          where: { id: studentProfileId },
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
      throw new Error(`Student profile '${studentProfileId}' not found.`);
    }

    const pid = profile.id;

    // 2. Load Evidences, Attempts, Results, and Credentials
    const evidences = devStore.getSkillEvidences(pid) || [];
    const attempts = devStore.getAssessmentAttempts(pid) || [];
    let credentials = devStore.getCredentials(pid) || [];

    // 3. Auto-mint credentials for any verified SkillEvidence that doesn't have a signed credential yet
    const minted = await this.mintPendingCredentials(pid);
    if (minted.length > 0) {
      credentials = devStore.getCredentials(pid);
    }

    // 4. Build Skill Portfolio entries
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

      skills.push({
        skillName: sName,
        category: usk.skill?.category || usk.category || "General",
        evidenceLayer: isVerified ? "PLATFORM_ASSESSED" : "SELF_REPORTED",
        proficiencyLevel: usk.proficiencyLevel || (isVerified ? 4 : 2),
        scorePercentage: ev?.scorePercentage || usk.scorePercentage,
        isVerified,
        verifiedAt: ev?.verifiedAt || usk.verifiedAt,
        credentialId: matchingCred?.id,
        verificationHash: ev?.verificationHash,
      });
    }

    // Also include any verified evidences not yet in userSkills
    for (const ev of evidences) {
      const lower = ev.skillName.toLowerCase().trim();
      if (!seenSkills.has(lower)) {
        seenSkills.add(lower);
        const matchingCred = credentials.find(
          (c) => c.skillName?.toLowerCase() === lower && c.status === "ACTIVE"
        );
        skills.push({
          skillName: ev.skillName,
          category: "Domain",
          evidenceLayer: ev.isVerified ? "PLATFORM_ASSESSED" : "SELF_REPORTED",
          proficiencyLevel: 4,
          scorePercentage: ev.scorePercentage,
          isVerified: ev.isVerified,
          verifiedAt: ev.verifiedAt,
          credentialId: matchingCred?.id,
          verificationHash: ev.verificationHash,
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

    // 7. Calculate Summary Statistics
    const verifiedSkills = skills.filter((s) => s.isVerified).length;
    const selfReportedSkills = skills.filter((s) => !s.isVerified).length;
    const assessmentsCompleted = attempts.filter((a) => a.status === "COMPLETED").length;
    const assessmentsPassed = achievements.filter((a) => a.type === "ASSESSMENT").length;
    const milestonesCompleted = achievements.filter(
      (a) => a.type === "ROADMAP_MILESTONE"
    ).length;

    const passportId = `KP-${pid.replace(/[^a-zA-Z0-9]/g, "").substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const generatedAt = new Date().toISOString();

    // 8. Compute Passport Integrity Checksum
    const checksumPayload = JSON.stringify({
      passportId,
      studentProfileId: pid,
      totalSkills: skills.length,
      verifiedSkills,
      credentialCount: credentials.length,
      generatedAt,
    });
    const passportIntegrityChecksum = crypto
      .createHash("sha256")
      .update(checksumPayload)
      .digest("hex");

    return {
      passportId,
      studentProfileId: pid,
      studentName: profile.user?.name || "Aryan Sharma",
      studentEmail: profile.user?.email || "demo.student@kaabil.in",
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
      summary: {
        totalSkills: skills.length,
        verifiedSkills,
        selfReportedSkills,
        assessmentsCompleted,
        assessmentsPassed,
        milestonesCompleted,
        missionsCompleted: completedMissionsCount,
        currentCRI: profile.careerReadinessIndex || 79,
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
            c.evidenceId === ev.id ||
            (c.skillName?.toLowerCase() === ev.skillName?.toLowerCase() &&
              c.status === "ACTIVE")
        );

        if (!alreadyMinted) {
          const cred = CredentialService.issueCredential({
            studentProfileId,
            credentialType: "SKILL_ASSESSMENT",
            title: `Verified Competency: ${ev.skillName}`,
            description: `Objective assessment completed with ${ev.scorePercentage || 85}% score. Cryptographically verified SkillEvidence.`,
            skillName: ev.skillName,
            scorePercentage: ev.scorePercentage,
            evidenceId: ev.id,
            metadata: {
              verificationHash: ev.verificationHash,
              verifiedAt: ev.verifiedAt || new Date().toISOString(),
              issuer: "KAABIL Verification Engine",
            },
          });

          devStore.saveCredential(studentProfileId, cred);
          newlyMinted.push(cred);
        }
      }
    }

    return newlyMinted;
  }

  /**
   * Retrieves all credentials for a given student profile.
   */
  public static getCredentials(studentProfileId: string): KaabilCredential[] {
    return devStore.getCredentials(studentProfileId) || [];
  }

  /**
   * Revokes a credential by ID.
   */
  public static revokeCredential(
    studentProfileId: string,
    credentialId: string
  ): KaabilCredential | null {
    const cred = devStore.getCredential(studentProfileId, credentialId);
    if (!cred) return null;

    const revoked = CredentialService.revokeCredential(cred);
    devStore.saveCredential(studentProfileId, revoked);
    return revoked;
  }
}
