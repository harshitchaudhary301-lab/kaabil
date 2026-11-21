// ==============================================================================
// KAABIL (काबिल) — Database Connection Status Health API
// ==============================================================================

import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/db";
import { CareerRepository } from "@/repositories/career.repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await checkDatabaseConnection();
  const counts = await CareerRepository.getCatalogueCounts();

  return NextResponse.json({
    status: status.connected ? "connected" : "disconnected",
    message: status.message,
    database: {
      provider: "postgresql",
      isLive: status.connected,
      activeSource: counts.source,
      totalCareers: counts.totalCareers,
      totalStreams: counts.totalStreams,
    },
    demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
    timestamp: new Date().toISOString(),
  });
}
