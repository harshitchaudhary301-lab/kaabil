import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/lib/institution/analytics-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || undefined;

    const demands = AnalyticsService.getIndustryDemand(stream);

    return NextResponse.json({ success: true, demands });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load industry demand intelligence" },
      { status: 500 }
    );
  }
}
