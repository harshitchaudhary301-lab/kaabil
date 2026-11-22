import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { PassportSharingService } from "@/lib/passport/sharing-service";
import { devStore } from "@/lib/dev-store";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tokenRecord = devStore.getShareToken(params.token);
    if (!tokenRecord) {
      return NextResponse.json({ success: false, error: "Token not found" }, { status: 404 });
    }

    const userProfileId = user.studentProfile?.id || "demo-profile-id";
    if (
      tokenRecord.studentProfileId &&
      tokenRecord.studentProfileId !== userProfileId &&
      user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You cannot revoke another student's share token." },
        { status: 403 }
      );
    }

    const success = PassportSharingService.revokeToken(params.token);

    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to revoke share token" },
      { status: 500 }
    );
  }
}
