import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { devStore } from "@/lib/dev-store";
import { db, checkDatabaseConnection } from "@/lib/db";
import { DISCOVERY_QUESTIONS, DiscoveryQuestion } from "@/data/discoveryQuestions";
import {
  CareerRecommendationEngine,
  StudentProfileContext,
} from "@/lib/recommendations/recommendation-engine";
import { EducationalStream } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    let savedResponses: Record<string, any> = {};

    if (user) {
      // Check devStore attempts/results
      const attempt = devStore.getAssessmentAttempt(`discovery-${user.id}`);
      if (attempt && attempt.answers) {
        savedResponses = attempt.answers;
      }
    }

    return NextResponse.json({
      success: true,
      questions: DISCOVERY_QUESTIONS,
      savedResponses,
      disclaimer: "KAABIL Strengths Discovery is an educational self-exploration tool, not a clinical or psychological aptitude test.",
    });
  } catch (error: any) {
    console.error("[DiscoveryAssessment API] GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load discovery assessment." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { responses, educationStage, preferredLanguage } = body;

    if (!responses || typeof responses !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid responses payload." },
        { status: 400 }
      );
    }

    // 1. Analyze responses to extract interests, subject preferences, and traits
    const extractedInterests: string[] = [];
    const extractedSubjects: string[] = [];
    const streamCounts: Record<string, number> = {};
    const identifiedTraits: string[] = [];
    let choseNotSure = false;

    // Process Q1 (Interests)
    const q1Answers = Array.isArray(responses.q1_interests)
      ? responses.q1_interests
      : responses.q1_interests ? [responses.q1_interests] : [];
    const q1 = DISCOVERY_QUESTIONS.find((q) => q.id === "q1_interests");
    for (const ansId of q1Answers) {
      if (ansId === "not_sure") {
        choseNotSure = true;
      }
      const opt = q1?.options.find((o) => o.id === ansId);
      if (opt) {
        extractedInterests.push(opt.label);
        if (opt.traits) identifiedTraits.push(...opt.traits);
        if (opt.associatedStreams) {
          for (const s of opt.associatedStreams) {
            streamCounts[s] = (streamCounts[s] || 0) + 3;
          }
        }
      }
    }

    // Process Q2 (Subjects)
    const q2Answers = Array.isArray(responses.q2_subjects)
      ? responses.q2_subjects
      : responses.q2_subjects ? [responses.q2_subjects] : [];
    const q2 = DISCOVERY_QUESTIONS.find((q) => q.id === "q2_subjects");
    for (const ansId of q2Answers) {
      const opt = q2?.options.find((o) => o.id === ansId);
      if (opt) {
        extractedSubjects.push(opt.label);
        if (opt.associatedStreams) {
          for (const s of opt.associatedStreams) {
            streamCounts[s] = (streamCounts[s] || 0) + 2;
          }
        }
      }
    }

    // Process Remaining Questions for traits and streams
    for (const q of DISCOVERY_QUESTIONS.slice(2)) {
      const ans = responses[q.id];
      if (ans) {
        const opt = q.options.find((o) => o.id === ans);
        if (opt) {
          if (opt.traits) identifiedTraits.push(...opt.traits);
          if (opt.associatedStreams) {
            for (const s of opt.associatedStreams) {
              streamCounts[s] = (streamCounts[s] || 0) + 2;
            }
          }
        }
      }
    }

    // Determine top candidate streams
    const sortedStreams = Object.entries(streamCounts)
      .filter(([s]) => s !== "UNDECIDED")
      .sort((a, b) => b[1] - a[1])
      .map(([s]) => s as EducationalStream);

    const primaryStream: EducationalStream = sortedStreams[0] || (choseNotSure ? "UNDECIDED" : "NON_MEDICAL_PCM");

    // 2. Build StudentProfileContext for CareerRecommendationEngine
    const studentContext: StudentProfileContext = {
      id: user?.id || "guest-discovery-user",
      name: user?.name || "Student Learner",
      educationStage: educationStage || "CLASS_11",
      primaryStream,
      selectedStreams: sortedStreams.slice(0, 3),
      interests: extractedInterests,
      preferredSubjects: extractedSubjects,
      skills: identifiedTraits.map((t) => ({
        name: t,
        proficiency: "INTERMEDIATE",
        isVerified: false,
      })),
      learningPreferences: {
        primaryLanguage: preferredLanguage || "en",
      },
      discoveryResponses: responses,
    };

    // 3. Generate Top 3–5 Recommendations
    const recommendations = CareerRecommendationEngine.getRecommendations(studentContext, undefined, 5);

    // 4. Save attempt in devStore
    const userId = user?.id || "guest";
    const attemptId = `discovery-${userId}`;
    devStore.saveAssessmentAttempt({
      id: attemptId,
      assessmentId: "asm-discovery-strengths",
      studentProfileId: userId,
      userId,
      answers: responses,
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
      score: 100, // Completion indicator
    });

    devStore.saveAssessmentResult({
      id: `res-${attemptId}`,
      attemptId,
      score: 100,
      passed: true,
      evaluatedAt: new Date().toISOString(),
      metadata: {
        primaryStream,
        topStreams: sortedStreams.slice(0, 3),
        traits: Array.from(new Set(identifiedTraits)),
        choseNotSure,
      },
    });

    return NextResponse.json({
      success: true,
      assessmentResult: {
        primaryStream,
        topStreams: sortedStreams.slice(0, 3),
        identifiedTraits: Array.from(new Set(identifiedTraits)).slice(0, 6),
        choseNotSure,
        dataSufficiency: choseNotSure && extractedInterests.length === 0 ? "INSUFFICIENT" : "SUFFICIENT",
      },
      recommendations,
      disclaimer: "KAABIL Strengths Discovery is an educational self-exploration tool, not a clinical or psychological aptitude test.",
    });
  } catch (error: any) {
    console.error("[DiscoveryAssessment API] POST Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process discovery assessment." },
      { status: 500 }
    );
  }
}
