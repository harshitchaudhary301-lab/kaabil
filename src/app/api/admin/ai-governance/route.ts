import { NextRequest, NextResponse } from "next/server";
import { devStore } from "@/lib/dev-store";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const overview = devStore.getAIGovernanceOverview();
    const records = devStore.getAIGovernanceRecords(limit);

    return NextResponse.json({
      success: true,
      overview,
      records,
      totalCount: records.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load AI governance telemetry." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const adminId = sessionUser?.id || "admin-super-01";
    const adminName = sessionUser?.name || "Dr. Vikramaditya Sen";

    const body = await req.json();
    const { endpoint, model, latencyMs, status, tokensUsed, fallbackUsed, errorDetails } = body;

    const record = {
      id: `ai-telemetry-${Date.now()}`,
      endpoint: endpoint || "universal-career-mentor",
      model: model || "gemini-1.5-pro",
      promptVersion: "v2.4-strict-safety",
      latencyMs: Number(latencyMs) || 450,
      tokensUsed: Number(tokensUsed) || 1200,
      status: (status || "SUCCESS") as any,
      fallbackUsed: Boolean(fallbackUsed),
      errorDetails,
      timestamp: new Date().toISOString(),
    };

    devStore.saveAIGovernanceRecord(record);

    return NextResponse.json({
      success: true,
      message: "Telemetry record saved.",
      record,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to log AI telemetry." },
      { status: 500 }
    );
  }
}
