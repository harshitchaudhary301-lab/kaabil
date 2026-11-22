"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Send,
  HelpCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AssessmentTakingPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selectedOptionKey: string }>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    initAttempt();
  }, [assessmentId]);

  // Timer countdown
  useEffect(() => {
    if (!assessment || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [assessment, secondsRemaining]);

  async function initAttempt() {
    setLoading(true);
    try {
      // 1. Fetch sanitized assessment details
      const asmRes = await fetch(`/api/student/assessments/${assessmentId}`);
      if (!asmRes.ok) throw new Error("Assessment not found");
      const asmData = await asmRes.json();
      setAssessment(asmData.assessment);
      setSecondsRemaining((asmData.assessment.durationMinutes || 15) * 60);

      // 2. Start attempt
      const startRes = await fetch(`/api/student/assessments/${assessmentId}/start`, {
        method: "POST",
      });
      if (startRes.ok) {
        const startData = await startRes.json();
        setAttemptId(startData.attempt?.id || `att-${Date.now()}`);
      }
    } catch (err) {
      console.error("[AssessmentTakingPage] Failed to initialize attempt:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectOption(questionId: string, optionKey: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { selectedOptionKey: optionKey },
    }));
  }

  async function handleSubmit() {
    if (!attemptId || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/student/assessments/${assessmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/student/assessments/results/${attemptId}`);
      } else {
        throw new Error("Submission evaluation failed");
      }
    } catch (err) {
      console.error("[AssessmentTakingPage] Submit error:", err);
      alert("Failed to submit assessment. Please check your connection and retry.");
      setSubmitting(false);
    }
  }

  function handleAutoSubmit() {
    alert("Time limit reached. Submitting assessment now.");
    handleSubmit();
  }

  if (loading || !assessment) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-xs text-slate-500">Preparing secure assessment environment...</p>
        </div>
      </div>
    );
  }

  const currentQ = assessment.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = assessment.questions.length;
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Test Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-center gap-3">
          <Link
            href="/student/assessments"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Exit</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {assessment.title}
            </h1>
            <span className="text-[11px] text-slate-400">
              Skill: {assessment.targetSkillName} • {assessment.category.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-mono font-bold ${
              secondsRemaining < 180
                ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/30"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{timeFormatted}</span>
          </div>

          <Button
            size="sm"
            onClick={() => setShowConfirmSubmit(true)}
            className="bg-primary hover:bg-primary/90 text-xs gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Finish Test</span>
          </Button>
        </div>
      </header>

      {/* Main Test Layout */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Question Navigator */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500">
            Progress: <span className="font-bold text-slate-800 dark:text-slate-200">{answeredCount} of {totalQuestions} answered</span>
          </div>
          <div className="flex gap-2">
            {assessment.questions.map((q: any, idx: number) => {
              const isCurrent = idx === currentQuestionIndex;
              const isAnswered = !!answers[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? "ring-2 ring-primary ring-offset-2 bg-primary text-white"
                      : isAnswered
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Question Card */}
        <Card className="border-slate-200 shadow-xs dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </Badge>
              <Badge variant="secondary" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {currentQ.points} Points
              </Badge>
            </div>

            <CardTitle className="mt-4 text-base sm:text-lg font-bold leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
              {currentQ.questionText}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Select one correct option:
            </div>

            {currentQ.options.map((opt: any) => {
              const isSelected = answers[currentQ.id]?.selectedOptionKey === opt.optionKey;
              return (
                <button
                  key={opt.optionKey}
                  onClick={() => handleSelectOption(currentQ.id, opt.optionKey)}
                  className={`flex w-full items-start gap-3.5 rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary dark:bg-primary/10"
                      : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isSelected
                        ? "bg-primary text-white"
                        : "border border-slate-400 bg-slate-100 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {opt.optionKey}
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed mt-0.5 text-slate-900 dark:text-slate-100 font-medium">
                    {opt.optionText}
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            className="text-xs gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </Button>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button
              size="sm"
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="bg-primary hover:bg-primary/90 text-xs gap-1.5"
            >
              <span>Next Question</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setShowConfirmSubmit(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
            >
              <span>Review & Submit</span>
              <Send className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Submit Assessment for Evaluation?
            </h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              You have answered <span className="font-bold text-slate-800 dark:text-slate-200">{answeredCount} of {totalQuestions}</span> questions. Once submitted, your answers will be automatically evaluated, and verified skill credentials will be minted if you meet the {assessment.passingPercentage}% passing threshold.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmSubmit(false)}
                disabled={submitting}
              >
                Back to Questions
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-primary hover:bg-primary/90"
              >
                {submitting ? "Evaluating..." : "Confirm & Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
