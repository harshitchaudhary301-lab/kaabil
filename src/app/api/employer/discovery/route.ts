import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { CandidateDiscoveryService } from "@/lib/employer/candidate-discovery-service";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    // Verify employer status
    const org = devStore.getEmployerOrganization(orgId);
    if (!org || org.verificationStatus !== "VERIFIED") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Only verified employers may access candidate discovery.",
          verificationRequired: true,
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || undefined;
    const minCri = searchParams.get("minCri") ? parseInt(searchParams.get("minCri")!) : undefined;
    const educationStage = searchParams.get("educationStage") || undefined;
    const search = searchParams.get("search") || undefined;

    const candidates = CandidateDiscoveryService.searchCandidates({
      organizationId: orgId,
      stream,
      stage: educationStage,
      minCRI: minCri,
      search,
    });

    return NextResponse.json({
      success: true,
      candidates,
      totalCount: candidates.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to search candidates." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const org = devStore.getEmployerOrganization(orgId);
    if (!org || org.verificationStatus !== "VERIFIED") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Only verified employers may invite candidates.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const candidateId = body.candidateId || body.studentProfileId;
    if (!candidateId || !body.opportunityId || !body.message) {
      return NextResponse.json(
        { success: false, error: "candidateId, opportunityId, and message are required." },
        { status: 400 }
      );
    }

    const invitation = CandidateDiscoveryService.sendInvitation({
      organizationId: orgId,
      recruiterId: user?.id || "rec-dr-verma",
      recruiterName: user?.name || "Dr. Rohit Verma",
      opportunityId: body.opportunityId,
      candidateId,
      note: body.message,
    });

    return NextResponse.json({
      success: true,
      invitation,
      message: "Recruitment invitation sent successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send invitation." },
      { status: 400 }
    );
  }
}
