"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  LayoutDashboard,
  BrainCircuit,
  Award,
  BookOpenCheck,
  GraduationCap,
  FileBadge,
  Settings,
  Scale,
  Bookmark,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Filter,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";



interface Recommendation {
  career: {
    id: string;
    slug: string;
    title: string;
    stream: string;
    domain: string;
    description: string;
    salaryRange: { entry: number; median: number; senior: number };
    growthOutlook: string;
    automationRisk: string;
    regulatoryBody: string;
    verificationStatus: string;
    keyEntranceExams: string[];
    skills: string[];
    sources?: { name: string; url: string }[];
  };
  score: number;
  breakdown: {
    interestAlignment: number;
    streamSubjectAlignment: number;
    skillAlignment: number;
    careerGoalsAlignment: number;
    learningPreferencesAlignment: number;
  };
  reasons: string[];
  aiReasoning?: string;
  aiProvider?: string;
}

export default function StudentDiscoverPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "POSITIVE" | "NEGATIVE">>({});
  const [selectedStream, setSelectedStream] = useState<string>("ALL");
  const [language, setLanguage] = useState<string>("en");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRecommendations = async (lang = language) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/recommendations?lang=${lang}`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to load personalized career recommendations.");
      }
    } catch {
      setError("Network error fetching recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // Fetch user's saved careers
    async function fetchSaved() {
      try {
        const res = await fetch("/api/careers/saved");
        if (res.ok) {
          const data = await res.json();
          if (data.savedSlugs) {
            setSavedSlugs(new Set(data.savedSlugs));
          }
        }
      } catch {
        // Fallback
      }
    }
    fetchSaved();
  }, []);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    fetchRecommendations(newLang);
  };

  const handleToggleSave = async (slug: string) => {
    const isSaved = savedSlugs.has(slug);
    try {
      if (isSaved) {
        const res = await fetch(`/api/careers/save?slug=${slug}`, { method: "DELETE" });
        if (res.ok) {
          setSavedSlugs((prev) => {
            const next = new Set(prev);
            next.delete(slug);
            return next;
          });
        }
      } else {
        const res = await fetch("/api/careers/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        if (res.ok) {
          setSavedSlugs((prev) => new Set(prev).add(slug));
        }
      }
    } catch {
      // Fallback
    }
  };

  const handleFeedback = async (slug: string, feedback: "POSITIVE" | "NEGATIVE") => {
    try {
      await fetch("/api/student/recommendations/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerSlug: slug,
          rating: feedback === "POSITIVE" ? 5 : 2,
          feedbackType: feedback,
        }),
      });
      setFeedbackGiven((prev) => ({ ...prev, [slug]: feedback }));
    } catch {
      setFeedbackGiven((prev) => ({ ...prev, [slug]: feedback }));
    }
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesStream =
      selectedStream === "ALL" || rec.career.stream === selectedStream;
    const matchesSearch =
      rec.career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.career.domain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStream && matchesSearch;
  });

  const availableStreams = [
    "ALL",
    ...Array.from(new Set(recommendations.map((r) => r.career.stream))),
  ];

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Portal", "AI Career Discovery"]}
    >
      <div className="space-y-8">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent border border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3">
                <BrainCircuit className="h-3.5 w-3.5" />
                Hybrid AI Recommendation Engine (3-Layer Calibrated)
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-heading">
                Personalized Career Discovery
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1.5 max-w-2xl leading-relaxed">
                Ranked using our transparent multi-factor algorithm: Interest alignment (30%), Stream/Subject (20%), Skill profile (20%), Career ambitions (20%), and Learning preferences (10%).
              </p>
            </div>

            {/* Language Switcher & Refresh */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-lg border border-border bg-white p-1 text-xs">
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    language === "en" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange("hi")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    language === "hi" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => handleLanguageChange("hinglish")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    language === "hinglish" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Hinglish
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchRecommendations()}
                disabled={loading}
                className="gap-1.5 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Recalibrate
              </Button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Stream Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
            {availableStreams.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStream(st)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap text-xs transition-colors ${
                  selectedStream === st
                    ? "bg-primary text-white shadow-soft-sm"
                    : "bg-white text-text-secondary border border-border hover:bg-slate-50"
                }`}
              >
                {st === "ALL" ? "All Recommendations" : st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-secondary" />
            <input
              type="text"
              placeholder="Filter by title or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-text-secondary">
              Evaluating career pathways against your multi-factor profile...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-amber-600 mx-auto" />
            <h3 className="font-heading font-bold text-amber-900">
              Personalized Recommendations Notice
            </h3>
            <p className="text-xs text-amber-800 max-w-md mx-auto">{error}</p>
            <Link href="/stream-selector">
              <Button size="sm" className="mt-2 bg-primary hover:bg-primary/95 text-white text-xs">
                Take Stream Diagnostic First
              </Button>
            </Link>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="text-center py-16 text-text-secondary text-sm">
            No career recommendations match your filter criteria.
          </div>
        ) : (
          /* Recommendations Grid */
          <div className="space-y-6">
            {filteredRecommendations.map((rec, index) => {
              const isSaved = savedSlugs.has(rec.career.slug);
              const feedback = feedbackGiven[rec.career.slug];

              return (
                <Card
                  key={rec.career.slug}
                  className="border border-border shadow-soft-sm hover:shadow-soft-md transition-all overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      {/* Left: Career Info & Breakdown */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                              #{index + 1}
                            </span>
                            <Badge variant="outline" className="text-[10px] bg-slate-50">
                              {rec.career.stream}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] text-primary border-primary/20 bg-primary/5">
                              {rec.career.domain}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              {rec.career.regulatoryBody}
                            </Badge>
                          </div>

                          <h3 className="text-xl font-bold font-heading text-text-primary">
                            {rec.career.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                            {rec.career.description}
                          </p>
                        </div>

                        {/* Factor Score Breakdown Meter */}
                        <div className="p-4 rounded-xl bg-slate-50/80 border border-border/80 space-y-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">
                            Deterministic Formula Match Breakdown
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                            <div className="p-2 rounded-lg bg-white border border-border/60">
                              <span className="text-xs font-bold text-text-primary block">
                                {rec.breakdown.interestAlignment}%
                              </span>
                              <span className="text-[10px] text-text-secondary">Interests (30%)</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-border/60">
                              <span className="text-xs font-bold text-text-primary block">
                                {rec.breakdown.streamSubjectAlignment}%
                              </span>
                              <span className="text-[10px] text-text-secondary">Stream/Subject (20%)</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-border/60">
                              <span className="text-xs font-bold text-text-primary block">
                                {rec.breakdown.skillAlignment}%
                              </span>
                              <span className="text-[10px] text-text-secondary">Skill Match (20%)</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-border/60">
                              <span className="text-xs font-bold text-text-primary block">
                                {rec.breakdown.careerGoalsAlignment}%
                              </span>
                              <span className="text-[10px] text-text-secondary">Goals (20%)</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-border/60">
                              <span className="text-xs font-bold text-text-primary block">
                                {rec.breakdown.learningPreferencesAlignment}%
                              </span>
                              <span className="text-[10px] text-text-secondary">Preferences (10%)</span>
                            </div>
                          </div>
                        </div>

                        {/* Explainability Points */}
                        <div className="space-y-1.5">
                          <span className="text-xs font-semibold text-text-primary block">
                            Why KAABIL Recommends This:
                          </span>
                          <ul className="space-y-1 text-xs text-text-secondary">
                            {rec.reasons.map((reason, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Layer 3 Generative AI / Explainability Banner */}
                        {rec.aiReasoning && (
                          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3" />
                                AI Guidance Insights ({language.toUpperCase()})
                              </span>
                              <span className="text-[10px] text-text-secondary font-medium">
                                {rec.aiProvider === "GEMINI_2_FLASH"
                                  ? "Gemini 2.0 Flash Verified"
                                  : "Deterministic Hybrid Fallback"}
                              </span>
                            </div>
                            <p className="text-xs text-text-secondary leading-relaxed italic">
                              &ldquo;{rec.aiReasoning}&rdquo;
                            </p>
                          </div>
                        )}

                        {/* Benchmark Skills */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-xs font-semibold text-text-primary mr-1">
                            Key Skills:
                          </span>
                          {rec.career.skills.slice(0, 5).map((skill, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-[10px] bg-slate-50 text-text-secondary"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Right: Score Card & Actions */}
                      <div className="lg:w-72 shrink-0 flex flex-col justify-between p-5 rounded-2xl bg-slate-50 border border-border space-y-4">
                        <div className="text-center pb-4 border-b border-border/80">
                          <span className="text-4xl font-extrabold text-primary font-heading">
                            {rec.score}%
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mt-0.5">
                            Overall Match Score
                          </span>
                        </div>

                        {/* Quick Stats */}
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Entry Salary:</span>
                            <span className="font-semibold text-text-primary">
                              ₹{(rec.career.salaryRange.entry / 100000).toFixed(1)} L/yr
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Median (5 Yrs):</span>
                            <span className="font-semibold text-emerald-700">
                              ₹{(rec.career.salaryRange.median / 100000).toFixed(1)} L/yr
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Growth:</span>
                            <span className="font-semibold text-text-primary">
                              {rec.career.growthOutlook}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Automation:</span>
                            <span className="font-semibold text-text-primary">
                              {rec.career.automationRisk}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2 border-t border-border/80">
                          <Link href={`/careers/${rec.career.slug}`} className="w-full block">
                            <Button size="sm" className="w-full gap-1.5 text-xs bg-primary hover:bg-primary/95 text-white">
                              View Full Details <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleSave(rec.career.slug)}
                              className={`gap-1 text-xs ${
                                isSaved ? "bg-primary/10 text-primary border-primary/30" : ""
                              }`}
                            >
                              <Bookmark className="h-3.5 w-3.5" />
                              {isSaved ? "Saved" : "Save"}
                            </Button>

                            <Link href={`/compare?slugs=${rec.career.slug}`} className="block">
                              <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                                <Scale className="h-3.5 w-3.5" />
                                Compare
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Recommendation Feedback */}
                        <div className="pt-3 border-t border-border/80 flex items-center justify-between text-[11px] text-text-secondary">
                          <span>Helpful match?</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleFeedback(rec.career.slug, "POSITIVE")}
                              className={`p-1 rounded hover:bg-white transition-colors ${
                                feedback === "POSITIVE" ? "text-emerald-600 font-bold" : "text-text-secondary"
                              }`}
                              title="Yes, accurate recommendation"
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleFeedback(rec.career.slug, "NEGATIVE")}
                              className={`p-1 rounded hover:bg-white transition-colors ${
                                feedback === "NEGATIVE" ? "text-rose-600 font-bold" : "text-text-secondary"
                              }`}
                              title="Not aligned with my interests"
                            >
                              <ThumbsDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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
