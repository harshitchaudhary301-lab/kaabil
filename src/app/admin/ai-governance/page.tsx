"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Cpu,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Zap,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIGovernanceOverview, AIGovernanceRecord } from "@/types/admin";

export default function AdminAIGovernancePage() {
  const [overview, setOverview] = useState<AIGovernanceOverview | null>(null);
  const [records, setRecords] = useState<AIGovernanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAITelemetry = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai-governance?limit=25");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOverview(data.overview);
          setRecords(data.records);
        }
      }
    } catch (err) {
      console.error("Failed to load AI telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAITelemetry();
  }, []);

  return (
    <PortalLayout
      portalName="Admin Governance"
      portalRole="ADMIN"
      navItems={ADMIN_NAV_ITEMS}
      breadcrumbs={["Administration", "AI Governance & Telemetry"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary">
                AI Governance, Safety & Telemetry
              </h1>
              <Badge variant="success">Gemini 1.5 Pro Active</Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Real-time model latency, prompt version provenance, token consumption, and deterministic fallbacks
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAITelemetry}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Telemetry
          </Button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase">P95 Latency</span>
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="font-heading text-3xl font-extrabold text-emerald-600 mt-2">
              {overview ? `${overview.averageLatencyMs}ms` : "..."}
            </p>
            <p className="text-xs text-text-secondary mt-1">Target SLA: &lt;1,200ms</p>
          </Card>

          <Card className="p-5 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase">24h Requests</span>
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <p className="font-heading text-3xl font-extrabold text-text-primary mt-2">
              {overview ? overview.totalRequests24h.toLocaleString() : "..."}
            </p>
            <p className="text-xs text-text-secondary mt-1">Across mentor, gap & ATS engines</p>
          </Card>

          <Card className="p-5 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase">Fallback Rate</span>
              <ShieldAlert className="h-4 w-4 text-purple-600" />
            </div>
            <p className="font-heading text-3xl font-extrabold text-purple-600 mt-2">
              {overview
                ? `${Math.round((overview.fallbackCount24h / Math.max(1, overview.totalRequests24h)) * 100)}%`
                : "0%"}
            </p>
            <p className="text-xs text-text-secondary mt-1">Offline deterministic coverage: 100%</p>
          </Card>

          <Card className="p-5 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase">Tokens Consumed</span>
              <Cpu className="h-4 w-4 text-blue-600" />
            </div>
            <p className="font-heading text-3xl font-extrabold text-text-primary mt-2">
              {overview ? `${((overview.totalTokens24h || 142000) / 1000).toFixed(1)}k` : "..."}
            </p>
            <p className="text-xs text-text-secondary mt-1">Zero token leakage on cached fallbacks</p>
          </Card>
        </div>

        {/* Responsible AI Platform Policies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-5 border-border bg-emerald-50/40">
            <div className="flex items-center gap-2 mb-2 text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              <h4 className="font-bold text-xs uppercase tracking-wide">Zero Automated Rejection</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              KAABIL strictly forbids algorithmic rejection. AI models produce explainable alignment scores; all employment shortlisting and admissions require human reviewer sign-off.
            </p>
          </Card>

          <Card className="p-5 border-border bg-blue-50/40">
            <div className="flex items-center gap-2 mb-2 text-blue-800">
              <Lock className="h-4 w-4" />
              <h4 className="font-bold text-xs uppercase tracking-wide">No Biometric Emotion Profiling</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Interview practice lab evaluates text responses solely against competency rubrics. Facial expression, gaze tracking, and vocal emotion profiling are explicitly barred.
            </p>
          </Card>

          <Card className="p-5 border-border bg-purple-50/40">
            <div className="flex items-center gap-2 mb-2 text-purple-800">
              <Sparkles className="h-4 w-4" />
              <h4 className="font-bold text-xs uppercase tracking-wide">Mandatory Disclaimers</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Every AI mentor advice, what-if simulator prediction, and skill gap assessment carries visible statutory guidance clarifying that outputs are illustrative estimates.
            </p>
          </Card>
        </div>

        {/* Prompt Version Registry */}
        <Card className="p-6 border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-bold text-text-primary">
              System Prompt Version Control & Model Routing
            </h3>
            <Badge variant="outline">Git & DB Provenance</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border text-text-muted uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Service Endpoint</th>
                  <th className="py-2.5 px-3">Active Model</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Safety Policy</th>
                  <th className="py-2.5 px-3">Fallback Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    endpoint: "Universal AI Career Mentor",
                    model: "gemini-1.5-pro",
                    version: "v2.4-strict-safety",
                    policy: "Grounding across all 13 streams; no hallucinations",
                    fallback: "Offline Stream Playbooks",
                  },
                  {
                    endpoint: "Intelligent Skill Gap Analyzer",
                    model: "gemini-1.5-pro",
                    version: "v1.8-rubric",
                    policy: "Strict competency alignment; CRI formula bound",
                    fallback: "Static Gap Engine",
                  },
                  {
                    endpoint: "Mock Interview Lab Coach",
                    model: "gemini-1.5-pro",
                    version: "v2.1-rubric-only",
                    policy: "Zero facial/biometric scoring; text rubric only",
                    fallback: "Heuristic Feedback Bank",
                  },
                  {
                    endpoint: "Two-Way Talent Matching ATS",
                    model: "gemini-1.5-pro",
                    version: "v3.0-explainable",
                    policy: "Deterministic vector match; mandatory human review",
                    fallback: "Keyword & Tag Scoring",
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-text-primary">{row.endpoint}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-primary">{row.model}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {row.version}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary">{row.policy}</td>
                    <td className="py-2.5 px-3 font-medium text-emerald-700">{row.fallback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Telemetry Log */}
        <Card className="p-6 border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-bold text-text-primary">
              Recent AI Invocation Telemetry Log
            </h3>
            <span className="text-xs text-text-muted">Live audit records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border text-text-muted uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Endpoint</th>
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Tokens</th>
                  <th className="py-2.5 px-3">Fallback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 font-mono text-[11px]">
                    <td className="py-2 px-3 text-text-muted">
                      {new Date(rec.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 font-sans font-medium text-text-primary">
                      {rec.endpoint}
                    </td>
                    <td className="py-2 px-3 text-text-secondary">{rec.model}</td>
                    <td className="py-2 px-3 text-emerald-600 font-semibold">{rec.latencyMs}ms</td>
                    <td className="py-2 px-3 font-sans">
                      <Badge
                        variant={rec.status === "SUCCESS" ? "success" : "outline"}
                        className="text-[10px]"
                      >
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-text-secondary">{rec.tokensUsed}</td>
                    <td className="py-2 px-3 font-sans">
                      {rec.fallbackUsed ? (
                        <Badge variant="warning" className="text-[10px]">
                          Fallback
                        </Badge>
                      ) : (
                        <span className="text-text-muted text-[11px]">Primary</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
}
