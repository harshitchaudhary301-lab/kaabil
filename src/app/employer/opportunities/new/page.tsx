"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Building,
  GraduationCap,
  Scale,
  Award,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  OpportunityType,
  WorkplaceType,
  StructuredCompetencyRequirement,
  EmployerVerificationStatus,
} from "@/types/employer";
import { EducationalStream, EducationStage } from "@/types";

const STREAM_OPTIONS: { label: string; value: EducationalStream }[] = [
  { label: "Engineering & Technology (PCM)", value: "NON_MEDICAL_PCM" },
  { label: "Medicine & Health Sciences (PCB)", value: "MEDICAL_PCB" },
  { label: "Commerce, Banking & Finance", value: "COMMERCE" },
  { label: "Arts, Social Sciences & Humanities", value: "ARTS_HUMANITIES" },
  { label: "Law & Legal Services", value: "LAW" },
  { label: "Business Administration & Management", value: "MANAGEMENT" },
  { label: "Creative Arts, Media & Design", value: "CREATIVE_DESIGN" },
  { label: "Agriculture & Allied Sciences", value: "AGRICULTURE" },
  { label: "Vocational Trades & Technical Crafts", value: "VOCATIONAL_TRADES" },
  { label: "Sports & Physical Education", value: "SPORTS_PHYSICAL_ED" },
  { label: "Hospitality, Tourism & Culinary", value: "HOSPITALITY_TOURISM" },
  { label: "Interdisciplinary & Emerging Fields", value: "INTERDISCIPLINARY" },
];

const STAGE_OPTIONS: { label: string; value: EducationStage }[] = [
  { label: "Class 12 / Higher Secondary (Adult)", value: "CLASS_12" },
  { label: "Diploma / Polytechnic", value: "DIPLOMA" },
  { label: "Industrial Training Institute (ITI)", value: "ITI" },
  { label: "Undergraduate (UG)", value: "UNDERGRADUATE" },
  { label: "Postgraduate (PG)", value: "POSTGRADUATE" },
  { label: "Working Professional", value: "WORKING_PROFESSIONAL" },
];

// Curated skills-first templates across multiple streams
const STREAM_PRESETS: Record<string, StructuredCompetencyRequirement[]> = {
  MEDICAL_PCB: [
    { skillName: "Diagnostic Radiology & Imaging", category: "CLINICAL", importance: "MANDATORY", minProficiency: "INTERMEDIATE", acceptableEvidence: ["EXTERNAL_CREDENTIAL", "PLATFORM_ASSESSMENT"] },
    { skillName: "Patient Triage & Medical Records", category: "REGULATORY", importance: "MANDATORY", minProficiency: "INTERMEDIATE", acceptableEvidence: ["ANY"] },
    { skillName: "Pathology Specimen Handling", category: "TECHNICAL", importance: "PREFERRED", minProficiency: "BEGINNER", acceptableEvidence: ["PLATFORM_ASSESSMENT"] },
  ],
  NON_MEDICAL_PCM: [
    { skillName: "Full-Stack Web Architecture", category: "TECHNICAL", importance: "MANDATORY", minProficiency: "INTERMEDIATE", acceptableEvidence: ["PROJECT_WORK", "PLATFORM_ASSESSMENT"] },
    { skillName: "PostgreSQL & Database Design", category: "TECHNICAL", importance: "MANDATORY", minProficiency: "INTERMEDIATE", acceptableEvidence: ["PLATFORM_ASSESSMENT"] },
    { skillName: "CI/CD & Cloud Infrastructure", category: "TECHNICAL", importance: "PREFERRED", minProficiency: "BEGINNER", acceptableEvidence: ["PROJECT_WORK"] },
  ],
  COMMERCE: [
    { skillName: "Financial Modeling & Analysis", category: "DOMAIN", importance: "MANDATORY", minProficiency: "INTERMEDIATE", acceptableEvidence: ["PLATFORM_ASSESSMENT"] },
    { skillName: "GST & Indian Corporate Taxation", category: "REGULATORY", importance: "MANDATORY", minProficiency: "INTERMEDIATE", acceptableEvidence: ["EXTERNAL_CREDENTIAL"] },
    { skillName: "Tally ERP & Accounting Software", category: "PRACTICAL", importance: "PREFERRED", minProficiency: "INTERMEDIATE", acceptableEvidence: ["ANY"] },
  ],
  LAW: [
    { skillName: "Legal Drafting & Conveyancing", category: "PRACTICAL", importance: "MANDATORY", minProficiency: "INTERMEDIATE", acceptableEvidence: ["PROJECT_WORK"] },
    { skillName: "Indian Constitutional & Contract Law", category: "DOMAIN", importance: "MANDATORY", minProficiency: "ADVANCED", acceptableEvidence: ["PLATFORM_ASSESSMENT"] },
    { skillName: "Corporate Due Diligence", category: "TECHNICAL", importance: "PREFERRED", minProficiency: "BEGINNER", acceptableEvidence: ["ANY"] },
  ],
  VOCATIONAL_TRADES: [
    { skillName: "Precision Metal Fabrication & TIG Welding", category: "PRACTICAL", importance: "MANDATORY", minProficiency: "ADVANCED", acceptableEvidence: ["EXTERNAL_CREDENTIAL"] },
    { skillName: "Workshop Safety (OSHA/BIS Standards)", category: "REGULATORY", importance: "MANDATORY", minProficiency: "INTERMEDIATE", acceptableEvidence: ["PLATFORM_ASSESSMENT"] },
  ],
};

