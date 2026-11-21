import { NextRequest, NextResponse } from "next/server";
import { OpportunityService } from "@/lib/employer/opportunity-service";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opp = OpportunityService.getOpportunityById(params.id);
    if (!opp) {
      return NextResponse.json(
        { success: false, error: "Opportunity not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, opportunity: opp });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load opportunity" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = OpportunityService.updateOpportunity(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Opportunity not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, opportunity: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update opportunity" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const archived = OpportunityService.setOpportunityStatus(params.id, "ARCHIVED");
    if (!archived) {
      return NextResponse.json(
        { success: false, error: "Opportunity not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, opportunity: archived });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to archive opportunity" },
      { status: 500 }
    );
  }
}
