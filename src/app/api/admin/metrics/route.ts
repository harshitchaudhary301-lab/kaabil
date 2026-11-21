import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { AdminService } from "@/lib/admin/admin-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    // In demo environment, allow super admin or default to platform admin
    const isAdmin = user?.role === "SUPER_ADMIN" || !user;

    const metrics = AdminService.getPlatformMetrics();

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load platform metrics." },
      { status: 500 }
    );
  }
}
