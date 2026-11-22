// ==============================================================================
// KAABIL (काबिल) — 4-Week Learning Sprint Section Component
// Displays weekly sprint milestones, focus skills, and interactive daily task checklist
// ==============================================================================

"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  Video,
  Code2,
  HelpCircle,
  FolderGit2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  WeeklySprintMilestone,
  LearningTask,
  LearningTaskType,
} from "@/types/learning-plan";

interface WeeklySprintSectionProps {
  sprints: WeeklySprintMilestone[];
  language: "en" | "hi" | "hinglish";
  onToggleTask: (taskId: string, completed: boolean) => Promise<void>;
}

export function WeeklySprintSection({
  sprints,
  language,
  onToggleTask,
}: WeeklySprintSectionProps) {
  // Default open to Week 1 or first uncompleted week
  const initialWeek = sprints.find((s) => !s.isCompleted)?.weekNumber || 1;
  const [activeWeek, setActiveWeek] = useState<number>(initialWeek);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const handleToggle = async (task: LearningTask) => {
    try {
      setUpdatingTaskId(task.id);
      await onToggleTask(task.id, !task.isCompleted);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getTaskTypeIcon = (type: LearningTaskType) => {
    switch (type) {
      case "READING":
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case "VIDEO":
        return <Video className="h-4 w-4 text-red-600" />;
      case "HANDS_ON_PRACTICE":
        return <Code2 className="h-4 w-4 text-purple-600" />;
      case "DIAGNOSTIC_QUIZ":
        return <HelpCircle className="h-4 w-4 text-amber-600" />;
      case "PROJECT_MILESTONE":
        return <FolderGit2 className="h-4 w-4 text-emerald-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Week Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {sprints.map((sprint) => {
          const isActive = activeWeek === sprint.weekNumber;
          const completedCount = sprint.tasks.filter((t) => t.isCompleted).length;
          return (
            <button
              key={sprint.weekNumber}
              onClick={() => setActiveWeek(sprint.weekNumber)}
              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                isActive
                  ? "border-purple-600 bg-purple-50/70 shadow-xs ring-1 ring-purple-500"
                  : "border-gray-200 bg-white hover:border-purple-200 hover:bg-gray-50/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">
                  WEEK {sprint.weekNumber}
                </span>
                {sprint.isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <span className="text-[10px] font-semibold text-purple-700">
                    {completedCount}/{sprint.tasks.length}
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs sm:text-sm font-bold text-gray-900 truncate">
                {sprint.focusSkill}
              </div>
              <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${sprint.progressPercent}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Week Sprint Details */}
      {sprints
        .filter((s) => s.weekNumber === activeWeek)
        .map((sprint) => (
          <div
            key={sprint.weekNumber}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs"
          >
            {/* Sprint Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs font-semibold">
                    Week {sprint.weekNumber} Sprint
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="mr-1 h-3.5 w-3.5 text-gray-400" />
                    ~{sprint.estimatedHours} Hours Total
                  </span>
                </div>
                <h3 className="mt-1 text-base sm:text-lg font-bold text-gray-900">
                  {sprint.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  {sprint.objective}
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-gray-500">
                  Sprint Progress
                </div>
                <div className="text-base font-bold text-purple-700">
                  {sprint.progressPercent}% Completed
                </div>
              </div>
            </div>

            {/* Daily Tasks List */}
            <div className="mt-4 space-y-2.5">
              {sprint.tasks.map((task) => {
                const isBusy = updatingTaskId === task.id;
                const taskTitle =
                  language === "hi" && task.titleHi
                    ? task.titleHi
                    : language === "hinglish" && task.titleHinglish
                    ? task.titleHinglish
                    : task.title;

                const criteria =
                  language === "hi" && task.completionCriteriaHi
                    ? task.completionCriteriaHi
                    : language === "hinglish" && task.completionCriteriaHinglish
                    ? task.completionCriteriaHinglish
                    : task.completionCriteria;

                return (
                  <div
                    key={task.id}
                    className={`group flex items-start space-x-3 rounded-xl border p-3.5 transition-all ${
                      task.isCompleted
                        ? "border-emerald-200 bg-emerald-50/30"
                        : "border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/20"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggle(task)}
                      disabled={isBusy}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-all cursor-pointer ${
                        task.isCompleted
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-gray-300 bg-white hover:border-purple-400 text-transparent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                            {task.dayLabel}
                          </span>
                          <span className="flex items-center space-x-1 text-xs text-gray-500">
                            {getTaskTypeIcon(task.type)}
                            <span className="text-[11px] font-medium capitalize">
                              {task.type.toLowerCase().replace(/_/g, " ")}
                            </span>
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200">
                          {task.estimatedMinutes} mins
                        </Badge>
                      </div>

                      <h4 className={`mt-1.5 text-xs sm:text-sm font-semibold ${task.isCompleted ? "text-emerald-950 line-through" : "text-gray-900"}`}>
                        {taskTitle}
                      </h4>

                      <div className="mt-1 text-xs text-gray-600 leading-normal">
                        <strong>Criteria:</strong> {criteria}
                      </div>

                      {/* Resource Pill */}
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                        <span className="text-gray-500 truncate max-w-xs sm:max-w-md">
                          Resource: <strong>{task.resourceTitle}</strong> ({task.resourceProvider})
                        </span>
                        <a
                          href={task.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-purple-600 hover:text-purple-800 font-semibold text-xs"
                        >
                          View Resource <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
