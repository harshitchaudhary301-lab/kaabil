import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { InstitutionService } from "@/lib/institution/institution-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const institution = await InstitutionService.getActiveInstitution(instId);
    if (!institution) {
      return NextResponse.json({ success: false, error: "Institution record not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId") || undefined;
    const stream = searchParams.get("stream") || undefined;

    const stats = await InstitutionService.getDashboardStats(institution.id, {
      departmentId,
      stream,
    });

    return NextResponse.json({ success: true, institution, stats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load institution profile" },
      { status: 500 }
    );
  }
}
