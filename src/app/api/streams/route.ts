// ==============================================================================
// KAABIL (काबिल) — Educational Streams API
// ==============================================================================

import { NextResponse } from "next/server";
import { StreamRepository } from "@/repositories/stream.repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await StreamRepository.getAllStreams();
    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        error: "Failed to fetch educational streams",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
