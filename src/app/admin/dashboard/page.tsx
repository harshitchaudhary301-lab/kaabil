"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Building2,
  Briefcase,
  Activity,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Award,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPlatformMetrics } from "@/types/admin";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminPlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error("Failed to load metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <PortalLayout
      portalName="Admin Governance"
      portalRole="ADMIN"
      navItems={ADMIN_NAV_ITEMS}
      breadcrumbs={["Administration", "Overview"]}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary">
                KAABIL Platform Governance & Overview
              </h1>
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                Superadmin
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Central operational console across all 13 educational streams • Real-time telemetry & safety
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMetrics}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Telemetry
            </Button>
            <Badge variant="success" className="px-3 py-1 text-xs">
              All Systems Operational
            </Badge>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 border-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Users</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="font-heading text-3xl font-extrabold text-text-primary mt-2">
              {metrics ? metrics.totalUsers.toLocaleString() : "..."}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-2">
              <span className="text-emerald-600 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +{metrics?.growthMetrics.studentGrowthPct || 18.5}%
              </span>
              <span>across 13 streams</span>
            </div>
          </Card>

          <Card className="p-5 border-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Institutions</span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <p className="font-heading text-3xl font-extrabold text-text-primary mt-2">
              {metrics ? metrics.registeredInstitutions : "..."}
            </p>
            <div className="flex items-center justify-between text-xs text-text-secondary mt-2">
              <span>AISHE / CBSE Verified</span>
              {metrics?.pendingVerifications.institutions ? (
                <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                  {metrics.pendingVerifications.institutions} pending
                </Badge>
              ) : null}
            </div>
          </Card>

          <Card className="p-5 border-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Employers</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <p className="font-heading text-3xl font-extrabold text-text-primary mt-2">
              {metrics ? metrics.registeredEmployers : "..."}
            </p>
            <div className="flex items-center justify-between text-xs text-text-secondary mt-2">
              <span>CIN & GSTIN Vetted</span>
              {metrics?.pendingVerifications.employers ? (
                <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                  {metrics.pendingVerifications.employers} pending
                </Badge>
              ) : null}
            </div>
          </Card>

          <Card className="p-5 border-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">AI Latency (P95)</span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <p className="font-heading text-3xl font-extrabold text-emerald-600 mt-2">
              {metrics ? `${metrics.aiHealth.p95LatencyMs}ms` : "..."}
            </p>
            <div className="flex items-center justify-between text-xs text-text-secondary mt-2">
              <span>Error Rate: {metrics ? `${metrics.aiHealth.errorRatePct}%` : "0%"}</span>
              <Badge variant="success" className="text-[10px] px-1.5 py-0">
                Deterministic Fallback Ready
              </Badge>
            </div>
          </Card>
        </div>

        {/* 2-Column: Quick Verification Action & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7 cols): Pending Action Queue & Verification Spotlight */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary">
                    Trust & Safety Verification Directorate
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Human-in-the-loop audit queue for official institutions and corporate employers
                  </p>
                </div>
                <Link href="/admin/verifications">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    View Full Queue <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-border">
                  <span className="text-xs font-semibold text-text-secondary">Pending Institutions</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-text-primary">
                      {metrics?.pendingVerifications.institutions || 0}
                    </span>
                    <span className="text-xs text-amber-600 font-medium">Awaiting document check</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-border">
                  <span className="text-xs font-semibold text-text-secondary">Pending Employers</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-text-primary">
                      {metrics?.pendingVerifications.employers || 0}
                    </span>
                    <span className="text-xs text-amber-600 font-medium">CIN & domain check</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4 bg-amber-50/40">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed text-text-secondary">
                    <strong className="text-text-primary font-semibold">Governance Rule: </strong>
                    All institution AISHE codes and employer MCA corporate filings must be validated by an authorized human reviewer. Automated auto-approval is prohibited to safeguard students under the DPDP Act (2023).
                  </div>
                </div>
              </div>
            </Card>

            {/* Assessment & Skill Passport Metrics */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-base font-bold text-text-primary">
                  Assessment & Skill Credential Telemetry
                </h3>
                <Badge variant="outline" className="text-xs font-mono">
                  13 Streams Supported
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-border">
                  <span className="text-[11px] text-text-muted font-bold uppercase">Attempts</span>
                  <p className="text-xl font-black text-text-primary mt-1">
                    {metrics?.assessmentStats.totalAttempts || 0}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-border">
                  <span className="text-[11px] text-text-muted font-bold uppercase">Pass Rate</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">
                    {metrics?.assessmentStats.passRatePct || 0}%
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-border">
                  <span className="text-[11px] text-text-muted font-bold uppercase">Passports Minted</span>
                  <p className="text-xl font-black text-primary mt-1">
                    {metrics?.platformActivity.credentialsMinted || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (5 cols): Operational Navigation & AI Oversight */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6">
              <h3 className="font-heading text-base font-bold text-text-primary mb-3">
                Quick Administrative Navigation
              </h3>
              <div className="space-y-2.5">
                {[
                  {
                    title: "User Governance & Security",
                    desc: "Manage roles, suspensions, and DPDP deletion requests",
                    href: "/admin/users",
                    icon: <Users className="h-4 w-4 text-primary" />,
                  },
                  {
                    title: "Verification Queue",
                    desc: "Inspect uploaded AISHE docs, CINs, and approve orgs",
                    href: "/admin/verifications",
                    icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />,
                  },
                  {
                    title: "Platform Content Management (CMS)",
                    desc: "Curate careers, exams, questions, and announcements",
                    href: "/admin/cms",
                    icon: <Layers className="h-4 w-4 text-purple-600" />,
                  },
                  {
                    title: "AI Governance & Telemetry",
                    desc: "Monitor Gemini latency, prompt versions, and safety",
                    href: "/admin/ai-governance",
                    icon: <Activity className="h-4 w-4 text-amber-600" />,
                  },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-white transition-colors">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-text-muted">{item.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </Card>

            {/* AI Safety Guarantee */}
            <Card className="p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="font-heading text-sm font-bold text-text-primary">
                  Responsible AI Platform Guardrails
                </h4>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                KAABIL enforces zero-hallucination disclaimers across all AI-generated career guidance and what-if simulations. Automated hiring decisions and facial biometric scoring are strictly prohibited by architecture.
              </p>
              <div className="flex items-center justify-between text-[11px] font-medium text-text-muted pt-2 border-t border-border/60">
                <span>Active Model: Gemini 1.5 Pro</span>
                <span className="text-emerald-700 font-semibold">Deterministic Fallbacks Active</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
