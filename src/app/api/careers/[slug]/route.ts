// ==============================================================================
// KAABIL (काबिल) — Single Career Pathway Detail API
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { CareerRepository } from "@/repositories/career.repository";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  slug: z.string().min(1).max(120),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const parsed = paramsSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid career slug parameter" },
        { status: 400 }
      );
    }

    const result = await CareerRepository.getCareerBySlug(parsed.data.slug);

    if (!result.data) {
      return NextResponse.json(
        {
          error: "Career path not found",
          slug: parsed.data.slug,
          isDbConnected: result.isDbConnected,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        error: "Failed to fetch career details",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
