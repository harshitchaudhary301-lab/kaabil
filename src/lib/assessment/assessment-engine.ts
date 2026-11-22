// ==============================================================================
// KAABIL (काबिल) — Intelligent Skill Assessment Engine
// Stage-adaptive, stream-aware evaluation across all 13 streams
// Objective auto-grading + scenario rubric evaluation + SkillEvidence generation
// ==============================================================================

import crypto from "crypto";
import { KAABIL_ASSESSMENTS, AssessmentData } from "@/data/assessmentsData";
import { devStore } from "@/lib/dev-store";
import { db, checkDatabaseConnection } from "@/lib/db";
import { CareerReadinessEngine } from "@/lib/readiness/cri-engine";
import { PassportService } from "@/lib/passport/passport-service";

export interface SubmitAnswerPayload {
  selectedOptionKey?: string;
  textResponse?: string;
}

export interface AssessmentSubmissionResult {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  targetSkillName: string;
  totalScore: number;
  maxScore: number;
  scorePercentage: number;
  passed: boolean;
  passingPercentage: number;
  strengths: string[];
  improvements: string[];
  evidenceGenerated: boolean;
  evidenceId?: string;
  criImpactSummary: string;
  detailedQuestionResults: {
    questionId: string;
    questionText: string;
    selectedOptionKey: string | null;
    correctOptionKey: string;
    isCorrect: boolean;
    pointsAwarded: number;
    maxPoints: number;
    explanation: string;
  }[];
}

function toDbStream(stream: string): any {
  if (stream === "CREATIVE_ARTS_DESIGN") return "CREATIVE_DESIGN";
  if (stream === "SPORTS") return "SPORTS_PHYSICAL_ED";
  if (stream === "VOCATIONAL_SKILLED" || stream === "VOCATIONAL") return "VOCATIONAL_TRADES";
  return stream;
}

export class AssessmentEngine {
  private static initialized = false;

  public static initializeAssessmentBank() {
    if (this.initialized) return;
    // Register assessments into devStore
    for (const asm of KAABIL_ASSESSMENTS) {
      if (!devStore.getAssessmentById(asm.id)) {
        devStore.saveAssessment(asm);
      }
    }
    this.initialized = true;
  }

  /**
   * Retrieves assessments filtered by stream, category, or difficulty.
   * Strips correct answers for student view.
   */
  public static async getAssessments(filters?: {
    stream?: string;
    category?: string;
    difficulty?: string;
    studentProfileId?: string;
  }) {
    this.initializeAssessmentBank();

    let list = devStore.getAssessments(filters);

    // If no assessments match in devStore, fall back to KAABIL_ASSESSMENTS
    if (list.length === 0) {
      list = KAABIL_ASSESSMENTS;
      if (filters?.stream && filters.stream !== "ALL") {
        list = list.filter((a) => a.stream === filters.stream || a.stream === "UNDECIDED");
      }
      if (filters?.category && filters.category !== "ALL") {
        list = list.filter((a) => a.category === filters.category);
      }
      if (filters?.difficulty && filters.difficulty !== "ALL") {
        list = list.filter((a) => a.difficultyLevel === filters.difficulty);
      }
    }

    // Attach student attempt status if studentProfileId is provided
    let studentAttempts: any[] = [];
    if (filters?.studentProfileId) {
      studentAttempts = devStore.getAssessmentAttempts(filters.studentProfileId);
    }

    return list.map((asm) => {
      const pastAttempt = studentAttempts.find((att) => att.assessmentId === asm.id && att.status === "EVALUATED");
      return {
        id: asm.id,
        title: asm.title,
        slug: asm.slug,
        description: asm.description,
        stream: asm.stream,
        category: asm.category,
        targetSkillName: asm.targetSkillName,
        difficultyLevel: asm.difficultyLevel,
        minEducationStage: asm.minEducationStage,
        durationMinutes: asm.durationMinutes,
        passingPercentage: asm.passingPercentage,
        questionCount: asm.questions.length,
        hasAttempted: !!pastAttempt,
        passed: pastAttempt?.passed ?? null,
        lastScore: pastAttempt?.scorePercentage ?? null,
      };
    });
  }

