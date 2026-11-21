import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { CandidateDiscoveryService } from "@/lib/employer/candidate-discovery-service";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const studentProfile: any = user?.studentProfile || {
      id: "sp-aryan-01",
      educationStage: "UNDERGRADUATE",
      isMinor: user?.isMinor ?? false,
    };

    const isMinor = Boolean(
      user?.isMinor ||
      studentProfile.isMinor ||
      ["CLASS_8", "CLASS_9", "CLASS_10"].includes(studentProfile.educationStage)
    );

    const existingProfile = devStore.getCandidateDiscoveryProfile(studentProfile.id);

    return NextResponse.json({
      success: true,
      optedIn: existingProfile ? existingProfile.discoveryOptIn : false,
      profile: existingProfile,
      isMinor,
      canOptIn: !isMinor,
      statutoryNotice: isMinor
        ? "DPDP Act (2023) Notice: Under-18 students are protected from employer recruitment discovery."
        : "You have full control over recruitment visibility. You may withdraw consent at any time.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load discovery preference." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const studentProfile: any = user?.studentProfile || {
      id: "sp-aryan-01",
      educationStage: "UNDERGRADUATE",
      isMinor: user?.isMinor ?? false,
    };

    const isMinor = Boolean(
      user?.isMinor ||
      studentProfile.isMinor ||
      ["CLASS_8", "CLASS_9", "CLASS_10"].includes(studentProfile.educationStage)
    );

    const body = await req.json();
    const { optIn } = body;

    if (optIn === undefined) {
      return NextResponse.json(
        { success: false, error: "optIn boolean flag is required." },
        { status: 400 }
      );
    }

    const updated = CandidateDiscoveryService.updateDiscoveryPreference({
      studentProfileId: studentProfile.id,
      isMinor,
      educationStage: studentProfile.educationStage || "UNDERGRADUATE",
      optIn: Boolean(optIn),
    });

    return NextResponse.json({
      success: true,
      profile: updated,
      message: optIn
        ? "Recruitment discovery enabled. Verified employers may now view your verified skills."
        : "Recruitment discovery disabled. Your profile has been immediately removed from employer talent search.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update discovery preference." },
      { status: 400 }
    );
  }
}
