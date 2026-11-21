import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { PlacementService } from "@/lib/institution/placement-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    const { driveId, studentEnrollmentId } = body;

    if (!driveId || !studentEnrollmentId) {
      return NextResponse.json(
        { success: false, error: "driveId and studentEnrollmentId are required." },
        { status: 400 }
      );
    }

    const drive = PlacementService.getPlacementDrive(instId, driveId);
    if (!drive) {
      return NextResponse.json(
        { success: false, error: "Placement drive not found." },
        { status: 404 }
      );
    }

    const evaluation = PlacementService.evaluateEligibility(drive, studentEnrollmentId);

    return NextResponse.json({ success: true, evaluation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to evaluate eligibility" },
      { status: 500 }
    );
  }
}
