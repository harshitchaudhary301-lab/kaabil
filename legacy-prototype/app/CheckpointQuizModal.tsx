import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CheckCircle, AlertTriangle, HelpCircle, ArrowRight, 
  RotateCcw, Sparkles, Award, BookOpen 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getQuizForSkill, SkillQuiz } from '../../data/quizzes';
import { RoadmapWeek } from '../../engine/roadmapEngine';

interface CheckpointQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  week: RoadmapWeek | null;
  onCompleteQuiz: (score: number, total: number) => void;
}

export const CheckpointQuizModal: React.FC<CheckpointQuizModalProps> = ({
  isOpen,
  onClose,
  week,
  onCompleteQuiz
}) => {
  if (!isOpen || !week) return null;

  const quiz: SkillQuiz = getQuizForSkill(week.quizSkill);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setIsSubmitted(true);

    const percentage = Math.round((calculatedScore / quiz.questions.length) * 100);

    // Fire confetti for mastery score (>= 80%)
    if (percentage >= 80) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }

    onCompleteQuiz(calculatedScore, quiz.questions.length);
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === quiz.questions.length;
  const percentage = isSubmitted ? Math.round((score / quiz.questions.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl border border-slate-border shadow-2xl max-w-2xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-canvas border-b border-slate-border flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald bg-mint px-2.5 py-0.5 rounded-full border border-emerald/20">
                {week.weekLabel} Checkpoint Quiz
              </span>
              <span className="text-xs text-slate-body">5 Industry Multiple-Choice Questions</span>
            </div>
            <h3 className="text-xl font-bold text-navy font-display mt-1">
              {quiz.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-navy hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiz Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border ${
                percentage >= 80
                  ? 'bg-mint border-emerald/30 text-emerald'
                  : percentage >= 60
                  ? 'bg-gold/10 border-gold/30 text-gold-600'
                  : 'bg-terracotta-50 border-terracotta/30 text-terracotta'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {percentage >= 80
                      ? '🎉 Benchmark Mastered! (+18 Skill Boost)'
                      : percentage >= 60
                      ? '⚡ Review Recommended (+8 Skill Boost)'
                      : '⚠️ Score Below 60% — Practice Reinforcement Added'}
                  </div>
                  <div className="text-2xl font-black mt-1 font-display tabular-nums">
                    Score: {score} / {quiz.questions.length} ({percentage}%)
                  </div>
                  <p className="text-xs text-slate-dark mt-1">
                    {percentage >= 80
                      ? 'Outstanding! Your skill score increased and Week was unlocked.'
                      : percentage >= 60
                      ? 'Good effort! You can advance or retake anytime to polish nuances.'
                      : `KAABIL inserted a focused practice week (${week.weekLabel}b) before advancing to ensure you build rock-solid foundations.`}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Question List */}
          <div className="space-y-6">
            {quiz.questions.map((q, qIndex) => {
              const selectedOpt = selectedAnswers[qIndex];
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div key={q.id} className="p-4 rounded-2xl bg-canvas border border-slate-border">
                  <div className="text-xs font-semibold text-slate-body mb-1">
                    Question {qIndex + 1} of {quiz.questions.length}
                  </div>
                  <p className="text-sm font-bold text-navy mb-3">{q.question}</p>

                  <div className="space-y-2">
                    {q.options.map((option, optIndex) => {
                      let btnStyle = 'border-slate-border bg-white hover:border-slate-300 text-slate-dark';

                      if (isSubmitted) {
                        if (optIndex === q.correctIndex) {
                          btnStyle = 'border-emerald bg-mint text-emerald font-bold';
                        } else if (selectedOpt === optIndex) {
                          btnStyle = 'border-terracotta bg-terracotta-50 text-terracotta line-through';
                        } else {
                          btnStyle = 'border-slate-border opacity-50 text-slate-400';
                        }
                      } else if (selectedOpt === optIndex) {
                        btnStyle = 'border-emerald bg-mint/50 ring-2 ring-emerald/20 text-navy font-semibold';
                      }

                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleSelect(qIndex, optIndex)}
                          disabled={isSubmitted}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[11px] font-bold">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="leading-snug">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Show explanation after submission */}
                  {isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 p-3 rounded-xl bg-white border border-slate-border text-xs text-slate-dark"
                    >
                      <div className="font-bold text-navy flex items-center gap-1 mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-emerald" />
                        <span>Explanation:</span>
                      </div>
                      <p className="text-slate-body leading-relaxed">{q.explanation}</p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-canvas border-t border-slate-border flex items-center justify-between shrink-0">
          {!isSubmitted ? (
            <>
              <span className="text-xs text-slate-body">
                Answered: <strong>{answeredCount}</strong> of {quiz.questions.length}
              </span>
              <button
                onClick={handleSubmit}
                disabled={!isAllAnswered}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  isAllAnswered
                    ? 'bg-emerald text-white hover:bg-emerald-hover cursor-pointer shadow-glow-emerald'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Submit & View Results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRetake}
                className="px-4 py-2 rounded-xl border border-slate-border bg-white text-navy text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-navy text-white text-xs font-bold hover:bg-navy-800 transition-colors"
              >
                <span>Continue Roadmap</span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
