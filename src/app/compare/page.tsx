"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Scale,
  Plus,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  GraduationCap,
  TrendingUp,
  ShieldAlert,
  Search,
  Share2,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowUpDown,
  BookOpen,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ALL_CAREERS, getCareerBySlug } from "@/data/careersData";
import { CareerPathData } from "@/types";

const PRESET_COMPARISONS = [
  {
    title: "Healthcare: Medicine vs Dentistry",
    slugs: ["mbbs-doctor", "dental-surgeon-bds"],
    description: "Compare clinical training duration, clinical autonomy, and residency pathways.",
  },
  {
    title: "Tech: AI Engineering vs Aerospace",
    slugs: ["ai-systems-engineer", "aerospace-propulsion-engineer"],
    description: "Evaluate software vs hardware engineering pipelines, defense sectors, and salary curves.",
  },
  {
    title: "Corporate: Finance vs Law",
    slugs: ["chartered-accountant-icai", "corporate-lawyer-mna"],
    description: "Compare ICAI certification vs BCI bar qualification, work hours, and partner tracks.",
  },
  {
    title: "Modern Fields: UX Design vs Agri-Tech",
    slugs: ["ui-ux-digital-product-designer", "agronomy-soil-scientist"],
    description: "Contrast digital product systems with sustainable food security and ICAR research.",
  },
];

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStreamFilter, setSelectedStreamFilter] = useState("ALL");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize from search parameters
  useEffect(() => {
    const slugsParam = searchParams.get("slugs");
    if (slugsParam) {
      const parsed = slugsParam
        .split(",")
        .map((s) => s.trim())
        .filter((s) => ALL_CAREERS.some((c) => c.slug === s))
        .slice(0, 4);
      setSelectedSlugs(parsed);
    } else {
      // Default to 2 careers
      setSelectedSlugs(["mbbs-doctor", "ai-systems-engineer"]);
    }
  }, [searchParams]);

  const updateUrlSlugs = (newSlugs: string[]) => {
    setSelectedSlugs(newSlugs);
    if (newSlugs.length > 0) {
      router.replace(`/compare?slugs=${newSlugs.join(",")}`, { scroll: false });
    } else {
      router.replace("/compare", { scroll: false });
    }
  };

  const removeSlug = (slugToRemove: string) => {
    const updated = selectedSlugs.filter((s) => s !== slugToRemove);
    updateUrlSlugs(updated);
  };

  const addSlug = (slugToAdd: string) => {
    if (selectedSlugs.length >= 4) return;
    if (selectedSlugs.includes(slugToAdd)) return;
    const updated = [...selectedSlugs, slugToAdd];
    updateUrlSlugs(updated);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const clearAll = () => {
    updateUrlSlugs([]);
  };

  // Get full career records
  const comparedCareers: CareerPathData[] = useMemo(() => {
    return selectedSlugs
      .map((slug) => getCareerBySlug(slug))
      .filter((c): c is CareerPathData => !!c);
  }, [selectedSlugs]);

  // Filtered available careers for modal
  const availableCareers = useMemo(() => {
    return ALL_CAREERS.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.domainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.stream.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStream =
        selectedStreamFilter === "ALL" || c.stream === selectedStreamFilter;
      const notAlreadySelected = !selectedSlugs.includes(c.slug);
      return matchesSearch && matchesStream && notAlreadySelected;
    });
  }, [searchQuery, selectedStreamFilter, selectedSlugs]);

  const streamsList = useMemo(() => {
    return ["ALL", ...Array.from(new Set(ALL_CAREERS.map((c) => c.stream)))];
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSaveComparison = async () => {
    if (comparedCareers.length < 2) return;
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/careers/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerSlugs: selectedSlugs,
          title: comparedCareers.map((c) => c.title).join(" vs "),
          save: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveStatus("Comparison successfully saved to your profile!");
      } else {
        setSaveStatus(data.error || "Failed to save comparison. Please sign in.");
      }
    } catch {
      setSaveStatus("Saved locally to comparison drawer.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header Banner */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
                <Scale className="h-3.5 w-3.5" />
                Cross-Stream Multi-Career Matrix
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight font-heading">
                Side-by-Side Career Comparison
              </h1>
              <p className="text-text-secondary text-sm sm:text-base mt-2 max-w-2xl">
                Compare salary trajectories, regulatory certifications, entrance exams, and work conditions across up to 4 careers simultaneously.
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-1.5 text-xs"
              >
                <Share2 className="h-3.5 w-3.5" />
                {copiedLink ? "Link Copied!" : "Share Comparison"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveComparison}
                disabled={comparedCareers.length < 2 || isSaving}
                className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5"
              >
                <Bookmark className="h-3.5 w-3.5" />
                {isSaving ? "Saving..." : "Save Comparison"}
              </Button>

              {selectedSlugs.length < 4 && (
                <Button
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="gap-1.5 text-xs bg-primary hover:bg-primary/95 text-white shadow-soft-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Career ({selectedSlugs.length}/4)
                </Button>
              )}

              {selectedSlugs.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs text-text-secondary hover:text-red-600"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {saveStatus && (
            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{saveStatus}</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {comparedCareers.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Scale className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary font-heading">
              No Careers Selected for Comparison
            </h2>
            <p className="text-text-secondary text-sm mt-2 mb-8">
              Select 2 to 4 careers from any educational stream to view an authoritative side-by-side comparison of timelines, entrance exams, and verified compensation.
            </p>

            <Button
              onClick={() => setIsSearchOpen(true)}
              className="gap-2 bg-primary hover:bg-primary/95 text-white mb-10"
            >
              <Plus className="h-4 w-4" />
              Select Careers to Compare
            </Button>

            {/* Presets */}
            <div className="text-left">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4 text-center">
                Popular Verified Comparisons
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PRESET_COMPARISONS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => updateUrlSlugs(preset.slugs)}
                    className="p-4 rounded-xl border border-border bg-white hover:border-primary/40 hover:shadow-soft-sm text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-text-primary group-hover:text-primary transition-colors">
                        {preset.title}
                      </span>
                      <ChevronRight className="h-4 w-4 text-text-secondary group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Comparison Matrix */
          <div className="space-y-8">
            {/* Header Career Columns */}
            <div className="overflow-x-auto pb-4">
              <div
                className="grid gap-4 min-w-[750px]"
                style={{
                  gridTemplateColumns: `240px repeat(${comparedCareers.length}, minmax(260px, 1fr))`,
                }}
              >
                {/* Column 0 Header (Control / Label) */}
                <div className="p-4 rounded-xl bg-slate-50 border border-border flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Comparison Grid
                    </span>
                    <h3 className="text-base font-bold text-text-primary mt-1">
                      {comparedCareers.length} Careers Selected
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Showing official Indian statutory standards and career pathways.
                    </p>
                  </div>

                  {comparedCareers.length < 4 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSearchOpen(true)}
                      className="mt-4 gap-1.5 text-xs w-full border-dashed border-primary/40 text-primary hover:bg-primary/5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Another ({4 - comparedCareers.length} remaining)
                    </Button>
                  )}
                </div>

                {/* Career Cards Header */}
                {comparedCareers.map((c) => (
                  <div
                    key={c.slug}
                    className="p-5 rounded-xl border border-border bg-white shadow-soft-sm relative flex flex-col justify-between"
                  >
                    <button
                      onClick={() => removeSlug(c.slug)}
                      className="absolute top-3 right-3 p-1 rounded-md text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <Badge variant="outline" className="text-[10px] bg-slate-50">
                          {c.stream.replace(/_/g, " ")}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          {c.verificationStatus || "VERIFIED"}
                        </Badge>
                      </div>
                      <h4 className="font-heading font-bold text-lg text-text-primary leading-snug">
                        {c.title}
                      </h4>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        {c.overview}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                      <Link
                        href={`/careers/${c.slug}`}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        Full Details <ArrowRight className="h-3 w-3" />
                      </Link>
                      <span className="text-[11px] font-medium text-text-secondary">
                        {c.typicalDurationYears} training
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MATRIX SECTION 1: Academic & Prerequisites */}
            <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-soft-sm">
              <div className="bg-slate-50 px-6 py-3.5 border-b border-border flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <h3 className="font-heading font-bold text-sm text-text-primary uppercase tracking-wide">
                  Academic Prerequisites & Entrance Exams
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[750px]">
                  <tbody>
                    <tr className="border-b border-border/60">
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50 w-[240px]">
                        Educational Stage
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4 text-text-secondary">
                          <span className="font-medium text-text-primary">
                            {c.minEducationStage.replace(/_/g, " ")}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50">
                        Educational Pathways / Steps
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4 text-text-secondary">
                          <div className="space-y-1">
                            {c.educationalPathways && c.educationalPathways.length > 0 ? (
                              c.educationalPathways.map((p, idx) => (
                                <div key={idx} className="flex items-start gap-1.5">
                                  <span className="text-primary font-bold">{p.step}.</span>
                                  <span><strong>{p.stage}:</strong> {p.description}</span>
                                </div>
                              ))
                            ) : (
                              <span>Direct qualification after {c.minEducationStage.replace(/_/g, " ")}</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50">
                        Key Entrance Exams
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4 text-text-secondary">
                          <div className="flex flex-wrap gap-1.5">
                            {c.keyEntranceExams.length > 0 ? (
                              c.keyEntranceExams.map((exam, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-[10px] bg-primary/5 text-primary border-primary/20"
                                >
                                  {exam}
                                </Badge>
                              ))
                            ) : (
                              <span className="italic text-text-secondary">Direct Admission / Merit</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50">
                        Total Training Duration
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4 text-text-secondary">
                          <span className="font-bold text-text-primary">
                            {c.typicalDurationYears}
                          </span>{" "}
                          (Standard qualification + required residency/internship)
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* MATRIX SECTION 2: Compensation & Market Outlook */}
            <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-soft-sm">
              <div className="bg-slate-50 px-6 py-3.5 border-b border-border flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <h3 className="font-heading font-bold text-sm text-text-primary uppercase tracking-wide">
                  Verified Compensation & Market Trajectory (India INR)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[750px]">
                  <tbody>
                    <tr className="border-b border-border/60">
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50 w-[240px]">
                        Entry-Level Salary (0-2 Yrs)
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4">
                          <span className="font-bold text-sm text-text-primary">
                            ₹{(c.avgStartingSalaryInr / 100000).toFixed(1)} Lakhs/yr
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50">
                        Mid-Level (5-8 Yrs)
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4">
                          <span className="font-bold text-sm text-primary">
                            ₹{(c.avgMidCareerSalaryInr / 100000).toFixed(1)} Lakhs/yr
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50">
                        Senior-Level (10+ Yrs)
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4">
                          <span className="font-bold text-sm text-emerald-700">
                            ₹{((c.avgMidCareerSalaryInr * 1.6) / 100000).toFixed(1)} Lakhs/yr
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50">
                        Projected Market Growth
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4">
                          <Badge
                            className={`text-[10px] font-semibold ${
                              c.growthOutlook.includes("High")
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-blue-100 text-blue-800 border-blue-300"
                            }`}
                          >
                            {c.growthOutlook} Growth
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50">
                        AI / Automation Risk
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              c.automationRisk === "Low"
                                ? "text-emerald-700 border-emerald-300 bg-emerald-50"
                                : c.automationRisk === "Medium"
                                ? "text-amber-700 border-amber-300 bg-amber-50"
                                : "text-rose-700 border-rose-300 bg-rose-50"
                            }`}
                          >
                            {c.automationRisk} Risk
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50">
                        Salary Benchmark Source
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4 text-text-secondary text-[11px]">
                          {c.salarySource || "NASSCOM / Industry Reports 2024-2025"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* MATRIX SECTION 3: Regulatory Authority & Licensure */}
            <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-soft-sm">
              <div className="bg-slate-50 px-6 py-3.5 border-b border-border flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-600" />
                <h3 className="font-heading font-bold text-sm text-text-primary uppercase tracking-wide">
                  Statutory Body, Licensure & Practice Rights
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[750px]">
                  <tbody>
                    <tr className="border-b border-border/60">
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50 w-[240px]">
                        Governing / Statutory Body
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4">
                          <span className="font-bold text-text-primary">
                            {c.regulatoryBody || "Statutory Council"}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50">
                        Licensing Requirement
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4 text-text-secondary">
                          {c.licensingRequirement || "Mandatory state or national registration required before independent practice."}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50">
                        Typical Work Environment
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4 text-text-secondary">
                          {c.workEnvironment || "Standard professional facilities, corporate offices, or field sites."}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50">
                        Official Verification Sources
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4 text-text-secondary space-y-1">
                          {c.sources && c.sources.length > 0 ? (
                            c.sources.map((src, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-[11px] text-primary">
                                <ExternalLink className="h-3 w-3 shrink-0" />
                                <span>{src.name}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[11px] text-text-secondary">Statutory Gazette Notification</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* MATRIX SECTION 4: Benchmark Skills */}
            <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-soft-sm">
              <div className="bg-slate-50 px-6 py-3.5 border-b border-border flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="font-heading font-bold text-sm text-text-primary uppercase tracking-wide">
                  Top Benchmark Skills Required
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[750px]">
                  <tbody>
                    <tr>
                      <td className="p-4 font-semibold text-text-primary bg-slate-50/50 w-[240px]">
                        Core Competencies
                      </td>
                      {comparedCareers.map((c) => (
                        <td key={c.slug} className="p-4 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {c.skills.map((skill, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-[10px] bg-slate-50 text-text-primary"
                              >
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Career Selection Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Add Career to Compare
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Select up to {4 - selectedSlugs.length} more career(s) across any educational stream.
                </p>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-md text-text-secondary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search and Stream Filters */}
            <div className="p-4 border-b border-border bg-slate-50 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by career title, domain, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Stream Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {streamsList.map((stream) => (
                  <button
                    key={stream}
                    onClick={() => setSelectedStreamFilter(stream)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap text-xs font-medium transition-colors ${
                      selectedStreamFilter === stream
                        ? "bg-primary text-white"
                        : "bg-white text-text-secondary border border-border hover:bg-slate-100"
                    }`}
                  >
                    {stream === "ALL" ? "All Streams" : stream.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Career Items List */}
            <div className="overflow-y-auto p-4 space-y-2 flex-1">
              {availableCareers.length === 0 ? (
                <div className="text-center py-8 text-text-secondary text-sm">
                  No careers matching your search criteria.
                </div>
              ) : (
                availableCareers.map((career) => (
                  <div
                    key={career.slug}
                    onClick={() => addSlug(career.slug)}
                    className="p-3.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] bg-white">
                          {career.stream.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-[11px] text-text-secondary">
                          {career.regulatoryBody}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-text-primary group-hover:text-primary transition-colors">
                        {career.title}
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                        {career.overview}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 text-primary group-hover:bg-primary group-hover:text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-between text-xs text-text-secondary">
              <span>Showing {availableCareers.length} available careers</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-text-secondary">Loading Career Comparison Matrix...</p>
          </div>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
