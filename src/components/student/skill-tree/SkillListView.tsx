// ==============================================================================
// KAABIL (काबिल) — Accessible Skill List View Component
// High-contrast, screen-reader friendly structured view of the skill tree
// ==============================================================================

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { CareerSkillTreeData, SkillTreeNode, SkillTreeNodeStage } from "@/types/skills";
import { SkillNodeCard } from "./SkillNodeCard";
import { Badge } from "@/components/ui/badge";

interface SkillListViewProps {
  treeData: CareerSkillTreeData;
  language: "en" | "hi" | "hinglish";
  onSelectNode: (node: SkillTreeNode) => void;
}

export function SkillListView({
  treeData,
  language,
  onSelectNode,
}: SkillListViewProps) {
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});

  const toggleStage = (stage: string) => {
    setCollapsedStages((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  const stages: { key: SkillTreeNodeStage; title: string; subtitle: string }[] = [
    {
      key: "FOUNDATION",
      title: "Foundation Tier",
      subtitle: "Root academic concepts & fundamental skills",
    },
    {
      key: "INTERMEDIATE",
      title: "Intermediate Tier",
      subtitle: "Applied workflows & practical tools",
    },
    {
      key: "ADVANCED",
      title: "Advanced Tier",
      subtitle: "Specializations & regulatory standards",
    },
  ];

  return (
    <div className="space-y-6">
      {stages.map((tier) => {
        const nodesInTier = treeData.nodes.filter((n) => n.stage === tier.key);
        const stageData = treeData.stages.find((s) => s.stage === tier.key);
        const isCollapsed = collapsedStages[tier.key] ?? false;

        return (
          <div
            key={tier.key}
            className="rounded-2xl border border-purple-100 bg-white overflow-hidden shadow-xs"
          >
            {/* Stage Accordion Header */}
            <button
              onClick={() => toggleStage(tier.key)}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-50/60 to-white flex items-center justify-between text-left hover:bg-purple-50/90 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
                    {tier.title}
                    <Badge variant="outline" className="text-xs bg-white text-purple-700 border-purple-200">
                      {nodesInTier.length} Skills
                    </Badge>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{tier.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {stageData && (
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-slate-400 block font-medium">Mastery</span>
                    <span className="text-sm font-bold font-mono text-purple-700">
                      {stageData.masteryPercent}%
                    </span>
                  </div>
                )}
                {isCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Stage Node List */}
            {!isCollapsed && (
              <div className="p-6 pt-3 space-y-3 bg-white divide-y divide-slate-100">
                {nodesInTier.map((node) => {
                  const isSuggested = treeData.suggestedNextSkill?.id === node.id;
                  return (
                    <div key={node.id} className="pt-3 first:pt-0">
                      <SkillNodeCard
                        node={node}
                        isSuggestedNext={isSuggested}
                        language={language}
                        onClick={() => onSelectNode(node)}
                        variant="list"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
