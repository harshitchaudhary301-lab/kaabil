"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Award,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  FileBadge,
  Eye,
  Check,
  Building,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EmployerJobApplicationRecord,
  ApplicationStage,
  JobOpportunityRecord,
} from "@/types/employer";
import { EducationalStream } from "@/types";

const STAGE_CONFIG: Record<
  ApplicationStage,
  { label: string; bg: string; text: string; border: string }
> = {
  APPLIED: { label: "Applied", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  UNDER_REVIEW: { label: "Under Review", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  SHORTLISTED: { label: "Shortlisted", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  ASSESSMENT_REQUESTED: { label: "Assessment Sent", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  INTERVIEW_SCHEDULED: { label: "Interview", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  INTERVIEW_COMPLETED: { label: "Interview Done", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  OFFER_ISSUED: { label: "Offer Issued", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  HIRED: { label: "Hired", bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
  REJECTED: { label: "Rejected", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  WITHDRAWN: { label: "Withdrawn", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300" },
};

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<EmployerJobApplicationRecord[]>([]);
  const [opportunities, setOpportunities] = useState<JobOpportunityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOppId, setSelectedOppId] = useState("ALL");
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [selectedStream, setSelectedStream] = useState("ALL");

  // Inspection Drawer
  const [selectedApp, setSelectedApp] = useState<EmployerJobApplicationRecord | null>(null);
  const [newRecruiterNote, setNewRecruiterNote] = useState("");
  const [updatingStage, setUpdatingStage] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedOppId, selectedStage, selectedStream]);

  async function fetchData() {
    setLoading(true);
    try {
      // 1. Load opportunities for dropdown
      const oppRes = await fetch("/api/employer/opportunities");
      const oppData = await oppRes.json();
      if (oppData.success) {
        setOpportunities(oppData.opportunities || []);
      }

      // 2. Load applications with query parameters
      const params = new URLSearchParams();
      if (selectedOppId !== "ALL") params.set("opportunityId", selectedOppId);
      if (selectedStage !== "ALL") params.set("stage", selectedStage);
      if (selectedStream !== "ALL") params.set("stream", selectedStream);

      const appRes = await fetch(`/api/employer/applications?${params.toString()}`);
      const appData = await appRes.json();
      if (appData.success) {
        setApplications(appData.applications || []);
      }
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setLoading(false);
    }
  }

  const handleStageChange = async (appId: string, newStage: ApplicationStage, note?: string) => {
    setUpdatingStage(true);
    try {
      const res = await fetch("/api/employer/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appId,
          stage: newStage,
          recruiterNotes: note || newRecruiterNote,
        }),
      });
      const data = await res.json();
      if (data.success && data.application) {
        // Update local state
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? data.application : a))
        );
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp(data.application);
        }
        setActionSuccess(`Stage updated to ${STAGE_CONFIG[newStage]?.label || newStage}`);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Stage update failed", err);
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    await handleStageChange(selectedApp.id, selectedApp.stage, newRecruiterNote);
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.studentName.toLowerCase().includes(term) ||
      app.studentEmail.toLowerCase().includes(term) ||
      app.opportunityTitle.toLowerCase().includes(term) ||
      app.verifiedSkills.some((s) => s.toLowerCase().includes(term))
    );
  });

  return (
    <PortalLayout
      portalName="Employer Console"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Applications", "Applicant Tracking System"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Applicant Tracking System (ATS)
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Skills-first candidate evaluations with explainable match metrics and human review verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/employer/pipeline">
              <Button variant="outline" className="border-slate-200 text-slate-700 text-xs">
                View Kanban Pipeline
              </Button>
            </Link>
            <Link href="/employer/opportunities/new">
              <Button className="bg-primary hover:bg-primary/90 text-white text-xs">
                Post Opportunity
              </Button>
            </Link>
          </div>
        </div>

        {/* DPDP Safeguard Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Compliance Guarantee:</strong> Under the DPDP Act 2023, every applicant displayed in this portal is
              an adult student/jobseeker who has affirmatively consented to share their verified profile with your organization.
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] bg-white text-emerald-700 border-emerald-300">
            DPDP Compliant
          </Badge>
        </div>

        {/* Filter Bar */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidate, skill, role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <select
                  value={selectedOppId}
                  onChange={(e) => setSelectedOppId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="ALL">All Opportunities ({opportunities.length})</option>
                  {opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.title} ({opp.opportunityType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="ALL">All Application Stages</option>
                  {Object.entries(STAGE_CONFIG).map(([stg, cfg]) => (
                    <option key={stg} value={stg}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedStream}
                  onChange={(e) => setSelectedStream(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="ALL">All Educational Streams</option>
                  <option value="MEDICAL_PCB">Medicine (PCB)</option>
                  <option value="NON_MEDICAL_PCM">Engineering (PCM)</option>
                  <option value="COMMERCE">Commerce & Finance</option>
                  <option value="ARTS_HUMANITIES">Arts & Humanities</option>
                  <option value="LAW">Law</option>
                  <option value="VOCATIONAL_TRADES">Vocational Trades</option>
                  <option value="MANAGEMENT">Management</option>
                  <option value="CREATIVE_DESIGN">Design & Media</option>
                  <option value="AGRICULTURE">Agriculture</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {actionSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Applications List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading applicant records...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card className="border-slate-200 shadow-sm text-center py-16 bg-white">
            <CardContent>
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">No Applications Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No candidate applications match the selected filter criteria. As qualified students apply to your published
                opportunities, they will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Opportunity</th>
                    <th className="py-3 px-4">Stream & Stage</th>
                    <th className="py-3 px-4">Readiness (CRI)</th>
                    <th className="py-3 px-4">Match Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredApplications.map((app) => {
                    const stgCfg = STAGE_CONFIG[app.stage] || {
                      label: app.stage,
                      bg: "bg-slate-50",
                      text: "text-slate-700",
                      border: "border-slate-200",
                    };

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{app.studentName}</div>
                          <div className="text-[11px] text-slate-500">{app.studentEmail}</div>
                          {app.verifiedSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {app.verifiedSkills.slice(0, 2).map((s, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-[10px] px-1 py-0 bg-slate-100 text-slate-600 font-normal"
                                >
                                  {s}
                                </Badge>
                              ))}
                              {app.verifiedSkills.length > 2 && (
                                <span className="text-[10px] text-slate-400">
                                  +{app.verifiedSkills.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 line-clamp-1">{app.opportunityTitle}</div>
                          <div className="text-[11px] text-slate-400">
                            Applied {new Date(app.appliedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 border-slate-200 mb-0.5">
                            {app.studentStream.replace(/_/g, " ")}
                          </Badge>
                          <div className="text-[11px] text-slate-500">{app.studentStage.replace(/_/g, " ")}</div>
                        </td>

                        <td className="py-3 px-4">
                          {app.readinessIndex ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 text-xs">{app.readinessIndex}</span>
                              <span className="text-[10px] text-slate-400">/100</span>
                              <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${Math.min(100, app.readinessIndex)}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Not set</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <Badge
                            className={`text-xs font-semibold ${
                              app.matchScore >= 75
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : app.matchScore >= 50
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {app.matchScore}% Match
                          </Badge>
                        </td>

                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`text-[11px] ${stgCfg.bg} ${stgCfg.text} ${stgCfg.border}`}>
                            {stgCfg.label}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setNewRecruiterNote(app.recruiterNotes || "");
                            }}
                            className="text-xs h-7 px-2.5 text-slate-700 border-slate-200 hover:bg-slate-100"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Candidate Detail Inspection Modal / Drawer */}
        {selectedApp && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in-50 zoom-in-95">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedApp.studentName}</h2>
                    <Badge variant="outline" className={`text-xs ${STAGE_CONFIG[selectedApp.stage]?.bg} ${STAGE_CONFIG[selectedApp.stage]?.text} ${STAGE_CONFIG[selectedApp.stage]?.border}`}>
                      {STAGE_CONFIG[selectedApp.stage]?.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Applied for <strong>{selectedApp.opportunityTitle}</strong> &bull; {selectedApp.studentEmail}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="text-slate-400 hover:text-slate-700 text-lg p-1"
                >
                  &times;
                </button>
              </div>

              {/* Explainable Match Analysis */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    Explainable Competency Match: {selectedApp.matchScore}%
                  </h3>
                  {selectedApp.readinessIndex && (
                    <span className="text-xs font-semibold text-slate-700">
                      CRI Score: <strong>{selectedApp.readinessIndex}/100</strong>
                    </span>
                  )}
                </div>

                {selectedApp.matchExplanation && (
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-500">Stream Alignment</div>
                      <div className="font-semibold mt-0.5 text-slate-800">
                        {selectedApp.matchExplanation.streamMatch ? "Aligned" : "Alternative Stream"}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-500">Stage Eligibility</div>
                      <div className="font-semibold mt-0.5 text-slate-800">
                        {selectedApp.matchExplanation.stageMatch ? "Eligible" : "Below Stage"}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-500">CRI Benchmark</div>
                      <div className="font-semibold mt-0.5 text-slate-800">
                        {selectedApp.matchExplanation.criQualified ? "Qualified" : "Developing"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Verified Skills Breakdown */}
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1">
                    Verified Competencies Held ({selectedApp.verifiedSkills.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApp.verifiedSkills.map((sk, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1">
                        <Check className="h-3 w-3 text-emerald-600" />
                        {sk}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedApp.matchExplanation?.missingSkills && selectedApp.matchExplanation.missingSkills.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-1">
                      Identified Competency Gaps:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApp.matchExplanation.missingSkills.map((sk, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
                          {sk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cover Note */}
              {selectedApp.coverNote && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1">Candidate Statement / Cover Note</h4>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
                    &quot;{selectedApp.coverNote}&quot;
                  </div>
                </div>
              )}

              {/* Recruiter Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  Internal Recruiter Evaluation Notes
                </h4>
                <textarea
                  rows={3}
                  value={newRecruiterNote}
                  onChange={(e) => setNewRecruiterNote(e.target.value)}
                  placeholder="Record interview notes, technical competency feedback, or evaluation rationale..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex justify-end mt-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveNotes}
                    disabled={updatingStage}
                    className="text-xs h-7"
                  >
                    Save Notes
                  </Button>
                </div>
              </div>

              {/* Status History Audit Trail */}
              {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Application History Audit Log
                  </h4>
                  <div className="space-y-1.5 text-[11px] text-slate-500">
                    {selectedApp.statusHistory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span>
                          Moved to <strong>{item.stage}</strong> by {item.updatedBy}
                        </span>
                        <span>{new Date(item.updatedAt).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage Transition Actions */}
              <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-semibold text-slate-700">Advance Application Stage:</div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStageChange(selectedApp.id, "UNDER_REVIEW")}
                    disabled={updatingStage || selectedApp.stage === "UNDER_REVIEW"}
                    className="text-xs h-8"
                  >
                    Reviewing
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStageChange(selectedApp.id, "SHORTLISTED")}
                    disabled={updatingStage || selectedApp.stage === "SHORTLISTED"}
                    className="text-xs h-8 text-purple-700 border-purple-200 hover:bg-purple-50"
                  >
                    Shortlist
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStageChange(selectedApp.id, "INTERVIEW_SCHEDULED")}
                    disabled={updatingStage || selectedApp.stage === "INTERVIEW_SCHEDULED"}
                    className="text-xs h-8 text-amber-700 border-amber-200 hover:bg-amber-50"
                  >
                    Schedule Interview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStageChange(selectedApp.id, "OFFER_ISSUED")}
                    disabled={updatingStage || selectedApp.stage === "OFFER_ISSUED"}
                    className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Issue Offer
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStageChange(selectedApp.id, "REJECTED")}
                    disabled={updatingStage || selectedApp.stage === "REJECTED"}
                    className="text-xs h-8 text-rose-600 hover:bg-rose-50"
                  >
                    Reject
                  </Button>
                </div>
              </div>

              {/* Human In the Loop Policy */}
              <div className="text-[11px] text-slate-400 italic text-center pt-2">
                Human-in-the-Loop Mandate: Final recruitment decisions must be authorized by human hiring managers. Automated CRI or AI rejections are prohibited.
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
