import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { EmployerOrganizationService } from "@/lib/employer/organization-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const members = EmployerOrganizationService.getMembers(orgId);

    return NextResponse.json({ success: true, members });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load team members" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const body = await req.json();
    const { name, email, role, title, department } = body;

    if (!name || !email || !role || !title) {
      return NextResponse.json(
        { success: false, error: "Name, email, role, and title are required." },
        { status: 400 }
      );
    }

    const member = EmployerOrganizationService.inviteMember({
      organizationId: orgId,
      name,
      email,
      role,
      title,
      department,
    });

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to invite staff member" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: "memberId parameter is required." },
        { status: 400 }
      );
    }

    const success = EmployerOrganizationService.removeMember(orgId, memberId);

    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove staff member" },
      { status: 500 }
    );
  }
}
