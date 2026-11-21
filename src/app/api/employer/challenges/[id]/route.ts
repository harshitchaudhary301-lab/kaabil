import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { IndustryChallengeService } from "@/lib/employer/industry-challenge-service";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const challenge = IndustryChallengeService.getChallengeById(params.id);
    if (!challenge || challenge.organizationId !== orgId) {
      return NextResponse.json(
        { success: false, error: "Challenge not found for this organization." },
        { status: 404 }
      );
    }

    const submissions = devStore.getChallengeSubmissions(params.id);

    return NextResponse.json({
      success: true,
      challenge,
      submissions,
      totalSubmissions: submissions.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load challenge details." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const body = await req.json();
    const { submissionId, score, feedback, decision } = body;

    if (!submissionId || score === undefined || !decision) {
      return NextResponse.json(
        { success: false, error: "submissionId, score, and decision are required." },
        { status: 400 }
      );
    }

    const evaluated = IndustryChallengeService.evaluateSubmission({
      submissionId,
      organizationId: orgId,
      reviewerName: user?.name || "Dr. Rohit Verma",
      score: parseInt(score),
      feedback: feedback || "Submission reviewed against rubric criteria.",
      decision,
    });

    return NextResponse.json({
      success: true,
      submission: evaluated,
      message:
        decision === "APPROVED"
          ? "Submission approved and verified credentials minted to candidate's Digital Skill Passport."
          : `Submission marked as ${decision}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to evaluate challenge submission." },
      { status: 400 }
    );
  }
}
