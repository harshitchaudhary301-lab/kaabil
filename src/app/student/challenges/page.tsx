"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Send,
  Users,
  ChevronRight,
  Filter,
  AlertTriangle,
  Building,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IndustryChallengeRecord, ChallengeSubmissionRecord } from "@/types/employer";

export default function StudentChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMinor, setIsMinor] = useState<boolean>(false);
  const [minorNotice, setMinorNotice] = useState<string | null>(null);

  // Submit Modal
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/challenges");
      const data = await res.json();
      if (data.success) {
        setChallenges(data.challenges || []);
        setIsMinor(data.isMinor || false);
        setMinorNotice(data.minorNotice);
      }
    } catch (err) {
      console.error("Failed to load challenges", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (challengeId: string) => {
    try {
      const res = await fetch("/api/student/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REGISTER", challengeId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchChallenges();
      }
    } catch (err) {
      console.error("Failed to register", err);
    }
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT",
          challengeId: selectedChallenge.id,
          submissionUrl,
          summary,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissionSuccess("Challenge deliverable submitted for employer review!");
        setTimeout(() => {
          setSubmissionSuccess(null);
          setSelectedChallenge(null);
          setSubmissionUrl("");
          setSummary("");
          fetchChallenges();
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to submit deliverable", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Student", "Industry Challenges"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Industry Challenge Hub</h1>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">Earn Verified Credentials</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Solve real-world industry case studies and clinical challenges to mint verified credentials to your Digital Skill Passport.
            </p>
          </div>
          <Link href="/student/passport">
            <Button variant="outline" className="border-slate-300 text-slate-700 gap-2 text-xs">
              <Award className="h-4 w-4 text-purple-600" />
              View Digital Skill Passport
            </Button>
          </Link>
        </div>

        {/* DPDP Safeguard Banner if minor */}
        {isMinor && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Statutory Child Protection (DPDP Act 2023)</span>
              <span>{minorNotice}</span>
            </div>
          </div>
        )}

        {/* Challenge Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading available challenges...</div>
        ) : challenges.length === 0 ? (
          <Card className="border-slate-200 p-8 text-center">
            <CardContent className="space-y-3">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="font-semibold text-slate-800">No industry challenges available right now</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Check back soon for new project and clinical case challenges from verified employer partners.
              </p>
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
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Building className="h-3 w-3 text-slate-400" />
                        {chal.organizationName}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] uppercase font-bold ${
                        chal.difficulty === "ADVANCED"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {chal.difficulty}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{chal.description}</p>

                  {/* Reward Credential */}
                  <div className="p-2.5 bg-purple-50/50 rounded-lg border border-purple-100 text-xs">
                    <div className="font-semibold text-purple-900 flex items-center gap-1.5 text-[11px]">
                      <Award className="h-3.5 w-3.5 text-purple-600" />
                      Digital Skill Credential:
                    </div>
                    <div className="text-slate-800 font-medium mt-0.5">{chal.rewardCredentialTitle}</div>
                  </div>

                  {/* Submission Status if already submitted */}
                  {chal.hasSubmitted && chal.mySubmission && (
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-900">Submission Status:</span>
                        <Badge
                          variant="secondary"
                          className={
                            chal.mySubmission.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800 font-bold"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {chal.mySubmission.status}
                        </Badge>
                      </div>
                      {chal.mySubmission.awardedCredentialId && (
                        <div className="text-emerald-700 text-[11px] font-semibold mt-1">
                          ✓ Credential Minted to Passport!
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    {isMinor ? (
                      <Button disabled size="sm" className="w-full text-xs h-8 bg-slate-200 text-slate-500">
                        18+ Statutory Restriction
                      </Button>
                    ) : chal.hasSubmitted ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs h-8 border-slate-300 text-slate-700"
                        onClick={() => setSelectedChallenge(chal)}
                      >
                        Update Deliverable
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                        onClick={() => setSelectedChallenge(chal)}
                      >
                        <Send className="h-3 w-3" />
                        Submit Deliverable
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Submit Deliverable Modal */}
        {selectedChallenge && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Submit Deliverable: {selectedChallenge.title}
                  </h3>
                  <p className="text-xs text-slate-500">Host: {selectedChallenge.organizationName}</p>
                </div>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {submissionSuccess ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 text-center rounded-lg font-medium text-sm">
                  ✓ {submissionSuccess}
                </div>
              ) : (
                <form onSubmit={handleSubmitDeliverable} className="space-y-3 text-xs">
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-1">
                    <span className="font-semibold text-blue-950 block">Problem Scope:</span>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      {selectedChallenge.problemStatement}
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Project Repository / Document URL
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://github.com/username/project or Google Drive / Cloud Link"
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      className="w-full p-2.5 rounded-md border border-slate-300 text-xs focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Deliverable Methodology & Key Findings
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Summarize your analytical approach, evidence collected, and conclusions..."
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="w-full p-2.5 rounded-md border border-slate-300 text-xs focus:ring-blue-500"
                    />
                  </div>

                  <div className="p-2.5 bg-purple-50 rounded-lg text-purple-900 text-[11px] flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
                    <span>
                      Upon evaluation and approval, an authentic credential signed with HMAC-SHA256 will be automatically issued.
                    </span>
                  </div>

                  <div className="pt-3 border-t flex justify-end gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => setSelectedChallenge(null)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      type="submit"
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {submitting ? "Submitting..." : "Submit for Evaluation"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
