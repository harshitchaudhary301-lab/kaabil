import { NextRequest, NextResponse } from "next/server";
import { PassportSharingService } from "@/lib/passport/sharing-service";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const verified = await PassportSharingService.verifyPublicShareToken(
      params.token
    );

    return NextResponse.json({ success: true, verification: verified });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
