// ==============================================================================
// KAABIL (काबिल) — Multi-Stream Career Project Card Component
// Practical project preview card with difficulty, skills, deliverables, and progress
// ==============================================================================

"use client";

import React from "react";
import {
  FolderGit2,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  FileText,
  ExternalLink,
  Laptop,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CareerProject, StudentProjectEnrollment } from "@/types/learning-plan";

interface ProjectCardProps {
  project: CareerProject;
  enrollment?: StudentProjectEnrollment | null;
  language: "en" | "hi" | "hinglish";
  onSelectProject: (project: CareerProject) => void;
}

export function ProjectCard({
  project,
  enrollment,
  language,
  onSelectProject,
}: ProjectCardProps) {
  const isEnrolled = !!enrollment;
  const isSubmitted = enrollment?.status === "SUBMITTED";
  const completedMilestoneCount = enrollment?.completedMilestoneIds?.length || 0;
  const totalMilestones = project.milestones?.length || 4;
  const milestonePercent = Math.round((completedMilestoneCount / totalMilestones) * 100);

  const getDifficultyBadge = () => {
    switch (project.difficulty) {
      case "BEGINNER":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
            Beginner
          </Badge>
        );
      case "INTERMEDIATE":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold">
            Intermediate
          </Badge>
        );
      case "ADVANCED":
        return (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">
            Advanced
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    if (language === "hi" && project.titleHi) return project.titleHi;
    if (language === "hinglish" && project.titleHinglish) return project.titleHinglish;
    return project.title;
  };

  const getObjective = () => {
    if (language === "hi" && project.objectiveHi) return project.objectiveHi;
    if (language === "hinglish" && project.objectiveHinglish) return project.objectiveHinglish;
    return project.objective;
  };

  return (
    <div
      onClick={() => onSelectProject(project)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md cursor-pointer"
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 opacity-80 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className="text-[11px] font-semibold text-purple-800 bg-purple-50 border-purple-200">
            {project.streamTitle}
          </Badge>
          <div className="flex items-center space-x-1.5">
            {getDifficultyBadge()}
            <Badge variant="outline" className="text-[11px] text-gray-600 border-gray-200">
              <Clock className="mr-1 h-3 w-3 text-gray-400" />
              {project.estimatedHours}h
            </Badge>
          </div>
        </div>

        {/* Project Title */}
        <h3 className="mt-3 text-base sm:text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2">
          {getTitle()}
        </h3>

        {/* Objective */}
        <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {getObjective()}
        </p>

        {/* Skills Required Chips */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {project.requiredSkills.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700"
            >
              {skill}
            </span>
          ))}
          {project.requiredSkills.length > 3 && (
            <span className="inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">
              +{project.requiredSkills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer / Enrollment Status */}
      <div className="mt-5 pt-3.5 border-t border-gray-100">
        {isSubmitted ? (
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" />
              Submitted to Portfolio
            </span>
            <span className="text-xs font-medium text-purple-600 group-hover:translate-x-0.5 transition-transform flex items-center">
              View <ArrowRight className="ml-1 h-3 w-3" />
            </span>
          </div>
        ) : isEnrolled ? (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span className="font-medium text-purple-700">In Progress</span>
              <span>{completedMilestoneCount} / {totalMilestones} Milestones ({milestonePercent}%)</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${milestonePercent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs font-semibold text-purple-600">
            <span>View Project Milestones</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </div>
  );
}
