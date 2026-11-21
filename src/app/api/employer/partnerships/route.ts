import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { InstitutionPartnershipService } from "@/lib/employer/institution-partnership-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const partnerships = InstitutionPartnershipService.getPartnerships(orgId);

    return NextResponse.json({ success: true, partnerships });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load partnerships" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const body = await req.json();
    const { action } = body;

    if (action === "REQUEST_PARTNERSHIP") {
      const { institutionId, notes } = body;
      if (!institutionId) {
        return NextResponse.json(
          { success: false, error: "institutionId is required." },
          { status: 400 }
        );
      }
      const partnership = InstitutionPartnershipService.requestPartnership({
        employerOrganizationId: orgId,
        institutionId,
        notes,
      });
      return NextResponse.json({ success: true, partnership });
    }

    if (action === "PROPOSE_DRIVE") {
      const {
        institutionId,
        driveTitle,
        roleType,
        streams,
        minStage,
        minCRI,
        requiredSkills,
        packageLPA,
        stipendMonthly,
        driveDate,
        deadline,
        venueOrLink,
      } = body;

      if (!institutionId || !driveTitle || !driveDate) {
        return NextResponse.json(
          { success: false, error: "institutionId, driveTitle, and driveDate are required." },
          { status: 400 }
        );
      }

      const drive = InstitutionPartnershipService.proposeCampusDrive({
        employerOrganizationId: orgId,
        institutionId,
        driveTitle,
        roleType: roleType || "FULL_TIME",
        streams: streams || ["NON_MEDICAL_PCM"],
        minStage: minStage || "UNDERGRADUATE",
        minCRI: minCRI ? Number(minCRI) : undefined,
        requiredSkills: requiredSkills || [],
        packageLPA,
        stipendMonthly,
        driveDate,
        deadline: deadline || driveDate,
        venueOrLink,
      });

      return NextResponse.json({ success: true, drive });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use 'REQUEST_PARTNERSHIP' or 'PROPOSE_DRIVE'." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process partnership request" },
      { status: 400 }
    );
  }
}
