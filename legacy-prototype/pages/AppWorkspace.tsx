import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, RotateCcw, Sparkles, CheckCircle2, ChevronRight, 
  FileText, BarChart2, Calendar, Award, Zap, AlertTriangle 
} from 'lucide-react';
import { ProfileOnboarding } from '../components/app/ProfileOnboarding';
import { DashboardRoleFit } from '../components/app/DashboardRoleFit';
import { AdaptiveRoadmap } from '../components/app/AdaptiveRoadmap';
import { CAREER_ROLES, CareerRole } from '../data/roles';
import { UserSkillProfile, rankAllRoles, calculateRoleFit, RoleFitScore } from '../engine/scoringEngine';
import { 
  RoadmapWeek, 
  generateAdaptiveRoadmap, 
  insertReinforcementWeek 
} from '../engine/roadmapEngine';
import { SAMPLE_RESUME_TEXT } from '../engine/nlpExtractor';

interface ToastMessage {
  id: string;
  type: 'boost' | 'reinforcement' | 'info';
  title: string;
  description: string;
}

interface AppWorkspaceProps {
  initialSearchQuery?: string;
  onNavigateHome: () => void;
}

const STORAGE_KEY_PROFILE = 'kaabil_user_profile_v1';
const STORAGE_KEY_ROADMAP = 'kaabil_user_roadmap_v1';

