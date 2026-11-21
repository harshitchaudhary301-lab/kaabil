"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Plus,
  Users,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  BookOpen,
  Award,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { INSTITUTION_NAV } from "@/components/institution/institution-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstitutionalAssessmentSchedule, DepartmentRecord } from "@/types/institution";
import { AssessmentData } from "@/data/assessmentsData";

export default function InstitutionAssessmentsPage() {
  const [schedules, setSchedules] = useState<InstitutionalAssessmentSchedule[]>([]);
  const [catalogue, setCatalogue] = useState<AssessmentData[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Schedule Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [assessmentId, setAssessmentId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assessRes, deptRes] = await Promise.all([
        fetch("/api/institution/assessments"),
        fetch("/api/institution/departments"),
      ]);

      const [assessData, deptData] = await Promise.all([assessRes.json(), deptRes.json()]);

      if (assessRes.ok && assessData.success) {
        setSchedules(assessData.schedules || []);
        setCatalogue(assessData.catalogue || []);
        if (assessData.catalogue?.length > 0 && !assessmentId) {
          setAssessmentId(assessData.catalogue[0].id);
        }
      } else {
        setError(assessData.error || "Failed to load assessments data");
      }

      if (deptRes.ok && deptData.success) {
        setDepartments(deptData.departments || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to institutional services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScheduleAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assessmentId || !scheduledDate || !deadline) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/institution/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          assessmentId,
          departmentId: departmentId || undefined,
          scheduledDate,
          deadline,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setTitle("");
        fetchData();
      } else {
        alert(data.error || "Failed to schedule assessment");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Institution", "Institutional Assessments"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-6 w-6 text-blue-600" />
              Institutional Assessment Management & Cohort Scheduling
            </h1>
            <p className="text-sm text-slate-500">
              Schedule standardized stream assessments, assign cohort deadlines, and evaluate objective competency attainment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Schedule Cohort Assessment
            </Button>
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Loading assessment catalogue and active schedules...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-600" />
            <p className="text-sm font-semibold">{error}</p>
            <Button onClick={fetchData} variant="outline" className="mt-3 text-xs">
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Schedules Section */}
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Active Cohort Assessment Schedules ({schedules.length})
              </h2>

              {schedules.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-slate-300 text-slate-500">
                  <p className="text-xs">No active assessments scheduled for institutional cohorts.</p>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="outline"
                    className="mt-2 text-xs"
                  >
                    Schedule Assessment
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schedules.map((sch) => {
                    const dept = departments.find((d) => d.id === sch.departmentId);
                    return (
                      <Card key={sch.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                              {sch.status}
                            </Badge>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Deadline: {sch.deadline}
                            </span>
                          </div>
                          <CardTitle className="text-sm font-bold text-slate-900 leading-snug mt-1">
                            {sch.title}
                          </CardTitle>
                          <p className="text-xs text-slate-500">
                            Department: {dept ? dept.name : "Institution-Wide"}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-600">
                            <span>Assigned Students:</span>
                            <span className="font-bold text-slate-800">{sch.totalAssigned}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Completed Submissions:</span>
                            <span className="font-bold text-emerald-700">{sch.totalSubmitted}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Assessment Catalogue Section */}
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                Standardized Skill Assessment Catalogue ({catalogue.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalogue.slice(0, 9).map((item) => (
                  <Card key={item.id} className="border border-slate-200 shadow-xs flex flex-col justify-between">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                          {item.stream.replace(/_/g, " ")}
                        </Badge>
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">
                          {item.category.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-bold text-slate-900 mt-1">
                        {item.title}
                      </CardTitle>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Standardized Bank</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTitle(`${item.title} - Cohort Assessment`);
                          setAssessmentId(item.id);
                          setIsModalOpen(true);
                        }}
                        className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        Schedule This
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Schedule Assessment */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-blue-600" />
                  Schedule Cohort Assessment
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleScheduleAssessment} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Assessment Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mid-Term Clinical Pharmacology Assessment"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Select Standardized Assessment *
                  </label>
                  <select
                    value={assessmentId}
                    onChange={(e) => setAssessmentId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {catalogue.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.stream.replace(/_/g, " ")})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Assign to Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Institution-Wide (All Eligible Students)</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Submission Deadline *
                    </label>
                    <input
                      type="date"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    {isSubmitting ? "Scheduling..." : "Schedule Assessment"}
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
