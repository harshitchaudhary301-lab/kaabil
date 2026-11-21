"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Users,
  Search,
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
import { ClassBatchRecord, ProgramRecord, AcademicSessionRecord } from "@/types/institution";

export default function InstitutionClassesPage() {
  const [classes, setClasses] = useState<ClassBatchRecord[]>([]);
  const [programs, setPrograms] = useState<ProgramRecord[]>([]);
  const [sessions, setSessions] = useState<AcademicSessionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [programId, setProgramId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [semesterOrYearNumber, setSemesterOrYearNumber] = useState<number>(1);
  const [sectionName, setSectionName] = useState<string>("A");
  const [maxCapacity, setMaxCapacity] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [classRes, progRes, sessRes] = await Promise.all([
        fetch("/api/institution/classes"),
        fetch("/api/institution/programs"),
        fetch("/api/institution/sessions"),
      ]);

      const [classData, progData, sessData] = await Promise.all([
        classRes.json(),
        progRes.json(),
        sessRes.json(),
      ]);

      if (classRes.ok && classData.success) {
        setClasses(classData.classes || classData.data?.classes || []);
      } else {
        setError(classData.error || "Failed to load classes and batches");
      }

      if (progRes.ok && progData.success) {
        const progList = progData.programs || progData.data?.programs || [];
        setPrograms(progList);
        if (progList.length > 0 && !programId) {
          setProgramId(progList[0].id);
        }
      }

      if (sessRes.ok && sessData.success) {
        const sessList = sessData.sessions || sessData.data?.sessions || [];
        setSessions(sessList);
        const current = sessList.find((s: any) => s.isCurrent);
        if (current && !sessionId) {
          setSessionId(current.id);
        } else if (sessList.length > 0 && !sessionId) {
          setSessionId(sessList[0].id);
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

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !programId || !sessionId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/institution/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          programId,
          sessionId,
          semesterOrYearNumber: Number(semesterOrYearNumber),
          sectionName,
          maxCapacity: Number(maxCapacity),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setName("");
        fetchData();
      } else {
        alert(data.error || "Failed to create class batch");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBatches = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.sectionName && c.sectionName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Institution", "Classes & Batches"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Layers className="h-6 w-6 text-blue-600" />
              Classes & Cohort Batches
            </h1>
            <p className="text-sm text-slate-500">
              Manage student cohorts, classroom sections, capacities and semester schedules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Class / Batch
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by batch name or section..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Loading classes & batches...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-600" />
            <p className="text-sm font-semibold">{error}</p>
            <Button onClick={fetchData} variant="outline" className="mt-3 text-xs">
              Retry
            </Button>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            <Layers className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">No classes or batches found</p>
            <p className="text-xs text-slate-400 mt-1">
              Add a class section or cohort batch to organize student enrollments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBatches.map((batch) => {
              const prog = programs.find((p) => p.id === batch.programId);
              const sess = sessions.find((s) => s.id === batch.sessionId);
              const fillPct = Math.round(((batch.enrolledCount || 0) / (batch.maxCapacity || 60)) * 100);

              return (
                <Card key={batch.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">
                            Sem/Yr {batch.semesterOrYearNumber}
                          </Badge>
                          {batch.sectionName && (
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">
                              Sec {batch.sectionName}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base font-semibold text-slate-900 leading-snug">
                          {batch.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-slate-600">
                      <span className="font-medium text-slate-700">Program: </span>
                      <span>{prog?.name || "General Program"}</span>
                    </div>

                    <div className="text-xs text-slate-600">
                      <span className="font-medium text-slate-700">Academic Session: </span>
                      <span>{sess?.name || batch.academicYear || "2025–2026"}</span>
                    </div>

                    {/* Capacity Progress */}
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Capacity Fill
                        </span>
                        <span className="font-semibold text-slate-800">
                          {batch.enrolledCount || 0} / {batch.maxCapacity} ({fillPct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            fillPct > 90
                              ? "bg-rose-500"
                              : fillPct > 70
                              ? "bg-amber-500"
                              : "bg-blue-600"
                          }`}
                          style={{ width: `${Math.min(fillPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal: Add Batch */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  Add Class Section / Batch
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateBatch} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Batch / Class Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE-2026 Batch Alpha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Academic Program *
                  </label>
                  <select
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {programs.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name} ({prog.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Academic Session *
                  </label>
                  <select
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {sessions.map((sess) => (
                      <option key={sess.id} value={sess.id}>
                        {sess.name} {sess.isCurrent ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Sem/Yr No.
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={12}
                      value={semesterOrYearNumber}
                      onChange={(e) => setSemesterOrYearNumber(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Section
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. A"
                      value={sectionName}
                      onChange={(e) => setSectionName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={250}
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(Number(e.target.value))}
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
                    {isSubmitting ? "Creating..." : "Save Batch"}
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
