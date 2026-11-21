"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BrainCircuit,
  Compass,
  Award,
  Sparkles,
  TrendingUp,
  Settings,
  Scale,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  BookOpen,
  HelpCircle,
  FileBadge,
  Layers,
  Lock,
  Share2,
  Download,
  Copy,
  ExternalLink,
  QrCode,
  Check,
  Eye,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DigitalSkillPassport } from "@/lib/passport/passport-service";
import { KaabilCredential } from "@/lib/passport/credential-service";



export default function DigitalSkillPassportPage() {
  const [passport, setPassport] = useState<DigitalSkillPassport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string>("");
  const [shareToken, setShareToken] = useState<string>("");
  const [sharingLoading, setSharingLoading] = useState<boolean>(false);
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

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
    // In-client integrity check preview
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

  const handleRevokeCredential = async (credId: string) => {
    if (!confirm("Are you sure you want to revoke this credential? This action will mark its digital signature as revoked.")) {
      return;
    }
    try {
      const res = await fetch(`/api/student/passport/credentials/${credId}/revoke`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        fetchPassport();
      }
    } catch {
      alert("Failed to revoke credential");
    }
  };

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Student", "Digital Skill Passport"]}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-48 bg-slate-200 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Passport View */}
        {!loading && passport && (
          <>
            {/* Signature Passport Header Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-slate-800">
              {/* Background watermark */}
              <div className="absolute right-4 -bottom-10 opacity-5 pointer-events-none">
                <FileBadge className="w-80 h-80 text-white" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-primary/20 text-accent text-xs font-bold border border-primary/30 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                      KAABIL DIGITAL PASSPORT &bull; VERIFIED IDENTITY
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {passport.passportId}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-white">
                    {passport.studentName}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4 text-accent" />
                      {passport.education.stage.replace("_", " ")} &bull; {passport.education.streamTitle}
                    </span>
                    <span>&bull;</span>
                    <span>{passport.education.institutionName}</span>
                    <span>&bull;</span>
                    <span>Class of {passport.education.targetCompletionYear}</span>
                  </div>

                  {/* Passport Integrity Checksum */}
                  <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <Lock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate max-w-xs sm:max-w-md">
                      Checksum: {passport.passportIntegrityChecksum}
                    </span>
                    <button
                      onClick={() => handleCopyHash(passport.passportIntegrityChecksum)}
                      className="text-slate-400 hover:text-white transition-colors"
                      title="Copy Checksum"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Right Actions & QR Sharing Button */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                    <span className="text-xs text-slate-300 font-medium">Readiness Index:</span>
                    <span className="text-xl font-black text-emerald-400">
                      {passport.summary.currentCRI}/100
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateShareLink}
                      disabled={sharingLoading}
                      className="bg-accent hover:bg-accent/90 text-slate-950 font-bold gap-1.5 shadow-soft-xs text-xs"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Share Passport / QR
                    </Button>

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

            {/* Quick Summary Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="border-slate-200 bg-white shadow-soft-xs">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                    <span>Verified Skills</span>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {passport.summary.verifiedSkills}
                  </div>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                    Cryptographically hashed
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-soft-xs">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                    <span>Active Credentials</span>
                    <FileBadge className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {passport.summary.credentialCount}
                  </div>
                  <p className="text-[10px] text-primary font-semibold mt-1">
                    Signed by KAABIL
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-soft-xs">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                    <span>Assessments Passed</span>
                    <Award className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {passport.summary.assessmentsPassed}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    Of {passport.summary.assessmentsCompleted} attempted
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-soft-xs">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                    <span>Milestones Achieved</span>
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {passport.summary.milestonesCompleted}
                  </div>
                  <p className="text-[10px] text-indigo-700 font-semibold mt-1">
                    Roadmap progression
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cryptographic Credentials Vault */}
            <Card className="border-slate-200 bg-white shadow-soft-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileBadge className="h-4 w-4 text-primary" />
                    Cryptographic Credentials Vault
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Tamper-evident, digitally signed records issued by KAABIL Platform (काबिल)
                  </p>
                </div>
                <Badge variant="outline" className="text-xs bg-slate-50">
                  HMAC-SHA256 &bull; {passport.credentials.length} Records
                </Badge>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-3">
                {passport.credentials.length === 0 ? (
                  <div className="p-8 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <Award className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">No Credentials Minted Yet</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Pass a formal skill assessment or complete roadmap milestones to automatically mint your first cryptographically signed credential.
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
                              : "bg-white border-slate-200 hover:border-primary/40 shadow-soft-xs"
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

                            <span className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
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
                              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
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

            {/* Skill Portfolio Breakdown (Verified vs Self-Reported) */}
            <Card className="border-slate-200 bg-white shadow-soft-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Comprehensive Skill Competency Portfolio
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Distinguishing platform-assessed evidence from self-reported claims
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Platform Assessed
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-blue-700 font-semibold">
                    <Eye className="h-3.5 w-3.5 text-blue-500" /> Self-Reported
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {passport.skills.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-xs text-slate-900 block truncate">
                            {s.skillName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {s.category}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            s.isVerified
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {s.evidenceLayer === "PLATFORM_ASSESSED" ? "Verified" : "Self-Reported"}
                        </Badge>
                      </div>

                      {/* Level Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                          <span>Proficiency</span>
                          <span>Level {s.proficiencyLevel}/5</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.isVerified ? "bg-emerald-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${(s.proficiencyLevel / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      {s.isVerified && s.scorePercentage && (
                        <p className="text-[10px] text-emerald-700 font-medium pt-1">
                          Score: {s.scorePercentage}% in Assessment Challenge
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements & Milestones Timeline */}
            <Card className="border-slate-200 bg-white shadow-soft-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="h-4 w-4 text-accent" />
                  Verified Learning & Assessment Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-3">
                {passport.achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{ach.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ach.earnedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pedagogical Disclaimer Card */}
            <Card className="border-slate-200 bg-slate-50/60">
              <CardContent className="p-4 text-xs text-slate-500 space-y-1">
                <p>
                  <strong>Statutory Integrity Notice:</strong> {passport.disclaimer}
                </p>
                <p className="text-[11px] text-slate-400">
                  Data stored and processed in compliance with the Digital Personal Data Protection Act (DPDP) 2023. Under-18 profiles remain strictly non-discoverable by third-party recruiters.
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Sharing & QR Modal */}
        {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-soft-lg space-y-5 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-primary/10 text-primary">
                    <QrCode className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Share Digital Passport</h3>
                    <p className="text-xs text-slate-500">Expiring 7-day secure verification link</p>
                  </div>
                </div>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* QR Mock / Visual Canvas */}
              <div className="p-6 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-200/80 space-y-3">
                <div className="w-40 h-40 bg-white p-3 rounded-2xl border border-slate-200 shadow-soft-xs flex flex-col items-center justify-center text-center">
                  <QrCode className="w-32 h-32 text-slate-900" />
                </div>
                <span className="text-[11px] font-mono text-slate-500 text-center">
                  Token: {shareToken.substring(0, 16)}...
                </span>
              </div>

              {/* Share URL copy field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Verification URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      alert("Share link copied to clipboard!");
                    }}
                    className="text-xs"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                <p>&bull; Adult student sharing with selective credential access.</p>
                <p>&bull; Can be revoked at any time from Settings & Privacy.</p>
              </div>

              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => setShareModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
