import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { InstitutionStudentService } from "@/lib/institution/student-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const departmentId = searchParams.get("departmentId") || undefined;
    const programId = searchParams.get("programId") || undefined;
    const batchId = searchParams.get("batchId") || undefined;
    const stream = searchParams.get("stream") || undefined;
    const status = searchParams.get("status") || undefined;

    const students = InstitutionStudentService.getStudents(instId, {
      search,
      departmentId,
      programId,
      batchId,
      stream,
      status,
    });

    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch student directory" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    if (!body.studentName || !body.studentEmail || !body.stream || !body.stage) {
      return NextResponse.json(
        { success: false, error: "Student name, email, stream, and educational stage are required." },
        { status: 400 }
      );
    }

    const enrollment = InstitutionStudentService.enrollStudent({
      institutionId: instId,
      studentName: body.studentName,
      studentEmail: body.studentEmail,
      rollNumber: body.rollNumber,
      departmentId: body.departmentId,
      programId: body.programId,
      batchId: body.batchId,
      stream: body.stream,
      stage: body.stage,
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to enroll student" },
      { status: 500 }
    );
  }
}
