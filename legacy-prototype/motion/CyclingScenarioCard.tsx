import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Pause, ChevronRight, ChevronLeft, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

export interface Scenario {
  id: string;
  badge: string;
  studentQuestion: string;
  studentContext: string;
  roleFitTitle: string;
  fitPercentage: number;
  topGapSkill: string;
  gapDetails: string;
  priorityScore: number;
  week1Action: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'commerce-to-da',
    badge: 'Commerce → Analytics Pivot',
    studentQuestion: '“I am a B.Com final-year student with basic Excel. Can I break into Data Analytics, or do tech grads get everything?”',
    studentContext: 'B.Com | Proficient in Excel & Basic Stats | Zero SQL / Python',
    roleFitTitle: 'Data Analyst',
    fitPercentage: 62,
    topGapSkill: 'SQL Analytical Queries',
    gapDetails: 'Current 15% → Target 80%',
    priorityScore: 16.3,
    week1Action: 'Week 1: SQL Relational Joins & Aggregations via interactive browser drills.'
  },
  {
    id: 'cs-fresher-to-fe',
    badge: 'B.Tech CS → Frontend Specialist',
    studentQuestion: '“I know C++ and basic HTML/CSS, but getting zero interview callbacks for software roles. What am I missing?”',
    studentContext: '3rd Year B.Tech | C++, DSA, Basic Web | Missing modern frameworks',
    roleFitTitle: 'Frontend Developer',
    fitPercentage: 71,
    topGapSkill: 'React Hooks & State Architecture',
    gapDetails: 'Current 20% → Target 85%',
    priorityScore: 19.5,
    week1Action: 'Week 1: React State & Custom Hooks — Deploy 1 interactive dashboard on Vercel.'
  },
  {
    id: 'bba-to-ba',
    badge: 'BBA / Non-Tech → Business Analyst',
    studentQuestion: '“I love business strategy and have great communication, but every BA job asks for SQL and BRDs. Where do I start?”',
    studentContext: 'BBA Graduate | Presentation & Excel 75% | Missing SQL & Product Frameworks',
    roleFitTitle: 'Business Analyst',
    fitPercentage: 68,
    topGapSkill: 'SQL Metric Validation',
    gapDetails: 'Current 20% → Target 65%',
    priorityScore: 9.0,
    week1Action: 'Week 1: Analytical SQL for BAs — Cohort retention & funnel drop-off queries.'
  }
];

export const CyclingScenarioCard: React.FC<{ onSelectScenario?: (scenario: Scenario) => void }> = ({
  onSelectScenario
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % SCENARIOS.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % SCENARIOS.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + SCENARIOS.length) % SCENARIOS.length);
  };

  const scenario = SCENARIOS[currentIndex];

  return (
    <div className="relative bg-white rounded-3xl border border-slate-border shadow-card-hover overflow-hidden transition-all duration-300">
      {/* Top Banner with controls */}
      <div className="flex items-center justify-between px-6 py-4 bg-canvas border-b border-slate-border/80">
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-navy">
            Real Student Journey Simulation
          </span>
          <span className="text-xs bg-gold/15 text-gold-600 px-2.5 py-0.5 rounded-full font-medium ml-2 border border-gold/30">
            {scenario.badge}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause auto-cycle' : 'Resume auto-cycle'}
            className="p-1.5 rounded-lg text-slate-body hover:text-navy hover:bg-slate-200/60 transition-colors"
            title={isPlaying ? 'Pause (4.5s cycle)' : 'Resume auto-cycle'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald" />}
          </button>
          <button
            onClick={handlePrev}
            aria-label="Previous scenario"
            className="p-1.5 rounded-lg text-slate-body hover:text-navy hover:bg-slate-200/60 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next scenario"
            className="p-1.5 rounded-lg text-slate-body hover:text-navy hover:bg-slate-200/60 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Animated Card Body */}
      <div className="p-6 md:p-8 relative min-h-[360px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -25 }}
            transition={{ duration: shouldReduceMotion ? 0.05 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Student Dilemma */}
            <div>
              <div className="text-xs font-medium text-slate-body uppercase tracking-wider mb-2">
                Dilemma {currentIndex + 1} of {SCENARIOS.length}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-navy leading-snug font-display">
                {scenario.studentQuestion}
              </h3>
              <p className="text-xs text-slate-body mt-1.5 font-medium flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
                {scenario.studentContext}
              </p>
            </div>

            {/* KAABIL 3-Step Resolution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Step 1: Fit % */}
              <div className="p-4 rounded-2xl bg-mint/50 border border-emerald/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-emerald font-semibold uppercase tracking-wider mb-1">
                    <span>1. Role Fit</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald" />
                  </div>
                  <div className="text-sm font-bold text-navy line-clamp-1">{scenario.roleFitTitle}</div>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-emerald">
                    <AnimatedCounter value={scenario.fitPercentage} suffix="%" />
                  </span>
                  <span className="text-xs text-slate-body">instant match</span>
                </div>
              </div>

              {/* Step 2: Critical Gap */}
              <div className="p-4 rounded-2xl bg-terracotta-50 border border-terracotta/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-terracotta font-semibold uppercase tracking-wider mb-1">
                    <span>2. Top Gap</span>
                    <AlertCircle className="w-3.5 h-3.5 text-terracotta" />
                  </div>
                  <div className="text-sm font-bold text-navy line-clamp-1">{scenario.topGapSkill}</div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-terracotta bg-white px-2 py-0.5 rounded border border-terracotta/30">
                    {scenario.gapDetails}
                  </span>
                  <span className="text-xs text-slate-body tabular-nums">
                    Score: <strong>{scenario.priorityScore}</strong>
                  </span>
                </div>
              </div>

              {/* Step 3: Week 1 Action */}
              <div className="p-4 rounded-2xl bg-white border border-slate-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-navy font-semibold uppercase tracking-wider mb-1">
                    <span>3. Week 1 Fix</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                  </div>
                  <div className="text-xs font-medium text-slate-dark leading-relaxed line-clamp-3">
                    {scenario.week1Action}
                  </div>
                </div>
                <div className="mt-2 text-[11px] font-semibold text-emerald flex items-center gap-1">
                  <span>Guaranteed zero fluff</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Pagination Dots & Live Timer Bar */}
        <div className="mt-6 pt-4 border-t border-slate-border/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {SCENARIOS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-8 bg-emerald' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to scenario ${i + 1}`}
              />
            ))}
          </div>

          <a
            href="/app"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald hover:text-emerald-hover transition-colors"
          >
            <span>Run your own profile now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
