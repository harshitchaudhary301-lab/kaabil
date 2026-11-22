"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  PlayCircle,
  FileText,
  Sparkles,
  RefreshCw,
  Award,
  Bookmark,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV_ITEMS } from "@/components/student/student-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AcademyResourceItem, StudentResourceProgress } from "@/types/admin";
import { EducationalStream } from "@/types";

const STREAMS: EducationalStream[] = [
  "NON_MEDICAL_PCM",
  "MEDICAL_PCB",
  "COMMERCE",
  "ARTS_HUMANITIES",
  "VOCATIONAL_TRADES",
  "LAW",
  "MANAGEMENT",
  "CREATIVE_DESIGN",
  "AGRICULTURE",
  "SPORTS_PHYSICAL_ED",
  "HOSPITALITY_TOURISM",
  "INTERDISCIPLINARY",
  "UNDECIDED",
];

export default function StudentAcademyPage() {
  const [resources, setResources] = useState<AcademyResourceItem[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, StudentResourceProgress>>({});
  const [loading, setLoading] = useState(true);
  const [streamFilter, setStreamFilter] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [formatFilter, setFormatFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (streamFilter !== "ALL") params.append("stream", streamFilter);
      if (difficultyFilter !== "ALL") params.append("difficulty", difficultyFilter);
      if (formatFilter !== "ALL") params.append("format", formatFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await fetch(`/api/student/academy?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setResources(data.resources);
          setProgressMap(data.progressMap || {});
        }
      }
    } catch (err) {
      console.error("Failed to load academy resources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [streamFilter, difficultyFilter, formatFilter]);

  const toggleResourceCompletion = async (resItem: AcademyResourceItem) => {
    const current = progressMap[resItem.id];
    const isCompleted = current?.status === "COMPLETED";
    const nextStatus = isCompleted ? "NOT_STARTED" : "COMPLETED";
    const nextPct = isCompleted ? 0 : 100;

    try {
      const res = await fetch("/api/student/academy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: resItem.id,
          status: nextStatus,
          progressPct: nextPct,
        }),
      });

      if (res.ok) {
        setProgressMap((prev) => ({
          ...prev,
          [resItem.id]: {
            ...prev[resItem.id],
            id: prev[resItem.id]?.id || `prog-${resItem.id}`,
            studentId: prev[resItem.id]?.studentId || "student",
            resourceId: resItem.id,
            status: nextStatus,
            progressPct: nextPct,
            lastAccessedAt: new Date().toISOString(),
          },
        }));
      }
    } catch (err) {
      console.error("Failed to toggle completion:", err);
    }
  };

  const completedCount = Object.values(progressMap).filter((p) => p.status === "COMPLETED").length;

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV_ITEMS}
      breadcrumbs={["Learning", "Universal Academy"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary">
                KAABIL Learning Academy
              </h1>
              <Badge variant="outline" className="border-primary/20 text-primary">
                Curated Multi-Stream Knowledge
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Stream-tailored learning resources, verified industry curricula, and targeted skill development
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <CheckCircle2 className="h-4 w-4" />
              <span>{completedCount} Resources Completed</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchResources} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <Card className="p-4 border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-text-muted">Stream:</span>
            <select
              className="h-8 text-xs px-2.5 rounded-lg border border-border bg-white text-text-primary"
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
            >
              <option value="ALL">All 13 Streams</option>
              {STREAMS.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>

            <span className="text-xs font-semibold text-text-muted ml-2">Level:</span>
            <select
              className="h-8 text-xs px-2.5 rounded-lg border border-border bg-white text-text-primary"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="ALL">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>

            <span className="text-xs font-semibold text-text-muted ml-2">Format:</span>
            <select
              className="h-8 text-xs px-2.5 rounded-lg border border-border bg-white text-text-primary"
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
            >
              <option value="ALL">All Formats</option>
              <option value="COURSE">Full Course</option>
              <option value="VIDEO">Video Masterclass</option>
              <option value="DOCUMENTATION">Documentation</option>
              <option value="ARTICLE">Article / Paper</option>
              <option value="INTERACTIVE">Interactive Lab</option>
            </select>
          </div>
        </Card>

        {/* Resources Grid */}
        {loading ? (
          <Card className="p-12 text-center text-text-muted">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            Loading curated educational resources...
          </Card>
        ) : resources.length === 0 ? (
          <Card className="p-12 text-center text-text-muted">
            No learning resources match the current filter selection.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((item) => {
              const progress = progressMap[item.id];
              const isCompleted = progress?.status === "COMPLETED";

              return (
                <Card
                  key={item.id}
                  className={`p-5 border transition-all flex flex-col justify-between ${
                    isCompleted
                      ? "border-emerald-300 bg-emerald-50/20"
                      : "border-border hover:shadow-md"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary">
                        {item.format}
                      </Badge>
                      <Badge
                        variant={
                          item.difficulty === "BEGINNER"
                            ? "outline"
                            : item.difficulty === "INTERMEDIATE"
                            ? "warning"
                            : "default"
                        }
                        className="text-[10px]"
                      >
                        {item.difficulty}
                      </Badge>
                    </div>

                    <h3 className="font-heading text-base font-bold text-text-primary line-clamp-2">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>{item.stream.replace(/_/g, " ")}</span>
                      <span>•</span>
                      <Clock className="h-3.5 w-3.5" />
                      <span>{item.estimatedMinutes} mins</span>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {item.description || item.summary}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(item.skillTags || []).slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-muted">{item.provider}</span>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isCompleted ? "outline" : "primary"}
                        className={`h-8 text-xs gap-1.5 ${
                          isCompleted
                            ? "text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                            : "bg-primary text-white"
                        }`}
                        onClick={() => toggleResourceCompletion(item)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {isCompleted ? "Completed" : "Mark Done"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
