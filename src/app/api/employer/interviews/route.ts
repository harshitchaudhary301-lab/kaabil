import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { InterviewService } from "@/lib/employer/interview-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId") || undefined;
    const status = searchParams.get("status") || undefined;

    const interviews = InterviewService.getInterviews({
      organizationId: orgId,
      applicationId,
      status,
    });

    return NextResponse.json({
      success: true,
      interviews,
      totalCount: interviews.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load interviews." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const body = await req.json();
    if (!body.applicationId || !body.interviewType || !body.scheduledDate || !body.startTime || !body.venueOrMeetingLink) {
      return NextResponse.json(
        {
          success: false,
          error: "applicationId, interviewType, scheduledDate, startTime, and venueOrMeetingLink are required.",
        },
        { status: 400 }
      );
    }

    const interview = InterviewService.scheduleInterview({
      organizationId: orgId,
      applicationId: body.applicationId,
      recruiterId: user?.id || "rec-dr-verma",
      recruiterName: user?.name || "Dr. Rohit Verma",
      interviewType: body.interviewType,
      scheduledDate: body.scheduledDate,
      startTime: body.startTime,
      durationMinutes: body.durationMinutes ? parseInt(body.durationMinutes) : 45,
      venueOrMeetingLink: body.venueOrMeetingLink,
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      interview,
      message: "Interview scheduled successfully and synchronized with ATS.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to schedule interview." },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const body = await req.json();
    const { action, interviewId } = body;

    if (!interviewId || !action) {
      return NextResponse.json(
        { success: false, error: "interviewId and action are required." },
        { status: 400 }
      );
    }

    if (action === "FEEDBACK") {
      if (!body.rubricScores || !body.recommendation || !body.feedbackNotes) {
        return NextResponse.json(
          { success: false, error: "rubricScores, recommendation, and feedbackNotes are required." },
          { status: 400 }
        );
      }
      const updated = InterviewService.submitInterviewFeedback({
        interviewId,
        organizationId: orgId,
        rubricScores: body.rubricScores,
        recommendation: body.recommendation,
        feedbackNotes: body.feedbackNotes,
      });
      return NextResponse.json({
        success: true,
        interview: updated,
        message: "Interview feedback submitted and application stage updated to INTERVIEW_COMPLETED.",
      });
    }

    if (action === "RESCHEDULE") {
      if (!body.newDate || !body.newTime) {
        return NextResponse.json(
          { success: false, error: "newDate and newTime are required." },
          { status: 400 }
        );
      }
      const updated = InterviewService.rescheduleInterview({
        interviewId,
        organizationId: orgId,
        newDate: body.newDate,
        newTime: body.newTime,
        newVenueOrLink: body.newVenueOrLink,
        reason: body.reason,
      });
      return NextResponse.json({
        success: true,
        interview: updated,
        message: "Interview rescheduled successfully.",
      });
    }

    if (action === "CANCEL") {
      if (!body.cancellationReason) {
        return NextResponse.json(
          { success: false, error: "cancellationReason is required." },
          { status: 400 }
        );
      }
      const updated = InterviewService.cancelInterview({
        interviewId,
        organizationId: orgId,
        cancellationReason: body.cancellationReason,
      });
      return NextResponse.json({
        success: true,
        interview: updated,
        message: "Interview cancelled.",
      });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update interview." },
      { status: 400 }
    );
  }
}
