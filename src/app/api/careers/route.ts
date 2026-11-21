// ==============================================================================
// KAABIL (काबिल) — Career Pathways Catalogue API
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { CareerRepository } from "@/repositories/career.repository";
import { EducationalStream } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  stream: z
    .enum([
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
    ])
    .optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      stream: searchParams.get("stream") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await CareerRepository.getCareers({
      stream: parsed.data.stream as EducationalStream | "ALL",
      search: parsed.data.search,
      page: parsed.data.page,
      limit: parsed.data.limit,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        error: "Failed to retrieve careers catalogue",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
