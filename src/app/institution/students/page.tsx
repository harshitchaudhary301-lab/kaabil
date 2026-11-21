"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  FileSpreadsheet,
  Building2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { INSTITUTION_NAV } from "@/components/institution/institution-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentEnrollmentRecord } from "@/types/institution";

export default function InstitutionStudentsPage() {
  const [students, setStudents] = useState<StudentEnrollmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [streamFilter, setStreamFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  // Enroll single student form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRoll, setNewRoll] = useState("");
  const [newStream, setNewStream] = useState("NON_MEDICAL_PCM");
  const [newStage, setNewStage] = useState("UNDERGRADUATE");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (streamFilter !== "ALL") params.set("stream", streamFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/institution/students?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.students) {
        setStudents(data.students);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [streamFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setEnrolling(true);
      setEnrollError(null);
      const res = await fetch("/api/institution/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: newName,
          studentEmail: newEmail,
          rollNumber: newRoll,
          stream: newStream,
          stage: newStage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnrollModalOpen(false);
        setNewName("");
        setNewEmail("");
        setNewRoll("");
        fetchStudents();
      } else {
        setEnrollError(data.error || "Failed to enroll student.");
      }
    } catch (err: any) {
      setEnrollError(err.message || "Failed to connect to enrollment service.");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Students", "Student Directory"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-soft-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </span>
              <h1 className="text-2xl font-bold font-heading text-slate-900">
                Student Directory &amp; Cohort Management
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Verified campus enrollment records across all 13 educational streams. DPDP Act 2023 protections active.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEnrollModalOpen(true)}
              className="gap-1.5 text-xs"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Enroll Student
            </Button>

            <Link href="/institution/students/import">
              <Button size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/95 text-white">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Bulk CSV Import
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-soft-xs text-xs">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name, email, or roll number..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button type="submit" size="sm" variant="outline" className="text-xs">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none"
            >
              <option value="ALL">All Educational Streams</option>
              <option value="NON_MEDICAL_PCM">STEM (PCM)</option>
              <option value="MEDICAL_PCB">Medical (PCB)</option>
              <option value="COMMERCE">Commerce &amp; Finance</option>
              <option value="ARTS_HUMANITIES">Arts &amp; Humanities</option>
              <option value="LAW">Law</option>
              <option value="MANAGEMENT">Management</option>
              <option value="VOCATIONAL_TRADES">Vocational Trades</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INVITED">Invited</option>
              <option value="ALUMNI">Alumni</option>
            </select>

            <Button
              size="sm"
              variant="ghost"
              onClick={fetchStudents}
              className="h-8 px-2 text-slate-500 hover:text-slate-800"
              title="Refresh List"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Student Table Card */}
        <Card className="border-slate-200 bg-white shadow-soft-xs overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Student Name &amp; Email</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Stream &amp; Stage</th>
                  <th className="py-3 px-4">Department &amp; Program</th>
                  <th className="py-3 px-4">Readiness (CRI)</th>
                  <th className="py-3 px-4">Evidence</th>
                  <th className="py-3 px-4">Status &amp; Safety</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 italic">
                      No enrolled student records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{s.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{s.studentEmail}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700 text-[11px]">
                        {s.rollNumber || "—"}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{s.stream.replace(/_/g, " ")}</div>
                        <div className="text-[10px] text-slate-400">{s.stage.replace(/_/g, " ")}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 truncate max-w-[160px]" title={s.programName || s.departmentName}>
                          {s.programName || s.departmentName || "General Cohort"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {s.readinessIndex ? (
                          <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {s.readinessIndex}/100
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Unassessed</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-slate-600 font-medium">
                          {s.verifiedSkillsCount} verified skills &bull; {s.assessmentsCompletedCount} challenges
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge
                            variant="outline"
                            className={`text-[9px] ${
                              s.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {s.status}
                          </Badge>

                          {s.isMinor && (
                            <span className="text-[9px] text-purple-700 font-semibold flex items-center gap-0.5">
                              <ShieldCheck className="h-3 w-3" /> Minor Protected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Modal: Enroll Single Student */}
        {enrollModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-soft-lg space-y-5 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-primary/10 text-primary">
                    <UserPlus className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Enroll Individual Student</h3>
                    <p className="text-xs text-slate-500">Connect a student to your institution cohort</p>
                  </div>
                </div>
                <button
                  onClick={() => setEnrollModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {enrollError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{enrollError}</span>
                </div>
              )}

              <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Official Student Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. priya.sharma@campus.edu.in"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Roll / Registration Number</label>
                  <input
                    type="text"
                    value={newRoll}
                    onChange={(e) => setNewRoll(e.target.value)}
                    placeholder="e.g. DTC-2024-CS-101"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Educational Stream *</label>
                    <select
                      value={newStream}
                      onChange={(e) => setNewStream(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                    >
                      <option value="NON_MEDICAL_PCM">Non-Medical / STEM</option>
                      <option value="MEDICAL_PCB">Medical &amp; Healthcare</option>
                      <option value="COMMERCE">Commerce &amp; Finance</option>
                      <option value="MANAGEMENT">Management</option>
                      <option value="ARTS_HUMANITIES">Arts &amp; Humanities</option>
                      <option value="LAW">Law</option>
                      <option value="VOCATIONAL_TRADES">Vocational Trades</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Education Stage *</label>
                    <select
                      value={newStage}
                      onChange={(e) => setNewStage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                    >
                      <option value="UNDERGRADUATE">Undergraduate</option>
                      <option value="POSTGRADUATE">Postgraduate</option>
                      <option value="DIPLOMA">Diploma</option>
                      <option value="ITI">ITI Trade</option>
                      <option value="CLASS_12">Class 12</option>
                      <option value="CLASS_11">Class 11</option>
                      <option value="CLASS_10">Class 10 (Minor Protected)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEnrollModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={enrolling}
                    className="text-xs bg-primary hover:bg-primary/95 text-white"
                  >
                    {enrolling ? "Enrolling..." : "Enroll Student"}
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
