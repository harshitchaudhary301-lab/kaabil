"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Search,
  Filter,
  TrendingUp,
  Compass,
  ArrowRight,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/utils";
import { Modal } from "@/components/ui/dialog";
import { PublicCareerListItem } from "@/repositories/career.repository";
import { CAREER_PATHS_DATABASE } from "@/data/careersData";
import { EducationalStream, EducationStage } from "@prisma/client";

export function CareerDiscoverySection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [modalCareer, setModalCareer] = useState<PublicCareerListItem | null>(null);

  // Database-connected state
  const [careers, setCareers] = useState<PublicCareerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<"database" | "local_catalogue">("local_catalogue");
  const [totalCount, setTotalCount] = useState<number>(CAREER_PATHS_DATABASE.length);

  const fetchCareers = async (streamFilter: string, search: string) => {
    setIsLoading(true);
    setDbError(null);

    try {
      const params = new URLSearchParams();
      if (streamFilter && streamFilter !== "ALL") {
        params.set("stream", streamFilter);
      }
      if (search && search.trim() !== "") {
        params.set("search", search.trim());
      }
      params.set("limit", "24");

      const res = await fetch(`/api/careers?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const json = await res.json();
      setCareers(json.careers || []);
      setTotalCount(json.total || 0);
      setIsDbConnected(!!json.isDbConnected);
      setDataSource(json.source || "local_catalogue");
    } catch (err: unknown) {
      const error = err as Error;
      setDbError(error.message);
      // Fallback gracefully to local in-memory dataset
      const localFiltered = CAREER_PATHS_DATABASE.filter((c) => {
        const matchesStream =
          streamFilter === "ALL" || c.stream === streamFilter;
        const matchesQuery =
          !search ||
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.overview.toLowerCase().includes(search.toLowerCase());
        return matchesStream && matchesQuery;
      }).map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        tagline: c.tagline,
        overview: c.overview,
        stream: c.stream as EducationalStream,
        streamTitle: c.streamTitle,
        domainName: c.domainName,
        minEducationStage: c.minEducationStage as EducationStage,
        avgStartingSalaryInr: c.avgStartingSalaryInr,
        avgMidCareerSalaryInr: c.avgMidCareerSalaryInr,
        growthOutlook: c.growthOutlook,
        automationRisk: c.automationRisk,
        regulatoryBody: c.regulatoryBody || null,
        isRegulated: !!c.regulatoryBody,
        isDemoData: c.isDemoData,
        verificationStatus: "VERIFIED",
        skills: c.skills.map((s) => ({
          name: s.name,
          category: s.category,
          requiredLevel: s.requiredLevel,
          importanceWeight: s.importanceWeight,
          isMandatory: s.isMandatory,
        })),
        keyEntranceExams: c.keyEntranceExams,
      }));

      setCareers(localFiltered);
      setTotalCount(localFiltered.length);
      setIsDbConnected(false);
      setDataSource("local_catalogue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCareers(selectedFilter, searchQuery);
    }, 200);

    return () => clearTimeout(handler);
  }, [selectedFilter, searchQuery]);

  const streamFilters = [
    { id: "ALL", label: "All 13 Streams" },
    { id: "MEDICAL_PCB", label: "Medical (PCB)" },
    { id: "NON_MEDICAL_PCM", label: "STEM (PCM)" },
    { id: "COMMERCE", label: "Commerce" },
    { id: "ARTS_HUMANITIES", label: "Arts & Civil" },
    { id: "LAW", label: "Law" },
    { id: "MANAGEMENT", label: "Management" },
    { id: "CREATIVE_DESIGN", label: "Design" },
    { id: "VOCATIONAL_TRADES", label: "Vocational" },
    { id: "INTERDISCIPLINARY", label: "Interdisciplinary" },
  ];

  return (
    <section id="discovery" className="py-20 lg:py-28 bg-slate-50/70 border-t border-border scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Compass className="h-3.5 w-3.5" />
            PostgreSQL-Powered Career Engine
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
            Explore Calibrated Indian Pathways
          </h2>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Search careers, inspect required skills, evaluate real starting packages in India, and review regulatory bodies before committing your future.
          </p>

          {/* Database Live Telemetry Pill */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
            {isDbConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                <Database className="h-3.5 w-3.5 text-emerald-600" />
                PostgreSQL Live Connected • {totalCount} Pathways Available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                <Database className="h-3.5 w-3.5 text-amber-600" />
                PostgreSQL Offline • Serving Verified Local Baseline ({totalCount} Pathways)
              </span>
            )}
            <Badge variant="demo">Demonstration Data</Badge>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="max-w-4xl mx-auto mb-10 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by career, stream, or skill (e.g., Doctor, CA, AI, Law, Mechatronics)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-white pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted shadow-soft-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {streamFilters.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedFilter === f.id
                    ? "bg-primary text-white shadow-soft-xs"
                    : "bg-white border border-border text-text-secondary hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Database Error Banner if any */}
        {dbError && (
          <div className="max-w-4xl mx-auto mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                Database connection note: <strong>{dbError}</strong>. Fallback catalogue active.
              </span>
            </div>
            <button
              onClick={() => fetchCareers(selectedFilter, searchQuery)}
              className="underline hover:text-amber-950 font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-border animate-pulse space-y-4"
              >
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                <div className="h-16 bg-slate-50 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && careers.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-border max-w-xl mx-auto p-8 space-y-3">
            <HelpCircle className="h-10 w-10 text-text-muted mx-auto" />
            <h3 className="font-heading text-lg font-bold text-text-primary">
              No matching career pathways found
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              No pathways matched your query &quot;{searchQuery}&quot;. Try searching for &quot;Doctor&quot;, &quot;CA&quot;, &quot;AI&quot;, &quot;Law&quot;, or select &quot;All 13 Streams&quot;.
            </p>
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFilter("ALL");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}

        {/* Careers Grid */}
        {!isLoading && careers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map((career) => (
              <Card
                key={career.id || career.slug}
                hoverable
                onClick={() => setModalCareer(career)}
                className="p-6 cursor-pointer flex flex-col justify-between border-border transition-all hover:border-primary/40 bg-white"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-[10px] font-semibold">
                      {career.streamTitle}
                    </span>
                    <span className="text-[10px] font-semibold text-text-muted">
                      {career.minEducationStage.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-text-primary mb-1">
                    {career.title}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-4">
                    {career.tagline || career.overview}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-border text-xs mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-muted block">
                        Starting Salary
                      </span>
                      <span className="font-heading font-bold text-text-primary">
                        {career.avgStartingSalaryInr ? `${formatInr(career.avgStartingSalaryInr)}/yr` : "Market Standard"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-muted block">
                        Growth Outlook
                      </span>
                      <span className="font-heading font-bold text-emerald-700">
                        {career.growthOutlook || "High"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block mb-1.5">
                      Benchmark Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {career.skills.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-white border border-border px-2 py-0.5 text-[10px] font-medium text-slate-700"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-primary">
                  <span>View Full Pathway</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Career Details Modal */}
      {modalCareer && (
        <Modal
          isOpen={!!modalCareer}
          onClose={() => setModalCareer(null)}
          title={modalCareer.title}
          description={modalCareer.tagline || modalCareer.domainName}
        >
          <div className="space-y-5 text-xs text-text-primary">
            <div className="p-3 bg-slate-50 rounded-xl border border-border">
              <span className="text-[10px] font-bold uppercase text-text-muted block">
                Overview & Ground Reality
              </span>
              <p className="text-sm text-text-primary mt-1 leading-relaxed">
                {modalCareer.overview}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-border">
                <span className="text-[10px] font-bold uppercase text-text-muted block">
                  Starting INR (Entry)
                </span>
                <p className="text-sm font-bold text-text-primary mt-0.5">
                  {modalCareer.avgStartingSalaryInr ? `${formatInr(modalCareer.avgStartingSalaryInr)}/yr` : "Market Standard"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-border">
                <span className="text-[10px] font-bold uppercase text-text-muted block">
                  Mid-Career INR (5+ Yrs)
                </span>
                <p className="text-sm font-bold text-text-primary mt-0.5">
                  {modalCareer.avgMidCareerSalaryInr ? `${formatInr(modalCareer.avgMidCareerSalaryInr)}/yr` : "Market Standard"}
                </p>
              </div>
            </div>

            {modalCareer.regulatoryBody && (
              <div className="p-2.5 rounded-xl border border-border bg-white flex items-center justify-between">
                <span className="text-[11px] font-semibold text-text-muted">Regulatory Body:</span>
                <span className="text-[11px] font-bold text-primary">{modalCareer.regulatoryBody}</span>
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold uppercase text-text-muted block mb-2">
                Mandatory Competencies (0–5 Scale)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {modalCareer.skills.map((s, i) => (
                  <div key={i} className="p-2.5 rounded-xl border border-border bg-white">
                    <div className="flex items-center justify-between font-semibold">
                      <span>{s.name}</span>
                      <span className="text-primary text-[11px]">Level {s.requiredLevel}/5</span>
                    </div>
                    <span className="text-[10px] text-text-muted">{s.category}</span>
                  </div>
                ))}
              </div>
            </div>

            {modalCareer.keyEntranceExams && modalCareer.keyEntranceExams.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase text-text-muted block mb-1.5">
                  Benchmark Entrance Exams
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {modalCareer.keyEntranceExams.map((exam, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-semibold"
                    >
                      {exam}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border flex justify-end">
              <Button size="sm" variant="gradient" onClick={() => setModalCareer(null)}>
                Got it
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
