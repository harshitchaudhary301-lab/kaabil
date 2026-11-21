import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const isMinor = Boolean(sessionUser?.isMinor);

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    if (!query) {
      return NextResponse.json({
        success: true,
        results: {
          careers: [],
          resources: [],
          opportunities: [],
          cmsItems: [],
        },
      });
    }

    // Search Academy Resources
    const resources = devStore
      .getAcademyResources()
      .filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          (r.description || "").toLowerCase().includes(query) ||
          (r.skillTags || []).some((t: string) => t.toLowerCase().includes(query))
      )
      .slice(0, 5);

    // Search Job Opportunities (Strict DPDP: Filter out for minors if commercial)
    let opportunities: any[] = [];
    if (!isMinor) {
      opportunities = devStore
        .getJobOpportunities()
        .filter(
          (o) =>
            o.status === "PUBLISHED" &&
            (o.title.toLowerCase().includes(query) ||
              o.organizationName.toLowerCase().includes(query) ||
              (o.requiredSkills || []).some((s: string) => s.toLowerCase().includes(query)))
        )
        .slice(0, 5);
    } else {
      // For minors: Only show educational internships or hackathons
      opportunities = devStore
        .getJobOpportunities()
        .filter(
          (o) =>
            o.status === "PUBLISHED" &&
            o.type === "INTERNSHIP" &&
            (o.title.toLowerCase().includes(query) ||
              (o.requiredSkills || []).some((s: string) => s.toLowerCase().includes(query)))
        )
        .slice(0, 5);
    }

    // Search CMS items
    const cmsItems = devStore
      .getCMSContentItems()
      .filter(
        (c) =>
          c.status === "PUBLISHED" &&
          (c.title.toLowerCase().includes(query) ||
            c.summary.toLowerCase().includes(query) ||
            (c.tags || []).some((t: string) => t.toLowerCase().includes(query)))
      )
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      query,
      results: {
        resources,
        opportunities,
        cmsItems,
      },
      totalMatches: resources.length + opportunities.length + cmsItems.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute global search." },
      { status: 500 }
    );
  }
}
