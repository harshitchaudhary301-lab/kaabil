// ==============================================================================
// KAABIL (काबिल) — Hybrid AI Career Recommendations API Endpoint
// Combines Layer 1 (PostgreSQL / DevStore), Layer 2 (Deterministic Compatibility), Layer 3 (Gemini AI)
// Strictly unbiased: zero fabricated profile data, multi-stream neutral exploration
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { db, checkDatabaseConnection } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import {
  CareerRecommendationEngine,
  StudentProfileContext,
} from "@/lib/recommendations/recommendation-engine";
import { geminiCareerService } from "@/lib/ai/gemini-service";
import { CAREER_PATHS_DATABASE } from "@/data/careersData";

export const dynamic = "force-dynamic";

// The 13 canonical educational streams recognized across KAABIL
const CANONICAL_STREAMS = [
  "ALL",
  "MEDICAL_PCB",
  "NON_MEDICAL_PCM",
  "COMMERCE",
  "ARTS_HUMANITIES",
  "LAW",
  "MANAGEMENT",
  "CREATIVE_DESIGN",
  "AGRICULTURE",
  "VOCATIONAL_TRADES",
  "SPORTS_PHYSICAL_ED",
  "HOSPITALITY_TOURISM",
  "INTERDISCIPLINARY",
  "UNDECIDED",
] as const;

