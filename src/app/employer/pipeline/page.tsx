"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Columns3,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Award,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Building,
  ArrowRight,
  XCircle,
  Briefcase,
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

const PIPELINE_COLUMNS: { stage: ApplicationStage; title: string; color: string; badgeBg: string }[] = [
  { stage: "APPLIED", title: "Applied", color: "border-sky-300 bg-sky-50/40", badgeBg: "bg-sky-100 text-sky-800" },
  { stage: "UNDER_REVIEW", title: "Under Review", color: "border-blue-300 bg-blue-50/40", badgeBg: "bg-blue-100 text-blue-800" },
  { stage: "SHORTLISTED", title: "Shortlisted", color: "border-purple-300 bg-purple-50/40", badgeBg: "bg-purple-100 text-purple-800" },
  { stage: "INTERVIEW_SCHEDULED", title: "Interview", color: "border-amber-300 bg-amber-50/40", badgeBg: "bg-amber-100 text-amber-800" },
  { stage: "OFFER_ISSUED", title: "Offer Extended", color: "border-emerald-300 bg-emerald-50/40", badgeBg: "bg-emerald-100 text-emerald-800" },
  { stage: "HIRED", title: "Hired", color: "border-green-400 bg-green-50/50", badgeBg: "bg-green-100 text-green-900" },
];

export default function EmployerPipelinePage() {
  const [pipelineData, setPipelineData] = useState<Record<ApplicationStage, EmployerJobApplicationRecord[]>>({
    APPLIED: [],
    UNDER_REVIEW: [],
    SHORTLISTED: [],
    ASSESSMENT_REQUESTED: [],
    INTERVIEW_SCHEDULED: [],
    INTERVIEW_COMPLETED: [],
    OFFER_ISSUED: [],
    HIRED: [],
    REJECTED: [],
    WITHDRAWN: [],
  });
  const [opportunities, setOpportunities] = useState<JobOpportunityRecord[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPipeline();
  }, [selectedOppId]);

  async function fetchPipeline() {
    setLoading(true);
    try {
      // Load opportunities for filter
      const oppRes = await fetch("/api/employer/opportunities");
      const oppData = await oppRes.json();
      if (oppData.success) {
        setOpportunities(oppData.opportunities || []);
      }

      // Load pipeline data
      const url =
        selectedOppId !== "ALL"
          ? `/api/employer/pipeline?opportunityId=${selectedOppId}`
          : "/api/employer/pipeline";

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.stages) {
        setPipelineData(data.stages);
      }
    } catch (err) {
      console.error("Failed to load pipeline", err);
    } finally {
      setLoading(false);
    }
  }

  const handleMoveStage = async (appId: string, nextStage: ApplicationStage) => {
    setUpdatingId(appId);
    try {
      const res = await fetch("/api/employer/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, stage: nextStage }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh pipeline
        await fetchPipeline();
      }
    } catch (err) {
      console.error("Failed to move stage", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalInPipeline =
    (pipelineData.APPLIED?.length || 0) +
    (pipelineData.UNDER_REVIEW?.length || 0) +
    (pipelineData.SHORTLISTED?.length || 0) +
    (pipelineData.INTERVIEW_SCHEDULED?.length || 0) +
    (pipelineData.OFFER_ISSUED?.length || 0) +
    (pipelineData.HIRED?.length || 0);

  return (
    <PortalLayout
      portalName="Employer Console"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Applications", "Recruitment Pipeline"]}
    >
      <div className="space-y-6 max-w-full mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Columns3 className="h-6 w-6 text-primary" />
              Recruitment Pipeline (Kanban)
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Visual skills-first applicant workflow from initial application to verified hire.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white font-medium"
            >
              <option value="ALL">All Opportunities ({opportunities.length})</option>
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} ({opp.opportunityType})
                </option>
              ))}
            </select>

            <Link href="/employer/applications">
              <Button variant="outline" size="sm" className="text-xs border-slate-200">
                Table View
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric summary banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {PIPELINE_COLUMNS.map((col) => {
            const count = (pipelineData[col.stage] || []).length;
            return (
              <div key={col.stage} className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="text-[11px] font-medium text-slate-500">{col.title}</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{count}</div>
              </div>
            );
          })}
        </div>

        {/* Kanban Board Horizontal Scroll */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading pipeline board...</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
            {PIPELINE_COLUMNS.map((col, colIdx) => {
              const cards = pipelineData[col.stage] || [];
              const prevCol = colIdx > 0 ? PIPELINE_COLUMNS[colIdx - 1] : null;
              const nextCol = colIdx < PIPELINE_COLUMNS.length - 1 ? PIPELINE_COLUMNS[colIdx + 1] : null;

              return (
                <div
                  key={col.stage}
                  className="w-72 shrink-0 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col max-h-[75vh]"
                >
                  {/* Column Header */}
                  <div className={`p-3 border-b border-slate-200/80 rounded-t-xl flex items-center justify-between bg-white`}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">{col.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${col.badgeBg}`}>
                        {cards.length}
                      </span>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                    {cards.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 italic">No candidates</div>
                    ) : (
                      cards.map((card) => (
                        <div
                          key={card.id}
                          className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <div className="font-semibold text-xs text-slate-900">{card.studentName}</div>
                              <div className="text-[10px] text-slate-500 line-clamp-1">{card.opportunityTitle}</div>
                            </div>
                            <Badge
                              className={`text-[10px] font-bold px-1.5 py-0 ${
                                card.matchScore >= 75
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-50 text-slate-700 border-slate-200"
                              }`}
                            >
                              {card.matchScore}%
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span className="truncate">{card.studentStream.replace(/_/g, " ")}</span>
                            {card.readinessIndex ? (
                              <span className="font-semibold text-slate-800 shrink-0">
                                CRI {card.readinessIndex}
                              </span>
                            ) : null}
                          </div>

                          {card.verifiedSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {card.verifiedSkills.slice(0, 2).map((sk, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-[9px] px-1 py-0 bg-slate-100 text-slate-600"
                                >
                                  {sk}
                                </Badge>
                              ))}
                              {card.verifiedSkills.length > 2 && (
                                <span className="text-[9px] text-slate-400">
                                  +{card.verifiedSkills.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Stage Transition Control Buttons */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            {prevCol ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMoveStage(card.id, prevCol.stage)}
                                disabled={updatingId === card.id}
                                className="h-6 px-1.5 text-[10px] text-slate-500 hover:text-slate-800"
                                title={`Move back to ${prevCol.title}`}
                              >
                                <ChevronLeft className="h-3 w-3 mr-0.5" />
                                Back
                              </Button>
                            ) : <div />}

                            <div className="flex items-center gap-1">
                              {col.stage !== "HIRED" && nextCol && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMoveStage(card.id, nextCol.stage)}
                                  disabled={updatingId === card.id}
                                  className="h-6 px-2 text-[10px] text-primary border-primary/30 hover:bg-primary/5 font-semibold"
                                >
                                  Advance
                                  <ChevronRight className="h-3 w-3 ml-0.5" />
                                </Button>
                              )}
                              {col.stage !== "HIRED" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMoveStage(card.id, "REJECTED")}
                                  disabled={updatingId === card.id}
                                  className="h-6 px-1 text-[10px] text-rose-500 hover:bg-rose-50"
                                  title="Reject Candidate"
                                >
                                  &times;
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
