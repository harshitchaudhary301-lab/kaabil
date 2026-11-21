"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Search,
  Plus,
  X,
  BookOpen,
  Compass,
  Award,
  Target,
  Languages,
  Check,
  Save,
  Loader2,
  AlertCircle,
  HelpCircle,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STREAMS_CONFIG } from "@/data/careersData";

// Curated interest pool across multiple streams & domains
const INTEREST_POOL = [
  { name: "Medical Research & Diagnostics", category: "Healthcare" },
  { name: "Patient Counseling & Healthcare", category: "Healthcare" },
  { name: "Artificial Intelligence & Coding", category: "STEM" },
  { name: "Data Science & Mathematics", category: "STEM" },
  { name: "Financial Markets & Stock Trading", category: "Finance" },
  { name: "Accounting & Auditing", category: "Finance" },
  { name: "Constitutional Law & Civil Rights", category: "Legal" },
  { name: "Corporate Contracts & M&A", category: "Legal" },
  { name: "Product Management & Startups", category: "Management" },
  { name: "Marketing & Brand Strategy", category: "Management" },
  { name: "UI/UX & Digital Product Design", category: "Design" },
  { name: "Animation, VFX & 3D Modeling", category: "Design" },
  { name: "Organic Agriculture & Soil Health", category: "Agriculture" },
  { name: "AgTech & Hydroponics", category: "Agriculture" },
  { name: "Industrial Automation & Robotics", category: "Trades" },
  { name: "Electrical Systems & Smart Grids", category: "Trades" },
  { name: "Sports Kinesiology & Athletic Coaching", category: "Sports" },
  { name: "Sports Analytics & Performance", category: "Sports" },
  { name: "Culinary Arts & Kitchen Operations", category: "Hospitality" },
  { name: "Hotel & Resort Management", category: "Hospitality" },
  { name: "Public Policy & Civil Services (UPSC)", category: "Humanities" },
  { name: "Journalism & Creative Writing", category: "Humanities" },
  { name: "Computational Biology & Genomics", category: "Interdisciplinary" },
  { name: "Climate Telemetry & Renewable Energy", category: "Interdisciplinary" },
];

