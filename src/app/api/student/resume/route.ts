import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { ResumeService } from "@/lib/student/resume-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const studentId = sessionUser?.id || "aryan-sharma-pcm";

    const resume = ResumeService.getResumeForStudent(studentId);

    return NextResponse.json({
      success: true,
      resume,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load student resume." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const studentId = sessionUser?.id || "aryan-sharma-pcm";

    const body = await req.json();
    const resumeData = {
      ...body,
      studentId,
    };

    const saved = ResumeService.saveResume(resumeData);

    return NextResponse.json({
      success: true,
      message: "Resume saved successfully.",
      resume: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save student resume." },
      { status: 500 }
    );
  }
}
