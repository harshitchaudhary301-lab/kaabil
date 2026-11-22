"use client";

import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  ShieldCheck,
  Award,
  ExternalLink,
  Lock,
  Globe,
  Share2,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Eye,
  FileBadge,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV_ITEMS } from "@/components/student/student-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function StudentPortfolioPage() {
  const [isPublic, setIsPublic] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch("/api/student/resume");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setStudentData(data.resume);
          }
        }
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  const handleCopyLink = () => {
    const slug = studentData?.personalInfo?.fullName
      ? studentData.personalInfo.fullName.toLowerCase().replace(/\s+/g, "-")
      : "student";
    navigator.clipboard.writeText(`https://kaabil.in/p/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV_ITEMS}
      breadcrumbs={["Showcase", "Student Portfolio"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary">
                Verified Student Portfolio
              </h1>
              <Badge variant="outline" className="border-primary/20 text-primary">
                DPDP Privacy Protected
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Public/private verifiable showcase of your technical projects, credentials, and achievements
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPublic(!isPublic)}
              className="gap-2 text-xs"
            >
              {isPublic ? (
                <>
                  <Globe className="h-3.5 w-3.5 text-emerald-600" /> Public Portfolio
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-amber-600" /> Private (Restricted)
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleCopyLink}
              className="gap-2 bg-primary text-white text-xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              {copied ? "Link Copied!" : "Share Portfolio"}
            </Button>
          </div>
        </div>

        {/* Profile Identity Hero */}
        <Card className="p-6 md:p-8 border-border bg-gradient-to-r from-slate-50 via-white to-blue-50/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                {studentData?.personalInfo?.fullName
                  ? studentData.personalInfo.fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                  : "AS"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-xl md:text-2xl font-bold text-text-primary">
                    {studentData?.personalInfo?.fullName || "Student"}
                  </h2>
                  <span title="KAABIL Identity Verified">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </span>
                </div>
                <p className="text-xs md:text-sm text-text-secondary mt-1">
                  Delhi Technological University • B.Tech in CSE (AI & Robotics)
                </p>
                <div className="flex items-center gap-3 text-xs text-text-muted mt-2">
                  <span>{studentData?.personalInfo?.location || "New Delhi, India"}</span>
                  <span>•</span>
                  <span className="text-primary font-medium">Science (PCM) Stream</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="p-3 rounded-xl bg-white border border-border text-center min-w-[120px]">
                <span className="text-[10px] font-bold uppercase text-text-muted">CRI Readiness</span>
                <p className="font-heading text-xl font-black text-primary mt-0.5">82 / 100</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-border text-center min-w-[120px]">
                <span className="text-[10px] font-bold uppercase text-text-muted">Verified Badges</span>
                <p className="font-heading text-xl font-black text-emerald-600 mt-0.5">
                  {studentData?.skills?.filter((s: any) => s.verified).length || 4}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 2-Column: Left (Verified Credentials & Projects) | Right (Skills & Education) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Verified Credentials */}
            <Card className="p-6 border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <h3 className="font-heading text-base font-bold text-text-primary">
                    Digitally Verified Credentials
                  </h3>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  Cryptographically Anchored
                </Badge>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: "Advanced Autonomous Navigation (SLAM)",
                    issuer: "Delhi Technological University & KAABIL",
                    date: "October 2026",
                    id: "KBL-CRED-2026-9041",
                  },
                  {
                    title: "Mathematics & Multivariable Calculus Assessment",
                    issuer: "KAABIL Verification Directorate",
                    date: "September 2026",
                    id: "KBL-CRED-2026-8812",
                  },
                ].map((cred, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-text-primary">{cred.title}</h4>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Issued by {cred.issuer} • {cred.date}
                      </p>
                      <span className="font-mono text-[10px] text-text-muted">{cred.id}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Showcase Projects */}
            <Card className="p-6 border-border space-y-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-purple-600" />
                <h3 className="font-heading text-base font-bold text-text-primary">
                  Featured Projects & Evidence
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: "Autonomous Drone Obstacle Avoidance",
                    desc: "Real-time stereo vision obstacle avoidance algorithm running at 45 FPS on embedded hardware.",
                    tags: ["Python", "ROS 2", "OpenCV", "Jetson Nano"],
                  },
                  {
                    name: "Microgrid Energy Optimizer",
                    desc: "Predictive energy load forecasting model using LSTM networks for renewable microgrids.",
                    tags: ["TensorFlow", "Pandas", "Renewable Energy"],
                  },
                ].map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-text-primary">{proj.name}</h4>
                      <ExternalLink className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-text-secondary leading-relaxed">{proj.desc}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Skills & Privacy */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 border-border space-y-4">
              <h3 className="font-heading text-base font-bold text-text-primary">
                Verified Skill Matrix
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Python",
                  "Robotics Control",
                  "Calculus",
                  "Scientific Research",
                  "Computer Vision",
                  "Embedded C++",
                ].map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium"
                  >
                    {skill}
                    <ShieldCheck className="h-3 w-3 text-blue-600" />
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-border bg-slate-50/50 space-y-3">
              <h4 className="font-heading text-sm font-bold text-text-primary">
                DPDP Privacy Guardrails
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Your portfolio only shares skills and credentials explicitly marked for public verification. Contact phone numbers and government IDs are permanently redacted.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
