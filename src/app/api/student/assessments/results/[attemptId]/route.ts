import { NextRequest, NextResponse } from "next/server";
import { AssessmentEngine } from "@/lib/assessment/assessment-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { attemptId: string } }) {
  try {
    const result = await AssessmentEngine.getAttemptResult(params.attemptId);
    if (!result) {
      return NextResponse.json({ error: "Assessment result not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("[GET /api/student/assessments/results/[attemptId]] Error:", error);
    return NextResponse.json({ error: "Failed to retrieve assessment result" }, { status: 500 });
  }
}
