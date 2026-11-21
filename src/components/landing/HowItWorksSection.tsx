import React from "react";
import { UserCheck, Compass, BookOpenCheck, Award, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Intelligent Onboarding",
      subtitle: "3-Minute Diagnostic",
      description:
        "Select your educational stage (Class 8 to Working Professional), current stream or undecided pathway, and primary language preference (English, Hindi, Hinglish).",
      icon: <UserCheck className="h-6 w-6 text-primary" />,
    },
    {
      step: "02",
      title: "Career Twin & Gap Matrix",
      subtitle: "Deterministic Profiling",
      description:
        "KAABIL generates your Career Digital Twin and compares your current capabilities against official Indian benchmarks to prioritize your exact skill gaps.",
      icon: <Compass className="h-6 w-6 text-secondary" />,
    },
    {
      step: "03",
      title: "Adaptive Learning Roadmap",
      subtitle: "Weekly Micro-Milestones",
      description:
        "Follow a curated, 4 to 12-week action plan using free verified resources. Pass 5-minute checkpoint quizzes to systematically boost your Readiness Index.",
      icon: <BookOpenCheck className="h-6 w-6 text-accent" />,
    },
    {
      step: "04",
      title: "Digital Skill Passport",
      subtitle: "Verified Proof of Competence",
      description:
        "Mint your tamper-evident credential. Connect verified competence with transparent, explainable internships and entry-level opportunities (18+ only).",
      icon: <Award className="h-6 w-6 text-emerald-600" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            Step-by-Step Clarity
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
            How KAABIL Guides Your Journey
          </h2>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            From confusion to career readiness in four structured, evidence-grounded phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st) => (
            <div
              key={st.step}
              className="relative p-6 rounded-3xl border border-border bg-slate-50/60 hover:bg-white hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-heading text-3xl font-extrabold text-primary/30">
                    {st.step}
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-border shadow-soft-xs">
                    {st.icon}
                  </div>
                </div>

                <span className="text-[11px] font-bold uppercase tracking-wider text-primary block mb-1">
                  {st.subtitle}
                </span>
                <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                  {st.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {st.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
