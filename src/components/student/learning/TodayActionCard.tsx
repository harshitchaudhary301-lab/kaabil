// ==============================================================================
// KAABIL (काबिल) — Today's Action Hero Card Component
// Prominent, actionable "What Should I Do Today?" card with authentic resource link,
// clear completion criteria, and 1-click completion toggle.
// ==============================================================================

"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Video,
  Code2,
  HelpCircle,
  FolderGit2,
  Flame,
  Award,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LearningTask, LearningTaskType } from "@/types/learning-plan";

interface TodayActionCardProps {
  task: LearningTask | null;
  currentStreakDays: number;
  language: "en" | "hi" | "hinglish";
  onToggleTask: (taskId: string, completed: boolean) => Promise<void>;
  onNavigateToProjects?: () => void;
}

export function TodayActionCard({
  task,
  currentStreakDays,
  language,
  onToggleTask,
  onNavigateToProjects,
}: TodayActionCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!task) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50 via-white to-indigo-50/50 p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center py-6">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
            <Award className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {language === "hi"
              ? "शानदार! आज के सभी कार्य पूरे हो चुके हैं"
              : language === "hinglish"
              ? "All tasks done today! Solid consistency!"
              : "All Caught Up For Today!"}
          </h3>
          <p className="mt-1 text-sm text-gray-600 max-w-md">
            {language === "hi"
              ? "आपने अपनी सीखने की योजना के सभी वर्तमान कार्य पूरे कर लिए हैं। अपने करियर के लिए व्यावहारिक प्रोजेक्ट शुरू करें।"
              : language === "hinglish"
              ? "Aapne sabhi daily sprint tasks complete kar liye hain. Ab Projects Hub me real-world project start karein."
              : "You have completed your daily sprint commitments. Head over to the Projects Hub to build practical portfolio deliverables."}
          </p>
          {onNavigateToProjects && (
            <Button
              onClick={onNavigateToProjects}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm hover:shadow"
            >
              <FolderGit2 className="mr-2 h-4 w-4" />
              {language === "hi" ? "प्रोजेक्ट्स हब देखें" : "Explore Projects Hub"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  const handleToggle = async () => {
    try {
      setIsUpdating(true);
      await onToggleTask(task.id, !task.isCompleted);
    } finally {
      setIsUpdating(false);
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

  const getTaskTitle = () => {
    if (language === "hi" && task.titleHi) return task.titleHi;
    if (language === "hinglish" && task.titleHinglish) return task.titleHinglish;
    return task.title;
  };

  const getCompletionCriteria = () => {
    if (language === "hi" && task.completionCriteriaHi) return task.completionCriteriaHi;
    if (language === "hinglish" && task.completionCriteriaHinglish) return task.completionCriteriaHinglish;
    return task.completionCriteria;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-purple-200/90 bg-white p-6 shadow-md transition-all hover:border-purple-300">
      {/* Pixel-art top decorative accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500" />

      {/* Header Tag Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200 px-3 py-1 font-semibold text-xs flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-purple-600" />
            <span>
              {language === "hi"
                ? "आज का मुख्य लक्ष्य"
                : language === "hinglish"
                ? "What Should I Do Today?"
                : "What Should I Do Today?"}
            </span>
          </Badge>
          <span className="text-xs font-medium text-gray-500 flex items-center">
            <Calendar className="mr-1 h-3.5 w-3.5 text-gray-400" />
            {task.dayLabel}
          </span>
        </div>

        {/* Streak & Duration Pill */}
        <div className="flex items-center space-x-2">
          {currentStreakDays > 0 && (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold px-2.5 py-0.5">
              <Flame className="mr-1 h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              {currentStreakDays} {language === "hi" ? "दिन स्ट्रीक" : "Day Streak"}
            </Badge>
          )}
          <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-0.5">
            <Clock className="mr-1 h-3.5 w-3.5 text-purple-600" />
            {task.estimatedMinutes} Mins
          </Badge>
        </div>
      </div>

      {/* Main Task Title & Target Skill */}
      <div className="mt-4">
        <div className="flex items-center space-x-2 text-xs font-medium text-purple-700">
          <span className="flex items-center space-x-1">
            {getTaskTypeIcon(task.type)}
            <span className="uppercase tracking-wider font-bold">
              {task.type.replace(/_/g, " ")}
            </span>
          </span>
          <span>•</span>
          <span className="text-gray-600">Focus Skill: <strong>{task.skillTarget}</strong></span>
        </div>

        <h2 className="mt-2 text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-snug">
          {getTaskTitle()}
        </h2>

        {/* Completion Criteria Box */}
        <div className="mt-3 rounded-xl border border-purple-100 bg-purple-50/60 p-3.5">
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
            <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-purple-900">
                {language === "hi"
                  ? "पूर्णता मानदंड: "
                  : language === "hinglish"
                  ? "Completion Criteria: "
                  : "Completion Criteria: "}
              </span>
              {getCompletionCriteria()}
            </div>
          </div>
        </div>

        {/* Authentic Resource Section */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3.5">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-500">
              {language === "hi" ? "सत्यापित शिक्षण सामग्री:" : "Curated Learning Resource:"}
            </div>
            <div className="truncate text-sm font-semibold text-gray-900">
              {task.resourceTitle}
            </div>
            <div className="text-xs text-purple-700 flex items-center space-x-1">
              <span>Provided by {task.resourceProvider}</span>
              {task.isFreeResource && (
                <span className="ml-2 inline-flex items-center rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-medium text-emerald-800">
                  100% Free
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={task.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-purple-300 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors shadow-xs"
            >
              <span>{language === "hi" ? "संसाधन खोलें" : "Open Resource"}</span>
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {task.isCompleted ? (
            <span className="text-emerald-700 font-medium flex items-center">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" />
              {language === "hi"
                ? "यह कार्य पूरा हो चुका है!"
                : language === "hinglish"
                ? "Completed! Great work today!"
                : "Task completed! Great consistency."}
            </span>
          ) : (
            <span>
              {language === "hi"
                ? "कार्य पूरा होने पर नीचे दिए गए बटन पर क्लिक करें"
                : language === "hinglish"
                ? "Complete hone ke baad 'Mark Completed' click karein"
                : "Click below once you finish reading or practicing."}
            </span>
          )}
        </div>

        <Button
          onClick={handleToggle}
          disabled={isUpdating}
          className={`transition-all font-semibold shadow-xs ${
            task.isCompleted
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {isUpdating
            ? "Saving..."
            : task.isCompleted
            ? language === "hi"
              ? "पूरा हुआ ✓"
              : "Completed ✓"
            : language === "hi"
            ? "पूर्ण के रूप में चिह्नित करें"
            : language === "hinglish"
            ? "Mark as Done"
            : "Mark as Done"}
        </Button>
      </div>
    </div>
  );
}
