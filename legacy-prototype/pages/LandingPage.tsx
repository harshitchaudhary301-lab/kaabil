import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Sparkles, CheckCircle2, ChevronDown, ChevronUp, 
  ShieldCheck, BarChart3, Compass, BrainCircuit, Target, Code, 
  HelpCircle, ExternalLink, Zap, Check, Lock
} from 'lucide-react';
import { FadeInSection } from '../components/motion/FadeInSection';
import { InfiniteMarquee } from '../components/motion/InfiniteMarquee';
import { CyclingScenarioCard } from '../components/motion/CyclingScenarioCard';
import { AnimatedCounter } from '../components/motion/AnimatedCounter';

const SKILLS_LIST = [
  'Python', 'SQL', 'Statistics', 'Excel', 'Power BI', 'React', 
  'FastAPI', 'Communication', 'Financial Modeling', 'Product Thinking', 'Git'
];

const STUDENT_QUESTIONS_ROW1 = [
  'Which career role actually fits my skills?',
  'Should I learn SQL or Python first?',
  'Why am I not getting shortlisted for analyst jobs?',
  'How do I move into tech from a Commerce background?',
  'Are my projects actually recruiter-ready?'
];

const STUDENT_QUESTIONS_ROW2 = [
  'How do I become Data Analyst-ready in 4 weeks?',
  'What skills am I missing for Business Analyst?',
  'Do companies in India still hire for Python Backend?',
  'Can non-engineers get into Product & Analytics roles?',
  'How do I write resume bullet points that beat the ATS?'
];

const FAQ_ITEMS = [
  {
    q: 'How does KAABIL calculate my role fit?',
    a: 'KAABIL does not use a black box. Your fit percentage is calculated with a published, transparent formula: 70% skill coverage against entry benchmarks (weighted by importance), 20% resume corpus similarity (using TF-IDF cosine matching against real role corpora), and 10% interest affinity. You can inspect the exact mathematics down to the decimal point for every single skill.'
  },
  {
    q: 'Is it only for tech/CS students?',
    a: 'Not at all. KAABIL was purposefully designed for students across all Indian college backgrounds—including B.Com, BBA, BCA, BSc, and non-CS engineering branches. We benchmark roles like Business Analyst, Operations Associate, Product Analyst, Digital Marketing, and Financial Analyst alongside software engineering paths.'
  },
  {
    q: 'What happens if I fail a weekly quiz?',
    a: 'Unlike static roadmaps that push you forward prematurely, if you score below 60% on a checkpoint quiz, KAABIL immediately adapts. It triggers an amber alert and automatically inserts a focused reinforcement week (e.g., Week 1b) with targeted practice drills and mental-model explanations before unlocking subsequent weeks.'
  },
  {
    q: 'Is my resume data stored on a server?',
    a: 'No. KAABIL runs 100% client-side in your web browser. When you drop your PDF or text resume, all skill extraction and fuzzy matching happen locally in your browser memory. Your resume text is never transmitted or saved to an external database.'
  },
  {
    q: 'Is KAABIL free?',
    a: 'Yes, KAABIL is 100% free to start without requiring any login, email capture, or credit card. Harshit Chaudhary built KAABIL to solve the widespread career confusion and predatory placement upselling facing Indian undergraduate students.'
  },
  {
    q: 'Which roles does KAABIL support today?',
    a: 'In Phase 1, KAABIL provides deeply calibrated models for 8 high-demand entry-level roles in the Indian hiring market: Data Analyst, Business Analyst, Operations Associate, Frontend Developer, Python Backend Developer, Product Analyst, Financial Analyst, and Digital Marketing Associate.'
  }
];

