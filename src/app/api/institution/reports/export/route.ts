import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { ReportingService } from "@/lib/institution/reporting-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: "reportId is required." },
        { status: 400 }
      );
    }

    const reports = ReportingService.getReports(instId);
    const report = reports.find((r) => r.id === reportId);

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found." },
        { status: 404 }
      );
    }

    const csvContent = ReportingService.exportReportToCsv(report);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${report.reportType.toLowerCase()}_${report.academicSession.replace(/[^a-zA-Z0-9]/g, "_")}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to export report" },
      { status: 500 }
    );
  }
}
