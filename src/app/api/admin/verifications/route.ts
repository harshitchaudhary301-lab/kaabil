import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { AdminService } from "@/lib/admin/admin-service";
import { VerificationDecision } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;

    const queue = AdminService.getVerificationQueue({ type, status });

    return NextResponse.json({
      success: true,
      queue,
      totalCount: queue.length,
      pendingCount: queue.filter((r) => r.status === "PENDING_REVIEW").length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load verification queue." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const adminId = sessionUser?.id || "admin-super-01";
    const adminName = sessionUser?.name || "Dr. Vikramaditya Sen";

    const body = await req.json();
    const { requestId, decision, reviewNotes } = body;

    if (!requestId || !decision || !reviewNotes) {
      return NextResponse.json(
        { success: false, error: "requestId, decision, and reviewNotes are required." },
        { status: 400 }
      );
    }

    const validDecisions: VerificationDecision[] = ["APPROVED", "REJECTED", "ADDITIONAL_INFO_REQUIRED"];
    if (!validDecisions.includes(decision)) {
      return NextResponse.json(
        { success: false, error: `Invalid decision. Must be one of: ${validDecisions.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = AdminService.processVerificationDecision({
      adminId,
      adminName,
      requestId,
      decision,
      reviewNotes,
    });

    return NextResponse.json({
      success: true,
      message: `Verification request ${decision.toLowerCase()} successfully.`,
      request: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process verification decision." },
      { status: 400 }
    );
  }
}
