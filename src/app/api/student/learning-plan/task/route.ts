// ==============================================================================
// KAABIL (काबिल) — Learning Task Toggle API Route
// POST: Toggle daily micro-task completion state
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { LearningPlanService } from "@/lib/learning/learning-plan-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const taskToggleSchema = z.object({
  taskId: z.string().min(1).max(100),
  completed: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    let sessionUser: any = null;
    try {
      sessionUser = await getSessionUser();
    } catch {
      // Non-cookie environment fallback
    }

    const identifier = sessionUser?.email || sessionUser?.id || "demo.student@kaabil.in";
    const body = await req.json();
    const validated = taskToggleSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid task toggle parameters.",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await LearningPlanService.toggleTaskCompletion(
      identifier,
      validated.data.taskId,
      validated.data.completed
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("[POST /api/student/learning-plan/task] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to toggle task completion state.",
      },
      { status: 500 }
    );
  }
}
