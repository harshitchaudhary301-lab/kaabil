import { NextRequest, NextResponse } from "next/server";
import { AssessmentEngine } from "@/lib/assessment/assessment-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assessment = await AssessmentEngine.getAssessmentForTaking(params.id);
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, assessment });
  } catch (error: any) {
    console.error("[GET /api/student/assessments/[id]] Error:", error);
    return NextResponse.json({ error: "Failed to retrieve assessment" }, { status: 500 });
  }
}
