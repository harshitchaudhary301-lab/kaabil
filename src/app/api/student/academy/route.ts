import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { AcademyService } from "@/lib/student/academy-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const studentId = sessionUser?.id || "aryan-sharma-pcm";

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const format = searchParams.get("format") || undefined;
    const search = searchParams.get("search") || undefined;

    const resources = AcademyService.getResources({ stream, difficulty, format, search });
    const progressList = AcademyService.getStudentProgress(studentId);

    const progressMap = progressList.reduce((acc, p) => {
      acc[p.resourceId] = p;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      resources,
      progressMap,
      totalCount: resources.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load Academy resources." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const studentId = sessionUser?.id || "aryan-sharma-pcm";

    const body = await req.json();
    const { resourceId, status, progressPct, notes, rating } = body;

    if (!resourceId || !status) {
      return NextResponse.json(
        { success: false, error: "resourceId and status are required." },
        { status: 400 }
      );
    }

    const updated = AcademyService.updateProgress({
      studentId,
      resourceId,
      status,
      progressPct: Number(progressPct) || (status === "COMPLETED" ? 100 : 50),
      notes,
      rating,
    });

    return NextResponse.json({
      success: true,
      message: `Progress updated to ${status}.`,
      progress: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update Academy progress." },
      { status: 500 }
    );
  }
}