export default function NewOpportunityPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<EmployerVerificationStatus>("VERIFIED");

  // Form State
  const [title, setTitle] = useState("");
  const [stream, setStream] = useState<EducationalStream>("NON_MEDICAL_PCM");
  const [department, setDepartment] = useState("");
  const [opportunityType, setOpportunityType] = useState<OpportunityType>("FULL_TIME");
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>("HYBRID");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [country] = useState("India");
  const [availablePositions, setAvailablePositions] = useState<number>(2);
  const [deadline, setDeadline] = useState("2026-12-31");
  const [minStage, setMinStage] = useState<EducationStage>("UNDERGRADUATE");
  const [experienceYearsMin, setExperienceYearsMin] = useState<number>(0);
  const [experienceYearsMax, setExperienceYearsMax] = useState<number>(2);

  // Compensation
  const [isDisclosed, setIsDisclosed] = useState(true);
  const [minSalary, setMinSalary] = useState<number>(6.0);
  const [maxSalary, setMaxSalary] = useState<number>(9.5);
  const [stipendMonthly, setStipendMonthly] = useState<number>(25000);

  // Text
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState<string[]>([
    "Collaborate across multidisciplinary teams to execute domain deliverables.",
    "Maintain industry compliance, ethical standards and performance documentation.",
  ]);
  const [newRespInput, setNewRespInput] = useState("");

  const [requiredQualifications, setRequiredQualifications] = useState<string[]>([
    "Bachelor's Degree in relevant discipline or recognized equivalent certification.",
  ]);
  const [newQualInput, setNewQualInput] = useState("");

  const [requiredLicenses, setRequiredLicenses] = useState<string[]>([]);
  const [newLicenseInput, setNewLicenseInput] = useState("");

  // Competency Requirements
  const [competencyRequirements, setCompetencyRequirements] = useState<StructuredCompetencyRequirement[]>([
    {
      skillName: "Analytical Problem Solving",
      category: "TECHNICAL",
      importance: "MANDATORY",
      minProficiency: "INTERMEDIATE",
      acceptableEvidence: ["PLATFORM_ASSESSMENT"],
    },
  ]);

  useEffect(() => {
    async function loadOrgStatus() {
      try {
        const res = await fetch("/api/employer/verification");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.status) {
            setVerificationStatus(data.status);
          }
        }
      } catch (err) {
        console.error("Failed to load verification status", err);
      }
    }
    loadOrgStatus();
  }, []);

  const handleApplyPreset = () => {
    const preset = STREAM_PRESETS[stream];
    if (preset) {
      setCompetencyRequirements([...preset]);
    }
  };

  const handleAddCompetency = () => {
    setCompetencyRequirements([
      ...competencyRequirements,
      {
        skillName: "",
        category: "TECHNICAL",
        importance: "MANDATORY",
        minProficiency: "INTERMEDIATE",
        acceptableEvidence: ["PLATFORM_ASSESSMENT"],
      },
    ]);
  };

  const handleRemoveCompetency = (index: number) => {
    setCompetencyRequirements(competencyRequirements.filter((_, i) => i !== index));
  };

  const handleUpdateCompetency = (index: number, field: keyof StructuredCompetencyRequirement, value: any) => {
    const updated = [...competencyRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setCompetencyRequirements(updated);
  };

  const handleAddResponsibility = () => {
    if (newRespInput.trim()) {
      setResponsibilities([...responsibilities, newRespInput.trim()]);
      setNewRespInput("");
    }
  };

  const handleAddQualification = () => {
    if (newQualInput.trim()) {
      setRequiredQualifications([...requiredQualifications, newQualInput.trim()]);
      setNewQualInput("");
    }
  };

  const handleAddLicense = () => {
    if (newLicenseInput.trim()) {
      setRequiredLicenses([...requiredLicenses, newLicenseInput.trim()]);
      setNewLicenseInput("");
    }
  };

  const handleSubmit = async (targetStatus: "DRAFT" | "PUBLISHED") => {
    if (!title.trim()) {
      setStatusMessage({ type: "error", text: "Please enter an opportunity title." });
      return;
    }
    if (competencyRequirements.length === 0 || competencyRequirements.some((c) => !c.skillName.trim())) {
      setStatusMessage({ type: "error", text: "Please configure at least one valid competency skill requirement." });
      return;
    }

    if (targetStatus === "PUBLISHED" && verificationStatus !== "VERIFIED") {
      setStatusMessage({
        type: "error",
        text: "Your organization is not yet verified. You can save this opportunity as a DRAFT. Once verified by KAABIL compliance reviewers, it can be published.",
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    const payload = {
      title,
      stream,
      department: department || undefined,
      opportunityType,
      workplaceType,
      city,
      state,
      country,
      availablePositions: Number(availablePositions) || 1,
      deadline,
      minStage,
      experienceYearsMin: Number(experienceYearsMin) || 0,
      experienceYearsMax: Number(experienceYearsMax) || undefined,
      description: description || `${title} at ${department || "our organization"} seeking skilled talent in ${stream}.`,
      responsibilities,
      requiredQualifications,
      requiredLicenses: requiredLicenses.length > 0 ? requiredLicenses : undefined,
      requiredSkills: competencyRequirements.filter((c) => c.importance === "MANDATORY").map((c) => c.skillName),
      preferredSkills: competencyRequirements.filter((c) => c.importance === "PREFERRED").map((c) => c.skillName),
      competencyRequirements,
      compensation: {
        isDisclosed,
        minSalary: isDisclosed ? Number(minSalary) : undefined,
        maxSalary: isDisclosed ? Number(maxSalary) : undefined,
        stipendMonthly: isDisclosed && opportunityType === "INTERNSHIP" ? Number(stipendMonthly) : undefined,
        currency: "INR",
      },
      status: targetStatus,
    };

    try {
      const res = await fetch("/api/employer/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: targetStatus === "PUBLISHED" ? "Opportunity published successfully!" : "Opportunity saved as draft.",
        });
        setTimeout(() => {
          router.push("/employer/opportunities");
        }, 1200);
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to create opportunity." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Network error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout
      portalName="Employer Console"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Opportunities", "Post New Opportunity"]}
    >
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/employer/opportunities"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-2 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Opportunities
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              Skills-First Opportunity Builder
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Construct structured, multi-stream competency benchmarks across all 13 educational domains.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit("DRAFT")}
              disabled={submitting}
              className="border-slate-200 text-slate-700"
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit("PUBLISHED")}
              disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-white shadow-sm"
            >
              {submitting ? "Processing..." : "Publish Live"}
            </Button>
          </div>
        </div>

        {/* Verification Status Banner */}
        {verificationStatus !== "VERIFIED" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-semibold">Verification Gate Active:</span> Your organization currently has status{" "}
              <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-300 mx-1">
                {verificationStatus}
              </Badge>
              . To protect job seekers across India, unverified employers may prepare and save draft postings, but cannot
              publish them live.{" "}
              <Link href="/employer/verification" className="underline font-semibold text-amber-800 hover:text-amber-950">
                Complete Organization Verification &rarr;
              </Link>
            </div>
          </div>
        )}

        {statusMessage && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : statusMessage.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-sky-50 border-sky-200 text-sky-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Form Sections */}
        <div className="space-y-6">
          {/* 1. Core Role Metadata */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                1. Role Details & Stream Alignment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Opportunity Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Clinical Laboratory Scientist / Full-Stack Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Universal Educational Stream <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value as EducationalStream)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    {STREAM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Division</label>
                  <input
                    type="text"
                    placeholder="e.g. Diagnostics / R&D / Legal Affairs"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Opportunity Type</label>
                  <select
                    value={opportunityType}
                    onChange={(e) => setOpportunityType(e.target.value as OpportunityType)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="FULL_TIME">Full-Time Position</option>
                    <option value="PART_TIME">Part-Time Position</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="APPRENTICESHIP">Apprenticeship / NATS / NAPS</option>
                    <option value="GRADUATE_TRAINEE">Graduate Trainee</option>
                    <option value="VOCATIONAL">Vocational Craft</option>
                    <option value="RESEARCH">Research Fellow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Workplace Environment</label>
                  <select
                    value={workplaceType}
                    onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="HYBRID">Hybrid (On-Site & Remote)</option>
                    <option value="ON_SITE">On-Site (Hospital / Laboratory / Plant)</option>
                    <option value="REMOTE">100% Remote</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Open Positions</label>
                  <input
                    type="number"
                    min={1}
                    value={availablePositions}
                    onChange={(e) => setAvailablePositions(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Skills-First Competency Requirements */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  2. Skills-First Competencies & Evidence Verification
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define verified capabilities rather than generic degree prestige. Candidates are evaluated on verifiable proof.
                </p>
              </div>

              {STREAM_PRESETS[stream] && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyPreset}
                  className="text-xs text-purple-700 border-purple-200 hover:bg-purple-50 flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Load {stream.replace(/_/g, " ")} Template
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-3">
                {competencyRequirements.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Competency / Skill Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Statistical Inference, Biomechanics, Welding"
                          value={comp.skillName}
                          onChange={(e) => handleUpdateCompetency(idx, "skillName", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
                        <select
                          value={comp.category}
                          onChange={(e) => handleUpdateCompetency(idx, "category", e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="TECHNICAL">Technical</option>
                          <option value="DOMAIN">Domain Knowledge</option>
                          <option value="PRACTICAL">Practical Craft</option>
                          <option value="CLINICAL">Clinical / Healthcare</option>
                          <option value="SOFT_SKILL">Soft / Interpersonal</option>
                          <option value="REGULATORY">Regulatory / Statutory</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Importance</label>
                        <select
                          value={comp.importance}
                          onChange={(e) => handleUpdateCompetency(idx, "importance", e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="MANDATORY">Mandatory</option>
                          <option value="PREFERRED">Preferred</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Min Proficiency</label>
                        <select
                          value={comp.minProficiency}
                          onChange={(e) => handleUpdateCompetency(idx, "minProficiency", e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="BEGINNER">Beginner</option>
                          <option value="INTERMEDIATE">Intermediate</option>
                          <option value="ADVANCED">Advanced</option>
                          <option value="EXPERT">Expert</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 flex items-center justify-end pt-5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCompetency(idx)}
                          className="h-8 px-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center gap-3 text-xs text-slate-600">
                      <span className="font-semibold text-[11px] text-slate-500">Acceptable Evidence:</span>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={comp.acceptableEvidence.includes("PLATFORM_ASSESSMENT") || comp.acceptableEvidence.includes("ANY")}
                          onChange={(e) => {
                            const cur = [...comp.acceptableEvidence];
                            const updated = e.target.checked
                              ? Array.from(new Set([...cur, "PLATFORM_ASSESSMENT"]))
                              : cur.filter((x) => x !== "PLATFORM_ASSESSMENT" && x !== "ANY");
                            handleUpdateCompetency(idx, "acceptableEvidence", updated.length ? updated : ["ANY"]);
                          }}
                          className="rounded text-primary focus:ring-primary"
                        />
                        KAABIL Assessment
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={comp.acceptableEvidence.includes("EXTERNAL_CREDENTIAL") || comp.acceptableEvidence.includes("ANY")}
                          onChange={(e) => {
                            const cur = [...comp.acceptableEvidence];
                            const updated = e.target.checked
                              ? Array.from(new Set([...cur, "EXTERNAL_CREDENTIAL"]))
                              : cur.filter((x) => x !== "EXTERNAL_CREDENTIAL" && x !== "ANY");
                            handleUpdateCompetency(idx, "acceptableEvidence", updated.length ? updated : ["ANY"]);
                          }}
                          className="rounded text-primary focus:ring-primary"
                        />
                        Verified Credential
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={comp.acceptableEvidence.includes("PROJECT_WORK") || comp.acceptableEvidence.includes("ANY")}
                          onChange={(e) => {
                            const cur = [...comp.acceptableEvidence];
                            const updated = e.target.checked
                              ? Array.from(new Set([...cur, "PROJECT_WORK"]))
                              : cur.filter((x) => x !== "PROJECT_WORK" && x !== "ANY");
                            handleUpdateCompetency(idx, "acceptableEvidence", updated.length ? updated : ["ANY"]);
                          }}
                          className="rounded text-primary focus:ring-primary"
                        />
                        Project / Portfolio Proof
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCompetency}
                className="text-xs border-dashed border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Competency Requirement
              </Button>
            </CardContent>
          </Card>

          {/* 3. Eligibility, Qualifications & Statutory Licenses */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
                3. Candidate Qualifications & Professional Licensing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimum Educational Stage
                  </label>
                  <select
                    value={minStage}
                    onChange={(e) => setMinStage(e.target.value as EducationStage)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    {STAGE_OPTIONS.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Note: Under DPDP Act 2023, Class 8–10 minors are legally shielded from recruitment listings.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    value={experienceYearsMin}
                    onChange={(e) => setExperienceYearsMin(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Experience (Years)</label>
                  <input
                    type="number"
                    min={experienceYearsMin}
                    value={experienceYearsMax}
                    onChange={(e) => setExperienceYearsMax(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Required Qualifications */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Educational Qualifications
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. B.Tech / BE in CSE, MBBS, B.Com, LLB, or ITI Trade Certificate"
                    value={newQualInput}
                    onChange={(e) => setNewQualInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddQualification())}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button type="button" size="sm" onClick={handleAddQualification} className="text-xs">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {requiredQualifications.map((q, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs flex items-center gap-1.5 bg-slate-100 text-slate-700">
                      {q}
                      <button
                        type="button"
                        onClick={() => setRequiredQualifications(requiredQualifications.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Statutory Licenses */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-amber-600" />
                  Statutory Professional Licenses (Optional for Regulated Professions)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. State Medical Council Registration, Bar Council of India Enrollment, Pharmacy Council"
                    value={newLicenseInput}
                    onChange={(e) => setNewLicenseInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLicense())}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleAddLicense} className="text-xs">
                    Add License
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {requiredLicenses.map((lic, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs flex items-center gap-1.5 bg-amber-50 text-amber-800 border-amber-300">
                      {lic}
                      <button
                        type="button"
                        onClick={() => setRequiredLicenses(requiredLicenses.filter((_, i) => i !== idx))}
                        className="text-amber-500 hover:text-amber-800"
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Compensation Disclosure */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center justify-between">
                <span>4. Transparent Compensation Disclosure</span>
                <label className="text-xs font-normal text-slate-500 inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDisclosed}
                    onChange={(e) => setIsDisclosed(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  Disclose Salary / Stipend in Listing
                </label>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {isDisclosed ? (
                opportunityType === "INTERNSHIP" || opportunityType === "APPRENTICESHIP" ? (
                  <div className="max-w-xs">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Monthly Stipend (₹ INR / month)
                    </label>
                    <input
                      type="number"
                      step={1000}
                      value={stipendMonthly}
                      onChange={(e) => setStipendMonthly(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Minimum CTC (₹ LPA - Lakhs Per Annum)
                      </label>
                      <input
                        type="number"
                        step={0.5}
                        value={minSalary}
                        onChange={(e) => setMinSalary(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Maximum CTC (₹ LPA - Lakhs Per Annum)
                      </label>
                      <input
                        type="number"
                        step={0.5}
                        value={maxSalary}
                        onChange={(e) => setMaxSalary(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                )
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Compensation will be displayed as &quot;Competitive / Commensurate with Skill Readiness&quot;.
                </p>
              )}
            </CardContent>
          </Card>

          {/* 5. Role Responsibilities & Description */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-800">
                5. Detailed Description & Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Summary Overview</label>
                <textarea
                  rows={3}
                  placeholder="Outline the mission, primary mandate and day-to-day impact of this role..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Key Responsibilities</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add specific deliverable or responsibility..."
                    value={newRespInput}
                    onChange={(e) => setNewRespInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddResponsibility())}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button type="button" size="sm" onClick={handleAddResponsibility} className="text-xs">
                    Add
                  </Button>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start justify-between gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                      <span>• {resp}</span>
                      <button
                        type="button"
                        onClick={() => setResponsibilities(responsibilities.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 text-sm leading-none px-1"
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Link href="/employer/opportunities">
            <Button variant="ghost" className="text-slate-600">
              Cancel
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => handleSubmit("DRAFT")}
              disabled={submitting}
              className="border-slate-200 text-slate-700"
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit("PUBLISHED")}
              disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-white shadow-sm"
            >
              {submitting ? "Publishing..." : "Publish Live"}
            </Button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
