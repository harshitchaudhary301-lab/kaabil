// ==============================================================================
// KAABIL (काबिल) — Career Comparison API Endpoint
// Compares up to 4 careers simultaneously across structured attributes
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CareerRepository } from "@/repositories/career.repository";
import { getCareerBySlug, CAREER_PATHS_DATABASE } from "@/data/careersData";

export const dynamic = "force-dynamic";

const compareSchema = z.object({
  slugs: z.array(z.string()).min(1).max(4, "Cannot compare more than 4 careers simultaneously"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = compareSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid career comparison parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { slugs } = parsed.data;
    const careers = [];

    for (const slug of slugs) {
      const res = await CareerRepository.getCareerBySlug(slug);
      if (res && res.data) {
        careers.push(res.data);
      } else {
        const local = getCareerBySlug(slug);
        if (local) careers.push(local);
      }
    }

    if (careers.length === 0) {
      return NextResponse.json(
        { error: "No matching career records found for comparison." },
        { status: 404 }
      );
    }

    // Build structured comparison matrix
    const comparisonMatrix = {
      careers: careers.map((c: any) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        streamTitle: c.streamTitle || c.stream,
        stream: c.stream,
        domainName: c.domainName || c.subDomain?.name || "General Domain",
        tagline: c.tagline,
        overview: c.overview,
        minEducationStage: (c.minEducationStage || "UNDERGRADUATE").replace(/_/g, " "),
        typicalDurationYears: c.typicalDurationYears || c.typicalDuration || "3-4 Years",
        regulatoryBody: c.regulatoryBody || "Non-Statutory / Industry Standard",
        isRegulated: !!c.regulatoryBody,
        keyEntranceExams: c.keyEntranceExams || (c.entranceExams ? c.entranceExams.map((e: any) => e.exam?.name || e) : []),
        topCollegesInIndia: c.topCollegesInIndia || ["Recognized Indian Universities & Autonomous Institutions"],
        avgStartingSalaryInr: c.avgStartingSalaryInr,
        avgMidCareerSalaryInr: c.avgMidCareerSalaryInr,
        salarySource: c.salarySource || "National Industry Benchmark / Ministry of Labour 2024",
        growthOutlook: c.growthOutlook || "High",
        automationRisk: c.automationRisk || "Low",
        workEnvironment: c.workEnvironment || "Corporate, hospital, laboratory, studio or field environments depending on specialization.",
        licensingRequirement: c.licensingRequirement || (c.isRegulated ? "Regulatory license required" : "No statutory license required"),
        verificationStatus: c.verificationStatus || "VERIFIED",
        skills: (c.skills || []).map((s: any) => ({
          name: s.name,
          category: s.category || "Domain",
          requiredLevel: s.requiredLevel || 3,
          isMandatory: s.isMandatory !== false,
        })),
        sources: c.sources || [],
      })),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      comparison: comparisonMatrix,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Failed to compile career comparison", details: err.message },
      { status: 500 }
    );
  }
}
