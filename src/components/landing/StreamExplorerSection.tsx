"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Binary,
  Coins,
  BookOpenCheck,
  BookOpen,
  Scale,
  Briefcase,
  Palette,
  Sprout,
  Wrench,
  Trophy,
  Activity,
  UtensilsCrossed,
  Coffee,
  Compass,
  Network,
  Sparkles,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Layers,
  ChevronRight,
  Search,
} from "lucide-react";
import { STREAMS_CONFIG, CAREER_PATHS_DATABASE } from "@/data/careersData";
import { CareerPathData, StreamOverview } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";

// 13 Color-coded stream icons
const STREAM_ICONS: Record<string, React.ReactNode> = {
  MEDICAL_PCB: <Stethoscope className="h-6 w-6 text-emerald-600" />,
  NON_MEDICAL_PCM: <Binary className="h-6 w-6 text-blue-600" />,
  COMMERCE: <Coins className="h-6 w-6 text-indigo-600" />,
  ARTS_HUMANITIES: <BookOpen className="h-6 w-6 text-purple-600" />,
  LAW: <Scale className="h-6 w-6 text-amber-600" />,
  MANAGEMENT: <Briefcase className="h-6 w-6 text-rose-600" />,
  CREATIVE_DESIGN: <Palette className="h-6 w-6 text-pink-600" />,
  AGRICULTURE: <Sprout className="h-6 w-6 text-lime-600" />,
  VOCATIONAL_TRADES: <Wrench className="h-6 w-6 text-orange-600" />,
  SPORTS_PHYSICAL_ED: <Trophy className="h-6 w-6 text-cyan-600" />,
  HOSPITALITY_TOURISM: <UtensilsCrossed className="h-6 w-6 text-teal-600" />,
  INTERDISCIPLINARY: <Network className="h-6 w-6 text-violet-600" />,
  UNDECIDED: <Compass className="h-6 w-6 text-slate-600" />,
};

const CATEGORIES = [
  { id: "ALL", label: "All 13 Streams" },
  { id: "STEM", label: "STEM & Tech" },
  { id: "HEALTHCARE", label: "Medical & Health" },
  { id: "COMMERCE_LAW", label: "Commerce & Law" },
  { id: "HUMANITIES_CREATIVE", label: "Arts, Media & Design" },
  { id: "VOCATIONAL_SERVICES", label: "Trades, Agri & Services" },
];

export function StreamExplorerSection() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [selectedStream, setSelectedStream] = useState<StreamOverview | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<CareerPathData | null>(null);

  const filteredStreams = useMemo(() => {
    if (activeCategory === "ALL") return STREAMS_CONFIG;
    if (activeCategory === "STEM") {
      return STREAMS_CONFIG.filter((s) => ["NON_MEDICAL_PCM", "INTERDISCIPLINARY"].includes(s.stream));
    }
    if (activeCategory === "HEALTHCARE") {
      return STREAMS_CONFIG.filter((s) => ["MEDICAL_PCB"].includes(s.stream));
    }
    if (activeCategory === "COMMERCE_LAW") {
      return STREAMS_CONFIG.filter((s) => ["COMMERCE", "LAW", "MANAGEMENT"].includes(s.stream));
    }
    if (activeCategory === "HUMANITIES_CREATIVE") {
      return STREAMS_CONFIG.filter((s) => ["ARTS_HUMANITIES", "CREATIVE_DESIGN"].includes(s.stream));
    }
    if (activeCategory === "VOCATIONAL_SERVICES") {
      return STREAMS_CONFIG.filter((s) =>
        ["VOCATIONAL_TRADES", "AGRICULTURE", "SPORTS_PHYSICAL_ED", "HOSPITALITY_TOURISM", "UNDECIDED"].includes(
          s.stream
        )
      );
    }
    return STREAMS_CONFIG;
  }, [activeCategory]);

  const handleCardClick = (stream: StreamOverview) => {
    setSelectedStream(stream);
    const career = CAREER_PATHS_DATABASE.find((c) => c.stream === stream.stream);
    setSelectedCareer(career || null);
  };

  return (
    <section id="streams" className="py-20 lg:py-28 bg-[#F8FAFC] border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1 text-xs font-bold text-secondary">
            <Compass className="h-3.5 w-3.5" />
            Universal Multi-Stream Taxonomy
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
            Every Stream Has a Future.
          </h2>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            KAABIL eliminates the single-track engineering bias. Explore career benchmarks, required competencies, entrance examinations, and verified insights across all 13 educational streams.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all shadow-soft-xs ${
                activeCategory === cat.id
                  ? "bg-primary text-white shadow-soft-sm scale-105"
                  : "bg-white text-text-secondary border border-border hover:bg-slate-50 hover:text-text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 13-Stream Interactive Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStreams.map((stream) => (
            <div
              key={stream.stream}
              onClick={() => handleCardClick(stream)}
              className="group cursor-pointer rounded-3xl p-6 bg-white border border-border hover:border-primary/40 shadow-soft-xs hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Icon & Category Badge */}
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-primary/10 transition-colors border border-border">
                    {STREAM_ICONS[stream.stream] || <Sparkles className="h-6 w-6 text-primary" />}
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${stream.badgeColor.bg} ${stream.badgeColor.text} ${stream.badgeColor.border}`}>
                    {stream.hindiTitle || "काबिल"}
                  </span>
                </div>

                {/* Stream Title & Description */}
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                    {stream.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                    {stream.shortDescription}
                  </p>
                </div>

                {/* Typical Careers Preview */}
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                    Pathway Preview
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {stream.topCareers.slice(0, 3).map((career: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="text-[10px] font-semibold bg-white border border-border px-2 py-0.5 rounded-md text-text-secondary"
                      >
                        {career}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="mt-5 pt-3 border-t border-border/80 flex items-center justify-between text-xs">
                <span className="text-text-muted font-medium text-[11px]">Click to inspect</span>
                <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Global Catalog Action */}
        <div className="text-center mt-12">
          <Link href="/careers">
            <Button
              size="lg"
              variant="outline"
              className="min-h-[48px] h-12 px-7 rounded-2xl border-border bg-white hover:bg-slate-50 font-bold text-xs gap-2 shadow-soft-xs"
            >
              <Compass className="h-4 w-4 text-primary" />
              <span>Browse All 120+ Verified Career Pathways</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Detailed Stream Drilldown Modal */}
        {selectedStream && (
          <Modal
            isOpen={Boolean(selectedStream)}
            onClose={() => setSelectedStream(null)}
            title={selectedStream.title}
          >
            <div className="space-y-5 text-text-primary">
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20">
                <p className="text-xs text-text-secondary leading-relaxed">
                  {selectedStream.shortDescription}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Key Career Roles in this Stream
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStream.topCareers.map((c: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-text-primary border border-border"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {selectedCareer && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">Benchmark Example:</span>
                    <span className="text-xs font-bold text-emerald-700">
                      ₹{selectedCareer.avgStartingSalaryInr.toLocaleString("en-IN")} - ₹{selectedCareer.avgMidCareerSalaryInr.toLocaleString("en-IN")} / yr
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-text-primary">{selectedCareer.title}</h5>
                  <p className="text-xs text-text-secondary">{selectedCareer.overview}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStream(null)}
                  className="rounded-xl text-xs"
                >
                  Close
                </Button>
                <Link href={`/careers?stream=${selectedStream.stream}`}>
                  <Button
                    size="sm"
                    className="rounded-xl text-xs bg-primary text-white font-bold gap-1.5"
                  >
                    <span>View Stream Careers</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </section>
  );
}
