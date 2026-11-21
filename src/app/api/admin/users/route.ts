import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { AdminService } from "@/lib/admin/admin-service";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const users = AdminService.getUsers({ role, status, search });

    return NextResponse.json({
      success: true,
      users,
      totalCount: users.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load users." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const adminId = sessionUser?.id || "admin-super-01";
    const adminName = sessionUser?.name || "Dr. Vikramaditya Sen";

    const body = await req.json();
    const { action, emailOrId, status, role, reason } = body;

    if (!emailOrId || !action) {
      return NextResponse.json(
        { success: false, error: "emailOrId and action are required." },
        { status: 400 }
      );
    }

    if (action === "UPDATE_STATUS") {
      if (!status) {
        return NextResponse.json(
          { success: false, error: "status is required." },
          { status: 400 }
        );
      }
      const updated = AdminService.updateUserStatus({
        adminId,
        adminName,
        targetEmailOrId: emailOrId,
        status,
        reason,
      });
      return NextResponse.json({
        success: true,
        user: updated,
        message: `User status updated to ${status}.`,
      });
    }

    if (action === "UPDATE_ROLE") {
      if (!role) {
        return NextResponse.json(
          { success: false, error: "role is required." },
          { status: 400 }
        );
      }
      const updated = AdminService.updateUserRole({
        adminId,
        adminName,
        targetEmailOrId: emailOrId,
        role,
      });
      return NextResponse.json({
        success: true,
        user: updated,
        message: `User role updated to ${role}.`,
      });
    }

    if (action === "REQUEST_DELETION") {
      const updated = devStore.requestAccountDeletion(emailOrId);
      devStore.saveAdminAuditLog({
        adminId,
        adminName,
        action: "USER_DELETION_REQUESTED",
        targetType: "USER",
        targetId: updated.id,
        targetName: updated.name,
        details: "User initiated DPDP right-to-be-forgotten deletion workflow.",
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({
        success: true,
        user: updated,
        message: "Account scheduled for deletion.",
      });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user." },
      { status: 400 }
    );
  }
}
