import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { SkillGapEngine } from "@/lib/skill-gap/skill-gap-engine";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const profileId = user?.studentProfile?.id || "demo-profile-id";

    // Check query params for specific career analysis request
    const { searchParams } = new URL(req.url);
    const careerSlug = searchParams.get("careerSlug");

    if (careerSlug) {
      const analysis = await SkillGapEngine.analyzeGaps(profileId, careerSlug);
      return NextResponse.json({ success: true, analysis });
    }

    const pastAnalyses = await SkillGapEngine.getStudentAnalyses(profileId);

    // If no analyses exist yet, run one for default career
    if (pastAnalyses.length === 0) {
      const defaultCareer =
        user?.studentProfile?.currentStream === "MEDICAL_PCB"
          ? "mbbs-doctor"
          : "ai-systems-engineer";
      try {
        const fresh = await SkillGapEngine.analyzeGaps(profileId, defaultCareer);
        return NextResponse.json({ success: true, analyses: [fresh] });
      } catch {
        return NextResponse.json({ success: true, analyses: [] });
      }
    }

    return NextResponse.json({ success: true, analyses: pastAnalyses });
  } catch (error: any) {
    console.error("[Skill Gap API GET error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch skill gap analysis" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const profileId = user?.studentProfile?.id || "demo-profile-id";

    const body = await req.json();
    const { targetCareerSlug } = body;

    if (!targetCareerSlug) {
      return NextResponse.json(
        { success: false, error: "targetCareerSlug is required" },
        { status: 400 }
      );
    }

    const analysis = await SkillGapEngine.analyzeGaps(profileId, targetCareerSlug);

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error("[Skill Gap API POST error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run skill gap analysis" },
      { status: 500 }
    );
  }
}
