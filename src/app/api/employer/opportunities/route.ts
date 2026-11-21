import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { OpportunityService } from "@/lib/employer/opportunity-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || undefined;
    const opportunityType = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const opportunities = OpportunityService.getOpportunities({
      organizationId: orgId,
      stream,
      opportunityType,
      status,
      search,
    });

    return NextResponse.json({ success: true, opportunities });
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
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const body = await req.json();
    if (!body.title || !body.industry || !body.stream || !body.description) {
      return NextResponse.json(
        { success: false, error: "Title, industry, stream, and description are required." },
        { status: 400 }
      );
    }

    const opportunity = OpportunityService.createOpportunity({
      organizationId: orgId,
      title: body.title,
      industry: body.industry,
      stream: body.stream,
      department: body.department,
      opportunityType: body.opportunityType || "FULL_TIME",
      workplaceType: body.workplaceType || "HYBRID",
      city: body.city,
      state: body.state,
      country: body.country,
      description: body.description,
      responsibilities: body.responsibilities,
      requiredSkills: body.requiredSkills || [],
      preferredSkills: body.preferredSkills || [],
      competencyRequirements: body.competencyRequirements || [],
      minStage: body.minStage || "UNDERGRADUATE",
      requiredQualifications: body.requiredQualifications || [],
      requiredLicenses: body.requiredLicenses || [],
      experienceYearsMin: body.experienceYearsMin,
      experienceYearsMax: body.experienceYearsMax,
      compensation: body.compensation,
      deadline: body.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      availablePositions: body.availablePositions || 1,
      status: body.status || "DRAFT",
    });

    return NextResponse.json({ success: true, opportunity });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create opportunity" },
      { status: 400 }
    );
  }
}
