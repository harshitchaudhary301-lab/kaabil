import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { TrainingService } from "@/lib/institution/training-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const instId = user?.organizations?.[0]?.id || "inst-demo-tech";

    const recommendations = await TrainingService.getAdaptiveRecommendations(instId);

    return NextResponse.json({ success: true, recommendations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate training recommendations" },
      { status: 500 }
    );
  }
}
