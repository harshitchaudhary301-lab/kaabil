import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { OpportunityService } from "@/lib/employer/opportunity-service";
import { ApplicationService } from "@/lib/employer/application-service";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const studentProfile: any = user?.studentProfile || {
      id: "sp-demo-student",
      educationStage: "UNDERGRADUATE",
      currentStream: "NON_MEDICAL_PCM",
      isMinor: user?.isMinor ?? false,
    };
    const isMinor = Boolean(
      user?.isMinor ||
      studentProfile.isMinor ||
      ["CLASS_8", "CLASS_9", "CLASS_10"].includes(studentProfile.educationStage)
    );

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || undefined;
    const industry = searchParams.get("industry") || undefined;
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;

    // Only PUBLISHED opportunities are discoverable
    const publishedOpps = OpportunityService.getOpportunities({
      status: "PUBLISHED",
      stream,
      industry,
      opportunityType: type,
      search,
    });

    // Check saved opportunities for student
    const profileId = studentProfile.id;
    const savedIds = new Set(devStore.getSavedOpportunities(profileId));

    // Get existing student applications
    const studentApps = devStore.getStudentJobApplications(profileId);
    const appliedOppMap = new Map(studentApps.map((a: any) => [a.opportunityId, a]));

    const enrichedOpportunities = publishedOpps.map((opp) => {
      const eligibility = ApplicationService.evaluateCandidateEligibility(opp, studentProfile);
      const app = appliedOppMap.get(opp.id);

      return {
        ...opp,
        isSaved: savedIds.has(opp.id),
        hasApplied: Boolean(app && app.stage !== "WITHDRAWN"),
        applicationStage: app?.stage,
        applicationId: app?.id,
        eligibility,
      };
    });

    return NextResponse.json({
      success: true,
      opportunities: enrichedOpportunities,
      isMinor,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load opportunities" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const studentProfile = user?.studentProfile || {
      id: "sp-demo-student",
      name: user?.name || "Student Candidate",
      email: user?.email || "student@kaabil.in",
      educationStage: "UNDERGRADUATE",
      currentStream: "NON_MEDICAL_PCM",
      isMinor: user?.isMinor ?? false,
    };

    const body = await req.json();
    const { opportunityId, coverNote, resumeUrl } = body;

    if (!opportunityId) {
      return NextResponse.json(
        { success: false, error: "opportunityId is required." },
        { status: 400 }
      );
    }

    const application = ApplicationService.applyToOpportunity({
      opportunityId,
      studentProfile,
      coverNote,
      resumeUrl,
    });

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit application" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const studentProfileId = user?.studentProfile?.id || "sp-demo-student";

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "applicationId is required." },
        { status: 400 }
      );
    }

    const withdrawn = ApplicationService.withdrawApplication(applicationId, studentProfileId);
    if (!withdrawn) {
      return NextResponse.json(
        { success: false, error: "Application not found or unauthorized." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, application: withdrawn });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to withdraw application" },
      { status: 400 }
    );
  }
}
