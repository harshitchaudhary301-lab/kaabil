import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { IndustryChallengeService } from "@/lib/employer/industry-challenge-service";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const status = searchParams.get("status") || undefined;

    const challenges = IndustryChallengeService.getChallenges({
      organizationId: orgId,
      stream,
      difficulty,
      status,
    });

    return NextResponse.json({
      success: true,
      challenges,
      totalCount: challenges.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load challenges." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const body = await req.json();
    if (!body.title || !body.category || !body.stream || !body.difficulty || !body.description || !body.problemStatement) {
      return NextResponse.json(
        {
          success: false,
          error: "title, category, stream, difficulty, description, and problemStatement are required.",
        },
        { status: 400 }
      );
    }

    const challenge = IndustryChallengeService.createChallenge({
      organizationId: orgId,
      title: body.title,
      category: body.category,
      stream: body.stream,
      difficulty: body.difficulty,
      description: body.description,
      problemStatement: body.problemStatement,
      deliverables: body.deliverables || ["Project Documentation / Code Repository"],
      requiredSkills: body.requiredSkills || [],
      rubricCriteria: body.rubricCriteria || [
        { criterion: "Technical / Practical Execution", weight: 50 },
        { criterion: "Methodology & Compliance Reasoning", weight: 50 },
      ],
      submissionDeadline: body.submissionDeadline || new Date(Date.now() + 30 * 86400000).toISOString(),
      rewardCredentialTitle: body.rewardCredentialTitle || `Certified ${body.title} Practitioner`,
    });

    return NextResponse.json({
      success: true,
      challenge,
      message: "Industry challenge published successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create challenge." },
      { status: 400 }
    );
  }
}
