"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  UserCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  X,
  FileText,
  UserX,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { INSTITUTION_NAV } from "@/components/institution/institution-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentInterventionRecord, InterventionStatus } from "@/types/institution";

const SEVERITY_COLORS: Record<string, string> = {
  URGENT: "bg-rose-50 text-rose-700 border-rose-300",
  HIGH: "bg-amber-50 text-amber-800 border-amber-300",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-300",
  LOW: "bg-slate-100 text-slate-700 border-slate-300",
};

const STATUS_OPTIONS: InterventionStatus[] = [
  "NEW",
  "ASSIGNED",
  "UNDER_REVIEW",
  "ACTION_PLANNED",
  "IN_PROGRESS",
  "FOLLOW_UP_REQUIRED",
  "RESOLVED",
  "DISMISSED",
];

export default function StudentInterventionsPage() {
  const [interventions, setInterventions] = useState<StudentInterventionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  // Selected for review modal
  const [selectedIntervention, setSelectedIntervention] = useState<StudentInterventionRecord | null>(null);
  const [newStatus, setNewStatus] = useState<InterventionStatus>("ASSIGNED");
  const [facultyName, setFacultyName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchInterventions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (severityFilter !== "ALL") params.set("severity", severityFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/institution/interventions?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setInterventions(data.interventions || []);
      } else {
        setError(data.error || "Failed to load student interventions");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to institutional services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, [statusFilter, severityFilter]);

  const handleScanCohort = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/institution/interventions", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchInterventions();
      } else {
        alert(data.error || "Failed to scan cohort");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntervention) return;

    setIsUpdating(true);
    try {
      const res = await fetch("/api/institution/interventions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interventionId: selectedIntervention.id,
          status: newStatus,
          assignedToFacultyName: facultyName || undefined,
          resolutionNotes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedIntervention(null);
        setNotes("");
        fetchInterventions();
      } else {
        alert(data.error || "Failed to update intervention");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = interventions.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.studentName.toLowerCase().includes(q) ||
      i.studentEmail.toLowerCase().includes(q) ||
      (i.rollNumber && i.rollNumber.toLowerCase().includes(q))
    );
  });

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Institution", "Smart Student Intervention"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              Smart Student Intervention & Academic Support Queue
            </h1>
            <p className="text-sm text-slate-500">
              Proactive, non-punitive identification of students needing educational support, roadmap guidance or remedial labs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleScanCohort}
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Scanning Cohorts...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Scan Cohorts for Support Triggers
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Safeguard Guidance Alert */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">
              KAABIL Ethical Support Guidelines:
            </p>
            <p>
              Interventions are strictly developmental opportunities. Students are never labeled as failures or penalized.
              All suggested educational actions require human review by designated mentors or counselors.
            </p>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student by name, email, roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Severities</option>
              <option value="URGENT">Urgent (CRI &lt; 45)</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interventions Queue */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Loading intervention support queue...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-rose-600" />
            <p className="text-sm font-semibold">{error}</p>
            <Button onClick={fetchInterventions} variant="outline" className="mt-3 text-xs">
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-800">Intervention Queue Clear!</p>
            <p className="text-xs text-slate-500 mt-1">
              No active students match the selected support criteria. Click &quot;Scan Cohorts&quot; to run a proactive audit.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <Card
                key={item.id}
                className="border border-slate-200 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`text-[10px] font-bold ${SEVERITY_COLORS[item.severity]}`}>
                        {item.severity}
                      </Badge>
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">
                        {item.triggerReason.replace(/_/g, " ")}
                      </Badge>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                        {item.stream.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-slate-400 font-mono">
                        {item.rollNumber || "No Roll #"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {item.studentName}
                      <span className="text-xs font-normal text-slate-500 font-mono">
                        ({item.studentEmail})
                      </span>
                    </h3>

                    <p className="text-xs text-slate-600">
                      <strong>Identified Signal: </strong>
                      {item.evidenceSummary}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>Department: {item.departmentName || "General"}</span>
                      <span>Review SLA: {item.reviewDate}</span>
                      {item.assignedToFacultyName && (
                        <span className="text-blue-700 font-medium">
                          Assigned to: {item.assignedToFacultyName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      className={`text-xs px-2.5 py-1 ${
                        item.status === "RESOLVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : item.status === "IN_PROGRESS"
                          ? "bg-blue-50 text-blue-700 border-blue-300"
                          : item.status === "DISMISSED"
                          ? "bg-slate-100 text-slate-600 border-slate-200"
                          : "bg-amber-50 text-amber-700 border-amber-300"
                      }`}
                    >
                      {item.status.replace(/_/g, " ")}
                    </Badge>

                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedIntervention(item);
                        setNewStatus(item.status);
                        setFacultyName(item.assignedToFacultyName || "");
                        setNotes(item.resolutionNotes || "");
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3"
                    >
                      Action
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Faculty Review & Action Drawer */}
        {selectedIntervention && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  Faculty Intervention Review
                </h3>
                <button
                  onClick={() => setSelectedIntervention(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="p-5 space-y-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <p className="font-bold text-slate-900">{selectedIntervention.studentName}</p>
                  <p className="text-slate-600">{selectedIntervention.studentEmail}</p>
                  <p className="text-slate-500 pt-1">
                    <strong>Suggested Action:</strong> {selectedIntervention.suggestedAction}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Intervention State *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as InterventionStatus)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Assigned Faculty / Academic Mentor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ramesh Gupta"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Faculty Review & Action Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Document educational actions taken, workshop referrals or roadmap guidance provided..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedIntervention(null)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    {isUpdating ? "Saving..." : "Update Support Record"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
