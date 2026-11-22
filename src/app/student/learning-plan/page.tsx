// ==============================================================================
// KAABIL (काबिल) — Student Personalized Learning Plan & Projects Hub Page
// Step 3.3 Implementation: Daily/weekly sprints, authentic free resources,
// multi-stream real-world projects, milestone tracking & portfolio submissions.
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Flame,
  Award,
  Layers,
  FolderGit2,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Info,
  Languages,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TodayActionCard } from "@/components/student/learning/TodayActionCard";
import { ProjectCard } from "@/components/student/learning/ProjectCard";
import { ProjectDetailDrawer } from "@/components/student/learning/ProjectDetailDrawer";
import { LearningPreferencesModal } from "@/components/student/learning/LearningPreferencesModal";
import { WeeklySprintSection } from "@/components/student/learning/WeeklySprintSection";
import {
  PersonalizedLearningPlanData,
  CareerProject,
  StudentProjectEnrollment,
  LearningPlanPreferences,
  ProjectDifficulty,
} from "@/types/learning-plan";
import { EducationalStream } from "@/types";

export default function StudentLearningPlanPage() {
  const [plan, setPlan] = useState<PersonalizedLearningPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active UI Controls
  const [activeTab, setActiveTab] = useState<"sprints" | "projects">("sprints");
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");

  // Modals state
  const [selectedProject, setSelectedProject] = useState<CareerProject | null>(null);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  // Initial load
  const loadPlan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/student/learning-plan");
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
      } else {
        setError(data.error || "Failed to load learning plan.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  // Handlers
  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!plan) return;
    try {
      // Optimistic update
      const updatedSprints = plan.weeklySprints.map((sprint) => {
        const updatedTasks = sprint.tasks.map((t) =>
          t.id === taskId
            ? { ...t, isCompleted: completed, completedAt: completed ? new Date().toISOString() : null }
            : t
        );
        const compCount = updatedTasks.filter((t) => t.isCompleted).length;
        return {
          ...sprint,
          tasks: updatedTasks,
          isCompleted: compCount === updatedTasks.length && updatedTasks.length > 0,
          progressPercent: updatedTasks.length > 0 ? Math.round((compCount / updatedTasks.length) * 100) : 0,
        };
      });

      const allTasks = updatedSprints.flatMap((s) => s.tasks);
      const compCount = allTasks.filter((t) => t.isCompleted).length;
      const progressPercent = Math.round((compCount / allTasks.length) * 100);
      const nextTask = allTasks.find((t) => !t.isCompleted) || null;

      setPlan({
        ...plan,
        weeklySprints: updatedSprints,
        completedTasks: compCount,
        overallPlanProgressPercent: progressPercent,
        todaysTask: nextTask,
      });

      // API persist
      await fetch("/api/student/learning-plan/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed }),
      });
    } catch {
      // Revert on error
      loadPlan();
    }
  };

  const handleSavePreferences = async (newPrefs: Partial<LearningPlanPreferences>) => {
    try {
      const res = await fetch("/api/student/learning-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrefs),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
      }
    } catch (err) {
      console.error("Failed to save preferences:", err);
    }
  };

  const handleSelectProject = (project: CareerProject) => {
    setSelectedProject(project);
    setIsProjectDrawerOpen(true);
  };

  const handleEnrollProject = async (projectId: string) => {
    try {
      const res = await fetch("/api/student/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ENROLL", projectId }),
      });
      const data = await res.json();
      if (data.success && data.enrollment) {
        // Refresh plan to reflect new enrollment
        loadPlan();
      }
    } catch (err) {
      console.error("Failed to enroll:", err);
    }
  };

  const handleToggleMilestone = async (
    projectId: string,
    milestoneId: string,
    completed: boolean
  ) => {
    try {
      const res = await fetch("/api/student/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_MILESTONE", projectId, milestoneId, completed }),
      });
      const data = await res.json();
      if (data.success) {
        loadPlan();
      }
    } catch (err) {
      console.error("Failed to toggle milestone:", err);
    }
  };

  const handleSubmitDeliverable = async (
    projectId: string,
    submission: { submissionUrl: string; submissionNotes?: string; selfAssessedReflection?: string }
  ) => {
    try {
      const res = await fetch("/api/student/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT",
          projectId,
          ...submission,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsProjectDrawerOpen(false);
        loadPlan();
      }
    } catch (err) {
      console.error("Failed to submit project deliverable:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm font-medium text-gray-600">
          Personalizing your multi-stream learning plan & projects...
        </p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="mx-auto max-w-3xl py-12 px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">{error || "Could not load learning plan."}</p>
          <Button onClick={loadPlan} className="mt-4 bg-red-600 hover:bg-red-700 text-white">
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  // Filter projects by difficulty
  const allProjects = [...plan.suggestedProjects, ...plan.enrolledProjects.map((e) => e.project)];
  // Deduplicate
  const uniqueProjectsMap = new Map<string, CareerProject>();
  allProjects.forEach((p) => uniqueProjectsMap.set(p.id, p));
  const distinctProjects = Array.from(uniqueProjectsMap.values());

  const filteredProjects = distinctProjects.filter((p) => {
    if (selectedDifficulty === "ALL") return true;
    return p.difficulty === selectedDifficulty;
  });

  const getEnrollmentForProject = (projectId: string) => {
    const found = plan.enrolledProjects.find((e) => e.project.id === projectId);
    return found ? found.enrollment : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-gray-50/30 pb-16">
      {/* Top Breadcrumb & Language Switcher */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Link href="/student/dashboard" className="hover:text-purple-600 transition-colors">
              Student Hub
            </Link>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <Link href="/student/profile" className="hover:text-purple-600 transition-colors">
              My Profile
            </Link>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="font-semibold text-purple-700">Learning Plan & Projects</span>
          </div>

          {/* Controls: Language & Skill Tree link */}
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50/80 p-0.5 text-xs">
              <button
                onClick={() => setLanguage("en")}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  language === "en" ? "bg-white text-purple-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  language === "hi" ? "bg-white text-purple-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage("hinglish")}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  language === "hinglish" ? "bg-white text-purple-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Hinglish
              </button>
            </div>

            <Link href="/student/skill-tree">
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50 text-xs">
                <Compass className="mr-1.5 h-3.5 w-3.5" />
                View Skill Tree
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Page Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-md">
          {/* Decorative pixel-art accent overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-purple-900/60 text-purple-200 border border-purple-400/40 text-xs font-semibold">
                  {plan.streamTitle}
                </Badge>
                <Badge className="bg-white/20 text-white border-transparent text-xs font-semibold">
                  {plan.educationStage.replace(/_/g, " ")}
                </Badge>
              </div>

              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
                {language === "hi"
                  ? "व्यक्तिगत शिक्षण योजना और प्रोजेक्ट्स हब"
                  : language === "hinglish"
                  ? "Personalized Learning Plan & Projects Hub"
                  : "Personalized Learning Plan & Projects Hub"}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-purple-100 max-w-2xl">
                {language === "hi"
                  ? `आपके लक्षित करियर '${plan.careerTitle}' के लिए व्यावहारिक कौशल विकास, दैनिक कार्य और सत्यापित मुफ्त संसाधन।`
                  : language === "hinglish"
                  ? `Aapke target career '${plan.careerTitle}' ke liye practical daily tasks, authentic free resources aur portfolio projects.`
                  : `Structured daily sprints, curated free resources, and practical projects tailored for ${plan.careerTitle}.`}
              </p>
            </div>

            <Button
              onClick={() => setIsPreferencesModalOpen(true)}
              className="bg-white text-purple-900 hover:bg-purple-50 font-bold shadow-sm"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4 text-purple-700" />
              Customize Schedule
            </Button>
          </div>
        </div>

        {/* Quick Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-purple-100 bg-white p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Target Career Track
            </div>
            <div className="mt-1 text-sm sm:text-base font-bold text-gray-900 truncate">
              {plan.careerTitle}
            </div>
            <div className="mt-1 text-xs text-purple-600 font-medium">
              Stage: {plan.educationStage}
            </div>
          </div>

          <div className="rounded-xl border border-purple-100 bg-white p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Time Commitment
            </div>
            <div className="mt-1 text-sm sm:text-base font-bold text-gray-900">
              {plan.preferences.weeklyTimeCommitmentHours} Hours / Week
            </div>
            <div className="mt-1 text-xs text-gray-500">
              ~{plan.preferences.weeklyTimeCommitmentHours === 5 ? "30" : plan.preferences.weeklyTimeCommitmentHours === 10 ? "45" : plan.preferences.weeklyTimeCommitmentHours === 15 ? "60" : "90"} mins / day
            </div>
          </div>

          <div className="rounded-xl border border-purple-100 bg-white p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Sprint Tasks Progress
            </div>
            <div className="mt-1 text-sm sm:text-base font-bold text-gray-900">
              {plan.completedTasks} / {plan.totalTasks} Tasks ({plan.overallPlanProgressPercent}%)
            </div>
            <div className="mt-1.5 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${plan.overallPlanProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-purple-100 bg-white p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Streak
            </div>
            <div className="mt-1 text-sm sm:text-base font-bold text-amber-600 flex items-center">
              <Flame className="mr-1.5 h-4 w-4 fill-amber-500 text-amber-500" />
              {plan.currentStreakDays} Days Consistent
            </div>
            <div className="mt-1 text-xs text-emerald-700 font-medium">
              100% Free Public Resources
            </div>
          </div>
        </div>

        {/* Primary View Mode Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("sprints")}
            className={`flex items-center space-x-2 py-3 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "sprints"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Learning Sprint & Daily Tasks</span>
            <Badge variant="secondary" className="ml-1 text-[11px] bg-purple-100 text-purple-800">
              4 Weeks
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center space-x-2 py-3 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "projects"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <FolderGit2 className="h-4 w-4" />
            <span>Multi-Stream Projects Hub</span>
            <Badge variant="secondary" className="ml-1 text-[11px] bg-emerald-100 text-emerald-800">
              {distinctProjects.length} Projects
            </Badge>
          </button>
        </div>

        {/* ================================================================== */}
        {/* TAB 1: LEARNING SPRINT & DAILY TASKS                               */}
        {/* ================================================================== */}
        {activeTab === "sprints" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Hero: What Should I Do Today? */}
            <TodayActionCard
              task={plan.todaysTask}
              currentStreakDays={plan.currentStreakDays}
              language={language}
              onToggleTask={handleToggleTask}
              onNavigateToProjects={() => setActiveTab("projects")}
            />

            {/* 4-Week Modular Sprints */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-purple-600" />
                  4-Week Learning Sprint Roadmap
                </h3>
                <span className="text-xs text-gray-500">
                  Click any week tab to view daily tasks
                </span>
              </div>

              <WeeklySprintSection
                sprints={plan.weeklySprints}
                language={language}
                onToggleTask={handleToggleTask}
              />
            </div>

            {/* Authentic Curated Resources Section */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
                    Verified Public Learning Resources
                  </h3>
                  <p className="text-xs text-gray-500">
                    Trustworthy curriculum accredited by government bodies, IITs, NPTEL, Swayam, and ICAI.
                  </p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                  Curated Authentic Resources
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.recommendedResources.map((res) => (
                  <div
                    key={res.id}
                    className="flex flex-col justify-between rounded-xl border border-gray-100 bg-gray-50/60 p-4 hover:border-purple-200 hover:bg-purple-50/20 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-purple-700 font-semibold mb-1">
                        <span>{res.provider}</span>
                        {res.isFree && (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-800 font-bold">
                            100% Free
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 leading-snug">
                        {res.title}
                      </h4>
                      <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                        {res.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                      <span className="text-gray-500">
                        Target Skill: <strong>{res.targetSkillName}</strong>
                      </span>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center font-semibold text-purple-600 hover:text-purple-800"
                      >
                        Open Resource <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: MULTI-STREAM PROJECTS HUB                                   */}
        {/* ================================================================== */}
        {activeTab === "projects" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Difficulty:
                </span>
                <div className="flex flex-wrap gap-1">
                  {["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        selectedDifficulty === diff
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Showing <strong>{filteredProjects.length}</strong> real-world project templates
              </div>
            </div>

            {/* Enrolled Projects Spotlight (if any) */}
            {plan.enrolledProjects.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <Flame className="mr-2 h-5 w-5 text-amber-500 fill-amber-500" />
                  Your Active Portfolio Projects
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plan.enrolledProjects.map(({ project, enrollment }) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      enrollment={enrollment}
                      language={language}
                      onSelectProject={handleSelectProject}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Available Projects Grid */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center">
                <FolderGit2 className="mr-2 h-5 w-5 text-purple-600" />
                Explore Stream Career Projects
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => {
                  const enrollment = getEnrollmentForProject(project.id);
                  return (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      enrollment={enrollment}
                      language={language}
                      onSelectProject={handleSelectProject}
                    />
                  );
                })}
              </div>
            </div>

            {/* Provenance & Non-Fabrication Notice Box */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 flex items-start space-x-3 text-xs text-purple-900">
              <ShieldCheck className="h-5 w-5 shrink-0 text-purple-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">
                  How KAABIL Evaluates Project Submissions (Authentic Evidence)
                </p>
                <p className="text-purple-800 leading-relaxed">
                  Completing milestones and submitting deliverables showcases your authentic work under your KAABIL Portfolio as <em>Self-Directed Practical Evidence</em>. External accreditation, CRI boost, or employer skill verification badges are strictly issued when assessed through formal proctored diagnostic checkpoints.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <ProjectDetailDrawer
        project={selectedProject}
        enrollment={selectedProject ? getEnrollmentForProject(selectedProject.id) : null}
        language={language}
        isOpen={isProjectDrawerOpen}
        onClose={() => setIsProjectDrawerOpen(false)}
        onEnroll={handleEnrollProject}
        onToggleMilestone={handleToggleMilestone}
        onSubmitDeliverable={handleSubmitDeliverable}
      />

      <LearningPreferencesModal
        currentPreferences={plan.preferences}
        isOpen={isPreferencesModalOpen}
        language={language}
        onClose={() => setIsPreferencesModalOpen(false)}
        onSavePreferences={handleSavePreferences}
      />
    </div>
  );
}
