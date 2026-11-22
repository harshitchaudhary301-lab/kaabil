// ==============================================================================
// KAABIL (काबिल) — Skill Node Card Component
// Interactive node representation with status indicators and pixel-art sparkle badge
// ==============================================================================

import React from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SkillTreeNode } from "@/types/skills";

interface SkillNodeCardProps {
  node: SkillTreeNode;
  isSuggestedNext?: boolean;
  language?: "en" | "hi" | "hinglish";
  onClick?: () => void;
  variant?: "canvas" | "list";
}

export function SkillNodeCard({
  node,
  isSuggestedNext = false,
  language = "en",
  onClick,
  variant = "canvas",
}: SkillNodeCardProps) {
  // Localized title
  const localizedTitle =
    language === "hi"
      ? node.nameHi || node.name
      : language === "hinglish"
      ? node.nameHinglish || node.name
      : node.name;

  // Status Styling Logic
  let borderClass = "border-slate-200 bg-white hover:border-purple-300";
  let statusBadgeClass = "bg-slate-100 text-slate-700 border-slate-200";
  let statusLabel = "Missing";
  let statusIcon = <Clock className="w-3.5 h-3.5 text-slate-400" />;

  if (node.status === "MASTERED") {
    borderClass =
      "border-emerald-300 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 hover:border-emerald-400 shadow-sm";
    statusBadgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
    statusLabel = "Mastered";
    statusIcon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
  } else if (node.status === "VERIFIED") {
    borderClass =
      "border-emerald-200 bg-emerald-50/40 hover:border-emerald-300";
    statusBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    statusLabel = "Verified";
    statusIcon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
  } else if (node.status === "SELF_REPORTED") {
    borderClass =
      "border-amber-200 bg-amber-50/40 hover:border-amber-300";
    statusBadgeClass = "bg-amber-100 text-amber-800 border-amber-300";
    statusLabel = "Claimed";
    statusIcon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
  } else if (node.status === "IN_PROGRESS") {
    borderClass = "border-blue-200 bg-blue-50/30 hover:border-blue-300";
    statusBadgeClass = "bg-blue-100 text-blue-800 border-blue-300";
    statusLabel = "Learning";
    statusIcon = <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
  } else if (node.status === "READY_TO_LEARN") {
    borderClass =
      isSuggestedNext
        ? "border-purple-400 bg-purple-50/60 shadow-md ring-2 ring-purple-400/30 animate-pulse-subtle"
        : "border-purple-200 bg-purple-50/20 hover:border-purple-300";
    statusBadgeClass = isSuggestedNext
      ? "bg-purple-600 text-white border-purple-600"
      : "bg-purple-100 text-purple-800 border-purple-200";
    statusLabel = isSuggestedNext ? "Next Recommended" : "Ready";
    statusIcon = isSuggestedNext ? (
      <Flame className="w-3.5 h-3.5 text-amber-300" />
    ) : (
      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
    );
  } else if (node.status === "LOCKED") {
    borderClass = "border-slate-200/60 bg-slate-50/60 opacity-60";
    statusBadgeClass = "bg-slate-100 text-slate-500 border-slate-200";
    statusLabel = "Locked";
    statusIcon = <Lock className="w-3.5 h-3.5 text-slate-400" />;
  }

  if (variant === "list") {
    return (
      <div
        onClick={onClick}
        className={`p-4 rounded-xl border transition-all cursor-pointer ${borderClass} hover:shadow-md flex items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-white shadow-xs border border-slate-100 shrink-0">
            {statusIcon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 truncate">
                {localizedTitle}
              </span>
              {node.isMandatory && (
                <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {node.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {node.scorePercentage !== null && (
            <Badge className="bg-emerald-600 text-white font-mono text-xs">
              {node.scorePercentage}%
            </Badge>
          )}
          <Badge variant="outline" className={`text-xs ${statusBadgeClass}`}>
            {statusLabel}
          </Badge>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    );
  }

  // Canvas Node
  return (
    <div
      onClick={onClick}
      className={`relative w-64 p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none text-left ${borderClass} hover:shadow-lg hover:-translate-y-0.5`}
    >
      {/* Suggested Next Pill */}
      {isSuggestedNext && (
        <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-300" />
          SUGGESTED NEXT
        </div>
      )}

      {/* Top Bar: Category & Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {node.category}
        </span>
        <Badge
          variant="outline"
          className={`text-[10px] px-2 py-0.5 flex items-center gap-1 font-semibold ${statusBadgeClass}`}
        >
          {statusIcon}
          {statusLabel}
        </Badge>
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
        {localizedTitle}
      </h4>

      {/* Description Snippet */}
      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
        {node.description}
      </p>

      {/* Bottom Bar: Score & Prerequisites */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] font-medium flex items-center gap-1 text-slate-500">
          <Clock className="w-3 h-3 text-slate-400" />~{node.estimatedHours}h
        </span>

        {node.scorePercentage !== null ? (
          <span className="font-bold text-xs text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-mono">
            {node.scorePercentage}% Verified
          </span>
        ) : (
          <span className="text-[11px] text-slate-400">
            {node.prerequisiteIds.length > 0
              ? `${node.prerequisiteIds.length} prereq`
              : "Root node"}
          </span>
        )}
      </div>
    </div>
  );
}
