import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { AcademicService } from "@/lib/institution/academic-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const sessions = AcademicService.getAcademicSessions(instId);
    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch academic sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    if (!body.name || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { success: false, error: "Session name, start date, and end date are required" },
        { status: 400 }
      );
    }

    const session = AcademicService.createAcademicSession({
      institutionId: instId,
      name: body.name,
      isCurrent: body.isCurrent ?? false,
      startDate: body.startDate,
      endDate: body.endDate,
    });

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create academic session" },
      { status: 500 }
    );
  }
}
