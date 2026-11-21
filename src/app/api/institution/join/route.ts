import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { InstitutionStudentService } from "@/lib/institution/student-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const profileId = user?.studentProfile?.id || "demo-profile-id";

    const body = await req.json();
    const { invitationCode } = body;

    if (!invitationCode || typeof invitationCode !== "string") {
      return NextResponse.json(
        { success: false, error: "Invitation code is required." },
        { status: 400 }
      );
    }

    const enrollment = await InstitutionStudentService.joinInstitutionByCode(
      profileId,
      invitationCode
    );

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to join institution" },
      { status: 400 }
    );
  }
}
