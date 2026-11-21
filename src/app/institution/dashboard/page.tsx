"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  Download,
  CheckCircle2,
  Filter,
  UserPlus,
  FileSpreadsheet,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  RefreshCw,
  Award,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstitutionDashboardStats } from "@/types/institution";
import { INSTITUTION_NAV } from "@/components/institution/institution-nav";

export default function InstitutionDashboardPage() {
  const [stats, setStats] = useState<InstitutionDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [streamFilter, setStreamFilter] = useState("ALL");

  const loadStats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (departmentFilter !== "ALL") params.set("departmentId", departmentFilter);
      if (streamFilter !== "ALL") params.set("stream", streamFilter);

      const res = await fetch(`/api/institution/profile?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [departmentFilter, streamFilter]);

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Overview", stats?.institution?.name || "Institution Intelligence Console"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Title & Institution Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-soft-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-secondary/10 text-secondary">
                <Building2 className="h-5 w-5" />
              </span>
              <h1 className="font-heading text-2xl font-bold text-slate-900">
                {stats?.institution?.name || "Delhi Technical Campus"}
              </h1>
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                {stats?.institution?.verificationStatus || "VERIFIED"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {stats?.institution?.registrationNumber || "AISHE-C-29104"} &bull; {stats?.institution?.accreditationBody || "NAAC A+"} &bull; {stats?.institution?.city}, {stats?.institution?.state}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/institution/students">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <UserPlus className="h-3.5 w-3.5" />
                Enroll Student
              </Button>
            </Link>

            <Link href="/institution/students/import">
              <Button size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/95 text-white">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Bulk CSV Import
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <span>Telemetry Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="dept-cse">Computer Science &amp; AI</option>
              <option value="dept-ece">Electronics &amp; Embedded Systems</option>
            </select>

            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none"
            >
              <option value="ALL">All Educational Streams</option>
              <option value="NON_MEDICAL_PCM">Non-Medical / STEM</option>
              <option value="MEDICAL_PCB">Medical &amp; Healthcare</option>
              <option value="COMMERCE">Commerce &amp; Finance</option>
              <option value="MANAGEMENT">Management</option>
              <option value="ARTS_HUMANITIES">Arts &amp; Humanities</option>
              <option value="VOCATIONAL_TRADES">Vocational Trades</option>
            </select>

            <Button
              size="sm"
              variant="ghost"
              onClick={loadStats}
              className="h-8 px-2 text-slate-500 hover:text-slate-800"
              title="Refresh Stats"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* 4 Core KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 bg-white shadow-soft-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Total Enrolled Students</span>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {stats?.metrics.totalStudents ?? 0}
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                {stats?.metrics.activeStudents ?? 0} active in current academic session
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-soft-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Average Career Readiness (CRI)</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {stats?.metrics.avgReadinessIndex ?? 0}/100
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${stats?.metrics.avgReadinessIndex ?? 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-soft-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Onboarding Completed</span>
                <CheckCircle2 className="h-4 w-4 text-accent" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {stats?.metrics.onboardingCompletionPercentage ?? 0}%
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Digital Twin profiles generated
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-soft-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Faculty &amp; Departments</span>
                <GraduationCap className="h-4 w-4 text-secondary" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {stats?.metrics.totalFaculty ?? 0}
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Across {stats?.metrics.totalDepartments ?? 0} departments &bull; {stats?.metrics.totalPrograms ?? 0} programs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Institutional Intelligence & Action Center (Part E2) */}
        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 p-5 rounded-2xl border border-blue-100/80 shadow-soft-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4169E1]" />
                Institutional Intelligence & Proactive Interventions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-stream skill heatmaps, adaptive training recommendations, and NAAC/NIRF outcome analytics.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/institution/analytics"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-[#4169E1] transition-all flex flex-col justify-between group shadow-xs"
            >
              <div className="text-xs font-semibold text-slate-800 group-hover:text-[#4169E1] transition-colors">
                Skill Heatmap
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                <span>Multi-stream</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <Link
              href="/institution/industry-demand"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-[#4169E1] transition-all flex flex-col justify-between group shadow-xs"
            >
              <div className="text-xs font-semibold text-slate-800 group-hover:text-[#4169E1] transition-colors">
                Industry Demand
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                <span>Sector trends</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <Link
              href="/institution/interventions"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-500 transition-all flex flex-col justify-between group shadow-xs"
            >
              <div className="text-xs font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
                Interventions
              </div>
              <div className="text-[11px] text-amber-600 font-medium mt-2 flex items-center justify-between">
                <span>Proactive triage</span>
                <ArrowRight className="w-3 h-3 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <Link
              href="/institution/training"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-500 transition-all flex flex-col justify-between group shadow-xs"
            >
              <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                Smart Workshops
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                <span>Adaptive training</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <Link
              href="/institution/placements"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-purple-500 transition-all flex flex-col justify-between group shadow-xs"
            >
              <div className="text-xs font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">
                Campus Drives
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                <span>Adult placements</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <Link
              href="/institution/reports"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 transition-all flex flex-col justify-between group shadow-xs"
            >
              <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                Outcome Reports
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                <span>NAAC &bull; NIRF &bull; NBA</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Middle Two-Column Grid: Stream Breakdown & Readiness Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stream Distribution */}
          <Card className="border-slate-200 bg-white shadow-soft-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Educational Stream Enrollment Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {stats?.streamDistribution && stats.streamDistribution.length > 0 ? (
                stats.streamDistribution.map((st, idx) => {
                  const pct =
                    stats.metrics.totalStudents > 0
                      ? Math.round((st.studentCount / stats.metrics.totalStudents) * 100)
                      : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{st.streamTitle}</span>
                        <span>{st.studentCount} students ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic">No stream enrollment records found for selected filter.</p>
              )}
            </CardContent>
          </Card>

          {/* Readiness Distribution */}
          <Card className="border-slate-200 bg-white shadow-soft-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Student Career Readiness Cohort Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">Advanced (75-100)</span>
                  <span className="text-2xl font-black text-emerald-700">
                    {stats?.readinessDistribution.advanced ?? 0}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">High Industry Readiness</span>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-[11px] font-bold text-blue-800 uppercase block">Competent (50-74)</span>
                  <span className="text-2xl font-black text-blue-700">
                    {stats?.readinessDistribution.competent ?? 0}
                  </span>
                  <span className="text-[10px] text-blue-600 block mt-0.5">On-Track Progression</span>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-800 uppercase block">Developing (1-49)</span>
                  <span className="text-2xl font-black text-amber-700">
                    {stats?.readinessDistribution.developing ?? 0}
                  </span>
                  <span className="text-[10px] text-amber-600 block mt-0.5">Recommended Interventions</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 uppercase block">Unassessed</span>
                  <span className="text-2xl font-black text-slate-600">
                    {stats?.readinessDistribution.unassessed ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Pending Diagnostic</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Student Invitation Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-slate-200 bg-white shadow-soft-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                Recent Institutional Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-semibold text-slate-800">{act.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No recent institutional activities recorded.</p>
              )}
            </CardContent>
          </Card>

          {/* Student Join Invitation Code Card */}
          <Card className="border-secondary/20 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 shadow-soft-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary" />
                Campus Join Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-600">
                Share this secure 8-character invitation code with your students to connect their personal accounts with your campus cohort.
              </p>
              <div className="p-3 bg-white rounded-xl border border-secondary/30 text-center space-y-1">
                <span className="text-xs text-slate-400 uppercase font-semibold">Campus Code</span>
                <div className="text-2xl font-black font-mono tracking-wider text-secondary">
                  {stats?.institution?.invitationCode || "DTC-2026"}
                </div>
              </div>
              <div className="text-[11px] text-slate-500 space-y-1">
                <p>&bull; Under-18 students will require guardian authorization.</p>
                <p>&bull; Private mentor conversations are never exposed to campus admins.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
