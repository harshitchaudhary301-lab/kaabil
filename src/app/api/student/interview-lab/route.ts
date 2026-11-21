import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { MockInterviewService } from "@/lib/student/mock-interview-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const studentId = sessionUser?.id || "aryan-sharma-pcm";

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || undefined;
    const targetCareer = searchParams.get("targetCareer") || undefined;
    const category = searchParams.get("category") || undefined;

    const questions = MockInterviewService.getQuestions({ stream, targetCareer, category });
    const pastSessions = MockInterviewService.getStudentSessions(studentId);

    return NextResponse.json({
      success: true,
      questions,
      pastSessions,
      totalQuestions: questions.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load interview lab data." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const studentId = sessionUser?.id || "aryan-sharma-pcm";

    const body = await req.json();
    const { questionId, studentAnswer } = body;

    if (!questionId || !studentAnswer) {
      return NextResponse.json(
        { success: false, error: "questionId and studentAnswer are required." },
        { status: 400 }
      );
    }

    const session = MockInterviewService.evaluateAndSaveResponse({
      studentId,
      questionId,
      studentAnswer,
    });

    return NextResponse.json({
      success: true,
      message: "Response evaluated successfully.",
      session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to evaluate interview response." },
      { status: 500 }
    );
  }
}
