import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { IndustryChallengeService } from "@/lib/employer/industry-challenge-service";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const studentProfile: any = user?.studentProfile || {
      id: "sp-aryan-01",
      name: user?.name || "Aryan Sharma",
      email: user?.email || "aryan.sharma@example.com",
      educationStage: "UNDERGRADUATE",
      currentStream: "MEDICAL_PCB",
      isMinor: user?.isMinor ?? false,
    };

    const isMinor = Boolean(
      user?.isMinor ||
      studentProfile.isMinor ||
      ["CLASS_8", "CLASS_9", "CLASS_10"].includes(studentProfile.educationStage)
    );

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;

    // Get published challenges
    const challenges = IndustryChallengeService.getChallenges({
      stream,
      difficulty,
      status: "PUBLISHED",
    });

    // Check existing submissions for this student
    const studentSubmissions = devStore.getChallengeSubmissions();
    const mySubmissions = studentSubmissions.filter((s: any) => s.studentProfileId === studentProfile.id);
    const submittedChallengeIds = new Set(mySubmissions.map((s: any) => s.challengeId));

    const enrichedChallenges = challenges.map((chal) => ({
      ...chal,
      hasSubmitted: submittedChallengeIds.has(chal.id),
      mySubmission: mySubmissions.find((s: any) => s.challengeId === chal.id) || null,
    }));

    return NextResponse.json({
      success: true,
      challenges: enrichedChallenges,
      isMinor,
      minorNotice: isMinor
        ? "DPDP Act (2023) Notice: Corporate industry challenges and credential recruitment are legally restricted to adult learners."
        : null,
      totalCount: enrichedChallenges.length,
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
    const studentProfile: any = user?.studentProfile || {
      id: "sp-aryan-01",
      name: user?.name || "Aryan Sharma",
      email: user?.email || "aryan.sharma@example.com",
      educationStage: "UNDERGRADUATE",
      currentStream: "MEDICAL_PCB",
      isMinor: user?.isMinor ?? false,
    };

    const body = await req.json();
    const { action, challengeId } = body;

    if (!challengeId) {
      return NextResponse.json(
        { success: false, error: "challengeId is required." },
        { status: 400 }
      );
    }

    if (action === "REGISTER") {
      IndustryChallengeService.registerParticipant(challengeId, studentProfile);
      return NextResponse.json({
        success: true,
        message: "Successfully registered for industry challenge.",
      });
    }

    if (action === "SUBMIT") {
      if (!body.submissionUrl || !body.summary) {
        return NextResponse.json(
          { success: false, error: "submissionUrl and summary are required." },
          { status: 400 }
        );
      }

      const submission = IndustryChallengeService.submitChallengeDeliverable({
        challengeId,
        studentProfile,
        submissionUrl: body.submissionUrl,
        summary: body.summary,
      });

      return NextResponse.json({
        success: true,
        submission,
        message: "Challenge deliverable submitted successfully for employer review.",
      });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process challenge action." },
      { status: 400 }
    );
  }
}
