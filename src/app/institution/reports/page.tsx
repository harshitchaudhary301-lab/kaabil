"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Plus,
  Calendar,
  ShieldAlert,
  Award,
  BarChart3,
  CheckCircle2,
  Building2,
  Info,
  Clock,
  Layers,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { INSTITUTION_NAV } from "@/components/institution/institution-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InstitutionalOutcomeReport,
  STATUTORY_REPORT_DISCLAIMER,
} from "@/types/institution";

const REPORT_TEMPLATES = [
  {
    type: "NAAC_CRITERIA" as const,
    title: "NAAC Criterion II & V Supporting Analysis",
    description: "Evaluates Teaching-Learning Continuous Evaluation, Experiential Workshops, and Student Support & Progression.",
    framework: "NAAC Manual (Revised 2024)",
    badge: "Accreditation Support",
  },
  {
    type: "NIRF_METRICS" as const,
    title: "NIRF Graduation Outcomes (GO) Benchmark",
    description: "Calculates metric estimates for Placement, Higher Studies transition readiness, and verified median skill competency.",
    framework: "NIRF Methodology Guidelines",
    badge: "Ranking Intelligence",
  },
  {
    type: "NBA_OUTCOMES" as const,
    title: "NBA Outcome-Based Education (OBE) Attainment",
    description: "Analyzes Program Outcomes (POs) and Course Outcomes (COs) alignment with continuous improvement intervention tracking.",
    framework: "NBA Tier-I & Tier-II Standards",
    badge: "Outcome Attainment",
  },
  {
    type: "STUDENT_DEVELOPMENT" as const,
    title: "Comprehensive Student Development Report",
    description: "Cohort-wide assessment coverage, Career Readiness Index distribution, and active curriculum intervention telemetry.",
    framework: "KAABIL Universal Career Framework",
    badge: "Development Tracking",
  },
  {
    type: "PLACEMENT_SUMMARY" as const,
    title: "Campus Placement & Opportunity Analysis",
    description: "Multi-stream recruitment drive analytics, applicant shortlisting pipelines, and verified offer rates.",
    framework: "KAABIL Placement Intelligence",
    badge: "Career Outcomes",
  },
];

export default function InstitutionReportsPage() {
  const [reports, setReports] = useState<InstitutionalOutcomeReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<InstitutionalOutcomeReport | null>(null);
  const [academicSession, setAcademicSession] = useState<string>("2026-2027");

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch("/api/institution/reports");
      const data = await res.json();
      if (data.success) {
        setReports(data.reports || []);
        if (data.reports?.length > 0 && !selectedReport) {
          setSelectedReport(data.reports[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(reportType: InstitutionalOutcomeReport["reportType"]) {
    setGenerating(reportType);
    try {
      const res = await fetch("/api/institution/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType, academicSession }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedReport(data.report);
        fetchReports();
      } else {
        alert(data.error || "Failed to generate report");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setGenerating(null);
    }
  }

  async function handleDownloadCsv(report: InstitutionalOutcomeReport) {
    setDownloadingId(report.id);
    try {
      const res = await fetch("/api/institution/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id }),
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.reportType.toLowerCase()}_${report.academicSession.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to download CSV");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Institution", "Outcome Reports"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FileText className="w-7 h-7 text-[#4169E1]" />
              Institutional Outcome & Accreditation Reports
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Internal supporting documentation inspired by NAAC Criterion II/V, NIRF Metrics, and NBA Outcome-Based Education.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Session:</span>
            <select
              value={academicSession}
              onChange={(e) => setAcademicSession(e.target.value)}
              className="text-xs font-medium border border-slate-200 rounded-lg p-2 bg-white text-slate-800"
            >
              <option value="2026-2027">2026-2027</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
            </select>
          </div>
        </div>

        {/* Mandatory Statutory Disclaimer Banner */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong className="font-semibold block text-amber-950 mb-0.5">
              Statutory Regulatory Notice: Internal Institutional Analysis Only
            </strong>
            {STATUTORY_REPORT_DISCLAIMER}
          </div>
        </div>

        {/* Report Generator Templates */}
        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#4169E1]" />
            Generate Standardized Supporting Reports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {REPORT_TEMPLATES.map((tmpl) => (
              <Card
                key={tmpl.type}
                className="border-slate-200 hover:border-[#4169E1]/50 transition-all flex flex-col justify-between p-3.5 bg-white shadow-sm"
              >
                <div>
                  <Badge variant="outline" className="text-[10px] bg-blue-50 text-[#4169E1] border-blue-200 mb-2">
                    {tmpl.badge}
                  </Badge>
                  <h3 className="font-semibold text-slate-900 text-xs leading-snug mb-1">
                    {tmpl.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed mb-3">
                    {tmpl.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleGenerate(tmpl.type)}
                  disabled={generating === tmpl.type}
                  className="w-full bg-[#4169E1] text-white hover:bg-blue-700 text-xs h-7 gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {generating === tmpl.type ? "Synthesizing..." : "Generate"}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Reports Archive & Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* List of Generated Reports */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Generated Reports ({reports.length})
            </h2>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                Loading reports archive...
              </div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                No reports generated yet. Click &apos;Generate&apos; on any template above.
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedReport?.id === r.id
                        ? "bg-blue-50/50 border-[#4169E1] shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-xs text-slate-900 line-clamp-1">{r.title}</h4>
                      <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-600">
                        {r.academicSession}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      Ref: {r.frameworkSource}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                      <span>{new Date(r.generatedAt).toLocaleDateString()}</span>
                      <span className="text-[#4169E1] font-medium">View Analysis →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report Viewer / Details */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold text-slate-900">
                          {selectedReport.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-[#4169E1]">
                          {selectedReport.academicSession}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Framework: {selectedReport.frameworkSource} • Generated By: {selectedReport.generatedBy}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleDownloadCsv(selectedReport)}
                      disabled={downloadingId === selectedReport.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {downloadingId === selectedReport.id ? "Exporting..." : "Download CSV"}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-5">
                  {/* Notice inside report */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                    <strong className="text-slate-800">Compliance & Integrity Note:</strong> Exported data includes
                    sanitized cell formats (CWE-1236 protection) ready for institutional committee review and IQAC audits.
                  </div>

                  {/* Dynamic Metrics Presentation */}
                  <div className="space-y-4">
                    {Object.entries(selectedReport.summaryMetrics).map(([sectionKey, sectionData]) => (
                      <div key={sectionKey} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-100/70 px-4 py-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                          {sectionKey.replace(/_/g, " ")}
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                          {typeof sectionData === "object" && sectionData !== null ? (
                            Object.entries(sectionData).map(([metricKey, metricValue]) => (
                              <div
                                key={metricKey}
                                className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                              >
                                <span className="text-xs text-slate-600 font-medium">
                                  {metricKey.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                                </span>
                                <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {String(metricValue)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                              <span className="text-xs text-slate-600">{sectionKey}</span>
                              <span className="text-xs font-bold text-slate-900">{String(sectionData)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 text-right">
                    Generated: {new Date(selectedReport.generatedAt).toLocaleString()} • Report ID: {selectedReport.id}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-800">No report selected</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose a report from the archive on the left or generate a new one.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
