import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { PassportSharingService } from "@/lib/passport/sharing-service";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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
