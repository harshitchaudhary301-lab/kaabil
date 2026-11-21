"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  PlusCircle,
  Award,
  Users,
  FileCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  Briefcase,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IndustryChallengeRecord, ChallengeSubmissionRecord } from "@/types/employer";
import { EducationalStream } from "@/types";

export default function EmployerChallengesPage() {
  const [challenges, setChallenges] = useState<IndustryChallengeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Create Challenge Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    category: "PRACTICAL_PROJECT" as any,
    stream: "MEDICAL_PCB" as EducationalStream,
    difficulty: "INTERMEDIATE" as any,
    description: "",
    problemStatement: "",
    deliverables: "Diagnostic Protocol Document, Analytical Validation Report",
    requiredSkills: "Biochemistry, Clinical Pathology, Quality Control",
    rewardCredentialTitle: "Certified Clinical Biochemistry Analyst",
  });

  // Review Submissions Modal
  const [reviewChallenge, setReviewChallenge] = useState<IndustryChallengeRecord | null>(null);
  const [submissions, setSubmissions] = useState<ChallengeSubmissionRecord[]>([]);
  const [selectedSub, setSelectedSub] = useState<ChallengeSubmissionRecord | null>(null);
  const [evalScore, setEvalScore] = useState<number>(85);
  const [evalFeedback, setEvalFeedback] = useState<string>("");
  const [evalDecision, setEvalDecision] = useState<"APPROVED" | "REVISION_REQUESTED" | "REJECTED">("APPROVED");
  const [submittingEval, setSubmittingEval] = useState<boolean>(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/challenges");
      const data = await res.json();
      if (data.success) {
        setChallenges(data.challenges || []);
      }
    } catch (err) {
      console.error("Failed to load challenges", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/employer/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          deliverables: createForm.deliverables.split(",").map((s) => s.trim()),
          requiredSkills: createForm.requiredSkills.split(",").map((s) => s.trim()),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        fetchChallenges();
      }
    } catch (err) {
      console.error("Failed to create challenge", err);
    }
  };

  const openSubmissionsReview = async (challenge: IndustryChallengeRecord) => {
    setReviewChallenge(challenge);
    try {
      const res = await fetch(`/api/employer/challenges/${challenge.id}`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error("Failed to load submissions", err);
    }
  };

  const handleEvaluateSubmission = async () => {
    if (!selectedSub || !reviewChallenge) return;
    setSubmittingEval(true);
    try {
      const res = await fetch(`/api/employer/challenges/${reviewChallenge.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          score: evalScore,
          feedback: evalFeedback || "Submission approved with verified evidence issued.",
          decision: evalDecision,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedSub(null);
        openSubmissionsReview(reviewChallenge);
        fetchChallenges();
      }
    } catch (err) {
      console.error("Failed to evaluate submission", err);
    } finally {
      setSubmittingEval(false);
    }
  };

  return (
    <PortalLayout
      portalName="Employer Portal"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Employer", "Industry Challenges"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Industry Challenge Hub</h1>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">Verified Minting</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Host stream-specific industry challenges, review deliverables, and issue cryptographically verifiable Skill Evidence & Credentials.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium text-sm"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusCircle className="h-4 w-4" />
              Publish Challenge
            </Button>
          </div>
        </div>

        {/* Challenges Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading industry challenges...</div>
        ) : challenges.length === 0 ? (
          <Card className="border-slate-200 p-8 text-center">
            <CardContent className="space-y-3">
              <Award className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="font-semibold text-slate-800">No industry challenges published yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Create practical challenges in medical, engineering, commerce, or legal streams to evaluate candidates on real-world projects.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                Create First Challenge
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {challenges.map((chal) => (
              <Card
                key={chal.id}
                className="border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 line-clamp-1">{chal.title}</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">{chal.stream.replace(/_/g, " ")}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] uppercase font-bold ${
                        chal.difficulty === "ADVANCED"
                          ? "bg-purple-100 text-purple-800"
                          : chal.difficulty === "INTERMEDIATE"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {chal.difficulty}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{chal.description}</p>

                  {/* Required skills */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Target Competencies
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {chal.requiredSkills.map((s, idx) => (
                        <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Reward Credential */}
                  <div className="p-2.5 bg-purple-50/50 rounded-lg border border-purple-100 text-xs">
                    <div className="font-semibold text-purple-900 flex items-center gap-1.5 text-[11px]">
                      <Award className="h-3.5 w-3.5 text-purple-600" />
                      Credential Awarded:
                    </div>
                    <div className="text-slate-800 font-medium mt-0.5">{chal.rewardCredentialTitle}</div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {chal.totalParticipants || 0} enrolled
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-blue-700">
                      <FileCheck className="h-3.5 w-3.5" />
                      {chal.totalSubmissions || 0} submissions
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      size="sm"
                      className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => openSubmissionsReview(chal)}
                    >
                      Review Submissions ({chal.totalSubmissions || 0})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Challenge Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Publish Industry Challenge</h3>
                  <p className="text-xs text-slate-500">Design a real-world case study or practical problem</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateChallenge} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Challenge Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clinical Chemistry Diagnostic Case Challenge"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    className="w-full p-2.5 rounded-md border border-slate-300 text-xs focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Educational Stream</label>
                    <select
                      value={createForm.stream}
                      onChange={(e) => setCreateForm({ ...createForm, stream: e.target.value as EducationalStream })}
                      className="w-full rounded-md border-slate-300 py-2 pl-3 text-xs focus:ring-blue-500"
                    >
                      <option value="MEDICAL_PCB">Medical & Life Sciences (PCB)</option>
                      <option value="NON_MEDICAL_PCM">Engineering & Tech (PCM)</option>
                      <option value="COMMERCE">Commerce & Finance</option>
                      <option value="LEGAL_STUDIES">Law & Judiciary</option>
                      <option value="MANAGEMENT">Business & Strategy</option>
                      <option value="AGRICULTURE">Agriculture</option>
                      <option value="CREATIVE_DESIGN">Design</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Difficulty Level</label>
                    <select
                      value={createForm.difficulty}
                      onChange={(e) => setCreateForm({ ...createForm, difficulty: e.target.value as any })}
                      className="w-full rounded-md border-slate-300 py-2 pl-3 text-xs focus:ring-blue-500"
                    >
                      <option value="BEGINNER">Beginner (Foundational)</option>
                      <option value="INTERMEDIATE">Intermediate (Applied)</option>
                      <option value="ADVANCED">Advanced (Industry-Ready)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Brief Overview</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide an engaging summary for prospective applicants..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full p-2 rounded-md border border-slate-300 text-xs focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Problem Statement & Scope</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detail the case facts, data set, clinical scenario, or technical problem..."
                    value={createForm.problemStatement}
                    onChange={(e) => setCreateForm({ ...createForm, problemStatement: e.target.value })}
                    className="w-full p-2 rounded-md border border-slate-300 text-xs focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Deliverables Expected (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={createForm.deliverables}
                    onChange={(e) => setCreateForm({ ...createForm, deliverables: e.target.value })}
                    className="w-full p-2 rounded-md border border-slate-300 text-xs focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Target Competencies Evaluated (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={createForm.requiredSkills}
                    onChange={(e) => setCreateForm({ ...createForm, requiredSkills: e.target.value })}
                    className="w-full p-2 rounded-md border border-slate-300 text-xs focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reward Credential Title</label>
                  <input
                    type="text"
                    value={createForm.rewardCredentialTitle}
                    onChange={(e) => setCreateForm({ ...createForm, rewardCredentialTitle: e.target.value })}
                    className="w-full p-2 rounded-md border border-slate-300 text-xs focus:ring-blue-500 font-semibold"
                  />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Publish & Open Registration
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Review Submissions Drawer/Modal */}
        {reviewChallenge && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Submissions: {reviewChallenge.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review deliverables and issue verified Digital Skill Passport credentials
                  </p>
                </div>
                <button
                  onClick={() => {
                    setReviewChallenge(null);
                    setSelectedSub(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {submissions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No candidate submissions recorded for this challenge yet.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="divide-y divide-slate-100">
                    {submissions.map((sub) => (
                      <div key={sub.id} className="py-3 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{sub.studentName}</span>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] uppercase font-bold ${
                                sub.status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : sub.status === "REVISION_REQUESTED"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {sub.status}
                            </Badge>
                            {sub.score && <span className="font-bold text-xs text-blue-700">{sub.score}/100</span>}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{sub.summary}</p>
                          <a
                            href={sub.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-mono text-[11px] flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {sub.submissionUrl}
                          </a>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-slate-300 shrink-0"
                          onClick={() => setSelectedSub(sub)}
                        >
                          Grade Deliverable
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Deliverable Evaluation Form */}
                  {selectedSub && (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 text-xs">
                      <div className="font-bold text-slate-800">
                        Grade Deliverable: {selectedSub.studentName}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">
                            Score (0 - 100): <span className="text-blue-600 font-bold">{evalScore}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={evalScore}
                            onChange={(e) => setEvalScore(parseInt(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Decision</label>
                          <select
                            value={evalDecision}
                            onChange={(e) => setEvalDecision(e.target.value as any)}
                            className="w-full rounded-md border-slate-300 py-1.5 pl-2 text-xs font-semibold focus:ring-blue-500"
                          >
                            <option value="APPROVED">Approve & Award Credential</option>
                            <option value="REVISION_REQUESTED">Request Revision</option>
                            <option value="REJECTED">Reject Deliverable</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Reviewer Feedback</label>
                        <textarea
                          rows={2}
                          value={evalFeedback}
                          onChange={(e) => setEvalFeedback(e.target.value)}
                          placeholder="Comprehensive analysis demonstrated with clear methodology..."
                          className="w-full p-2 rounded-md border border-slate-300 text-xs focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedSub(null)}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={submittingEval}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                          onClick={handleEvaluateSubmission}
                        >
                          {submittingEval ? "Minting..." : "Save & Mint Credential"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
