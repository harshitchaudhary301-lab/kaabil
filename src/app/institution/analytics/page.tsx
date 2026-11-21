"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Layers,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { INSTITUTION_NAV } from "@/components/institution/institution-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DepartmentSkillHeatmap } from "@/types/institution";

const STREAM_OPTIONS = [
  "All Streams",
  "NON_MEDICAL_PCM",
  "MEDICAL_PCB",
  "COMMERCE",
  "ARTS_HUMANITIES",
  "LAW",
  "VOCATIONAL_TRADES",
  "CREATIVE_DESIGN",
  "AGRICULTURE",
];

export default function InstitutionAnalyticsPage() {
  const [heatmap, setHeatmap] = useState<DepartmentSkillHeatmap[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [streamFilter, setStreamFilter] = useState<string>("All Streams");
  const [activeCompetency, setActiveCompetency] = useState<any | null>(null);

  const fetchHeatmap = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = streamFilter !== "All Streams" ? `?stream=${streamFilter}` : "";
      const res = await fetch(`/api/institution/analytics/heatmap${q}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setHeatmap(data.heatmap || []);
      } else {
        setError(data.error || "Failed to load skill heatmap analytics");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to institutional services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, [streamFilter]);

  const getHeatmapColor = (status: string, percent: number) => {
    if (percent === 0) return "bg-slate-100 text-slate-500 border-slate-200";
    if (status === "STRONG") return "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100";
    if (status === "MODERATE") return "bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100";
    if (status === "GAP") return "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100";
    return "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100";
  };

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Institution", "Skill Analytics Heatmap"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Multi-Stream Skill Analytics Heatmap
            </h1>
            <p className="text-sm text-slate-500">
              Department-wise cohort competency matrices, verified vs self-reported coverage, and curriculum gap alerts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/institution/industry-demand">
              <Button variant="outline" className="text-xs flex items-center gap-1.5 border-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Industry Demand Intelligence
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Toolbar & Legend */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Filter Stream:</span>
            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              {STREAM_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Accessible Heatmap Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-400 font-medium">Demonstration Index:</span>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-emerald-500 inline-block" />
              <span className="text-slate-600">Strong (75%+)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-blue-500 inline-block" />
              <span className="text-slate-600">Moderate (50-74%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-amber-500 inline-block" />
              <span className="text-slate-600">Gap (25-49%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-rose-500 inline-block" />
              <span className="text-slate-600">Critical (&lt;25%)</span>
            </div>
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Computing cohort skill competency matrices...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-rose-600" />
            <p className="text-sm font-semibold">{error}</p>
            <Button onClick={fetchHeatmap} variant="outline" className="mt-3 text-xs">
              Retry
            </Button>
          </div>
        ) : heatmap.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            <Layers className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">No competency data available</p>
            <p className="text-xs text-slate-400 mt-1">
              Enroll students or adjust your stream filter to generate the heatmap.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {heatmap.map((dept) => (
              <Card key={dept.departmentId} className="border border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/70 border-b border-slate-200 py-3 px-5 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-sm font-bold text-slate-900">
                      {dept.departmentName}
                    </CardTitle>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                      {dept.stream.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <span className="text-xs text-slate-500">
                    Cohort Size: <strong className="text-slate-800">{dept.totalStudents} Students</strong>
                  </span>
                </CardHeader>

                <CardContent className="p-5">
                  <div className="overflow-x-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                      {dept.competencies.map((comp) => {
                        const isSelected = activeCompetency?.skillId === comp.skillId;
                        return (
                          <div
                            key={comp.skillId}
                            onClick={() => setActiveCompetency(comp)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${getHeatmapColor(
                              comp.status,
                              comp.demonstratedPercent
                            )} ${isSelected ? "ring-2 ring-blue-500 scale-[1.02]" : ""}`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                                {comp.category}
                              </span>
                              <span className="text-xs font-black">
                                {comp.demonstratedPercent}%
                              </span>
                            </div>

                            <p className="text-xs font-bold leading-tight line-clamp-2 h-8">
                              {comp.skillName}
                            </p>

                            <div className="mt-2 text-[10px] opacity-80 flex items-center justify-between pt-1 border-t border-black/10">
                              <span>Verified: {comp.verifiedCount}</span>
                              <span>Missing: {comp.missingCount}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Drilldown Drawer / Card when a competency is clicked */}
            {activeCompetency && (
              <Card className="border border-blue-300 shadow-md bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-base font-bold text-slate-900">
                        Competency Deep Dive: {activeCompetency.skillName}
                      </CardTitle>
                    </div>
                    <Badge
                      className={`text-xs ${
                        activeCompetency.status === "STRONG"
                          ? "bg-emerald-100 text-emerald-800"
                          : activeCompetency.status === "CRITICAL"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {activeCompetency.status} INDEX
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 text-[11px]">Total Demonstrated</span>
                      <p className="text-lg font-extrabold text-blue-600 mt-0.5">
                        {activeCompetency.demonstratedPercent}%
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 text-[11px]">Verified Credentials</span>
                      <p className="text-lg font-extrabold text-emerald-600 mt-0.5">
                        {activeCompetency.verifiedCount}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 text-[11px]">Self-Reported Only</span>
                      <p className="text-lg font-extrabold text-amber-600 mt-0.5">
                        {activeCompetency.selfReportedCount}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 text-[11px]">Unassessed Students</span>
                      <p className="text-lg font-extrabold text-rose-600 mt-0.5">
                        {activeCompetency.missingCount}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-slate-600">
                      Benchmark coverage attainment:{" "}
                      <strong>{activeCompetency.benchmarkCoveragePercent}%</strong> of council standard.
                    </p>
                    <Link href="/institution/training">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5">
                        Create Targeted Training Workshop
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
