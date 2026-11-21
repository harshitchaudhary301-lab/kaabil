"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Send,
  Award,
  AlertCircle,
  HelpCircle,
  History,
  ShieldCheck,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV_ITEMS } from "@/components/student/student-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InterviewQuestionItem, MockInterviewSessionRecord } from "@/types/admin";

export default function StudentInterviewLabPage() {
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([]);
  const [pastSessions, setPastSessions] = useState<MockInterviewSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState<InterviewQuestionItem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [latestResult, setLatestResult] = useState<MockInterviewSessionRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"practice" | "history">("practice");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/interview-lab");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setQuestions(data.questions);
          setPastSessions(data.pastSessions);
          if (data.questions.length > 0 && !activeQuestion) {
            setActiveQuestion(data.questions[0]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load interview lab data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitAnswer = async () => {
    if (!activeQuestion || !userAnswer.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/interview-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          studentAnswer: userAnswer.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLatestResult(data.session);
        setPastSessions((prev) => [data.session, ...prev]);
        setUserAnswer("");
      }
    } catch (err) {
      console.error("Failed to submit response:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV_ITEMS}
      breadcrumbs={["Career Tools", "Interview Lab"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary">
                Interview Practice & Competency Lab
              </h1>
              <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                Rubric-Based AI Coach
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Stream-specific interview questions, structured STAR methodology coaching, and instant evaluation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "practice" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveTab("practice")}
              className="text-xs"
            >
              Practice Studio
            </Button>
            <Button
              variant={activeTab === "history" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveTab("history")}
              className="text-xs gap-1.5"
            >
              <History className="h-3.5 w-3.5" />
              Past Sessions ({pastSessions.length})
            </Button>
          </div>
        </div>

        {/* Responsible AI Guarantee */}
        <Card className="p-4 border-border bg-gradient-to-r from-blue-50/40 to-indigo-50/30">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-text-secondary leading-relaxed">
              <strong className="text-text-primary font-semibold">Ethical AI Guarantee: </strong>
              KAABIL evaluates practice interviews solely using structured competency and domain knowledge rubrics. Facial emotion detection, gaze tracking, and vocal pitch scoring are strictly prohibited to ensure an unbiased, inclusive learning environment.
            </div>
          </div>
        </Card>

        {activeTab === "history" ? (
          /* Past Practice Sessions Tab */
          <div className="space-y-4">
            {pastSessions.length === 0 ? (
              <Card className="p-12 text-center text-text-muted">
                No past interview practice sessions recorded yet. Start practicing below!
              </Card>
            ) : (
              pastSessions.map((session) => (
                <Card key={session.id} className="p-6 border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        {session.targetCareer} • {session.stream.replace(/_/g, " ")}
                      </span>
                      <h4 className="font-heading text-sm font-bold text-text-primary mt-0.5">
                        {session.questionText}
                      </h4>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-600">{session.score}/100</div>
                      <span className="text-[10px] text-text-muted">
                        {new Date(session.completedAt || session.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-border text-xs text-text-secondary">
                    <strong className="text-text-primary">Your Response: </strong>
                    {session.studentAnswer}
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs text-emerald-900 space-y-1">
                    <div>
                      <strong>Evaluation Feedback: </strong>
                      {session.feedback}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          /* Practice Studio Tab */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (4 cols): Question Bank */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xs font-bold uppercase text-text-muted tracking-wider">
                Select Interview Question ({questions.length})
              </h3>
              {loading ? (
                <Card className="p-8 text-center text-text-muted">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary mb-2" />
                  Loading question bank...
                </Card>
              ) : (
                <div className="space-y-2.5">
                  {questions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setActiveQuestion(q);
                        setLatestResult(null);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                        activeQuestion?.id === q.id
                          ? "bg-primary/5 border-primary shadow-sm"
                          : "bg-white border-border hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <Badge variant="outline" className="text-[10px]">
                          {q.targetCareer}
                        </Badge>
                        <Badge
                          variant={
                            q.difficulty === "BEGINNER"
                              ? "outline"
                              : q.difficulty === "INTERMEDIATE"
                              ? "warning"
                              : "default"
                          }
                          className="text-[10px]"
                        >
                          {q.difficulty}
                        </Badge>
                      </div>
                      <p className="font-semibold text-text-primary line-clamp-2 mt-1">
                        {q.questionText}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column (8 cols): Question Studio & Response Submission */}
            <div className="lg:col-span-8 space-y-5">
              {activeQuestion && (
                <Card className="p-6 border-border space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="default" className="text-xs">
                        {activeQuestion.targetCareer}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Category: {activeQuestion.category}
                      </Badge>
                    </div>
                    <h2 className="font-heading text-lg font-bold text-text-primary mt-2">
                      {activeQuestion.questionText}
                    </h2>
                  </div>

                  {/* Rubric hints */}
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <strong className="font-semibold">Key Competencies Evaluated: </strong>
                      {(activeQuestion.rubric || activeQuestion.modelAnswerOutline || []).join(", ")}
                    </div>
                  </div>

                  {/* Student Answer Textarea */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-text-primary">
                        Your Practice Response (STAR Format Recommended)
                      </label>
                      <span className="text-text-muted">
                        {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                    <textarea
                      className="w-full h-36 p-3 rounded-xl border border-border text-xs focus:outline-primary leading-relaxed"
                      placeholder="Outline your situation, task, specific actions taken, and measurable results achieved..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-text-muted">
                      Feedback generated instantly using rubric scoring
                    </span>
                    <Button
                      size="sm"
                      onClick={handleSubmitAnswer}
                      disabled={submitting || !userAnswer.trim()}
                      className="gap-2 bg-primary text-white text-xs px-4"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {submitting ? "Evaluating..." : "Submit for Evaluation"}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Evaluation Results Card */}
              {latestResult && (
                <Card className="p-6 border-emerald-200 bg-emerald-50/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Evaluation Results
                      </span>
                      <h3 className="font-heading text-lg font-bold text-text-primary">
                        Rubric Competency Assessment
                      </h3>
                    </div>
                    <div className="flex items-baseline gap-1 bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
                      <span className="text-2xl font-black text-emerald-600">{latestResult.score}</span>
                      <span className="text-xs text-text-muted font-bold">/100</span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed bg-white p-3 rounded-lg border border-border">
                    {latestResult.feedback}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Key Strengths
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        {latestResult.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        Recommendations for Mastery
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        {(latestResult.improvements || latestResult.areasToImprove || []).map((imp, idx) => (
                          <li key={idx}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
