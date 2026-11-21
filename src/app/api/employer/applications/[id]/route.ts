import { NextRequest, NextResponse } from "next/server";
import { ApplicationService } from "@/lib/employer/application-service";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const app = ApplicationService.getApplicationById(params.id);
    if (!app) {
      return NextResponse.json(
        { success: false, error: "Application not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, application: app });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load application details" },
      { status: 500 }
    );
  }
}
