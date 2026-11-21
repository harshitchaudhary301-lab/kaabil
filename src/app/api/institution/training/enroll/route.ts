import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { TrainingService } from "@/lib/institution/training-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();

    // Check action: "enroll" vs "updateCompletion"
    if (body.action === "updateCompletion") {
      if (!body.programId || !body.enrollmentId) {
        return NextResponse.json(
          { success: false, error: "programId and enrollmentId are required." },
          { status: 400 }
        );
      }

      const updated = TrainingService.updateCompletion({
        institutionId: instId,
        programId: body.programId,
        enrollmentId: body.enrollmentId,
        attendancePercent: Number(body.attendancePercent) || 0,
        status: body.status || "COMPLETED",
        feedback: body.feedback,
        certificateIssued: Boolean(body.certificateIssued),
      });

      return NextResponse.json({ success: true, enrollment: updated });
    }

    // Default action: Enroll student
    if (!body.programId || !body.studentEnrollmentId || !body.studentName || !body.studentEmail) {
      return NextResponse.json(
        { success: false, error: "programId, studentEnrollmentId, studentName, and studentEmail are required." },
        { status: 400 }
      );
    }

    const enrollment = TrainingService.enrollStudent({
      institutionId: instId,
      programId: body.programId,
      studentEnrollmentId: body.studentEnrollmentId,
      studentName: body.studentName,
      studentEmail: body.studentEmail,
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process training enrollment" },
      { status: 500 }
    );
  }
}
