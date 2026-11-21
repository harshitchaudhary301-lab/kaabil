"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ArrowUpRight,
  Filter,
  Download,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmployerAnalyticsData } from "@/types/employer";

export default function EmployerAnalyticsPage() {
  const [analytics, setAnalytics] = useState<EmployerAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/employer/analytics");
        const data = await res.json();
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
        }
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <PortalLayout
      portalName="Employer Console"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Analytics", "Recruitment Intelligence"]}
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Recruitment Intelligence & Hiring Funnel
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Descriptive metrics on candidate volume, conversion rates, and educational stream distribution.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => window.print()}
            className="text-xs border-slate-200 text-slate-700 flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Export Summary
          </Button>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-slate-500">Aggregating recruitment data...</p>
          </div>
        ) : !analytics ? (
          <div className="py-16 text-center text-sm text-slate-500">Analytics unavailable</div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardContent className="pt-4 pb-4">
                  <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                    <span>Active Postings</span>
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {analytics.activeOpportunities}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    of {analytics.totalOpportunities} total created
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm bg-white">
                <CardContent className="pt-4 pb-4">
                  <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                    <span>Total Applicants</span>
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {analytics.totalApplications}
                  </div>
                  <div className="text-[11px] text-purple-600 font-medium mt-0.5">
                    100% Verified Identity
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm bg-white">
                <CardContent className="pt-4 pb-4">
                  <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                    <span>Conversion Rate</span>
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {analytics.conversionRatePct}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Application to Hire</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm bg-white">
                <CardContent className="pt-4 pb-4">
                  <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                    <span>Avg Review Speed</span>
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {analytics.averageReviewDays} Days
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">From submit to review</div>
                </CardContent>
              </Card>
            </div>

            {/* Recruitment Pipeline Funnel Breakdown */}
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Hiring Stage Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                {[
                  { stage: "APPLIED", label: "Initial Applications", count: analytics.totalApplications, color: "bg-sky-500" },
                  { stage: "SHORTLISTED", label: "Shortlisted Candidates", count: analytics.shortlistedCount, color: "bg-purple-500" },
                  { stage: "INTERVIEWS", label: "Interviews Conducted", count: analytics.interviewsCount, color: "bg-amber-500" },
                  { stage: "OFFERS", label: "Offers Issued", count: analytics.offersCount, color: "bg-emerald-500" },
                  { stage: "HIRED", label: "Completed Hires", count: analytics.hiresCount, color: "bg-green-600" },
                ].map((item, idx) => {
                  const pct = analytics.totalApplications > 0
                    ? Math.round((item.count / analytics.totalApplications) * 100)
                    : 0;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>{item.label}</span>
                        <span>
                          {item.count} candidates <span className="text-slate-400">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(item.count > 0 ? 5 : 0, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Stream Distribution & Compliance Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Applicant Volume by Educational Stream
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2.5">
                  {Object.entries(analytics.streamDistribution).length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No stream application data recorded yet.</div>
                  ) : (
                    Object.entries(analytics.streamDistribution).map(([stream, count]) => (
                      <div key={stream} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                        <span className="text-slate-700 font-medium">{stream.replace(/_/g, " ")}</span>
                        <Badge variant="secondary" className="text-xs font-bold bg-slate-100 text-slate-700">
                          {count}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Statutory Recruitment Compliance Notice
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-xs text-slate-600 space-y-2.5 leading-relaxed">
                  <p>
                    <strong>1. Equal Opportunity Standard:</strong> Metrics reflect merit-based competency evaluation
                    without bias regarding educational prestige or background.
                  </p>
                  <p>
                    <strong>2. DPDP Act 2023 Adherence:</strong> Candidate records are anonymized upon application
                    withdrawal and retained solely in compliance with Indian statutory recruitment recordkeeping standards.
                  </p>
                  <p>
                    <strong>3. Human Review Record:</strong> All stage changes and hiring outcomes reflect verified human
                    recruiter decisions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
