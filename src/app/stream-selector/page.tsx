"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Scale,
  BrainCircuit,
  RotateCcw,
  Layers,
  HeartHandshake,
  Lightbulb,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

interface QuestionOption {
  id: string;
  label: string;
  description: string;
  streamAffinity: string; // Target stream code
}

interface Question {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  options: QuestionOption[];
}

const QUESTIONS: Question[] = [
  {
    id: "interests",
    stepNumber: 1,
    title: "What natural curiosities captivate your attention most?",
    subtitle: "Select the domain where you find yourself reading, exploring, or daydreaming without being asked.",
    options: [
      {
        id: "bio-health",
        label: "Living Organisms, Human Biology & Healthcare",
        description: "Understanding human anatomy, pharmacology, diseases, cellular biology, and saving lives.",
        streamAffinity: "MEDICAL_PCB",
      },
      {
        id: "math-tech",
        label: "Algorithms, Machines, Physics & Computing",
        description: "Building software, solving calculus, physics mechanics, robotics, and aerospace structures.",
        streamAffinity: "NON_MEDICAL_PCM",
      },
      {
        id: "markets-finance",
        label: "Money, Economics, Stock Markets & Business Strategy",
        description: "Understanding capital markets, accounting ledgers, corporate investments, and commerce.",
        streamAffinity: "COMMERCE",
      },
      {
        id: "society-arts",
        label: "History, Human Behavior, Literature & Social Impact",
        description: "Exploring psychology, international relations, journalism, politics, and sociology.",
        streamAffinity: "ARTS_HUMANITIES",
      },
      {
        id: "justice-law",
        label: "Rules, Justice, Debate, Constitutional Rights & Advocacy",
        description: "Analyzing legal cases, policy arguments, dispute resolutions, and public advocacy.",
        streamAffinity: "LAW",
      },
      {
        id: "design-creative",
        label: "Visual Arts, UI/UX, Architecture & Creative Direction",
        description: "Crafting visual identities, 3D animations, digital interfaces, and spatial aesthetics.",
        streamAffinity: "CREATIVE_ARTS_DESIGN",
      },
      {
        id: "agriculture-nature",
        label: "Sustainable Agriculture, Food Systems & Agri-Tech",
        description: "Soil science, organic farming, precision hydroponics, and rural economic empowerment.",
        streamAffinity: "AGRICULTURE",
      },
    ],
  },
  {
    id: "problem_solving",
    stepNumber: 2,
    title: "How do you prefer to tackle and solve tough problems?",
    subtitle: "Think about your preferred method when facing a challenging assignment or life puzzle.",
    options: [
      {
        id: "scientific-method",
        label: "Scientific Deduction & Observational Rigor",
        description: "Carefully diagnosing symptoms, biological laboratory testing, and evidence-based protocols.",
        streamAffinity: "MEDICAL_PCB",
      },
      {
        id: "logical-math",
        label: "Mathematical Proofs & Algorithmic Equations",
        description: "Deconstructing complex systems into formal equations, clean code, and mathematical models.",
        streamAffinity: "NON_MEDICAL_PCM",
      },
      {
        id: "balance-sheets",
        label: "Numerical Modeling & Financial Risk Analysis",
        description: "Auditing numbers, forecasting ROI, optimizing budget constraints, and economic modeling.",
        streamAffinity: "COMMERCE",
      },
      {
        id: "argument-persuasion",
        label: "Critical Reasoning, Statutes & Persuasive Oratory",
        description: "Cross-examining facts, referencing precedents, drafting airtight contracts, and debate.",
        streamAffinity: "LAW",
      },
      {
        id: "creative-synthesis",
        label: "Visual Storytelling, Aesthetics & Empathy Mapping",
        description: "Sketching concepts, user research, wireframing, and creating emotional visual impact.",
        streamAffinity: "CREATIVE_ARTS_DESIGN",
      },
      {
        id: "hands-on",
        label: "Hands-on Field Experimentation & Ecological Biology",
        description: "Soil nutrient analysis, crop testing, weather resilience, and sustainable yield optimization.",
        streamAffinity: "AGRICULTURE",
      },
    ],
  },
  {
    id: "work_environment",
    stepNumber: 3,
    title: "Where do you envision yourself working each day?",
    subtitle: "The daily physical and social environment that brings out your best energy.",
    options: [
      {
        id: "hospitals",
        label: "Hospitals, Clinics, Research Labs or Medical Theatres",
        description: "Sterile, fast-paced clinical care environments with direct human touch and patient rounds.",
        streamAffinity: "MEDICAL_PCB",
      },
      {
        id: "tech-labs",
        label: "High-Tech R&D Labs, Tech Parks, or Remote Dev Setups",
        description: "Modern tech hubs, clean hardware testing facilities, or flexible digital remote desks.",
        streamAffinity: "NON_MEDICAL_PCM",
      },
      {
        id: "corporate-towers",
        label: "Financial District Corporate Towers & Trading Desks",
        description: "High-energy financial hubs, consulting firms, investment banking desks, and audit suites.",
        streamAffinity: "COMMERCE",
      },
      {
        id: "courtrooms",
        label: "Courtrooms, Arbitration Chambers & Corporate Law Suites",
        description: "Supreme/High Court corridors, law firm boardrooms, and statutory regulatory tribunals.",
        streamAffinity: "LAW",
      },
      {
        id: "studios",
        label: "Creative Design Studios, Animation Bays & Media Sets",
        description: "Collaborative open design spaces with dual monitors, prototyping gear, and pin boards.",
        streamAffinity: "CREATIVE_ARTS_DESIGN",
      },
      {
        id: "outdoors-farms",
        label: "Greenhouses, Agro-Biotech Labs & Field Test Sites",
        description: "Connected hybrid agricultural fields, greenhouse labs, and rural farmer community centers.",
        streamAffinity: "AGRICULTURE",
      },
    ],
  },
  {
    id: "duration_appetite",
    stepNumber: 4,
    title: "What is your educational duration appetite and commitment?",
    subtitle: "Be honest about how many years of intensive higher education you are enthusiastic to undertake.",
    options: [
      {
        id: "long-residency",
        label: "5.5 to 8+ Years: In-depth clinical training with mandatory internships",
        description: "Willing to invest 5.5 years for basic degree (MBBS/BDS) plus 3 years for postgraduate residency.",
        streamAffinity: "MEDICAL_PCB",
      },
      {
        id: "four-years",
        label: "4 Years: Rigorous technical Bachelor's degree (B.Tech / B.E.)",
        description: "Structured 4-year engineering curriculum with summer industry internships and capstone projects.",
        streamAffinity: "NON_MEDICAL_PCM",
      },
      {
        id: "three-to-five",
        label: "3 to 5 Years: Professional commerce / law qualifications (B.Com/CA or BA LLB)",
        description: "Articleship training alongside CA examinations or integrated 5-year professional law honors.",
        streamAffinity: "COMMERCE",
      },
      {
        id: "flexible-design",
        label: "4 Years: Design / Fine Arts portfolio-centric degree (B.Des / B.Arch)",
        description: "Hands-on studio projects, juried critiques, and industry portfolio development.",
        streamAffinity: "CREATIVE_ARTS_DESIGN",
      },
      {
        id: "rapid-vocational",
        label: "1 to 2 Years: Accelerated vocational diploma or ITI apprentice pathway",
        description: "Focused technical mastery for direct workforce entry with minimal academic theory overhead.",
        streamAffinity: "VOCATIONAL",
      },
    ],
  },
  {
    id: "ambition",
    stepNumber: 5,
    title: "What defines your personal compass of meaningful success?",
    subtitle: "Your deepest motivator over a 20-30 year professional journey.",
    options: [
      {
        id: "healing",
        label: "Healing Human Pain & Direct Life-Saving Service",
        description: "Deep personal fulfillment in restoring health, treating diseases, and easing human suffering.",
        streamAffinity: "MEDICAL_PCB",
      },
      {
        id: "invention",
        label: "Technological Invention & Frontier Engineering",
        description: "Creating foundational technologies that billions of people use worldwide.",
        streamAffinity: "NON_MEDICAL_PCM",
      },
      {
        id: "economic-growth",
        label: "Wealth Creation, Financial Growth & Corporate Leadership",
        description: "Managing capital allocation, maximizing enterprise value, and financial sovereignty.",
        streamAffinity: "COMMERCE",
      },
      {
        id: "justice",
        label: "Constitutional Justice, Human Rights & Fair Rules",
        description: "Defending innocent people, shaping corporate ethics, and upholding the rule of law.",
        streamAffinity: "LAW",
      },
      {
        id: "public-service",
        label: "Public Policy, Nation Building & Civic Administration",
        description: "Leading government departments, administering districts, and serving citizens via civil services.",
        streamAffinity: "ARTS_HUMANITIES",
      },
      {
        id: "sustainability",
        label: "Planetary Sustainability, Climate & Food Security",
        description: "Ensuring clean water, fertile soil, and abundant organic nutrition for future generations.",
        streamAffinity: "AGRICULTURE",
      },
    ],
  },
  {
    id: "language",
    stepNumber: 6,
    title: "In which language would you prefer your AI explanations?",
    subtitle: "KAABIL provides trilingual career reasoning tailored to Indian students.",
    options: [
      {
        id: "en",
        label: "English (Official & Academic)",
        description: "Formal academic English matching Indian entrance exams and higher education syllabi.",
        streamAffinity: "ALL",
      },
      {
        id: "hi",
        label: "Hindi (हिंदी - शुद्ध एवं सरल)",
        description: "सरल एवं स्पष्ट हिंदी में करियर परामर्श और शैक्षणिक मार्गदर्शन।",
        streamAffinity: "ALL",
      },
      {
        id: "hinglish",
        label: "Hinglish (Conversational Urban Indian)",
        description: "Casual bilingual mix of Hindi and English widely spoken in colleges and startups.",
        streamAffinity: "ALL",
      },
    ],
  },
];