  /**
   * Retrieves single assessment by ID or slug for taking the test.
   * Strips isCorrect from options so client cannot inspect answers!
   */
  public static async getAssessmentForTaking(idOrSlug: string) {
    this.initializeAssessmentBank();
    let asm = devStore.getAssessmentById(idOrSlug) || devStore.getAssessmentBySlug(idOrSlug);
    if (!asm) {
      asm = KAABIL_ASSESSMENTS.find((a) => a.id === idOrSlug || a.slug === idOrSlug) || null;
    }
    if (!asm) return null;

    // Securely strip isCorrect and explanations from questions returned to client
    const sanitizedQuestions = asm.questions.map((q: any) => ({
      id: q.id,
      questionOrder: q.questionOrder,
      questionType: q.questionType,
      questionText: q.questionText,
      points: q.points,
      options: q.options.map((opt: any) => ({
        optionKey: opt.optionKey,
        optionText: opt.optionText,
      })),
    }));

    return {
      id: asm.id,
      title: asm.title,
      slug: asm.slug,
      description: asm.description,
      stream: asm.stream,
      category: asm.category,
      targetSkillName: asm.targetSkillName,
      difficultyLevel: asm.difficultyLevel,
      minEducationStage: asm.minEducationStage,
      durationMinutes: asm.durationMinutes,
      passingPercentage: asm.passingPercentage,
      rubricCriteria: asm.rubricCriteria,
      questions: sanitizedQuestions,
    };
  }

