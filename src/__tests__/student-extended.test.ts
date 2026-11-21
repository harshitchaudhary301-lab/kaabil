import { describe, it, expect, beforeEach } from "vitest";
import { devStore } from "@/lib/dev-store";
import { AcademyService } from "@/lib/student/academy-service";
import { ResumeService } from "@/lib/student/resume-service";
import { MockInterviewService } from "@/lib/student/mock-interview-service";
import { WhatIfSimulator } from "@/lib/readiness/what-if-simulator";

describe("Part G3 & G4: Extended Student Features & Career Intelligence", () => {
  beforeEach(() => {
    devStore.reset();
  });

  // ---------------------------------------------------------------------------
  // 1. Learning Academy
  // ---------------------------------------------------------------------------
  describe("Learning Academy", () => {
    it("retrieves stream-tailored learning resources across all 13 streams", () => {
      const allResources = AcademyService.getResources();
      expect(allResources.length).toBeGreaterThanOrEqual(1);

      const pcmResources = AcademyService.getResources({ stream: "NON_MEDICAL_PCM" });
      expect(pcmResources.every((r) => r.stream === "NON_MEDICAL_PCM")).toBe(true);

      const beginnerResources = AcademyService.getResources({ difficulty: "BEGINNER" });
      expect(beginnerResources.every((r) => r.difficulty === "BEGINNER")).toBe(true);
    });

    it("tracks student learning progress and updates completion state", () => {
      const studentId = "aryan-sharma-pcm";
      const resource = AcademyService.getResources()[0];

      // Mark in-progress
      const p1 = AcademyService.updateProgress({
        studentId,
        resourceId: resource.id,
        status: "IN_PROGRESS",
        progressPct: 50,
        notes: "Studied initial 3 video modules.",
      });
      expect(p1.status).toBe("IN_PROGRESS");
      expect(p1.progressPct).toBe(50);

      // Mark completed
      const p2 = AcademyService.updateProgress({
        studentId,
        resourceId: resource.id,
        status: "COMPLETED",
        progressPct: 100,
        rating: 5,
      });
      expect(p2.status).toBe("COMPLETED");
      expect(p2.progressPct).toBe(100);
      expect(p2.completedAt).toBeDefined();

      const progressList = AcademyService.getStudentProgress(studentId);
      const match = progressList.find((p) => p.resourceId === resource.id);
      expect(match?.status).toBe("COMPLETED");
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Resume Studio
  // ---------------------------------------------------------------------------
  describe("Resume Studio", () => {
    it("auto-populates resume draft with verified skills and credentials", () => {
      const studentId = "aryan-sharma-pcm";
      const resume = ResumeService.getResumeForStudent(studentId);

      expect(resume).toBeDefined();
      expect(resume.fullName).toBe("Aryan Sharma");
      expect(resume.personalInfo.fullName).toBe("Aryan Sharma");
      expect(resume.skills.length).toBeGreaterThan(0);
      expect(resume.skills.some((s) => s.verified)).toBe(true);
      expect(resume.education.length).toBeGreaterThan(0);
      expect(resume.template).toBe("MODERN_CLEAN");
    });

    it("saves updated resume with custom template selection", () => {
      const studentId = "aryan-sharma-pcm";
      const resume = ResumeService.getResumeForStudent(studentId);

      resume.template = "CLASSIC_IVY";
      resume.summary = "Experienced robotics and autonomous systems researcher.";
      const saved = ResumeService.saveResume(resume);

      expect(saved.template).toBe("CLASSIC_IVY");
      expect(saved.summary).toContain("Experienced robotics");

      const retrieved = ResumeService.getResumeForStudent(studentId);
      expect(retrieved.template).toBe("CLASSIC_IVY");
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Mock Interview Practice Lab
  // ---------------------------------------------------------------------------
  describe("Interview Practice Lab", () => {
    it("retrieves career-specific interview question bank", () => {
      const questions = MockInterviewService.getQuestions();
      expect(questions.length).toBeGreaterThanOrEqual(1);

      const pcmQuestions = MockInterviewService.getQuestions({ stream: "NON_MEDICAL_PCM" });
      expect(pcmQuestions.every((q) => q.stream === "NON_MEDICAL_PCM")).toBe(true);
    });

    it("evaluates student response with rubric without biometric scoring", () => {
      const studentId = "aryan-sharma-pcm";
      const questions = MockInterviewService.getQuestions();
      const question = questions[0];

      const session = MockInterviewService.evaluateAndSaveResponse({
        studentId,
        questionId: question.id,
        studentAnswer:
          "In our robotics project, we applied a systematic approach. First, we verified sensor calibration. Then, we calibrated the IMU and LiDAR data using an extended Kalman filter for sensor fusion. This reduced odometry drift by 18% during autonomous navigation trials.",
      });

      expect(session).toBeDefined();
      expect(session.score).toBeGreaterThanOrEqual(70);
      expect(session.strengths.length).toBeGreaterThan(0);
      expect(session.feedback).toBeDefined();

      const studentSessions = MockInterviewService.getStudentSessions(studentId);
      expect(studentSessions.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Career What-If Simulator
  // ---------------------------------------------------------------------------
  describe("Career What-If Simulator", () => {
    it("simulates hypothetical skill acquisitions and calculates CRI deltas", () => {
      const simulation = WhatIfSimulator.simulate({
        studentId: "aryan-sharma-pcm",
        targetCareer: "Robotics & Automation Engineer",
        hypotheticalSkills: ["ROS 2 & SLAM Navigation", "PyTorch Deep Learning"],
        hypotheticalAssessments: ["Advanced Robotics Control Assessment"],
        simulatedRoadmapCompletion: true,
      });

      expect(simulation).toBeDefined();
      expect(simulation.currentCRI).toBe(72);
      expect(simulation.simulatedCRI).toBeGreaterThan(simulation.currentCRI);
      expect(simulation.criDelta).toBe(simulation.simulatedCRI - simulation.currentCRI);
      expect(simulation.simulatedSkillGap).toBeLessThan(simulation.currentSkillGap);
      expect(simulation.resolvedGapsCount).toBe(2);
      expect(simulation.projectedTimeToAchieveWeeks).toBeGreaterThan(0);
      expect(simulation.statutoryDisclaimer).toContain("illustrative algorithmic projections");
    });

    it("evaluates cross-stream career transition feasibility", () => {
      const crossStreamSimulation = WhatIfSimulator.simulate({
        studentId: "aryan-sharma-pcm",
        targetCareer: "Agritech Automation Specialist",
        hypotheticalSkills: ["Agricultural Drone Spraying", "GIS Satellite Imagery"],
      });

      expect(crossStreamSimulation.careerTransitionFeasibilityPct).toBeGreaterThan(0);
      expect(crossStreamSimulation.transitionAdvice).toContain("viable");
    });
  });
});
