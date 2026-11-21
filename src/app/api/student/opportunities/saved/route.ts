import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    const profileId = user?.studentProfile?.id || "sp-demo-student";

    const savedIds = devStore.getSavedOpportunities(profileId);
    const opportunities = savedIds
      .map((id) => devStore.getJobOpportunity(id))
      .filter(Boolean);

    return NextResponse.json({ success: true, savedOpportunities: opportunities });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load saved opportunities" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const profileId = user?.studentProfile?.id || "sp-demo-student";

    const body = await req.json();
    const { opportunityId, action } = body;

    if (!opportunityId) {
      return NextResponse.json(
        { success: false, error: "opportunityId is required." },
        { status: 400 }
      );
    }

    if (action === "UNSAVE") {
      const list = devStore.removeSavedOpportunity(profileId, opportunityId);
      return NextResponse.json({ success: true, savedIds: list, isSaved: false });
    }

    const list = devStore.saveSavedOpportunity(profileId, opportunityId);
    return NextResponse.json({ success: true, savedIds: list, isSaved: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update saved opportunity" },
      { status: 500 }
    );
  }
}
