import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { ApplicationService } from "@/lib/employer/application-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const { searchParams } = new URL(req.url);
    const opportunityId = searchParams.get("opportunityId") || undefined;
    const stage = searchParams.get("stage") || undefined;
    const stream = searchParams.get("stream") || undefined;
    const search = searchParams.get("search") || undefined;

    const applications = ApplicationService.getApplications({
      organizationId: orgId,
      opportunityId,
      stage,
      stream,
      search,
    });

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const body = await req.json();
    const { applicationId, stage, recruiterNotes, interviewSlot, offerDetails } = body;

    if (!applicationId || !stage) {
      return NextResponse.json(
        { success: false, error: "applicationId and stage are required." },
        { status: 400 }
      );
    }

    const updated = ApplicationService.updateApplicationStage({
      organizationId: orgId,
      applicationId,
      stage,
      recruiterName: user?.name || "Recruiter",
      recruiterId: user?.id,
      recruiterNotes,
      interviewSlot,
      offerDetails,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Application not found or unauthorized." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update application" },
      { status: 500 }
    );
  }
}
