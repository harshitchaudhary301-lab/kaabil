// ==============================================================================
// KAABIL (काबिल) — Hybrid AI Career Recommendations API Endpoint
// Combines Layer 1 (PostgreSQL), Layer 2 (Deterministic Compatibility), Layer 3 (Gemini AI)
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { db, checkDatabaseConnection } from "@/lib/db";
import {
  CareerRecommendationEngine,
  StudentProfileContext,
} from "@/lib/recommendations/recommendation-engine";
import { geminiCareerService } from "@/lib/ai/gemini-service";
import { CAREER_PATHS_DATABASE } from "@/data/careersData";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const streamFilter = searchParams.get("stream") || "ALL";

    const user = await getSessionUser();
    let studentContext: StudentProfileContext;

    const conn = await checkDatabaseConnection();

    if (user && conn.connected) {
      const profile = await db.studentProfile.findUnique({
        where: { userId: user.id },
        include: {
          interests: true,
          userSkills: { include: { skill: true } },
          learningPreference: true,
          careerGoals: { include: { careerPath: true } },
        },
      });

      if (profile) {
        studentContext = {
          id: profile.id,
          name: user.name || "Student",
          educationStage: profile.educationStage,
          primaryStream: profile.currentStream,
          selectedStreams: profile.selectedStreams.length > 0 ? profile.selectedStreams : [profile.currentStream],
          interests: profile.interests.map((i) => i.interestName),
          skills: profile.userSkills.map((us) => ({
            name: us.skill.name,
            proficiency: us.proficiencyLevel as any,
            isVerified: us.isVerified,
          })),
          careerGoal: {
            targetRole: profile.careerGoals[0]?.careerPath?.title || null,
          },
          learningPreferences: profile.learningPreference
            ? {
                preferredPace: profile.learningPreference.preferredPace,
                preferredStyle: profile.learningPreference.preferredStyle,
                weeklyHoursAvailable: profile.learningPreference.weeklyHoursAvailable,
                primaryLanguage: profile.learningPreference.primaryLanguage,
              }
            : undefined,
        };
      } else {
        studentContext = buildDefaultContext(user.name);
      }
    } else if (user) {
      studentContext = buildDefaultContext(user.name);
    } else {
      // Guest demo preview context
      studentContext = buildDefaultContext("Guest Learner");
    }

    // Filter catalog if stream filter is requested
    let catalog = CAREER_PATHS_DATABASE;
    if (streamFilter !== "ALL") {
      catalog = catalog.filter((c) => c.stream === streamFilter);
    }

    // Execute Layer 2: Deterministic Compatibility Calculation
    const recommendations = CareerRecommendationEngine.getRecommendations(studentContext, catalog, 8);

    // Execute Layer 3: Enrich top 3 recommendations with AI explanations
    const preferredLang = (studentContext.learningPreferences?.primaryLanguage || "en") as "en" | "hi" | "hinglish";
    let aiSource: "gemini_ai" | "deterministic_engine" = "deterministic_engine";
    let aiModel = "deterministic-rule-engine";

    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (rec, index) => {
        // AI explanation for top 3 matches
        if (index < 3) {
          const aiResult = await geminiCareerService.generateCareerExplanation({
            studentName: studentContext.name,
            educationStage: studentContext.educationStage,
            selectedStreams: studentContext.selectedStreams as string[],
            interests: studentContext.interests,
            skills: studentContext.skills.map((s) => s.name),
            careerGoal: studentContext.careerGoal?.targetRole || undefined,
            preferredLanguage: preferredLang,
            careerTitle: rec.career.title,
            careerOverview: rec.career.overview,
            typicalDuration: rec.career.typicalDurationYears,
            entranceExams: rec.career.keyEntranceExams,
            requiredSkills: rec.career.skills.map((s) => s.name),
          });

          aiSource = aiResult.source;
          aiModel = aiResult.modelUsed;

          const legacyBreakdown = {
            interestAlignment: rec.breakdown.interestScore,
            streamSubjectAlignment: rec.breakdown.streamScore,
            skillAlignment: rec.breakdown.skillScore,
            careerGoalsAlignment: rec.breakdown.goalScore,
            learningPreferencesAlignment: rec.breakdown.preferenceScore,
            ...rec.breakdown,
          };

          return {
            ...rec,
            score: rec.compatibilityScore,
            breakdown: legacyBreakdown,
            reasons: rec.explanationPoints && rec.explanationPoints.length > 0
              ? rec.explanationPoints
              : [rec.whySuited || `Well aligned with your interests and academic preparation.`],
            aiReasoning: aiResult.explanation,
            aiExplanation: aiResult.explanation,
            aiProvider: aiResult.source === "gemini_ai" ? "GEMINI_2_FLASH" : "DETERMINISTIC_HYBRID",
          };
        }

        // Standard deterministic fallback for remainder
        const deterministicExp = geminiCareerService.generateDeterministicExplanation(
          {
            studentName: studentContext.name,
            educationStage: studentContext.educationStage,
            selectedStreams: studentContext.selectedStreams as string[],
            interests: studentContext.interests,
            skills: studentContext.skills.map((s) => s.name),
            careerTitle: rec.career.title,
            careerOverview: rec.career.overview,
            typicalDuration: rec.career.typicalDurationYears,
            entranceExams: rec.career.keyEntranceExams,
            requiredSkills: rec.career.skills.map((s) => s.name),
          },
          preferredLang
        );

        const legacyBreakdown = {
          interestAlignment: rec.breakdown.interestScore,
          streamSubjectAlignment: rec.breakdown.streamScore,
          skillAlignment: rec.breakdown.skillScore,
          careerGoalsAlignment: rec.breakdown.goalScore,
          learningPreferencesAlignment: rec.breakdown.preferenceScore,
          ...rec.breakdown,
        };

        return {
          ...rec,
          score: rec.compatibilityScore,
          breakdown: legacyBreakdown,
          reasons: rec.explanationPoints && rec.explanationPoints.length > 0
            ? rec.explanationPoints
            : [rec.whySuited || `Well aligned with your interests and academic preparation.`],
          aiReasoning: deterministicExp,
          aiExplanation: deterministicExp,
          aiProvider: "DETERMINISTIC_HYBRID",
        };
      })
    );

    return NextResponse.json({
      success: true,
      recommendations: enrichedRecommendations,
      aiTelemetry: {
        source: aiSource,
        modelUsed: aiModel,
        language: preferredLang,
        isGuestDemo: !user,
      },
      profileSummary: {
        name: studentContext.name,
        educationStage: studentContext.educationStage,
        primaryStream: studentContext.primaryStream,
        interestsCount: studentContext.interests.length,
        skillsCount: studentContext.skills.length,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Recommendations error:", err);
    return NextResponse.json(
      { error: "Failed to generate recommendations", details: err.message },
      { status: 500 }
    );
  }
}

function buildDefaultContext(name: string): StudentProfileContext {
  return {
    id: "default-context",
    name,
    educationStage: "CLASS_12",
    primaryStream: "NON_MEDICAL_PCM",
    selectedStreams: ["NON_MEDICAL_PCM", "COMMERCE"],
    interests: ["Artificial Intelligence & Coding", "Data Science & Mathematics", "Financial Markets & Stock Trading"],
    skills: [
      { name: "Python Programming", proficiency: "INTERMEDIATE", isVerified: false },
      { name: "Critical Thinking & Logic", proficiency: "INTERMEDIATE", isVerified: false },
    ],
    careerGoal: { targetRole: "AI Systems Engineer" },
    learningPreferences: {
      preferredPace: "BALANCED",
      preferredStyle: "PRACTICAL",
      weeklyHoursAvailable: 10,
      primaryLanguage: "en",
    },
  };
}
