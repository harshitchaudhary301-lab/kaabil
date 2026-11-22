import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedPortalSession } from "@/lib/auth/rbac";
import { AdminService } from "@/lib/admin/admin-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedPortalSession(["SUPER_ADMIN"], "admin-super-01");
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized admin access." },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const logs = AdminService.getAuditLogs(limit);

    return NextResponse.json({
      success: true,
      logs,
      totalCount: logs.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load audit logs." },
      { status: 500 }
    );
  }
}
