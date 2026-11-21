"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Award,
  CheckCircle2,
  Send,
  User,
  ShieldCheck,
  Building,
  Briefcase,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CandidateDiscoveryProfile, JobOpportunityRecord } from "@/types/employer";

export default function CandidateDiscoveryPage() {
  const [candidates, setCandidates] = useState<CandidateDiscoveryProfile[]>([]);
  const [opportunities, setOpportunities] = useState<JobOpportunityRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [streamFilter, setStreamFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minCri, setMinCri] = useState<number>(0);

  // Invite modal state
  const [inviteModalCandidate, setInviteModalCandidate] = useState<CandidateDiscoveryProfile | null>(null);
  const [selectedOppId, setSelectedOppId] = useState<string>("");
  const [inviteMessage, setInviteMessage] = useState<string>("");
  const [sendingInvite, setSendingInvite] = useState<boolean>(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidates();
    fetchOpportunities();
  }, [streamFilter, minCri]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      let url = `/api/employer/discovery?`;
      if (streamFilter !== "ALL") url += `stream=${streamFilter}&`;
      if (minCri > 0) url += `minCri=${minCri}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCandidates(data.candidates || []);
      }
    } catch (err) {
      console.error("Failed to load candidates", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const res = await fetch("/api/employer/opportunities?status=PUBLISHED");
      const data = await res.json();
      if (data.success && data.opportunities?.length > 0) {
        setOpportunities(data.opportunities);
        setSelectedOppId(data.opportunities[0].id);
      }
    } catch (err) {
      console.error("Failed to load opportunities", err);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteModalCandidate || !selectedOppId) return;
    setSendingInvite(true);
    try {
      const res = await fetch("/api/employer/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: inviteModalCandidate.id,
          opportunityId: selectedOppId,
          message: inviteMessage || `We were impressed by your verified skill credentials on KAABIL and would like to invite you to apply.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInviteSuccess(`Invitation sent to ${inviteModalCandidate.name}!`);
        setTimeout(() => {
          setInviteSuccess(null);
          setInviteModalCandidate(null);
          setInviteMessage("");
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to send invite", err);
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <PortalLayout
      portalName="Employer Portal"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Employer", "Candidate Discovery"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Talent & Candidate Discovery</h1>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Opted-In Only</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Search vetted candidates who have authorized recruitment discovery. Filter by verified skills, stream, and CRI index.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Strict DPDP Act Compliance: Under-18 students are protected & shielded.</span>
          </div>
        </div>

        {/* Filters Bar */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates by name or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchCandidates()}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={streamFilter}
                onChange={(e) => setStreamFilter(e.target.value)}
                className="text-xs font-medium rounded-md border-slate-300 py-2 pl-3 pr-8 focus:ring-blue-500"
              >
                <option value="ALL">All Educational Streams</option>
                <option value="MEDICAL_PCB">Medical & Life Sciences (PCB)</option>
                <option value="NON_MEDICAL_PCM">Engineering & Tech (PCM)</option>
                <option value="COMMERCE">Commerce & Banking</option>
                <option value="LEGAL_STUDIES">Law & Judiciary</option>
                <option value="MANAGEMENT">Management & Strategy</option>
                <option value="AGRICULTURE">Agriculture & Food Systems</option>
                <option value="CREATIVE_DESIGN">Design & Visual Arts</option>
                <option value="VOCATIONAL_TRADES">Vocational Trades</option>
              </select>

              <select
                value={minCri}
                onChange={(e) => setMinCri(parseInt(e.target.value))}
                className="text-xs font-medium rounded-md border-slate-300 py-2 pl-3 pr-8 focus:ring-blue-500"
              >
                <option value="0">All Readiness Levels</option>
                <option value="50">CRI 50+ (Developing)</option>
                <option value="70">CRI 70+ (Proficient)</option>
                <option value="85">CRI 85+ (Ready)</option>
              </select>

              <Button size="sm" onClick={fetchCandidates} className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Candidate Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Searching vetted candidate profiles...</div>
        ) : candidates.length === 0 ? (
          <Card className="border-slate-200 p-8 text-center">
            <CardContent className="space-y-3">
              <User className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="font-semibold text-slate-800">No candidates found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                No opted-in candidates matched your filter criteria. Try adjusting the stream or minimum readiness score.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidates.map((cand) => (
              <Card
                key={cand.id}
                className="border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">{cand.name}</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cand.stream.replace(/_/g, " ")} • {cand.stage?.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-blue-700">{cand.careerReadinessIndex}</div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">CRI Score</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                  {/* Verified Skills */}
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Award className="h-3 w-3 text-emerald-600" />
                      Verified Skills ({cand.verifiedSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cand.verifiedSkills.slice(0, 4).map((s, idx) => (
                        <Badge key={idx} variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                          ✓ {s}
                        </Badge>
                      ))}
                      {cand.verifiedSkills.length > 4 && (
                        <span className="text-[10px] text-slate-500 self-center">
                          +{cand.verifiedSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Project Evidence */}
                  {cand.projects && cand.projects.length > 0 && (
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 text-xs">
                      <div className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                        <BookOpen className="h-3 w-3 text-blue-600" />
                        Latest Project: {cand.projects[0].title}
                      </div>
                      <p className="text-slate-500 line-clamp-1 mt-0.5 text-[11px]">{cand.projects[0].description}</p>
                    </div>
                  )}

                  {/* Statutory Qualifications */}
                  {cand.qualifications && cand.qualifications.length > 0 && (
                    <div className="text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">Degree/Status:</span> {cand.qualifications[0]}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <Button
                      size="sm"
                      className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                      onClick={() => setInviteModalCandidate(cand)}
                    >
                      <Send className="h-3 w-3" />
                      Invite to Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Invite Modal */}
        {inviteModalCandidate && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Invite {inviteModalCandidate.name}</h3>
                  <p className="text-xs text-slate-500">Send an official recruitment invitation to apply</p>
                </div>
                <button
                  onClick={() => setInviteModalCandidate(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {inviteSuccess ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 text-center rounded-lg font-medium text-sm">
                  ✓ {inviteSuccess}
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Select Opportunity</label>
                    <select
                      value={selectedOppId}
                      onChange={(e) => setSelectedOppId(e.target.value)}
                      className="w-full rounded-md border-slate-300 py-2 pl-3 text-xs focus:ring-blue-500"
                    >
                      {opportunities.map((opp) => (
                        <option key={opp.id} value={opp.id}>
                          {opp.title} ({opp.stream.replace(/_/g, " ")})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Personalized Recruiter Note</label>
                    <textarea
                      rows={3}
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      placeholder="We were impressed by your verified skill credentials on KAABIL..."
                      className="w-full p-2.5 rounded-md border-slate-300 text-xs focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 bg-blue-50 rounded-lg text-slate-600 text-[11px]">
                    Candidates will receive an instant notification in their portal and email, with direct option to accept or decline.
                  </div>

                  <div className="pt-3 border-t flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setInviteModalCandidate(null)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                      disabled={sendingInvite}
                      onClick={handleSendInvite}
                    >
                      <Send className="h-3 w-3" />
                      {sendingInvite ? "Sending..." : "Send Invitation"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
