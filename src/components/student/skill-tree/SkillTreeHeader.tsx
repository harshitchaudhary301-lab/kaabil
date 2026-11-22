// ==============================================================================
// KAABIL (काबिल) — Skill Tree Header & Controls Component
// Career selector across all 134 pathways, trilingual toggle, view mode switcher
// ==============================================================================

import React, { useState } from "react";
import {
  Sparkles,
  Compass,
  Layers,
  List,
  Languages,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Flame,
  ArrowRight,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CareerSkillTreeData } from "@/types/skills";
import { CAREER_PATHS_DATABASE } from "@/data/careersData";

interface SkillTreeHeaderProps {
  treeData: CareerSkillTreeData;
  activeCareerSlug: string;
  isStudentTargetCareer: boolean;
  viewMode: "tree" | "list";
  language: "en" | "hi" | "hinglish";
  onCareerChange: (slug: string) => void;
  onSetAsTargetCareer: () => void;
  onViewModeChange: (mode: "tree" | "list") => void;
  onLanguageChange: (lang: "en" | "hi" | "hinglish") => void;
  savingTarget: boolean;
}

export function SkillTreeHeader({
  treeData,
  activeCareerSlug,
  isStudentTargetCareer,
  viewMode,
  language,
  onCareerChange,
  onSetAsTargetCareer,
  onViewModeChange,
  onLanguageChange,
  savingTarget,
}: SkillTreeHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Group careers by stream
  const filteredCareers = CAREER_PATHS_DATABASE.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.streamTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domainName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Career Title & Controls */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-200/80 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 shadow-xl">
        {/* Pixel Art Sunset Glow Decorator */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-amber-500/10 via-purple-500/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-2 right-4 text-xs font-mono text-purple-300/40 select-none">
          ✦ KAABIL SKILL TREE ✦
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/30 backdrop-blur-sm">
                {treeData.streamTitle}
              </span>
              {treeData.regulatoryBody && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/10">
                  {treeData.regulatoryBody} Standards
                </span>
              )}
              {isStudentTargetCareer && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  My Active Target Career
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              {treeData.careerTitle}
            </h1>
            <p className="text-sm text-purple-200/80 max-w-2xl leading-relaxed">
              Explore your prerequisite skill graph, verified mastery nodes, and actionable next steps
              tailored to this career pathway.
            </p>
          </div>

          {/* Right Side Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Career Selector Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl text-xs backdrop-blur-sm"
              >
                <Compass className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
                Change Career (134 Available)
              </Button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 max-h-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-purple-100 z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any of 134 careers..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    autoFocus
                  />
                  <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                    {filteredCareers.map((c) => (
                      <button
                        key={c.slug}
                        onClick={() => {
                          onCareerChange(c.slug);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          c.slug === activeCareerSlug
                            ? "bg-purple-100 text-purple-900 font-bold"
                            : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <span className="truncate pr-2">{c.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {c.streamTitle?.split(" ")[0] || "Stream"}
                        </span>
                      </button>
                    ))}
                    {filteredCareers.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">
                        No careers match your search.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Set as Target Career Button */}
            {!isStudentTargetCareer && (
              <Button
                size="sm"
                onClick={onSetAsTargetCareer}
                disabled={savingTarget}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                <BookmarkCheck className="w-3.5 h-3.5 mr-1.5" />
                {savingTarget ? "Saving..." : "Set as Target Career"}
              </Button>
            )}

            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-white/10 p-0.5 border border-white/20">
              <button
                onClick={() => onViewModeChange("tree")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === "tree"
                    ? "bg-white text-purple-900 shadow-xs"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Tree
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-purple-900 shadow-xs"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex rounded-xl bg-white/10 p-0.5 border border-white/20 text-xs">
              <button
                onClick={() => onLanguageChange("en")}
                className={`px-2 py-1 rounded-lg font-semibold transition-colors ${
                  language === "en" ? "bg-white text-purple-900" : "text-white/80"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange("hi")}
                className={`px-2 py-1 rounded-lg font-semibold transition-colors ${
                  language === "hi" ? "bg-white text-purple-900" : "text-white/80"
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => onLanguageChange("hinglish")}
                className={`px-2 py-1 rounded-lg font-semibold transition-colors ${
                  language === "hinglish" ? "bg-white text-purple-900" : "text-white/80"
                }`}
              >
                Hinglish
              </button>
            </div>
          </div>
        </div>

        {/* Real Evidence Metrics Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-purple-200 font-medium block">Verified Mastery</span>
            <span className="text-2xl font-extrabold text-white font-mono mt-0.5 block">
              {treeData.overallMasteryPercent}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-purple-200 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Skills
            </span>
            <span className="text-xl font-bold text-emerald-300 font-mono mt-0.5 block">
              {treeData.verifiedSkillsCount} / {treeData.totalSkillsCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-purple-200 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Self-Reported
            </span>
            <span className="text-xl font-bold text-amber-300 font-mono mt-0.5 block">
              {treeData.selfReportedSkillsCount} Unverified
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-purple-200 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              In Progress
            </span>
            <span className="text-xl font-bold text-blue-300 font-mono mt-0.5 block">
              {treeData.inProgressSkillsCount} Skills
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 col-span-2 md:col-span-1">
            <span className="text-[11px] text-purple-200 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-300" />
              Missing / Locked
            </span>
            <span className="text-xl font-bold text-slate-300 font-mono mt-0.5 block">
              {treeData.missingSkillsCount} Skills
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Next Skill Callout Card */}
      {treeData.suggestedNextSkill && (
        <div className="p-5 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-indigo-50/40 to-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-sm shrink-0 mt-0.5">
              <Flame className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  Optimal Next Recommendation
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
                  {treeData.suggestedNextSkill.stage}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {language === "hi"
                  ? treeData.suggestedNextSkill.nameHi || treeData.suggestedNextSkill.name
                  : language === "hinglish"
                  ? treeData.suggestedNextSkill.nameHinglish || treeData.suggestedNextSkill.name
                  : treeData.suggestedNextSkill.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {treeData.suggestedNextSkill.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a href="/student/roadmap">
              <Button
                size="sm"
                className="bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                Start Next Skill in Roadmap
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
