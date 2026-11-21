import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, CheckCircle2, Lock, ExternalLink, HelpCircle, 
  Sparkles, AlertCircle, ArrowRight, RotateCcw, Clock, BookOpen, Check
} from 'lucide-react';
import { RoadmapWeek, RoadmapTask } from '../../engine/roadmapEngine';
import { RoleFitScore } from '../../engine/scoringEngine';
import { CheckpointQuizModal } from './CheckpointQuizModal';
import { AnimatedCounter } from '../motion/AnimatedCounter';

interface AdaptiveRoadmapProps {
  roadmap: RoadmapWeek[];
  activeRoleScore: RoleFitScore;
  weeklyHours: number;
  onToggleTask: (weekId: string, taskId: string) => void;
  onCompleteQuiz: (weekId: string, score: number, total: number) => void;
  onRegenerateRoadmap: () => void;
}

export const AdaptiveRoadmap: React.FC<AdaptiveRoadmapProps> = ({
  roadmap,
  activeRoleScore,
  weeklyHours,
  onToggleTask,
  onCompleteQuiz,
  onRegenerateRoadmap
}) => {
  const [activeQuizWeek, setActiveQuizWeek] = useState<RoadmapWeek | null>(null);

  // Calculate overall task progress
  const allTasks = roadmap.flatMap(w => w.tasks);
  const completedTasks = allTasks.filter(t => t.completed);
  const progressPercent = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Step Header & Live Role Fit Tracker */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-border shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint text-emerald text-xs font-semibold mb-2">
              <Calendar className="w-3.5 h-3.5 text-emerald" />
              <span>Step 3: Personalised Adaptive 4-Week Roadmap</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy font-display">
              Follow your plan for {activeRoleScore.role.title}
            </h2>
            <p className="text-sm text-slate-body mt-1 max-w-2xl">
              Sequenced by prerequisite logic and your highest-priority gaps. Each week includes curated drills, free tools, and a checkpoint quiz with live re-planning.
            </p>
          </div>

          {/* Live Fit & Progress Scorecard */}
          <div className="flex items-center gap-4 bg-canvas p-4 rounded-2xl border border-slate-border shrink-0">
            <div className="text-center px-2">
              <div className="text-[11px] font-bold text-slate-body uppercase tracking-wider">Live Role Fit</div>
              <div className="text-2xl md:text-3xl font-black text-emerald font-display">
                <AnimatedCounter value={activeRoleScore.fitPercentage} suffix="%" />
              </div>
            </div>
            <div className="h-8 w-px bg-slate-border" />
            <div className="text-center px-2">
              <div className="text-[11px] font-bold text-slate-body uppercase tracking-wider">Tasks Done</div>
              <div className="text-2xl md:text-3xl font-black text-navy font-display tabular-nums">
                {completedTasks.length}/{allTasks.length}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-border/80">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-body mb-2">
            <span>Roadmap Completion Progress</span>
            <span className="text-emerald font-bold">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      </div>

      {/* Week Cards Vertical Timeline */}
      <div className="space-y-6">
        {roadmap.map((week, weekIndex) => {
          const isLocked = week.status === 'locked';
          const isCompleted = week.status === 'completed';
          const isReview = week.status === 'review_recommended';
          const isReinforcement = week.isReinforcement;

          return (
            <motion.div
              key={week.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`rounded-3xl border transition-all duration-300 relative overflow-hidden ${
                isReinforcement
                  ? 'bg-amber-50/50 border-amber-300 shadow-md ring-2 ring-amber-400/20'
                  : isCompleted
                  ? 'bg-white border-emerald/40 shadow-sm'
                  : isLocked
                  ? 'bg-canvas border-slate-border/80 opacity-75'
                  : 'bg-white border-slate-border shadow-card hover:border-slate-300'
              }`}
            >
              {/* Card Top Strip */}
              <div className={`px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isReinforcement
                  ? 'bg-amber-100/60 border-amber-200 text-amber-900'
                  : isCompleted
                  ? 'bg-mint/40 border-emerald/20 text-emerald'
                  : 'bg-canvas border-slate-border text-navy'
              }`}>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                    isReinforcement
                      ? 'bg-amber-500 text-white'
                      : isCompleted
                      ? 'bg-emerald text-white'
                      : isLocked
                      ? 'bg-slate-300 text-slate-dark'
                      : 'bg-navy text-white'
                  }`}>
                    {week.weekLabel}
                  </span>
                  <span className="text-sm font-bold text-navy font-display">
                    {week.title}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-medium text-slate-body flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="tabular-nums">~{week.estimatedHours} hrs</span>
                  </span>

                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    isCompleted
                      ? 'bg-mint text-emerald border border-emerald/20'
                      : isReview
                      ? 'bg-gold/15 text-gold-600 border border-gold/30'
                      : isLocked
                      ? 'bg-slate-200 text-slate-500'
                      : 'bg-white text-navy border border-slate-border'
                  }`}>
                    {isCompleted
                      ? 'Completed ✓'
                      : isReview
                      ? 'Review Advised'
                      : isLocked
                      ? 'Locked'
                      : 'In Progress'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 space-y-6">
                {/* Reinforcement alert banner if applicable */}
                {isReinforcement && (
                  <div className="p-4 rounded-2xl bg-amber-100/70 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Adaptive Remediation Triggered: </span>
                      Score on the previous checkpoint was below 60%. KAABIL dynamically inserted this focused practice module to ensure mastery of {week.focusSkill} before you move on.
                    </div>
                  </div>
                )}

                {/* Objective */}
                <div>
                  <div className="text-xs font-bold text-slate-body uppercase tracking-wider mb-1">
                    Weekly Learning Objective
                  </div>
                  <p className="text-sm font-medium text-slate-dark leading-relaxed">
                    {week.objective}
                  </p>
                </div>

                {/* 3-4 Checkable Tasks */}
                <div>
                  <div className="text-xs font-bold text-slate-body uppercase tracking-wider mb-3">
                    Actionable Milestone Tasks
                  </div>
                  <div className="space-y-2.5">
                    {week.tasks.map(task => (
                      <button
                        key={task.id}
                        disabled={isLocked}
                        onClick={() => onToggleTask(week.id, task.id)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                          task.completed
                            ? 'bg-mint/40 border-emerald/30 text-emerald'
                            : isLocked
                            ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-400'
                            : 'bg-canvas hover:bg-white hover:border-slate-300 border-slate-border text-slate-dark'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          task.completed
                            ? 'bg-emerald border-emerald text-white'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {task.completed && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 text-xs font-medium leading-snug">
                          <span className={task.completed ? 'line-through text-slate-body' : ''}>
                            {task.title}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-body shrink-0 tabular-nums">
                          {task.hours}h
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Free Resource Links & Quiz Action Row */}
                <div className="pt-4 border-t border-slate-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Curated Resources */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-body flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald" />
                      <span>Free Curated Learning Resources:</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {week.resources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-canvas hover:bg-slate-200 border border-slate-border text-xs font-medium text-navy transition-colors"
                        >
                          <span>{res.name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Quiz Button */}
                  <div className="shrink-0">
                    {isLocked ? (
                      <button
                        disabled
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-400 text-xs font-bold border border-slate-200 cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock via Week {weekIndex} Quiz</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveQuizWeek(week)}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          isCompleted
                            ? 'bg-mint text-emerald hover:bg-mint-200 border border-emerald/30'
                            : 'bg-emerald text-white hover:bg-emerald-hover shadow-glow-emerald'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {week.quizResult
                            ? `Retake Checkpoint Quiz (${week.quizResult.percentage}%)`
                            : 'Take Checkpoint Quiz (5 MCQs)'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quiz Modal */}
      <CheckpointQuizModal
        isOpen={Boolean(activeQuizWeek)}
        onClose={() => setActiveQuizWeek(null)}
        week={activeQuizWeek}
        onCompleteQuiz={(score, total) => {
          if (activeQuizWeek) {
            onCompleteQuiz(activeQuizWeek.id, score, total);
          }
        }}
      />
    </div>
  );
};
