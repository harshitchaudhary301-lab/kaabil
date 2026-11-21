"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Building2,
  GraduationCap,
  TrendingUp,
  Scale,
  CheckCircle2,
  Bookmark,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ALL_CAREERS } from "@/data/careersData";

export default function CareerCataloguePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStream, setSelectedStream] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedRisk, setSelectedRisk] = useState("ALL");

  const streams = useMemo(() => {
    return ["ALL", ...Array.from(new Set(ALL_CAREERS.map((c) => c.stream)))];
  }, []);

  const filteredCareers = useMemo(() => {
    return ALL_CAREERS.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.domainName.toLowerCase().includes(q) ||
        (c.regulatoryBody && c.regulatoryBody.toLowerCase().includes(q)) ||
        c.skills.some((s) => s.name.toLowerCase().includes(q));

      const matchesStream =
        selectedStream === "ALL" || c.stream === selectedStream;

      const matchesLevel =
        selectedLevel === "ALL" || c.minEducationStage === selectedLevel;

      const matchesRisk =
        selectedRisk === "ALL" || c.automationRisk === selectedRisk;

      return matchesSearch && matchesStream && matchesLevel && matchesRisk;
    });
  }, [searchQuery, selectedStream, selectedLevel, selectedRisk]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header Banner */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
                <Compass className="h-3.5 w-3.5" />
                Universal Career Explorer • 13 Streams
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight font-heading">
                All-Streams Career Catalogue
              </h1>
              <p className="text-text-secondary text-sm sm:text-base mt-2 max-w-2xl">
                Explore verified career pathways across Medicine, Engineering, Commerce, Law, Humanities, Agriculture, Vocational, Design, and Sports.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/stream-selector">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs text-primary border-primary/30">
                  <Sparkles className="h-3.5 w-3.5" />
                  Stream Selector Assistant
                </Button>
              </Link>
              <Link href="/compare">
                <Button size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/95 text-white">
                  <Scale className="h-3.5 w-3.5" />
                  Compare Careers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search across 13 streams by job title, skill, statutory council, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 rounded-xl border border-border text-text-secondary focus:outline-none"
              >
                <option value="ALL">All Stages</option>
                <option value="CLASS_10">Class 10</option>
                <option value="CLASS_12">Class 12</option>
                <option value="UNDERGRADUATE">Undergraduate</option>
                <option value="POSTGRADUATE">Postgraduate</option>
              </select>

              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 rounded-xl border border-border text-text-secondary focus:outline-none"
              >
                <option value="ALL">All AI Risks</option>
                <option value="Low">Low AI Risk</option>
                <option value="Medium">Medium AI Risk</option>
                <option value="High">High AI Risk</option>
              </select>
            </div>
          </div>

          {/* Stream Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {streams.map((stream) => (
              <button
                key={stream}
                onClick={() => setSelectedStream(stream)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap text-xs transition-colors ${
                  selectedStream === stream
                    ? "bg-primary text-white shadow-soft-sm"
                    : "bg-slate-50 text-text-secondary border border-border hover:bg-slate-100"
                }`}
              >
                {stream === "ALL" ? "All Streams" : stream.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>
            Showing <strong className="text-text-primary">{filteredCareers.length}</strong> verified career pathways
          </span>
          <span>Indian Statutory Standards (NMC, AICTE, BCI, ICAI, ICAR, CoA, etc.)</span>
        </div>

        {/* Career Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map((career) => (
            <Card
              key={career.slug}
              className="border border-border shadow-soft-sm hover:border-primary/40 hover:shadow-soft-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="outline" className="text-[10px] bg-slate-50">
                      {career.stream.replace(/_/g, " ")}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                      {career.verificationStatus || "VERIFIED"}
                    </Badge>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-text-primary group-hover:text-primary transition-colors leading-snug">
                    {career.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                    {career.overview}
                  </p>

                  {/* Statutory Authority */}
                  <div className="mt-3.5 flex items-center gap-1.5 text-xs text-text-secondary">
                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{career.regulatoryBody || "Statutory Council"}</span>
                  </div>

                  {/* Compensation Metric */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-border/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider block">
                        Median (5 Yrs)
                      </span>
                      <span className="font-bold text-sm text-text-primary">
                        ₹{(career.avgMidCareerSalaryInr / 100000).toFixed(1)} Lakhs/yr
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider block">
                        AI Automation
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          career.automationRisk === "Low"
                            ? "text-emerald-700"
                            : career.automationRisk === "Medium"
                            ? "text-amber-700"
                            : "text-rose-700"
                        }`}
                      >
                        {career.automationRisk}
                      </span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 mt-4">
                    {career.skills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white border border-border text-[10px] text-text-secondary"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {career.skills.length > 3 && (
                      <span className="text-[10px] text-text-secondary self-center">
                        +{career.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Card Controls */}
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-2">
                  <Link
                    href={`/compare?slugs=${career.slug}`}
                    className="text-xs text-text-secondary hover:text-primary flex items-center gap-1"
                  >
                    <Scale className="h-3 w-3" /> Compare
                  </Link>

                  <Link href={`/careers/${career.slug}`}>
                    <Button size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/95 text-white">
                      Explore Path <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
