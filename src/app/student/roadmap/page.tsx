"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Map,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Award,
  Layers,
  BookOpen,
  CheckSquare,
  AlertCircle,
  Play,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StudentRoadmapPage() {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number>(3);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/student/roadmap");
      if (res.ok) {
        const data = await res.json();
        if (data.roadmap) {
          setRoadmap(data.roadmap);
        }
      }
    } catch {
      // Fallback data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleTask = async (milestoneId: string, activityId: string, currentStatus: boolean) => {
    setUpdatingTaskId(activityId);
    try {
      const res = await fetch("/api/student/roadmap/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId,
          activityId,
          completed: !currentStatus,
        }),
      });
      if (res.ok) {
        await fetchRoadmap();
      }
    } catch {
      // Ignore
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Realistic sample fallback milestones matching Indian STEM / universal benchmarks
  const displayMilestones = roadmap?.weeklyMilestones ?? [
    {
      id: "w1",
      weekNumber: 1,
      title: "Foundations & Diagnostic Alignment",
      theme: "Diagnostic Baseline",
      status: "COMPLETED",
      activities: [
        { id: "a1", title: "Complete Foundational Skill Gap Diagnostic", completed: true, type: "DIAGNOSTIC", durationMinutes: 15 },
        { id: "a2", title: "Review Algorithmic Logic Fundamentals in Python", completed: true, type: "LEARNING", durationMinutes: 45 },
        { id: "a3", title: "Set up Local Development Sandbox & Git Environment", completed: true, type: "HANDS_ON", durationMinutes: 30 },
      ],
    },
    {
      id: "w2",
      weekNumber: 2,
      title: "Core Architecture & Data Structures",
      theme: "Technical Core",
      status: "COMPLETED",
      activities: [
        { id: "a4", title: "Array & Graph Traversal Implementations", completed: true, type: "HANDS_ON", durationMinutes: 60 },
        { id: "a5", title: "Time & Space Complexity Benchmarking", completed: true, type: "LEARNING", durationMinutes: 30 },
        { id: "a6", title: "Pass Checkpoint Assessment 1: Python Core", completed: true, type: "ASSESSMENT", durationMinutes: 20 },
      ],
    },
    {
      id: "w3",
      weekNumber: 3,
      title: "Machine Learning & Model Inference Fundamentals",
      theme: "AI/ML Systems",
      status: "IN_PROGRESS",
      activities: [
        { id: "a7", title: "Tensor Operations & PyTorch Autograd Basics", completed: true, type: "LEARNING", durationMinutes: 45 },
        { id: "a8", title: "Deploying Pretrained HuggingFace Model Inference", completed: false, type: "HANDS_ON", durationMinutes: 60 },
        { id: "a9", title: "FastAPI Async Endpoint Serving & Latency Check", completed: false, type: "HANDS_ON", durationMinutes: 45 },
      ],
    },
    {
      id: "w4",
      weekNumber: 4,
      title: "Vector Databases & Semantic Embeddings",
      theme: "Search & Retrieval",
      status: "UPCOMING",
      activities: [
        { id: "a10", title: "Embedding Generation & Cosine Similarity Metrics", completed: false, type: "LEARNING", durationMinutes: 40 },
        { id: "a11", title: "ChromaDB / Qdrant Vector Store Integration", completed: false, type: "HANDS_ON", durationMinutes: 60 },
        { id: "a12", title: "Pass Checkpoint Assessment 2: Vector Systems", completed: false, type: "ASSESSMENT", durationMinutes: 25 },
      ],
    },
    {
      id: "w5",
      weekNumber: 5,
      title: "Full-Stack AI Application Integration",
      theme: "System Design",
      status: "UPCOMING",
      activities: [
        { id: "a13", title: "Connect Next.js UI with Streaming FastAPI Backend", completed: false, type: "HANDS_ON", durationMinutes: 60 },
        { id: "a14", title: "Implement Error Boundaries & Rate Limiting", completed: false, type: "LEARNING", durationMinutes: 30 },
      ],
    },
    {
      id: "w6",
      weekNumber: 6,
      title: "Mid-Term Project & Code Audit",
      theme: "Capstone Evidence",
      status: "UPCOMING",
      activities: [
        { id: "a15", title: "Submit Autonomous Medical Triage Assistant Repo", completed: false, type: "PROJECT", durationMinutes: 120 },
        { id: "a16", title: "Mint HMAC-SHA256 Project Evidence Credential", completed: false, type: "VERIFICATION", durationMinutes: 10 },
      ],
    },
  ];

  const totalTasks = displayMilestones.flatMap((m: any) => m.activities).length;
  const completedTasks = displayMilestones.flatMap((m: any) => m.activities).filter((a: any) => a.completed).length;
  const progressPercent = Math.round((completedTasks / (totalTasks || 1)) * 100);

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Career Planning", "Career Roadmap"]}
    >
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                <Map className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                Personalized 12-Week Trajectory
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Adaptive Career Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Milestone-driven action plan dynamically calibrated to your target career goal and current diagnostic gaps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchRoadmap}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 text-xs font-bold gap-1.5 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-purple-600" : ""}`} />
              <span>Sync Milestones</span>
            </Button>

            <Link href="/student/skill-gaps">
              <Button
                size="sm"
                className="rounded-xl bg-[#1E0F2B] hover:bg-[#2F1944] text-[#FFC66B] text-xs font-bold gap-1.5"
              >
                <span>Skill Gaps</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Overview Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Active Career Goal
              </span>
              <h2 className="font-heading text-xl font-bold text-slate-900 mt-0.5">
                AI Systems Engineer (STEM PCM)
              </h2>
              <span className="text-xs text-purple-700 font-semibold">
                Current Focus: Week 3 — Machine Learning &amp; Model Inference Fundamentals
              </span>
            </div>

            <div className="text-right">
              <span className="font-heading text-3xl font-extrabold text-purple-900">
                {progressPercent}%
              </span>
              <span className="text-xs text-slate-500 block font-medium">
                {completedTasks} of {totalTasks} Activities Completed
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Weekly Milestones Accordion */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-slate-900">
              Weekly Milestone Curriculum
            </h3>
            <span className="text-xs text-slate-500">
              Check off tasks as you complete them to automatically update your CRI.
            </span>
          </div>

          <div className="space-y-3">
            {displayMilestones.map((milestone: any) => {
              const isExpanded = expandedWeek === milestone.weekNumber;
              const isCompleted = milestone.status === "COMPLETED";
              const isInProgress = milestone.status === "IN_PROGRESS";

              return (
                <div
                  key={milestone.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isInProgress
                      ? "border-purple-300 bg-purple-50/20 shadow-soft-xs"
                      : isCompleted
                      ? "border-slate-200 bg-white"
                      : "border-slate-200/70 bg-white opacity-85"
                  }`}
                >
                  {/* Milestone Header */}
                  <div
                    onClick={() => setExpandedWeek(isExpanded ? -1 : milestone.weekNumber)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-800"
                            : isInProgress
                            ? "bg-[#1E0F2B] text-[#FFC66B]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        W{milestone.weekNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading text-sm font-bold text-slate-900">
                            Week {milestone.weekNumber}: {milestone.title}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-800"
                                : isInProgress
                                ? "bg-purple-100 text-purple-900 font-extrabold"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isCompleted ? "Completed" : isInProgress ? "Active Focus" : "Upcoming"}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          Theme: {milestone.theme}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        {milestone.activities.filter((a: any) => a.completed).length} /{" "}
                        {milestone.activities.length} tasks
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Milestone Activities List */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-2.5">
                      {milestone.activities.map((act: any) => (
                        <div
                          key={act.id}
                          className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              disabled={updatingTaskId === act.id}
                              onClick={() => handleToggleTask(milestone.id, act.id, act.completed)}
                              className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                                act.completed
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "border-slate-300 hover:border-purple-400 bg-white"
                              }`}
                            >
                              {act.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                            </button>

                            <span
                              className={`font-medium ${
                                act.completed
                                  ? "line-through text-slate-400"
                                  : "text-slate-800"
                              }`}
                            >
                              {act.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {act.durationMinutes}m
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                              {act.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
