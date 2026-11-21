// ==============================================================================
// KAABIL (काबिल) — Recommendation Feedback API Endpoint
// Captures student feedback to iteratively refine compatibility weights
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, checkDatabaseConnection } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const feedbackSchema = z.object({
  careerSlug: z.string().min(1),
  isHelpful: z.boolean(),
  rating: z.number().int().min(1).max(5).optional(),
  feedbackText: z.string().max(500).optional(),
  dismissed: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid feedback payload" }, { status: 400 });
    }

    const { careerSlug, isHelpful, rating, feedbackText, dismissed } = parsed.data;
    const conn = await checkDatabaseConnection();

    if (conn.connected) {
      let profile = await db.studentProfile.findUnique({ where: { userId: user.id } });
      if (!profile) {
        profile = await db.studentProfile.create({ data: { userId: user.id } });
      }

      await db.recommendationFeedback.create({
        data: {
          studentProfileId: profile.id,
          careerSlug,
          isHelpful,
          rating: rating || (isHelpful ? 5 : 2),
          feedbackText: feedbackText || null,
          dismissed: !!dismissed,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Feedback recorded. Thank you for helping calibrate KAABIL intelligence.",
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: "Failed to record feedback", details: err.message }, { status: 500 });
  }
}
