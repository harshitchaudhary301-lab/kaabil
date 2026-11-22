// ==============================================================================
// KAABIL (काबिल) — Skill Node Detail Modal / Drawer
// Explains node prerequisites, student evidence, verification, and next steps
// ==============================================================================

import React from "react";
import Link from "next/link";
import {
  X,
  ShieldCheck,
  Award,
  AlertTriangle,
  Lock,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillTreeNode } from "@/types/skills";

interface SkillNodeDetailModalProps {
  node: SkillTreeNode | null;
  allNodes: SkillTreeNode[];
  language: "en" | "hi" | "hinglish";
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
}

export function SkillNodeDetailModal({
  node,
  allNodes,
  language,
  isOpen,
  onClose,
  onSelectNode,
}: SkillNodeDetailModalProps) {
  if (!isOpen || !node) return null;

  // Resolve localized text
  const title =
    language === "hi"
      ? node.nameHi || node.name
      : language === "hinglish"
      ? node.nameHinglish || node.name
      : node.name;

  const description =
    language === "hi"
      ? node.descriptionHi || node.description
      : language === "hinglish"
      ? node.descriptionHinglish || node.description
      : node.description;

  // Resolve prerequisites
  const prerequisites = node.prerequisiteIds
    .map((pid) => allNodes.find((n) => n.id === pid))
    .filter(Boolean) as SkillTreeNode[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden">
        {/* Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
                {node.stage} STAGE
              </span>
              <span className="text-xs text-purple-200 font-medium">
                {node.category}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="mt-2 text-xl font-bold tracking-tight text-white flex items-center gap-2">
            {title}
            {node.status === "MASTERED" && (
              <span title="Mastered with verified proof">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </span>
            )}
          </h3>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Status Alert Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              node.status === "MASTERED"
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : node.status === "VERIFIED"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : node.status === "SELF_REPORTED"
                ? "bg-amber-50 border-amber-200 text-amber-950"
                : node.status === "IN_PROGRESS"
                ? "bg-blue-50 border-blue-200 text-blue-950"
                : node.status === "READY_TO_LEARN"
                ? "bg-purple-50 border-purple-200 text-purple-950"
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            {node.status === "MASTERED" || node.status === "VERIFIED" ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            ) : node.status === "SELF_REPORTED" ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            ) : node.status === "LOCKED" ? (
              <Lock className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
            )}

            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                {node.status === "MASTERED" && "Skill Mastered & Verified"}
                {node.status === "VERIFIED" && "Skill Verified via Diagnostic"}
                {node.status === "SELF_REPORTED" && "Self-Reported (Unverified)"}
                {node.status === "IN_PROGRESS" && "Currently In Progress"}
                {node.status === "READY_TO_LEARN" && "Ready to Learn & Verify"}
                {node.status === "LOCKED" && "Prerequisites Required"}
                {node.scorePercentage !== null && (
                  <Badge className="bg-emerald-600 text-white font-mono text-xs">
                    {node.scorePercentage}% Score
                  </Badge>
                )}
              </div>
              <p className="text-xs mt-1 opacity-90 leading-relaxed">
                {node.status === "MASTERED" &&
                  "You have demonstrated proficiency on the KAABIL platform. Verified evidence is preserved in your Digital Passport."}
                {node.status === "VERIFIED" &&
                  "Verified through platform assessment. Ready for advanced mastery challenges."}
                {node.status === "SELF_REPORTED" &&
                  "You reported this skill on your profile. Take an authentic diagnostic challenge to verify it and boost your Career Readiness Index."}
                {node.status === "IN_PROGRESS" &&
                  "You have attempted or started modules for this skill. Continue your learning path to complete verification."}
                {node.status === "READY_TO_LEARN" &&
                  "All foundation prerequisites are met. This is an optimal next skill to develop."}
                {node.status === "LOCKED" &&
                  "Unlock the prerequisites below before beginning this intermediate/advanced skill."}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Competency Focus
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
              <span className="text-xs text-purple-700 font-medium block">
                Estimated Time
              </span>
              <span className="text-sm font-bold text-purple-900 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-purple-600" />
                ~{node.estimatedHours} Hours
              </span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-xs text-indigo-700 font-medium block">
                Career Importance
              </span>
              <span className="text-sm font-bold text-indigo-900 flex items-center gap-1.5 mt-0.5">
                <Award className="w-4 h-4 text-indigo-600" />
                {node.importanceWeight >= 2.9
                  ? "Crucial Benchmark"
                  : node.importanceWeight >= 2.6
                  ? "High Value"
                  : "Recommended"}
              </span>
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Prerequisite Skills ({prerequisites.length})
            </h4>
            {prerequisites.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                None — This is a root foundational skill with no prior requirements.
              </p>
            ) : (
              <div className="space-y-1.5">
                {prerequisites.map((prereq) => {
                  const isMet =
                    prereq.status === "MASTERED" ||
                    prereq.status === "VERIFIED" ||
                    prereq.status === "IN_PROGRESS" ||
                    prereq.status === "SELF_REPORTED";
                  return (
                    <button
                      key={prereq.id}
                      onClick={() => onSelectNode(prereq.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors text-xs ${
                        isMet
                          ? "bg-emerald-50/50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/50"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isMet ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="font-semibold">{prereq.name}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          isMet
                            ? "bg-white text-emerald-700 border-emerald-300"
                            : "bg-white text-slate-600 border-slate-300"
                        }
                      >
                        {prereq.status.replace("_", " ")}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Verification / Evidence Information */}
          {node.verifier && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Verification Source: </span>
              {node.verifier}
              {node.verifiedAt && (
                <span className="block mt-0.5 text-slate-400">
                  Verified on {new Date(node.verifiedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-lg">
            Close
          </Button>

          {node.status === "MASTERED" || node.status === "VERIFIED" ? (
            <Link href="/student/passport">
              <Button
                size="sm"
                className="bg-purple-700 hover:bg-purple-800 text-white rounded-lg shadow-sm"
              >
                <Award className="w-4 h-4 mr-1.5" />
                View in Passport
              </Button>
            </Link>
          ) : node.status === "SELF_REPORTED" ? (
            <Link href="/student/assessments">
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Verify This Skill
              </Button>
            </Link>
          ) : node.status === "READY_TO_LEARN" ? (
            <Link href="/student/roadmap">
              <Button
                size="sm"
                className="bg-purple-700 hover:bg-purple-800 text-white rounded-lg shadow-sm"
              >
                <BookOpen className="w-4 h-4 mr-1.5" />
                Start Learning in Roadmap
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              disabled
              className="rounded-lg opacity-75"
            >
              <Lock className="w-4 h-4 mr-1.5" />
              Complete Prerequisites First
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
