"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Copy,
  Pause,
  Play,
  Archive,
  ChevronRight,
  ExternalLink,
  Users,
  Building,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobOpportunityRecord, OpportunityStatus } from "@/types/employer";
import { EducationalStream } from "@/types";

const STREAMS_LIST: { label: string; value: string }[] = [
  { label: "All Streams", value: "ALL" },
  { label: "Engineering (PCM)", value: "NON_MEDICAL_PCM" },
  { label: "Medicine (PCB)", value: "MEDICAL_PCB" },
  { label: "Commerce & Finance", value: "COMMERCE" },
  { label: "Arts & Humanities", value: "ARTS_HUMANITIES" },
  { label: "Law & Legal", value: "LAW" },
  { label: "Vocational & Trades", value: "VOCATIONAL_TRADES" },
  { label: "Design & Media", value: "CREATIVE_DESIGN" },
  { label: "Agriculture", value: "AGRICULTURE" },
];

export default function EmployerOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<JobOpportunityRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("" );
  const [streamFilter, setStreamFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchOpportunities();
  }, [streamFilter, statusFilter]);

  async function fetchOpportunities() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (streamFilter !== "ALL") params.set("stream", streamFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/employer/opportunities?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOpportunities(data.opportunities || []);
      }
    } catch (err) {
      console.error("Failed to load opportunities", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusToggle(id: string, currentStatus: OpportunityStatus) {
    const newStatus = currentStatus === "PUBLISHED" ? "PAUSED" : "PUBLISHED";
    try {
      const res = await fetch(`/api/employer/opportunities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOpportunities();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const res = await fetch(`/api/employer/opportunities/${id}`, {
        method: "POST", // trigger duplicate
      });
      // Or fetch create with duplicate copy
      fetchOpportunities();
    } catch (err) {
      console.error("Failed to duplicate", err);
    }
  }

  const filtered = opportunities.filter((o) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.title.toLowerCase().includes(term) ||
      o.requiredSkills.some((s) => s.toLowerCase().includes(term))
    );
  });

  return (
    <PortalLayout
      portalName="Employer Portal"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Recruitment", "Manage Opportunities"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Briefcase className="w-7 h-7 text-[#4169E1]" />
              Opportunities &amp; Job Listings
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Multi-stream skills-first vacancies, internships, apprenticeships, and campus recruitment drives.
            </p>
          </div>

          <Link href="/employer/opportunities/new">
            <Button className="bg-[#4169E1] hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm h-9">
              <Plus className="w-4 h-4" /> Post New Opportunity
            </Button>
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by job title or required skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4169E1]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
            >
              {STREAMS_LIST.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <div className="flex gap-1">
              {["ALL", "PUBLISHED", "DRAFT", "PAUSED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === st
                      ? "bg-[#4169E1] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Opportunities List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            <div className="animate-spin w-6 h-6 border-2 border-[#4169E1] border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading opportunities...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No opportunities found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm || streamFilter !== "ALL"
                ? "Try clearing your search or filters."
                : "Create your organization's first skills-first job or internship vacancy."}
            </p>
            <Link href="/employer/opportunities/new">
              <Button size="sm" className="mt-3 bg-[#4169E1] text-white text-xs">
                Post Opportunity
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((opp) => (
              <Card key={opp.id} className="border-slate-200 hover:border-slate-300 transition-all bg-white shadow-soft-xs">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{opp.title}</h3>
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-2 py-0.2 capitalize ${
                            opp.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : opp.status === "DRAFT"
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {opp.status.toLowerCase()}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700 border-blue-100">
                          {opp.stream.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>{opp.opportunityType.replace("_", " ")}</span>
                        <span>•</span>
                        <span>{opp.workplaceType}</span>
                        <span>•</span>
                        <span>{opp.city}, {opp.state}</span>
                        {opp.compensation?.isDisclosed && opp.compensation.minSalary && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">
                              ₹{opp.compensation.minSalary} - {opp.compensation.maxSalary} LPA
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>Deadline: {opp.deadline}</span>
                      </div>

                      {/* Required Skills Chips */}
                      {opp.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {opp.requiredSkills.map((sk) => (
                            <span
                              key={sk}
                              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-base block">
                          {opp.totalApplications || 0}
                        </span>
                        <span className="text-[10px] text-slate-400">Applications</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusToggle(opp.id, opp.status)}
                          className="text-xs h-8"
                          title={opp.status === "PUBLISHED" ? "Pause Opportunity" : "Publish Opportunity"}
                        >
                          {opp.status === "PUBLISHED" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </Button>

                        <Link href={`/employer/applications?opportunityId=${opp.id}`}>
                          <Button size="sm" className="bg-[#4169E1] hover:bg-blue-700 text-white text-xs h-8 gap-1">
                            <Users className="w-3.5 h-3.5" /> Pipeline →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
