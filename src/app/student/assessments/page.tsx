"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BrainCircuit,
  Compass,
  Award,
  Sparkles,
  Scale,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  FileBadge,
  Layers,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";



const STREAM_TABS = [
  { id: "ALL", label: "All Streams" },
  { id: "MEDICAL_PCB", label: "Medical (PCB)" },
  { id: "NON_MEDICAL_PCM", label: "Non-Medical (PCM)" },
  { id: "COMMERCE", label: "Commerce" },
  { id: "ARTS_HUMANITIES", label: "Arts & Humanities" },
  { id: "LAW", label: "Law" },
  { id: "MANAGEMENT", label: "Management" },
  { id: "CREATIVE_ARTS_DESIGN", label: "Creative Design" },
  { id: "AGRICULTURE", label: "Agriculture" },
  { id: "VOCATIONAL_SKILLED", label: "Vocational & Trades" },
  { id: "SPORTS", label: "Sports" },
  { id: "HOSPITALITY_TOURISM", label: "Hospitality" },
  { id: "INTERDISCIPLINARY", label: "Interdisciplinary" },
  { id: "UNDECIDED", label: "Foundational & Aptitude" },
];

export default function SkillAssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedStream, selectedCategory, selectedDifficulty]);

  async function loadData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStream !== "ALL") params.set("stream", selectedStream);
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedDifficulty !== "ALL") params.set("difficulty", selectedDifficulty);

      const [asmRes, eviRes] = await Promise.all([
        fetch(`/api/student/assessments?${params.toString()}`),
        fetch("/api/student/skills/evidence"),
      ]);

      if (asmRes.ok) {
        const data = await asmRes.json();
        setAssessments(data.assessments || []);
      }
      if (eviRes.ok) {
        const eviData = await eviRes.json();
        setEvidences(eviData.evidences || []);
      }
    } catch (err) {
      console.error("[SkillAssessmentsPage] Failed to fetch assessments:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredAssessments = assessments.filter((asm) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      asm.title.toLowerCase().includes(query) ||
      asm.targetSkillName.toLowerCase().includes(query) ||
      asm.description.toLowerCase().includes(query)
    );
  });

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Dashboard", "Skill Assessments"]}
    >
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-primary/5 p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:from-slate-900 dark:via-slate-900 dark:to-primary/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                  Intelligent Assessment Engine
                </Badge>
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-xs">
                  Zero Fake Credentials
                </Badge>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Universal Skill Assessment & Verification
              </h1>
              <p className="mt-1 text-sm text-slate-500 max-w-2xl">
                Validate your competencies across all 13 educational streams through stage-adaptive evaluations. Passing scores automatically mint tamper-evident Skill Evidence directly into your Career Digital Twin and boost your Career Readiness Index (CRI).
              </p>
            </div>

            <div className="flex gap-4 shrink-0">
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs dark:border-slate-800 dark:bg-slate-800">
                <div className="text-xl font-bold text-primary">{evidences.length}</div>
                <div className="text-[11px] text-slate-500">Verified Skills</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs dark:border-slate-800 dark:bg-slate-800">
                <div className="text-xl font-bold text-emerald-600">{assessments.length}</div>
                <div className="text-[11px] text-slate-500">Assessments Ready</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="space-y-3">
          {/* Stream Tabs Bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {STREAM_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStream(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedStream === tab.id
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search assessments by skill, title, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs sm:text-sm outline-hidden focus:border-primary dark:border-slate-800 dark:bg-slate-900"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-hidden dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="ALL">All Categories</option>
              <option value="FOUNDATION">Foundation</option>
              <option value="SUBJECT_SPECIFIC">Subject Specific</option>
              <option value="DOMAIN_COMPETENCY">Domain Competency</option>
              <option value="LOGICAL_REASONING">Logical Reasoning</option>
              <option value="CAREER_AWARENESS">Career Awareness</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-hidden dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="ALL">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>

        {/* Assessment Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <Award className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-200">
              No assessments found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your stream, category, or search filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssessments.map((asm) => {
              const isVerified = asm.passed;
              return (
                <Card
                  key={asm.id}
                  className="flex flex-col justify-between overflow-hidden border-slate-200 transition-all hover:border-primary/50 hover:shadow-md dark:border-slate-800"
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] font-medium tracking-wide">
                        {asm.stream.replace(/_/g, " ")}
                      </Badge>
                      {isVerified ? (
                        <Badge className="bg-emerald-500 text-white text-[10px] gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Verified ({asm.lastScore}%)
                        </Badge>
                      ) : asm.hasAttempted ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Attempted ({asm.lastScore}%)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-slate-500">
                          {asm.difficultyLevel}
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="mt-3 text-base font-bold leading-snug text-slate-900 dark:text-slate-100 line-clamp-2">
                      {asm.title}
                    </CardTitle>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-3">
                      {asm.description}
                    </p>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-4">
                    <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Target Skill</span>
                      <span className="font-semibold text-primary">{asm.targetSkillName}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {asm.durationMinutes} mins
                      </span>
                      <span>{asm.questionCount} Questions</span>
                      <span>Pass: {asm.passingPercentage}%</span>
                    </div>

                    <Link href={`/student/assessments/${asm.id}`} className="block">
                      <Button className="w-full gap-2 text-xs bg-primary hover:bg-primary/90">
                        <span>{isVerified ? "Retake Assessment" : "Start Assessment"}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
