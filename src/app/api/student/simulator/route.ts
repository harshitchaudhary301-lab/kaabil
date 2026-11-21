import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { WhatIfSimulator } from "@/lib/readiness/what-if-simulator";
import { WhatIfSimulationInput } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const studentId = sessionUser?.id || "aryan-sharma-pcm";

    const body = await req.json();
    const input: WhatIfSimulationInput = {
      studentId,
      targetCareer: body.targetCareer,
      hypotheticalSkills: body.hypotheticalSkills || [],
      hypotheticalAssessments: body.hypotheticalAssessments || [],
      simulatedRoadmapCompletion: Boolean(body.simulatedRoadmapCompletion),
    };

    const result = WhatIfSimulator.simulate(input);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run what-if simulation." },
      { status: 500 }
    );
  }
}
