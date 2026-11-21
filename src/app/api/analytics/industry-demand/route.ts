import { NextRequest, NextResponse } from "next/server";
import { IndustryDemandService } from "@/lib/analytics/industry-demand-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const insights = IndustryDemandService.getDemandInsights();

    return NextResponse.json({
      success: true,
      insights,
      totalStreamsMapped: insights.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load industry demand insights." },
      { status: 500 }
    );
  }
}
