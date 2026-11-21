import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { ReportingService } from "@/lib/institution/reporting-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const reports = ReportingService.getReports(instId);

    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    const { reportType, academicSession } = body;

    if (!reportType) {
      return NextResponse.json(
        { success: false, error: "reportType is required." },
        { status: 400 }
      );
    }

    const report = ReportingService.generateReport({
      institutionId: instId,
      reportType,
      academicSession,
      generatedBy: user?.name || "Institutional Administrator",
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
