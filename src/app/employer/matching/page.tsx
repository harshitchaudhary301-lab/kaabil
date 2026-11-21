"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  ChevronRight,
  Filter,
  User,
  ArrowRight,
  FileCheck,
  Send,
  CalendarCheck,
  Building,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExplainableMatchResult, JobOpportunityRecord, MatchWeightConfig } from "@/types/employer";

function getMatchTier(score: number): "STRONG" | "MODERATE" | "DEVELOPING" {
  if (score >= 75) return "STRONG";
  if (score >= 50) return "MODERATE";
  return "DEVELOPING";
}

export default function TalentMatchingPage() {
  const [opportunities, setOpportunities] = useState<JobOpportunityRecord[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>("");
  const [matches, setMatches] = useState<ExplainableMatchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [selectedMatch, setSelectedMatch] = useState<ExplainableMatchResult | null>(null);

  // Weight sliders state
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [weights, setWeights] = useState<MatchWeightConfig>({
    verifiedSkillWeight: 0.35,
    proficiencyWeight: 0.25,
    projectEvidenceWeight: 0.15,
    assessmentWeight: 0.15,
    preferredSkillWeight: 0.1,
  });
  const [savingWeights, setSavingWeights] = useState<boolean>(false);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    if (selectedOppId) {
      fetchMatches(selectedOppId);
    }
  }, [selectedOppId]);

  const fetchOpportunities = async () => {
    try {
      const res = await fetch("/api/employer/opportunities?status=PUBLISHED");
      const data = await res.json();
      if (data.success && data.opportunities?.length > 0) {
        setOpportunities(data.opportunities);
        setSelectedOppId(data.opportunities[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to load opportunities", err);
      setLoading(false);
    }
  };

  const fetchMatches = async (oppId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employer/matching?opportunityId=${oppId}`);
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches || []);
        if (data.currentWeights) {
          setWeights(data.currentWeights);
        }
      }
    } catch (err) {
      console.error("Failed to load matches", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWeights = async () => {
    setSavingWeights(true);
    try {
      const res = await fetch("/api/employer/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: selectedOppId, weights }),
      });
      const data = await res.json();
      if (data.success) {
        setShowConfigModal(false);
        fetchMatches(selectedOppId);
      }
    } catch (err) {
      console.error("Failed to save weights", err);
    } finally {
      setSavingWeights(false);
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (tierFilter === "ALL") return true;
    return getMatchTier(m.overallScore) === tierFilter;
  });

  const selectedOpp = opportunities.find((o) => o.id === selectedOppId);

  return (
    <PortalLayout
      portalName="Employer Portal"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Employer", "AI Talent Matching"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Two-Way Explainable Talent Matching</h1>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">AI Powered</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Deterministic, bias-free candidate compatibility based on verified skills, projects, and structured rubrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-slate-300 text-slate-700 gap-2"
              onClick={() => setShowConfigModal(true)}
            >
              <Sliders className="h-4 w-4 text-purple-600" />
              Configure Scoring Weights
            </Button>
          </div>
        </div>

        {/* Opportunity Selector Banner */}
        <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-white">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Target Opportunity
                </label>
                <select
                  value={selectedOppId}
                  onChange={(e) => setSelectedOppId(e.target.value)}
                  className="mt-0.5 block w-full md:w-80 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm font-medium text-slate-900"
                >
                  {opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.title} ({opp.stream.replace(/_/g, " ")})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedOpp && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className="bg-white text-slate-700 border-slate-200">
                  {selectedOpp.stream.replace(/_/g, " ")}
                </Badge>
                <Badge variant="outline" className="bg-white text-slate-700 border-slate-200">
                  {selectedOpp.city || selectedOpp.state || "Pan-India"}
                </Badge>
                <Badge variant="outline" className="bg-white text-slate-700 border-slate-200">
                  {selectedOpp.opportunityType}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filter Tabs & Metrics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: "ALL", label: `All Candidates (${matches.length})` },
              { id: "STRONG", label: `Strong Match (${matches.filter((m) => getMatchTier(m.overallScore) === "STRONG").length})` },
              { id: "MODERATE", label: `Moderate (${matches.filter((m) => getMatchTier(m.overallScore) === "MODERATE").length})` },
              { id: "DEVELOPING", label: `Developing (${matches.filter((m) => getMatchTier(m.overallScore) === "DEVELOPING").length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTierFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  tierFilter === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            DPDP Act Compliant: Minor students strictly shielded from recruitment matching.
          </div>
        </div>

        {/* Matches Listing */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Calculating multi-stream talent compatibility...</div>
        ) : filteredMatches.length === 0 ? (
          <Card className="border-slate-200 p-8 text-center">
            <CardContent className="space-y-3">
              <User className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="font-semibold text-slate-800">No matching candidates in this tier</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                No opted-in candidates meet this match threshold. You can broaden matching weights or explore Candidate Discovery.
              </p>
              <Link href="/employer/discovery">
                <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  Search Candidate Discovery
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMatches.map((m) => {
              const tier = getMatchTier(m.overallScore);
              return (
                <Card
                  key={m.candidateId}
                  className="border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                >
                  <div
                    className={`h-1.5 w-full ${
                      tier === "STRONG"
                        ? "bg-emerald-500"
                        : tier === "MODERATE"
                        ? "bg-blue-500"
                        : "bg-amber-400"
                    }`}
                  />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">{m.candidateName}</CardTitle>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {m.stream?.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xl font-extrabold ${
                            tier === "STRONG"
                              ? "text-emerald-700"
                              : tier === "MODERATE"
                              ? "text-blue-700"
                              : "text-amber-700"
                          }`}
                        >
                          {m.overallScore}%
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] uppercase font-bold mt-0.5 ${
                            tier === "STRONG"
                              ? "bg-emerald-100 text-emerald-800"
                              : tier === "MODERATE"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {tier} Match
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                    {/* Score breakdown bars */}
                    <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Verified Skills (35%)</span>
                        <span className="font-semibold text-slate-900">{m.scoreBreakdown.verifiedSkillScore}%</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Proficiency (25%)</span>
                        <span className="font-semibold text-slate-900">{m.scoreBreakdown.proficiencyScore}%</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Project Portfolio (15%)</span>
                        <span className="font-semibold text-slate-900">{m.scoreBreakdown.projectEvidenceScore}%</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Assessment Benchmarks (15%)</span>
                        <span className="font-semibold text-slate-900">{m.scoreBreakdown.assessmentScore}%</span>
                      </div>
                    </div>

                    {/* Plain Language Summary */}
                    <div className="p-2.5 bg-purple-50/50 rounded-lg border border-purple-100 text-xs text-purple-900">
                      <div className="font-semibold flex items-center gap-1.5 text-purple-950 mb-1">
                        <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                        AI Match Rationale
                      </div>
                      <p className="line-clamp-3 text-slate-700 leading-relaxed">{m.plainLanguageExplanation}</p>
                    </div>

                    {/* Skills Tagged */}
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Verified Competencies ({m.matchedRequiredSkills?.length || 0})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(m.matchedRequiredSkills || []).slice(0, 3).map((s: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                            ✓ {s}
                          </Badge>
                        ))}
                        {(m.matchedRequiredSkills?.length || 0) > 3 && (
                          <span className="text-[10px] text-slate-500 self-center">
                            +{m.matchedRequiredSkills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 border-slate-300 text-slate-700 flex-1"
                        onClick={() => setSelectedMatch(m)}
                      >
                        Inspect Breakdown
                      </Button>
                      <Link href={`/employer/discovery`} className="flex-1">
                        <Button size="sm" className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white">
                          Invite
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Detailed Breakdown Modal */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedMatch.candidateName}</h3>
                  <p className="text-xs text-slate-500">
                    Match Breakdown for {selectedOpp?.title} • Overall Score: {selectedMatch.overallScore}%
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="font-semibold text-purple-900 text-xs uppercase mb-1">Explainable AI Audit Log</div>
                  <p className="text-xs text-slate-800 leading-relaxed">{selectedMatch.plainLanguageExplanation}</p>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-800 text-xs uppercase">Granular Score Breakdown</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 border rounded bg-slate-50">
                      <div className="text-slate-500">Verified Skills</div>
                      <div className="text-base font-bold text-slate-900">{selectedMatch.scoreBreakdown.verifiedSkillScore}%</div>
                    </div>
                    <div className="p-2 border rounded bg-slate-50">
                      <div className="text-slate-500">Proficiency Depth</div>
                      <div className="text-base font-bold text-slate-900">{selectedMatch.scoreBreakdown.proficiencyScore}%</div>
                    </div>
                    <div className="p-2 border rounded bg-slate-50">
                      <div className="text-slate-500">Project Portfolio</div>
                      <div className="text-base font-bold text-slate-900">{selectedMatch.scoreBreakdown.projectEvidenceScore}%</div>
                    </div>
                    <div className="p-2 border rounded bg-slate-50">
                      <div className="text-slate-500">Assessments</div>
                      <div className="text-base font-bold text-slate-900">{selectedMatch.scoreBreakdown.assessmentScore}%</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-slate-800 text-xs uppercase mb-1">
                    Mandatory Qualification Status
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      selectedMatch.mandatoryQualificationsStatus === "SATISFIED"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}
                  >
                    {selectedMatch.mandatoryQualificationsStatus === "SATISFIED"
                      ? "✓ All statutory/degree requirements satisfied"
                      : "⚠ Provisional or pending completion"}
                  </Badge>
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedMatch(null)}>
                    Close
                  </Button>
                  <Link href={`/employer/applications`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      View Application Pipeline
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Config Weights Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Custom Matching Weights</h3>
                  <p className="text-xs text-slate-500">Adjust the 5 dimensions of candidate scoring</p>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-700">Verified Skills</span>
                    <span className="font-bold text-slate-900">{(weights.verifiedSkillWeight * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.verifiedSkillWeight}
                    onChange={(e) =>
                      setWeights({ ...weights, verifiedSkillWeight: parseFloat(e.target.value) })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-700">Proficiency Depth</span>
                    <span className="font-bold text-slate-900">{(weights.proficiencyWeight * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.proficiencyWeight}
                    onChange={(e) =>
                      setWeights({ ...weights, proficiencyWeight: parseFloat(e.target.value) })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-700">Project Evidence</span>
                    <span className="font-bold text-slate-900">{(weights.projectEvidenceWeight * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.projectEvidenceWeight}
                    onChange={(e) =>
                      setWeights({ ...weights, projectEvidenceWeight: parseFloat(e.target.value) })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-700">Assessment Scores</span>
                    <span className="font-bold text-slate-900">{(weights.assessmentWeight * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.assessmentWeight}
                    onChange={(e) =>
                      setWeights({ ...weights, assessmentWeight: parseFloat(e.target.value) })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-700">Preferred Skills</span>
                    <span className="font-bold text-slate-900">{(weights.preferredSkillWeight * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.preferredSkillWeight}
                    onChange={(e) =>
                      setWeights({ ...weights, preferredSkillWeight: parseFloat(e.target.value) })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="p-2 bg-slate-50 border rounded text-[11px] text-slate-500">
                  Note: Weights are automatically normalized to sum to 100% during execution.
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowConfigModal(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={savingWeights}
                  onClick={handleSaveWeights}
                >
                  {savingWeights ? "Saving..." : "Apply Weights"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