type CanonicalStream = (typeof CANONICAL_STREAMS)[number];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const streamFilter = searchParams.get("stream") || "ALL";

    // Validate explicit stream parameter against canonical stream identifiers
    if (streamFilter !== "ALL" && !CANONICAL_STREAMS.includes(streamFilter as CanonicalStream)) {
      return NextResponse.json(
        {
          error: `Invalid stream parameter '${streamFilter}'. Must be one of the canonical streams or 'ALL'.`,
          validStreams: CANONICAL_STREAMS,
        },
        { status: 400 }
      );
    }

    const user = await getSessionUser();
    let studentContext: StudentProfileContext;
    let isDegraded = false;
    let degradedReason: string | null = null;
    let requiresOnboarding = false;

    const conn = await checkDatabaseConnection();

    if (user && conn.connected) {
      let profile: any = null;
      try {
        profile = await db.studentProfile.findUnique({
          where: { userId: user.id },
          include: {
            interests: true,
            userSkills: { include: { skill: true } },
            learningPreference: true,
            careerGoals: { include: { careerPath: true } },
          },
        });
      } catch (dbErr: any) {
        console.warn("[Recommendations] DB query failed, falling back to degraded mode:", dbErr);
        isDegraded = true;
        degradedReason = "Database query failed; degraded mode active.";
      }

      if (profile) {
        const effectivePrimaryStream =
          streamFilter !== "ALL" ? streamFilter : profile.currentStream;
        const selectedStreams =
          profile.selectedStreams && profile.selectedStreams.length > 0
            ? profile.selectedStreams
            : (profile.currentStream && profile.currentStream !== "UNDECIDED" ? [profile.currentStream] : []);

        studentContext = {
          id: profile.id,
          name: user.name || "Student",
          educationStage: profile.educationStage,
          primaryStream: effectivePrimaryStream,
          selectedStreams:
            streamFilter !== "ALL" && !selectedStreams.includes(streamFilter)
              ? [...selectedStreams, streamFilter]
              : selectedStreams,
          interests: profile.interests.map((i: any) => i.interestName),
          skills: profile.userSkills.map((us: any) => ({
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
        // Authenticated user with no saved profile yet -> neutral onboarding state
        requiresOnboarding = true;
        studentContext = buildNeutralContext(
          user.name || "Student",
          streamFilter !== "ALL" ? streamFilter : "UNDECIDED",
          false
        );
      }
    } else if (user) {
      // Database is unavailable -> Graceful offline fallback via devStore
      isDegraded = true;
      degradedReason = "Database connection unavailable; degraded offline mode.";

      const devProfile = devStore.getProfileByUserId(user.id);
      if (devProfile) {
        const effectivePrimaryStream =
          streamFilter !== "ALL" ? streamFilter : devProfile.currentStream || "UNDECIDED";
        const selectedStreams =
          devProfile.selectedStreams && devProfile.selectedStreams.length > 0
            ? devProfile.selectedStreams
            : (effectivePrimaryStream !== "UNDECIDED" ? [effectivePrimaryStream] : []);

        studentContext = {
          id: devProfile.id,
          name: user.name || devProfile.user?.name || "Student",
          educationStage: devProfile.educationStage || "CLASS_12",
          primaryStream: effectivePrimaryStream,
          selectedStreams:
            streamFilter !== "ALL" && !selectedStreams.includes(streamFilter)
              ? [...selectedStreams, streamFilter]
              : selectedStreams,
          interests: (devProfile.interests || []).map((i: any) =>
            typeof i === "string" ? i : i.interestName || i.domain || ""
          ),
          skills: (devProfile.userSkills || []).map((us: any) => ({
            name: us.skill?.name || us.name,
            proficiency: us.proficiencyLevel || "BEGINNER",
            isVerified: us.isVerified || false,
          })),
          careerGoal: {
            targetRole: devProfile.careerGoals?.[0]?.careerPath?.title || null,
          },
          learningPreferences: devProfile.learningPreference,
        };
      } else {
        requiresOnboarding = true;
        studentContext = buildNeutralContext(
          user.name || "Student",
          streamFilter !== "ALL" ? streamFilter : "UNDECIDED",
          false
        );
      }
    } else {
      // Guest demo preview context -> neutral exploration without fabricated profile
      studentContext = buildNeutralContext(
        "Guest Learner",
        streamFilter !== "ALL" ? streamFilter : "UNDECIDED",
        true
      );
    }

    // Filter complete catalog if stream filter is requested
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

          const aiExplanationSummary =
            typeof aiResult.explanation === "string"
              ? aiResult.explanation
              : aiResult.explanation?.personalizedSummary || "";

          return {
            ...rec,
            score: rec.compatibilityScore,
            breakdown: legacyBreakdown,
            reasons: rec.explanationPoints && rec.explanationPoints.length > 0
              ? rec.explanationPoints
              : [rec.whySuited || `Well aligned with your chosen stream and academic preparation.`],
            aiReasoning: aiExplanationSummary,
            aiExplanation: aiExplanationSummary,
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

        const deterministicSummary =
          typeof deterministicExp === "string"
            ? deterministicExp
            : deterministicExp?.personalizedSummary || "";

        return {
          ...rec,
          score: rec.compatibilityScore,
          breakdown: legacyBreakdown,
          reasons: rec.explanationPoints && rec.explanationPoints.length > 0
            ? rec.explanationPoints
            : [rec.whySuited || `Well aligned with your chosen stream and academic preparation.`],
          aiReasoning: deterministicSummary,
          aiExplanation: deterministicSummary,
          aiProvider: "DETERMINISTIC_HYBRID",
        };
      })
    );

    return NextResponse.json({
      success: true,
      recommendations: enrichedRecommendations,
      isDegraded,
      degradedReason,
      requiresOnboarding,
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
        hasCustomProfile: !requiresOnboarding && Boolean(user),
        isGuest: !user,
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

/**
 * Builds an authentic, un-biased fallback context for guests or undecided students.
 * Strictly avoids fabricating skills, interests, or career goals.
 */
function buildNeutralContext(
  name: string,
  stream: string = "UNDECIDED",
  isGuest: boolean = false
): StudentProfileContext {
  const effectiveStream = stream !== "ALL" ? stream : "UNDECIDED";
  return {
    id: isGuest ? "guest-preview" : "uncalibrated-student",
    name,
    educationStage: "CLASS_12",
    primaryStream: effectiveStream,
    selectedStreams: effectiveStream !== "UNDECIDED" ? [effectiveStream] : [],
    interests: [],
    skills: [],
    careerGoal: { targetRole: null },
    learningPreferences: {
      preferredPace: "BALANCED",
      preferredStyle: "PRACTICAL",
      weeklyHoursAvailable: 10,
      primaryLanguage: "en",
    },
  };
}
