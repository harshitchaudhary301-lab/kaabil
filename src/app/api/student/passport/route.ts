import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { PassportService } from "@/lib/passport/passport-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const profileId = user?.studentProfile?.id || "demo-profile-id";

    const passport = await PassportService.generatePassport(profileId);

    return NextResponse.json({ success: true, passport });
  } catch (error: any) {
    console.error("[Passport API GET error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate Digital Skill Passport" },
      { status: 500 }
    );
  }
}
