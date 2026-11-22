// ==============================================================================
// KAABIL (काबिल) — Test Suite: Step 3.3 Personalized Learning Plan & Projects Hub
// Validates multi-stream plan generation, daily micro-tasks, authentic free resources,
// multi-stream projects hub, milestone tracking, and non-fabrication of verification.
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { LearningPlanService } from "@/lib/learning/learning-plan-service";
import { devStore } from "@/lib/dev-store";
import { ProfileService } from "@/lib/student/profile-service";
import {
  CURATED_LEARNING_RESOURCES,
  getCuratedResourcesForCareer,
} from "@/data/learningResourcesData";
import {
  CAREER_PROJECTS_DATABASE,
  getProjectsForCareer,
  getProjectBySlugOrId,
} from "@/data/careerProjectsData";
import {
  GET as getLearningPlanRoute,
  POST as postLearningPlanRoute,
} from "@/app/api/student/learning-plan/route";
import { POST as postTaskToggleRoute } from "@/app/api/student/learning-plan/task/route";
import {
  GET as getProjectsRoute,
  POST as postProjectsRoute,
} from "@/app/api/student/projects/route";
import { NextRequest } from "next/server";

describe("Step 3.3 — Personalized Learning Plan & Projects Hub", () => {
  beforeEach(() => {
    devStore.reset();
  });

  // --------------------------------------------------------------------------
  // 1. Multi-Stream Learning Plan Generation
  // --------------------------------------------------------------------------
  describe("1. Multi-Stream Plan Generation", () => {
    it("generates a realistic 4-week learning plan for STEM students based on target career and skill gaps", async () => {
      const plan = await LearningPlanService.getLearningPlan("demo.student@kaabil.in");

      expect(plan).toBeDefined();
      expect(plan.careerTitle).toBeDefined();
      expect(plan.weeklySprints).toHaveLength(4);
      expect(plan.totalTasks).toBe(20); // 4 weeks * 5 daily tasks
      expect(plan.completedTasks).toBe(0);
      expect(plan.overallPlanProgressPercent).toBe(0);
      expect(plan.todaysTask).toBeDefined();
      expect(plan.todaysTask?.dayNumber).toBe(1);
      expect(plan.todaysTask?.isCompleted).toBe(false);
    });

    it("generates personalized plan for Commerce (CA) stream with statutory focus", async () => {
      // Set student target career to Chartered Accountant
      await ProfileService.updateStudentProfile("demo.student@kaabil.in", {
        targetCareerSlug: "chartered-accountant-icai",
        currentStream: "COMMERCE",
      });

      const plan = await LearningPlanService.getLearningPlan("demo.student@kaabil.in");

      expect(plan.careerSlug).toBe("chartered-accountant-icai");
      expect(plan.careerStream).toBe("COMMERCE");
      expect(plan.weeklySprints).toHaveLength(4);

      // Verify authentic commerce resources are recommended
      const providerNames = plan.recommendedResources.map((r) => r.provider);
      expect(providerNames.some((p) => p.includes("ICAI") || p.includes("Swayam"))).toBe(true);

      // Verify suggested projects include commerce / financial models
      const projectTitles = plan.suggestedProjects.map((p) => p.title.toLowerCase());
      expect(
        projectTitles.some((t) => t.includes("cash flow") || t.includes("gst"))
      ).toBe(true);
    });

    it("generates personalized plan for Healthcare (MBBS Doctor) stream", async () => {
      await ProfileService.updateStudentProfile("demo.student@kaabil.in", {
        targetCareerSlug: "mbbs-doctor",
        currentStream: "MEDICAL_PCB",
      });

      const plan = await LearningPlanService.getLearningPlan("demo.student@kaabil.in");

      expect(plan.careerSlug).toBe("mbbs-doctor");
      expect(plan.careerStream).toBe("MEDICAL_PCB");
      expect(plan.weeklySprints).toHaveLength(4);

      // Healthcare projects available
      const projectTitles = plan.suggestedProjects.map((p) => p.title.toLowerCase());
      expect(projectTitles.some((t) => t.includes("health") || t.includes("risk"))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Weekly Time Budget & Task Pacing
  // --------------------------------------------------------------------------
  describe("2. Weekly Time Budget Scaling", () => {
    it("scales daily micro-task minutes according to student time commitment", async () => {
      // Test 5 hours commitment (~30 mins / task)
      await LearningPlanService.updatePreferences("demo.student@kaabil.in", {
        weeklyTimeCommitmentHours: 5,
      });
      let plan = await LearningPlanService.getLearningPlan("demo.student@kaabil.in");
      expect(plan.preferences.weeklyTimeCommitmentHours).toBe(5);
      expect(plan.todaysTask?.estimatedMinutes).toBe(30);

      // Test 20 hours commitment (~90 mins / task)
      await LearningPlanService.updatePreferences("demo.student@kaabil.in", {
        weeklyTimeCommitmentHours: 20,
      });
      plan = await LearningPlanService.getLearningPlan("demo.student@kaabil.in");
      expect(plan.preferences.weeklyTimeCommitmentHours).toBe(20);
      expect(plan.todaysTask?.estimatedMinutes).toBe(90);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Task Completion & 'What Should I Do Today?' Progress
  // --------------------------------------------------------------------------
  describe("3. Daily Micro-Tasks & Streak Tracking", () => {
    it("toggles task completion and advances 'What Should I Do Today?' dynamically", async () => {
      const initialPlan = await LearningPlanService.getLearningPlan("demo.student@kaabil.in");
      const firstTaskId = initialPlan.todaysTask!.id;
      expect(initialPlan.todaysTask?.id).toBe(firstTaskId);

      // Complete Day 1 task
      const toggleRes = await LearningPlanService.toggleTaskCompletion(
        "demo.student@kaabil.in",
        firstTaskId,
        true
      );
      expect(toggleRes.success).toBe(true);
      expect(toggleRes.isCompleted).toBe(true);
      expect(toggleRes.completedAt).toBeDefined();

      // Next plan should show completed task count 1 and today's task advanced to Day 2
      const updatedPlan = await LearningPlanService.getLearningPlan("demo.student@kaabil.in");
      expect(updatedPlan.completedTasks).toBe(1);
      expect(updatedPlan.overallPlanProgressPercent).toBe(5); // 1/20 = 5%
      expect(updatedPlan.todaysTask?.id).toBe("task-w1-d2");
      expect(updatedPlan.currentStreakDays).toBeGreaterThanOrEqual(1);
    });

    it("untoggles task completion gracefully without corrupting progress", async () => {
      await LearningPlanService.toggleTaskCompletion("demo.student@kaabil.in", "task-w1-d1", true);
      await LearningPlanService.toggleTaskCompletion("demo.student@kaabil.in", "task-w1-d1", false);

      const plan = await LearningPlanService.getLearningPlan("demo.student@kaabil.in");
      expect(plan.completedTasks).toBe(0);
      expect(plan.todaysTask?.id).toBe("task-w1-d1");
    });
  });

  // --------------------------------------------------------------------------
  // 4. Authentic Verified Free Resources (Zero Fabrication)
  // --------------------------------------------------------------------------
  describe("4. Authentic Learning Resources", () => {
    it("ensures all curated resources point to authentic public education portals", () => {
      expect(CURATED_LEARNING_RESOURCES.length).toBeGreaterThanOrEqual(10);

      const allowedDomains = [
        "nptel.ac.in",
        "swayam.gov.in",
        "khanacademy.org",
        "ocw.mit.edu",
        "developer.mozilla.org",
        "icai.org",
        "rbi.org.in",
        "epgp.inflibnet.ac.in",
        "medlineplus.gov",
        "ecoursesonline.iasri.res.in",
        "bharatskills.gov.in",
        "help.figma.com",
      ];

      for (const res of CURATED_LEARNING_RESOURCES) {
        expect(res.url).toMatch(/^https?:\/\//);
        const urlMatches = allowedDomains.some((dom) => res.url.includes(dom));
        expect(urlMatches).toBe(true);
        expect(res.isFree).toBe(true);
        expect(res.provider).toBeDefined();
        expect(res.estimatedHours).toBeGreaterThan(0);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. Multi-Stream Projects Hub & Provenance Integrity
  // --------------------------------------------------------------------------
  describe("5. Multi-Stream Projects Hub & Milestones", () => {
    it("provides projects across STEM, Healthcare, Commerce, Law, Design, Agriculture, and Vocational fields", () => {
      const streamsInDb = new Set(CAREER_PROJECTS_DATABASE.map((p) => p.stream));

      expect(streamsInDb.has("NON_MEDICAL_PCM")).toBe(true);
      expect(streamsInDb.has("COMMERCE")).toBe(true);
      expect(streamsInDb.has("MEDICAL_PCB")).toBe(true);
      expect(streamsInDb.has("LAW")).toBe(true);
      expect(streamsInDb.has("CREATIVE_DESIGN")).toBe(true);
      expect(streamsInDb.has("AGRICULTURE")).toBe(true);
      expect(streamsInDb.has("VOCATIONAL_TRADES")).toBe(true);
      expect(streamsInDb.has("ARTS_HUMANITIES")).toBe(true);
    });

    it("each project contains complete 4-step milestones, objectives, and deliverable hints", () => {
      for (const proj of CAREER_PROJECTS_DATABASE) {
        expect(proj.milestones).toHaveLength(4);
        for (const m of proj.milestones) {
          expect(m.stepNumber).toBeGreaterThanOrEqual(1);
          expect(m.title).toBeDefined();
          expect(m.description).toBeDefined();
          expect(m.deliverableHint).toBeDefined();
        }
        expect(proj.submissionTypes.length).toBeGreaterThanOrEqual(1);
        expect(proj.completionCriteria.length).toBeGreaterThanOrEqual(2);
      }
    });

    it("enrolls in project and tracks milestone completion", async () => {
      const testProject = CAREER_PROJECTS_DATABASE[0];
      const enrollment = await LearningPlanService.enrollInProject(
        "demo.student@kaabil.in",
        testProject.id
      );

      expect(enrollment.status).toBe("IN_PROGRESS");
      expect(enrollment.completedMilestoneIds).toHaveLength(0);

      // Check off Step 1 and Step 2
      const updated1 = await LearningPlanService.updateProjectMilestone(
        "demo.student@kaabil.in",
        testProject.id,
        "m1",
        true
      );
      expect(updated1.completedMilestoneIds).toContain("m1");

      const updated2 = await LearningPlanService.updateProjectMilestone(
        "demo.student@kaabil.in",
        testProject.id,
        "m2",
        true
      );
      expect(updated2.completedMilestoneIds).toEqual(["m1", "m2"]);
    });

    it("submits project deliverable without fabricating platform verification (Rule 13 & 14)", async () => {
      const testProject = CAREER_PROJECTS_DATABASE[0];

      const submitted = await LearningPlanService.submitProject(
        "demo.student@kaabil.in",
        testProject.id,
        {
          submissionUrl: "https://github.com/kaabil-demo/responsive-portfolio",
          submissionNotes: "Completed semantic HTML5 layout with mobile breakpoints and dark mode toggle.",
          selfAssessedReflection: "Learned mobile-first responsive design principles.",
        }
      );

      expect(submitted.status).toBe("SUBMITTED");
      expect(submitted.submissionUrl).toBe("https://github.com/kaabil-demo/responsive-portfolio");
      expect(submitted.submittedAt).toBeDefined();

      // Check evidence recorded in devStore
      const profile = await ProfileService.getStudentProfile("demo.student@kaabil.in");
      const evidences = devStore.getSkillEvidences(profile!.id) || [];
      const projectEvidence = evidences.find((e: any) => e.evidenceType === "PORTFOLIO_PROJECT");

      expect(projectEvidence).toBeDefined();
      expect(projectEvidence.isVerified).toBe(false); // CRITICAL: Must be false!
      expect(projectEvidence.verificationStatus).toBe("SELF_REPORTED"); // CRITICAL: Self-reported
      expect(projectEvidence.verifier).toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // 6. API Route Handlers
  // --------------------------------------------------------------------------
  describe("6. API Route Handlers", () => {
    it("GET /api/student/learning-plan returns 200 with plan data", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/learning-plan");
      const res = await getLearningPlanRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.plan).toBeDefined();
      expect(data.plan.weeklySprints).toHaveLength(4);
    });

    it("POST /api/student/learning-plan updates time budget preferences", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/learning-plan", {
        method: "POST",
        body: JSON.stringify({
          weeklyTimeCommitmentHours: 15,
          budgetPreference: "FREE_ONLY",
        }),
      });
      const res = await postLearningPlanRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.preferences.weeklyTimeCommitmentHours).toBe(15);
      expect(data.plan.preferences.weeklyTimeCommitmentHours).toBe(15);
    });

    it("POST /api/student/learning-plan/task toggles task state", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/learning-plan/task", {
        method: "POST",
        body: JSON.stringify({
          taskId: "task-w1-d1",
          completed: true,
        }),
      });
      const res = await postTaskToggleRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.result.isCompleted).toBe(true);
    });

    it("GET /api/student/projects returns projects with student enrollment status", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/projects");
      const res = await getProjectsRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.projects.length).toBeGreaterThanOrEqual(1);
    });

    it("POST /api/student/projects handles ENROLL, UPDATE_MILESTONE, and SUBMIT actions", async () => {
      const testProject = CAREER_PROJECTS_DATABASE[0];

      // 1. ENROLL
      const enrollReq = new NextRequest("http://localhost:3000/api/student/projects", {
        method: "POST",
        body: JSON.stringify({
          action: "ENROLL",
          projectId: testProject.id,
        }),
      });
      const enrollRes = await postProjectsRoute(enrollReq);
      const enrollData = await enrollRes.json();
      expect(enrollRes.status).toBe(200);
      expect(enrollData.success).toBe(true);
      expect(enrollData.enrollment.status).toBe("IN_PROGRESS");

      // 2. UPDATE_MILESTONE
      const milestoneReq = new NextRequest("http://localhost:3000/api/student/projects", {
        method: "POST",
        body: JSON.stringify({
          action: "UPDATE_MILESTONE",
          projectId: testProject.id,
          milestoneId: "m1",
          completed: true,
        }),
      });
      const milestoneRes = await postProjectsRoute(milestoneReq);
      const milestoneData = await milestoneRes.json();
      expect(milestoneRes.status).toBe(200);
      expect(milestoneData.enrollment.completedMilestoneIds).toContain("m1");

      // 3. SUBMIT
      const submitReq = new NextRequest("http://localhost:3000/api/student/projects", {
        method: "POST",
        body: JSON.stringify({
          action: "SUBMIT",
          projectId: testProject.id,
          submissionUrl: "https://my-portfolio-demo.vercel.app",
          submissionNotes: "Deployed live portfolio with responsive layout",
        }),
      });
      const submitRes = await postProjectsRoute(submitReq);
      const submitData = await submitRes.json();
      expect(submitRes.status).toBe(200);
      expect(submitData.enrollment.status).toBe("SUBMITTED");
      expect(submitData.enrollment.submissionUrl).toBe("https://my-portfolio-demo.vercel.app");
    });
  });
});
