// ==============================================================================
// KAABIL (काबिल) — Retrieve Saved Careers API Endpoint
// Returns student's bookmarked careers with full details and notes
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db, checkDatabaseConnection } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { getCareerBySlug } from "@/data/careersData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conn = await checkDatabaseConnection();
    const savedItems = [];

    if (conn.connected) {
      const profile = await db.studentProfile.findUnique({
        where: { userId: user.id },
        include: {
          savedCareers: {
            include: { careerPath: true },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (profile && profile.savedCareers.length > 0) {
        for (const item of profile.savedCareers) {
          const localMatch = getCareerBySlug(item.careerPath.slug);
          savedItems.push({
            id: item.id,
            careerSlug: item.careerPath.slug,
            title: item.careerPath.title,
            tagline: item.careerPath.tagline,
            stream: localMatch?.stream || "UNDECIDED",
            streamTitle: localMatch?.streamTitle || "General",
            notes: item.notes,
            savedAt: item.createdAt,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      savedCareers: savedItems,
      total: savedItems.length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Could not retrieve saved careers", details: err.message },
      { status: 500 }
    );
  }
}