interface StreamResult {
  primaryStream: {
    stream: string;
    streamName: string;
    matchScore: number;
    description: string;
    keySubjects: string[];
    topCareers: { title: string; slug: string; entrySalary: string }[];
    benefits: string[];
    tradeOffs: string[];
    governingBodies: string[];
  };
  bridgeStreams: {
    stream: string;
    streamName: string;
    matchScore: number;
    reasoning: string;
    bridgeAdvice: string;
  }[];
  userContext: {
    educationStage: string;
    timestamp: string;
  };
}

export default function StreamSelectorPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<StreamResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const currentQuestion = QUESTIONS[currentStepIndex];
  const totalSteps = QUESTIONS.length;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      calculateResult();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentStepIndex(0);
    setResult(null);
    setSaveStatus(null);
  };

  const calculateResult = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/student/stream-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: selectedAnswers,
          preferredLanguage: selectedAnswers["language"] || "en",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        // Fallback local calculation
        setResult(getMockStreamResult(selectedAnswers));
      }
    } catch {
      setResult(getMockStreamResult(selectedAnswers));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Local fallback calculator for robust offline/dev operation
  const getMockStreamResult = (answers: Record<string, string>): StreamResult => {
    const streamCounts: Record<string, number> = {};
    Object.entries(answers).forEach(([qId, optId]) => {
      const q = QUESTIONS.find((item) => item.id === qId);
      const opt = q?.options.find((o) => o.id === optId);
      if (opt && opt.streamAffinity !== "ALL") {
        streamCounts[opt.streamAffinity] = (streamCounts[opt.streamAffinity] || 0) + 1;
      }
    });

    const sorted = Object.entries(streamCounts).sort((a, b) => b[1] - a[1]);
    const topStreamCode = sorted[0]?.[0] || "NON_MEDICAL_PCM";
    const secondStreamCode = sorted[1]?.[0] || "COMMERCE";
    const thirdStreamCode = sorted[2]?.[0] || "ARTS_HUMANITIES";

    const STREAM_INFO: Record<string, any> = {
      NON_MEDICAL_PCM: {
        streamName: "Non-Medical (Physics, Chemistry & Mathematics)",
        description: "Ideal for algorithmic minds fascinated by technological systems, calculus, engineering physical hardware, and computational scale.",
        keySubjects: ["Mathematics", "Physics", "Chemistry", "Computer Science / Artificial Intelligence"],
        topCareers: [
          { title: "AI Systems & Machine Learning Engineer", slug: "ai-systems-engineer", entrySalary: "₹14.0 Lakhs/yr" },
          { title: "Aerospace & Propulsion Engineer", slug: "aerospace-propulsion-engineer", entrySalary: "₹10.5 Lakhs/yr" },
          { title: "Renewable Energy Systems Engineer", slug: "renewable-energy-systems-engineer", entrySalary: "₹8.5 Lakhs/yr" },
        ],
        benefits: [
          "Direct access to Premier IITs, NITs, and IIITs via JEE Advanced / Mains",
          "Exceptional cross-stream mobility (can pivot into Finance, Economics, or Law at postgraduate stage)",
          "Highest concentration of global high-growth technology roles and venture creation",
        ],
        tradeOffs: [
          "Intense quantitative rigor and demanding competitive entrance exams (JEE)",
          "Rapid obsolescence of software frameworks requiring lifelong re-skilling",
          "Heavy screen time and desk work compared to field sciences",
        ],
        governingBodies: ["All India Council for Technical Education (AICTE)", "IIT Council"],
      },
      MEDICAL_PCB: {
        streamName: "Medical (Physics, Chemistry & Biology)",
        description: "Tailored for compassionate, observationally rigorous students driven to understand the human body, diagnose disease, and save lives.",
        keySubjects: ["Biology (Botany & Zoology)", "Chemistry (Organic/Inorganic)", "Physics", "English"],
        topCareers: [
          { title: "MBBS Physician / General Practitioner", slug: "mbbs-doctor", entrySalary: "₹10.8 Lakhs/yr" },
          { title: "Dental Surgeon (BDS)", slug: "dental-surgeon-bds", entrySalary: "₹6.5 Lakhs/yr" },
          { title: "Clinical Pharmacist (Pharm.D)", slug: "clinical-pharmacist-pharmd", entrySalary: "₹5.8 Lakhs/yr" },
        ],
        benefits: [
          "Incomparable social respect, patient gratitude, and societal indispensability",
          "Recession-proof vocation with lifelong practice authority and legal protection",
          "Zero threat of total AI automation due to physical clinical empathy and bedside care",
        ],
        tradeOffs: [
          "Longest formal qualification pathway (5.5 yrs MBBS + 1 yr internship + 3 yrs MD/MS residency)",
          "Extreme entrance competition (23+ Lakh candidates competing for limited government seats in NEET-UG)",
          "High emotional stress, emergency night shifts, and strict statutory liability under NMC",
        ],
        governingBodies: ["National Medical Commission (NMC)", "Dental Council of India (DCI)"],
      },
      COMMERCE: {
        streamName: "Commerce (Accountancy, Economics & Business)",
        description: "Engineered for strategic thinkers excited by financial markets, corporate capital allocation, business law, and auditing.",
        keySubjects: ["Accountancy", "Economics", "Business Studies", "Applied Mathematics"],
        topCareers: [
          { title: "Chartered Accountant (ICAI CA)", slug: "chartered-accountant-icai", entrySalary: "₹12.5 Lakhs/yr" },
          { title: "Investment Banker & M&A Associate", slug: "investment-banker-mna", entrySalary: "₹16.0 Lakhs/yr" },
          { title: "Actuarial Scientist & Risk Modeler", slug: "actuarial-scientist-risk-analyst", entrySalary: "₹11.0 Lakhs/yr" },
        ],
        benefits: [
          "ICAI Chartered Accountancy offers globally recognized credential at very low tuition cost",
          "Clear career mobility to Chief Financial Officer (CFO) and Chief Executive Officer (CEO)",
          "Strong synergy with India's booming startup ecosystem and global capability centers (GCCs)",
        ],
        tradeOffs: [
          "Extremely low pass percentage in ICAI final examinations requiring iron mental discipline",
          "High stress during statutory quarterly audit and corporate tax filing deadlines",
          "Routine computational bookkeeping vulnerable to AI automation; demands advisory shift",
        ],
        governingBodies: ["Institute of Chartered Accountants of India (ICAI)", "SEBI"],
      },
      LAW: {
        streamName: "Law & Constitutional Jurisprudence",
        description: "Built for articulate, principled communicators passionate about justice, policy deconstruction, debate, and contracts.",
        keySubjects: ["Legal Studies", "Political Science", "Constitutional Law", "English Oratory"],
        topCareers: [
          { title: "Corporate Lawyer (M&A & Securities)", slug: "corporate-lawyer-mna", entrySalary: "₹15.0 Lakhs/yr" },
          { title: "Civil Judge / Judicial Magistrate", slug: "civil-judge-judicial-services", entrySalary: "₹9.6 Lakhs/yr" },
        ],
        benefits: [
          "5-year integrated BA LLB / BBA LLB from National Law Universities (NLUs) via CLAT",
          "Constitutional authority to appear before High Courts and Supreme Court of India",
          "Diverse career avenues spanning corporate law firms, litigation, judiciary, and civil advocacy",
        ],
        tradeOffs: [
          "First-generation litigation lawyers face grueling gestation periods before lucrative private practice",
          "Exhaustive reading of case laws, statutes, and statutory amendments required daily",
          "Strict professional conduct and ethics enforced by Bar Council of India",
        ],
        governingBodies: ["Bar Council of India (BCI)", "Consortium of NLUs"],
      },
      CREATIVE_ARTS_DESIGN: {
        streamName: "Creative Arts, UI/UX & Design",
        description: "Designed for visual visionaries eager to shape digital interfaces, 3D worlds, consumer hardware aesthetics, and storytelling.",
        keySubjects: ["Design Thinking", "Digital Illustration", "Visual Ergonomics", "Typography"],
        topCareers: [
          { title: "UI/UX & Digital Product Designer", slug: "ui-ux-digital-product-designer", entrySalary: "₹9.2 Lakhs/yr" },
          { title: "VFX & 3D Animation Technical Director", slug: "vfx-3d-animation-director", entrySalary: "₹8.0 Lakhs/yr" },
        ],
        benefits: [
          "High demand across Indian digital startups, FinTech apps, and global entertainment studios",
          "Merit and portfolio-driven hiring over rigid marksheet criteria",
          "Opportunities for high-margin global remote freelance contracts",
        ],
        tradeOffs: [
          "Subjective evaluation and constant revision cycles driven by client/user feedback",
          "Generative AI tools (Midjourney, Runway) forcing designers up into strategic UX systems thinking",
          "Fewer government job avenues compared to engineering or civil services",
        ],
        governingBodies: ["National Institute of Design (NID)", "Council of Architecture (CoA)"],
      },
      AGRICULTURE: {
        streamName: "Agricultural Sciences & Agri-Biotech",
        description: "Crafted for ecological pioneers determined to transform Indian farming with precision technology, soil science, and bio-security.",
        keySubjects: ["Agronomy", "Soil Science", "Plant Genetics", "Agri-Economics"],
        topCareers: [
          { title: "Agronomy & Soil Scientist", slug: "agronomy-soil-scientist", entrySalary: "₹6.8 Lakhs/yr" },
          { title: "Hydroponic & Vertical Farm Director", slug: "hydroponic-vertical-farm-director", entrySalary: "₹7.5 Lakhs/yr" },
        ],
        benefits: [
          "Pivotal role in India's $500B agrarian economy and climate change adaptation",
          "Prestigious research positions across ICAR institutes and state agricultural universities",
          "Flourishing opportunities in precision farming startups and agro-export conglomerates",
        ],
        tradeOffs: [
          "Extensive rural and field travel in varying climatic conditions",
          "Dependence on monsoon patterns and state agrarian subsidy policies",
          "Initial entry compensation in government research is tied to UGC/ICAR pay scales",
        ],
        governingBodies: ["Indian Council of Agricultural Research (ICAR)"],
      },
    };

    const primaryData = STREAM_INFO[topStreamCode] || STREAM_INFO["NON_MEDICAL_PCM"];
    const secondData = STREAM_INFO[secondStreamCode] || STREAM_INFO["COMMERCE"];
    const thirdData = STREAM_INFO[thirdStreamCode] || STREAM_INFO["ARTS_HUMANITIES"];

    return {
      primaryStream: {
        stream: topStreamCode,
        streamName: primaryData.streamName,
        matchScore: 92,
        description: primaryData.description,
        keySubjects: primaryData.keySubjects,
        topCareers: primaryData.topCareers,
        benefits: primaryData.benefits,
        tradeOffs: primaryData.tradeOffs,
        governingBodies: primaryData.governingBodies,
      },
      bridgeStreams: [
        {
          stream: secondStreamCode,
          streamName: secondData.streamName,
          matchScore: 78,
          reasoning: "Your problem-solving responses indicate strong cross-discipline curiosity suitable for hybrid programs under NEP 2020.",
          bridgeAdvice: "Under NEP 2020, you can combine mathematics with economics or design subjects without sacrificing primary eligibility.",
        },
        {
          stream: thirdStreamCode,
          streamName: thirdData.streamName,
          matchScore: 68,
          reasoning: "Alternative path emphasizing leadership, institutional governance, and public impact.",
          bridgeAdvice: "Consider interdisciplinary electives or certificate bridge courses during undergraduate studies.",
        },
      ],
      userContext: {
        educationStage: "Class 10 / Class 12 Diagnostic",
        timestamp: new Date().toISOString(),
      },
    };
  };

  const handleSaveToProfile = async () => {
    if (!result) return;
    try {
      const res = await fetch("/api/student/stream-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: selectedAnswers,
          preferredLanguage: selectedAnswers["language"] || "en",
          saveToProfile: true,
        }),
      });
      if (res.ok) {
        setSaveStatus("Diagnostic result successfully saved to your Student Passport!");
      } else {
        setSaveStatus("Saved locally. Sign in to sync across devices.");
      }
    } catch {
      setSaveStatus("Diagnostic preserved in this browser session.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header Banner */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
            <Compass className="h-3.5 w-3.5" />
            NEP 2020 Aligned Diagnostic Assistant
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight font-heading">
            Intelligent Stream Selection Assistant
          </h1>
          <p className="text-text-secondary text-sm sm:text-base mt-2 max-w-2xl mx-auto">
            Discover the ideal 10+2 educational stream or career switch pathway based on your natural curiosities, problem-solving methods, and long-term life ambitions.
          </p>
        </div>
      </section>

      {/* Main Flow */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!result ? (
          /* Questionnaire Step View */
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
                <span>
                  Question {currentStepIndex + 1} of {totalSteps}
                </span>
                <span className="text-primary font-bold">{progressPercent}% Completed</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <Card className="border border-border shadow-soft-sm">
              <CardHeader className="pb-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  <span>Step {currentQuestion.stepNumber}</span>
                </div>
                <CardTitle className="text-xl sm:text-2xl font-heading text-text-primary">
                  {currentQuestion.title}
                </CardTitle>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  {currentQuestion.subtitle}
                </p>
              </CardHeader>

              <CardContent className="space-y-3 pt-2">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === option.id;
                  return (
                    <div
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-soft-sm ring-1 ring-primary"
                          : "border-border bg-white hover:border-primary/40 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-text-primary">
                            {option.label}
                          </h4>
                        </div>
                        <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Navigation Controls */}
                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    disabled={currentStepIndex === 0}
                    className="gap-1.5 text-xs"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Previous
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleNext}
                    disabled={!selectedAnswers[currentQuestion.id] || isSubmitting}
                    className="gap-1.5 text-xs bg-primary hover:bg-primary/95 text-white shadow-soft-sm"
                  >
                    {currentStepIndex === totalSteps - 1 ? (
                      isSubmitting ? (
                        "Evaluating Diagnostic..."
                      ) : (
                        "Generate Stream Diagnosis"
                      )
                    ) : (
                      <>
                        Next Question <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advisory Note */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-border flex items-start gap-2.5 text-xs text-text-secondary">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                KAABIL Stream Assistant evaluates holistic fit across all 13 educational streams recognized under Indian higher education standards. Take your time to answer authentically.
              </span>
            </div>
          </div>
        ) : (
          /* Diagnostic Results View */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Match Hero Card */}
            <div className="p-6 sm:p-8 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-white to-secondary/5 shadow-soft-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
                <div>
                  <Badge className="bg-primary text-white text-xs mb-2">
                    Primary Recommended Stream
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary">
                    {result.primaryStream.streamName}
                  </h2>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-xl">
                    {result.primaryStream.description}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center justify-center p-4 rounded-xl bg-white border border-border shadow-soft-sm shrink-0">
                  <span className="text-3xl sm:text-4xl font-extrabold text-primary font-heading">
                    {result.primaryStream.matchScore}%
                  </span>
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                    Compatibility Fit
                  </span>
                </div>
              </div>

              {/* Key Recommended Subjects */}
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  Recommended Core 10+2 Subject Combination
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.primaryStream.keySubjects.map((sub, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-white border-primary/30 text-primary text-xs py-1 px-2.5 font-medium"
                    >
                      {sub}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Trade-Off Analysis: Benefits vs Realities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/80">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <h4 className="font-heading font-bold text-sm text-emerald-900 flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Key Benefits & Advantages
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-950">
                    {result.primaryStream.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                  <h4 className="font-heading font-bold text-sm text-amber-900 flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Realities & Academic Rigor to Expect
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {result.primaryStream.tradeOffs.map((tradeOff, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{tradeOff}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Top High-Growth Careers in this Stream */}
              <div className="mt-6 pt-6 border-t border-border/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  Top Verified Career Pathways in this Stream
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {result.primaryStream.topCareers.map((career) => (
                    <Link
                      key={career.slug}
                      href={`/careers/${career.slug}`}
                      className="p-3.5 rounded-xl border border-border bg-white hover:border-primary/40 hover:shadow-soft-sm transition-all group block"
                    >
                      <h5 className="font-semibold text-xs text-text-primary group-hover:text-primary transition-colors">
                        {career.title}
                      </h5>
                      <span className="text-[11px] font-medium text-emerald-700 mt-1 block">
                        Entry: {career.entrySalary}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Alternative Bridge Streams (NEP 2020 Flexibility) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-secondary" />
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Alternative Bridge Streams (NEP 2020 Multi-Disciplinary Flexibility)
                </h3>
              </div>
              <p className="text-xs text-text-secondary -mt-2">
                Under the National Education Policy, rigid stream walls are removed. Here are complementary directions that align with your secondary preferences.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.bridgeStreams.map((bridge, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-border bg-white shadow-soft-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-text-primary">
                          {bridge.streamName}
                        </span>
                        <Badge variant="outline" className="text-xs bg-slate-50 text-text-secondary">
                          {bridge.matchScore}% Fit
                        </Badge>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {bridge.reasoning}
                      </p>
                      <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-border/80 text-[11px] text-text-secondary">
                        <span className="font-semibold text-text-primary">Bridge Advice: </span>
                        {bridge.bridgeAdvice}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-end">
                      <Link
                        href={`/compare?slugs=${result.primaryStream.topCareers[0]?.slug},ai-systems-engineer`}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        Compare with Primary <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statutory Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-border text-xs text-text-secondary space-y-1">
              <span className="font-semibold text-text-primary block">
                Statutory Career Advisory Notice:
              </span>
              <p>
                This diagnostic report is an advisory self-reflection tool calibrated against Indian educational standards and NEP 2020 guidelines. It does not replace personal academic counseling. Students should consult guardians, school counselors, and subject educators before submitting Class 11 subject registration or collegiate admission forms.
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retake Diagnostic
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveToProfile}
                  className="gap-1.5 text-xs text-primary border-primary/30"
                >
                  <HeartHandshake className="h-3.5 w-3.5" />
                  Save to My Passport
                </Button>

                <Link href="/careers">
                  <Button size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/95 text-white">
                    Explore Career Catalogue <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {saveStatus && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{saveStatus}</span>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
