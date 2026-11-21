import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { PassportService } from "@/lib/passport/passport-service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    const profileId = user?.studentProfile?.id || "demo-profile-id";

    const revoked = PassportService.revokeCredential(profileId, params.id);

    if (!revoked) {
      return NextResponse.json(
        { success: false, error: "Credential not found or cannot be revoked" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, credential: revoked });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to revoke credential" },
      { status: 500 }
    );
  }
}
