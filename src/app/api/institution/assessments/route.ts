import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { InstitutionalAssessmentService } from "@/lib/institution/institutional-assessment-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || undefined;

    const catalogue = InstitutionalAssessmentService.getAssessmentCatalogue(stream);
    const schedules = InstitutionalAssessmentService.getScheduledAssessments(instId);

    return NextResponse.json({ success: true, catalogue, schedules });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load institutional assessments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    if (!body.title || !body.assessmentId || !body.scheduledDate || !body.deadline) {
      return NextResponse.json(
        { success: false, error: "Title, assessmentId, scheduledDate, and deadline are required." },
        { status: 400 }
      );
    }

    const schedule = InstitutionalAssessmentService.scheduleAssessment({
      institutionId: instId,
      title: body.title,
      assessmentId: body.assessmentId,
      departmentId: body.departmentId,
      batchId: body.batchId,
      scheduledDate: body.scheduledDate,
      deadline: body.deadline,
    });

    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to schedule assessment" },
      { status: 500 }
    );
  }
}
