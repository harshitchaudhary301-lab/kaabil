"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Users,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Layers,
  ArrowRight,
  BookOpen,
  Award,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { INSTITUTION_NAV } from "@/components/institution/institution-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrainingProgramRecord } from "@/types/institution";
import { EducationalStream } from "@/types";

const STREAM_OPTIONS = [
  "All Streams",
  "NON_MEDICAL_PCM",
  "MEDICAL_PCB",
  "COMMERCE",
  "ARTS_HUMANITIES",
  "LAW",
  "VOCATIONAL_TRADES",
  "CREATIVE_DESIGN",
  "AGRICULTURE",
];

export default function InstitutionTrainingPage() {
  const [programs, setPrograms] = useState<TrainingProgramRecord[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"PROGRAMS" | "ADAPTIVE">("PROGRAMS");
  const [error, setError] = useState<string | null>(null);
  const [streamFilter, setStreamFilter] = useState<string>("All Streams");

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [stream, setStream] = useState<EducationalStream>("NON_MEDICAL_PCM");
  const [targetedSkillsInput, setTargetedSkillsInput] = useState<string>("");
  const [mode, setMode] = useState<"ONLINE" | "OFFLINE" | "HYBRID">("HYBRID");
  const [instructorName, setInstructorName] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = streamFilter !== "All Streams" ? `?stream=${streamFilter}` : "";
      const [progRes, propRes] = await Promise.all([
        fetch(`/api/institution/training${q}`),
        fetch("/api/institution/training/recommendations"),
      ]);

      const [progData, propData] = await Promise.all([progRes.json(), propRes.json()]);

      if (progRes.ok && progData.success) {
        setPrograms(progData.programs || []);
      } else {
        setError(progData.error || "Failed to load training programs");
      }

      if (propRes.ok && propData.success) {
        setProposals(propData.recommendations || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to institutional services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [streamFilter]);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !stream || !instructorName) return;

    setIsSubmitting(true);
    try {
      const skills = targetedSkillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/institution/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          stream,
          targetedSkills: skills,
          mode,
          instructorName,
          startDate: startDate || new Date().toISOString().split("T")[0],
          endDate: endDate || new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setTitle("");
        setDescription("");
        setTargetedSkillsInput("");
        setInstructorName("");
        fetchData();
      } else {
        alert(data.error || "Failed to create training program");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertProposal = (prop: any) => {
    setTitle(prop.proposedTitle);
    setDescription(prop.educationalRationale);
    setStream(prop.stream);
    setTargetedSkillsInput(prop.targetedSkill);
    setMode(prop.recommendedMode);
    setIsModalOpen(true);
  };

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Institution", "Smart Training Management"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              Smart Training Management & Adaptive Workshops
            </h1>
            <p className="text-sm text-slate-500">
              Create and manage stream-specific skills development workshops, faculty-led sessions, and gap-driven curricula.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create Training Program
            </Button>
          </div>
        </div>

        {/* Tab Selector & Stream Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("PROGRAMS")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "PROGRAMS"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Active Training Programs ({programs.length})
            </button>
            <button
              onClick={() => setActiveTab("ADAPTIVE")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "ADAPTIVE"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Adaptive Gap Proposals ({proposals.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Stream:</span>
            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              {STREAM_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Loading training programs and recommendations...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-600" />
            <p className="text-sm font-semibold">{error}</p>
            <Button onClick={fetchData} variant="outline" className="mt-3 text-xs">
              Retry
            </Button>
          </div>
        ) : activeTab === "PROGRAMS" ? (
          programs.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">No training programs scheduled</p>
              <p className="text-xs text-slate-400 mt-1">
                Create a workshop manually or check Adaptive Gap Proposals for AI recommendations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {programs.map((prog) => (
                <Card key={prog.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] mb-1">
                        {prog.stream.replace(/_/g, " ")}
                      </Badge>
                      <Badge
                        className={`text-[10px] ${
                          prog.mode === "ONLINE"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : prog.mode === "OFFLINE"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {prog.mode}
                      </Badge>
                    </div>

                    <CardTitle className="text-base font-bold text-slate-900 leading-snug">
                      {prog.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500">Instructor: {prog.instructorName}</p>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {prog.description || "Comprehensive skill development workshop covering stream competencies."}
                    </p>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Targeted Competencies:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {prog.targetedSkills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {prog.enrolledCount} / {prog.maxCapacity} Enrolled
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {prog.startDate}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          /* Adaptive Proposals Tab */
          proposals.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800">All Competencies Well-Covered!</p>
              <p className="text-xs text-slate-500 mt-1">
                No severe cohort skill gaps detected. The heatmap reports healthy demonstration rates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposals.map((prop) => (
                <Card
                  key={prop.id}
                  className="border border-purple-200 shadow-sm bg-gradient-to-br from-purple-50/40 via-white to-white hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Gap-Driven Recommendation
                      </Badge>
                      <Badge
                        className={`text-[10px] ${
                          prop.gapStatus === "CRITICAL"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {prop.gapStatus} GAP ({prop.demonstratedPercent}% DEMO)
                      </Badge>
                    </div>

                    <CardTitle className="text-base font-bold text-slate-900 mt-1">
                      {prop.proposedTitle}
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      Department: {prop.departmentName} &bull; Stream: {prop.stream.replace(/_/g, " ")}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs">
                    <p className="text-slate-600 bg-white p-3 rounded-lg border border-purple-100">
                      <strong>Educational Rationale: </strong>
                      {prop.educationalRationale}
                    </p>

                    <div className="flex items-center justify-between text-slate-500">
                      <span>Suggested Format: <strong>{prop.recommendedMode}</strong> ({prop.suggestedDuration})</span>
                      <Button
                        size="sm"
                        onClick={() => handleConvertProposal(prop)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1"
                      >
                        Adopt & Schedule
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}

        {/* Modal: Create Program */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  Create Institutional Training Program
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
                    Program / Workshop Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clinical Pharmacology Intensive Sprint"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Disciplinary Stream *
                    </label>
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value as EducationalStream)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {STREAM_OPTIONS.filter((s) => s !== "All Streams").map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Delivery Mode *
                    </label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="HYBRID">Hybrid (Interactive)</option>
                      <option value="ONLINE">Online (Live Virtual)</option>
                      <option value="OFFLINE">Offline (In-Person Lab)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Targeted Skills (Comma Separated) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pharmacology & Dosage, Drug Interactions, Emergency Triage"
                    value={targetedSkillsInput}
                    onChange={(e) => setTargetedSkillsInput(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Upon passing/completion, students receive verified skill evidence for their Digital Skill Passport!
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Instructor / Faculty Lead *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Priya Sundaram"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Description & Learning Outcomes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detail the curriculum, prerequisites, and evaluation methods..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
