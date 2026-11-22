// ==============================================================================
// KAABIL (काबिल) — Multi-Stream Projects Hub API Route
// GET: Fetch available and enrolled real-world projects for the student's career stream
// POST: Enroll, update milestones, or submit project portfolio deliverables
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { LearningPlanService } from "@/lib/learning/learning-plan-service";
import {
  CAREER_PROJECTS_DATABASE,
  getProjectsForCareer,
  getProjectBySlugOrId,
} from "@/data/careerProjectsData";
import { ProfileService } from "@/lib/student/profile-service";
import { devStore } from "@/lib/dev-store";
import { checkApiRateLimit } from "@/lib/auth/rate-limiter";
import { z } from "zod";

export const dynamic = "force-dynamic";

function isValidDeliverableUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const host = parsed.hostname.toLowerCase();
    // Disallow loopback, private RFC1918, and metadata service IP addresses
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "169.254.169.254" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.endsWith(".internal") ||
      host.endsWith(".local")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

const projectActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("ENROLL"),
    projectId: z.string().min(1),
  }),
  z.object({
    action: z.literal("UPDATE_MILESTONE"),
    projectId: z.string().min(1),
    milestoneId: z.string().min(1),
    completed: z.boolean(),
  }),
  z.object({
    action: z.literal("SUBMIT"),
    projectId: z.string().min(1),
    submissionUrl: z
      .string()
      .url("A valid deliverable URL is required")
      .refine(isValidDeliverableUrl, {
        message:
          "Deliverable URL must be a valid public web link (e.g., GitHub repo, Google Drive, Figma, Notion, or portfolio link).",
      }),
    submissionNotes: z.string().max(1000).optional(),
    selfAssessedReflection: z.string().max(1000).optional(),
  }),
]);

export async function GET(req: NextRequest) {
  try {
    let sessionUser: any = null;
    try {
      sessionUser = await getSessionUser();
    } catch {
      // Non-cookie environment fallback
    }

    const isDemoAllowed = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    const identifier = sessionUser?.email || sessionUser?.id || (isDemoAllowed ? "demo.student@kaabil.in" : null);

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view projects." },
        { status: 401 }
      );
    }

    const profile = await ProfileService.getStudentProfile(identifier);
    const profileId = profile?.id || "demo-profile-id";
    const stream = profile?.academic?.stream || "NON_MEDICAL_PCM";
    const careerSlug = profile?.targetCareer?.slug;

    const streamProjects = getProjectsForCareer(stream, careerSlug);
    const enrollments = devStore.getProjectEnrollments(profileId);

    const projectsWithStatus = streamProjects.map((project) => ({
      ...project,
      enrollment: enrollments[project.id] || null,
      isEnrolled: !!enrollments[project.id],
    }));

    return NextResponse.json({
      success: true,
      projects: projectsWithStatus,
      allAvailableProjects: CAREER_PROJECTS_DATABASE,
    });
  } catch (error: any) {
    console.error("[GET /api/student/projects] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to load projects.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let sessionUser: any = null;
    try {
      sessionUser = await getSessionUser();
    } catch {
      // Non-cookie environment fallback
    }

    const isDemoAllowed = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    const identifier = sessionUser?.email || sessionUser?.id || (isDemoAllowed ? "demo.student@kaabil.in" : null);

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Authentication required to submit or update projects." },
        { status: 401 }
      );
    }

    // Rate limiting: max 15 project actions per minute
    const rateStatus = checkApiRateLimit(`project:${identifier}`, 15, 60);
    if (!rateStatus.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Project submission rate limit reached. Please wait ${rateStatus.resetInSeconds} seconds.`,
        },
        { status: 429 }
      );
    }
    const body = await req.json();
    const validated = projectActionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid project action request.",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    if (data.action === "ENROLL") {
      const enrollment = await LearningPlanService.enrollInProject(
        identifier,
        data.projectId
      );
      return NextResponse.json({
        success: true,
        message: "Enrolled in project successfully.",
        enrollment,
      });
    }

    if (data.action === "UPDATE_MILESTONE") {
      const enrollment = await LearningPlanService.updateProjectMilestone(
        identifier,
        data.projectId,
        data.milestoneId,
        data.completed
      );
      return NextResponse.json({
        success: true,
        message: "Project milestone updated.",
        enrollment,
      });
    }

    if (data.action === "SUBMIT") {
      const enrollment = await LearningPlanService.submitProject(
        identifier,
        data.projectId,
        {
          submissionUrl: data.submissionUrl,
          submissionNotes: data.submissionNotes,
          selfAssessedReflection: data.selfAssessedReflection,
        }
      );
      return NextResponse.json({
        success: true,
        message: "Project submitted successfully. Saved to your practical portfolio.",
        enrollment,
      });
    }

    return NextResponse.json({ success: false, error: "Unsupported action." }, { status: 400 });
  } catch (error: any) {
    console.error("[POST /api/student/projects] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process project request.",
      },
      { status: 500 }
    );
  }
}
