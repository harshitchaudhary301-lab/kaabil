import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { PassportSharingService } from "@/lib/passport/sharing-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const profileId = user?.studentProfile?.id || "demo-profile-id";
    const isMinor = user?.isMinor ?? false;

    const body = await req.json().catch(() => ({}));
    const expiryDays = body.expiryDays || 7;
    const options = body.options;

    const result = await PassportSharingService.createShareToken({
      studentProfileId: profileId,
      isMinor,
      expiryDays,
      options,
    });

    return NextResponse.json({
      success: true,
      token: result.token,
      shareToken: result.token,
      shareUrl: result.shareUrl,
      expiresAt: result.expiresAt,
    });
  } catch (error: any) {
    const isMinorBlocked = error.message?.includes("UNDER_18_PROTECTION");
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate share link",
        isMinorBlocked,
      },
      { status: isMinorBlocked ? 403 : 500 }
    );
  }
}
