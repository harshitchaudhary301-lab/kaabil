"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Building,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Plus,
  BarChart3,
  Calendar,
  Sparkles,
  Award,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EmployerOrganizationRecord,
  JobOpportunityRecord,
  EmployerAnalyticsData,
} from "@/types/employer";

export default function EmployerDashboardPage() {
  const [organization, setOrganization] = useState<EmployerOrganizationRecord | null>(null);
  const [analytics, setAnalytics] = useState<EmployerAnalyticsData | null>(null);
  const [opportunities, setOpportunities] = useState<JobOpportunityRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const [profRes, oppsRes] = await Promise.all([
        fetch("/api/employer/profile"),
        fetch("/api/employer/opportunities"),
      ]);

      const [profData, oppsData] = await Promise.all([profRes.json(), oppsRes.json()]);

      if (profData.success) {
        setOrganization(profData.organization);
        setAnalytics(profData.analytics);
      }
      if (oppsData.success) {
        setOpportunities(oppsData.opportunities || []);
      }
    } catch (err) {
      console.error("Failed to load employer dashboard", err);
    } finally {
      setLoading(false);
    }
  }

  const isVerified = organization?.verificationStatus === "VERIFIED";

  return (
    <PortalLayout
      portalName="Employer Portal"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Recruitment", organization?.name || "Command Center"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Title & Organization Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-soft-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-[#4169E1]">
                <Building className="h-6 w-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {organization?.name || "Apex Healthcare & Diagnostic Systems"}
                  </h1>
                  <Badge
                    variant="outline"
                    className={`text-[11px] px-2.5 py-0.5 font-semibold ${
                      isVerified
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {organization?.verificationStatus || "PENDING_REVIEW"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {organization?.industry} • {organization?.city}, {organization?.state} • CIN:{" "}
                  {organization?.registrationNumber || "CIN-U85110DL2018PTC329104"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/employer/opportunities/new">
              <Button className="bg-[#4169E1] hover:bg-blue-700 text-white gap-1.5 text-xs font-semibold shadow-sm h-9">
                <Plus className="w-4 h-4" /> Post Opportunity
              </Button>
            </Link>
          </div>
        </div>

        {/* DPDP Act 2023 Child Safety & Verification Notices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DPDP Safeguard */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <strong className="font-semibold block text-emerald-950 mb-0.5">
                DPDP Act (2023) Statutory Safeguard: Verified Adult Learners Only
              </strong>
              Under India&apos;s Digital Personal Data Protection Act, 2023, school students (Class 8–10 or age &lt;18)
              are strictly shielded from commercial talent discovery and employer databases. Only verified adult candidates (18+)
              participate in hiring workflows.
            </div>
          </div>

          {/* Verification Status Banner */}
          {!isVerified ? (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong className="font-semibold block text-amber-950 mb-0.5">
                    Company Verification Pending
                  </strong>
                  Your organization must be verified by the KAABIL Trust &amp; Verification Directorate before publishing live opportunities to students.
                </div>
              </div>
              <Link href="/employer/verification">
                <Button size="sm" variant="outline" className="text-xs border-amber-300 text-amber-800 hover:bg-amber-100 whitespace-nowrap">
                  Verify Now →
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
              <Award className="w-5 h-5 text-[#4169E1] mt-0.5 shrink-0" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <strong className="font-semibold block text-blue-950 mb-0.5">
                  Verified Corporate Employer
                </strong>
                Verified on {organization?.verifiedAt ? new Date(organization.verifiedAt).toLocaleDateString() : "Active"}. You are authorized to publish skills-first vacancies and request campus recruitment drives.
              </div>
            </div>
          )}
        </div>

        {/* Core KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 bg-white shadow-soft-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Active Opportunities</span>
                <Briefcase className="h-4 w-4 text-[#4169E1]" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {analytics?.activeOpportunities ?? 0}
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Out of {analytics?.totalOpportunities ?? 0} total listings
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-soft-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Total Applications</span>
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {analytics?.totalApplications ?? 0}
              </div>
              <p className="text-[10px] text-purple-700 font-semibold mt-1">
                Across all educational streams
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-soft-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>In Interview Stage</span>
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {analytics?.interviewsCount ?? 0}
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Scheduled &amp; active evaluations
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-soft-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Confirmed Hires</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {analytics?.hiresCount ?? 0}
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                {analytics?.conversionRatePct ?? 0}% overall recruitment conversion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/employer/opportunities"
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-[#4169E1] transition-all flex items-center justify-between group shadow-xs"
          >
            <div>
              <div className="text-xs font-semibold text-slate-900 group-hover:text-[#4169E1] transition-colors">
                Opportunities
              </div>
              <div className="text-[11px] text-slate-500">Manage job postings</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/employer/applications"
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-purple-500 transition-all flex items-center justify-between group shadow-xs"
          >
            <div>
              <div className="text-xs font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                Applications
              </div>
              <div className="text-[11px] text-slate-500">Review candidates</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/employer/pipeline"
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-500 transition-all flex items-center justify-between group shadow-xs"
          >
            <div>
              <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                Pipeline
              </div>
              <div className="text-[11px] text-slate-500">Kanban recruitment</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/employer/campus"
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 transition-all flex items-center justify-between group shadow-xs"
          >
            <div>
              <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Campus Drives
              </div>
              <div className="text-[11px] text-slate-500">College partnerships</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Active Opportunities Table */}
        <Card className="border-slate-200 bg-white shadow-soft-xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#4169E1]" />
                Recent Opportunities
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Skills-first vacancies across all educational streams
              </p>
            </div>
            <Link href="/employer/opportunities" className="text-xs text-[#4169E1] font-semibold hover:underline">
              View All ({opportunities.length}) →
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Loading opportunities...
              </div>
            ) : opportunities.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-800">No opportunities posted yet</p>
                <p className="text-slate-400 mt-1">Create your first skills-first job posting.</p>
                <Link href="/employer/opportunities/new">
                  <Button size="sm" className="mt-3 bg-[#4169E1] text-white text-xs">
                    Post Opportunity
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {opportunities.slice(0, 5).map((opp) => (
                  <div key={opp.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{opp.title}</span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-2 py-0.2 ${
                            opp.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {opp.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {opp.stream.replace(/_/g, " ")} • {opp.opportunityType.replace("_", " ")} • {opp.workplaceType}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="font-semibold text-slate-900 block">{opp.totalApplications || 0}</span>
                        <span className="text-[10px] text-slate-400">Applications</span>
                      </div>
                      <Link href={`/employer/applications?opportunityId=${opp.id}`}>
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          Pipeline →
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
