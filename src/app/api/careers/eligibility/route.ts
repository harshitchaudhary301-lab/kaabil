// ==============================================================================
// KAABIL (काबिल) — Career Educational Eligibility API Endpoint
// Evaluates documented regulatory requirements and prerequisites
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CareerEligibilityChecker } from "@/lib/eligibility/eligibility-checker";
import { getCareerBySlug, CAREER_PATHS_DATABASE } from "@/data/careersData";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const eligibilitySchema = z.object({
  careerSlug: z.string().min(1),
  educationStage: z.string().optional(),
  stream: z.string().optional(),
  age: z.number().int().min(12).max(75).optional(),
  subjects: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = eligibilitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid eligibility parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { careerSlug } = parsed.data;
    const career = getCareerBySlug(careerSlug);

    if (!career) {
      return NextResponse.json(
        { error: "Career not found in registry." },
        { status: 404 }
      );
    }

    // Attempt to merge authenticated student profile if available
    let studentStage = parsed.data.educationStage;
    let studentStream = parsed.data.stream;
    const studentAge = parsed.data.age;
    const studentSubjects = parsed.data.subjects || [];

    if (!studentStage || !studentStream) {
      const user = await getSessionUser();
      if (user && user.studentProfile) {
        studentStage = studentStage || user.studentProfile.educationStage;
        studentStream = studentStream || user.studentProfile.currentStream;
      }
    }

    // Default fallbacks if guest evaluation
    studentStage = studentStage || "CLASS_12";
    studentStream = studentStream || "NON_MEDICAL_PCM";

    const result = CareerEligibilityChecker.evaluate(
      {
        educationStage: studentStage,
        stream: studentStream,
        subjects: studentSubjects,
        age: studentAge,
      },
      {
        slug: career.slug,
        title: career.title,
        minEducationStage: career.minEducationStage,
        regulatoryBody: career.regulatoryBody,
        stream: career.stream,
        typicalDurationYears: career.typicalDurationYears,
        keyEntranceExams: career.keyEntranceExams,
      }
    );

    return NextResponse.json({
      success: true,
      career: {
        slug: career.slug,
        title: career.title,
        stream: career.stream,
        minEducationStage: career.minEducationStage,
        regulatoryBody: career.regulatoryBody,
      },
      evaluation: result,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Failed to evaluate career eligibility", details: err.message },
      { status: 500 }
    );
  }
}
