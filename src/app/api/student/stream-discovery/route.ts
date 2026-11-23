// ==============================================================================
// KAABIL (काबिल) — Stream Selection Discovery Engine
// Interactive 6-step multi-stream diagnostic algorithm across all 13 streams
// Clean separation: diagnostic suggested streams vs explicitly confirmed academic stream
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, checkDatabaseConnection } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { getSessionUser } from "@/lib/auth/session";
import { STREAMS_CONFIG, CAREER_PATHS_DATABASE } from "@/data/careersData";
import { EducationalStream } from "@prisma/client";

export const dynamic = "force-dynamic";

const CANONICAL_STREAMS = [
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

const discoveryRequestSchema = z.object({
  answers: z.union([
    z.record(z.any()),
    z.object({
      subjectInterests: z.array(z.string()).min(1),
      activityPreference: z.string().min(1),
      workEnvironment: z.string().min(1),
      durationAppetite: z.string().min(1),
      coreAmbition: z.string().min(1),
      problemStyle: z.string().min(1),
    }),
  ]),
  preferredLanguage: z.string().optional().default("en"),
  saveToProfile: z.boolean().optional().default(false),
  confirmStream: z.string().optional(),
  confirmedStream: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = discoveryRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid stream discovery request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { answers, confirmStream, confirmedStream } = parsed.data;
    const explicitStreamToConfirm = confirmStream || confirmedStream;

    // Score all 13 streams
    const scores: Record<string, number> = {
      MEDICAL_PCB: 0,
      NON_MEDICAL_PCM: 0,
      COMMERCE: 0,
      ARTS_HUMANITIES: 0,
      LAW: 0,
      MANAGEMENT: 0,
      CREATIVE_DESIGN: 0,
      AGRICULTURE: 0,
      VOCATIONAL_TRADES: 0,
      SPORTS_PHYSICAL_ED: 0,
      HOSPITALITY_TOURISM: 0,
      INTERDISCIPLINARY: 0,
      UNDECIDED: 0,
    };

    // If answers are structured under the 6-question questionnaire from /stream-selector
    if (typeof answers === "object" && answers !== null && !Array.isArray(answers)) {
      const ans = answers as Record<string, any>;

      // 1. Natural Curiosities / Interests
      const interest = ans.interests || ans.subjectInterests;
      if (typeof interest === "string") {
        if (interest === "bio-health") scores.MEDICAL_PCB += 25;
        else if (interest === "math-tech") scores.NON_MEDICAL_PCM += 25;
        else if (interest === "markets-finance") scores.COMMERCE += 25;
        else if (interest === "society-arts") scores.ARTS_HUMANITIES += 25;
        else if (interest === "justice-law") scores.LAW += 25;
        else if (interest === "design-creative") scores.CREATIVE_DESIGN += 25;
        else if (interest === "agriculture-nature") scores.AGRICULTURE += 25;
      } else if (Array.isArray(interest)) {
        for (const sub of interest) {
          const s = String(sub).toLowerCase();
          if (s.includes("bio") || s.includes("medicine")) scores.MEDICAL_PCB += 25;
          if (s.includes("math") || s.includes("physics") || s.includes("computer")) scores.NON_MEDICAL_PCM += 25;
          if (s.includes("account") || s.includes("econ") || s.includes("finance")) scores.COMMERCE += 25;
          if (s.includes("history") || s.includes("polity") || s.includes("psychology")) scores.ARTS_HUMANITIES += 25;
          if (s.includes("law") || s.includes("constitution") || s.includes("debate")) scores.LAW += 25;
          if (s.includes("business") || s.includes("startup") || s.includes("marketing")) scores.MANAGEMENT += 25;
          if (s.includes("design") || s.includes("art") || s.includes("animation")) scores.CREATIVE_DESIGN += 25;
          if (s.includes("agri") || s.includes("soil") || s.includes("plant")) scores.AGRICULTURE += 25;
          if (s.includes("mechanic") || s.includes("electric") || s.includes("robot")) scores.VOCATIONAL_TRADES += 25;
          if (s.includes("sport") || s.includes("phys") || s.includes("fitness")) scores.SPORTS_PHYSICAL_ED += 25;
          if (s.includes("hotel") || s.includes("culinary") || s.includes("tour")) scores.HOSPITALITY_TOURISM += 25;
          if (s.includes("multi") || s.includes("climate") || s.includes("genom")) scores.INTERDISCIPLINARY += 25;
        }
      }

      // 2. Problem Solving Method
      const ps = ans.problem_solving || ans.problemStyle;
      if (ps === "scientific-method") scores.MEDICAL_PCB += 20;
      else if (ps === "logical-math") scores.NON_MEDICAL_PCM += 20;
      else if (ps === "balance-sheets") scores.COMMERCE += 20;
      else if (ps === "argument-persuasion") scores.LAW += 20;
      else if (ps === "creative-synthesis") scores.CREATIVE_DESIGN += 20;
      else if (ps === "hands-on") { scores.AGRICULTURE += 15; scores.VOCATIONAL_TRADES += 20; }

      // 3. Work Environment
      const env = ans.work_environment || ans.workEnvironment;
      if (env === "hospitals" || env === "HOSPITAL") scores.MEDICAL_PCB += 15;
      else if (env === "tech-labs" || env === "TECH_LAB") scores.NON_MEDICAL_PCM += 15;
      else if (env === "corporate-towers" || env === "BOARDROOM") { scores.COMMERCE += 15; scores.MANAGEMENT += 15; }
      else if (env === "courtrooms" || env === "COURTROOM") scores.LAW += 15;
      else if (env === "studios" || env === "STUDIO") scores.CREATIVE_DESIGN += 15;
      else if (env === "outdoors-farms" || env === "OUTDOOR_FIELD") { scores.AGRICULTURE += 15; scores.SPORTS_PHYSICAL_ED += 15; }
      else if (env === "FACTORY") scores.VOCATIONAL_TRADES += 15;
      else if (env === "RESORT") scores.HOSPITALITY_TOURISM += 15;

      // 4. Duration Appetite
      const dur = ans.duration_appetite || ans.durationAppetite;
      if (dur === "long-residency" || dur === "LONG_DEGREE") { scores.MEDICAL_PCB += 15; scores.LAW += 10; scores.INTERDISCIPLINARY += 10; }
      else if (dur === "four-years" || dur === "STANDARD_4YR") { scores.NON_MEDICAL_PCM += 15; scores.COMMERCE += 15; scores.MANAGEMENT += 15; }
      else if (dur === "three-to-five") { scores.COMMERCE += 15; scores.LAW += 10; }
      else if (dur === "flexible-design") scores.CREATIVE_DESIGN += 15;
      else if (dur === "rapid-vocational" || dur === "SHORT_PRACTICAL") { scores.VOCATIONAL_TRADES += 25; scores.CREATIVE_DESIGN += 10; }

      // 5. Core Ambition
      const amb = ans.ambition || ans.coreAmbition;
      if (amb === "healing" || amb === "CLINICAL_CARE") scores.MEDICAL_PCB += 20;
      else if (amb === "invention" || amb === "CODING_LOGIC") { scores.NON_MEDICAL_PCM += 20; scores.INTERDISCIPLINARY += 15; }
      else if (amb === "economic-growth" || amb === "COMMERCIAL_DEALS") { scores.COMMERCE += 20; scores.MANAGEMENT += 20; }
      else if (amb === "justice" || amb === "ADVOCACY_DEBATE") { scores.LAW += 20; scores.ARTS_HUMANITIES += 15; }
      else if (amb === "public-service") { scores.ARTS_HUMANITIES += 20; scores.LAW += 10; }
      else if (amb === "sustainability" || amb === "NATURE_FARMING") scores.AGRICULTURE += 20;
      else if (amb === "ATHLETIC_TRAINING") scores.SPORTS_PHYSICAL_ED += 20;
      else if (amb === "HOSPITALITY_EVENTS") scores.HOSPITALITY_TOURISM += 20;
    }

    // Baseline exploration weight
    scores.UNDECIDED = 10;

    // Sort streams by score
    const ranked = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([stream, score]) => ({
        stream: stream as EducationalStream,
        score,
        overview: STREAMS_CONFIG.find((s) => s.stream === stream),
      }));

    const primaryStream = ranked[0];
    const alternativeStreams = ranked.slice(1, 3);

    // Associated careers from career database
    const primaryCareers = CAREER_PATHS_DATABASE.filter(
      (c) => c.stream === primaryStream.stream
    ).slice(0, 3);

    const primaryOverview = primaryStream.overview;
    const fitScore = Math.min(96, Math.max(60, primaryStream.score + 20));

    // Construct unified result matching both /stream-selector UI and API consumers
    const discoveryResult = {
      primaryStream: {
        stream: primaryStream.stream,
        streamName: primaryOverview?.title || primaryStream.stream,
        title: primaryOverview?.title || primaryStream.stream,
        hindiTitle: primaryOverview?.hindiTitle,
        matchScore: fitScore,
        fitScore,
        description: primaryOverview?.shortDescription || "Comprehensive educational stream pathway.",
        shortDescription: primaryOverview?.shortDescription,
        keySubjects: primaryOverview?.typicalSubjects || [],
        typicalSubjects: primaryOverview?.typicalSubjects || [],
        topCareers: primaryCareers.map((c) => ({
          title: c.title,
          slug: c.slug,
          duration: c.typicalDurationYears,
          entranceExams: c.keyEntranceExams,
          entrySalary: (c as any).salaryRange?.entry
            ? `₹${((c as any).salaryRange.entry / 100000).toFixed(1)} Lakhs/yr`
            : c.avgStartingSalaryInr
            ? `₹${(c.avgStartingSalaryInr / 100000).toFixed(1)} Lakhs/yr`
            : "₹6.0 Lakhs/yr",
        })),
        benefits: [
          "Direct alignment with your preferred problem-solving style and subject curiosity.",
          "Strong national institutional ecosystem and documented career growth.",
        ],
        tradeOffs: [
          "Requires targeted entrance preparation and dedicated study commitments.",
        ],
        governingBodies: ["National Educational Regulatory Standards (NEP 2020)"],
      },
      bridgeStreams: alternativeStreams.map((alt) => ({
        stream: alt.stream,
        streamName: alt.overview?.title || alt.stream,
        title: alt.overview?.title || alt.stream,
        matchScore: Math.min(88, Math.max(50, alt.score + 15)),
        fitScore: Math.min(88, Math.max(50, alt.score + 15)),
        shortDescription: alt.overview?.shortDescription,
        reasoning: "Your problem-solving responses indicate strong cross-discipline curiosity suitable for hybrid programs under NEP 2020.",
        bridgeAdvice: `Offers valuable complementary competencies that pair strongly with ${primaryOverview?.title}.`,
      })),
      alternativeStreams: alternativeStreams.map((alt) => ({
        stream: alt.stream,
        title: alt.overview?.title || alt.stream,
        fitScore: Math.min(88, Math.max(50, alt.score + 15)),
        shortDescription: alt.overview?.shortDescription,
        whyConsider: `Offers valuable complementary competencies that pair strongly with ${primaryOverview?.title}.`,
      })),
      disclaimer:
        "This informal stream recommendation is an educational diagnostic guide based on your self-reported preferences under NEP 2020. It is not an automated assignment. Consult guardians and academic counselors before finalizing subject choices.",
      userContext: {
        educationStage: "Class 10 / Class 12 Diagnostic",
        timestamp: new Date().toISOString(),
      },
    };

    // User authentication and persistence logic
    const user = await getSessionUser();
    const conn = await checkDatabaseConnection();
    let streamConfirmed = false;
    let savedProfileStream: string | null = null;

    // Validate explicit stream confirmation if requested
    if (explicitStreamToConfirm) {
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required to confirm academic stream profile." },
          { status: 401 }
        );
      }

      if (!CANONICAL_STREAMS.includes(explicitStreamToConfirm as CanonicalStream)) {
        return NextResponse.json(
          {
            error: `Invalid stream '${explicitStreamToConfirm}'. Must be one of the 13 canonical streams.`,
            validStreams: CANONICAL_STREAMS,
          },
          { status: 400 }
        );
      }
    }

    if (user) {
      if (conn.connected) {
        let profile = await db.studentProfile.findUnique({ where: { userId: user.id } });
        if (!profile) {
          profile = await db.studentProfile.create({ data: { userId: user.id } });
        }

        // 1. Always record the diagnostic suggested stream result
        await db.streamDiscoveryResult.create({
          data: {
            studentProfileId: profile.id,
            recommendedStreams: [primaryStream.stream, ...alternativeStreams.map((a) => a.stream)],
            answersJson: JSON.stringify(answers),
            summaryNotes: `Primary recommended: ${primaryOverview?.title || primaryStream.stream}`,
          },
        });

        // 2. ONLY update the saved academic stream (currentStream) upon EXPLICIT confirmation
        if (explicitStreamToConfirm) {
          const currentSelected = profile.selectedStreams || [];
          const updatedSelected = currentSelected.includes(explicitStreamToConfirm as EducationalStream)
            ? currentSelected
            : [...currentSelected, explicitStreamToConfirm as EducationalStream];

          const updatedProfile = await db.studentProfile.update({
            where: { id: profile.id },
            data: {
              currentStream: explicitStreamToConfirm as EducationalStream,
              selectedStreams: updatedSelected,
            },
          });
          streamConfirmed = true;
          savedProfileStream = updatedProfile.currentStream;
        } else {
          savedProfileStream = profile.currentStream;
        }
      } else {
        // DevStore offline persistence fallback
        let devProfile = devStore.getProfileByUserId(user.id);
        if (!devProfile) {
          const newProfileId = user.studentProfile?.id || "profile-" + user.id;
          devStore.saveProfile({
            id: newProfileId,
            userId: user.id,
            educationStage: "CLASS_12",
            currentStream: "UNDECIDED",
            selectedStreams: [],
            onboardingCompleted: true,
            user: { name: user.name, email: user.email },
          });
          devProfile = devStore.getProfile(newProfileId);
        }

        if (devProfile) {
          // Record diagnostic result on profile
          const updatedDevProfile = { ...devProfile };
          if (!updatedDevProfile.streamDiscoveryResults) {
            updatedDevProfile.streamDiscoveryResults = [];
          }
          updatedDevProfile.streamDiscoveryResults.push({
            recommendedStreams: [primaryStream.stream, ...alternativeStreams.map((a) => a.stream)],
            answers,
            timestamp: new Date().toISOString(),
          });

          // ONLY update currentStream if explicitly confirmed
          if (explicitStreamToConfirm) {
            const currentSelected = updatedDevProfile.selectedStreams || [];
            const updatedSelected = currentSelected.includes(explicitStreamToConfirm)
              ? currentSelected
              : [...currentSelected, explicitStreamToConfirm];

            updatedDevProfile.currentStream = explicitStreamToConfirm;
            updatedDevProfile.selectedStreams = updatedSelected;
            streamConfirmed = true;
            savedProfileStream = explicitStreamToConfirm;

            // Also update session user record in devStore
            const storedUser = devStore.getUserByEmail(user.email);
            if (storedUser) {
              if (!storedUser.studentProfile) storedUser.studentProfile = {};
              storedUser.studentProfile.currentStream = explicitStreamToConfirm;
              devStore.saveUser(storedUser);
            }
          } else {
            savedProfileStream = devProfile.currentStream;
          }

          devStore.saveProfile(updatedDevProfile);
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...discoveryResult,
      discovery: discoveryResult,
      streamConfirmed,
      confirmedStream: streamConfirmed ? explicitStreamToConfirm : undefined,
      savedProfileStream: savedProfileStream || undefined,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Stream discovery error:", err);
    return NextResponse.json(
      { error: "Stream discovery failed", details: err.message },
      { status: 500 }
    );
  }
}
