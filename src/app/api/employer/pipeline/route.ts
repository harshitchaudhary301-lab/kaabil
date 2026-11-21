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

    const pipeline = ApplicationService.getPipelineData(orgId, opportunityId);

    return NextResponse.json({ success: true, pipeline });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load pipeline" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const body = await req.json();
    const { applicationId, stage, recruiterNotes } = body;

    if (!applicationId || !stage) {
      return NextResponse.json(
        { success: false, error: "applicationId and target stage are required." },
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
      { success: false, error: error.message || "Failed to move candidate stage" },
      { status: 500 }
    );
  }
}
