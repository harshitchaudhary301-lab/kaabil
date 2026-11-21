import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { EmployerOrganizationService } from "@/lib/employer/organization-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const organization = EmployerOrganizationService.getOrganization(orgId);
    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      verificationStatus: organization.verificationStatus,
      verificationNotes: organization.verificationNotes,
      verifiedAt: organization.verifiedAt,
      verifiedBy: organization.verifiedBy,
      registrationNumber: organization.registrationNumber,
      businessProofUrl: organization.businessProofUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load verification status" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const body = await req.json();
    const { registrationNumber, businessProofUrl, notes } = body;

    if (!registrationNumber) {
      return NextResponse.json(
        { success: false, error: "Business registration number (CIN/GSTIN/LLPIN) is required." },
        { status: 400 }
      );
    }

    const updated = EmployerOrganizationService.submitVerification({
      organizationId: orgId,
      registrationNumber,
      businessProofUrl,
      notes,
    });

    return NextResponse.json({ success: true, organization: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit verification" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { organizationId, status, notes } = body;

    const targetOrgId = organizationId || user?.organizations?.[0]?.id || "emp-apex-diag";

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Verification status is required." },
        { status: 400 }
      );
    }

    const updated = EmployerOrganizationService.reviewVerification({
      organizationId: targetOrgId,
      status,
      reviewerName: user?.name || "KAABIL Trust & Verification Officer",
      notes,
    });

    return NextResponse.json({ success: true, organization: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to review verification" },
      { status: 500 }
    );
  }
}
