import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { PlacementService } from "@/lib/institution/placement-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const drives = PlacementService.getPlacementDrives(instId, status);

    return NextResponse.json({ success: true, drives });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load placement drives" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    if (!body.companyName || !body.driveTitle || !body.driveDate) {
      return NextResponse.json(
        { success: false, error: "Company name, drive title, and drive date are required." },
        { status: 400 }
      );
    }

    const drive = PlacementService.createPlacementDrive({
      institutionId: instId,
      companyName: body.companyName,
      companyLogo: body.companyLogo,
      driveTitle: body.driveTitle,
      roleType: body.roleType || "FULL_TIME",
      streams: body.streams || ["NON_MEDICAL_PCM"],
      minStage: body.minStage || "UNDERGRADUATE",
      minCRI: body.minCRI ? Number(body.minCRI) : undefined,
      requiredSkills: body.requiredSkills || [],
      packageLPA: body.packageLPA,
      stipendMonthly: body.stipendMonthly,
      driveDate: body.driveDate,
      deadline: body.deadline || body.driveDate,
      venueOrLink: body.venueOrLink || "Campus Placement Auditorium / Online",
      isVerifiedPartner: body.isVerifiedPartner ?? true,
    });

    return NextResponse.json({ success: true, drive });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create placement drive" },
      { status: 500 }
    );
  }
}
