import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { InterventionService } from "@/lib/institution/intervention-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const severity = searchParams.get("severity") || undefined;
    const stream = searchParams.get("stream") || undefined;
    const search = searchParams.get("search") || undefined;

    const interventions = InterventionService.getInterventions(instId, {
      status,
      severity,
      stream,
      search,
    });

    return NextResponse.json({ success: true, interventions });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load student interventions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    // Trigger proactive scan
    const interventions = await InterventionService.scanCohortForInterventions(instId);

    return NextResponse.json({ success: true, count: interventions.length, interventions });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute cohort scan" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    if (!body.interventionId || !body.status) {
      return NextResponse.json(
        { success: false, error: "Intervention ID and status are required." },
        { status: 400 }
      );
    }

    const updated = InterventionService.updateInterventionStatus({
      institutionId: instId,
      interventionId: body.interventionId,
      status: body.status,
      resolutionNotes: body.resolutionNotes,
      assignedToFacultyId: body.assignedToFacultyId,
      assignedToFacultyName: body.assignedToFacultyName,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Intervention record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, intervention: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update intervention" },
      { status: 500 }
    );
  }
}
