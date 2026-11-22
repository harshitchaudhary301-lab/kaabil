"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BrainCircuit,
  Compass,
  Award,
  Sparkles,
  Scale,
  Settings,
  Send,
  Bot,
  User,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Square,
  ChevronRight,
  Info,
  ShieldCheck,
  ShieldAlert,
  Target,
  BookOpen,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Globe,
  SlidersHorizontal,
  X,
  FileBadge,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Clock,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STREAM_STARTER_QUESTIONS: Record<string, string[]> = {
  MEDICAL_PCB: [
    "What is the verified starting salary benchmark for an MBBS Doctor in India?",
    "How should I balance NEET-UG prep with Class 12 board exams?",
    "What are high-growth clinical healthcare careers if I don't get an MBBS seat?",
    "Compare MBBS vs BDS in terms of course duration, exams, and career scope.",
  ],
  NON_MEDICAL_PCM: [
    "What is the official entrance exam and eligibility criteria for AI Systems Engineer?",
    "Compare AI Systems Engineer vs Data Scientist in terms of industry roles.",
    "What are my critical skill gaps and how do I verify them through assessments?",
    "What should I study today from my active learning sprint?",
  ],
  COMMERCE: [
    "What is the complete statutory roadmap to clear CA Foundation on the first attempt?",
    "What are the government salary benchmarks for Chartered Accountants (ICAI)?",
    "Compare Chartered Accountancy (CA) vs Investment Banking.",
    "Which digital certifications best complement a B.Com degree in India?",
  ],
  ARTS_HUMANITIES: [
    "What is the verified eligibility and examination pathway for Civil Services (UPSC IAS)?",
    "What are verified alternative career options if I don't clear the Civil Services exam?",
    "How do I build a portfolio for Policy Research and Public Administration?",
    "Which practical skills make a Humanities graduate stand out in policy think-tanks?",
  ],
  LAW: [
    "What is the eligibility criteria and syllabus for CLAT under the Bar Council of India (BCI)?",
    "Compare Corporate Technology Law vs Litigation in Indian courts.",
    "How important are moot courts, legal drafting, and internships during law school?",
    "What are the alternative career options for law graduates outside courtroom litigation?",
  ],
  CREATIVE_ARTS_DESIGN: [
    "What are the entrance requirements and eligibility for NID DAT and UCEED?",
    "How do I build a UI/UX design case study that gets attention from product startups?",
    "What starting salary can a fresher UI/UX Designer expect based on industry benchmarks?",
    "What is my next priority project to build practical evidence in my portfolio?",
  ],
  VOCATIONAL_SKILLED: [
    "Which government skill certifications under NSDC offer the highest placement rates?",
    "What apprenticeships lead directly to certified industrial mechatronics technician roles?",
    "How do I upgrade from basic electrical skills to certified Solar PV Grid specialist?",
    "What is the typical starting salary for an ITI / Polytechnic Diploma graduate?",
  ],
  AGRICULTURE: [
    "What are the entrance exams and eligibility for B.Sc. Agriculture (ICAR AIEEA)?",
    "What is the career scope and salary for Precision Agronomists in Indian AgTech?",
    "What are viable alternative careers in Food Processing and Dairy Technology?",
    "What practical project can I build to demonstrate crop monitoring skills?",
  ],
  DEFAULT: [
    "Review my active learning sprint and suggest today's priority task.",
    "What is the verified starting salary and regulatory body for my target career?",
    "Which skill gap should I verify first to boost my Career Readiness Index?",
    "What are strong alternative career pathways matching my stream?",
  ],
};