interface LandingPageProps {
  onNavigateToApp: (initialRoleOrQuery?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToApp }) => {
  const [heroSearchInput, setHeroSearchInput] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Bento live mini-UI interactive states
  const [bento1Role, setBento1Role] = useState<'DA' | 'BA' | 'FE'>('DA');
  const [bento2Gap, setBento2Gap] = useState<number>(45);
  const [bento3QuizScore, setBento3QuizScore] = useState<number>(50);

  // 5-Second Quick Matcher States
  const [activeHeroTab, setActiveHeroTab] = useState<'5sec' | 'resume'>('5sec');
  const [quickStream, setQuickStream] = useState<string>('B.Com / Commerce');
  const [quickSkills, setQuickSkills] = useState<string[]>(['Excel', 'Communication']);
  const [isScanning5Sec, setIsScanning5Sec] = useState<boolean>(false);
  const [scanSecondsLeft, setScanSecondsLeft] = useState<number>(5);
  const [quickResult, setQuickResult] = useState<{
    role: string;
    fit: number;
    topGap: string;
    week1: string;
    avgCTC: string;
  } | null>(null);

  const STREAMS_LIST = [
    'B.Com / Commerce',
    'B.Tech (CS / IT)',
    'B.Tech (Non-CS)',
    'BBA / Management',
    'BCA / BSc'
  ];

  const QUICK_SKILLS_OPTIONS = [
    'Excel', 'Python', 'SQL', 'Communication', 'Statistics', 'React', 'Problem Solving'
  ];

  const toggleQuickSkill = (skill: string) => {
    if (quickSkills.includes(skill)) {
      setQuickSkills(quickSkills.filter(s => s !== skill));
    } else {
      if (quickSkills.length >= 3) {
        setQuickSkills([...quickSkills.slice(1), skill]);
      } else {
        setQuickSkills([...quickSkills, skill]);
      }
    }
  };

  const run5SecondScan = () => {
    setIsScanning5Sec(true);
    setScanSecondsLeft(5);
    setQuickResult(null);

    const interval = setInterval(() => {
      setScanSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsScanning5Sec(false);
          // Calculate realistic match based on choices
          if (quickSkills.includes('React')) {
            setQuickResult({
              role: 'Frontend Developer',
              fit: 72,
              topGap: 'State Architecture & Redux',
              week1: 'Build 1 Responsive Interactive App on Vercel',
              avgCTC: '₹7.5 - 15 LPA'
            });
          } else if (quickSkills.includes('Python') && quickSkills.includes('SQL')) {
            setQuickResult({
              role: 'Data Analyst',
              fit: 76,
              topGap: 'Statistical Hypothesis Testing',
              week1: 'SQL Joins & CTE drills via SQLBolt',
              avgCTC: '₹6.5 - 12 LPA'
            });
          } else if (quickStream.includes('B.Com') || quickSkills.includes('Excel')) {
            setQuickResult({
              role: quickSkills.includes('SQL') ? 'Data Analyst' : 'Business Analyst',
              fit: 68,
              topGap: 'Analytical SQL & Data Validation',
              week1: 'Excel Financial Modeling & Pivot MIS Trackers',
              avgCTC: '₹7.0 - 14 LPA'
            });
          } else {
            setQuickResult({
              role: 'Operations Associate',
              fit: 65,
              topGap: 'Process Optimization & SLA Trackers',
              week1: 'Daily Operations MIS & Incident Logs in Excel',
              avgCTC: '₹5.0 - 9 LPA'
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToApp(heroSearchInput.trim() || undefined);
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-dark selection:bg-emerald selection:text-white">
      {/* 1. Sticky Glassmorphic Navbar */}
      <header className="sticky top-0 z-40 glass-nav transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Wordmark */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald flex items-center justify-center text-white font-black text-xl shadow-sm group-hover:bg-emerald-hover transition-colors">
              K
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl text-navy tracking-tight leading-tight">
                KAABIL
              </span>
              <span className="text-[10px] text-slate-body font-semibold tracking-wide uppercase">
                Career Clarity Engine
              </span>
            </div>
          </a>

          {/* Navigation Anchors */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-dark">
            <a href="#how-it-works" className="hover:text-emerald transition-colors">How it works</a>
            <a href="#features" className="hover:text-emerald transition-colors">Features</a>
            <a href="#simulation" className="hover:text-emerald transition-colors">Student Scenarios</a>
            <a href="#faq" className="hover:text-emerald transition-colors">FAQ</a>
          </nav>

          {/* Nav Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigateToApp()}
              className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-bold text-navy hover:text-emerald hover:bg-slate-100 transition-colors"
            >
              Try Demo
            </button>
            <button
              onClick={() => onNavigateToApp()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-emerald hover:bg-emerald-hover text-white shadow-glow-emerald transition-all transform active:scale-95 cursor-pointer"
            >
              <span>Start Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Subtle background ambient gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-mint/70 via-emerald-50/40 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mint text-emerald text-xs font-bold mb-6 border border-emerald/20 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald" />
            <span>AI Career Guidance · Built for Indian Students</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-navy font-display tracking-tight leading-[1.12]"
          >
            From confusion to career.{' '}
            <span className="text-emerald block sm:inline">
              Know your fit, see your gap, follow your plan.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-base sm:text-lg md:text-xl text-slate-body max-w-3xl mx-auto leading-relaxed"
          >
            Upload your resume or pick your skills. KAABIL shows which roles actually fit you, why they fit, what's holding you back, and an adaptive 4-week plan to close the gap.
          </motion.p>

          {/* Interactive Entry Bar with 5-Second Career Match Option */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-2xl mx-auto"
          >
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveHeroTab('5sec')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeHeroTab === '5sec'
                    ? 'bg-emerald text-white shadow-glow-emerald'
                    : 'bg-white text-slate-dark hover:bg-slate-100 border border-slate-border'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ 5-Second Career Fit Check</span>
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded font-black">FAST</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveHeroTab('resume')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeHeroTab === 'resume'
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-white text-slate-dark hover:bg-slate-100 border border-slate-border'
                }`}
              >
                <span>📄 Upload Resume / Pick Role</span>
              </button>
            </div>

            {/* TAB 1: 5-Second Instant Career Match Card */}
            {activeHeroTab === '5sec' ? (
              <div className="bg-white p-5 md:p-6 rounded-3xl border-2 border-slate-border shadow-card-hover text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-navy">
                      5-Second Instant Career Fit Scanner
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-body font-medium">No resume required</span>
                </div>

                {/* Question 1: Stream */}
                <div>
                  <label className="text-xs font-bold text-slate-body uppercase tracking-wider block mb-1.5">
                    1. Your College Degree / Stream
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {STREAMS_LIST.map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setQuickStream(st)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                          quickStream === st
                            ? 'bg-navy text-white'
                            : 'bg-canvas hover:bg-slate-200 text-slate-dark border border-slate-border'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2: Top Skills */}
                <div>
                  <label className="text-xs font-bold text-slate-body uppercase tracking-wider block mb-1.5">
                    2. Select 1 to 2 skills you know or enjoy
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SKILLS_OPTIONS.map(sk => {
                      const isSel = quickSkills.includes(sk);
                      return (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => toggleQuickSkill(sk)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                            isSel
                              ? 'bg-emerald text-white'
                              : 'bg-canvas hover:bg-slate-200 text-slate-dark border border-slate-border'
                          }`}
                        >
                          {isSel && <Check className="w-3 h-3 text-white" />}
                          <span>{sk}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5-Second Scan Button / Active Countdown */}
                {!isScanning5Sec && !quickResult && (
                  <button
                    type="button"
                    onClick={run5SecondScan}
                    className="w-full py-3.5 rounded-2xl bg-emerald hover:bg-emerald-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-glow-emerald transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Run 5-Second Career Scan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* 5-Second Live Animated Countdown */}
                {isScanning5Sec && (
                  <div className="py-4 text-center bg-mint/50 rounded-2xl border border-emerald/30 space-y-2">
                    <div className="flex items-center justify-center gap-2 text-emerald">
                      <div className="w-7 h-7 rounded-full border-2 border-emerald border-t-transparent animate-spin" />
                      <span className="text-2xl font-black font-display tabular-nums">
                        {scanSecondsLeft}s
                      </span>
                    </div>
                    <p className="text-xs font-bold text-navy">
                      Evaluating 8 Indian entry role benchmarks for {quickStream}...
                    </p>
                  </div>
                )}

                {/* 5-Second Result Pop-Up */}
                {quickResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-mint border border-emerald/30 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald">
                          Your 5-Second Top Match
                        </span>
                        <h4 className="text-xl font-black text-navy font-display">
                          {quickResult.role}
                        </h4>
                        <span className="text-xs text-slate-body font-semibold">
                          Fresher Band: {quickResult.avgCTC}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-emerald font-display tabular-nums">
                          {quickResult.fit}%
                        </span>
                        <span className="block text-[10px] text-slate-body font-bold">Role Fit</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-border">
                        <span className="text-[10px] font-bold text-terracotta uppercase block">
                          Top Priority Gap
                        </span>
                        <span className="font-semibold text-navy line-clamp-1">{quickResult.topGap}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-border">
                        <span className="text-[10px] font-bold text-emerald uppercase block">
                          Week 1 Fix
                        </span>
                        <span className="font-semibold text-navy line-clamp-1">{quickResult.week1}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigateToApp(quickResult.role)}
                      className="w-full py-3 rounded-xl bg-navy hover:bg-navy-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Open Full 4-Week Plan in /app</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              /* TAB 2: Standard Search / Upload Bar */
              <form onSubmit={handleHeroSubmit} className="relative flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-2xl md:rounded-full border-2 border-slate-border shadow-card-hover focus-within:border-emerald transition-all">
                <input
                  type="text"
                  value={heroSearchInput}
                  onChange={e => setHeroSearchInput(e.target.value)}
                  placeholder="Target role or college stream (e.g. Data Analyst, B.Com)..."
                  className="w-full px-4 py-2.5 text-sm outline-none bg-transparent text-navy placeholder:text-slate-400 font-medium"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl md:rounded-full bg-emerald hover:bg-emerald-hover text-white text-xs sm:text-sm font-bold shrink-0 flex items-center justify-center gap-1.5 shadow-glow-emerald transition-all cursor-pointer"
                >
                  <span>Upload Resume / Start Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Micro-copy */}
            <div className="mt-3 flex items-center justify-center gap-4 text-xs font-medium text-slate-body">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                <span>Free to start</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                <span>No login needed</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                <span>Transparent scoring</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Skills Marquee Strip */}
      <section className="py-6 border-y border-slate-border/80 bg-white/60">
        <div className="max-w-7xl mx-auto px-4">
          <InfiniteMarquee speed="normal" direction="left">
            {SKILLS_LIST.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-canvas border border-slate-border text-xs font-bold text-navy hover:border-emerald transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald" />
                <span>{skill}</span>
              </span>
            ))}
          </InfiniteMarquee>
        </div>
      </section>

      {/* 4. How It Works (3 Steps) */}
      <section id="how-it-works" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald uppercase tracking-wider bg-mint px-3 py-1 rounded-full border border-emerald/20">
            Clear 3-Stage Process
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-navy font-display mt-3">
            How KAABIL turns ambiguity into an offer
          </h2>
          <p className="text-sm md:text-base text-slate-body mt-2">
            No endless advice or generic roadmaps. Just transparent evaluation and adaptive steps.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <FadeInSection delay={0.1} className="bg-white p-8 rounded-3xl border border-slate-border shadow-card relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-emerald font-black text-lg mb-6 shadow-sm">
                01
              </div>
              <h3 className="text-xl font-bold text-navy font-display mb-2">
                Share your profile or resume
              </h3>
              <p className="text-sm text-slate-body leading-relaxed">
                Drag in your PDF resume or select your current skills. Our 2-stage engine normalizes aliases (e.g. py3 → Python) and estimates your baseline competency.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald">
              <span>Client-side extraction</span>
              <Check className="w-3.5 h-3.5" />
            </div>
          </FadeInSection>

          {/* Step 2 */}
          <FadeInSection delay={0.2} className="bg-white p-8 rounded-3xl border border-slate-border shadow-card relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-canvas border border-slate-border flex items-center justify-center text-navy font-black text-lg mb-6 shadow-sm">
                02
              </div>
              <h3 className="text-xl font-bold text-navy font-display mb-2">
                Get explainable fit & ranked gaps
              </h3>
              <p className="text-sm text-slate-body leading-relaxed">
                See exact match scores across 8 industry roles. We rank every skill gap using <strong>importance × gap</strong> so you know exactly which deficiencies block job offers.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald">
              <span>Zero black box math</span>
              <Check className="w-3.5 h-3.5" />
            </div>
          </FadeInSection>

          {/* Step 3 */}
          <FadeInSection delay={0.3} className="bg-white p-8 rounded-3xl border border-slate-border shadow-card relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-terracotta-50 flex items-center justify-center text-terracotta font-black text-lg mb-6 shadow-sm border border-terracotta/20">
                03
              </div>
              <h3 className="text-xl font-bold text-navy font-display mb-2">
                Follow an adaptive weekly plan
              </h3>
              <p className="text-sm text-slate-body leading-relaxed">
                Conquer 3–4 practical tasks each week. Take checkpoint quizzes: score below 60% and KAABIL automatically inserts reinforcement drills to protect your foundation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald">
              <span>Live re-planning on score</span>
              <Check className="w-3.5 h-3.5" />
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* 5. Bento Grid with Live Animated Mini-UIs */}
      <section id="features" className="py-20 bg-white border-y border-slate-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald uppercase tracking-wider bg-mint px-3 py-1 rounded-full border border-emerald/20">
              Interactive Product Anatomy
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-navy font-display mt-3">
              Built with mathematical rigor, not empty hype
            </h2>
            <p className="text-sm md:text-base text-slate-body mt-2">
              Explore the live mini-interfaces below to see how KAABIL's core algorithms work in real-time.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bento Card 1: Explainable Career Matching */}
            <FadeInSection delay={0.1} className="bg-canvas rounded-3xl p-6 md:p-8 border border-slate-border shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase text-emerald bg-mint px-2.5 py-1 rounded-md">
                    01 · Transparent Matching
                  </span>
                  <Compass className="w-5 h-5 text-emerald" />
                </div>
                <h3 className="text-xl font-bold text-navy font-display mb-2">
                  Explainable Career Matching
                </h3>
                <p className="text-xs text-slate-body mb-6">
                  No mysterious black box. Test different role simulations to see live coverage calculations.
                </p>

                {/* Interactive Mini-UI */}
                <div className="bg-white p-4 rounded-2xl border border-slate-border space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-navy">
                    <span>Select Target Role:</span>
                    <div className="flex gap-1">
                      {(['DA', 'BA', 'FE'] as const).map(roleKey => (
                        <button
                          key={roleKey}
                          onClick={() => setBento1Role(roleKey)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            bento1Role === roleKey
                              ? 'bg-emerald text-white'
                              : 'bg-canvas text-slate-dark hover:bg-slate-200'
                          }`}
                        >
                          {roleKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-navy">
                        {bento1Role === 'DA' ? 'Data Analyst' : bento1Role === 'BA' ? 'Business Analyst' : 'Frontend Developer'}
                      </span>
                      <span className="text-emerald tabular-nums">
                        {bento1Role === 'DA' ? '68%' : bento1Role === 'BA' ? '62%' : '74%'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald"
                        animate={{ width: bento1Role === 'DA' ? '68%' : bento1Role === 'BA' ? '62%' : '74%' }}
                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-body bg-canvas p-2.5 rounded-xl border border-slate-border/80 font-mono">
                    Coverage: 70% | Text Cosine: 20% | Interest: 10%
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-border text-xs text-slate-body">
                Shows exact mathematical contributions per skill component.
              </div>
            </FadeInSection>

            {/* Bento Card 2: Intelligent Skill-Gap Analysis */}
            <FadeInSection delay={0.2} className="bg-canvas rounded-3xl p-6 md:p-8 border border-slate-border shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase text-terracotta bg-terracotta-50 px-2.5 py-1 rounded-md border border-terracotta/20">
                    02 · Gap Prioritization
                  </span>
                  <BarChart3 className="w-5 h-5 text-terracotta" />
                </div>
                <h3 className="text-xl font-bold text-navy font-display mb-2">
                  Intelligent Skill-Gap Analysis
                </h3>
                <p className="text-xs text-slate-body mb-6">
                  Gaps ranked by <strong>importance × gap</strong>. Drag the slider to see how priority scores shift dynamically.
                </p>

                {/* Interactive Mini-UI */}
                <div className="bg-white p-4 rounded-2xl border border-slate-border space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-navy">
                    <span>SQL Current Level:</span>
                    <span className="text-emerald tabular-nums">{bento2Gap} / 80</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={bento2Gap}
                    onChange={e => setBento2Gap(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald"
                  />
                  <div className="flex justify-between items-center pt-1 text-xs">
                    <span className="text-slate-body">Calculated Gap:</span>
                    <span className="font-bold text-terracotta tabular-nums">{80 - bento2Gap} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-body">Priority Metric:</span>
                    <span className="px-2 py-0.5 rounded bg-terracotta-50 text-terracotta font-mono font-bold border border-terracotta/30 tabular-nums">
                      P {((80 - bento2Gap) * 0.25).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-border text-xs text-slate-body">
                Eliminates low-yield study so you focus on highest-impact milestones.
              </div>
            </FadeInSection>

            {/* Bento Card 3: Personalised Adaptive Roadmap */}
            <FadeInSection delay={0.3} className="bg-canvas rounded-3xl p-6 md:p-8 border border-slate-border shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase text-gold-600 bg-gold/15 px-2.5 py-1 rounded-md border border-gold/30">
                    03 · Live Re-Planning
                  </span>
                  <BrainCircuit className="w-5 h-5 text-gold-600" />
                </div>
                <h3 className="text-xl font-bold text-navy font-display mb-2">
                  Personalised Adaptive Roadmap
                </h3>
                <p className="text-xs text-slate-body mb-6">
                  Roadmaps that adapt to your checkpoint quiz results in real time.
                </p>

                {/* Interactive Mini-UI */}
                <div className="bg-white p-4 rounded-2xl border border-slate-border space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-navy">
                    <span>Simulate Quiz Score:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setBento3QuizScore(40)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          bento3QuizScore < 60 ? 'bg-terracotta text-white' : 'bg-slate-100 text-slate-dark'
                        }`}
                      >
                        40% (&lt;60%)
                      </button>
                      <button
                        onClick={() => setBento3QuizScore(80)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          bento3QuizScore >= 80 ? 'bg-emerald text-white' : 'bg-slate-100 text-slate-dark'
                        }`}
                      >
                        80% (Pass)
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {bento3QuizScore < 60 ? (
                      <motion.div
                        key="fail"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="p-2.5 rounded-xl bg-terracotta-50 border border-terracotta/30 text-[11px] text-terracotta space-y-1"
                      >
                        <div className="font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-terracotta" />
                          <span>Adaptive Re-Plan Triggered</span>
                        </div>
                        <p className="text-slate-dark leading-snug">
                          Added <strong>W1b: SQL Joins Reinforcement</strong> before unlocking W2.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="pass"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="p-2.5 rounded-xl bg-mint border border-emerald/30 text-[11px] text-emerald space-y-1"
                      >
                        <div className="font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald" />
                          <span>Mastery Achieved (+18 Boost)</span>
                        </div>
                        <p className="text-slate-dark leading-snug">
                          Week 2 unlocked immediately! Live Role Fit increased by +6%.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-border text-xs text-slate-body">
                Protects foundational competency before advanced applications.
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* 6. Student Question Marquees + Auto-Cycling Preview Card */}
      <section id="simulation" className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald uppercase tracking-wider bg-mint px-3 py-1 rounded-full border border-emerald/20">
              Indian Student Dilemmas
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-navy font-display mt-3">
              Questions real college students ask every day
            </h2>
            <p className="text-sm md:text-base text-slate-body mt-2">
              See how KAABIL converts genuine confusion into actionable 4-week execution plans.
            </p>
          </FadeInSection>

          {/* Opposing Question Marquees */}
          <div className="space-y-3 mb-12">
            <InfiniteMarquee speed="slow" direction="left">
              {STUDENT_QUESTIONS_ROW1.map((q, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-border text-xs font-semibold text-slate-dark shadow-xs hover:border-emerald transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                  <span>“{q}”</span>
                </span>
              ))}
            </InfiniteMarquee>

            <InfiniteMarquee speed="slow" direction="right">
              {STUDENT_QUESTIONS_ROW2.map((q, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-border text-xs font-semibold text-slate-dark shadow-xs hover:border-terracotta transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                  <span>“{q}”</span>
                </span>
              ))}
            </InfiniteMarquee>
          </div>

          {/* Auto-cycling Preview Card */}
          <div className="max-w-4xl mx-auto">
            <FadeInSection delay={0.1}>
              <CyclingScenarioCard />
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* 7. FAQ Animated Accordion (6 Honest Questions) */}
      <section id="faq" className="py-20 bg-white border-t border-slate-border/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-12">
            <span className="text-xs font-bold text-emerald uppercase tracking-wider bg-mint px-3 py-1 rounded-full border border-emerald/20">
              Honest Answers
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-navy font-display mt-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-body mt-2">
              Straightforward answers about our algorithms, privacy, and methodology.
            </p>
          </FadeInSection>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <FadeInSection key={idx} delay={idx * 0.05}>
                  <div className="rounded-2xl border border-slate-border overflow-hidden bg-canvas transition-colors">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-navy hover:text-emerald transition-colors"
                    >
                      <span className="text-sm md:text-base font-display">{item.q}</span>
                      <span className="shrink-0 text-slate-body">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-6 pb-5 pt-1 text-xs md:text-sm text-slate-body leading-relaxed border-t border-slate-border/50 bg-white"
                        >
                          {item.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Final CTA Banner */}
      <section className="py-16 md:py-24 bg-navy text-white relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald/20 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald/20 text-mint text-xs font-bold border border-emerald/40">
            Phase 1 MVP Live
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white">
            Check your career fit in 2 minutes
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop guessing whether you are qualified. Find your highest-fitting role, see the exact math, and conquer your priority skill gap this month.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigateToApp()}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald hover:bg-emerald-hover text-white font-bold text-sm shadow-glow-emerald flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <span>Launch KAABIL App Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-400">
            No credit card · Zero server uploads · Free client-side tool
          </p>
        </div>
      </section>

      {/* Multi-Column Footer */}
      <footer className="bg-navy-950 text-slate-400 py-14 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Col 1 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-emerald flex items-center justify-center text-white font-black text-sm">
                  K
                </div>
                <span className="font-display font-extrabold text-lg text-white">KAABIL</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                From Confusion to Career. Know your fit. See your gap. Follow your plan.
              </p>
              <div className="mt-4 text-xs font-semibold text-slate-300">
                Made in India 🇮🇳
              </div>
            </div>

            {/* Col 2: Product */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="/app" className="hover:text-white transition-colors">Skill Extractor</a></li>
                <li><a href="/app" className="hover:text-white transition-colors">Role Matcher</a></li>
                <li><a href="/app" className="hover:text-white transition-colors">Gap Analysis</a></li>
                <li><a href="/app" className="hover:text-white transition-colors">Adaptive Roadmap</a></li>
              </ul>
            </div>

            {/* Col 3: Resources */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">How it works</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Transparent Scoring</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Prerequisite Graphs</a></li>
                <li><a href="#simulation" className="hover:text-white transition-colors">Student Journeys</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Col 4: Founder */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Created by</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">
                Built by solo founder <strong>Harshit Chaudhary</strong> to empower Indian students with transparent career clarity.
              </p>
              <button
                onClick={() => onNavigateToApp()}
                className="mt-2 text-xs font-bold text-emerald hover:text-mint flex items-center gap-1"
              >
                <span>Launch App Workspace →</span>
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>
              © 2026 KAABIL · Built by Harshit Chaudhary. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <span>Client-Side Architecture</span>
              <span>Privacy Guaranteed</span>
              <span>Zero Backend Storage</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
