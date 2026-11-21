"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  Save,
  Download,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Award,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV_ITEMS } from "@/components/student/student-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudentResumeData, ResumeTemplateType } from "@/types/admin";

export default function StudentResumePage() {
  const [resume, setResume] = useState<StudentResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("preview");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchResume = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/resume");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setResume(data.resume);
        }
      }
    } catch (err) {
      console.error("Failed to load resume:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleSaveResume = async () => {
    if (!resume) return;
    setSaving(true);
    try {
      const res = await fetch("/api/student/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resume),
      });

      const data = await res.json();
      if (data.success) {
        setNotification({ type: "success", message: "Resume saved successfully!" });
        setResume(data.resume);
      } else {
        setNotification({ type: "error", message: data.error || "Save failed." });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Network error." });
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV_ITEMS}
      breadcrumbs={["Career Tools", "Resume Studio"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto print:m-0 print:p-0">
        {/* Screen Header (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary">
                Resume Studio & Verified CV Builder
              </h1>
              <Badge variant="outline" className="border-primary/20 text-primary">
                Verified Credentials Integrated
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Build an ATS-optimized professional resume with tamper-proof Skill Passport verification badges
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs text-text-primary"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </Button>
            <Button
              size="sm"
              onClick={handleSaveResume}
              disabled={saving}
              className="gap-1.5 bg-primary text-white text-xs"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Resume"}
            </Button>
          </div>
        </div>

        {/* Feedback Alert (Hidden on Print) */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs print:hidden ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="font-bold underline ml-4 hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Toolbar & Template Selector (Hidden on Print) */}
        <Card className="p-4 border-border flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted">Template:</span>
            {[
              { id: "MODERN_CLEAN", label: "Modern Clean" },
              { id: "CLASSIC_IVY", label: "Classic Ivy" },
              { id: "MINIMAL_EXECUTIVE", label: "Minimal Executive" },
            ].map((tmpl) => (
              <Button
                key={tmpl.id}
                size="sm"
                variant={resume?.template === tmpl.id ? "primary" : "outline"}
                className="h-8 text-xs"
                onClick={() =>
                  resume && setResume({ ...resume, template: tmpl.id as ResumeTemplateType })
                }
              >
                {tmpl.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activeTab === "preview" ? "primary" : "ghost"}
              className="h-8 text-xs"
              onClick={() => setActiveTab("preview")}
            >
              Document Preview
            </Button>
            <Button
              size="sm"
              variant={activeTab === "edit" ? "primary" : "ghost"}
              className="h-8 text-xs"
              onClick={() => setActiveTab("edit")}
            >
              Edit Content
            </Button>
          </div>
        </Card>

        {loading ? (
          <Card className="p-12 text-center text-text-muted">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            Loading resume profile...
          </Card>
        ) : !resume ? (
          <Card className="p-12 text-center text-text-muted">No resume found.</Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Edit Drawer (Hidden when in preview mode or print) */}
            {activeTab === "edit" && (
              <Card className="lg:col-span-12 p-6 border-border space-y-6 print:hidden">
                <h3 className="font-heading text-lg font-bold text-text-primary">
                  Edit Resume Details
                </h3>

                {/* Personal Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-text-primary font-medium block mb-1">Full Name</label>
                      <Input
                        value={resume.personalInfo.fullName}
                        onChange={(e) =>
                          setResume({
                            ...resume,
                            personalInfo: { ...resume.personalInfo, fullName: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-text-primary font-medium block mb-1">Email</label>
                      <Input
                        value={resume.personalInfo.email}
                        onChange={(e) =>
                          setResume({
                            ...resume,
                            personalInfo: { ...resume.personalInfo, email: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-text-primary font-medium block mb-1">Phone</label>
                      <Input
                        value={resume.personalInfo.phone}
                        onChange={(e) =>
                          setResume({
                            ...resume,
                            personalInfo: { ...resume.personalInfo, phone: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-text-primary font-medium block mb-1">Location</label>
                      <Input
                        value={resume.personalInfo.location}
                        onChange={(e) =>
                          setResume({
                            ...resume,
                            personalInfo: { ...resume.personalInfo, location: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-text-primary font-medium block mb-1">LinkedIn URL</label>
                      <Input
                        value={resume.personalInfo.linkedinUrl || ""}
                        onChange={(e) =>
                          setResume({
                            ...resume,
                            personalInfo: { ...resume.personalInfo, linkedinUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-text-primary font-medium block mb-1">GitHub / Portfolio</label>
                      <Input
                        value={resume.personalInfo.githubUrl || ""}
                        onChange={(e) =>
                          setResume({
                            ...resume,
                            personalInfo: { ...resume.personalInfo, githubUrl: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider">
                    Professional Summary
                  </h4>
                  <textarea
                    className="w-full h-24 p-2.5 rounded-lg border border-border text-xs focus:outline-primary"
                    value={resume.summary}
                    onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button size="sm" onClick={() => setActiveTab("preview")} className="text-xs">
                    Review in Preview
                  </Button>
                </div>
              </Card>
            )}

            {/* Document Preview (Printable Paper) */}
            <div className="lg:col-span-12 flex justify-center">
              <div
                className={`w-full max-w-[850px] bg-white rounded-xl shadow-md border border-border p-8 md:p-12 text-text-primary print:shadow-none print:border-none print:p-0 ${
                  resume.template === "CLASSIC_IVY"
                    ? "font-serif"
                    : resume.template === "MINIMAL_EXECUTIVE"
                    ? "font-mono text-[13px]"
                    : "font-sans"
                }`}
              >
                {/* Header Section */}
                <div
                  className={`border-b pb-6 ${
                    resume.template === "MODERN_CLEAN"
                      ? "border-primary/20 text-center"
                      : resume.template === "CLASSIC_IVY"
                      ? "border-black text-center"
                      : "border-slate-300 text-left"
                  }`}
                >
                  <h1
                    className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
                      resume.template === "MODERN_CLEAN" ? "text-primary" : "text-slate-900"
                    }`}
                  >
                    {resume.personalInfo.fullName}
                  </h1>

                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-text-secondary mt-2">
                    <span>{resume.personalInfo.email}</span>
                    <span>•</span>
                    <span>{resume.personalInfo.phone}</span>
                    <span>•</span>
                    <span>{resume.personalInfo.location}</span>
                    {resume.personalInfo.linkedinUrl && (
                      <>
                        <span>•</span>
                        <a
                          href={resume.personalInfo.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-primary"
                        >
                          LinkedIn
                        </a>
                      </>
                    )}
                    {resume.personalInfo.githubUrl && (
                      <>
                        <span>•</span>
                        <a
                          href={resume.personalInfo.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-primary"
                        >
                          GitHub
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {resume.summary && (
                  <div className="mt-6">
                    <h2
                      className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                        resume.template === "MODERN_CLEAN"
                          ? "text-primary border-b border-primary/20 pb-1"
                          : "text-slate-900 border-b border-slate-300 pb-1"
                      }`}
                    >
                      Professional Profile
                    </h2>
                    <p className="text-xs leading-relaxed text-text-secondary">{resume.summary}</p>
                  </div>
                )}

                {/* Verified Skills Section */}
                <div className="mt-6">
                  <h2
                    className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                      resume.template === "MODERN_CLEAN"
                        ? "text-primary border-b border-primary/20 pb-1"
                        : "text-slate-900 border-b border-slate-300 pb-1"
                    }`}
                  >
                    Skills & Competencies
                  </h2>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {resume.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                          skill.verified
                            ? "bg-blue-50 border-blue-200 text-blue-800"
                            : "bg-slate-50 border-border text-text-secondary"
                        }`}
                      >
                        {skill.name}
                        {skill.verified && (
                          <span title="Verified by KAABIL Passport">
                            <ShieldCheck className="h-3 w-3 text-blue-600 inline" />
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="mt-6">
                  <h2
                    className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                      resume.template === "MODERN_CLEAN"
                        ? "text-primary border-b border-primary/20 pb-1"
                        : "text-slate-900 border-b border-slate-300 pb-1"
                    }`}
                  >
                    Education
                  </h2>
                  <div className="space-y-3">
                    {resume.education.map((edu, eIdx) => (
                      <div key={eIdx} className="text-xs flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900">{edu.institution}</div>
                          <div className="text-text-secondary">
                            {edu.degree} — {edu.fieldOfStudy}
                          </div>
                          {edu.grade && <div className="text-[11px] text-text-muted mt-0.5">Grade: {edu.grade}</div>}
                        </div>
                        <div className="text-[11px] font-medium text-text-muted whitespace-nowrap">
                          {edu.startYear} – {edu.endYear}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                {resume.experience.length > 0 && (
                  <div className="mt-6">
                    <h2
                      className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                        resume.template === "MODERN_CLEAN"
                          ? "text-primary border-b border-primary/20 pb-1"
                          : "text-slate-900 border-b border-slate-300 pb-1"
                      }`}
                    >
                      Experience & Internships
                    </h2>
                    <div className="space-y-4">
                      {resume.experience.map((exp, xIdx) => (
                        <div key={xIdx} className="text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-slate-900">{exp.title}</span>
                              <span className="text-text-muted"> • </span>
                              <span className="font-medium text-text-secondary">{exp.organization}</span>
                            </div>
                            <span className="text-[11px] text-text-muted">
                              {exp.startDate} – {exp.endDate}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed mt-1">
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resume.projects.length > 0 && (
                  <div className="mt-6">
                    <h2
                      className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                        resume.template === "MODERN_CLEAN"
                          ? "text-primary border-b border-primary/20 pb-1"
                          : "text-slate-900 border-b border-slate-300 pb-1"
                      }`}
                    >
                      Key Projects & Technical Artifacts
                    </h2>
                    <div className="space-y-3">
                      {resume.projects.map((proj, pIdx) => (
                        <div key={pIdx} className="text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{proj.title}</span>
                            {proj.link && (
                              <a
                                href={proj.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-primary hover:underline flex items-center gap-1"
                              >
                                View Project <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                            {proj.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-text-muted">
                            Technologies: {proj.technologies.join(", ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verified Credentials */}
                {resume.credentials && resume.credentials.length > 0 && (
                  <div className="mt-6">
                    <h2
                      className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                        resume.template === "MODERN_CLEAN"
                          ? "text-primary border-b border-primary/20 pb-1"
                          : "text-slate-900 border-b border-slate-300 pb-1"
                      }`}
                    >
                      Verified Credentials & Certificates
                    </h2>
                    <div className="space-y-2">
                      {resume.credentials.map((cred, cIdx) => (
                        <div key={cIdx} className="text-xs flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="font-bold text-slate-900">{cred.title}</span>
                            <span className="text-text-muted">— {cred.issuer}</span>
                          </div>
                          <span className="text-[11px] text-text-muted">{cred.issueDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tamper-Proof Footer Disclaimer */}
                <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-text-muted">
                  <span>KAABIL Digital Skill Passport Verified • UID: {resume.studentId}</span>
                  <span>Digitally verified at kaabil.in/verify</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
