import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { EmployerOrganizationService } from "@/lib/employer/organization-service";
import { EmployerAnalyticsService } from "@/lib/employer/analytics-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const organization = EmployerOrganizationService.getOrganization(orgId);
    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found." },
        { status: 404 }
      );
    }

    const analytics = EmployerAnalyticsService.getAnalytics(orgId);

    return NextResponse.json({
      success: true,
      organization,
      analytics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const body = await req.json();
    const updated = EmployerOrganizationService.updateOrganization(orgId, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update organization" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, organization: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
