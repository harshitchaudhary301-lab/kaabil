import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { FacultyService } from "@/lib/institution/faculty-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const faculty = FacultyService.getFacultyMembers(instId);
    return NextResponse.json({ success: true, faculty });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch faculty list" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    if (!body.name || !body.email || !body.designation || !body.role) {
      return NextResponse.json(
        { success: false, error: "Name, email, designation, and role are required" },
        { status: 400 }
      );
    }

    const member = FacultyService.inviteStaffMember({
      institutionId: instId,
      name: body.name,
      email: body.email,
      designation: body.designation,
      role: body.role,
      departmentId: body.departmentId,
      specialization: body.specialization,
      isLead: body.isLead,
    });

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to invite faculty member" },
      { status: 500 }
    );
  }
}