// Curated skills pool with category tags
const SKILL_SUGGESTIONS = [
  { name: "Python Programming", category: "Technical" },
  { name: "SQL & Data Analysis", category: "Technical" },
  { name: "Biology Lab Protocols", category: "Healthcare" },
  { name: "First Aid & Patient Care", category: "Healthcare" },
  { name: "Financial Modeling", category: "Finance" },
  { name: "GST & Taxation Basics", category: "Finance" },
  { name: "Legal Case Briefing", category: "Legal" },
  { name: "Public Speaking & Debate", category: "Interpersonal" },
  { name: "Figma UI/UX Prototyping", category: "Design" },
  { name: "Graphic Design & Typography", category: "Design" },
  { name: "PLC Programming", category: "Trades" },
  { name: "Circuit Assembly & Testing", category: "Trades" },
  { name: "Athletic Conditioning", category: "Sports" },
  { name: "Food Safety & Quality Control", category: "Hospitality" },
  { name: "Academic Research & Writing", category: "Humanities" },
  { name: "Critical Thinking & Logic", category: "Analytical" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1: Education Stage & Institution
  const [educationStage, setEducationStage] = useState<string>("CLASS_12");
  const [institutionName, setInstitutionName] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [guardianConsent, setGuardianConsent] = useState(false);

  // STEP 2: Educational Streams
  const [primaryStream, setPrimaryStream] = useState<string>("NON_MEDICAL_PCM");
  const [selectedStreams, setSelectedStreams] = useState<string[]>(["NON_MEDICAL_PCM"]);

  // STEP 3: Interests & Passions
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Artificial Intelligence & Coding",
    "Data Science & Mathematics",
  ]);
  const [interestSearch, setInterestSearch] = useState("");
  const [customInterest, setCustomInterest] = useState("");

  // STEP 4: Self-Reported Skills
  const [skills, setSkills] = useState<Array<{ name: string; proficiency: "NOVICE" | "BEGINNER" | "INTERMEDIATE" | "PROFICIENT" | "EXPERT" }>>([
    { name: "Python Programming", proficiency: "BEGINNER" },
    { name: "Critical Thinking & Logic", proficiency: "INTERMEDIATE" },
  ]);
  const [customSkillName, setCustomSkillName] = useState("");

  // STEP 5: Career Goals
  const [goalType, setGoalType] = useState<string>("EXAM_PREP");
  const [targetRole, setTargetRole] = useState("AI Systems Engineer");
  const [targetYear, setTargetYear] = useState<number>(2026);
  const [goalNotes, setGoalNotes] = useState("");

  // STEP 6: Learning Preferences & Mentor Tone
  const [languagePreference, setLanguagePreference] = useState<string>("hinglish");
  const [preferredPace, setPreferredPace] = useState<string>("BALANCED");
  const [preferredStyle, setPreferredStyle] = useState<string>("PRACTICAL");
  const [weeklyHours, setWeeklyHours] = useState<number>(10);

  // State Management
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftToast, setDraftToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // DPDP Minor Evaluation
  const isMinor = ["CLASS_8", "CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"].includes(educationStage);

  // Fetch existing draft progress on mount
  useEffect(() => {
    async function loadDraft() {
      try {
        const res = await fetch("/api/student/onboarding/progress");
        if (res.ok) {
          const data = await res.json();
          if (data.stepData) {
            const d = data.stepData;
            if (d.educationStage) setEducationStage(d.educationStage);
            if (d.institutionName) setInstitutionName(d.institutionName);
            if (d.city) setCity(d.city);
            if (d.stateName) setStateName(d.stateName);
            if (d.primaryStream) setPrimaryStream(d.primaryStream);
            if (d.selectedStreams) setSelectedStreams(d.selectedStreams);
            if (d.interests) setSelectedInterests(d.interests);
            if (d.skills) setSkills(d.skills);
            if (d.targetRole) setTargetRole(d.targetRole);
            if (d.goalType) setGoalType(d.goalType);
            if (d.languagePreference) setLanguagePreference(d.languagePreference);
            if (data.currentStep && data.currentStep <= 7) {
              setCurrentStep(data.currentStep);
            }
          }
        }
      } catch {
        // Silent catch for initial unauthenticated draft check
      }
    }
    loadDraft();
  }, []);

  // Save draft to server
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setDraftToast(null);
    try {
      const draftPayload = {
        currentStep,
        stepData: {
          educationStage,
          institutionName,
          city,
          stateName,
          guardianConsent,
          primaryStream,
          selectedStreams,
          interests: selectedInterests,
          skills,
          goalType,
          targetRole,
          targetYear,
          goalNotes,
          languagePreference,
          preferredPace,
          preferredStyle,
          weeklyHours,
        },
      };

      const res = await fetch("/api/student/onboarding/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftPayload),
      });

      if (res.ok) {
        setDraftToast("Progress saved. You can safely return anytime!");
        setTimeout(() => setDraftToast(null), 3500);
      }
    } catch {
      setDraftToast("Note: Running in offline draft mode.");
      setTimeout(() => setDraftToast(null), 3000);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Toggle Stream selection
  const handleStreamToggle = (streamKey: string) => {
    if (primaryStream === streamKey) return; // Keep at least primary

    if (selectedStreams.includes(streamKey)) {
      setSelectedStreams(selectedStreams.filter((s) => s !== streamKey));
    } else {
      setSelectedStreams([...selectedStreams, streamKey]);
    }
  };

  // Toggle Interest selection
  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      if (selectedInterests.length >= 10) {
        setErrorMessage("You can select up to 10 key interest areas.");
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Add custom interest
  const handleAddCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      setSelectedInterests([...selectedInterests, customInterest.trim()]);
      setCustomInterest("");
    }
  };

  // Toggle or add Skill
  const handleSkillToggle = (skillName: string) => {
    const existingIndex = skills.findIndex((s) => s.name === skillName);
    if (existingIndex >= 0) {
      setSkills(skills.filter((s) => s.name !== skillName));
    } else {
      setSkills([...skills, { name: skillName, proficiency: "BEGINNER" }]);
    }
  };

  // Change skill proficiency
  const handleProficiencyChange = (
    skillName: string,
    proficiency: "NOVICE" | "BEGINNER" | "INTERMEDIATE" | "PROFICIENT" | "EXPERT"
  ) => {
    setSkills(
      skills.map((s) => (s.name === skillName ? { ...s, proficiency } : s))
    );
  };

  // Add custom skill
  const handleAddCustomSkill = () => {
    if (customSkillName.trim() && !skills.some((s) => s.name === customSkillName.trim())) {
      setSkills([...skills, { name: customSkillName.trim(), proficiency: "BEGINNER" }]);
      setCustomSkillName("");
    }
  };

  // Navigation handlers
  const handleNext = () => {
    setErrorMessage(null);

    if (currentStep === 1) {
      if (isMinor && !guardianConsent) {
        setErrorMessage("Please confirm parental/guardian consent as required under DPDP Act 2023 for school students.");
        return;
      }
    }

    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Final submission to /api/student/onboarding
  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const payload = {
      educationStage,
      primaryStream,
      selectedStreams,
      institutionName: institutionName.trim() || undefined,
      city: city.trim() || undefined,
      state: stateName.trim() || undefined,
      guardianConsent: isMinor ? guardianConsent : true,
      interests: selectedInterests,
      skills,
      careerGoal: {
        goalType,
        targetRole: targetRole.trim() || undefined,
        targetYear,
        notes: goalNotes.trim() || undefined,
      },
      learningPreferences: {
        preferredPace,
        preferredStyle,
        weeklyHoursAvailable: weeklyHours,
        primaryLanguage: languagePreference,
        allowAiMentoring: true,
      },
    };

    try {
      const res = await fetch("/api/student/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to complete onboarding calibration.");
        setIsLoading(false);
        return;
      }

      // Successful calibration -> navigate to dashboard
      router.push("/student/dashboard");
    } catch {
      setErrorMessage("Network error occurred during profile calibration.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Branding */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-soft-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold text-text-primary block leading-none">
                KAABIL
              </span>
              <span className="text-[10px] text-text-muted">Onboarding Engine</span>
            </div>
          </Link>

          {/* Save Draft Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="text-xs h-8 px-3 rounded-xl border-border bg-white"
            >
              {isSavingDraft ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1 text-primary" />
              )}
              <span>Save Progress</span>
            </Button>
          </div>
        </div>

        {/* Draft notification toast */}
        {draftToast && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{draftToast}</span>
          </div>
        )}

        {/* Step Progress Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary mb-2">
            <span>
              Step {currentStep} of 7:{" "}
              <strong className="text-primary">
                {currentStep === 1 && "Educational Stage & Minor Protection"}
                {currentStep === 2 && "Educational Streams & Exploration"}
                {currentStep === 3 && "Interests & Passion Signals"}
                {currentStep === 4 && "Self-Reported Competencies"}
                {currentStep === 5 && "Career Aspirations & Target Goals"}
                {currentStep === 6 && "AI Mentor & Learning Style"}
                {currentStep === 7 && "Digital Twin Profile Review"}
              </strong>
            </span>
            <span className="font-bold text-primary">{Math.round((currentStep / 7) * 100)}%</span>
          </div>

          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className={`h-full flex-1 transition-all duration-300 ${
                  s < currentStep
                    ? "bg-emerald-500"
                    : s === currentStep
                    ? "bg-primary"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Card */}
        <Card className="p-6 sm:p-10 border-border bg-white shadow-soft-lg rounded-3xl">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Please Complete Required Fields</span>
                <p className="text-[11px] leading-relaxed mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: Educational Stage & DPDP Minor Check */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  Step 01 / 07
                </span>
                <h2 className="font-heading text-2xl font-bold text-text-primary mt-0.5">
                  What is your current education stage?
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  KAABIL adapts its pathways for school learners, college students, and working professionals across India.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { id: "CLASS_8", label: "Class 8 (Secondary School)" },
                  { id: "CLASS_9", label: "Class 9 (Secondary School)" },
                  { id: "CLASS_10", label: "Class 10 (Secondary School)" },
                  { id: "CLASS_11", label: "Class 11 (Senior Secondary)" },
                  { id: "CLASS_12", label: "Class 12 (Senior Secondary)" },
                  { id: "DIPLOMA", label: "Polytechnic / Diploma" },
                  { id: "ITI", label: "ITI Technical Trade" },
                  { id: "UNDERGRADUATE", label: "Undergraduate (BA, BSc, BTech, etc.)" },
                  { id: "POSTGRADUATE", label: "Postgraduate (MA, MSc, MBA, etc.)" },
                  { id: "WORKING_PROFESSIONAL", label: "Working Professional / Transition" },
                  { id: "OTHER", label: "Other Learning Path" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEducationStage(item.id)}
                    className={`p-3.5 rounded-2xl border text-left font-medium transition-all ${
                      educationStage === item.id
                        ? "border-primary bg-primary/5 text-primary font-bold ring-2 ring-primary/20"
                        : "border-border bg-white text-text-secondary hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      {educationStage === item.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Institution details */}
              <div className="pt-2 border-t border-border space-y-4">
                <Input
                  label="School / College / Institution Name (Optional)"
                  type="text"
                  placeholder="e.g. Delhi Public School, IIT Delhi, Govt Polytechnic"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    type="text"
                    placeholder="e.g. Lucknow"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Input
                    label="State"
                    type="text"
                    placeholder="e.g. Uttar Pradesh"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                  />
                </div>
              </div>

              {/* DPDP Act Minor Shield */}
              {isMinor && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-emerald-900">
                        DPDP Act 2023 Minor Protection Active
                      </span>
                      <p className="text-[11px] leading-relaxed text-emerald-800 mt-0.5">
                        As a school student under 18, you are shielded by the Digital Personal Data Protection Act. Commercial recruiters cannot search or message you. Your profile remains 100% focused on self-discovery and skill building.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-start gap-2 pt-2 border-t border-emerald-200/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={guardianConsent}
                      onChange={(e) => setGuardianConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-emerald-950 font-medium leading-tight">
                      I confirm that my parent or legal guardian has permitted me to use KAABIL.
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: Educational Stream & Interdisciplinary Selection */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  Step 02 / 07
                </span>
                <h2 className="font-heading text-2xl font-bold text-text-primary mt-0.5">
                  Choose your educational stream & exploration focus
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Select your <strong>Primary Stream</strong>, and tap any additional streams you want to explore. KAABIL supports cross-domain career discovery.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {STREAMS_CONFIG.map((s) => {
                  const isPrimary = primaryStream === s.stream;
                  const isSelected = selectedStreams.includes(s.stream);

                  return (
                    <div
                      key={s.stream}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                        isPrimary
                          ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                          : isSelected
                          ? "border-secondary/40 bg-purple-50/50 text-text-primary"
                          : "border-border bg-white text-text-secondary hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-text-primary">{s.title}</span>
                            {isPrimary && (
                              <Badge variant="primary" className="text-[9px] py-0 px-1.5">
                                Primary
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-text-muted block mt-0.5 font-sans">
                            {s.hindiTitle}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => {
                                setPrimaryStream(s.stream);
                                if (!selectedStreams.includes(s.stream)) {
                                  setSelectedStreams([...selectedStreams, s.stream]);
                                }
                              }}
                              className="text-[10px] text-primary hover:underline px-1.5 py-0.5 rounded bg-white border border-border"
                            >
                              Make Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleStreamToggle(s.stream)}
                            className={`p-1 rounded-lg ${
                              isSelected
                                ? "bg-primary text-white"
                                : "bg-slate-100 text-slate-400 hover:text-text-primary"
                            }`}
                            aria-label="Toggle stream selection"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-text-secondary mt-2 line-clamp-2">
                        {s.shortDescription}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-border text-xs text-text-secondary flex items-center justify-between">
                <span>
                  Primary Stream: <strong>{primaryStream.replace(/_/g, " ")}</strong>
                </span>
                <span className="text-[11px] text-primary font-semibold">
                  {selectedStreams.length} stream{selectedStreams.length > 1 ? "s" : ""} selected for calibration
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: Interests & Passion Signals */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  Step 03 / 07
                </span>
                <h2 className="font-heading text-2xl font-bold text-text-primary mt-0.5">
                  What activities and domains excite you?
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Pick 3 to 10 interests. Our psychometric mapping uses these to compute career alignment.
                </p>
              </div>

              {/* Search & Custom Add */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-text-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search interests (e.g. AI, Medicine, Law, Finance)..."
                    value={interestSearch}
                    onChange={(e) => setInterestSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Add custom..."
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCustomInterest()}
                    className="w-36 px-3 py-2 text-xs rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomInterest}
                    className="h-9 px-2.5 rounded-xl border-border"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Selected Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-text-primary">
                  <span>Your Selected Interests ({selectedInterests.length}/10):</span>
                </div>
                <div className="flex flex-wrap gap-2 min-h-12 p-3 rounded-2xl bg-slate-50 border border-border">
                  {selectedInterests.length === 0 ? (
                    <span className="text-xs text-text-muted self-center">
                      Click tags below to select your interests.
                    </span>
                  ) : (
                    selectedInterests.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 text-primary font-semibold text-xs border border-primary/20 animate-in fade-in"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleInterestToggle(item)}
                          className="hover:text-rose-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Filtered Interest Pool */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-text-secondary block">
                  Suggested Interest Areas:
                </span>
                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
                  {INTEREST_POOL.filter(
                    (p) =>
                      !selectedInterests.includes(p.name) &&
                      p.name.toLowerCase().includes(interestSearch.toLowerCase())
                  ).map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleInterestToggle(p.name)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium border border-border bg-white hover:border-primary hover:bg-slate-50 text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5"
                    >
                      <Plus className="h-3 w-3 text-text-muted" />
                      <span>{p.name}</span>
                      <span className="text-[9px] text-text-muted bg-slate-100 px-1.5 py-0.5 rounded">
                        {p.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: Self-Reported Skills & Competencies */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  Step 04 / 07
                </span>
                <h2 className="font-heading text-2xl font-bold text-text-primary mt-0.5">
                  Which skills do you already possess or practice?
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Self-report your baseline capabilities. You will later have opportunities to verify them through AI missions and earn credentials.
                </p>
              </div>

              {/* Custom Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add any specific skill (e.g. Java, Public Policy, Ind AS Auditing, Tennis)..."
                  value={customSkillName}
                  onChange={(e) => setCustomSkillName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomSkill()}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomSkill}
                  className="rounded-xl border-border px-3"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Skill
                </Button>
              </div>

              {/* Current Skills with Proficiency Pickers */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-text-primary block">
                  Calibrated Skills ({skills.length}):
                </span>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {skills.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-border text-center text-xs text-text-muted">
                      No skills added yet. Select from suggestions below or type your own.
                    </div>
                  ) : (
                    skills.map((sk) => (
                      <div
                        key={sk.name}
                        className="p-3 rounded-2xl border border-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-soft-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold text-xs text-text-primary">{sk.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex rounded-lg bg-slate-100 p-0.5 border border-border text-[10px]">
                            {(["BEGINNER", "INTERMEDIATE", "PROFICIENT", "EXPERT"] as const).map(
                              (lvl) => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => handleProficiencyChange(sk.name, lvl)}
                                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                                    sk.proficiency === lvl
                                      ? "bg-white text-primary font-bold shadow-soft-xs"
                                      : "text-text-muted hover:text-text-primary"
                                  }`}
                                >
                                  {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                                </button>
                              )
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSkillToggle(sk.name)}
                            className="text-text-muted hover:text-rose-600 p-1"
                            aria-label="Remove skill"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-xs font-semibold text-text-secondary block">
                  Click to add common benchmark skills:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS.filter(
                    (s) => !skills.some((userSk) => userSk.name === s.name)
                  ).map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => handleSkillToggle(s.name)}
                      className="px-2.5 py-1 rounded-xl text-xs font-medium border border-border bg-slate-50 hover:bg-white hover:border-primary text-text-secondary transition-all flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3 text-primary" />
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: Career Goals & Immediate Aspirations */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  Step 05 / 07
                </span>
                <h2 className="font-heading text-2xl font-bold text-text-primary mt-0.5">
                  What is your primary milestone right now?
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  KAABIL will tailor your initial 4-week dynamic roadmap and AI missions around this objective.
                </p>
              </div>

              {/* Goal Type Choice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  {
                    id: "EXAM_PREP",
                    title: "Entrance Exam Preparation",
                    desc: "Targeting national/state exams (NEET, JEE, CUET, CLAT, CAT, UPSC, NDA)",
                  },
                  {
                    id: "COLLEGE_ADMISSIONS",
                    title: "Higher Education & Degrees",
                    desc: "Preparing for Bachelor's, Master's, or vocational diploma admissions",
                  },
                  {
                    id: "SKILL_ACQUISITION",
                    title: "Skill Verification & Portfolio",
                    desc: "Building verified competencies and real-world project credentials",
                  },
                  {
                    id: "CAREER_DISCOVERY",
                    title: "Career & Aptitude Discovery",
                    desc: "Exploring multiple streams to identify highest potential career matches",
                  },
                  {
                    id: "EMPLOYMENT_READINESS",
                    title: "Internship & Job Readiness (18+)",
                    desc: "Building a verified resume and preparing for technical interviews",
                    disabled: isMinor,
                  },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    disabled={g.disabled}
                    onClick={() => setGoalType(g.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                      goalType === g.id
                        ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                        : g.disabled
                        ? "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                        : "border-border bg-white text-text-secondary hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-text-primary text-xs">{g.title}</h4>
                      {goalType === g.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{g.desc}</p>
                    {g.disabled && (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-2 inline-block">
                        Locked for minors under DPDP Act
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Target Role & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
                <div className="sm:col-span-2">
                  <Input
                    label="Target Dream Role or Title"
                    type="text"
                    placeholder="e.g. AI Research Engineer, High Court Advocate, Civil Surgeon"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Target Completion Year
                  </label>
                  <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {[2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Any specific notes or questions for your AI Career Mentor? (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. I am strong in mathematics but want to explore how it connects to economics or machine learning..."
                  value={goalNotes}
                  onChange={(e) => setGoalNotes(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-white p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: Learning Preferences & AI Mentor Calibration */}
          {/* ========================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  Step 06 / 07
                </span>
                <h2 className="font-heading text-2xl font-bold text-text-primary mt-0.5">
                  How should your AI Mentor assist you?
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Customize the language dialect, learning style, and weekly study schedule.
                </p>
              </div>

              {/* Language Dialect Selection */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-text-primary block">
                  Preferred Mentor Language:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "en", label: "Formal English", sub: "Clear, academic & international" },
                    { id: "hinglish", label: "Hinglish (Colloquial)", sub: "Natural conversational Indian blend" },
                    { id: "hi", label: "हिन्दी (Hindi)", sub: "सहज व स्पष्ट भाषा" },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setLanguagePreference(lang.id)}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        languagePreference === lang.id
                          ? "border-primary bg-primary/5 text-primary font-bold ring-2 ring-primary/20"
                          : "border-border bg-white text-text-secondary hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-heading text-xs font-bold block">{lang.label}</span>
                      <span className="text-[10px] text-text-muted mt-0.5 block">{lang.sub}</span>
                    </button>
                  ))}
                </div>

                {/* Tone Preview */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-border text-xs text-text-secondary">
                  <span className="font-bold text-text-primary block mb-0.5">Mentor Voice Sample:</span>
                  <p className="italic text-slate-600 text-[11px]">
                    {languagePreference === "hi"
                      ? "“नमस्ते! आपके लक्ष्य और रुचि के आधार पर, मैंने आपके लिए एक अनुकूलित अध्ययन योजना तैयार की है।”"
                      : languagePreference === "hinglish"
                      ? "“Namaste! Aapke career goals aur verified skills ke according, humne aapka adaptive action plan configure kar diya hai.”"
                      : "“Welcome! Based on your target goals and verified competencies, we have calibrated your customized 4-week roadmap.”"}
                  </p>
                </div>
              </div>

              {/* Learning Style & Pace */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Learning Style
                  </label>
                  <select
                    value={preferredStyle}
                    onChange={(e) => setPreferredStyle(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="PRACTICAL">Practical & Project-Based</option>
                    <option value="THEORETICAL">Concept & Theory First</option>
                    <option value="EXAM_ORIENTED">Exam Drills & Mock Question Practice</option>
                    <option value="MENTOR_GUIDED">Interactive Q&A with AI Mentor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Weekly Commitment Available
                  </label>
                  <select
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value={5}>Light (3–5 hours / week)</option>
                    <option value={10}>Balanced (8–12 hours / week)</option>
                    <option value={18}>Intensive (15–20 hours / week)</option>
                    <option value={30}>Full-Time Prep (25+ hours / week)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 7: Calibration Review & Profile Confirmation */}
          {/* ========================================================================= */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Step 07 / 07 • Final Review
                </span>
                <h2 className="font-heading text-2xl font-bold text-text-primary mt-0.5">
                  Confirm your Career Digital Twin
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Review your calibrated inputs below. You can update any section before finalizing.
                </p>
              </div>

              {/* Review Card */}
              <div className="space-y-3">
                {/* Stage & Institution */}
                <div className="p-4 rounded-2xl border border-border bg-slate-50 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-text-muted">Education Stage</span>
                    <h4 className="font-bold text-xs text-text-primary">
                      {educationStage.replace(/_/g, " ")}{" "}
                      {institutionName ? `• ${institutionName}` : ""}
                    </h4>
                    <p className="text-[11px] text-text-secondary">
                      {city ? `${city}, ` : ""}
                      {stateName || "India"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Streams */}
                <div className="p-4 rounded-2xl border border-border bg-slate-50 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-text-muted">Educational Streams</span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      <Badge variant="primary" className="text-xs">
                        Primary: {primaryStream.replace(/_/g, " ")}
                      </Badge>
                      {selectedStreams
                        .filter((s) => s !== primaryStream)
                        .map((s) => (
                          <Badge key={s} variant="outline" className="text-xs bg-white">
                            {s.replace(/_/g, " ")}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Interests & Skills */}
                <div className="p-4 rounded-2xl border border-border bg-slate-50 flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-text-muted">
                      Interests ({selectedInterests.length}) & Skills ({skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedInterests.slice(0, 5).map((i) => (
                        <span key={i} className="text-[10px] bg-slate-200/80 text-text-primary px-2 py-0.5 rounded-md">
                          {i}
                        </span>
                      ))}
                      {selectedInterests.length > 5 && (
                        <span className="text-[10px] text-text-muted self-center">
                          +{selectedInterests.length - 5} more
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {skills.map((s) => (
                        <span key={s.name} className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-md">
                          {s.name} ({s.proficiency})
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Target Role & Mentor */}
                <div className="p-4 rounded-2xl border border-border bg-slate-50 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-text-muted">Target Goal & Mentor</span>
                    <h4 className="font-bold text-xs text-text-primary">
                      {targetRole || "Career Exploration"} (Target: {targetYear})
                    </h4>
                    <p className="text-[11px] text-text-secondary">
                      Language: {languagePreference.toUpperCase()} • Style: {preferredStyle} • Commitment: {weeklyHours} hrs/week
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Safety & Compliance Badge */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      {isMinor
                        ? "DPDP Act 2023 Child Privacy Mode: Complete recruiter exclusion active."
                        : "DPDP Act 2023 Compliant: Verified private student profile."}
                    </span>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={isLoading}
                className="rounded-xl border-border"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 7 ? (
              <Button
                variant="gradient"
                size="sm"
                onClick={handleNext}
                className="rounded-xl px-4"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="sm"
                onClick={handleFinalSubmit}
                disabled={isLoading}
                className="rounded-xl px-5 py-2.5 font-bold shadow-soft-md"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Calibrating Digital Twin...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Initialize Student Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
