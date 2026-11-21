import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { MatchingEngine } from "@/lib/employer/matching-engine";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const studentProfile: any = user?.studentProfile || {
      id: "sp-aryan-01",
      educationStage: "UNDERGRADUATE",
      currentStream: "MEDICAL_PCB",
      isMinor: user?.isMinor ?? false,
    };

    const isMinor = Boolean(
      user?.isMinor ||
      studentProfile.isMinor ||
      ["CLASS_8", "CLASS_9", "CLASS_10"].includes(studentProfile.educationStage)
    );

    if (isMinor) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        isMinor: true,
        notice: "Corporate recruitment opportunities are restricted for under-18 learners per the DPDP Act (2023).",
      });
    }

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || undefined;
    const type = searchParams.get("type") || undefined;

    const matches = MatchingEngine.getRecommendedOpportunitiesForStudent(
      studentProfile.id,
      { stream, type }
    );

    // Enrich with opportunity details
    const enriched = matches.map((m) => {
      const opp = devStore.getJobOpportunity(m.opportunityId);
      return {
        ...m,
        opportunity: opp,
      };
    });

    return NextResponse.json({
      success: true,
      recommendations: enriched,
      totalCount: enriched.length,
      isMinor: false,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load opportunity recommendations." },
      { status: 500 }
    );
  }
}
