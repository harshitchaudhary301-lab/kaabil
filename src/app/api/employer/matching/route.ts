import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { MatchingEngine } from "@/lib/employer/matching-engine";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const { searchParams } = new URL(req.url);
    const opportunityId = searchParams.get("opportunityId");
    const minScore = searchParams.get("minScore") ? parseInt(searchParams.get("minScore")!) : undefined;
    const tier = searchParams.get("tier") as any;
    const stream = searchParams.get("stream") || undefined;

    if (!opportunityId) {
      return NextResponse.json(
        { success: false, error: "opportunityId query parameter is required." },
        { status: 400 }
      );
    }

    const matches = MatchingEngine.matchCandidatesForOpportunity({
      opportunityId,
      organizationId: orgId,
      minScore,
      stream,
    });

    const config = devStore.getMatchingConfig(orgId);

    return NextResponse.json({
      success: true,
      matches,
      totalCount: matches.length,
      currentWeights: config.weights,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate talent matches." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const body = await req.json();
    if (!body.weights) {
      return NextResponse.json(
        { success: false, error: "Weights configuration is required." },
        { status: 400 }
      );
    }

    const updatedConfig = devStore.saveMatchingConfig(orgId, {
      organizationId: orgId,
      opportunityId: body.opportunityId,
      weights: body.weights,
      mandatoryThreshold: body.mandatoryThreshold || 50,
      freshnessPenaltyMonths: body.freshnessPenaltyMonths || 6,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      config: updatedConfig,
      message: "Matching weights updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update matching configuration." },
      { status: 500 }
    );
  }
}
