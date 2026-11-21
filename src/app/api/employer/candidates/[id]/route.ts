import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { CandidateDiscoveryService } from "@/lib/employer/candidate-discovery-service";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const org = devStore.getEmployerOrganization(orgId);
    if (!org || org.verificationStatus !== "VERIFIED") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Only verified employers may view candidate profiles.",
        },
        { status: 403 }
      );
    }

    const result = CandidateDiscoveryService.getCandidateProfile({
      candidateId: params.id,
      organizationId: orgId,
    });

    return NextResponse.json({
      success: true,
      candidate: result.candidate,
      verifiedCredentials: result.verifiedCredentials,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load candidate profile." },
      { status: 404 }
    );
  }
}
