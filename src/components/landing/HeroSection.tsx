"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Compass,
  Search,
  Send,
  Loader2,
  X,
  Bot,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Layers,
  Map,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const SUGGESTED_PROMPTS = [
  "Which career suits my strengths?",
  "Career options after Class 12 without JEE/NEET?",
  "How to become a Product Designer?",
  "What skills should I learn next?",
];

// Honest, student-friendly deterministic fallback knowledge
const HERO_MENTOR_KNOWLEDGE: Record<
  string,
  { answer: string; stream: string; keySkills: string[]; targetRole: string }
> = {
  "which career suits my strengths?": {
    answer:
      "KAABIL helps you discover the right path across all 13 educational streams—including Healthcare, Engineering, Commerce, Law, Design, and Sports. Take our simple 5-minute diagnostic quiz to see where your natural strengths shine brightest.",
    stream: "Personalized Discovery",
    keySkills: ["Discover Strengths", "Interest Mapping", "Curated Options"],
    targetRole: "Explore Recommended Streams",
  },
  "career options after class 12 without jee/neet?": {
    answer:
      "There are dozens of rewarding careers beyond traditional exams! High-demand paths include Clinical Nutrition, UI/UX Design, Corporate Law (via CLAT/CUET), Data Analytics, Aviation Management, Financial Actuary, and Sustainable Agriculture.",
    stream: "Multi-Stream Guidance",
    keySkills: ["CUET Pathways", "Design Aptitude", "Commercial Finance"],
    targetRole: "High-Growth Alternatives",
  },
  "how to become a product designer?": {
    answer:
      "To become a Digital Product / UI/UX Designer, focus on user empathy, visual design, Figma prototyping, and design systems. You don't need a coding background—you can start directly from school or college with guided hands-on projects.",
    stream: "Creative Arts & Design",
    keySkills: ["Figma Prototyping", "User Research", "Visual Systems"],
    targetRole: "Product Designer",
  },
  "what skills should i learn next?": {
    answer:
      "Depending on your stream, high-value skills right now include Generative AI tools, Data Visualization, Digital Financial Analysis, and Strategic Communication. Start with a quick skill check to find your exact next step.",
    stream: "Skill Check",
    keySkills: ["Applied AI Tools", "Critical Logic", "Practical Projects"],
    targetRole: "Skill Recommendations",
  },
};

