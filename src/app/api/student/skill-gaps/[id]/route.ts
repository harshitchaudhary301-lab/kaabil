import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { SkillGapEngine } from "@/lib/skill-gap/skill-gap-engine";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    const profileId = user?.studentProfile?.id || "demo-profile-id";

    const analysis = await SkillGapEngine.getAnalysisById(params.id);

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: "Skill gap analysis record not found" },
        { status: 404 }
      );
    }

    // Ownership check (allow demo-profile-id access in offline development)
    if (analysis.studentProfileId !== profileId && profileId !== "demo-profile-id") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to this analysis record" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve analysis" },
      { status: 500 }
    );
  }
}
