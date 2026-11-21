import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { EmployerAnalyticsService } from "@/lib/employer/analytics-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const analytics = EmployerAnalyticsService.getAnalytics(orgId);

    return NextResponse.json({ success: true, analytics });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load recruitment analytics" },
      { status: 500 }
    );
  }
}
