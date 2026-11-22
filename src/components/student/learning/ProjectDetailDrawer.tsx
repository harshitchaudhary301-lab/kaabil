// ==============================================================================
// KAABIL (काबिल) — Project Detail & Submission Modal Component
// Displays 4-step milestones, materials, and portfolio deliverable submission form
// ==============================================================================

"use client";

import React, { useState } from "react";
import {
  X,
  Clock,
  ExternalLink,
  CheckCircle2,
  FolderGit2,
  AlertCircle,
  FileText,
  Link as LinkIcon,
  Send,
  Info,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CareerProject, StudentProjectEnrollment } from "@/types/learning-plan";

interface ProjectDetailDrawerProps {
  project: CareerProject | null;
  enrollment?: StudentProjectEnrollment | null;
  language: "en" | "hi" | "hinglish";
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (projectId: string) => Promise<void>;
  onToggleMilestone: (projectId: string, milestoneId: string, completed: boolean) => Promise<void>;
  onSubmitDeliverable: (
    projectId: string,
    submission: { submissionUrl: string; submissionNotes?: string; selfAssessedReflection?: string }
  ) => Promise<void>;
}

export function ProjectDetailDrawer({
  project,
  enrollment,
  language,
  isOpen,
  onClose,
  onEnroll,
  onToggleMilestone,
  onSubmitDeliverable,
}: ProjectDetailDrawerProps) {
  const [submissionUrl, setSubmissionUrl] = useState(enrollment?.submissionUrl || "");
  const [submissionNotes, setSubmissionNotes] = useState(enrollment?.submissionNotes || "");
  const [reflection, setReflection] = useState(enrollment?.selfAssessedReflection || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlError, setUrlError] = useState("");

  if (!isOpen || !project) return null;

  const isEnrolled = !!enrollment;
  const isSubmitted = enrollment?.status === "SUBMITTED";
  const completedMilestoneSet = new Set(enrollment?.completedMilestoneIds || []);

  const handleMilestoneClick = async (milestoneId: string) => {
    if (!isEnrolled) {
      await onEnroll(project.id);
    }
    const isChecked = completedMilestoneSet.has(milestoneId);
    await onToggleMilestone(project.id, milestoneId, !isChecked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.trim()) {
      setUrlError("Please provide a valid deliverable URL (e.g. GitHub repo, PDF link, or Figma prototype).");
      return;
    }
    setUrlError("");
    try {
      setIsSubmitting(true);
      await onSubmitDeliverable(project.id, {
        submissionUrl: submissionUrl.trim(),
        submissionNotes: submissionNotes.trim() || undefined,
        selfAssessedReflection: reflection.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-purple-100 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-purple-50/80 via-white to-indigo-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs font-semibold">
                {project.streamTitle}
              </Badge>
              <Badge variant="outline" className="border-gray-200 text-xs text-gray-600">
                <Clock className="mr-1 h-3 w-3" />
                {project.estimatedHours} Hours
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                {project.difficulty}
              </Badge>
            </div>
            <h2 className="mt-1.5 text-lg sm:text-xl font-bold text-gray-900">
              {project.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {/* Objective & Context */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Project Objective
            </h4>
            <p className="mt-1 text-sm text-gray-700 leading-relaxed">
              {project.objective}
            </p>
            <div className="mt-2 text-xs text-gray-500 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              💡 <strong>Real-World Context:</strong> {project.realWorldContext}
            </div>
          </div>

          {/* Required Skills & Recommended Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5">
              <h5 className="text-xs font-bold text-gray-900 mb-2">Required Skills</h5>
              <div className="flex flex-wrap gap-1.5">
                {project.requiredSkills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-white text-gray-800 border border-gray-200 text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5">
              <h5 className="text-xs font-bold text-gray-900 mb-2">Recommended Tools</h5>
              <div className="flex flex-wrap gap-1.5">
                {project.recommendedTools.map((tool, idx) => (
                  <Badge key={idx} variant="outline" className="bg-white text-purple-700 border-purple-200 text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Step-by-Step Milestones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Step-by-Step Milestones ({completedMilestoneSet.size} / {project.milestones.length})
              </h4>
              {!isEnrolled && (
                <Button
                  size="sm"
                  onClick={() => onEnroll(project.id)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7"
                >
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Start & Track Project
                </Button>
              )}
            </div>

            <div className="space-y-2.5">
              {project.milestones.map((m) => {
                const isChecked = completedMilestoneSet.has(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => handleMilestoneClick(m.id)}
                    className={`flex items-start space-x-3 rounded-xl border p-3.5 transition-colors cursor-pointer ${
                      isChecked
                        ? "border-emerald-200 bg-emerald-50/40"
                        : "border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/20"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-colors ${
                        isChecked
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-gray-300 bg-white text-transparent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${isChecked ? "text-emerald-900 line-through" : "text-gray-900"}`}>
                          Step {m.stepNumber}: {m.title}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-600 leading-relaxed">
                        {m.description}
                      </p>
                      <div className="mt-1 text-[11px] text-purple-700 font-medium">
                        Deliverable: {m.deliverableHint}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reference Materials / Resources */}
          {project.materialsOrResources && project.materialsOrResources.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-purple-50/30 p-3.5">
              <h5 className="text-xs font-bold text-gray-900 mb-2">Curated Project Resources</h5>
              <div className="space-y-1.5">
                {project.materialsOrResources.map((res, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">
                      • <strong>{res.name}</strong> <span className="text-gray-500">({res.note})</span>
                    </span>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-purple-600 hover:text-purple-800 ml-2 font-medium"
                    >
                      Link <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deliverable Submission Form */}
          <div className="rounded-xl border-2 border-purple-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-gray-900 flex items-center">
                <FolderGit2 className="mr-1.5 h-4 w-4 text-purple-600" />
                Submit Project Deliverable
              </h4>
              {isSubmitted && (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                  Submitted ✓
                </Badge>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Deliverable URL (GitHub repo, live deployment, Google Drive PDF, or Figma link) *
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://github.com/... or https://..."
                    className="pl-9 text-xs sm:text-sm"
                  />
                </div>
                {urlError && <p className="mt-1 text-xs text-red-600">{urlError}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Implementation Notes & Approach (Optional)
                </label>
                <textarea
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Describe your design choices, trade-offs, or challenges encountered..."
                  rows={2}
                  className="w-full rounded-md border border-gray-300 p-2 text-xs sm:text-sm text-gray-800 focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Self-Reflection & Key Takeaway (Optional)
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What was the most important lesson you learned building this?"
                  rows={2}
                  className="w-full rounded-md border border-gray-300 p-2 text-xs sm:text-sm text-gray-800 focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              {/* Provenance Integrity Notice */}
              <div className="rounded-lg bg-amber-50/80 border border-amber-200 p-2.5 text-[11px] text-amber-800 leading-normal flex items-start space-x-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Zero-Fabrication Notice:</strong> Submitting this project records a practical deliverable in your KAABIL portfolio as a <em>Self-Directed Project</em>. It does not automatically grant external verification or change your verified credential score.
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs sm:text-sm"
                >
                  <Send className="mr-1.5 h-4 w-4" />
                  {isSubmitting
                    ? "Submitting..."
                    : isSubmitted
                    ? "Update Submission"
                    : "Submit to Portfolio"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50/80 px-6 py-3 flex justify-end">
          <Button variant="outline" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
