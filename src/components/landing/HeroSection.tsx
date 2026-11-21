"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  ShieldCheck,
  BrainCircuit,
  Send,
  Loader2,
  GraduationCap,
  Award,
  TrendingUp,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SUGGESTED_PROMPTS = [
  "Which career suits my skills?",
  "How can I become an AI Engineer?",
  "What skills should I learn next?",
  "How ready am I for placements?",
];

// Fallback career guidance knowledge for instantaneous, honest hero responses
const HERO_MENTOR_KNOWLEDGE: Record<string, { answer: string; stream: string; keySkills: string[] }> = {
  "which career suits my skills?": {
    answer:
      "KAABIL matches your diagnostic skills across all 13 educational streams. Start by taking our 5-minute foundational skill assessment or exploring career tracks that align with your current interests.",
    stream: "Universal Diagnostic",
    keySkills: ["Aptitude Mapping", "Foundational Logic", "Domain Affinity"],
  },
  "how can i become an ai engineer?": {
    answer:
      "To become an AI Engineer, build proficiency in Algorithmic Logic (Python), PyTorch or TensorFlow model inference, and API development with FastAPI. KAABIL provides verified milestone roadmaps from Class 12 to Industry Level.",
    stream: "STEM (PCM)",
    keySkills: ["Python & PyTorch", "Vector Embeddings", "FastAPI Serving"],
  },
  "what skills should i learn next?": {
    answer:
      "Based on Indian market demand benchmarks (AICTE, NMC, ICAI, BCI), high-leverage skills right now include Generative AI tooling, Ind AS Financial Modeling, and Cloud Systems Architecture.",
    stream: "Market Benchmark",
    keySkills: ["GenAI Tooling", "Cloud Architecture", "Regulatory Compliance"],
  },
  "how ready am i for placements?": {
    answer:
      "Your Career Readiness Index (CRI) evaluates 5 core dimensions: Academic baseline, Verified skills, Real projects, Interview lab benchmarks, and Industry certifications. Check your CRI in the student dashboard.",
    stream: "Employability Index",
    keySkills: ["Technical Rubric", "Behavioral Interview", "Verified Portfolio"],
  },
};

