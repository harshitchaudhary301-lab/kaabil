import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { BulkImportService } from "@/lib/institution/bulk-import-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const template = BulkImportService.getCsvTemplate();
    return new NextResponse(template, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="kaabil_student_import_template.csv"',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to download template" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    const { csvContent, fileName, departmentId, programId, batchId } = body;

    if (!csvContent || typeof csvContent !== "string") {
      return NextResponse.json(
        { success: false, error: "CSV file content is required." },
        { status: 400 }
      );
    }

    const result = await BulkImportService.executeBulkImport({
      institutionId: instId,
      fileName: fileName || "students_batch.csv",
      csvContent,
      departmentId,
      programId,
      batchId,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Bulk import failed." },
      { status: 500 }
    );
  }
}
