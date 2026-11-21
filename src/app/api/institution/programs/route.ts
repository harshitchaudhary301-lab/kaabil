import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { AcademicService } from "@/lib/institution/academic-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const programs = AcademicService.getPrograms(instId);
    return NextResponse.json({ success: true, programs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    if (!body.name || !body.code || !body.stage || !body.stream) {
      return NextResponse.json(
        { success: false, error: "Name, code, stage, and stream are required" },
        { status: 400 }
      );
    }

    const program = AcademicService.createProgram({
      institutionId: instId,
      departmentId: body.departmentId,
      name: body.name,
      code: body.code,
      stage: body.stage,
      stream: body.stream,
      durationYears: Number(body.durationYears) || 4,
      totalSemestersOrYears: Number(body.totalSemestersOrYears) || 8,
      description: body.description,
    });

    return NextResponse.json({ success: true, program });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create program" },
      { status: 500 }
    );
  }
}
