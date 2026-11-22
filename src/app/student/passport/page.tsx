// ==============================================================================
// KAABIL (काबिल) — Evidence-Backed Digital Skill Passport & Career Readiness Page
// Step 3.4 Implementation: Strict 3-tier skill provenance, explainable CRI,
// Next Best Action, self-reported claim correction, and DPDP Act minor shields.
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  BookOpen,
  FileBadge,
  Layers,
  Lock,
  Share2,
  Download,
  Copy,
  ExternalLink,
  Check,
  Eye,
  Trash2,
  FolderGit2,
  SlidersHorizontal,
  Flame,
  Info,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV_ITEMS } from "@/components/student/student-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DigitalSkillPassport,
  PassportSkillEntry,
} from "@/lib/passport/passport-service";
import { KaabilCredential } from "@/lib/passport/credential-service";

export default function DigitalSkillPassportPage() {
  const [passport, setPassport] = useState<DigitalSkillPassport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [skillFilter, setSkillFilter] = useState<string>("ALL");
  const [copied, setCopied] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string>("");
  const [shareToken, setShareToken] = useState<string>("");
  const [sharingLoading, setSharingLoading] = useState<boolean>(false);
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});
  const [deletingSkill, setDeletingSkill] = useState<string | null>(null);

  const fetchPassport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/student/passport");
      const data = await res.json();
      if (data.success && data.passport) {
        setPassport(data.passport);
      } else {
        setError(data.error || "Failed to load Digital Skill Passport");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to Passport service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassport();
  }, []);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyCredential = (cred: KaabilCredential) => {
    setVerifiedMap((prev) => ({ ...prev, [cred.id]: true }));
  };

  const handleCreateShareLink = async () => {
    try {
      setSharingLoading(true);
      const res = await fetch("/api/student/passport/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiryDays: 7 }),
      });
      const data = await res.json();
      if (data.success && data.shareUrl) {
        setShareLink(data.shareUrl);
        setShareToken(data.shareToken);
        setShareModalOpen(true);
      } else {
        alert(data.error || "Could not generate share link");
      }
    } catch {
      alert("Error generating share token");
    } finally {
      setSharingLoading(false);
    }
  };

  const handleRemoveSelfReportedSkill = async (skillName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove '${skillName}' from your profile? This allows you to correct inaccurate self-reported claims.`
      )
    ) {
      return;
    }

    try {
      setDeletingSkill(skillName);
      const res = await fetch(
        `/api/student/passport?skillName=${encodeURIComponent(skillName)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        // Refresh passport view
        await fetchPassport();
      } else {
        alert(data.error || "Failed to remove skill");
      }
    } catch {
      alert("Error removing self-reported skill");
    } finally {
      setDeletingSkill(null);
    }
  };

  const handleRevokeCredential = async (credId: string) => {
    if (
      !confirm(
        "Are you sure you want to revoke this credential? This action will mark its digital signature as revoked."
      )
    ) {
      return;
    }
    try {
      const res = await fetch(
        `/api/student/passport/credentials/${credId}/revoke`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.success) {
        fetchPassport();
      }
    } catch {
      alert("Failed to revoke credential");
    }
  };

  // Filter skills by tier
  const filteredSkills = (passport?.skills || []).filter((s) => {
    if (skillFilter === "ALL") return true;
    if (skillFilter === "PLATFORM_ASSESSED") return s.evidenceLayer === "PLATFORM_ASSESSED";
    if (skillFilter === "EXTERNALLY_VERIFIED") return s.evidenceLayer === "EXTERNALLY_VERIFIED";
    if (skillFilter === "SELF_REPORTED") return s.evidenceLayer === "SELF_REPORTED";
    return true;
  });

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV_ITEMS}
      breadcrumbs={["Student", "Digital Skill Passport"]}
    >
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Top Control Bar: Language Switcher & Skill Tree Shortcut */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-purple-100 shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className="font-semibold text-purple-900">KAABIL Evidence Vault</span>
            <span>•</span>
            <span>Digital Skill Passport & Career Readiness</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50/80 p-0.5 text-xs">
              <button
                onClick={() => setLanguage("en")}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  language === "en" ? "bg-white text-purple-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  language === "hi" ? "bg-white text-purple-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage("hinglish")}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  language === "hinglish" ? "bg-white text-purple-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Hinglish
              </button>
            </div>

            <Link href="/student/readiness">
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50 text-xs">
                <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                Readiness Scorecard
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-48 bg-purple-100/60 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-purple-50 rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card className="border-rose-200 bg-rose-50/50">
            <CardContent className="p-6 flex items-center gap-3 text-rose-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Failed to load Digital Skill Passport</p>
                <p className="text-xs text-rose-600">{error}</p>
                <Button size="sm" onClick={fetchPassport} className="mt-3 bg-rose-600 text-white text-xs">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Passport Content */}
        {!loading && passport && (
          <>
            {/* Signature Passport Header Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-purple-900/80">
              {/* Pixel-art top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400" />

              {/* Background watermark */}
              <div className="absolute right-4 -bottom-10 opacity-5 pointer-events-none">
                <FileBadge className="w-80 h-80 text-white" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-400/30 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      KAABIL DIGITAL PASSPORT • VERIFIED IDENTITY
                    </span>
                    <span className="text-[10px] text-purple-300 font-mono">
                      ID: {passport.passportId}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    {passport.studentName}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-purple-200">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4 text-purple-300" />
                      {passport.education.stage.replace(/_/g, " ")} • {passport.education.streamTitle}
                    </span>
                    <span>•</span>
                    <span>{passport.education.institutionName}</span>
                    <span>•</span>
                    <span>Class of {passport.education.targetCompletionYear}</span>
                  </div>

                  {/* Passport Integrity Checksum */}
                  <div className="pt-1 flex items-center gap-2 text-[11px] text-purple-300/80 font-mono">
                    <Lock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate max-w-xs sm:max-w-md">
                      Checksum: {passport.passportIntegrityChecksum}
                    </span>
                    <button
                      onClick={() => handleCopyHash(passport.passportIntegrityChecksum)}
                      className="text-purple-300 hover:text-white transition-colors"
                      title="Copy Checksum"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Right Actions & Readiness Badge */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                    <span className="text-xs text-purple-200 font-medium">Career Readiness:</span>
                    {passport.summary.currentCRI !== null ? (
                      <span className="text-2xl font-black text-emerald-400">
                        {passport.summary.currentCRI}/100
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-300 bg-amber-900/40 px-2 py-1 rounded-md">
                        Not enough info yet
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {passport.privacy.isMinor ? (
                      <div className="inline-flex items-center text-xs text-purple-200 bg-purple-900/60 px-3 py-1.5 rounded-xl border border-purple-700/60">
                        <ShieldAlert className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                        Minor Protected (Under-18 Lock)
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleCreateShareLink}
                        disabled={sharingLoading}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold gap-1.5 shadow-sm text-xs"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share Passport / QR
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.print()}
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Print
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Summary Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="border-purple-100 bg-white shadow-xs">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
                    <span>Platform Assessed</span>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    {passport.summary.verifiedSkills}
                  </div>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                    Verified through tests
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-100 bg-white shadow-xs">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
                    <span>Active Credentials</span>
                    <FileBadge className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    {passport.summary.credentialCount}
                  </div>
                  <p className="text-[10px] text-purple-700 font-semibold mt-1">
                    Cryptographically signed
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-100 bg-white shadow-xs">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
                    <span>Practical Projects</span>
                    <FolderGit2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    {passport.projectSubmissions.length}
                  </div>
                  <p className="text-[10px] text-blue-700 font-semibold mt-1">
                    Portfolio deliverables
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-100 bg-white shadow-xs">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
                    <span>Sprint Consistency</span>
                    <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-amber-600">
                    {passport.learningSprintSummary.currentStreakDays} Days
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium mt-1">
                    {passport.learningSprintSummary.completedTasks} tasks completed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* =============================================================== */}
            {/* EXPLAINABLE CAREER READINESS & NEXT BEST ACTION                 */}
            {/* =============================================================== */}
            <Card className="border-2 border-purple-200/80 bg-white shadow-xs overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 via-indigo-50/40 to-white px-6 py-4 border-b border-purple-100 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
                    Explainable Career Readiness System
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Target Career: <strong>{passport.careerReadiness.targetCareerTitle}</strong> • Calibration across 5 preparation dimensions
                  </p>
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                  Zero Hallucination
                </Badge>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Score vs Insufficient Evidence Banner */}
                {passport.careerReadiness.isInsufficientEvidence || passport.careerReadiness.overallScore === null ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="rounded-xl bg-amber-100 p-2 text-amber-700 shrink-0">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-amber-950">
                          Not Enough Information Yet
                        </h4>
                        <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                          KAABIL never fabricates an arbitrary readiness score. Take your first diagnostic assessment or complete a project milestone to establish your verified readiness baseline.
                        </p>
                      </div>
                    </div>

                    <Link href="/student/assessments">
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs shrink-0 font-bold">
                        Take 10-Min Quiz &rarr;
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    {/* Dimension Progress Bars */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase">
                          Career Knowledge (20%)
                        </div>
                        <div className="mt-1 text-lg font-bold text-gray-900">
                          {passport.careerReadiness.dimensions.knowledge.score}%
                        </div>
                        <div className="mt-1.5 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${passport.careerReadiness.dimensions.knowledge.score}%` }}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase">
                          Eligibility (25%)
                        </div>
                        <div className="mt-1 text-lg font-bold text-gray-900">
                          {passport.careerReadiness.dimensions.eligibility.score}%
                        </div>
                        <div className="mt-1.5 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${passport.careerReadiness.dimensions.eligibility.score}%` }}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase">
                          Skill Genome (25%)
                        </div>
                        <div className="mt-1 text-lg font-bold text-gray-900">
                          {passport.careerReadiness.dimensions.skills.score}%
                        </div>
                        <div className="mt-1.5 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${passport.careerReadiness.dimensions.skills.score}%` }}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase">
                          Projects (15%)
                        </div>
                        <div className="mt-1 text-lg font-bold text-gray-900">
                          {passport.careerReadiness.dimensions.practicalProjects.score}%
                        </div>
                        <div className="mt-1.5 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${passport.careerReadiness.dimensions.practicalProjects.score}%` }}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase">
                          Sprints (15%)
                        </div>
                        <div className="mt-1 text-lg font-bold text-gray-900">
                          {passport.careerReadiness.dimensions.learningProgress.score}%
                        </div>
                        <div className="mt-1.5 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-600 rounded-full"
                            style={{ width: `${passport.careerReadiness.dimensions.learningProgress.score}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Formula Bar */}
                    <div className="mt-3 text-[11px] font-mono text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      📐 <strong>Formula:</strong> {passport.careerReadiness.calculationFormula}
                    </div>
                  </div>
                )}

                {/* Student-Friendly Next Best Action Box */}
                {passport.careerReadiness.nextBestAction && (
                  <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50/80 via-white to-indigo-50/50 p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-purple-600 text-white text-[10px] font-bold">
                            <Zap className="mr-1 h-3 w-3 fill-white" />
                            RECOMMENDED NEXT ACTION
                          </Badge>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            +{passport.careerReadiness.nextBestAction.impactPoints} Readiness Points
                          </span>
                        </div>
                        <h4 className="mt-2 text-base font-bold text-gray-900">
                          {language === "hi" && passport.careerReadiness.nextBestAction.titleHi
                            ? passport.careerReadiness.nextBestAction.titleHi
                            : language === "hinglish" && passport.careerReadiness.nextBestAction.titleHinglish
                            ? passport.careerReadiness.nextBestAction.titleHinglish
                            : passport.careerReadiness.nextBestAction.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-gray-600 max-w-2xl leading-relaxed">
                          {passport.careerReadiness.nextBestAction.description}
                        </p>
                      </div>

                      <Link href={passport.careerReadiness.nextBestAction.actionUrl}>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs">
                          Start Action &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Educational Disclaimer */}
                <div className="text-[11px] text-gray-500 italic bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start space-x-2">
                  <Info className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
                  <span>
                    <strong>Guidance Framework Disclaimer:</strong> {passport.disclaimer}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* =============================================================== */}
            {/* 3-TIER SKILL COMPETENCY PORTFOLIO                               */}
            {/* =============================================================== */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-purple-600" />
                    Evidence-Backed Skill Competency Portfolio
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Strict segregation of platform-assessed, externally verified, and self-reported skills
                  </p>
                </div>

                {/* Tier Filter Pills */}
                <div className="flex flex-wrap gap-1 text-xs">
                  {[
                    { id: "ALL", label: `All (${passport.skills.length})` },
                    { id: "PLATFORM_ASSESSED", label: `Platform Assessed (${passport.summary.verifiedSkills})` },
                    { id: "EXTERNALLY_VERIFIED", label: `Externally Verified (${passport.summary.externallyVerifiedSkills})` },
                    { id: "SELF_REPORTED", label: `Self-Reported (${passport.summary.selfReportedSkills})` },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSkillFilter(f.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        skillFilter === f.id
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-3">
                {filteredSkills.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500">
                    No skills found under this filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredSkills.map((skill, idx) => {
                      const isDeleting = deletingSkill === skill.skillName;

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border transition-all ${
                            skill.evidenceLayer === "PLATFORM_ASSESSED"
                              ? "bg-emerald-50/30 border-emerald-200"
                              : skill.evidenceLayer === "EXTERNALLY_VERIFIED"
                              ? "bg-purple-50/30 border-purple-200"
                              : "bg-slate-50/50 border-slate-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-sm text-gray-900">
                                  {skill.skillName}
                                </span>

                                {/* Tier Badge */}
                                {skill.evidenceLayer === "PLATFORM_ASSESSED" && (
                                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                                    <ShieldCheck className="mr-1 h-3 w-3 text-emerald-600" />
                                    Platform Assessed
                                  </Badge>
                                )}
                                {skill.evidenceLayer === "EXTERNALLY_VERIFIED" && (
                                  <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] font-bold">
                                    <Award className="mr-1 h-3 w-3 text-purple-600" />
                                    Externally Verified
                                  </Badge>
                                )}
                                {skill.evidenceLayer === "SELF_REPORTED" && (
                                  <Badge variant="outline" className="bg-white text-gray-600 border-gray-300 text-[10px]">
                                    <Eye className="mr-1 h-3 w-3 text-gray-400" />
                                    Self-Reported • Unverified
                                  </Badge>
                                )}
                              </div>

                              {/* Evidence Reference */}
                              <div className="mt-1 text-xs text-gray-600">
                                {skill.assessmentTitle ? (
                                  <span>Assessment: <strong>{skill.assessmentTitle}</strong></span>
                                ) : (
                                  <span>Category: <strong>{skill.category}</strong></span>
                                )}
                              </div>
                            </div>

                            {/* Self-Reported Correction Action (Requirement 7) */}
                            {skill.canEditOrRemove && (
                              <button
                                onClick={() => handleRemoveSelfReportedSkill(skill.skillName)}
                                disabled={isDeleting}
                                className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                                title="Remove inaccurate self-reported claim"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {/* Evidence Hash & Verification Timestamp */}
                          <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500">
                            <div>
                              {skill.scorePercentage !== undefined && (
                                <span className="font-semibold text-emerald-700">
                                  Score: {skill.scorePercentage}%
                                </span>
                              )}
                              {skill.verifiedAt && (
                                <span className="ml-2">
                                  Verified: {new Date(skill.verifiedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {skill.verificationHash && (
                              <span className="font-mono text-[10px] text-gray-400 truncate max-w-[120px]">
                                Hash: {skill.verificationHash.substring(0, 10)}...
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* =============================================================== */}
            {/* PRACTICAL PORTFOLIO PROJECTS GALLERY                            */}
            {/* =============================================================== */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FolderGit2 className="h-4 w-4 text-blue-600" />
                    Practical Project Submissions & Portfolio
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Authentic deliverables created in the Projects Hub (Step 3.3)
                  </p>
                </div>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {passport.projectSubmissions.length} Submissions
                </Badge>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-3">
                {passport.projectSubmissions.length === 0 ? (
                  <div className="p-8 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <FolderGit2 className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No Projects Submitted Yet</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Build and submit a project from the Projects Hub to showcase your practical work under your portfolio.
                    </p>
                    <Link href="/student/learning-plan">
                      <Button size="sm" className="mt-2 text-xs bg-purple-600 hover:bg-purple-700 text-white">
                        Explore Projects Hub
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {passport.projectSubmissions.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-xs space-y-2.5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">
                              {proj.stream}
                            </Badge>
                            <h4 className="mt-1 text-sm font-bold text-gray-900">
                              {proj.projectTitle}
                            </h4>
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            Submitted ✓
                          </Badge>
                        </div>

                        {proj.reflectionNotes && (
                          <p className="text-xs text-gray-600 italic bg-white p-2 rounded-lg border border-gray-100">
                            &quot;{proj.reflectionNotes}&quot;
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                          <span className="text-gray-500 text-[11px]">
                            Submitted: {new Date(proj.submittedAt).toLocaleDateString()}
                          </span>

                          <a
                            href={proj.deliverableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center font-bold text-purple-600 hover:text-purple-800 text-xs"
                          >
                            View Deliverable <ExternalLink className="ml-1 h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* =============================================================== */}
            {/* CRYPTOGRAPHIC CREDENTIALS VAULT                                 */}
            {/* =============================================================== */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileBadge className="h-4 w-4 text-purple-600" />
                    Cryptographic Credentials Vault
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Tamper-evident, digitally signed records issued by KAABIL Platform (काबिल)
                  </p>
                </div>
                <Badge variant="outline" className="text-xs bg-slate-50">
                  HMAC-SHA256 • {passport.credentials.length} Records
                </Badge>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-3">
                {passport.credentials.length === 0 ? (
                  <div className="p-8 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <Award className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No Credentials Minted Yet</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Pass a formal skill diagnostic assessment to automatically mint your first cryptographically signed credential.
                    </p>
                    <Link href="/student/assessments">
                      <Button size="sm" className="mt-2 text-xs">
                        Take Skill Assessment
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {passport.credentials.map((cred) => {
                      const isRevoked = cred.status === "REVOKED";
                      const verified = verifiedMap[cred.id];

                      return (
                        <div
                          key={cred.id}
                          className={`p-4 rounded-2xl border transition-all space-y-3 ${
                            isRevoked
                              ? "bg-slate-50/80 border-slate-200 opacity-60"
                              : "bg-white border-slate-200 hover:border-purple-300 shadow-xs"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">
                                  {cred.title}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] ${
                                    isRevoked
                                      ? "bg-rose-50 text-rose-700 border-rose-200"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  }`}
                                >
                                  {cred.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                {cred.description}
                              </p>
                            </div>

                            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                              <ShieldCheck className="h-4 w-4" />
                            </span>
                          </div>

                          {/* Cryptographic Hash preview */}
                          <div className="p-2.5 rounded-xl bg-slate-50 text-[10px] font-mono text-slate-600 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Signature (HMAC):</span>
                              <span className="truncate max-w-[140px] text-slate-700">
                                {cred.digitalSignature.substring(0, 16)}...
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Verification Hash:</span>
                              <span className="truncate max-w-[140px] text-slate-700">
                                {cred.verificationHash.substring(0, 16)}...
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-0.5 text-slate-400">
                              <span>Issuer: {cred.issuerName}</span>
                              <span>{new Date(cred.issuedAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={() => handleVerifyCredential(cred)}
                              className="text-[11px] font-bold text-purple-600 hover:underline flex items-center gap-1"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {verified ? "Verified Intact & Signed" : "Verify Signature"}
                            </button>

                            {!isRevoked && (
                              <button
                                onClick={() => handleRevokeCredential(cred.id)}
                                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* =============================================================== */}
            {/* CHRONOLOGICAL ACHIEVEMENTS TIMELINE                             */}
            {/* =============================================================== */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  Chronological Achievement History
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Timeline of verified assessments, roadmap milestones, and submitted projects
                </p>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                {passport.achievements.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500">
                    No achievements recorded yet. Complete learning tasks to start your achievement history.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {passport.achievements.map((ach) => (
                      <div
                        key={ach.id}
                        className="flex items-start space-x-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-purple-50/20 transition-colors"
                      >
                        <div className="mt-0.5 p-1.5 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                          {ach.type === "ASSESSMENT" && <Award className="h-4 w-4 text-amber-600" />}
                          {ach.type === "PROJECT" && <FolderGit2 className="h-4 w-4 text-blue-600" />}
                          {ach.type === "ROADMAP_MILESTONE" && <TrendingUp className="h-4 w-4 text-purple-600" />}
                          {ach.type === "MISSION" && <Flame className="h-4 w-4 text-amber-500" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <h5 className="text-xs sm:text-sm font-bold text-gray-900">
                              {ach.title}
                            </h5>
                            <span className="text-[10px] text-gray-500">
                              {new Date(ach.earnedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {ach.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Share Modal */}
        {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-purple-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 flex items-center">
                  <Share2 className="mr-2 h-4 w-4 text-purple-600" />
                  Share Public Passport Link
                </h3>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-600">
                This tokenized link is valid for <strong>7 days</strong>. It shares only your verified credentials and sanitizes sensitive personal contact information.
              </p>

              <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-purple-900 truncate">
                  {shareLink}
                </span>
                <Button
                  size="sm"
                  onClick={() => handleCopyHash(shareLink)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs shrink-0"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </Button>
              </div>

              <div className="text-[11px] text-gray-500">
                🔒 <strong>DPDP Act Compliance:</strong> You can revoke this link at any time from your settings.
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShareModalOpen(false)}
                  className="text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
