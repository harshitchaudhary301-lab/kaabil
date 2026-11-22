"use client";

import React, { useState } from "react";
import {
  Activity,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Compass,
  ArrowRight,
  ShieldAlert,
  Layers,
  GraduationCap,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV_ITEMS } from "@/components/student/student-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatIfSimulationResult } from "@/types/admin";

const CAREER_OPTIONS = [
  "Robotics & Automation Engineer",
  "Aerospace Guidance Specialist",
  "Data Scientist & AI Architect",
  "Full Stack Software Engineer",
  "Medical Diagnostics Technologist",
  "Chartered Financial Analyst",
  "Corporate Legal Counsel",
  "Agritech Automation Specialist",
  "Industrial UI/UX Designer",
];

const SKILL_OPTIONS = [
  "ROS 2 & SLAM Navigation",
  "PyTorch Deep Learning",
  "Embedded C++ & Microcontrollers",
  "Kalman Filters & Sensor Fusion",
  "Computer Vision & OpenCV",
  "Cloud Infrastructure (AWS/GCP)",
  "Technical Project Management",
  "Data Structures & Algorithms",
];

const ASSESSMENT_OPTIONS = [
  "Advanced Robotics Control Assessment",
  "Python Algorithms & Numerical Computing",
  "Sensor Fusion & State Estimation",
  "Cloud Architecture & Distributed Systems",
];

