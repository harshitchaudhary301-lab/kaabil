// ==============================================================================
// KAABIL (काबिल) — Skill Tree Canvas Component
// Multi-tier SVG and Node layout with interactive connecting bezier paths
// ==============================================================================

import React, { useRef, useState, useEffect } from "react";
import {
  Sparkles,
  Layers,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from "lucide-react";
import { CareerSkillTreeData, SkillTreeNode, SkillTreeNodeStage } from "@/types/skills";
import { SkillNodeCard } from "./SkillNodeCard";

interface SkillTreeCanvasProps {
  treeData: CareerSkillTreeData;
  language: "en" | "hi" | "hinglish";
  onSelectNode: (node: SkillTreeNode) => void;
}

export function SkillTreeCanvas({
  treeData,
  language,
  onSelectNode,
}: SkillTreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [stageFilter, setStageFilter] = useState<string>("ALL");

  const stages: { key: SkillTreeNodeStage; title: string; subtitle: string; color: string }[] = [
    {
      key: "FOUNDATION",
      title: "1. Foundation Tier",
      subtitle: "Root academic concepts & essential basics",
      color: "from-purple-500/10 to-indigo-500/10 border-purple-200",
    },
    {
      key: "INTERMEDIATE",
      title: "2. Intermediate Tier",
      subtitle: "Hands-on tools & applied workflows",
      color: "from-blue-500/10 to-cyan-500/10 border-blue-200",
    },
    {
      key: "ADVANCED",
      title: "3. Advanced Tier",
      subtitle: "Specializations & statutory standards",
      color: "from-emerald-500/10 to-teal-500/10 border-emerald-200",
    },
  ];

  return (
    <div className="relative w-full rounded-2xl border border-purple-100 bg-gradient-to-b from-slate-50/50 via-white to-purple-50/20 overflow-hidden shadow-xs">
      {/* Canvas Controls Top Bar */}
      <div className="px-6 py-3 border-b border-purple-100/80 bg-white/80 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-600" />
            Progression Tiers
          </span>
          <div className="flex items-center gap-1 ml-2">
            {["ALL", "FOUNDATION", "INTERMEDIATE", "ADVANCED"].map((tier) => (
              <button
                key={tier}
                onClick={() => setStageFilter(tier)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  stageFilter === tier
                    ? "bg-purple-700 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tier === "ALL" ? "All Stages" : tier.charAt(0) + tier.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Mastered / Verified
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Claimed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Ready
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Locked
          </span>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto p-6 md:p-8 min-h-[580px]"
      >
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start min-w-[760px] md:min-w-0"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
        >
          {stages
            .filter((s) => stageFilter === "ALL" || stageFilter === s.key)
            .map((tier) => {
              const nodesInTier = treeData.nodes.filter((n) => n.stage === tier.key);
              const stageData = treeData.stages.find((s) => s.stage === tier.key);

              return (
                <div
                  key={tier.key}
                  className={`p-5 rounded-2xl border bg-gradient-to-b ${tier.color} transition-all`}
                >
                  {/* Tier Header */}
                  <div className="mb-5 pb-3 border-b border-purple-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 tracking-tight">
                        {tier.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {tier.subtitle}
                      </p>
                    </div>
                    {stageData && (
                      <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        {stageData.masteryPercent}%
                      </span>
                    )}
                  </div>

                  {/* Nodes Stack */}
                  <div className="space-y-4">
                    {nodesInTier.map((node) => {
                      const isSuggested = treeData.suggestedNextSkill?.id === node.id;
                      return (
                        <div key={node.id} className="flex justify-center">
                          <SkillNodeCard
                            node={node}
                            isSuggestedNext={isSuggested}
                            language={language}
                            onClick={() => onSelectNode(node)}
                            variant="canvas"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Floating Canvas Footer Note */}
      <div className="px-6 py-2.5 border-t border-purple-100 bg-white/60 text-slate-400 text-[11px] flex items-center justify-between">
        <span>Click any node to view prerequisites, verified scores, and next learning actions.</span>
        <span className="font-mono text-[10px]">KAABIL Competency Graph v2.0</span>
      </div>
    </div>
  );
}
