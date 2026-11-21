"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Compass, Rocket } from "lucide-react";
import { KaabilLogo } from "@/components/shared/KaabilLogo";

interface StepData {
  title: string;
  subtitle: string;
  tagline: string;
  icon: React.ReactNode;
}

const INTRO_STEPS: StepData[] = [
  {
    title: "KAABIL (काबिल)",
    subtitle: "Universal Career, Skill & Education Intelligence",
    tagline: "Every Stream. Every Skill. Every Future.",
    icon: <Sparkles className="w-10 h-10 text-primary" />,
  },
  {
    title: "Discover Your Skills",
    subtitle: "Map your authentic potential across all 13 educational streams beyond exam marks.",
    tagline: "Explore Pathways • Build Competencies",
    icon: <Compass className="w-10 h-10 text-sky-500" />,
  },
  {
    title: "Define Your Future",
    subtitle: "Verified credentials, explainable career roadmaps, and authentic opportunity matching.",
    tagline: "Your Future. Powered by Intelligence.",
    icon: <Rocket className="w-10 h-10 text-secondary" />,
  },
];

export function CinematicIntro({ onComplete }: { onComplete?: () => void }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const handleSkip = useCallback(() => {
    try {
      sessionStorage.setItem("kaabil_intro_viewed_v2", "true");
    } catch {
      // ignore
    }
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    try {
      const hasSeenIntro = sessionStorage.getItem("kaabil_intro_viewed_v2");
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (hasSeenIntro || prefersReducedMotion) {
        setIsVisible(false);
        onComplete?.();
        return;
      }
    } catch {
      // ignore
    }

    setIsVisible(true);

    // 3.6-second sequence (1.2s per step for 3 steps)
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < INTRO_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            handleSkip();
          }, 1100);
          return prev;
        }
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [handleSkip, onComplete]);

  if (!isVisible) return null;

  const currentStep = INTRO_STEPS[currentStepIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl text-white px-4"
      >
        {/* Subtle Ambient Background Mesh */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[250px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header with Brand and Skip Button */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Welcome to KAABIL
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs font-semibold px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10 active:scale-95"
          >
            Skip Intro &rarr;
          </button>
        </div>

        {/* Center Stage Card */}
        <div className="relative max-w-lg w-full text-center space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Step Icon or Logo */}
              <div className="flex items-center justify-center mb-2">
                {currentStepIndex === 0 ? (
                  <div className="scale-125 my-2">
                    <KaabilLogo variant="full" size="lg" />
                  </div>
                ) : (
                  <div className="p-4 rounded-3xl bg-white/5 border border-white/10 shadow-soft-lg">
                    {currentStep.icon}
                  </div>
                )}
              </div>

              {/* Tagline Badge */}
              <div className="inline-block">
                <span className="text-[11px] font-bold uppercase tracking-widest text-sky-400 bg-sky-400/10 px-3 py-1 rounded-full border border-sky-400/20">
                  {currentStep.tagline}
                </span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
                {currentStep.title}
              </h2>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
                {currentStep.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Stepper Progress Indicator */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {INTRO_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? "w-8 bg-gradient-to-r from-primary to-sky-400"
                    : idx < currentStepIndex
                    ? "w-2 bg-emerald-400"
                    : "w-2 bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
