import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Sparkles, Compass, CheckCircle2, BarChart3, BookOpen, Trophy, 
  ArrowRight, ShieldCheck, Zap, ChevronRight, Play 
} from 'lucide-react';

interface IntroLandingPageProps {
  onTransitionToDashboard: () => void;
  onExploreFullLanding?: () => void;
}

interface WorkflowStep {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  timeStart: number; // in milliseconds
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    number: '01',
    title: 'DISCOVER',
    description: 'Understand your interests, strengths, and existing skills.',
    icon: Compass,
    timeStart: 2000
  },
  {
    number: '02',
    title: 'ASSESS',
    description: 'Evaluate your knowledge through intelligent skill assessments.',
    icon: CheckCircle2,
    timeStart: 2400
  },
  {
    number: '03',
    title: 'ANALYZE',
    description: 'Discover suitable careers and identify your skill gaps.',
    icon: BarChart3,
    timeStart: 2800
  },
  {
    number: '04',
    title: 'LEARN',
    description: 'Follow personalized learning roadmaps and improve your skills.',
    icon: BookOpen,
    timeStart: 3200
  },
  {
    number: '05',
    title: 'ACHIEVE',
    description: 'Improve your resume, practice interviews, and explore job opportunities.',
    icon: Trophy,
    timeStart: 3600
  }
];

const TOTAL_DURATION_MS = 5000;