  /**
   * Starts a new assessment attempt.
   */
  public static async startAttempt(studentProfileId: string, assessmentId: string) {
    this.initializeAssessmentBank();
    const asm = devStore.getAssessmentById(assessmentId) || KAABIL_ASSESSMENTS.find((a) => a.id === assessmentId);
    if (!asm) {
      throw new Error("Assessment not found");
    }

    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const attempt = {
      id: attemptId,
      assessmentId: asm.id,
      studentProfileId,
      status: "IN_PROGRESS",
      startedAt: new Date().toISOString(),
      completedAt: null,
      scorePercentage: null,
      passed: null,
      feedbackSummary: null,
      answers: [],
    };

    devStore.saveAssessmentAttempt(attempt);

    try {
      const conn = await checkDatabaseConnection();
      if (conn.connected && db) {
        await db.assessment.upsert({
          where: { slug: asm.slug },
          update: {},
          create: {
            id: asm.id,
            title: asm.title,
            slug: asm.slug,
            description: asm.description,
            stream: toDbStream(asm.stream),
            category: asm.category,
            targetSkillName: asm.targetSkillName,
            difficultyLevel: asm.difficultyLevel,
            durationMinutes: asm.durationMinutes,
            passingPercentage: asm.passingPercentage,
          },
        }).catch(() => {});

        const sp = await db.studentProfile.findFirst({
          where: {
            OR: [{ id: studentProfileId }, { userId: studentProfileId }],
          },
        });

        if (sp) {
          await db.assessmentAttempt.upsert({
            where: { id: attemptId },
            update: {},
            create: {
              id: attemptId,
              assessmentId: asm.id,
              studentProfileId: sp.id,
              status: "IN_PROGRESS",
              startedAt: new Date(),
            },
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn("[AssessmentEngine.startAttempt] DB note:", err);
    }

    return attempt;
  }

  /**
   * Evaluates submitted answers, generates score, feedback, and verified SkillEvidence if passed.
   */
  public static async submitAttempt(
    attemptId: string,
    studentProfileId: string,
    userAnswers: Record<string, SubmitAnswerPayload>
  ): Promise<AssessmentSubmissionResult> {
    this.initializeAssessmentBank();

    let attempt = devStore.getAssessmentAttempt(attemptId);
    if (!attempt) {
      // Create on the fly if needed
      attempt = {
        id: attemptId,
        assessmentId: "",
        studentProfileId,
        status: "IN_PROGRESS",
        startedAt: new Date().toISOString(),
      };
    }

    const asmId = attempt.assessmentId || Object.keys(userAnswers)[0]?.split("-")[1] || "asm-undec-01";
    let asm = devStore.getAssessmentById(asmId) || KAABIL_ASSESSMENTS.find((a) => a.id === asmId) || KAABIL_ASSESSMENTS[0];

    let totalPointsAwarded = 0;
    let maxPoints = 0;
    const detailedResults: any[] = [];
    const strengths: string[] = [];
    const improvements: string[] = [];

    for (const q of asm.questions) {
      maxPoints += q.points;
      const userAns = userAnswers[q.id];
      const selectedKey = userAns?.selectedOptionKey || null;
      const correctOpt = q.options.find((o: any) => o.isCorrect);
      const isCorrect = selectedKey === correctOpt?.optionKey;

      const pointsEarned = isCorrect ? q.points : 0;
      totalPointsAwarded += pointsEarned;

      if (isCorrect) {
        strengths.push(`Demonstrated solid competence in Question ${q.questionOrder}: ${q.questionText.slice(0, 60)}...`);
      } else {
        improvements.push(`Review key concepts in Question ${q.questionOrder}: ${correctOpt?.optionText || "See explanation"}`);
      }

      detailedResults.push({
        questionId: q.id,
        questionText: q.questionText,
        selectedOptionKey: selectedKey,
        correctOptionKey: correctOpt?.optionKey || "A",
        isCorrect,
        pointsAwarded: pointsEarned,
        maxPoints: q.points,
        explanation: q.explanation,
      });
    }

    const scorePercentage = maxPoints > 0 ? Math.round((totalPointsAwarded / maxPoints) * 100) : 0;
    const passed = scorePercentage >= asm.passingPercentage;

    let evidenceId: string | undefined;
    let evidenceGenerated = false;

    if (passed) {
      evidenceId = `evi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const verificationHash = crypto
        .createHash("sha256")
        .update(`${studentProfileId}:${asm.targetSkillName}:${scorePercentage}:${Date.now()}`)
        .digest("hex");

      const evidence = {
        id: evidenceId,
        studentProfileId,
        skillName: asm.targetSkillName,
        title: `${asm.title} — Verified Assessment`,
        evidenceType: "AUTOMATED_ASSESSMENT",
        verificationStatus: "VERIFIED",
        scorePercentage,
        evidenceSummary: `Successfully achieved ${scorePercentage}% (Passing threshold: ${asm.passingPercentage}%) in KAABIL Universal Skill Assessment. Verified competence in ${asm.targetSkillName}.`,
        artifactUrl: `/student/assessments/results/${attemptId}`,
        verificationHash,
        issuerOrVerifier: "KAABIL Automated Assessment Engine",
        isVerified: true,
        verifiedBy: "KAABIL_EVALUATOR_V1",
        verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      devStore.saveSkillEvidence(evidence);
      evidenceGenerated = true;

      // Recalculate student CRI to immediately reflect verified skill evidence in Dimension 3
      try {
        await CareerReadinessEngine.calculateReadiness(studentProfileId);
      } catch (err) {
        console.warn("[AssessmentEngine] CRI recalculation note:", err);
      }

      // Auto-mint cryptographically signed credential into Digital Skill Passport
      try {
        await PassportService.mintPendingCredentials(studentProfileId);
      } catch (err) {
        console.warn("[AssessmentEngine] Passport credential mint note:", err);
      }
    }

    // Update attempt
    attempt.status = "EVALUATED";
    attempt.completedAt = new Date().toISOString();
    attempt.scorePercentage = scorePercentage;
    attempt.passed = passed;
    attempt.feedbackSummary = passed
      ? `Congratulations! You passed with ${scorePercentage}%. Your verified skill evidence for "${asm.targetSkillName}" has been minted into your Digital Twin.`
      : `You scored ${scorePercentage}%, which is below the passing requirement of ${asm.passingPercentage}%. Review the explanations below and attempt again when ready.`;
    devStore.saveAssessmentAttempt(attempt);

    // Save result
    const resultRecord: AssessmentSubmissionResult = {
      attemptId,
      assessmentId: asm.id,
      assessmentTitle: asm.title,
      targetSkillName: asm.targetSkillName,
      totalScore: totalPointsAwarded,
      maxScore: maxPoints,
      scorePercentage,
      passed,
      passingPercentage: asm.passingPercentage,
      strengths: strengths.length > 0 ? strengths : ["Attempt completed with focus."],
      improvements: improvements.length > 0 ? improvements : ["Great job! All questions answered accurately."],
      evidenceGenerated,
      evidenceId,
      criImpactSummary: passed
        ? `+ Verified Skill Added: "${asm.targetSkillName}" is now confirmed. Career Readiness Index (CRI) Dimension 3 (Skill Development) updated.`
        : "No penalty incurred. Self-reported skills remain intact. Re-attempt anytime after revision.",
      detailedQuestionResults: detailedResults,
    };

    devStore.saveAssessmentResult(resultRecord);

    // Persist to PostgreSQL Prisma if database is connected
    try {
      const conn = await checkDatabaseConnection();
      if (conn.connected && db) {
        // 1. Ensure Assessment exists in Prisma
        await db.assessment.upsert({
          where: { slug: asm.slug },
          update: {},
          create: {
            id: asm.id,
            title: asm.title,
            slug: asm.slug,
            description: asm.description,
            stream: toDbStream(asm.stream),
            category: asm.category,
            targetSkillName: asm.targetSkillName,
            difficultyLevel: asm.difficultyLevel,
            durationMinutes: asm.durationMinutes,
            passingPercentage: asm.passingPercentage,
          },
        }).catch(() => {});

        // 2. Resolve StudentProfile in Prisma
        const sp = await db.studentProfile.findFirst({
          where: {
            OR: [
              { id: studentProfileId },
              { userId: studentProfileId },
            ],
          },
        });

        if (sp) {
          // 3. Upsert AssessmentAttempt in Prisma
          await db.assessmentAttempt.upsert({
            where: { id: attemptId },
            update: {
              status: "EVALUATED",
              completedAt: new Date(),
              scorePercentage,
              passed,
              feedbackSummary: attempt.feedbackSummary,
            },
            create: {
              id: attemptId,
              assessmentId: asm.id,
              studentProfileId: sp.id,
              status: "EVALUATED",
              completedAt: new Date(),
              scorePercentage,
              passed,
              feedbackSummary: attempt.feedbackSummary,
            },
          }).catch(() => {});

          // 4. Upsert AssessmentResult in Prisma
          await db.assessmentResult.upsert({
            where: { attemptId },
            update: {
              totalScore: totalPointsAwarded,
              maxScore: maxPoints,
              percentage: scorePercentage,
              passed,
              strengths,
              improvements,
              skillEvidenceId: evidenceId || null,
            },
            create: {
              attemptId,
              studentProfileId: sp.id,
              totalScore: totalPointsAwarded,
              maxScore: maxPoints,
              percentage: scorePercentage,
              passed,
              strengths,
              improvements,
              skillEvidenceId: evidenceId || null,
            },
          }).catch(() => {});
        }
      }
    } catch (dbErr) {
      console.warn("[AssessmentEngine.submitAttempt] DB persistence note:", dbErr);
    }

    return resultRecord;
  }

  /**
   * Retrieves results for a completed attempt.
   */
  public static async getAttemptResult(attemptId: string): Promise<AssessmentSubmissionResult | null> {
    // 1. Check in-memory/local devStore first
    const res = devStore.getAssessmentResult(attemptId);
    if (res) return res;

    // 2. Query Prisma PostgreSQL
    try {
      const conn = await checkDatabaseConnection();
      if (conn.connected && db) {
        const dbResult = await db.assessmentResult.findUnique({
          where: { attemptId },
          include: {
            attempt: {
              include: {
                assessment: true,
              },
            },
          },
        });

        if (dbResult) {
          const asm =
            KAABIL_ASSESSMENTS.find(
              (a) => a.id === dbResult.attempt?.assessmentId || a.slug === dbResult.attempt?.assessment?.slug
            ) ||
            devStore.getAssessmentById(dbResult.attempt?.assessmentId || "") || {
              id: dbResult.attempt?.assessment?.id || "asm-default",
              title: dbResult.attempt?.assessment?.title || "Universal Skill Assessment",
              targetSkillName: dbResult.attempt?.assessment?.targetSkillName || "Skill Competency",
              passingPercentage: dbResult.attempt?.assessment?.passingPercentage || 70,
              questions: [],
            };

          const reconstructed: AssessmentSubmissionResult = {
            attemptId: dbResult.attemptId,
            assessmentId: asm.id,
            assessmentTitle: asm.title,
            targetSkillName: asm.targetSkillName,
            totalScore: dbResult.totalScore,
            maxScore: dbResult.maxScore,
            scorePercentage: dbResult.percentage,
            passed: dbResult.passed,
            passingPercentage: asm.passingPercentage,
            strengths: dbResult.strengths?.length > 0 ? dbResult.strengths : ["Completed all sections."],
            improvements: dbResult.improvements?.length > 0 ? dbResult.improvements : ["Great job! All questions answered accurately."],
            evidenceGenerated: !!dbResult.skillEvidenceId,
            evidenceId: dbResult.skillEvidenceId || undefined,
            criImpactSummary: dbResult.passed
              ? `+ Verified Skill Added: "${asm.targetSkillName}" is now confirmed. Career Readiness Index (CRI) updated.`
              : "No penalty incurred. Self-reported skills remain intact. Re-attempt anytime after revision.",
            detailedQuestionResults: [],
          };

          devStore.saveAssessmentResult(reconstructed);
          return reconstructed;
        }

        // Also check if attempt exists in Prisma
        const dbAttempt = await db.assessmentAttempt.findUnique({
          where: { id: attemptId },
          include: { assessment: true },
        });

        if (dbAttempt && dbAttempt.status === "EVALUATED") {
          const asm =
            KAABIL_ASSESSMENTS.find((a) => a.id === dbAttempt.assessmentId) ||
            KAABIL_ASSESSMENTS[0];
          const reconstructed: AssessmentSubmissionResult = {
            attemptId: dbAttempt.id,
            assessmentId: asm.id,
            assessmentTitle: asm.title,
            targetSkillName: asm.targetSkillName,
            totalScore: ((dbAttempt.scorePercentage || 0) / 100) * 60,
            maxScore: 60,
            scorePercentage: dbAttempt.scorePercentage || 0,
            passed: !!dbAttempt.passed,
            passingPercentage: asm.passingPercentage,
            strengths: ["Completed all required sections."],
            improvements: ["Review individual questions below."],
            evidenceGenerated: !!dbAttempt.passed,
            criImpactSummary: dbAttempt.passed
              ? `Skill "${asm.targetSkillName}" is verified in your Career Digital Twin.`
              : "Re-take the assessment once you have revised the foundational material.",
            detailedQuestionResults: [],
          };
          devStore.saveAssessmentResult(reconstructed);
          return reconstructed;
        }
      }
    } catch (err) {
      console.warn("[AssessmentEngine.getAttemptResult] Prisma query note:", err);
    }

    // 3. Fallback: build from attempt if result object was not stored in devStore
    const attempt = devStore.getAssessmentAttempt(attemptId);
    if (!attempt || attempt.status !== "EVALUATED") return null;

    const asm = devStore.getAssessmentById(attempt.assessmentId) || KAABIL_ASSESSMENTS[0];
    return {
      attemptId: attempt.id,
      assessmentId: asm.id,
      assessmentTitle: asm.title,
      targetSkillName: asm.targetSkillName,
      totalScore: (attempt.scorePercentage / 100) * 60,
      maxScore: 60,
      scorePercentage: attempt.scorePercentage,
      passed: attempt.passed,
      passingPercentage: asm.passingPercentage,
      strengths: ["Completed all required sections."],
      improvements: ["Review individual questions below."],
      evidenceGenerated: !!attempt.passed,
      criImpactSummary: attempt.passed
        ? `Skill "${asm.targetSkillName}" is verified in your Career Digital Twin.`
        : "Re-take the assessment once you have revised the foundational material.",
      detailedQuestionResults: [],
    };
  }
}
