// ==============================================================================
// KAABIL (काबिल) — Industry Assessment & Challenge Hub Service
// Multi-stream practical project challenges, financial case studies, legal briefs.
// Objective evaluation, human review, and tamper-evident credential minting.
// Restricted to adult learners for corporate recruitment challenges.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import { CredentialService } from "@/lib/passport/credential-service";
import {
  IndustryChallengeRecord,
  ChallengeSubmissionRecord,
  ChallengeDifficulty,
  ChallengeCategory,
} from "@/types/employer";
import { EducationalStream } from "@/types";

export class IndustryChallengeService {
  /**
   * Creates a new industry challenge.
   * Strictly enforces verified employer status.
   */
  public static createChallenge(params: {
    organizationId: string;
    title: string;
    category: ChallengeCategory;
    stream: EducationalStream;
    difficulty: ChallengeDifficulty;
    description: string;
    problemStatement: string;
    deliverables: string[];
    requiredSkills: string[];
    rubricCriteria: { criterion: string; weight: number }[];
    submissionDeadline: string;
    rewardCredentialTitle: string;
  }): IndustryChallengeRecord {
    const org = devStore.getEmployerOrganization(params.organizationId);
    if (!org || org.verificationStatus !== "VERIFIED") {
      throw new Error(
        "Unauthorized action: Only verified employers may publish industry challenges."
      );
    }

    const id = `chal-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const challenge: IndustryChallengeRecord = {
      id,
      organizationId: org.id,
      organizationName: org.name,
      title: params.title,
      category: params.category,
      stream: params.stream,
      difficulty: params.difficulty,
      description: params.description,
      problemStatement: params.problemStatement,
      deliverables: params.deliverables || ["Project Documentation / Code Repository"],
      requiredSkills: params.requiredSkills || [],
      rubricCriteria: params.rubricCriteria || [
        { criterion: "Technical / Practical Execution", weight: 50 },
        { criterion: "Methodology & Compliance Reasoning", weight: 50 },
      ],
      submissionDeadline: params.submissionDeadline,
      isAdultOnly: true, // DPDP Safeguard: corporate recruitment challenges are 18+
      status: "PUBLISHED",
      rewardCredentialTitle: params.rewardCredentialTitle || `Certified ${params.title} Practitioner`,
      totalParticipants: 0,
      totalSubmissions: 0,
      createdAt: now,
      updatedAt: now,
    };

    return devStore.saveIndustryChallenge(challenge);
  }

  /**
   * Retrieves challenges with optional filtering.
   */
  public static getChallenges(filters?: {
    organizationId?: string;
    stream?: string;
    status?: string;
    difficulty?: string;
  }): IndustryChallengeRecord[] {
    let list = devStore.getIndustryChallenges(filters);
    if (filters?.difficulty && filters.difficulty !== "ALL") {
      list = list.filter((c: IndustryChallengeRecord) => c.difficulty === filters.difficulty);
    }
    return list;
  }

  /**
   * Retrieves single challenge by ID.
   */
  public static getChallengeById(id: string): IndustryChallengeRecord | null {
    return devStore.getIndustryChallenge(id);
  }

  /**
   * Registers an adult student for an industry challenge.
   */
  public static registerParticipant(
    challengeId: string,
    studentProfile: { id: string; name: string; isMinor: boolean; educationStage: string }
  ): boolean {
    if (studentProfile.isMinor || ["CLASS_8", "CLASS_9", "CLASS_10"].includes(studentProfile.educationStage)) {
      throw new Error(
        "Statutory Restriction: Employer industry challenges are legally restricted to adult learners under the DPDP Act (2023)."
      );
    }

    const challenge = devStore.getIndustryChallenge(challengeId);
    if (!challenge || challenge.status !== "PUBLISHED") {
      throw new Error("Challenge is not currently open for registration.");
    }

    challenge.totalParticipants = (challenge.totalParticipants || 0) + 1;
    devStore.saveIndustryChallenge(challenge);
    return true;
  }

  /**
   * Submits a challenge deliverable (URL, summary).
   */
  public static submitChallengeDeliverable(params: {
    challengeId: string;
    studentProfile: {
      id: string;
      name: string;
      email: string;
      isMinor: boolean;
      educationStage: string;
    };
    submissionUrl: string;
    summary: string;
  }): ChallengeSubmissionRecord {
    if (params.studentProfile.isMinor || ["CLASS_8", "CLASS_9", "CLASS_10"].includes(params.studentProfile.educationStage)) {
      throw new Error(
        "Statutory Restriction: Minor student accounts are legally restricted from employer challenge submissions per the DPDP Act (2023)."
      );
    }

    const challenge = devStore.getIndustryChallenge(params.challengeId);
    if (!challenge) {
      throw new Error("Industry challenge not found.");
    }

    const id = `csub-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const submission: ChallengeSubmissionRecord = {
      id,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      organizationId: challenge.organizationId,
      studentProfileId: params.studentProfile.id,
      studentName: params.studentProfile.name,
      studentEmail: params.studentProfile.email,
      isMinor: false,
      submissionUrl: params.submissionUrl,
      summary: params.summary,
      status: "SUBMITTED",
      submittedAt: now,
    };

    challenge.totalSubmissions = (challenge.totalSubmissions || 0) + 1;
    devStore.saveIndustryChallenge(challenge);

    return devStore.saveChallengeSubmission(submission);
  }

