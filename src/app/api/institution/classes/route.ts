import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { AcademicService } from "@/lib/institution/academic-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const batches = AcademicService.getClassesBatches(instId);
    return NextResponse.json({ success: true, batches });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch batches" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    if (!body.name || !body.sessionId || !body.stream || !body.academicYear) {
      return NextResponse.json(
        { success: false, error: "Batch name, session ID, stream, and academic year are required" },
        { status: 400 }
      );
    }

    const batch = AcademicService.createClassBatch({
      institutionId: instId,
      programId: body.programId,
      departmentId: body.departmentId,
      sessionId: body.sessionId,
      name: body.name,
      semesterOrYearNumber: Number(body.semesterOrYearNumber) || 1,
      sectionName: body.sectionName,
      stream: body.stream,
      academicYear: body.academicYear,
      maxCapacity: Number(body.maxCapacity) || 60,
    });

    return NextResponse.json({ success: true, batch });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create class batch" },
      { status: 500 }
    );
  }
}
