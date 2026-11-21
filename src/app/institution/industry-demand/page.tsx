"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Filter,
  CheckCircle2,
  Building2,
  TrendingUp,
  ShieldCheck,
  Calendar,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Award,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { INSTITUTION_NAV } from "@/components/institution/institution-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IndustryDemandRecord } from "@/types/institution";

const STREAM_OPTIONS = [
  "All Streams",
  "NON_MEDICAL_PCM",
  "MEDICAL_PCB",
  "COMMERCE",
  "LAW",
  "VOCATIONAL_TRADES",
  "CREATIVE_DESIGN",
  "AGRICULTURE",
];

export default function IndustryDemandPage() {
  const [demands, setDemands] = useState<IndustryDemandRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [streamFilter, setStreamFilter] = useState<string>("All Streams");

  const fetchDemand = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = streamFilter !== "All Streams" ? `?stream=${streamFilter}` : "";
      const res = await fetch(`/api/institution/analytics/industry-demand${q}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setDemands(data.demands || []);
      } else {
        setError(data.error || "Failed to load industry demand intelligence");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to institutional services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemand();
  }, [streamFilter]);

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Institution", "Industry Demand Intelligence"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Link href="/institution/analytics" className="hover:text-blue-600 flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                Skill Analytics
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-medium">Industry Demand</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              Industry Demand Intelligence & Curated Benchmarks
            </h1>
            <p className="text-sm text-slate-500">
              Statutory council and industry skill requirements across India&apos;s key economic sectors with verified source attribution.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Filter Disciplinary Stream:</span>
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

          <div className="text-xs text-slate-500 hidden sm:block">
            Showing <strong className="text-slate-800">{demands.length}</strong> Industry Benchmark Sectors
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Loading verified sector demand benchmarks...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-600" />
            <p className="text-sm font-semibold">{error}</p>
            <Button onClick={fetchDemand} variant="outline" className="mt-3 text-xs">
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {demands.map((demand) => (
              <Card key={demand.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                        {demand.sector}
                      </span>
                      <Badge
                        className={`text-[10px] ${
                          demand.growthTrend === "HIGH"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : demand.growthTrend === "EMERGING"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {demand.growthTrend} GROWTH
                      </Badge>
                    </div>

                    <CardTitle className="text-base font-bold text-slate-900 mt-1 leading-snug">
                      {demand.roleTitle}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      Stream: {demand.stream.replace(/_/g, " ")}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block mb-2">
                        High-Demand Priority Competencies:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {demand.topSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Footer Attribution */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 rounded-b-xl text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Award className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>Source: {demand.sourceAttribution}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Audited: {demand.collectionDate}
                    </span>
                    <span className="text-emerald-700 font-mono">
                      {demand.verificationStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
