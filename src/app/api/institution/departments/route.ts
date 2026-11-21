import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { AcademicService } from "@/lib/institution/academic-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const departments = AcademicService.getDepartments(instId);
    return NextResponse.json({ success: true, departments });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const body = await req.json();
    if (!body.name || !body.code || !body.stream) {
      return NextResponse.json(
        { success: false, error: "Department name, code, and stream are required" },
        { status: 400 }
      );
    }

    const department = AcademicService.createDepartment({
      institutionId: instId,
      name: body.name,
      code: body.code,
      stream: body.stream,
      description: body.description,
      headOfDepartmentName: body.headOfDepartmentName,
      headOfDepartmentEmail: body.headOfDepartmentEmail,
    });

    return NextResponse.json({ success: true, department });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create department" },
      { status: 500 }
    );
  }
}