export default function AiMentorPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [context, setContext] = useState<any>(null);
  const [aiEngineStatus, setAiEngineStatus] = useState<any>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeProposal, setActiveProposal] = useState<any | null>(null);
  const [showEngineInfo, setShowEngineInfo] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function loadInitialData() {
    setLoading(true);
    try {
      // 1. Fetch conversations & engine status
      const convRes = await fetch("/api/student/mentor/conversations");
      if (convRes.ok) {
        const convData = await convRes.json();
        const convList = convData.conversations || [];
        setConversations(convList);
        if (convList.length > 0) {
          setActiveConvId(convList[0].id);
        }
        if (convData.aiEngineStatus) {
          setAiEngineStatus(convData.aiEngineStatus);
        }
      }

      // 2. Fetch live context
      const ctxRes = await fetch("/api/student/mentor/context");
      if (ctxRes.ok) {
        const ctxData = await ctxRes.json();
        setContext(ctxData.context || null);
        if (ctxData.aiEngineStatus) {
          setAiEngineStatus(ctxData.aiEngineStatus);
        }
      }
    } catch (err) {
      console.error("[AiMentorPage] Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(convId: string) {
    try {
      const res = await fetch(`/api/student/mentor/conversations/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("[AiMentorPage] Failed to load messages:", err);
    }
  }

  async function handleNewConversation() {
    try {
      const res = await fetch("/api/student/mentor/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setConversations([data.conversation, ...conversations]);
          setActiveConvId(data.conversation.id);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("[AiMentorPage] Failed to create new conversation:", err);
    }
  }

  async function handleDeleteConversation(convId: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/student/mentor/conversations/${convId}`, { method: "DELETE" });
      if (res.ok) {
        const updated = conversations.filter((c) => c.id !== convId);
        setConversations(updated);
        if (activeConvId === convId) {
          setActiveConvId(updated.length > 0 ? updated[0].id : null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("[AiMentorPage] Failed to delete conversation:", err);
    }
  }

  async function handleSendMessage(contentToSend?: string) {
    const text = (contentToSend || inputMessage).trim();
    if (!text || sending) return;

    setInputMessage("");
    setSending(true);

    let targetConvId = activeConvId;

    // Create a new conversation if none active
    if (!targetConvId) {
      try {
        const createRes = await fetch("/api/student/mentor/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initialMessage: text, language }),
        });
        if (createRes.ok) {
          const createData = await createRes.json();
          if (createData.conversation) {
            targetConvId = createData.conversation.id;
            setConversations([createData.conversation, ...conversations]);
            setActiveConvId(targetConvId);
            setMessages(createData.conversation.messages || []);
            if (createData.aiEngineStatus) {
              setAiEngineStatus(createData.aiEngineStatus);
            }
            setSending(false);
            return;
          }
        }
      } catch (err) {
        console.error("[AiMentorPage] Error creating conversation:", err);
        setSending(false);
        return;
      }
    }

    // Optimistic user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender: "STUDENT",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/student/mentor/conversations/${targetConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, language }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.mentorReply) {
          setMessages((prev) => [
            ...prev.filter((m) => m.id !== tempUserMsg.id),
            data.userMessage,
            data.mentorReply,
          ]);

          if (data.aiEngineStatus) {
            setAiEngineStatus(data.aiEngineStatus);
          }

          // Update conversation in sidebar
          setConversations((prev) =>
            prev.map((c) => (c.id === targetConvId ? { ...c, updatedAt: new Date().toISOString() } : c))
          );
        }
      }
    } catch (err) {
      console.error("[AiMentorPage] Error sending message:", err);
    } finally {
      setSending(false);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const starterQuestions =
    STREAM_STARTER_QUESTIONS[context?.currentStream] || STREAM_STARTER_QUESTIONS.DEFAULT;

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Dashboard", "AI Career Mentor"]}
    >
      <div className="flex h-[calc(100vh-8.5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* LEFT SIDEBAR: Conversations List */}
        <div className="hidden w-72 flex-col border-r border-slate-200 bg-slate-50/50 p-3 md:flex dark:border-slate-800 dark:bg-slate-900/50">
          <Button
            onClick={handleNewConversation}
            className="mb-3 w-full justify-start gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>New Consultation</span>
          </Button>

          {/* Language Selector */}
          <div className="mb-3 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-800">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span>Language / भाषा</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Trilingual</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(["en", "hi", "hinglish"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`rounded py-1 text-xs font-medium transition-colors ${
                    language === lang
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {lang === "en" ? "English" : lang === "hi" ? "हिन्दी" : "Hinglish"}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Recent Sessions
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No past consultations yet. Start one above!
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
                      isActive
                        ? "bg-primary/10 font-medium text-primary dark:bg-primary/20"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{conv.title || "Career Consultation"}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-0.5"
                      title="Delete consultation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Context Summary on Bottom */}
          {context && (
            <div className="mt-auto border-t border-slate-200 pt-3 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>CRI Readiness:</span>
                <span className="font-bold text-primary">
                  {context.isUnassessed ? "Unassessed" : `${context.criScore}/100`}
                </span>
              </div>
              <div className="truncate text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                {context.targetCareer}
              </div>
              {context.isMinor && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400">
                  <ShieldCheck className="h-3 w-3" />
                  <span>DPDP Act Minor Shield Active</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MAIN CHAT AREA */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Chat Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    KAABIL Universal AI Career Mentor
                  </h2>
                  {/* Dynamic Engine Indicator */}
                  {aiEngineStatus?.liveAvailable ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200 gap-1 dark:bg-emerald-950/40 dark:text-emerald-400"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Gemini 2.0 Flash AI
                    </Badge>
                  ) : (
                    <div className="relative inline-block">
                      <Badge
                        onClick={() => setShowEngineInfo(!showEngineInfo)}
                        variant="outline"
                        className="cursor-pointer text-[10px] text-purple-700 bg-purple-50 border-purple-200 gap-1 hover:bg-purple-100 transition-colors dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                      >
                        <ShieldCheck className="h-3 w-3 text-purple-600" />
                        <span>Deterministic Knowledge Engine (Safe & Verified)</span>
                      </Badge>
                      {showEngineInfo && (
                        <div className="absolute top-7 left-0 z-50 w-72 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                            <span>Zero-Hallucination Fallback</span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            Operating in deterministic mode using KAABIL&apos;s verified 134-stream career database. All regulatory criteria, entrance exams, and salary benchmarks are 100% verified and hallucination-free.
                          </p>
                          <button
                            onClick={() => setShowEngineInfo(false)}
                            className="mt-2 text-[10px] text-primary hover:underline font-medium"
                          >
                            Close info
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Calibrated for {context?.streamLabel || context?.currentStream?.replace(/_/g, " ") || "All 13 Streams"} • Trilingual (EN / हिन्दी / Hinglish)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDrawer(!showDrawer)}
                className={`gap-1.5 text-xs ${showDrawer ? "border-primary bg-primary/5 text-primary" : ""}`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Student Context</span>
              </Button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 ? (
              <div className="mx-auto max-w-xl py-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Welcome, {context?.studentName || "Scholar"}!
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                  I am your personalized AI Career Mentor, grounded in your Digital Twin, learning roadmap, and verified Indian career benchmarks.
                </p>

                {/* Quick Context Summary Card */}
                {context && (
                  <div className="mt-4 mx-auto max-w-md rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-left text-xs dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-medium">Target Pathway:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {context.targetCareer}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-500">Stream:</span>
                      <Badge variant="outline" className="text-[10px]">
                        {context.streamLabel || context.currentStream?.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    {context.activeSprintTask && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-start gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-[11px] text-slate-600 dark:text-slate-300">
                          Active Task: <strong>{context.activeSprintTask.title}</strong> (~{context.activeSprintTask.estimatedMinutes} mins)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Stream Starter Questions */}
                <div className="mt-6 text-left">
                  <div className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Recommended starter questions for {context?.streamLabel || "your trajectory"}:
                  </div>
                  <div className="space-y-2">
                    {starterQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-left text-xs font-medium text-slate-700 transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300"
                      >
                        <span>{q}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.sender === "STUDENT";
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? "bg-primary text-white"
                          : "border border-slate-200 bg-slate-50/80 text-slate-800 shadow-xs dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {/* Message Content */}
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Verified Source Badges if available */}
                      {!isUser && msg.verifiedSources && msg.verifiedSources.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Verified Citations:
                          </span>
                          {msg.verifiedSources.map((source: string, sIdx: number) => (
                            <Badge
                              key={sIdx}
                              variant="outline"
                              className="text-[10px] bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                            >
                              {source}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Action Proposal Card if present */}
                      {!isUser && msg.actionProposal && (
                        <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3 dark:bg-primary/10">
                          <div className="flex items-center gap-1.5 font-semibold text-primary">
                            <Target className="h-3.5 w-3.5" />
                            <span>Actionable Proposal: {msg.actionProposal.title}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                            {msg.actionProposal.description}
                          </p>
                          <div className="mt-2.5 flex items-center gap-2">
                            {msg.actionProposal.actionUrl ? (
                              <Link href={msg.actionProposal.actionUrl}>
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-primary hover:bg-primary/90 gap-1"
                                >
                                  <span>{msg.actionProposal.actionText || "Take Action"}</span>
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-primary hover:bg-primary/90"
                                onClick={() => setActiveProposal(msg.actionProposal)}
                              >
                                Review Proposal
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Message Footer */}
                      {!isUser && (
                        <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-1.5 text-[10px] text-slate-400 dark:border-slate-700/60">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                            {msg.source === "gemini_2_flash"
                              ? "Live Gemini 2.0 Flash AI"
                              : "KAABIL Deterministic Knowledge Engine"}
                          </span>
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="flex items-center gap-1 hover:text-slate-600 transition-colors dark:hover:text-slate-200"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {sending && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-ping rounded-full bg-primary" />
                    <span>Analyzing verified career records, skill gaps & learning progress...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="border-t border-slate-200 p-3 sm:p-4 dark:border-slate-800">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs focus-within:border-primary dark:border-slate-800 dark:bg-slate-800">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  language === "hi"
                    ? "करियर, पात्रता, वेतन, प्रवेश परीक्षा या रोडमैप के बारे में यहाँ पूछें..."
                    : language === "hinglish"
                    ? "Apna career doubt, eligibility, salary benchmark ya roadmap question yahan type karein..."
                    : "Ask about career trajectories, verified eligibility, exam roadmaps, or skill gaps..."
                }
                rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-1.5 text-xs sm:text-sm outline-hidden"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={sending || !inputMessage.trim()}
                size="sm"
                className="h-8 w-8 shrink-0 rounded-lg p-0 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span>Press Enter to send, Shift + Enter for new line</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Zero-hallucination verified records
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT DRAWER: Live Student Context */}
        {showDrawer && context && (
          <div className="w-80 border-l border-slate-200 bg-slate-50/50 p-4 overflow-y-auto dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300 flex items-center gap-1.5">
                <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                <span>Live Student Context</span>
              </h3>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target Career & Readiness Meter */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-800">
              <div className="text-[11px] text-slate-400">Target Career Pathway</div>
              <div className="font-bold text-sm text-slate-800 dark:text-slate-100 mt-0.5">
                {context.targetCareer}
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                <Badge variant="outline" className="text-[10px]">
                  {context.streamLabel || context.currentStream?.replace(/_/g, " ")}
                </Badge>
                {context.targetCareerVerified?.regulatoryBody && (
                  <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-800">
                    {context.targetCareerVerified.regulatoryBody}
                  </Badge>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-700">
                <span className="text-xs text-slate-500">Career Readiness (CRI):</span>
                <span className="text-sm font-extrabold text-primary">
                  {context.isUnassessed ? "Unassessed" : `${context.criScore}/100`}
                </span>
              </div>
            </div>

            {/* Today's Sprint Task */}
            {context.activeSprintTask && (
              <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 dark:bg-primary/10">
                <div className="flex items-center justify-between text-[11px] font-semibold text-primary">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Today&apos;s Sprint Task
                  </span>
                  <span>{context.activeSprintTask.estimatedMinutes} mins</span>
                </div>
                <div className="font-medium text-xs text-slate-800 dark:text-slate-200 mt-1">
                  {context.activeSprintTask.title}
                </div>
                <Link href="/student/learning-plan" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                  Open Learning Plan <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Top Critical Skill Gaps */}
            {context.topSkillGaps && context.topSkillGaps.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span>Priority Skill Gaps</span>
                  <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">
                    Diagnostic
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {context.topSkillGaps.map((gap: any, i: number) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-800"
                    >
                      <div className="flex items-center justify-between font-medium text-slate-800 dark:text-slate-200">
                        <span>{gap.skillName}</span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            gap.gapSeverity === "CRITICAL"
                              ? "bg-red-50 text-red-600 border-red-200"
                              : "bg-amber-50 text-amber-600 border-amber-200"
                          }`}
                        >
                          {gap.gapSeverity}
                        </Badge>
                      </div>
                      <Link href="/student/assessments" className="mt-1 inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                        Verify Skill <ArrowRight className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verified vs Self-Reported Skills */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Verified Skills ({context.verifiedSkills?.length || 0})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {context.verifiedSkills && context.verifiedSkills.length > 0 ? (
                  context.verifiedSkills.map((sk: string, i: number) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 dark:bg-emerald-950/30"
                    >
                      <Check className="h-3 w-3" /> {sk}
                    </Badge>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400">None verified yet</span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Self-Reported Claims ({context.selfReportedSkills?.length || 0})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {context.selfReportedSkills && context.selfReportedSkills.length > 0 ? (
                  context.selfReportedSkills.map((sk: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[10px] text-slate-600">
                      {sk}
                    </Badge>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400">None claimed</span>
                )}
              </div>
            </div>

            {/* Alternative Career Pathways */}
            {context.alternativeCareers && context.alternativeCareers.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  Recommended Alternatives
                </div>
                <div className="space-y-1.5">
                  {context.alternativeCareers.map((alt: any, i: number) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-800"
                    >
                      <div className="flex items-center justify-between font-medium text-slate-800 dark:text-slate-200">
                        <span>{alt.title}</span>
                        <span className="text-primary font-bold">{alt.compatibilityScore}%</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{alt.whySuited}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-2">
              <Link href="/student/assessments" className="block">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  <span>Take Skill Assessment</span>
                </Button>
              </Link>
              <Link href="/student/learning-plan" className="block">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span>View Full Learning Plan</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Action Proposal Modal */}
      {activeProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Sparkles className="h-5 w-5" />
                <span>Mentor Recommendation Review</span>
              </div>
              <button onClick={() => setActiveProposal(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="mt-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {activeProposal.title}
              </h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                {activeProposal.description}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setActiveProposal(null)}>
                Dismiss
              </Button>
              {activeProposal.actionUrl ? (
                <Link href={activeProposal.actionUrl}>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    {activeProposal.actionText || "Proceed to Action"}
                  </Button>
                </Link>
              ) : (
                <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setActiveProposal(null)}>
                  Acknowledge
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
