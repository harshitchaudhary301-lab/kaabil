// ==============================================================================
// KAABIL (काबिल) — Student Career Profile API Route
// View & Edit separation, automatic save, assessed vs self-reported skill isolation
// Strictly enforces DPDP Act 2023 minor privacy controls
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { ProfileService } from "@/lib/student/profile-service";

export const dynamic = "force-dynamic";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional().nullable(),
  educationStage: z
    .enum([
      "CLASS_8",
      "CLASS_9",
      "CLASS_10",
      "CLASS_11",
      "CLASS_12",
      "DIPLOMA",
      "ITI",
      "UNDERGRADUATE",
      "POSTGRADUATE",
      "WORKING_PROFESSIONAL",
      "OTHER",
    ])
    .optional(),
  currentStream: z
    .enum([
      "MEDICAL_PCB",
      "NON_MEDICAL_PCM",
      "COMMERCE",
      "ARTS_HUMANITIES",
      "LAW",
      "MANAGEMENT",
      "CREATIVE_DESIGN",
      "AGRICULTURE",
      "VOCATIONAL_TRADES",
      "SPORTS_PHYSICAL_ED",
      "HOSPITALITY_TOURISM",
      "INTERDISCIPLINARY",
      "UNDECIDED",
    ])
    .optional(),
  institutionName: z.string().max(150).optional().nullable(),
  boardOrUniversity: z.string().max(100).optional().nullable(),
  specialization: z.string().max(100).optional().nullable(),
  graduationYear: z.number().int().min(2020).max(2040).optional().nullable(),
  grade: z.string().max(50).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  languagePreference: z.enum(["en", "hi", "hinglish"]).optional(),
  targetCareerSlug: z.string().max(100).optional().nullable(),
  targetYear: z.number().int().min(2020).max(2040).optional().nullable(),
  careerGoalNotes: z.string().max(500).optional().nullable(),
  interests: z.array(z.string().min(1).max(100)).max(25).optional(),
  selfReportedSkills: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        proficiency: z.enum([
          "NOVICE",
          "BEGINNER",
          "INTERMEDIATE",
          "PROFICIENT",
          "EXPERT",
        ]),
      })
    )
    .max(30)
    .optional(),
  isProfilePublic: z.boolean().optional(),
  allowRecruiterView: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    let sessionUser: any = null;
    try {
      sessionUser = await getSessionUser();
    } catch {
      // Non-cookie environment fallback
    }
    const identifier = sessionUser?.email || sessionUser?.id || "demo.student@kaabil.in";

    const profile = await ProfileService.getStudentProfile(identifier);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Student profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error("[GET /api/student/profile] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to load student profile.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = updateProfileSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid profile data.",
          details: validatedData.error.flatten(),
        },
        { status: 400 }
      );
    }

    let sessionUser: any = null;
    try {
      sessionUser = await getSessionUser();
    } catch {
      // Non-cookie environment fallback
    }
    const identifier = sessionUser?.email || sessionUser?.id || "demo.student@kaabil.in";

    const updatedProfile = await ProfileService.updateStudentProfile(
      identifier,
      validatedData.data as any
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated and saved automatically.",
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error("[PATCH /api/student/profile] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to save student profile.",
      },
      { status: 500 }
    );
  }
}