export function HeroSection() {
  const router = useRouter();
  const [promptText, setPromptText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    query: string;
    answer: string;
    stream: string;
    keySkills: string[];
    isLive: boolean;
  } | null>(null);

  // Subtle 3D Card Parallax on Mouse Move
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handlePromptSubmit = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const query = (overrideText || promptText).trim();
    if (!query) return;

    setIsSubmitting(true);

    try {
      // 1. Try querying the live student mentor or search API
      const res = await fetch("/api/student/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setAiResponse({
          query,
          answer: data.reply || data.message || "Guidance generated successfully.",
          stream: data.stream || "Multi-Stream Guidance",
          keySkills: data.suggestedSkills || ["Career Assessment", "Skill Passport"],
          isLive: true,
        });
      } else {
        // Honest deterministic fallback matching KAABIL's verified domain benchmark
        const lower = query.toLowerCase();
        const matchedKey = Object.keys(HERO_MENTOR_KNOWLEDGE).find((k) =>
          lower.includes(k) || k.includes(lower)
        );
        const match = matchedKey ? HERO_MENTOR_KNOWLEDGE[matchedKey] : null;

        setAiResponse({
          query,
          answer:
            match?.answer ||
            `For "${query}", KAABIL provides verified competency pathways, NSQF-aligned skill benchmarks, and personalized mentoring across 13 educational streams. Explore our complete career catalogue or sign in to build your personalized Career Roadmap.`,
          stream: match?.stream || "Universal Career Path",
          keySkills: match?.keySkills || ["Skill Gap Analysis", "Interactive Roadmap", "Digital Passport"],
          isLive: false,
        });
      }
    } catch {
      setAiResponse({
        query,
        answer:
          "Connect with KAABIL's AI Career Mentor to explore curated learning paths, placement readiness benchmarks, and verified skill milestones.",
        stream: "Universal Guidance",
        keySkills: ["Career Roadmap", "Skill Assessment"],
        isLive: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectSuggested = (text: string) => {
    setPromptText(text);
    handlePromptSubmit(undefined, text);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-[#FAF8FC] via-[#F6F3FA] to-[#F8FAFC]">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[680px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-8 left-1/4 w-[540px] h-[380px] bg-purple-200/40 rounded-full blur-[140px]" />
        <div className="absolute top-20 right-1/4 w-[460px] h-[360px] bg-amber-100/50 rounded-full blur-[140px]" />
        <div className="absolute bottom-12 left-1/3 w-[420px] h-[300px] bg-indigo-100/50 rounded-full blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* =========================================
              LEFT COLUMN: Cinematic Headline & Content
             ========================================= */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6 text-center lg:text-left">
            {/* Live Eyebrow Pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-white/80 backdrop-blur-md px-4 py-1.5 shadow-soft-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide">
                Universal Career &amp; Employability Ecosystem
              </span>
            </motion.div>

            {/* Main Headline & Highlighted Secondary Heading */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-2"
            >
              <h1 className="font-heading text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Your Future Begins <br className="hidden sm:inline" />
                With KAABIL.
              </h1>
              <div className="text-2xl sm:text-3xl xl:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 bg-clip-text text-transparent">
                Discover Your Skills. Define Your Future.
              </div>
            </motion.div>

            {/* Approved Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal"
            >
              Discover the right career, build verified skills and unlock meaningful opportunities.
            </motion.p>

            {/* Primary & Secondary Call to Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto min-h-[48px] h-13 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 hover:from-indigo-700 hover:via-purple-700 hover:to-amber-700 text-white font-bold text-sm shadow-soft-md hover:shadow-soft-lg hover:scale-[1.02] active:scale-98 transition-all gap-2"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Start My Career Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/careers" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto min-h-[48px] h-13 px-7 rounded-2xl border-slate-200 bg-white/90 hover:bg-slate-50 text-slate-800 font-bold text-sm hover:border-purple-300 shadow-soft-xs hover:shadow-soft-sm transition-all gap-2"
                >
                  <Compass className="h-4 w-4 text-purple-600" />
                  <span>Explore Careers</span>
                </Button>
              </Link>
            </motion.div>

            {/* =========================================
                Interactive AI Career Prompt Box
               ========================================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100/90 p-5 shadow-soft-lg text-left"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    What career should I explore?
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Interactive AI Mentor
                </span>
              </div>

              {/* Prompt Input Form */}
              <form onSubmit={handlePromptSubmit} className="relative flex items-center mb-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ask anything, e.g. How can I become an AI Engineer?"
                  className="w-full pl-10 pr-24 py-3 rounded-2xl bg-slate-50/80 border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-inner"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !promptText.trim()}
                  size="sm"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold gap-1 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Ask AI</span>
                      <Send className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </form>

              {/* Suggested Prompt Chips */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-medium text-slate-500">
                  Suggested prompts:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSelectSuggested(prompt)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-purple-50/70 hover:bg-purple-100/90 text-purple-900 border border-purple-200/60 transition-all text-left hover:scale-[1.02] active:scale-95"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instant AI Response Card (Honest Fallback / Live Connection) */}
              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-3.5 border-t border-purple-100/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5 text-purple-700">
                      <BrainCircuit className="h-3.5 w-3.5" />
                      <strong>KAABIL Mentor Insight:</strong> {aiResponse.stream}
                    </span>
                    {!aiResponse.isLive && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Verified Benchmark
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-purple-50/40 p-3 rounded-xl border border-purple-100">
                    {aiResponse.answer}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-wrap gap-1">
                      {aiResponse.keySkills.map((sk) => (
                        <span
                          key={sk}
                          className="text-[10px] font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/student/mentor?q=${encodeURIComponent(aiResponse.query)}`}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 hover:underline"
                    >
                      Full Mentor &rarr;
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2.5 gap-x-4 text-xs text-slate-600 font-semibold"
            >
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 shadow-soft-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>All 13 Streams Supported</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 shadow-soft-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>DPDP Act 2023 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 shadow-soft-xs">
                <BrainCircuit className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                <span>Explainable AI Benchmarks</span>
              </div>
            </motion.div>
          </div>

          {/* =========================================
              RIGHT COLUMN: Approved Cinematic Campus Artwork
             ========================================= */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[440px] sm:max-w-[480px] rounded-[2.5rem] p-3 sm:p-4 bg-gradient-to-b from-indigo-950/20 via-purple-900/10 to-amber-900/20 backdrop-blur-xl border border-purple-200/60 shadow-2xl shadow-indigo-950/20 overflow-hidden group select-none"
            >
              {/* Cinematic Art Container */}
              <div className="relative aspect-[2/3] w-full rounded-[2rem] overflow-hidden bg-slate-900 shadow-inner">
                {/* 1. Base Approved Artwork */}
                <Image
                  src="/images/hero-campus-sunset.jpg"
                  alt="Two students with backpacks walking toward a beautiful university campus during sunset"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 480px"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                />

                {/* 2. Slow Atmospheric Sky Movement Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 via-transparent to-amber-500/10 pointer-events-none animate-atmospheric-sky" />

                {/* 3. Warm Ambient Campus Lighting behind Central Tower */}
                <div className="absolute top-[42%] left-[48%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-amber-400/25 blur-2xl pointer-events-none animate-warm-campus-glow" />

                {/* 4. Natural Floating Sunset Leaves (Animated Particles) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {/* Leaf 1: Crimson Red floating down left */}
                  <div className="absolute top-[28%] left-[22%] animate-leaf-1">
                    <svg className="w-3.5 h-3.5 text-rose-600 fill-current opacity-80" viewBox="0 0 24 24">
                      <path d="M12 2C7 6 3 12 3 17a9 9 0 0 0 18 0c0-5-4-11-9-15z" />
                    </svg>
                  </div>

                  {/* Leaf 2: Dark Amber floating down right */}
                  <div className="absolute top-[34%] right-[25%] animate-leaf-2">
                    <svg className="w-3 h-3 text-amber-500 fill-current opacity-85" viewBox="0 0 24 24">
                      <path d="M12 2C7 6 3 12 3 17a9 9 0 0 0 18 0c0-5-4-11-9-15z" />
                    </svg>
                  </div>

                  {/* Leaf 3: Deep Navy/Purple leaf drifting */}
                  <div className="absolute top-[20%] left-[45%] animate-leaf-3">
                    <svg className="w-2.5 h-2.5 text-indigo-950 fill-current opacity-70" viewBox="0 0 24 24">
                      <path d="M12 2C7 6 3 12 3 17a9 9 0 0 0 18 0c0-5-4-11-9-15z" />
                    </svg>
                  </div>
                </div>

                {/* 5. Top Right Floating Badge: Verified Career Readiness */}
                <div className="absolute top-4 right-4 z-10 pointer-events-auto">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-purple-200/80 shadow-soft-md">
                    <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-black text-xs">
                      88
                    </div>
                    <div className="text-left">
                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-purple-700">
                        CRI Benchmark
                      </div>
                      <div className="text-[11px] font-bold text-slate-800">
                        High Readiness
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Bottom Left Floating Badge: 13 Streams Universal */}
                <div className="absolute bottom-4 left-4 z-10 pointer-events-auto">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 text-white backdrop-blur-md border border-white/20 shadow-soft-md">
                    <GraduationCap className="h-4 w-4 text-amber-400 shrink-0" />
                    <div className="text-left">
                      <div className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">
                        Universal
                      </div>
                      <div className="text-[11px] font-extrabold text-white">
                        13 Streams Covered
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtle bottom vignette gradient to ensure perfect visual grounding */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
