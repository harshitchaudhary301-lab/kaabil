import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { AnalyticsService } from "@/lib/institution/analytics-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId") || undefined;
    const stream = searchParams.get("stream") || undefined;

    const heatmap = await AnalyticsService.getSkillHeatmap(instId, {
      departmentId,
      stream,
    });

    return NextResponse.json({ success: true, heatmap });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load skill analytics heatmap" },
      { status: 500 }
    );
  }
}
