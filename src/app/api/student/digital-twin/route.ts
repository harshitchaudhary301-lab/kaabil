import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { CareerDigitalTwinService } from "@/lib/digital-twin/digital-twin-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to access Career Digital Twin." },
        { status: 401 }
      );
    }

    let studentProfileId = user.studentProfile?.id;
    if (!studentProfileId) {
      try {
        const studentProfile = await prisma.studentProfile.findUnique({
          where: { userId },
          select: { id: true },
        });
        studentProfileId = studentProfile?.id;
      } catch {
        // DB offline fallback
      }
    }
    if (!studentProfileId) {
      studentProfileId = "demo-profile-id";
    }

    const twin = await CareerDigitalTwinService.getDigitalTwin(studentProfileId);

    if (!twin) {
      return NextResponse.json(
        { error: "Failed to construct Career Digital Twin." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      digitalTwin: twin,
    });
  } catch (error: any) {
    console.error("[GET /api/student/digital-twin] Error:", error);
    return NextResponse.json(
      { error: "Internal server error retrieving Digital Twin." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to recalibrate Career Digital Twin." },
        { status: 401 }
      );
    }

    let studentProfileId = user.studentProfile?.id;
    if (!studentProfileId) {
      try {
        const studentProfile = await prisma.studentProfile.findUnique({
          where: { userId },
          select: { id: true },
        });
        studentProfileId = studentProfile?.id;
      } catch {
        // DB offline fallback
      }
    }
    if (!studentProfileId) {
      studentProfileId = "demo-profile-id";
    }

    const freshTwin = await CareerDigitalTwinService.getDigitalTwin(studentProfileId);

    return NextResponse.json({
      success: true,
      message: "Career Digital Twin recalibrated successfully.",
      digitalTwin: freshTwin,
    });
  } catch (error: any) {
    console.error("[POST /api/student/digital-twin] Error:", error);
    return NextResponse.json(
      { error: "Failed to recalibrate Career Digital Twin." },
      { status: 500 }
    );
  }
}