export const AppWorkspace: React.FC<AppWorkspaceProps> = ({
  initialSearchQuery,
  onNavigateHome
}) => {
  // Current active step: 1 = Profile & Resume, 2 = Role Fit & Gaps, 3 = Adaptive Roadmap
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // User profile states
  const [skills, setSkills] = useState<UserSkillProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.skills) return parsed.skills;
      } catch (e) {}
    }
    // Default starter profile: Data Analyst Aspirant
    return {
      'Python': 60,
      'SQL': 45,
      'Statistics': 35,
      'Communication': 55,
      'Projects': 30,
      'Excel': 50
    };
  });

  const [rawText, setRawText] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.rawText) return parsed.rawText;
      } catch (e) {}
    }
    return SAMPLE_RESUME_TEXT;
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedInterests) return parsed.selectedInterests;
      } catch (e) {}
    }
    return ['Data & Analytics', 'Problem Solving', 'Dashboards'];
  });

  const [weeklyHours, setWeeklyHours] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.weeklyHours) return parsed.weeklyHours;
      } catch (e) {}
    }
    return 10;
  });

  const [activeRoleId, setActiveRoleId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.activeRoleId) return parsed.activeRoleId;
      } catch (e) {}
    }
    return 'data-analyst';
  });

  const [roadmap, setRoadmap] = useState<RoadmapWeek[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ROADMAP);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Show a notification toast
  const showToast = (type: 'boost' | 'reinforcement' | 'info', title: string, description: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // If landing page passed a search query (e.g., "Business Analyst" or "B.Com"), select best role
  useEffect(() => {
    if (initialSearchQuery) {
      const q = initialSearchQuery.toLowerCase();
      const matched = CAREER_ROLES.find(
        r => r.title.toLowerCase().includes(q) || r.keywords.some(k => k.includes(q))
      );
      if (matched) {
        setActiveRoleId(matched.id);
        setCurrentStep(2);
      }
    }
  }, [initialSearchQuery]);

  // Persist profile to localStorage
  useEffect(() => {
    const dataToSave = {
      skills,
      rawText,
      selectedInterests,
      weeklyHours,
      activeRoleId
    };
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(dataToSave));
  }, [skills, rawText, selectedInterests, weeklyHours, activeRoleId]);

  // Persist roadmap to localStorage
  useEffect(() => {
    if (roadmap && roadmap.length > 0) {
      localStorage.setItem(STORAGE_KEY_ROADMAP, JSON.stringify(roadmap));
    }
  }, [roadmap]);

  // Active role object
  const activeRole = CAREER_ROLES.find(r => r.id === activeRoleId) || CAREER_ROLES[0];

  // Live evaluate all roles
  const rankedRoles = rankAllRoles(skills, rawText, selectedInterests);
  const activeRoleScore = rankedRoles.find(r => r.role.id === activeRole.id) || rankedRoles[0];

  // Auto-generate roadmap when entering step 3 if not yet generated or when role changes
  useEffect(() => {
    if (currentStep === 3) {
      if (!roadmap || roadmap.length === 0 || (roadmap[0] && !activeRole.skillRequirements.some(r => r.skill === roadmap[0].focusSkill))) {
        const generated = generateAdaptiveRoadmap(activeRole, activeRoleScore.criticalGaps, weeklyHours);
        setRoadmap(generated);
      }
    }
  }, [currentStep, activeRoleId]);

  const handleRoleSelect = (role: CareerRole) => {
    setActiveRoleId(role.id);
    const newRoadmap = generateAdaptiveRoadmap(role, activeRoleScore.criticalGaps, weeklyHours);
    setRoadmap(newRoadmap);
    showToast('info', `Switched to ${role.title}`, `Re-evaluating skill gaps and adaptive weekly milestones.`);
  };

  const handleTrySampleProfile = () => {
    const sampleSkills: UserSkillProfile = {
      'Python': 60,
      'SQL': 45,
      'Statistics': 35,
      'Communication': 55,
      'Projects': 30,
      'Excel': 50
    };
    setSkills(sampleSkills);
    setRawText(SAMPLE_RESUME_TEXT);
    setSelectedInterests(['Data & Analytics', 'Problem Solving', 'Dashboards']);
    setWeeklyHours(10);
    setActiveRoleId('data-analyst');
    const newScore = calculateRoleFit(
      CAREER_ROLES[0],
      sampleSkills,
      SAMPLE_RESUME_TEXT,
      ['Data & Analytics', 'Problem Solving', 'Dashboards']
    );
    const newRoadmap = generateAdaptiveRoadmap(CAREER_ROLES[0], newScore.criticalGaps, 10);
    setRoadmap(newRoadmap);
    setCurrentStep(2);
    showToast('info', 'Loaded Sample Profile', 'Aarav Mehta (Data Analyst Aspirant) profile successfully loaded.');
  };

  const handleReset = () => {
    if (window.confirm('Reset all skills, resume text, and progress back to defaults?')) {
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_ROADMAP);
      setSkills({});
      setRawText('');
      setSelectedInterests([]);
      setWeeklyHours(10);
      setRoadmap([]);
      setCurrentStep(1);
      showToast('info', 'Workspace Reset', 'Your profile and roadmap have been cleared.');
    }
  };

  const handleToggleTask = (weekId: string, taskId: string) => {
    setRoadmap(prev =>
      prev.map(week => {
        if (week.id !== weekId) return week;
        return {
          ...week,
          tasks: week.tasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
        };
      })
    );
  };

  // Live re-planning upon quiz completion
  const handleCompleteQuiz = (weekId: string, score: number, total: number) => {
    const percentage = Math.round((score / total) * 100);
    const weekIndex = roadmap.findIndex(w => w.id === weekId);
    if (weekIndex === -1) return;

    const currentWeek = roadmap[weekIndex];
    const skillName = currentWeek.quizSkill;
    const req = activeRole.skillRequirements.find(r => r.skill === skillName);
    const targetBenchmark = req ? req.required : 80;

    let updatedRoadmap = [...roadmap];

    if (percentage < 60) {
      // RULE 1: Score < 60%: amber banner + insert reinforcement week
      updatedRoadmap[weekIndex] = {
        ...currentWeek,
        status: 'unlocked',
        quizResult: { score, total, percentage, passed: false, timestamp: new Date().toISOString() }
      };

      updatedRoadmap = insertReinforcementWeek(updatedRoadmap, weekIndex, skillName);
      setRoadmap(updatedRoadmap);

      showToast(
        'reinforcement',
        'Reinforcement Week Added!',
        `Score was ${percentage}%. KAABIL dynamically inserted "${currentWeek.weekLabel}b: ${skillName} Foundations" to build strong intuition.`
      );
    } else if (percentage < 80) {
      // RULE 2: 60-79%: review recommended, +8 skill boost, allow advance
      const currentLevel = skills[skillName] || 40;
      const boosted = Math.min(targetBenchmark, currentLevel + 8);

      const nextSkills = { ...skills, [skillName]: boosted };
      setSkills(nextSkills);

      updatedRoadmap[weekIndex] = {
        ...currentWeek,
        status: 'review_recommended',
        quizResult: { score, total, percentage, passed: true, timestamp: new Date().toISOString() }
      };

      // Unlock next week
      if (weekIndex + 1 < updatedRoadmap.length) {
        updatedRoadmap[weekIndex + 1].status = 'unlocked';
      }

      setRoadmap(updatedRoadmap);

      showToast(
        'boost',
        `+8 Skill Boost on ${skillName}!`,
        `Comfort level elevated to ${boosted}/100. Next week unlocked.`
      );
    } else {
      // RULE 3: >= 80%: completed, +18 skill boost (capped at benchmark), live recalculate & unlock next
      const currentLevel = skills[skillName] || 40;
      const boosted = Math.min(targetBenchmark, currentLevel + 18);

      const nextSkills = { ...skills, [skillName]: boosted };
      setSkills(nextSkills);

      updatedRoadmap[weekIndex] = {
        ...currentWeek,
        status: 'completed',
        quizResult: { score, total, percentage, passed: true, timestamp: new Date().toISOString() }
      };

      // Unlock next week
      if (weekIndex + 1 < updatedRoadmap.length) {
        updatedRoadmap[weekIndex + 1].status = 'unlocked';
      }

      setRoadmap(updatedRoadmap);

      showToast(
        'boost',
        `🎉 Mastered! +18 Skill Boost on ${skillName}`,
        `${skillName} increased to ${boosted}/100! Role Fit recalculated live.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-dark pb-20">
      {/* Sticky Workspace Header & Step Switcher */}
      <header className="sticky top-0 z-40 glass-nav border-b border-slate-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Back button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onNavigateHome}
              className="p-2 rounded-xl text-slate-body hover:text-navy hover:bg-slate-100 transition-colors"
              title="Return to Landing Page"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald flex items-center justify-center text-white font-black text-sm">
                K
              </div>
              <span className="font-display font-extrabold text-lg text-navy tracking-tight hidden sm:inline">
                KAABIL <span className="text-xs font-semibold text-slate-body">/ Workspace</span>
              </span>
            </div>
          </div>

          {/* Sticky 3-Step Switcher Pills */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-border">
            <button
              onClick={() => setCurrentStep(1)}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentStep === 1
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-slate-body hover:text-navy'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-200 text-navy flex items-center justify-center text-[10px]">1</span>
              <span>Profile</span>
            </button>

            <button
              onClick={() => setCurrentStep(2)}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentStep === 2
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-slate-body hover:text-navy'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-200 text-navy flex items-center justify-center text-[10px]">2</span>
              <span>Role Fit & Gaps</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentStep === 3
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-slate-body hover:text-navy'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-200 text-navy flex items-center justify-center text-[10px]">3</span>
              <span>Roadmap</span>
            </button>
          </div>

          {/* Quick Demo & Reset Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all"
              title="Watch 5-Second Brand Intro"
            >
              <Zap className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>5s Intro</span>
            </button>
            <button
              onClick={handleTrySampleProfile}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald bg-mint hover:bg-emerald/10 border border-emerald/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sample Profile</span>
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-body hover:text-terracotta hover:bg-slate-100 transition-colors"
              title="Reset Workspace"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileOnboarding
                skills={skills}
                rawText={rawText}
                selectedInterests={selectedInterests}
                weeklyHours={weeklyHours}
                onUpdateSkills={setSkills}
                onUpdateRawText={setRawText}
                onUpdateInterests={setSelectedInterests}
                onUpdateWeeklyHours={setWeeklyHours}
                onProceedToFit={() => setCurrentStep(2)}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <DashboardRoleFit
                rankedRoles={rankedRoles}
                activeRoleScore={activeRoleScore}
                onSelectRole={handleRoleSelect}
                onProceedToRoadmap={() => setCurrentStep(3)}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AdaptiveRoadmap
                roadmap={roadmap}
                activeRoleScore={activeRoleScore}
                weeklyHours={weeklyHours}
                onToggleTask={handleToggleTask}
                onCompleteQuiz={handleCompleteQuiz}
                onRegenerateRoadmap={() => {
                  const gen = generateAdaptiveRoadmap(activeRole, activeRoleScore.criticalGaps, weeklyHours);
                  setRoadmap(gen);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Notification Toasts */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`p-4 rounded-2xl shadow-xl max-w-sm pointer-events-auto border flex items-start gap-3 ${
                toast.type === 'boost'
                  ? 'bg-emerald text-white border-emerald-700'
                  : toast.type === 'reinforcement'
                  ? 'bg-terracotta text-white border-terracotta-700'
                  : 'bg-navy text-white border-navy-800'
              }`}
            >
              {toast.type === 'boost' && <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-mint" />}
              {toast.type === 'reinforcement' && <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-200" />}
              {toast.type === 'info' && <Zap className="w-5 h-5 shrink-0 mt-0.5 text-emerald" />}

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">{toast.title}</h4>
                <p className="text-xs mt-0.5 text-white/90 leading-snug">{toast.description}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
