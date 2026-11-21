// ==============================================================================
// KAABIL (काबिल) — Interview Practice Lab Service
// Career-specific mock interview simulation, structured competency rubrics,
// and constructive feedback engine.
// Strictly adheres to Responsible AI: ZERO facial or biometric emotion analysis.
// ==============================================================================

import { devStore } from "@/lib/dev-store";
import { InterviewQuestionItem, MockInterviewSessionRecord } from "@/types/admin";
import { EducationalStream } from "@/types";

export class MockInterviewService {
  /**
   * Retrieves practice questions filtered by career, stream, or difficulty.
   */
  public static getQuestions(filters?: {
    stream?: string;
    targetCareer?: string;
    category?: string;
  }): InterviewQuestionItem[] {
    return devStore.getMockInterviewQuestions(filters);
  }

  /**
   * Retrieves student's past mock interview sessions.
   */
  public static getStudentSessions(studentId: string): MockInterviewSessionRecord[] {
    return devStore.getMockInterviewSessions(studentId);
  }

  /**
   * Evaluates student's interview response against standard competency rubric
   * and saves the session record.
   */
  public static evaluateAndSaveResponse(params: {
    studentId: string;
    questionId: string;
    studentAnswer: string;
  }): MockInterviewSessionRecord {
    const questions = devStore.getMockInterviewQuestions();
    const question = questions.find((q: any) => q.id === params.questionId);

    if (!question) {
      throw new Error(`Interview question ${params.questionId} not found.`);
    }

    const answer = params.studentAnswer.trim();
    const wordCount = answer.split(/\s+/).length;

    // Structured rubric scoring
    let score = 70;
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (wordCount >= 40) {
      score += 15;
      strengths.push("Provided a detailed and comprehensive response.");
    } else {
      score -= 10;
      improvements.push("Elaborate further with concrete examples and structured STAR methodology (Situation, Task, Action, Result).");
    }

    // Check for rubric keywords
    const lower = answer.toLowerCase();
    let matchedKeywords = 0;
    const rubricItems = question.rubric || question.modelAnswerOutline || [];
    for (const kw of rubricItems) {
      const tokens = String(kw).toLowerCase().split(/\s+/);
      if (tokens.some((t: string) => lower.includes(t))) {
        matchedKeywords++;
      }
    }

    if (matchedKeywords > 0) {
      score += Math.min(15, matchedKeywords * 5);
      strengths.push("Addressed core technical competencies referenced in the evaluation rubric.");
    } else {
      improvements.push("Directly mention standard terminology and methodologies relevant to this career domain.");
    }

    const finalScore = Math.min(98, Math.max(45, score));

    const feedbackText = `Your response demonstrated good foundational understanding (${finalScore}/100). ${
      strengths.length > 0 ? "Key strengths: " + strengths.join(" ") : ""
    } ${improvements.length > 0 ? "For next time: " + improvements.join(" ") : ""}`;

    const session: MockInterviewSessionRecord = {
      id: `mock-session-${Date.now()}`,
      studentId: params.studentId,
      studentProfileId: params.studentId,
      questionId: params.questionId,
      targetCareer: question.targetCareer || question.careerSlug,
      careerSlug: question.careerSlug,
      careerTitle: question.targetCareer || question.careerSlug,
      stream: question.stream as EducationalStream,
      questionText: question.questionText || question.question,
      studentAnswer: answer,
      score: finalScore,
      overallScorePct: finalScore,
      feedback: feedbackText,
      strengths,
      improvements,
      areasToImprove: improvements,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    devStore.saveMockInterviewSession(session);
    return session;
  }
}
