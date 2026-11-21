import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { TrainingService } from "@/lib/institution/training-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || undefined;

    const programs = TrainingService.getTrainingPrograms(instId, stream);

    return NextResponse.json({ success: true, programs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load training programs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    if (!body.title || !body.stream || !body.instructorName) {
      return NextResponse.json(
        { success: false, error: "Title, stream, and instructor name are required." },
        { status: 400 }
      );
    }

    const program = TrainingService.createTrainingProgram({
      institutionId: instId,
      title: body.title,
      description: body.description || "",
      stream: body.stream,
      departmentId: body.departmentId,
      departmentName: body.departmentName,
      mode: body.mode || "HYBRID",
      targetedSkills: body.targetedSkills || [],
      instructorName: body.instructorName,
      startDate: body.startDate || new Date().toISOString().split("T")[0],
      endDate: body.endDate || new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
      scheduleInfo: body.scheduleInfo || "Tuesdays & Thursdays, 4:00 PM - 5:30 PM",
      maxCapacity: Number(body.maxCapacity) || 50,
    });

    return NextResponse.json({ success: true, program });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create training program" },
      { status: 500 }
    );
  }
}
