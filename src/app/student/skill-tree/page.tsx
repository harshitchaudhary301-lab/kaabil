"use client";

// ==============================================================================
// KAABIL (काबिल) — Dynamic Career Skill Tree Page
// Interactive mastery graph across all 134 pathways with authentic evidence
// ==============================================================================

import React, { useState, useEffect } from "react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { SkillTreeHeader } from "@/components/student/skill-tree/SkillTreeHeader";
import { SkillTreeCanvas } from "@/components/student/skill-tree/SkillTreeCanvas";
import { SkillListView } from "@/components/student/skill-tree/SkillListView";
import { SkillNodeDetailModal } from "@/components/student/skill-tree/SkillNodeDetailModal";
import { CareerSkillTreeData, SkillTreeNode } from "@/types/skills";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CareerSkillTreePage() {
  const [treeData, setTreeData] = useState<CareerSkillTreeData | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string>("ai-systems-engineer");
  const [studentTargetCareer, setStudentTargetCareer] = useState<string>("ai-systems-engineer");
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [selectedNode, setSelectedNode] = useState<SkillTreeNode | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingTarget, setSavingTarget] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial profile to identify student's active target career
  useEffect(() => {
    async function loadStudentProfile() {
      try {
        const res = await fetch("/api/student/profile");
        const data = await res.json();
        if (data.success && data.profile?.targetCareer?.slug) {
          const slug = data.profile.targetCareer.slug;
          setStudentTargetCareer(slug);
          setSelectedCareer(slug);
        }
      } catch {
        // Fallback to default
      }
    }
    loadStudentProfile();
  }, []);

  // Fetch skill tree data whenever selected career changes
  const fetchSkillTree = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/student/skill-tree?careerSlug=${slug}`);
      const data = await res.json();

      if (data.success && data.tree) {
        setTreeData(data.tree);
      } else {
        setError(data.error || "Could not generate skill tree for this career.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load skill tree.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCareer) {
      fetchSkillTree(selectedCareer);
    }
  }, [selectedCareer]);

  // Set as target career handler (preserves all achievements!)
  const handleSetAsTargetCareer = async () => {
    try {
      setSavingTarget(true);
      const res = await fetch("/api/student/skill-tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCareerSlug: selectedCareer,
          setAsTargetCareer: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStudentTargetCareer(selectedCareer);
        if (data.tree) {
          setTreeData(data.tree);
        }
      }
    } catch (err) {
      console.error("Failed to update target career:", err);
    } finally {
      setSavingTarget(false);
    }
  };

  const handleNodeClick = (node: SkillTreeNode) => {
    setSelectedNode(node);
    setModalOpen(true);
  };

  const handleSelectPrerequisite = (nodeId: string) => {
    if (!treeData) return;
    const target = treeData.nodes.find((n) => n.id === nodeId);
    if (target) {
      setSelectedNode(target);
    }
  };

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
    >
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Loading State */}
        {loading && !treeData && (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">
              Generating dynamic competency graph for {selectedCareer}...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Failed to generate skill tree</h4>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSkillTree(selectedCareer)}
              className="bg-white border-rose-200 text-rose-800 hover:bg-rose-100"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Retry
            </Button>
          </div>
        )}

        {/* Main Content */}
        {treeData && (
          <>
            {/* Header with Career Switcher, Metrics, and Next Step Banner */}
            <SkillTreeHeader
              treeData={treeData}
              activeCareerSlug={selectedCareer}
              isStudentTargetCareer={selectedCareer === studentTargetCareer}
              viewMode={viewMode}
              language={language}
              onCareerChange={(slug) => setSelectedCareer(slug)}
              onSetAsTargetCareer={handleSetAsTargetCareer}
              onViewModeChange={(mode) => setViewMode(mode)}
              onLanguageChange={(lang) => setLanguage(lang)}
              savingTarget={savingTarget}
            />

            {/* View Mode Switching: Interactive Canvas vs Accessible List */}
            {viewMode === "tree" ? (
              <SkillTreeCanvas
                treeData={treeData}
                language={language}
                onSelectNode={handleNodeClick}
              />
            ) : (
              <SkillListView
                treeData={treeData}
                language={language}
                onSelectNode={handleNodeClick}
              />
            )}

            {/* Node Detail Modal / Drawer */}
            <SkillNodeDetailModal
              node={selectedNode}
              allNodes={treeData.nodes}
              language={language}
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onSelectNode={handleSelectPrerequisite}
            />
          </>
        )}
      </div>
    </PortalLayout>
  );
}
