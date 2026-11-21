"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Clock,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { INSTITUTION_NAV } from "@/components/institution/institution-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgramRecord, DepartmentRecord } from "@/types/institution";
import { EducationStage, EducationalStream } from "@/types";

const STAGE_OPTIONS = [
  { value: "ALL", label: "All Levels" },
  { value: "CLASS_8_10", label: "Secondary (Classes 8–10)" },
  { value: "HIGHER_SECONDARY", label: "Senior Secondary (11–12)" },
  { value: "DIPLOMA", label: "Polytechnic / Diploma" },
  { value: "VOCATIONAL", label: "Vocational Certificate / ITI" },
  { value: "UNDERGRADUATE", label: "Undergraduate (Bachelor's)" },
  { value: "POSTGRADUATE", label: "Postgraduate (Master's)" },
  { value: "DOCTORAL", label: "Doctoral (Ph.D.)" },
];

export default function InstitutionProgramsPage() {
  const [programs, setPrograms] = useState<ProgramRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [stage, setStage] = useState<EducationStage>("UNDERGRADUATE");
  const [stream, setStream] = useState<EducationalStream>("NON_MEDICAL_PCM");
  const [durationYears, setDurationYears] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [progRes, deptRes] = await Promise.all([
        fetch("/api/institution/programs"),
        fetch("/api/institution/departments"),
      ]);

      const [progData, deptData] = await Promise.all([progRes.json(), deptRes.json()]);

      if (progRes.ok && progData.success) {
        setPrograms(progData.programs || progData.data?.programs || []);
      } else {
        setError(progData.error || "Failed to load academic programs");
      }

      if (deptRes.ok && deptData.success) {
        const deptList = deptData.departments || deptData.data?.departments || [];
        setDepartments(deptList);
        if (deptList.length > 0 && !departmentId) {
          setDepartmentId(deptList[0].id);
        }
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

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/institution/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code,
          departmentId: departmentId || undefined,
          stage,
          stream,
          durationYears: Number(durationYears),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setName("");
        setCode("");
        fetchData();
      } else {
        alert(data.error || "Failed to create program");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());

    const matchesStage = stageFilter === "ALL" || p.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Institution", "Academic Programs"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Academic Programs & Degrees
            </h1>
            <p className="text-sm text-slate-500">
              Configure curriculum paths from secondary school classes through postgraduate and doctoral degrees.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Program
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by program name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            {STAGE_OPTIONS.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Loading academic programs...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-600" />
            <p className="text-sm font-semibold">{error}</p>
            <Button onClick={fetchData} variant="outline" className="mt-3 text-xs">
              Retry
            </Button>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">No programs found</p>
            <p className="text-xs text-slate-400 mt-1">
              Add a degree or certificate program to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrograms.map((prog) => {
              const dept = departments.find((d) => d.id === prog.departmentId);
              return (
                <Card key={prog.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-mono mb-1">
                          {prog.code}
                        </Badge>
                        <CardTitle className="text-base font-semibold text-slate-900 leading-snug">
                          {prog.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">Department:</span>
                      <span className="text-slate-800">{dept?.name || "Institution-Wide"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                        {prog.stage.replace(/_/g, " ")}
                      </Badge>
                      <span className="flex items-center gap-1 text-slate-500 text-xs">
                        <Clock className="h-3 w-3" />
                        {prog.durationYears} {prog.durationYears === 1 ? "Year" : "Years"}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Stream Category</span>
                      <span className="font-medium text-slate-800 bg-slate-50 px-2 py-0.5 rounded">
                        {prog.stream}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal: Add Program */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Add Academic Program
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProgram} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Program / Degree Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Tech Computer Science & AI"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Program Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BTECH-CSE"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Duration (Years) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={6}
                      value={durationYears}
                      onChange={(e) => setDurationYears(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Department Assignment
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Institution-Wide / General</option>
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
                      Education Level *
                    </label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as EducationStage)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {STAGE_OPTIONS.filter((s) => s.value !== "ALL").map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Stream *
                    </label>
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value as EducationalStream)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="NON_MEDICAL_PCM">Engineering & Tech (PCM)</option>
                      <option value="MEDICAL_PCB">Medical & Healthcare (PCB)</option>
                      <option value="COMMERCE">Commerce & Business</option>
                      <option value="ARTS_HUMANITIES">Arts & Humanities</option>
                      <option value="LAW">Legal Studies</option>
                      <option value="MANAGEMENT">Management Studies</option>
                      <option value="CREATIVE_DESIGN">Design & Creative Arts</option>
                      <option value="AGRICULTURE">Agriculture & Allied</option>
                      <option value="VOCATIONAL_TRADES">Vocational & ITI</option>
                      <option value="SPORTS_PHYSICAL_ED">Sports & Physical Ed</option>
                      <option value="HOSPITALITY_TOURISM">Hospitality & Tourism</option>
                      <option value="INTERDISCIPLINARY">Interdisciplinary</option>
                    </select>
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
                    {isSubmitting ? "Creating..." : "Save Program"}
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
