"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  LayoutDashboard,
  BrainCircuit,
  Award,
  BookOpenCheck,
  GraduationCap,
  FileBadge,
  Settings,
  Scale,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Target,
  ArrowRight,
  Layers,
  Info,
  Clock,
  Briefcase,
  BookOpen,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CareerDigitalTwinData } from "@/lib/digital-twin/digital-twin-service";



export default function CareerDigitalTwinPage() {
  const [twin, setTwin] = useState<CareerDigitalTwinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTwin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/digital-twin");
      if (res.ok) {
        const data = await res.json();
        setTwin(data.digitalTwin);
      } else if (res.status === 401) {
        setError("Please sign in to view your personalized Career Digital Twin.");
      } else {
        setError("Unable to load Digital Twin. Please ensure your profile is set up.");
      }
    } catch {
      setError("Network connection error retrieving Career Digital Twin.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/student/digital-twin", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setTwin(data.digitalTwin);
      }
    } catch {
      // Fallback
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTwin();
  }, []);

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Student", "Career Digital Twin"]}
    >
      <div className="space-y-8">
        {/* Top Header Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent border border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3">
                <BrainCircuit className="h-3.5 w-3.5" />
                KAABIL Signature Capability Twin • {twin?.algorithmVersion || "v1.0"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-heading">
                Career Digital Twin
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1.5 max-w-2xl leading-relaxed">
                {twin?.summaryHeadline || "Structured dynamic representation of your educational milestones, validated skills, and target career horizons."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="gap-1.5 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Calibrating..." : "Recalibrate Twin"}
              </Button>

              <Link href="/student/dashboard">
                <Button size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/95 text-white">
                  Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-text-secondary">Synthesizing Career Digital Twin metrics...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-4 max-w-lg mx-auto">
            <AlertCircle className="h-10 w-10 text-amber-600 mx-auto" />
            <h3 className="font-heading font-bold text-amber-900 text-lg">
              Digital Twin Setup Notice
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">{error}</p>
            <div className="pt-2 flex justify-center gap-3">
              <Link href="/login">
                <Button size="sm" className="bg-primary text-white text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="outline" size="sm" className="text-xs">
                  Complete Onboarding
                </Button>
              </Link>
            </div>
          </div>
        ) : twin ? (
          /* Main Digital Twin Grid */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top 3 KPI Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Readiness Status */}
              <Card className="p-6 border-border shadow-soft-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Preparation Level
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      twin.readinessStatus === "ADVANCED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : twin.readinessStatus === "COMPETENT"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {twin.readinessStatus}
                  </Badge>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-heading text-4xl font-extrabold text-primary">
                    {twin.readinessScore !== null ? `${twin.readinessScore}%` : "Incomplete"}
                  </span>
                  {twin.readinessScore !== null && (
                    <span className="text-xs text-text-secondary">CRI Index</span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  {twin.readinessScore !== null
                    ? "Calculated based on stage-appropriate preparation benchmarks."
                    : "Complete initial learning activities to calculate benchmark score."}
                </p>
              </Card>

              {/* Card 2: Skill Portfolio */}
              <Card className="p-6 border-border shadow-soft-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Skill Portfolio
                  </span>
                  <Award className="h-4 w-4 text-secondary" />
                </div>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="font-heading text-4xl font-extrabold text-secondary">
                    {twin.skills.totalCount}
                  </span>
                  <span className="text-xs text-text-secondary">
                    Total Documented Skills
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {twin.skills.verifiedCount} Verified
                  </span>
                  <span className="text-text-secondary">•</span>
                  <span className="text-text-secondary">
                    {twin.skills.selfReportedCount} Self-Reported
                  </span>
                </div>
              </Card>

              {/* Card 3: Learning Velocity */}
              <Card className="p-6 border-border shadow-soft-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Learning Velocity
                  </span>
                  <TrendingUp className="h-4 w-4 text-sky-600" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-heading text-4xl font-extrabold text-sky-700">
                    {twin.learningVelocityScore}
                  </span>
                  <span className="text-xs text-text-secondary">/ 100 consistency index</span>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Reflects {twin.learningProgress.dailyMissionsCompleted} daily missions and {twin.learningProgress.completedMilestones} milestones.
                </p>
              </Card>
            </div>

            {/* Target Career Horizons & Development Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column (7 cols): Target Careers & Skills */}
              <div className="lg:col-span-7 space-y-6">
                {/* Target Careers */}
                <Card className="p-6 border-border shadow-soft-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-lg font-bold text-text-primary flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Active Career Horizons
                    </h3>
                    <Link href="/compare" className="text-xs text-primary font-semibold hover:underline">
                      Compare Pathways &rarr;
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {twin.targetCareers.map((c) => (
                      <div
                        key={c.slug}
                        className="p-4 rounded-xl border border-border bg-slate-50/70 hover:bg-white hover:border-primary/30 transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] bg-white">
                              {c.stream.replace(/_/g, " ")}
                            </Badge>
                            {c.regulatoryBody && (
                              <span className="text-[11px] text-text-secondary">
                                {c.regulatoryBody}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-sm text-text-primary">
                            {c.title}
                          </h4>
                        </div>
                        <Link href={`/careers/${c.slug}`}>
                          <Button size="sm" variant="ghost" className="text-xs text-primary gap-1">
                            Details <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Skill Genome: Verified vs Self-Reported */}
                <Card className="p-6 border-border shadow-soft-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-text-primary flex items-center gap-2">
                        <Award className="h-4 w-4 text-secondary" />
                        Skill Genome Profile
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Clearly distinguishes self-reported competence from objective assessment evidence.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Verified Skills */}
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Verified Skills ({twin.skills.verifiedCount})
                      </span>
                      {twin.skills.verified.length === 0 ? (
                        <p className="text-xs text-text-secondary italic p-3 rounded-lg bg-slate-50 border border-border/80">
                          No verified assessment credentials yet. Verified scores are earned through formal competency missions and verified certifications.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {twin.skills.verified.map((s, idx) => (
                            <Badge
                              key={idx}
                              className="bg-emerald-50 text-emerald-800 border-emerald-300 text-xs py-1 px-2.5"
                            >
                              ✓ {s.name} ({s.proficiencyLevel})
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Self-Reported Skills */}
                    <div className="pt-3 border-t border-border/60">
                      <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">
                        Self-Reported Skills ({twin.skills.selfReportedCount})
                      </span>
                      {twin.skills.selfReported.length === 0 ? (
                        <p className="text-xs text-text-secondary italic">
                          No self-reported skills added yet. Update your profile in Settings.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {twin.skills.selfReported.map((s, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-slate-50 text-text-primary"
                            >
                              {s.name} • {s.proficiencyLevel}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column (5 cols): Development Areas & Progress */}
              <div className="lg:col-span-5 space-y-6">
                {/* Priority Development Areas */}
                <Card className="p-6 border-border shadow-soft-sm">
                  <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Priority Development Areas
                  </h3>
                  <p className="text-xs text-text-secondary mb-4">
                    High-importance skills required for your target career not yet in your active portfolio.
                  </p>

                  <div className="space-y-2.5">
                    {twin.developmentAreas.length === 0 ? (
                      <p className="text-xs text-text-secondary italic">
                        All primary benchmark skills are currently present in your profile!
                      </p>
                    ) : (
                      twin.developmentAreas.map((area, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-border bg-slate-50/60 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-text-primary block">
                              {area.skillName}
                            </span>
                            <span className="text-[10px] text-text-secondary">
                              Target: {area.targetCareerTitle}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[10px] bg-white text-primary border-primary/20">
                            {area.importance}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Multi-disciplinary Profile (NEP 2020) */}
                <Card className="p-6 border-border shadow-soft-sm">
                  <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2 mb-3">
                    <Layers className="h-4 w-4 text-secondary" />
                    Educational Trajectory
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-border/60">
                      <span className="text-text-secondary">Current Stage:</span>
                      <span className="font-semibold text-text-primary">{twin.currentStageLabel}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/60">
                      <span className="text-text-secondary">Primary Stream:</span>
                      <span className="font-semibold text-text-primary">{twin.primaryStreamLabel}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary block mb-1.5">Academic Interests:</span>
                      <div className="flex flex-wrap gap-1">
                        {twin.interests.map((interest, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-text-secondary font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Statutory Educational Notice */}
            <div className="p-4 rounded-xl bg-slate-50 border border-border flex items-start gap-3 text-xs text-text-secondary">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-text-primary block">Educational Notice & Governance Disclaimer:</strong>
                <p className="mt-0.5">{twin.disclaimer}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PortalLayout>
  );
}
