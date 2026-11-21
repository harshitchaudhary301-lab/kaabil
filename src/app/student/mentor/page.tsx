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
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";



const STREAM_STARTER_QUESTIONS: Record<string, string[]> = {
  MEDICAL_PCB: [
    "How should I balance NEET prep with Class 12 board exams?",
    "What are high-growth clinical healthcare careers beyond MBBS?",
    "Which practical skills are most valued in medical research?",
  ],
  NON_MEDICAL_PCM: [
    "What projects should I build to demonstrate algorithmic competency?",
    "How do I prepare for engineering entrance exams while learning to code?",
    "What is the difference between AI Engineering and Data Science in industry?",
  ],
  COMMERCE: [
    "What is the roadmap to clear CA Foundation on the first attempt?",
    "How do I prepare for careers in Financial Analytics and Investment Banking?",
    "Which digital certifications best complement a B.Com degree in India?",
  ],
  ARTS_HUMANITIES: [
    "How do I build a portfolio for Policy Research and Civil Services?",
    "What are career prospects in Digital Journalism and Content Strategy?",
    "Which interdisciplinary skills make a Humanities graduate stand out?",
  ],
  LAW: [
    "How do I prepare for CLAT while developing legal drafting skills?",
    "What does a career in Corporate Technology Law entail in India?",
    "How important are moot courts and internships for a first-generation lawyer?",
  ],
  CREATIVE_ARTS_DESIGN: [
    "How do I build a UI/UX design case study that gets attention from startups?",
    "What are entrance requirements for NID and UCEED?",
    "Which design software and principles should I master first?",
  ],
  VOCATIONAL_SKILLED: [
    "What apprenticeships lead directly to certified industrial technician roles?",
    "How do I upgrade from basic electrician skills to solar & EV technician?",
    "Which government skill certifications under NSDC offer highest job placement?",
  ],
  DEFAULT: [
    "Review my active learning roadmap and suggest this week's priorities.",
    "Which skill should I verify first to boost my Career Readiness Index?",
    "How do I explore careers that fit my interests and stream?",
  ],
};

export default function AiMentorPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [context, setContext] = useState<any>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeProposal, setActiveProposal] = useState<any | null>(null);

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
      // 1. Fetch conversations
      const convRes = await fetch("/api/student/mentor/conversations");
      if (convRes.ok) {
        const convData = await convRes.json();
        const convList = convData.conversations || [];
        setConversations(convList);
        if (convList.length > 0) {
          setActiveConvId(convList[0].id);
        }
      }

      // 2. Fetch live context
      const ctxRes = await fetch("/api/student/mentor/context");
      if (ctxRes.ok) {
        const ctxData = await ctxRes.json();
        setContext(ctxData.context || null);
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
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Globe className="h-3.5 w-3.5" />
              <span>Language / भाषा</span>
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
                      title="Delete conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Context Toggle on Bottom */}
          {context && (
            <div className="mt-auto border-t border-slate-200 pt-3 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>CRI Readiness:</span>
                <span className="font-bold text-primary">{context.criScore}/100</span>
              </div>
              <div className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                {context.targetCareer}
              </div>
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
                  <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
                    Live Engine
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Calibrated for {context?.currentStream?.replace(/_/g, " ") || "All Streams"} • Trilingual
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDrawer(!showDrawer)}
                className="gap-1.5 text-xs"
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
                <p className="mt-1 text-xs text-slate-500">
                  I am your personalized AI Career Mentor, grounded in your Career Digital Twin, Roadmap, and verified skills.
                </p>

                {/* Stream Starter Questions */}
                <div className="mt-6 text-left">
                  <div className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Recommended starter questions for {context?.currentStream?.replace(/_/g, " ") || "you"}:
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
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-primary hover:bg-primary/90"
                              onClick={() => setActiveProposal(msg.actionProposal)}
                            >
                              Review & Take Action
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Message Footer */}
                      {!isUser && (
                        <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-1.5 text-[10px] text-slate-400 dark:border-slate-700/60">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                            {msg.source === "gemini_2_flash"
                              ? "Powered by Gemini 2.0 Flash"
                              : "KAABIL Deterministic Knowledge Engine"}
                          </span>
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-200"
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
                    <span>Analyzing student digital twin & formulating verified advice...</span>
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
                    ? "करियर, रोडमैप या स्किल के बारे में यहाँ पूछें..."
                    : language === "hinglish"
                    ? "Apna career doubt ya roadmap question yahan type karein..."
                    : "Ask about career trajectories, roadmap adjustments, or skill verifications..."
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
              <span>Zero-hallucination guardrail active</span>
            </div>
          </div>
        </div>

        {/* RIGHT DRAWER: Live Student Context */}
        {showDrawer && context && (
          <div className="w-80 border-l border-slate-200 bg-slate-50/50 p-4 overflow-y-auto dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300">
                Live Digital Twin Context
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
              <div className="text-[11px] text-slate-400">Target Career</div>
              <div className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {context.targetCareer}
              </div>
              <Badge variant="outline" className="mt-1 text-[10px]">
                {context.currentStream?.replace(/_/g, " ")}
              </Badge>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-700">
                <span className="text-xs text-slate-500">CRI Score:</span>
                <span className="text-sm font-extrabold text-primary">{context.criScore}/100</span>
              </div>
            </div>

            {/* Verified vs Self-Reported Skills */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Verified Skills ({context.verifiedSkills.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {context.verifiedSkills.map((sk: string, i: number) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 dark:bg-emerald-950/30"
                  >
                    <Check className="h-3 w-3" /> {sk}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Self-Reported Skills ({context.selfReportedSkills.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {context.selfReportedSkills.map((sk: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-[10px] text-slate-600">
                    {sk}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Active Milestone */}
            {context.activeMilestoneTitle && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-800">
                <div className="text-slate-400 text-[10px]">Active Roadmap Milestone</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {context.activeMilestoneTitle}
                </div>
              </div>
            )}

            <div className="mt-6">
              <Link href="/student/assessments">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  <span>Take Skill Assessment</span>
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
              {activeProposal.type === "RECOMMENDED_ASSESSMENT" ? (
                <Link href="/student/assessments">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Go to Assessments
                  </Button>
                </Link>
              ) : (
                <Link href="/student/dashboard#roadmap">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    View Adaptive Roadmap
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
