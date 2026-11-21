import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { PlacementService } from "@/lib/institution/placement-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const driveId = searchParams.get("driveId");

    if (!driveId) {
      return NextResponse.json(
        { success: false, error: "driveId query parameter is required." },
        { status: 400 }
      );
    }

    const applications = PlacementService.getDriveApplications(driveId);
    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    const { action } = body;

    if (action === "UPDATE_STATUS") {
      const { driveId, applicationId, status, interviewSlot, offerDetails } = body;
      if (!driveId || !applicationId || !status) {
        return NextResponse.json(
          { success: false, error: "driveId, applicationId, and status are required." },
          { status: 400 }
        );
      }

      const updated = PlacementService.updateApplicationStatus({
        institutionId: instId,
        driveId,
        applicationId,
        status,
        interviewSlot,
        offerDetails,
      });

      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Application not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, application: updated });
    }

    // Default action: APPLY
    const { driveId, studentEnrollmentId } = body;
    if (!driveId || !studentEnrollmentId) {
      return NextResponse.json(
        { success: false, error: "driveId and studentEnrollmentId are required." },
        { status: 400 }
      );
    }

    const application = PlacementService.applyToDrive({
      institutionId: instId,
      driveId,
      studentEnrollmentId,
    });

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process application" },
      { status: 400 }
    );
  }
}
