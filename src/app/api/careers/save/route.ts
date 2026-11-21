// ==============================================================================
// KAABIL (काबिल) — Saved Careers Management API Endpoint
// Enables students to bookmark careers with personal exploration notes
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, checkDatabaseConnection } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { getCareerBySlug } from "@/data/careersData";

export const dynamic = "force-dynamic";

const saveSchema = z.object({
  careerSlug: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required to save careers." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid save parameters" }, { status: 400 });
    }

    const { careerSlug, notes } = parsed.data;
    const conn = await checkDatabaseConnection();

    if (conn.connected) {
      let profile = await db.studentProfile.findUnique({ where: { userId: user.id } });
      if (!profile) {
        profile = await db.studentProfile.create({ data: { userId: user.id } });
      }

      // Find or create careerPath in db
      let dbCareer = await db.careerPath.findUnique({ where: { slug: careerSlug } });
      if (!dbCareer) {
        const local = getCareerBySlug(careerSlug);
        if (local) {
          // Find default domain
          const defDomain = await db.domain.findFirst();
          if (defDomain) {
            const defSub = await db.subDomain.findFirst({ where: { domainId: defDomain.id } }) ||
              await db.subDomain.create({ data: { domainId: defDomain.id, name: local.domainName, code: "SUB_" + local.slug.toUpperCase().slice(0, 10) } });

            dbCareer = await db.careerPath.create({
              data: {
                subDomainId: defSub.id,
                title: local.title,
                slug: local.slug,
                tagline: local.tagline,
                overview: local.overview,
                minEducationStage: local.minEducationStage as any,
                typicalDuration: local.typicalDurationYears,
              },
            });
          }
        }
      }

      if (dbCareer) {
        await db.savedCareer.upsert({
          where: {
            studentProfileId_careerPathId: {
              studentProfileId: profile.id,
              careerPathId: dbCareer.id,
            },
          },
          update: { notes: notes || null },
          create: {
            studentProfileId: profile.id,
            careerPathId: dbCareer.id,
            notes: notes || null,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Career bookmarked to your Digital Twin exploration tray.",
      careerSlug,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: "Failed to save career", details: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const careerSlug = searchParams.get("slug");
    if (!careerSlug) {
      return NextResponse.json({ error: "Career slug required" }, { status: 400 });
    }

    const conn = await checkDatabaseConnection();
    if (conn.connected) {
      const profile = await db.studentProfile.findUnique({ where: { userId: user.id } });
      const career = await db.careerPath.findUnique({ where: { slug: careerSlug } });
      if (profile && career) {
        await db.savedCareer.deleteMany({
          where: {
            studentProfileId: profile.id,
            careerPathId: career.id,
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: "Career removed from saved bookmarks.",
      careerSlug,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: "Failed to unsave career", details: err.message }, { status: 500 });
  }
}
