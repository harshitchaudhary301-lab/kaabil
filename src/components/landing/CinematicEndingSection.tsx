"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Compass,
  BarChart3,
  Calendar,
  Briefcase,
  ArrowRight,
} from "lucide-react";

export function CinematicEndingSection() {
  const featureHighlights = [
    {
      title: "Discover Your Career Fit",
      icon: Compass,
    },
    {
      title: "Bridge Your Skill Gaps",
      icon: BarChart3,
    },
    {
      title: "Follow Your Career Roadmap",
      icon: Calendar,
    },
    {
      title: "Unlock Opportunities",
      icon: Briefcase,
    },
  ];

  return (
    <section
      id="cinematic-ending"
      aria-label="Every Future Begins Somewhere"
      className="relative w-full min-h-[100svh] overflow-hidden flex flex-col justify-between select-none"
    >
      {/* 1. Base Approved Background Artwork (Pristine Illustration) */}
      <Image
        src="/images/cinematic-ending-bg.jpg"
        alt="KAABIL sunset campus educational journey with student gazing towards future"
        fill
        priority
        quality={96}
        sizes="100vw"
        className="object-cover object-bottom sm:object-center pointer-events-none select-none z-0"
      />

      {/* 2. Atmospheric Sky Vignette (Ensures Foreground Text Readability without Darkening Scenery) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#352044]/65 via-[#352044]/20 to-transparent pointer-events-none z-[1]" />

      {/* 3. Subtle Warm Sunset Glow over Educational Campus in Distance */}
      <div
        className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-[520px] max-w-full h-36 rounded-full bg-[#FFC66B]/20 blur-3xl pointer-events-none animate-sunset-pulse z-[2]"
        aria-hidden="true"
      />

      {/* 4. Atmospheric Slow Drifting Clouds (Upper Right, 48s Seamless Loop, No Distortion) */}
      <div
        className="absolute top-8 right-0 w-[420px] sm:w-[560px] h-48 pointer-events-none overflow-hidden z-[2] opacity-40 animate-cloud-subtle"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 600 200"
          className="w-full h-full fill-[#E68AAB]/30 filter blur-xl"
        >
          <path d="M50 120 Q120 70 200 100 Q260 50 350 80 Q430 40 520 90 Q580 110 550 160 Q450 190 300 170 Q160 185 50 120 Z" />
        </svg>
      </div>

      {/* 5. Natural Floating Sunset Leaves (Delicate Drift from Flowering Tree on Left) */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden z-[3]"
        aria-hidden="true"
      >
        {/* Leaf 1: Sunset Rose petal drifting down-left */}
        <div className="absolute top-[22%] left-[18%] animate-leaf-1">
          <svg className="w-3.5 h-3.5 text-[#E68AAB] fill-current opacity-85" viewBox="0 0 24 24">
            <path d="M12 2C7 6 3 12 3 17a9 9 0 0 0 18 0c0-5-4-11-9-15z" />
          </svg>
        </div>

        {/* Leaf 2: Warm Sunset Gold drifting down-right */}
        <div className="absolute top-[28%] left-[24%] animate-leaf-2">
          <svg className="w-3 h-3 text-[#FFC66B] fill-current opacity-80" viewBox="0 0 24 24">
            <path d="M12 2C7 6 3 12 3 17a9 9 0 0 0 18 0c0-5-4-11-9-15z" />
          </svg>
        </div>

        {/* Leaf 3: Deep Plum / Rose petal drifting */}
        <div className="absolute top-[16%] left-[12%] animate-leaf-3">
          <svg className="w-2.5 h-2.5 text-[#A45D88] fill-current opacity-75" viewBox="0 0 24 24">
            <path d="M12 2C7 6 3 12 3 17a9 9 0 0 0 18 0c0-5-4-11-9-15z" />
          </svg>
        </div>

        {/* Leaf 4: Soft pink petal drifting */}
        <div className="absolute top-[32%] left-[20%] animate-leaf-4">
          <svg className="w-3 h-3 text-[#E68AAB] fill-current opacity-80" viewBox="0 0 24 24">
            <path d="M12 2C7 6 3 12 3 17a9 9 0 0 0 18 0c0-5-4-11-9-15z" />
          </svg>
        </div>

        {/* Leaf 5: Amber gold petal */}
        <div className="absolute top-[24%] left-[27%] animate-leaf-5">
          <svg className="w-2.5 h-2.5 text-[#FFC66B] fill-current opacity-70" viewBox="0 0 24 24">
            <path d="M12 2C7 6 3 12 3 17a9 9 0 0 0 18 0c0-5-4-11-9-15z" />
          </svg>
        </div>
      </div>

      {/* 6. Foreground Content (Centered in Upper-Middle Sky) */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-20 lg:pt-22 pb-44 sm:pb-56 lg:pb-64 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-full"
        >
          {/* Approved Graduation Cap Laurel Crest Icon */}
          <div className="relative mb-3 sm:mb-4 flex items-center justify-center">
            {/* Golden ambient ray burst behind crest */}
            <div className="absolute -inset-2 bg-[#FFC66B]/20 rounded-full blur-xl pointer-events-none" />

            <svg
              viewBox="0 0 120 64"
              fill="none"
              className="h-10 sm:h-12 w-auto text-[#FFC66B] drop-shadow-[0_2px_8px_rgba(255,198,107,0.35)]"
              aria-hidden="true"
            >
              {/* Sunbeam rays above cap */}
              <line x1="60" y1="2" x2="60" y2="8" stroke="#FFC66B" strokeWidth="2" strokeLinecap="round" />
              <line x1="48" y1="6" x2="52" y2="11" stroke="#FFC66B" strokeWidth="1.75" strokeLinecap="round" />
              <line x1="72" y1="6" x2="68" y2="11" stroke="#FFC66B" strokeWidth="1.75" strokeLinecap="round" />
              <line x1="38" y1="13" x2="43" y2="16" stroke="#FFC66B" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="82" y1="13" x2="77" y2="16" stroke="#FFC66B" strokeWidth="1.5" strokeLinecap="round" />

              {/* Left Laurel Branch */}
              <path
                d="M44 48C38 42 34 32 36 22M34 26C30 25 27 27 26 30C29 32 32 30 34 26ZM35 34C31 34 28 37 28 41C31 42 34 39 35 34ZM39 42C36 43 33 47 34 50C37 51 40 47 39 42Z"
                stroke="#FFC66B"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="#FFC66B"
                fillOpacity="0.4"
              />

              {/* Right Laurel Branch */}
              <path
                d="M76 48C82 42 86 32 84 22M86 26C90 25 93 27 94 30C91 32 88 30 86 26ZM85 34C89 34 92 37 92 41C89 42 86 39 85 34ZM81 42C84 43 87 47 86 50C83 51 80 47 81 42Z"
                stroke="#FFC66B"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="#FFC66B"
                fillOpacity="0.4"
              />

              {/* Central Graduation Cap */}
              <path
                d="M60 14L40 24L60 34L80 24L60 14Z"
                fill="#FFF5E9"
                stroke="#FFC66B"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M48 28.5V36C48 39.5 53.5 42 60 42C66.5 42 72 39.5 72 36V28.5"
                stroke="#FFF5E9"
                strokeWidth="2"
                strokeLinecap="round"
                fill="#FFC66B"
                fillOpacity="0.25"
              />
              {/* Tassel */}
              <path
                d="M74 27V36C74 37 75.5 38 76 38"
                stroke="#FFC66B"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="76" cy="39" r="1.5" fill="#FFC66B" />
            </svg>
          </div>

          {/* Main Headline (Editorial Serif Typography) */}
          <h2 className="font-cinematic text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#FFF5E9] tracking-tight leading-[1.12] drop-shadow-[0_4px_16px_rgba(53,32,68,0.9)] max-w-4xl">
            Every Future Begins Somewhere.
          </h2>

          {/* Supporting Headline */}
          <p className="font-cinematic text-lg sm:text-2xl lg:text-3xl font-medium text-[#FFC66B] mt-2 sm:mt-3 tracking-wide drop-shadow-[0_2px_8px_rgba(53,32,68,0.8)]">
            Your Journey Begins With KAABIL.
          </p>

          {/* Description */}
          <p className="font-sans text-xs sm:text-sm md:text-base text-[#FFF5E9]/90 max-w-2xl mx-auto leading-relaxed mt-2.5 sm:mt-3.5 drop-shadow-[0_2px_6px_rgba(53,32,68,0.7)]">
            Discover your strengths, build verified skills, explore meaningful career opportunities and move toward your future with confidence.
          </p>

          {/* Feature Highlights: 4 Subtle Lightweight Glass Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-3xl mt-5 sm:mt-7">
            {featureHighlights.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/15 bg-[#352044]/45 hover:bg-[#352044]/70 backdrop-blur-md px-3 py-3 sm:py-3.5 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:border-[#FFC66B]/40 hover:-translate-y-0.5 group shadow-sm"
                >
                  <div className="h-7 w-7 rounded-full bg-[#56316F]/50 border border-white/10 flex items-center justify-center text-[#FFC66B] group-hover:scale-110 transition-transform">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#FFF5E9] leading-snug">
                    {feature.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Primary & Secondary Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 w-full sm:w-auto">
            {/* Primary CTA */}
            <Link href="/register" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-full bg-gradient-to-r from-[#FFC66B] via-[#FDB851] to-[#FFAA33] hover:from-[#FFD085] hover:to-[#FFB84D] text-[#352044] font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="h-4 w-4 text-[#352044]" />
              </button>
            </Link>

            {/* Secondary CTA */}
            <Link href="/stream-selector" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-full border border-white/25 bg-[#352044]/40 hover:bg-[#352044]/65 text-[#FFF5E9] hover:text-[#FFC66B] hover:border-[#FFC66B]/40 font-semibold text-sm sm:text-base backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                <span>Explore Careers</span>
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* 7. Bottom Gradient Transition into Deep-Plum Footer */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent via-[#251433]/60 to-[#241330] pointer-events-none z-[4]"
        aria-hidden="true"
      />
    </section>
  );
}