export function HeroSection() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [promptText, setPromptText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    query: string;
    answer: string;
    stream: string;
    keySkills: string[];
    targetRole?: string;
    isLive: boolean;
  } | null>(null);

  const handlePromptSubmit = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const query = (overrideText || promptText).trim();
    if (!query) return;

    setIsSubmitting(true);

    try {
      // 1. Query live mentor endpoint with language context
      const res = await fetch("/api/student/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, language }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setAiResponse({
          query,
          answer: data.reply || data.message || "Guidance generated successfully.",
          stream: data.stream || "Personalized Guidance",
          keySkills: data.suggestedSkills || ["Find My Career", "Check My Skills"],
          targetRole: data.targetRole || "Career Path",
          isLive: true,
        });
      } else {
        // Friendly deterministic fallback
        const lower = query.toLowerCase();
        const matchedKey = Object.keys(HERO_MENTOR_KNOWLEDGE).find(
          (k) => lower.includes(k) || k.includes(lower)
        );
        const match = matchedKey ? HERO_MENTOR_KNOWLEDGE[matchedKey] : null;

        setAiResponse({
          query,
          answer:
            match?.answer ||
            `For "${query}", KAABIL provides step-by-step career roadmaps, verified skill checkpoints, and personalized mentoring across all 13 educational streams. Explore our complete career catalogue or sign up to get your tailored action plan.`,
          stream: match?.stream || "Universal Career Pathway",
          keySkills:
            match?.keySkills || ["Discover Strengths", "Step-by-Step Roadmap", "Verified Badges"],
          targetRole: match?.targetRole || "Career Discovery",
          isLive: false,
        });
      }
    } catch {
      setAiResponse({
        query,
        answer:
          "Connect with KAABIL's friendly AI Career Mentor to explore curated learning paths, entrance exam guidance, and verified skill milestones.",
        stream: "Universal Guidance",
        keySkills: ["Career Roadmap", "Check My Skills"],
        targetRole: "Career Exploration",
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

  const scrollToJourney = () => {
    const el = document.getElementById("student-journey") || document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      aria-label="Confused About Your Future? KAABIL is here to help."
      className="relative w-full min-h-[100svh] overflow-hidden flex flex-col justify-between select-none"
    >
      {/* ==============================================================
          1. APPROVED FULL-WIDTH PIXEL-ART CAMPUS SUNSET ARTWORK
         ============================================================== */}
      <Image
        src="/images/hero-campus-sunset.jpg"
        alt="KAABIL pixel art university campus sunset student career journey"
        fill
        priority
        quality={96}
        sizes="100vw"
        className="object-cover object-bottom sm:object-center pointer-events-none select-none z-0"
      />

      {/* ==============================================================
          2. ATMOSPHERIC SUNSET LIGHTING & SUBTLE ANIMATIONS
         ============================================================== */}
      {/* Sky atmospheric vignette ensuring upper-half text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1C0D2A]/85 via-[#2A133B]/50 to-[#12051E]/90 pointer-events-none z-[1]" />

      {/* Subtle warm sunset lighting pulse in the distance */}
      <div
        className="absolute bottom-[26%] left-1/2 -translate-x-1/2 w-[650px] max-w-full h-44 rounded-full bg-[#FFC66B]/20 blur-3xl pointer-events-none animate-sunset-pulse z-[2]"
        aria-hidden="true"
      />

      {/* Atmospheric slow drifting clouds in upper sky */}
      <div
        className="absolute top-10 right-0 w-[460px] sm:w-[620px] h-48 pointer-events-none overflow-hidden z-[2] opacity-40 animate-cloud-subtle"
        aria-hidden="true"
      >
        <svg viewBox="0 0 600 200" className="w-full h-full fill-[#E68AAB]/30 filter blur-xl">
          <path d="M50 120 Q120 70 200 100 Q260 50 350 80 Q430 40 520 90 Q580 110 550 160 Q450 190 300 170 Q160 185 50 120 Z" />
        </svg>
      </div>

      {/* Cherry blossom floating petals drifting gracefully */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[3]" aria-hidden="true">
        <div className="absolute top-[18%] left-[15%] animate-leaf-1">
          <svg className="w-3.5 h-3.5 text-[#E68AAB] fill-current opacity-85" viewBox="0 0 24 24">
            <path d="M12 2C7 6 3 12 3 17a9 9 0 0 0 18 0c0-5-4-11-9-15z" />
          </svg>
        </div>
        <div className="absolute top-[25%] left-[25%] animate-leaf-2">
          <svg className="w-3 h-3 text-[#FFC66B] fill-current opacity-80" viewBox="0 0 24 24">
            <path d="M12 2C7 6 3 12 3 17a9 9 0 0 0 18 0c0-5-4-11-9-15z" />
          </svg>
        </div>
        <div className="absolute top-[14%] left-[10%] animate-leaf-3">
          <svg className="w-2.5 h-2.5 text-[#A45D88] fill-current opacity-75" viewBox="0 0 24 24">
            <path d="M12 2C7 6 3 12 3 17a9 9 0 0 0 18 0c0-5-4-11-9-15z" />
          </svg>
        </div>
        <div className="absolute top-[32%] left-[20%] animate-leaf-4">
          <svg className="w-3 h-3 text-[#E68AAB] fill-current opacity-80" viewBox="0 0 24 24">
            <path d="M12 2C7 6 3 12 3 17a9 9 0 0 0 18 0c0-5-4-11-9-15z" />
          </svg>
        </div>
      </div>

      {/* ==============================================================
          3. CINEMATIC HERO FOREGROUND CONTENT
         ============================================================== */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-12 text-center flex flex-col items-center">
        
        {/* Subtle Friendly Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-[#FFC66B]/40 bg-[#1E0F2B]/85 backdrop-blur-md px-4 py-1.5 shadow-lg mb-4"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFC66B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFC66B]"></span>
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#FFF5E9] tracking-wide">
            {t.brandTagline}
          </span>
        </motion.div>

        {/* Primary Clear Headline (Exact Task 2 Requirement) */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-cinematic text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#FFF5E9] leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
        >
          {t.heroHeadline}
        </motion.h1>

        {/* Supporting Text in Warm Sunset Gold & Rose Gradient (Task 2 Requirement) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="font-cinematic text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-wide bg-gradient-to-r from-[#FFC66B] via-[#FFA94D] to-[#E68AAB] bg-clip-text text-transparent drop-shadow-md mt-2 sm:mt-3"
        >
          {t.heroSubheadline}
        </motion.div>

        {/* Core Clear Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-sm sm:text-base md:text-lg text-[#FFF5E9]/90 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow mt-3 sm:mt-4"
        >
          {t.heroSupportingText}
        </motion.p>

        {/* Primary & Secondary Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-6 w-full sm:w-auto"
        >
          {/* Primary CTA: "Find My Career" */}
          <Link href="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto min-h-[52px] px-8 rounded-2xl bg-gradient-to-r from-[#FFC66B] via-[#FFA94D] to-[#F59E0B] hover:from-[#FFD285] hover:to-[#E08D07] text-[#1E0F2B] font-extrabold text-sm sm:text-base shadow-[0_8px_24px_rgba(255,198,107,0.4)] hover:scale-[1.03] active:scale-98 transition-all gap-2"
            >
              <Sparkles className="h-4 w-4 text-[#1E0F2B]" />
              <span>{t.primaryCta}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          {/* Secondary CTA: "Explore KAABIL" */}
          <button
            type="button"
            onClick={scrollToJourney}
            className="w-full sm:w-auto min-h-[52px] px-7 rounded-2xl border border-white/30 bg-[#251336]/80 hover:bg-[#2F1944] text-[#FFF5E9] font-bold text-sm sm:text-base hover:border-[#FFC66B]/60 shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Compass className="h-4 w-4 text-[#FFC66B]" />
            <span>{t.secondaryCta}</span>
            <ChevronDown className="h-4 w-4 text-[#FFC66B]/70" />
          </button>
        </motion.div>

        {/* ==============================================================
            SIMPLE VISUAL EXPLANATION OF THE STUDENT JOURNEY (TASK 2)
           ============================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="w-full max-w-4xl mt-7 pt-5 border-t border-white/10 hidden md:block"
        >
          <div className="grid grid-cols-5 gap-2.5 text-left">
            {[
              { num: "01", title: "Discover Strengths", desc: "No exam pressure" },
              { num: "02", title: "Choose Career", desc: "100+ vetted paths" },
              { num: "03", title: "Follow Roadmap", desc: "Clear weekly steps" },
              { num: "04", title: "Build Skills", desc: "Projects & mentor" },
              { num: "05", title: "Unlock Future", desc: "Colleges & jobs" },
            ].map((step, idx) => (
              <div
                key={step.num}
                className="p-2.5 rounded-xl bg-[#1E0F2B]/60 backdrop-blur-md border border-white/10 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-[#FFC66B]">{step.num}</span>
                  {idx < 4 && <span className="text-white/30 text-xs">&rarr;</span>}
                </div>
                <div className="mt-1">
                  <span className="text-xs font-bold text-[#FFF5E9] block leading-tight">{step.title}</span>
                  <span className="text-[10px] text-white/60">{step.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ==============================================================
            4. FRIENDLY AI CAREER SEARCH INPUT
           ============================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="w-full max-w-2xl mt-8"
        >
          {/* Search Box Container */}
          <form
            onSubmit={handlePromptSubmit}
            className="relative flex items-center p-1.5 sm:p-2 rounded-2xl bg-[#1E0F2B]/85 backdrop-blur-xl border border-white/20 shadow-2xl focus-within:border-[#FFC66B]/80 focus-within:ring-2 focus-within:ring-[#FFC66B]/30 transition-all"
          >
            <div className="pl-3 sm:pl-4 text-[#FFC66B]">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={t.askAiPlaceholder}
              disabled={isSubmitting}
              className="w-full bg-transparent px-3 py-2.5 sm:py-3 text-xs sm:text-sm text-[#FFF5E9] placeholder:text-[#FFF5E9]/50 focus:outline-none"
            />

            <Button
              type="submit"
              disabled={isSubmitting || !promptText.trim()}
              size="sm"
              className="rounded-xl px-4 sm:px-5 h-9 sm:h-10 bg-gradient-to-r from-[#FFC66B] to-[#FFA94D] text-[#1E0F2B] font-bold text-xs shrink-0 shadow-md hover:opacity-90 disabled:opacity-40 transition-all gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#1E0F2B]" />
              ) : (
                <>
                  <span className="hidden sm:inline">{t.askAiButton}</span>
                  <Send className="h-3.5 w-3.5 text-[#1E0F2B]" />
                </>
              )}
            </Button>
          </form>

          {/* Clickable Example Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            <span className="text-[11px] font-bold text-[#FFC66B]/80 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> {t.popularSearches}
            </span>
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSelectSuggested(prompt)}
                className="text-[11px] font-medium text-[#FFF5E9]/85 hover:text-[#FFC66B] bg-[#251336]/70 hover:bg-[#2F1944] border border-white/10 hover:border-[#FFC66B]/40 px-2.5 py-1 rounded-full transition-all text-left"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Interactive AI Guidance Response Card */}
          <AnimatePresence>
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="mt-4 p-5 rounded-2xl bg-[#1E0F2B]/95 backdrop-blur-2xl border border-[#FFC66B]/40 shadow-2xl text-left relative overflow-hidden"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setAiResponse(null)}
                  className="absolute top-3.5 right-3.5 p-1 rounded-lg text-[#FFF5E9]/60 hover:text-[#FFF5E9] hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Header with stream pill */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="p-1.5 rounded-lg bg-[#FFC66B]/20 text-[#FFC66B]">
                    <Bot className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold text-[#FFC66B] tracking-wide uppercase">
                    {aiResponse.stream}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-[#FFF5E9]/70">
                    {aiResponse.isLive ? "Live AI Response" : "Verified KAABIL Guide"}
                  </span>
                </div>

                {/* User Query Echo */}
                <p className="text-xs font-semibold text-[#FFF5E9]/60 italic mb-2">
                  &ldquo;{aiResponse.query}&rdquo;
                </p>

                {/* Guidance Text */}
                <p className="text-xs sm:text-sm text-[#FFF5E9] leading-relaxed">
                  {aiResponse.answer}
                </p>

                {/* Key Skills Tags & CTA */}
                <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#FFF5E9]/50 uppercase">
                      Recommended:
                    </span>
                    {aiResponse.keySkills.map((sk) => (
                      <span
                        key={sk}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#56316F]/50 text-[#FFC66B] border border-[#FFC66B]/20"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  <Link href="/register">
                    <Button
                      size="sm"
                      className="h-8 px-3 rounded-xl bg-[#FFC66B] hover:bg-[#FFA94D] text-[#1E0F2B] font-bold text-xs gap-1"
                    >
                      <span>Start My Journey</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom atmospheric fade transition into Section 2 */}
      <div className="w-full h-16 bg-gradient-to-b from-transparent to-[#FAF8FC] z-10 pointer-events-none" />
    </section>
  );
}