export const IntroLandingPage: React.FC<IntroLandingPageProps> = ({
  onTransitionToDashboard,
  onExploreFullLanding
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const redirectedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Exact 5000ms animation timer with requestAnimationFrame
  useEffect(() => {
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      setElapsedMs(Math.min(elapsed, TOTAL_DURATION_MS));

      if (elapsed >= TOTAL_DURATION_MS) {
        if (!redirectedRef.current) {
          redirectedRef.current = true;
          setIsTransitioning(true);
          setTimeout(() => {
            onTransitionToDashboard();
          }, 450); // slight delay for smooth exit animation
        }
        return;
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onTransitionToDashboard]);

  // Skip handler
  const handleSkip = () => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsTransitioning(true);
    setTimeout(() => {
      onTransitionToDashboard();
    }, 200);
  };

  const progressRatio = Math.min(elapsedMs / TOTAL_DURATION_MS, 1);
  const secondsLeft = Math.max(0, ((TOTAL_DURATION_MS - elapsedMs) / 1000)).toFixed(1);

  // Current stage flags according to timeline:
  // 0-1s: Logo & Heading
  // 1-2s: Subtitle & Intro
  // 2-4s: 5 Workflow steps sequential
  // 4-5s: Launch message & prepare transition
  const showIntro = elapsedMs >= 900 || shouldReduceMotion;
  const showSteps = elapsedMs >= 1800 || shouldReduceMotion;
  const showLaunchMessage = elapsedMs >= 3900 || shouldReduceMotion;

  return (
    <div className="relative min-h-screen w-full bg-[#FAFCFF] text-[#0F172A] flex flex-col justify-between overflow-hidden selection:bg-[#2563EB] selection:text-white font-sans">
      {/* 5-Second Linear Top Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-blue-100 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#2563EB]"
          style={{ width: `${progressRatio * 100}%` }}
          transition={{ ease: 'linear' }}
        />
      </div>

      {/* Background Subtle Ambient Gradients & Particle Dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Soft radial glow top center */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#38BDF8]/15 via-[#2563EB]/8 to-transparent rounded-full blur-3xl" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Floating subtle blue accents */}
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [-15, 15, -15], x: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-10 w-64 h-64 bg-[#38BDF8]/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [15, -15, 15], x: [10, -10, 10] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-10 w-72 h-72 bg-[#2563EB]/10 rounded-full blur-3xl"
        />
      </div>

      {/* Top Bar: Brand Badge & Skip Intro */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 pt-6 pb-2 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
            K
          </div>
          <span className="font-display font-extrabold text-base tracking-tight text-[#0F172A]">
            KAABIL
          </span>
          <span className="hidden sm:inline-block text-[11px] font-semibold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 ml-2">
            AI Career Intelligence Platform
          </span>
        </motion.div>

        {/* Skip Intro & Timer Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
            <span>Dashboard in</span>
            <span className="font-bold text-[#2563EB] tabular-nums font-mono">
              {secondsLeft}s
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 bg-white/90 hover:bg-white hover:text-[#2563EB] border border-slate-200 hover:border-[#2563EB]/30 shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <span>Skip Intro</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Central Presentation Area */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 flex-1 flex flex-col justify-center items-center text-center">
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div
              key="intro-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center"
            >
              {/* 0–1s: Hero Logo & Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center max-w-3xl"
              >
                {/* Central Emblem Badge */}
                <div className="relative mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#2563EB] via-[#1D4ED8] to-[#38BDF8] p-[2px] shadow-xl shadow-blue-500/25 flex items-center justify-center">
                    <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
                      <span className="font-display font-black text-3xl sm:text-4xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] bg-clip-text text-transparent">
                        K
                      </span>
                    </div>
                  </div>
                  <motion.div
                    animate={shouldReduceMotion ? {} : { rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-1.5 rounded-3xl border border-dashed border-[#38BDF8]/40 pointer-events-none"
                  />
                </div>

                {/* Brand Name */}
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-[#2563EB] mb-2 font-display">
                  KAABIL
                </span>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-[#0F172A] tracking-tight leading-[1.12] font-display">
                  Discover Your Skills.{' '}
                  <span className="bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#38BDF8] bg-clip-text text-transparent">
                    Define Your Career.
                  </span>
                </h1>
              </motion.div>

              {/* 1–2s: Subtitle & Introduction */}
              <AnimatePresence>
                {showIntro && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-4 max-w-2xl space-y-2"
                  >
                    <p className="text-base sm:text-lg font-semibold text-slate-700 leading-snug">
                      Your AI-powered companion to explore careers, develop skills, and become job-ready.
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
                      KAABIL helps students discover their potential, identify skill gaps, build personalized learning paths, and prepare for real-world career opportunities.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 2–4s: 5 Workflow Steps (Horizontal Interactive Journey) */}
              <div className="w-full mt-8 md:mt-10 max-w-5xl">
                {/* Connecting Progress Line (Desktop/Tablet) */}
                <div className="relative">
                  <div className="hidden md:block absolute top-7 left-[8%] right-[8%] h-1 bg-slate-200/80 -z-0 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#2563EB]"
                      initial={{ width: '0%' }}
                      animate={{
                        width: showSteps
                          ? `${Math.max(0, Math.min(100, ((elapsedMs - 1800) / 1800) * 100))}%`
                          : '0%'
                      }}
                      transition={{ ease: 'linear' }}
                    />
                  </div>

                  {/* 5 Steps Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3.5 relative z-10">
                    {WORKFLOW_STEPS.map((step, idx) => {
                      const isStepActive = elapsedMs >= step.timeStart || shouldReduceMotion;
                      const IconComponent = step.icon;

                      return (
                        <motion.div
                          key={step.number}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{
                            opacity: isStepActive ? 1 : 0.25,
                            y: isStepActive ? 0 : 15,
                            scale: isStepActive ? 1 : 0.96
                          }}
                          transition={{
                            duration: shouldReduceMotion ? 0.05 : 0.45,
                            ease: [0.16, 1, 0.3, 1]
                          }}
                          className={`p-4 rounded-2xl text-left border transition-all duration-300 relative flex flex-col justify-between ${
                            isStepActive
                              ? 'bg-white/95 border-[#2563EB]/30 shadow-lg shadow-blue-500/8 ring-1 ring-[#2563EB]/15'
                              : 'bg-white/50 border-slate-200/60 shadow-xs'
                          }`}
                        >
                          <div>
                            {/* Step Number & Icon */}
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className={`text-[11px] font-black tracking-wider px-2 py-0.5 rounded-md font-mono ${
                                  isStepActive
                                    ? 'bg-[#2563EB] text-white'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {step.number}
                              </span>
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                                  isStepActive
                                    ? 'bg-blue-50 text-[#2563EB]'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>
                            </div>

                            {/* Step Title */}
                            <h3
                              className={`text-xs font-black tracking-wider uppercase mb-1 font-display ${
                                isStepActive ? 'text-[#0F172A]' : 'text-slate-400'
                              }`}
                            >
                              {step.title}
                            </h3>

                            {/* Step Description */}
                            <p className="text-[11px] text-slate-500 leading-snug line-clamp-3">
                              {step.description}
                            </p>
                          </div>

                          {/* Active Bottom Glow Line */}
                          {isStepActive && (
                            <motion.div
                              layoutId="step-indicator"
                              className="h-1 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] rounded-full mt-3 w-full"
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4–5s: Launch Preparation Callout */}
              <div className="min-h-[50px] mt-6 flex items-center justify-center">
                <AnimatePresence>
                  {showLaunchMessage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-[#2563EB]/30 shadow-md shadow-blue-500/10 text-xs sm:text-sm font-bold text-[#0F172A]"
                    >
                      <Sparkles className="w-4 h-4 text-[#2563EB] animate-spin" />
                      <span>Your Career Journey Starts Here.</span>
                      <span className="text-[#2563EB] font-semibold">
                        Entering Dashboard...
                      </span>
                      <div className="w-4 h-4 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin ml-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Footer Info Strip */}
      <footer className="relative z-20 max-w-7xl mx-auto w-full px-6 py-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
          <span>Transparent AI Career Modeling · 100% Client-Side Privacy</span>
        </div>

        <div className="flex items-center gap-4">
          {onExploreFullLanding && (
            <button
              onClick={onExploreFullLanding}
              className="hover:text-[#2563EB] transition-colors underline underline-offset-2"
            >
              Explore Full Landing Page
            </button>
          )}
          <span>Made in India 🇮🇳 · Built by Harshit Chaudhary</span>
        </div>
      </footer>
    </div>
  );
};
