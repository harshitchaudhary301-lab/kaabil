"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Is KAABIL only for engineering and tech students?",
      answer:
        "Absolutely not. KAABIL is built from the ground up for ALL 13 educational streams: Medical (PCB), Non-Medical (PCM), Commerce & Finance, Arts & Humanities, Law & Jurisprudence, Management, Creative Arts & Design, Agriculture, Vocational Trades, Sports, Hospitality, Interdisciplinary & Emerging Fields, and Undecided students. Every stream has structured career paths, entrance exam guides, and verified skill benchmarks.",
    },
    {
      question: "How does the AI Career Mentor support Hindi and Hinglish?",
      answer:
        "The AI Career Mentor leverages Gemini API with custom prompt engineering specifically tuned for Indian linguistic patterns. It seamlessly responds to pure Hindi (हिन्दी), formal English, and conversational Hinglish (e.g., '12th PCM ke baad architecture mein admission kaise milega?').",
    },
    {
      question: "How are school students and legal minors protected?",
      answer:
        "In strict compliance with the India Digital Personal Data Protection Act (DPDP Act 2023) and child protection directives, users in Classes 8–12 or under 18 have private profiles by default. They are permanently excluded from corporate recruiter searches, cannot receive direct messages from employers, and focus entirely on career awareness, academic foundation, and stream selection.",
    },
    {
      question: "Does KAABIL guarantee a job or placement?",
      answer:
        "No. KAABIL never makes fabricated or misleading 100% placement guarantees. Our mission is to provide you with transparent, explainable skill diagnostics, structured learning milestones, and verifiable credentials. Jobs and internships on the platform are awarded strictly by verified employers based on demonstrated competence.",
    },
    {
      question: "Is KAABIL free for students?",
      answer:
        "Yes! Core student features—including Career Discovery, Aptitude Assessments, Stream Selection, Adaptive Roadmaps, Entrance Exam Hub, and Digital Skill Passports—are built using free and open-source foundations with zero paywalls for students.",
    },
    {
      question: "How do colleges and employers join the ecosystem?",
      answer:
        "Colleges and universities undergo an official verification check (AISHE/UGC accreditation) to access cohort analytics and placement tools. Employers must verify their corporate identity (CIN/GSTIN) to eliminate fraudulent job postings and post skill-first vacancies.",
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-28 bg-slate-50/70 border-t border-border">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <HelpCircle className="h-3.5 w-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Clear Answers. No Empty Promises.
          </h2>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Everything you need to know about the KAABIL ecosystem, privacy architecture, and universal multi-stream coverage.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Card
                key={idx}
                className="border-border transition-all duration-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-heading text-sm sm:text-base font-semibold text-text-primary hover:text-primary transition-colors focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border/50 bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
