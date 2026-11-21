// ==============================================================================
// KAABIL (काबिल) — Stream Selection Discovery Engine
// Interactive 6-step multi-stream diagnostic algorithm across all 13 streams
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, checkDatabaseConnection } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { STREAMS_CONFIG, CAREER_PATHS_DATABASE } from "@/data/careersData";
import { EducationalStream } from "@prisma/client";

export const dynamic = "force-dynamic";

const discoverySchema = z.object({
  answers: z.object({
    subjectInterests: z.array(z.string()).min(1),
    activityPreference: z.string().min(1),
    workEnvironment: z.string().min(1),
    durationAppetite: z.string().min(1),
    coreAmbition: z.string().min(1),
    problemStyle: z.string().min(1),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = discoverySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid stream discovery answers", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { answers } = parsed.data;

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

    // 1. Subject Interests Mapping
    for (const sub of answers.subjectInterests) {
      const s = sub.toLowerCase();
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

    // 2. Activity Preference
    const act = answers.activityPreference;
    if (act === "CLINICAL_CARE") scores.MEDICAL_PCB += 20;
    else if (act === "CODING_LOGIC") { scores.NON_MEDICAL_PCM += 20; scores.INTERDISCIPLINARY += 15; }
    else if (act === "COMMERCIAL_DEALS") { scores.COMMERCE += 20; scores.MANAGEMENT += 20; }
    else if (act === "ADVOCACY_DEBATE") { scores.LAW += 20; scores.ARTS_HUMANITIES += 15; }
    else if (act === "VISUAL_CREATION") scores.CREATIVE_DESIGN += 20;
    else if (act === "HANDS_ON_MACHINES") { scores.VOCATIONAL_TRADES += 20; scores.NON_MEDICAL_PCM += 10; }
    else if (act === "NATURE_FARMING") scores.AGRICULTURE += 20;
    else if (act === "ATHLETIC_TRAINING") scores.SPORTS_PHYSICAL_ED += 20;
    else if (act === "HOSPITALITY_EVENTS") scores.HOSPITALITY_TOURISM += 20;

    // 3. Work Environment
    const env = answers.workEnvironment;
    if (env === "HOSPITAL") scores.MEDICAL_PCB += 15;
    else if (env === "TECH_LAB") scores.NON_MEDICAL_PCM += 15;
    else if (env === "BOARDROOM") { scores.COMMERCE += 15; scores.MANAGEMENT += 15; }
    else if (env === "COURTROOM") scores.LAW += 15;
    else if (env === "STUDIO") scores.CREATIVE_DESIGN += 15;
    else if (env === "OUTDOOR_FIELD") { scores.AGRICULTURE += 15; scores.SPORTS_PHYSICAL_ED += 15; }
    else if (env === "FACTORY") scores.VOCATIONAL_TRADES += 15;
    else if (env === "RESORT") scores.HOSPITALITY_TOURISM += 15;

    // 4. Study Duration
    const dur = answers.durationAppetite;
    if (dur === "LONG_DEGREE") { scores.MEDICAL_PCB += 15; scores.LAW += 10; scores.INTERDISCIPLINARY += 10; }
    else if (dur === "STANDARD_4YR") { scores.NON_MEDICAL_PCM += 15; scores.COMMERCE += 15; scores.MANAGEMENT += 15; }
    else if (dur === "SHORT_PRACTICAL") { scores.VOCATIONAL_TRADES += 20; scores.CREATIVE_DESIGN += 10; }

    // Baseline undecided score
    scores.UNDECIDED = 15;

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

    // Associated careers
    const primaryCareers = CAREER_PATHS_DATABASE.filter((c) => c.stream === primaryStream.stream).slice(0, 3);

    const result = {
      primaryStream: {
        stream: primaryStream.stream,
        title: primaryStream.overview?.title || primaryStream.stream,
        hindiTitle: primaryStream.overview?.hindiTitle,
        shortDescription: primaryStream.overview?.shortDescription,
        fitScore: Math.min(96, Math.max(60, primaryStream.score + 20)),
        typicalSubjects: primaryStream.overview?.typicalSubjects || [],
        topCareers: primaryCareers.map((c) => ({
          title: c.title,
          slug: c.slug,
          duration: c.typicalDurationYears,
          entranceExams: c.keyEntranceExams,
        })),
        benefits: [
          "Direct alignment with your preferred problem-solving style and subject curiosity.",
          "Strong national institutional ecosystem and documented career growth.",
        ],
        tradeOffs: [
          "Requires targeted entrance preparation and dedicated study commitments.",
        ],
      },
      alternativeStreams: alternativeStreams.map((alt) => ({
        stream: alt.stream,
        title: alt.overview?.title || alt.stream,
        fitScore: Math.min(88, Math.max(50, alt.score + 15)),
        shortDescription: alt.overview?.shortDescription,
        whyConsider: `Offers valuable complementary competencies that pair strongly with ${primaryStream.overview?.title}.`,
      })),
      disclaimer: "This informal stream recommendation is an educational diagnostic guide based on your self-reported preferences. It is not a psychological aptitude test. Discuss your career decisions with parents, teachers, and school counselors.",
    };

    // Persist to StreamDiscoveryResult if student authenticated
    const user = await getSessionUser();
    const conn = await checkDatabaseConnection();

    if (user && conn.connected) {
      let profile = await db.studentProfile.findUnique({ where: { userId: user.id } });
      if (!profile) {
        profile = await db.studentProfile.create({ data: { userId: user.id } });
      }

      await db.streamDiscoveryResult.create({
        data: {
          studentProfileId: profile.id,
          recommendedStreams: [primaryStream.stream, ...alternativeStreams.map((a) => a.stream)],
          answersJson: JSON.stringify(answers),
          summaryNotes: `Primary recommended: ${primaryStream.overview?.title}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      discovery: result,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Stream discovery failed", details: err.message },
      { status: 500 }
    );
  }
}