export default function StudentSimulatorPage() {
  const [targetCareer, setTargetCareer] = useState(CAREER_OPTIONS[0]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([SKILL_OPTIONS[0], SKILL_OPTIONS[1]]);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([ASSESSMENT_OPTIONS[0]]);
  const [roadmapComplete, setRoadmapComplete] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<WhatIfSimulationResult | null>(null);

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const res = await fetch("/api/student/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCareer,
          hypotheticalSkills: selectedSkills,
          hypotheticalAssessments: selectedAssessments,
          simulatedRoadmapCompletion: roadmapComplete,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setSimulating(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleAssessment = (assessment: string) => {
    setSelectedAssessments((prev) =>
      prev.includes(assessment)
        ? prev.filter((a) => a !== assessment)
        : [...prev, assessment]
    );
  };

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV_ITEMS}
      breadcrumbs={["Career Intelligence", "What-If Simulator"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary">
                Career What-If Simulator
              </h1>
              <Badge variant="outline" className="border-primary/20 text-primary">
                Predictive Readiness Sandbox
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Explore hypothetical skill acquisitions, exam completions, and stream pivots on your Career Readiness Index
            </p>
          </div>

          <Button
            size="sm"
            onClick={runSimulation}
            disabled={simulating}
            className="gap-2 bg-primary text-white text-xs px-4"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {simulating ? "Calculating Vectors..." : "Run Simulation"}
          </Button>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 cols): Controls */}
          <div className="lg:col-span-5 space-y-5">
            {/* Target Career Picker */}
            <Card className="p-5 border-border space-y-3">
              <label className="text-xs font-bold uppercase text-text-muted tracking-wider block">
                Target Career Pathway
              </label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-border bg-white text-xs font-medium text-text-primary"
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
              >
                {CAREER_OPTIONS.map((c, idx) => (
                  <option key={idx} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Card>

            {/* Hypothetical Skills */}
            <Card className="p-5 border-border space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-text-muted tracking-wider">
                  Hypothetical Skills to Acquire ({selectedSkills.length})
                </label>
                <span className="text-[11px] text-text-muted">Click to toggle</span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {SKILL_OPTIONS.map((s, idx) => {
                  const isSelected = selectedSkills.includes(s);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleSkill(s)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-primary/10 border-primary text-primary font-semibold"
                          : "bg-slate-50 border-border text-text-secondary hover:bg-slate-100"
                      }`}
                    >
                      <span>{s}</span>
                      {isSelected ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> : null}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Hypothetical Assessments & Roadmap */}
            <Card className="p-5 border-border space-y-3">
              <label className="text-xs font-bold uppercase text-text-muted tracking-wider block">
                Hypothetical Milestone Verifications
              </label>
              <div className="space-y-2">
                {ASSESSMENT_OPTIONS.map((a, idx) => {
                  const isSelected = selectedAssessments.includes(a);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleAssessment(a)}
                      className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                          : "bg-slate-50 border-border text-text-secondary hover:bg-slate-100"
                      }`}
                    >
                      <span>Pass: {a}</span>
                      {isSelected ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-border">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-text-primary">
                  <input
                    type="checkbox"
                    checked={roadmapComplete}
                    onChange={(e) => setRoadmapComplete(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Simulate completion of full 4-stage learning roadmap</span>
                </label>
              </div>
            </Card>
          </div>

          {/* Right Column (7 cols): Simulation Impact Results */}
          <div className="lg:col-span-7 space-y-5">
            {!result ? (
              <Card className="p-12 text-center text-text-muted border-dashed border-2">
                <Activity className="h-10 w-10 mx-auto text-primary/40 mb-3" />
                <h3 className="font-heading text-base font-bold text-text-primary">
                  Ready to Simulate Readiness
                </h3>
                <p className="text-xs text-text-secondary max-w-md mx-auto mt-1 mb-4">
                  Select hypothetical skills and target career pathways, then click &apos;Run Simulation&apos; to view projected CRI deltas.
                </p>
                <Button size="sm" onClick={runSimulation} className="bg-primary text-white text-xs">
                  Run Initial Simulation
                </Button>
              </Card>
            ) : (
              <>
                {/* 2 Big Impact Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="p-5 border-border bg-gradient-to-br from-white to-blue-50/30">
                    <span className="text-xs font-bold text-text-muted uppercase">Projected CRI Score</span>
                    <div className="flex items-baseline gap-3 mt-2">
                      <span className="font-heading text-4xl font-black text-primary">
                        {result.simulatedCRI}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center">
                        <TrendingUp className="h-3 w-3 mr-0.5" /> +{result.criDelta} pts
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-2">Baseline CRI was {result.currentCRI} / 100</p>
                  </Card>

                  <Card className="p-5 border-border bg-gradient-to-br from-white to-emerald-50/30">
                    <span className="text-xs font-bold text-text-muted uppercase">Projected Skill Gap</span>
                    <div className="flex items-baseline gap-3 mt-2">
                      <span className="font-heading text-4xl font-black text-emerald-600">
                        {result.simulatedSkillGap}%
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        -{(result.currentSkillGap ?? 28) - (result.simulatedSkillGap ?? 10)}% reduction
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-2">Baseline Gap was {result.currentSkillGap}%</p>
                  </Card>
                </div>

                {/* Transition Feasibility & Timeline */}
                <Card className="p-6 border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-text-muted uppercase">Target Career</span>
                      <h3 className="font-heading text-base font-bold text-text-primary">
                        {result.targetCareer}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-text-muted uppercase">Feasibility</span>
                      <div className="text-lg font-black text-primary">
                        {result.careerTransitionFeasibilityPct}% Match
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-border text-xs text-text-secondary leading-relaxed">
                    <strong className="text-text-primary">Transition Strategy: </strong>
                    {result.transitionAdvice}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                    <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                      <span className="text-text-muted block font-medium">Estimated Time Horizon</span>
                      <span className="text-base font-bold text-blue-900 mt-0.5 block">
                        ~{result.projectedTimeToAchieveWeeks} Weeks
                      </span>
                      <span className="text-[11px] text-text-muted">with 8-10 hrs/week study</span>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                      <span className="text-text-muted block font-medium">Resolved Competencies</span>
                      <span className="text-base font-bold text-emerald-900 mt-0.5 block">
                        {result.resolvedGapsCount} Core Skills
                      </span>
                      <span className="text-[11px] text-text-muted">bridged via simulation</span>
                    </div>
                  </div>

                  {result.resolvedGaps.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs font-bold text-text-primary block">
                        Targeted Gaps Bridged:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.resolvedGaps.map((gap, gIdx) => (
                          <span
                            key={gIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </>
            )}

            {/* Mandatory Statutory Disclaimer Banner */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-amber-900 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Statutory Notice & AI Ethics Framework: </strong>
                Simulated readiness scores and timelines are illustrative algorithmic projections based on national curriculum frameworks and do not constitute guaranteed employment, placement, or admission offers.
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
