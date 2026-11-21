import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { PassportService } from "@/lib/passport/passport-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const profileId = user?.studentProfile?.id || "demo-profile-id";

    const credentials = PassportService.getCredentials(profileId);

    return NextResponse.json({ success: true, credentials });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch credentials" },
      { status: 500 }
    );
  }
}
