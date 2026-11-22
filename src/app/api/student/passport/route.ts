// ==============================================================================
// KAABIL (काबिल) — Digital Skill Passport API Route
// GET: Generate and retrieve complete evidence-backed Skill Passport
// DELETE: Remove or correct an inaccurate self-reported skill claim
// POST: Update passport sharing & privacy settings
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { PassportService } from "@/lib/passport/passport-service";
import { devStore } from "@/lib/dev-store";
import { isMinorStage } from "@/lib/auth/rbac";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let sessionUser: any = null;
    try {
      sessionUser = await getSessionUser();
    } catch {
      // Non-cookie environment fallback
    }

    const profileId =
      sessionUser?.studentProfile?.id || sessionUser?.email || "demo-profile-id";

    const passport = await PassportService.generatePassport(profileId);

    return NextResponse.json({ success: true, passport });
  } catch (error: any) {
    console.error("[Passport API GET error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate Digital Skill Passport",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    let sessionUser: any = null;
    try {
      sessionUser = await getSessionUser();
    } catch {
      // Non-cookie environment fallback
    }

    const profileId =
      sessionUser?.studentProfile?.id || sessionUser?.email || "demo-profile-id";

    const { searchParams } = new URL(req.url);
    let skillName = searchParams.get("skillName");

    if (!skillName) {
      try {
        const body = await req.json();
        skillName = body.skillName;
      } catch {
        // No body
      }
    }

    if (!skillName) {
      return NextResponse.json(
        { success: false, error: "A valid skillName is required to remove a self-reported claim." },
        { status: 400 }
      );
    }

    const result = await PassportService.removeSelfReportedSkill(profileId, skillName);

    return NextResponse.json({
      success: true,
      message: `Self-reported skill '${skillName}' removed successfully.`,
      result,
    });
  } catch (error: any) {
    console.error("[Passport API DELETE error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to remove self-reported skill claim.",
      },
      { status: 500 }
    );
  }
}

const updatePrivacySchema = z.object({
  isPublic: z.boolean().optional(),
  allowRecruiterView: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    let sessionUser: any = null;
    try {
      sessionUser = await getSessionUser();
    } catch {
      // Non-cookie environment fallback
    }

    const profileId =
      sessionUser?.studentProfile?.id || sessionUser?.email || "demo-profile-id";

    const body = await req.json();
    const validated = updatePrivacySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Invalid privacy settings parameters." },
        { status: 400 }
      );
    }

    const profile = devStore.getProfile(profileId);
    const isMinor =
      sessionUser?.isMinor ??
      (profile?.educationStage ? isMinorStage(profile.educationStage) : false);

    // Minors strictly cannot enable recruiter view or public link
    const updated = devStore.savePassportPreferences(profileId, {
      isPublic: isMinor ? false : (validated.data.isPublic ?? false),
      allowRecruiterView: isMinor ? false : (validated.data.allowRecruiterView ?? false),
      isMinor,
    });

    return NextResponse.json({
      success: true,
      message: "Passport privacy preferences updated.",
      privacy: updated,
    });
  } catch (error: any) {
    console.error("[Passport API POST error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update passport privacy.",
      },
      { status: 500 }
    );
  }
}
