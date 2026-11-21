"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
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
import { DepartmentRecord } from "@/types/institution";
import { EducationalStream } from "@/types";

const STREAM_OPTIONS = [
  "All Streams",
  "Engineering & Technology",
  "Medical & Healthcare",
  "Commerce & Business",
  "Arts & Humanities",
  "Pure Sciences",
  "Vocational & ITI",
  "Legal Studies",
  "Design & Creative Arts",
  "Agriculture & Environmental",
  "Hospitality & Tourism",
  "Education & Teaching",
  "Defense & Civil Services",
  "Mass Communication & Media",
];

export default function InstitutionDepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [streamFilter, setStreamFilter] = useState<string>("All Streams");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [stream, setStream] = useState<string>("Engineering & Technology");
  const [headOfDepartmentName, setHeadOfDepartmentName] = useState<string>("");
  const [headOfDepartmentEmail, setHeadOfDepartmentEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/institution/departments");
      const data = await res.json();
      if (res.ok && data.success) {
        setDepartments(data.departments || data.data?.departments || []);
      } else {
        setError(data.error || "Failed to load departments");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to institutional services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/institution/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code,
          stream,
          headOfDepartmentName: headOfDepartmentName || undefined,
          headOfDepartmentEmail: headOfDepartmentEmail || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setName("");
        setCode("");
        setHeadOfDepartmentName("");
        setHeadOfDepartmentEmail("");
        fetchDepartments();
      } else {
        alert(data.error || "Failed to create department");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDepts = departments.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      (d.headOfDepartmentName && d.headOfDepartmentName.toLowerCase().includes(search.toLowerCase()));

    const matchesStream =
      streamFilter === "All Streams" ||
      (d.stream && d.stream.toLowerCase().includes(streamFilter.toLowerCase().split(" ")[0]));

    return matchesSearch && matchesStream;
  });

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Institution", "Departments"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              Academic Departments
            </h1>
            <p className="text-sm text-slate-500">
              Manage multi-disciplinary academic divisions across all educational streams.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by department name, code, or HOD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            {STREAM_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Loading academic departments...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-600" />
            <p className="text-sm font-semibold">{error}</p>
            <Button onClick={fetchDepartments} variant="outline" className="mt-3 text-xs">
              Retry
            </Button>
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">No departments found</p>
            <p className="text-xs text-slate-400 mt-1">
              Add a department or adjust your filter query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDepts.map((dept) => (
              <Card key={dept.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-mono mb-1">
                        {dept.code}
                      </Badge>
                      <CardTitle className="text-base font-semibold text-slate-900 leading-snug">
                        {dept.name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Stream: </span>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px]">
                      {dept.stream || "General"}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Head of Dept: </span>
                    <span>{dept.headOfDepartmentName || "Not assigned"}</span>
                  </div>

                  {dept.headOfDepartmentEmail && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      {dept.headOfDepartmentEmail}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Add Department */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Add Academic Department
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDepartment} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Department of Mechanical Engineering"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Department Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MECH"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Disciplinary Stream *
                    </label>
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {STREAM_OPTIONS.filter((s) => s !== "All Streams").map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Head of Department (HOD) Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ramesh Gupta"
                    value={headOfDepartmentName}
                    onChange={(e) => setHeadOfDepartmentName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    HOD Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. r.gupta@institution.edu"
                    value={headOfDepartmentEmail}
                    onChange={(e) => setHeadOfDepartmentEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
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
                    {isSubmitting ? "Creating..." : "Save Department"}
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