  /**
   * Evaluates a challenge submission with rubric scoring and human reviewer feedback.
   * On approval, mints verified SkillEvidence records and awards a KAABIL Challenge Credential.
   */
  public static evaluateSubmission(params: {
    submissionId: string;
    organizationId: string;
    reviewerName: string;
    score: number; // 0 - 100
    feedback: string;
    decision: "APPROVED" | "REVISION_REQUESTED" | "REJECTED";
  }): ChallengeSubmissionRecord {
    const submission = devStore.getChallengeSubmission(params.submissionId);
    if (!submission || submission.organizationId !== params.organizationId) {
      throw new Error("Challenge submission not found for this organization.");
    }

    if (params.score < 0 || params.score > 100) {
      throw new Error("Evaluation score must be between 0 and 100.");
    }

    const challenge = devStore.getIndustryChallenge(submission.challengeId);
    const now = new Date().toISOString();

    submission.status = params.decision;
    submission.score = params.score;
    submission.feedback = params.feedback;
    submission.reviewerName = params.reviewerName;
    submission.reviewedAt = now;

    // On Approval: Mint Verified Skill Evidence & Credential
    if (params.decision === "APPROVED" && challenge) {
      const credId = `cred-chal-${crypto.randomUUID()}`;
      submission.awardedCredentialId = credId;

      // Mint verified skill evidence for each required competency
      for (const skill of challenge.requiredSkills) {
        devStore.saveSkillEvidence({
          id: `ev-chal-${crypto.randomUUID()}`,
          studentProfileId: submission.studentProfileId,
          skillName: skill,
          category: challenge.stream,
          evidenceType: "PROJECT_PORTFOLIO",
          evidenceUrl: submission.submissionUrl,
          score: params.score,
          isVerified: true,
          verificationHash: crypto
            .createHash("sha256")
            .update(`${submission.studentProfileId}-${skill}-${params.score}-${now}`)
            .digest("hex"),
          createdAt: now,
          updatedAt: now,
        });
      }

      // Mint verified Credential to Digital Skill Passport
      const cred = CredentialService.issueCredential({
        studentProfileId: submission.studentProfileId,
        credentialType: "INDUSTRY_CHALLENGE",
        title: challenge.rewardCredentialTitle,
        description: `Awarded by ${challenge.organizationName} for outstanding completion of ${challenge.title}`,
        skillName: challenge.requiredSkills[0] || "Industry Challenge",
        scorePercentage: params.score,
        metadata: {
          organizationId: challenge.organizationId,
          organizationName: challenge.organizationName,
          stream: challenge.stream,
          difficulty: challenge.difficulty,
          deliverableUrl: submission.submissionUrl,
        },
      });

      devStore.saveStudentCredential(cred);
      submission.awardedCredentialId = cred.id;

      // Automatically update opted-in candidate discovery profile if present
      const disc = devStore.getCandidateDiscoveryProfile(submission.studentProfileId);
      if (disc) {
        disc.verifiedSkills = Array.from(new Set([...disc.verifiedSkills, ...challenge.requiredSkills]));
        disc.projects = disc.projects || [];
        disc.projects.push({
          title: challenge.title,
          description: submission.summary,
          url: submission.submissionUrl,
        });
        devStore.saveCandidateDiscoveryProfile(disc);
      }
    }

    return devStore.saveChallengeSubmission(submission);
  }
}
