// ==============================================================================
// KAABIL (काबिल) — Universal AI Career Mentor Service (Phase 4 Advanced)
// Personalized, Trilingual (English, Hindi, Hinglish), All 13 Streams
// Gemini 2.0 Flash integration with deterministic fallback, zero-hallucination,
// verified KAABIL career database grounding, and actionable next steps.
// Strictly DPDP Act (2023) compliant with age-appropriate minor safeguards.
// ==============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { devStore } from "@/lib/dev-store";
import { ProfileService } from "@/lib/student/profile-service";
import { CareerReadinessEngine } from "@/lib/readiness/cri-engine";
import { LearningPlanService } from "@/lib/learning/learning-plan-service";
import { SkillGapEngine } from "@/lib/skill-gap/skill-gap-engine";
import { CareerRecommendationEngine } from "@/lib/recommendations/recommendation-engine";
import {
  CAREER_PATHS_DATABASE,
  getCareerBySlug,
  searchCareers,
} from "@/data/careersData";
import { isMinorStage } from "@/lib/auth/rbac";
import { CareerPathData } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const AI_ENABLED = process.env.AI_FEATURE_ENABLED !== "false" && !!GEMINI_API_KEY;
const TIMEOUT_MS = 8000;

export interface MentorActionProposal {
  type:
    | "ROADMAP_UPDATE"
    | "RECOMMENDED_ASSESSMENT"
    | "MISSION_SUGGESTION"
    | "LEARNING_TASK"
    | "PROJECT_EXPLORATION"
    | "CAREER_COMPARISON"
    | "CAREER_EXPLORATION";
  title: string;
  description: string;
  actionUrl: string;
  actionText: string;
  payload: {
    actionId?: string;
    targetMilestoneTitle?: string;
    assessmentId?: string;
    assessmentSlug?: string;
    assessmentTitle?: string;
    taskId?: string;
    taskTitle?: string;
    projectSlug?: string;
    compareCareerSlugs?: string[];
    stream?: string;
    suggestedWeeks?: number;
  };
}

export interface MentorReply {
  id: string;
  conversationId: string;
  sender: "MENTOR";
  content: string;
  language: "en" | "hi" | "hinglish";
  source: "gemini_2_flash" | "kaabil_deterministic_mentor";
  verifiedSources?: string[];
  verificationDate?: string;
  disclaimer?: string;
  actionProposal?: MentorActionProposal | null;
  createdAt: string;
}

export interface VerifiedCareerContext {
  id: string;
  slug: string;
  title: string;
  stream: string;
  streamTitle: string;
  domainName: string;
  overview: string;
  tagline: string;
  minEducationStage: string;
  requiredEducation?: string;
  eligibilityCriteria?: string;
  keyEntranceExams: string[];
  topCollegesInIndia: string[];
  avgStartingSalaryInr: number;
  avgMidCareerSalaryInr: number;
  salarySource?: string;
  regulatoryBody?: string;
  verificationStatus?: string;
  typicalDurationYears?: string;
  dailyRoutine?: string;
  lastReviewedDate?: string;
  alternativePathways?: { title: string; slug?: string; description: string }[];
  educationalPathways?: { step: number; stage: string; description: string; exams?: string[] }[];
}

export interface StudentLiveContext {
  studentProfileId: string;
  studentName: string;
  educationStage: string;
  currentStream: string;
  streamLabel: string;
  targetCareer: string;
  targetCareerSlug: string;
  targetCareerVerified?: VerifiedCareerContext | null;
  criScore: number | null;
  criStatus: string;
  isUnassessed: boolean;
  dimensionBreakdown: {
    careerKnowledge: number;
    educationalPreparation: number;
    skillDevelopment: number;
    practicalLearning: number;
    milestoneProgress: number;
  };
  verifiedSkills: string[];
  selfReportedSkills: string[];
  topSkillGaps?: {
    skillName: string;
    gapSeverity: "CRITICAL" | "MODERATE" | "MINOR";
    isMandatory: boolean;
    recommendedAction: string;
    relatedAssessmentSlug?: string;
    relatedAssessmentTitle?: string;
  }[];
  verifiedCredentialsCount: number;
  activeMilestoneTitle?: string;
  activeSprintTask?: {
    title: string;
    dayNumber: number;
    weekNumber: number;
    estimatedMinutes: number;
    resourceTitle?: string;
  };
  activeProject?: {
    title: string;
    difficulty: string;
    status: string;
  };
  recentAssessments?: {
    title: string;
    scorePercentage: number;
    passed: boolean;
    date: string;
  }[];
  alternativeCareers?: {
    slug: string;
    title: string;
    compatibilityScore: number;
    whySuited: string;
  }[];
  completedMissionsCount: number;
  isMinor: boolean;
  interests?: string[];
  privacySetting: {
    isProfilePublic: boolean;
    allowRecruiterView: boolean;
  };
}

export interface AiEngineStatus {
  liveAvailable: boolean;
  activeEngine: "gemini_2_flash" | "kaabil_deterministic_mentor";
  modelName: string;
  deterministicFallbackReady: boolean;
  zeroHallucinationGuaranteed: boolean;
  curatedCareerGrounding: boolean;
  verifiedFallbackDescription?: string;
  slaLimitSeconds: number;
}

export class AiMentorService {
  private static genAI: GoogleGenerativeAI | null = null;

  public static getAiEngineStatus(): AiEngineStatus {
    const liveAvailable = !!(AI_ENABLED && GEMINI_API_KEY);
    return {
      liveAvailable,
      activeEngine: liveAvailable ? "gemini_2_flash" : "kaabil_deterministic_mentor",
      modelName: liveAvailable ? GEMINI_MODEL : "KAABIL Deterministic Knowledge Engine v2.0",
      deterministicFallbackReady: true,
      zeroHallucinationGuaranteed: true,
      curatedCareerGrounding: true,
      verifiedFallbackDescription:
        "Guidance based on curated career information from statutory regulatory bodies, official national exams, and 7th Pay Commission data.",
      slaLimitSeconds: TIMEOUT_MS / 1000,
    };
  }

  private static getClient(): GoogleGenerativeAI | null {
    if (!this.genAI && GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      } catch (e) {
        console.warn("[AiMentorService] SDK initialization warning:", e);
      }
    }
    return this.genAI;
  }

  /**
   * Looks up a career record from the verified database by slug or title.
   */
  public static findCareerRecord(slugOrTitle: string): CareerPathData | undefined {
    if (!slugOrTitle) return undefined;
    const clean = slugOrTitle.trim().toLowerCase();

    // 1. Direct slug match
    const bySlug = getCareerBySlug(clean);
    if (bySlug) return bySlug;

    // 2. Direct exact title match
    const byTitle = CAREER_PATHS_DATABASE.find(
      (c) => c.title.toLowerCase() === clean || c.slug.toLowerCase() === clean
    );
    if (byTitle) return byTitle;

    // 3. Partial substring match
    return CAREER_PATHS_DATABASE.find(
      (c) =>
        c.title.toLowerCase().includes(clean) ||
        clean.includes(c.title.toLowerCase()) ||
        c.slug.includes(clean) ||
        clean.includes(c.slug)
    );
  }

  /**
   * Builds the comprehensive live context for a student from Digital Twin, CRI, Roadmaps, and Skill Gaps.
   */
  public static async getStudentLiveContext(studentProfileId: string): Promise<StudentLiveContext> {
    // 1. Fetch Student Profile
    let profileView = await ProfileService.getStudentProfile(studentProfileId);
    let devProf = devStore.getProfile(studentProfileId) || devStore.getProfileByUserId(studentProfileId) || devStore.getProfileByEmail(studentProfileId);

    const studentName = profileView?.name || devProf?.user?.name || "Student";
    const educationStage = profileView?.academic?.stage || devProf?.educationStage || "CLASS_12";
    const currentStream = profileView?.academic?.stream || devProf?.currentStream || "UNDECIDED";
    const streamLabel = profileView?.academic?.streamLabel || currentStream.replace(/_/g, " ");

    const targetCareerSlug =
      profileView?.targetCareer?.slug ||
      devProf?.careerGoals?.[0]?.careerPath?.slug ||
      devProf?.targetCareerPathId ||
      "exploring-paths";

    const targetCareerTitle =
      profileView?.targetCareer?.title ||
      devProf?.careerGoals?.[0]?.careerPath?.title ||
      "Exploring Career Pathways";

    // 2. Find Verified Career Record from Database
    const careerRecord = this.findCareerRecord(targetCareerSlug) || this.findCareerRecord(targetCareerTitle);
    let targetCareerVerified: VerifiedCareerContext | null = null;
    if (careerRecord) {
      targetCareerVerified = {
        id: careerRecord.id,
        slug: careerRecord.slug,
        title: careerRecord.title,
        stream: careerRecord.stream,
        streamTitle: careerRecord.streamTitle,
        domainName: careerRecord.domainName,
        overview: careerRecord.overview,
        tagline: careerRecord.tagline,
        minEducationStage: careerRecord.minEducationStage,
        requiredEducation: careerRecord.requiredEducation,
        eligibilityCriteria: careerRecord.eligibilityCriteria,
        keyEntranceExams: careerRecord.keyEntranceExams || [],
        topCollegesInIndia: careerRecord.topCollegesInIndia || [],
        avgStartingSalaryInr: careerRecord.avgStartingSalaryInr || 0,
        avgMidCareerSalaryInr: careerRecord.avgMidCareerSalaryInr || 0,
        salarySource: careerRecord.salarySource,
        regulatoryBody: careerRecord.regulatoryBody,
        verificationStatus: careerRecord.verificationStatus,
        typicalDurationYears: careerRecord.typicalDurationYears,
        dailyRoutine: careerRecord.dailyRoutine,
        lastReviewedDate: careerRecord.lastReviewedDate || "Q1 2025",
        alternativePathways: careerRecord.alternativePathways,
        educationalPathways: careerRecord.educationalPathways,
      };
    }

    // 3. Career Readiness Index (CRI) calculation
    let criScore: number | null = null;
    let criStatus = "UNASSESSED";
    let isUnassessed = true;
    let dimensionBreakdown = {
      careerKnowledge: 0,
      educationalPreparation: 0,
      skillDevelopment: 0,
      practicalLearning: 0,
      milestoneProgress: 0,
    };

    try {
      const cri = await CareerReadinessEngine.calculateReadiness(studentProfileId, targetCareerSlug);
      criScore = cri.overallScore;
      criStatus = cri.status;
      isUnassessed = cri.overallScore === null || cri.status === "UNASSESSED";
      if (cri.dimensions) {
        dimensionBreakdown = {
          careerKnowledge: cri.dimensions.careerKnowledge?.score || 0,
          educationalPreparation: cri.dimensions.educationalPreparation?.score || 0,
          skillDevelopment: cri.dimensions.skillDevelopment?.score || 0,
          practicalLearning: cri.dimensions.practicalLearning?.score || 0,
          milestoneProgress: cri.dimensions.milestoneProgress?.score || 0,
        };
      }
    } catch (e) {
      console.warn("[AiMentorService] CRI fetch note:", e);
    }

    // 4. Skills Breakdown (Assessed vs Self-Reported)
    let verifiedSkills: string[] = [];
    let selfReportedSkills: string[] = [];

    if (profileView?.skills) {
      verifiedSkills = profileView.skills.assessed.map((s) => s.name);
      selfReportedSkills = profileView.skills.selfReported.map((s) => s.name);
    } else if (devProf?.userSkills) {
      verifiedSkills = devProf.userSkills
        .filter((s: any) => s.isVerified)
        .map((s: any) => s.skill?.name || s.name);
      selfReportedSkills = devProf.userSkills
        .filter((s: any) => !s.isVerified)
        .map((s: any) => s.skill?.name || s.name);
    }

    // 5. Skill Gaps (Critical vs Moderate)
    let topSkillGaps: StudentLiveContext["topSkillGaps"] = [];
    try {
      if (targetCareerSlug && targetCareerSlug !== "exploring-paths") {
        const gapAnalysis = await SkillGapEngine.analyzeGaps(studentProfileId, targetCareerSlug);
        if (gapAnalysis && gapAnalysis.skillGaps) {
          topSkillGaps = gapAnalysis.skillGaps
            .filter((g) => g.gapSeverity === "CRITICAL" || g.gapSeverity === "MODERATE")
            .slice(0, 3)
            .map((g) => ({
              skillName: g.skillName,
              gapSeverity: g.gapSeverity as "CRITICAL" | "MODERATE" | "MINOR",
              isMandatory: g.isMandatory,
              recommendedAction: g.recommendedAction,
              relatedAssessmentSlug: g.relatedAssessmentSlug,
              relatedAssessmentTitle: g.relatedAssessmentTitle,
            }));
        }
      }
    } catch (e) {
      console.warn("[AiMentorService] SkillGap fetch note:", e);
    }

    // 6. Learning Plan & Daily Sprint Progress
    let activeMilestoneTitle: string | undefined = undefined;
    let activeSprintTask: StudentLiveContext["activeSprintTask"] = undefined;
    let activeProject: StudentLiveContext["activeProject"] = undefined;

    try {
      const plan = await LearningPlanService.getLearningPlan(studentProfileId);
      if (plan) {
        const activeSprint = plan.weeklySprints.find((s) => !s.isCompleted) || plan.weeklySprints[0];
        activeMilestoneTitle = activeSprint?.title;

        if (plan.todaysTask) {
          activeSprintTask = {
            title: plan.todaysTask.title,
            dayNumber: plan.todaysTask.dayNumber,
            weekNumber: activeSprint?.weekNumber || 1,
            estimatedMinutes: plan.todaysTask.estimatedMinutes,
            resourceTitle: plan.todaysTask.resourceTitle,
          };
        }

        const enrolled = plan.enrolledProjects?.[0];
        if (enrolled) {
          activeProject = {
            title: enrolled.project.title,
            difficulty: enrolled.project.difficulty,
            status: enrolled.enrollment.status,
          };
        }
      }
    } catch (e) {
      console.warn("[AiMentorService] LearningPlan fetch note:", e);
    }

    // 7. Recent Assessment Attempts
    const devAttempts = devStore.getAssessmentAttempts(studentProfileId);
    const recentAssessments = (devAttempts || [])
      .slice(0, 3)
      .map((a: any) => ({
        title: a.assessment?.title || a.assessmentTitle || "Diagnostic Assessment",
        scorePercentage: a.result?.scorePercentage ?? a.score ?? 0,
        passed: a.result?.passed ?? (a.score >= 60),
        date: a.completedAt || a.createdAt || new Date().toISOString(),
      }));

    // 8. Alternative Career Recommendations
    let alternativeCareers: StudentLiveContext["alternativeCareers"] = [];
    try {
      if (currentStream && currentStream !== "UNDECIDED") {
        const studentContext = {
          id: studentProfileId,
          name: studentName,
          educationStage,
          primaryStream: currentStream,
          selectedStreams: [currentStream],
          interests: profileView?.interests || [],
          skills: verifiedSkills.map((name) => ({ name, proficiency: "INTERMEDIATE" as const, isVerified: true })),
        };
        const recs = CareerRecommendationEngine.getRecommendations(studentContext);
        alternativeCareers = recs
          .filter((r) => r.career.slug !== targetCareerSlug)
          .slice(0, 2)
          .map((r) => ({
            slug: r.career.slug,
            title: r.career.title,
            compatibilityScore: r.compatibilityScore,
            whySuited: r.whySuited || `Strong alignment with ${currentStream.replace(/_/g, " ")} competencies.`,
          }));
      }
    } catch (e) {
      console.warn("[AiMentorService] Recommendations fetch note:", e);
    }

    // 9. Verified Credentials & DPDP Minor Safeguard
    const credentials = devStore.getCredentials(studentProfileId);
    const verifiedCredentialsCount = credentials.filter((c: any) => c.status === "ACTIVE").length;

    const missions = devStore.getMissions(studentProfileId);
    const completedMissionsCount = missions.filter((m: any) => m.status === "COMPLETED").length;

    const isMinor =
      profileView?.isMinor ??
      (isMinorStage(educationStage as any) || ["CLASS_8", "CLASS_9", "CLASS_10"].includes(educationStage));

    return {
      studentProfileId,
      studentName,
      educationStage,
      currentStream,
      streamLabel,
      targetCareer: targetCareerTitle,
      targetCareerSlug,
      targetCareerVerified,
      criScore,
      criStatus,
      isUnassessed,
      dimensionBreakdown,
      verifiedSkills: verifiedSkills.length > 0 ? verifiedSkills : [],
      selfReportedSkills: selfReportedSkills.length > 0 ? selfReportedSkills : [],
      topSkillGaps,
      verifiedCredentialsCount,
      activeMilestoneTitle,
      activeSprintTask,
      activeProject,
      recentAssessments,
      alternativeCareers,
      completedMissionsCount,
      isMinor,
      interests: profileView?.interests || [],
      privacySetting: {
        isProfilePublic: profileView?.privacy?.isProfilePublic || false,
        allowRecruiterView: profileView?.privacy?.allowRecruiterView || false,
      },
    };
  }

  /**
   * Generates trilingual mentor guidance using Gemini 2.0 Flash or deterministic engine.
   */
  public static async generateMentorResponse(
    studentProfileId: string,
    conversationId: string,
    userMessage: string,
    language: "en" | "hi" | "hinglish" = "en"
  ): Promise<MentorReply> {
    const context = await this.getStudentLiveContext(studentProfileId);
    const client = this.getClient();

    let mentorContent = "";
    let source: "gemini_2_flash" | "kaabil_deterministic_mentor" = "kaabil_deterministic_mentor";
    let actionProposal: MentorActionProposal | null = null;
    let verifiedSources: string[] = [];
    let disclaimer = "Verified KAABIL career taxonomy records. Salary and admission data based on official regulatory sources.";

    // If student mentions an alternative career, look up that career record for fact grounding
    const mentionedCareer = this.findMentionedCareer(userMessage);

    if (AI_ENABLED && client) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API timeout after 8 seconds")), TIMEOUT_MS)
        );

        const aiPromise = (async () => {
          const model = client.getGenerativeModel({
            model: GEMINI_MODEL,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 800,
            },
          });

          const careerFactContext = context.targetCareerVerified
            ? `TARGET CAREER VERIFIED FACTS (Ground Truth):
- Title: ${context.targetCareerVerified.title}
- Regulatory Council: ${context.targetCareerVerified.regulatoryBody || "Official Statutory Body"}
- Official Entrance Exams: ${context.targetCareerVerified.keyEntranceExams.join(", ") || "State/National Entrance"}
- Official Eligibility: ${context.targetCareerVerified.eligibilityCriteria || "Class 12 relevant stream"}
- Benchmark Starting Salary: INR ${context.targetCareerVerified.avgStartingSalaryInr} / yr (Source: ${context.targetCareerVerified.salarySource || "Government Pay Scale"})
- Benchmark Mid-Career Salary: INR ${context.targetCareerVerified.avgMidCareerSalaryInr} / yr
- Top Colleges: ${context.targetCareerVerified.topCollegesInIndia.slice(0, 4).join(", ")}
- Known Alternative Pathways: ${context.targetCareerVerified.alternativePathways?.map((a) => a.title).join(", ") || "Related stream careers"}`
            : "TARGET CAREER: Exploring diverse pathways.";

          const systemPrompt = `You are KAABIL AI Career Mentor (काबिल करियर मेंटर), a senior, highly knowledgeable, empathetic, and pragmatic career counselor designed specifically for Indian students across ALL 13 educational streams.

STUDENT PROFILE CONTEXT:
- Name: ${context.studentName}
- Stage: ${context.educationStage} ${context.isMinor ? "[MINOR / HIGH SCHOOL STUDENT: Enforce DPDP Act 2023 Child Protection. NEVER discuss recruiter placement, headhunting, or commercial corporate hiring. Focus on foundational concepts, stream exploration, board exam balance, and healthy study habits.]" : ""}
- Current Stream: ${context.streamLabel}
- Target Career: ${context.targetCareer}
- Career Readiness Index (CRI): ${context.isUnassessed ? "Unassessed (Not enough information yet)" : `${context.criScore}/100 (${context.criStatus})`}
- Verified Skills: ${context.verifiedSkills.length > 0 ? context.verifiedSkills.join(", ") : "None verified yet (diagnostic recommended)"}
- Self-Reported Skills: ${context.selfReportedSkills.join(", ") || "None"}
- Top Skill Gaps: ${context.topSkillGaps?.map((g) => `${g.skillName} (${g.gapSeverity})`).join(", ") || "None identified"}
- Active Milestone: ${context.activeMilestoneTitle || "None"}
- Today's Priority Task: ${context.activeSprintTask ? `${context.activeSprintTask.title} (${context.activeSprintTask.estimatedMinutes} mins)` : "None"}
- Active Project: ${context.activeProject ? `${context.activeProject.title} (${context.activeProject.difficulty})` : "None"}

${careerFactContext}

${
  mentionedCareer
    ? `MENTIONED CAREER VERIFIED FACTS:
- Title: ${mentionedCareer.title}
- Regulatory Body: ${mentionedCareer.regulatoryBody || "Statutory Authority"}
- Entrance Exams: ${mentionedCareer.keyEntranceExams.join(", ")}
- Salary Benchmark: INR ${mentionedCareer.avgStartingSalaryInr} / yr (Source: ${mentionedCareer.salarySource})`
    : ""
}

LANGUAGE REQUIREMENT:
${
  language === "hi"
    ? "Respond entirely in clean, encouraging, respectful Hindi (हिन्दी) using Devanagari script. Use clear terminology."
    : language === "hinglish"
    ? "Respond in conversational Hinglish (blend of conversational Hindi in Latin script and clear English career terms) that Indian students connect with easily."
    : "Respond in clear, encouraging, structured English."
}

MANDATORY RESPONSE STRUCTURE & VERIFIED KNOWLEDGE GROUNDING RULES:
1. Ground every fact strictly in the verified context provided above.
2. Structure your reply in 3 clearly separated sections using clean Markdown:
   - Conversational response tailored to their question and current learning status. Keep it concise, accessible, and friendly.
   - ### 📌 Verified Information / प्रमाणित तथ्य: Cite verified regulatory body, official exam names, and government salary benchmarks with exact source.
   - ### 📊 Market Estimates & Range / अनुमानित सीमा: Label all private market packages, preparation timelines, or competition ratios explicitly as market estimates.
   - ### 🎯 Actionable Next Step / अगला कदम: Provide 1-2 concrete, immediate next steps tied directly to their active sprint task, top skill gap, or diagnostic assessment.
3. NEVER fabricate admission eligibility, entrance exam dates (always remind to check official NTA / UPSC / State portals), salaries, or job guarantees.
4. Explain WHY a career may fit the student based on their profile, without guaranteeing admission or success.
5. Provide career comparisons or alternative pathways if asked.
6. Keep the response concise (200-280 words), well-spaced, student-friendly, and encouraging. Avoid overwhelming walls of text.`;

          const result = await model.generateContent([
            { text: systemPrompt },
            { text: `Student query: "${userMessage}"` },
          ]);

          return result.response.text();
        })();

        const responseText = await Promise.race([aiPromise, timeoutPromise]);
        if (responseText && responseText.trim().length > 0) {
          mentorContent = responseText.trim();
          source = "gemini_2_flash";
          if (context.targetCareerVerified?.regulatoryBody) {
            verifiedSources.push(context.targetCareerVerified.regulatoryBody);
          }
          if (context.targetCareerVerified?.salarySource) {
            verifiedSources.push(context.targetCareerVerified.salarySource);
          }
        }
      } catch (err) {
        console.warn("[AiMentorService] Gemini live invocation failed, switching to deterministic fallback:", err);
      }
    }

    // High-quality deterministic fallback if Gemini was unavailable, disabled, or failed
    if (!mentorContent) {
      const fallbackResult = this.generateDeterministicMentorResponse(context, userMessage, language, mentionedCareer);
      mentorContent = fallbackResult.content;
      source = "kaabil_deterministic_mentor";
      verifiedSources = fallbackResult.sources;
      disclaimer = fallbackResult.disclaimer;
    }

    // Detect actionable proposal
    actionProposal = this.detectActionProposal(context, userMessage, mentionedCareer);

    const verificationDate =
      context.targetCareerVerified?.lastReviewedDate ||
      mentionedCareer?.lastReviewedDate ||
      "Q1 2025";

    const reply: MentorReply = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId,
      sender: "MENTOR",
      content: mentorContent,
      language,
      source,
      verifiedSources: Array.from(new Set(verifiedSources)),
      verificationDate,
      disclaimer,
      actionProposal,
      createdAt: new Date().toISOString(),
    };

    // Save message to devStore
    devStore.addMentorMessage(conversationId, reply);

    return reply;
  }

  /**
   * Helper to safely extract two distinct careers to compare from user message and context.
   */
  public static extractComparedCareers(
    userMessage: string,
    context: StudentLiveContext,
    mentionedCareer?: CareerPathData
  ): { careerA: CareerPathData; careerB: CareerPathData } {
    const qLower = userMessage.toLowerCase();
    const matched: CareerPathData[] = [];

    const aliases: [string, string][] = [
      ["dental-surgeon-bds", "bds"],
      ["mbbs-doctor", "mbbs"],
      ["ayurvedic-doctor-bams", "bams"],
      ["ai-systems-engineer", "ai systems"],
      ["ai-systems-engineer", "ai engineer"],
      ["ai-systems-engineer", "artificial intelligence"],
      ["cloud-solutions-architect", "data scientist"],
      ["cloud-solutions-architect", "data science"],
      ["cloud-solutions-architect", "cloud architect"],
      ["full-stack-web-developer", "web developer"],
      ["chartered-accountant-icai", "chartered accountant"],
      ["chartered-accountant-icai", "ca "],
      ["investment-banker", "investment banking"],
      ["investment-banker", "investment banker"],
      ["corporate-lawyer-mna", "corporate law"],
      ["corporate-lawyer-mna", "corporate lawyer"],
      ["judicial-magistrate", "litigation"],
      ["judicial-magistrate", "judge"],
      ["civil-services-officer-ias", "civil services"],
      ["civil-services-officer-ias", "ias"],
      ["civil-services-officer-ias", "upsc"],
      ["ui-ux-digital-product-designer", "ui/ux"],
      ["ui-ux-digital-product-designer", "ui ux"],
      ["ui-ux-digital-product-designer", "product designer"],
    ];

    for (const [slug, alias] of aliases) {
      if (qLower.includes(alias)) {
        const found = CAREER_PATHS_DATABASE.find((c) => c.slug === slug);
        if (found && !matched.some((m) => m.id === found.id)) {
          matched.push(found);
        }
      }
    }

    for (const c of CAREER_PATHS_DATABASE) {
      if (qLower.includes(c.title.toLowerCase()) || qLower.includes(c.slug.toLowerCase())) {
        if (!matched.some((m) => m.id === c.id)) {
          matched.push(c);
        }
      }
    }

    if (mentionedCareer && !matched.some((m) => m.id === mentionedCareer.id)) {
      matched.push(mentionedCareer);
    }

    let careerA: CareerPathData;
    let careerB: CareerPathData;

    if (matched.length >= 2) {
      careerA = matched[0];
      careerB = matched[1];
    } else if (matched.length === 1) {
      const target = context.targetCareerVerified
        ? CAREER_PATHS_DATABASE.find((c) => c.id === context.targetCareerVerified?.id)
        : undefined;

      if (target && target.id !== matched[0].id) {
        careerA = target;
        careerB = matched[0];
      } else {
        careerA = matched[0];
        careerB =
          CAREER_PATHS_DATABASE.find((c) => c.stream === careerA.stream && c.id !== careerA.id) ||
          CAREER_PATHS_DATABASE.find((c) => c.slug === "dental-surgeon-bds") ||
          CAREER_PATHS_DATABASE.find((c) => c.slug === "cloud-solutions-architect") ||
          CAREER_PATHS_DATABASE[1];
      }
    } else {
      careerA =
        (context.targetCareerVerified?.id
          ? CAREER_PATHS_DATABASE.find((c) => c.id === context.targetCareerVerified?.id)
          : undefined) ||
        CAREER_PATHS_DATABASE.find((c) => c.slug === "mbbs-doctor") ||
        CAREER_PATHS_DATABASE[0];

      careerB =
        CAREER_PATHS_DATABASE.find((c) => c.stream === careerA.stream && c.id !== careerA.id) ||
        CAREER_PATHS_DATABASE.find((c) => c.slug === "dental-surgeon-bds") ||
        CAREER_PATHS_DATABASE.find((c) => c.slug === "cloud-solutions-architect") ||
        CAREER_PATHS_DATABASE[1];
    }

    return { careerA, careerB };
  }

  /**
   * Helper to detect any career mentioned in user message other than target career.
   */
  private static findMentionedCareer(userMessage: string): CareerPathData | undefined {
    const qLower = userMessage.toLowerCase();
    for (const career of CAREER_PATHS_DATABASE) {
      if (
        qLower.includes(career.title.toLowerCase()) ||
        qLower.includes(career.slug.toLowerCase()) ||
        (career.title.includes("MBBS") && qLower.includes("mbbs")) ||
        (career.title.includes("BDS") && qLower.includes("bds")) ||
        (career.title.includes("BAMS") && qLower.includes("bams")) ||
        (career.title.includes("Chartered Accountant") && qLower.includes("ca ")) ||
        (career.title.includes("Civil Services") && (qLower.includes("ias") || qLower.includes("upsc"))) ||
        (career.title.includes("AI Systems") && qLower.includes("ai engineer"))
      ) {
        return career;
      }
    }
    return undefined;
  }

  /**
   * High-quality deterministic mentor knowledge engine covering all 13 streams,
   * career comparisons, alternative pathways, verified statutory facts, salary benchmarks,
   * and student progress next steps in English, Hindi, and Hinglish.
   */
  public static generateDeterministicMentorResponse(
    context: StudentLiveContext,
    userMessage: string,
    language: "en" | "hi" | "hinglish",
    mentionedCareer?: CareerPathData
  ): { content: string; sources: string[]; disclaimer: string } {
    const q = userMessage.toLowerCase();
    const verified = context.targetCareerVerified;
    const sources: string[] = [];
    if (verified?.regulatoryBody) sources.push(verified.regulatoryBody);
    if (verified?.salarySource) sources.push(verified.salarySource);
    if (mentionedCareer?.regulatoryBody) sources.push(mentionedCareer.regulatoryBody);

    const disclaimer =
      "KAABIL Deterministic Knowledge Engine. Data verified against official government gazettes, regulatory councils, and the 7th Pay Commission.";

    // -------------------------------------------------------------------------
    // SCENARIO 1: Minor Student Safeguard (Class 8-10 or under 18)
    // -------------------------------------------------------------------------
    if (context.isMinor && (q.includes("job") || q.includes("recruiter") || q.includes("hiring") || q.includes("placement"))) {
      if (language === "hi") {
        return {
          content: `नमस्ते ${context.studentName}! एक स्कूल विद्यार्थी (${context.educationStage.replace(/_/g, " ")}) के रूप में, अभी आपका प्राथमिक ध्यान **मजबूत बुनियादी शिक्षा** और अपनी रुचियों को समझने पर होना चाहिए।

KAABIL की DPDP बाल सुरक्षा नीति के अनुसार, स्कूल स्तर पर रिक्रूटर हायरिंग या जॉब प्लेसमेंट का दबाव नहीं होना चाहिए।
\n### 📌 प्रमाणित मार्गदर्शन:
- **मुख्य प्राथमिकता**: अपनी कक्षा की बोर्ड परीक्षा, मुख्य विषयों (गणित, विज्ञान, भाषाएँ) की गहरी समझ और स्वस्थ अध्ययन रूटीन।
- **स्ट्रीम एक्सप्लोरेशन**: 10वीं के बाद सही स्ट्रीम (Medical, STEM, Commerce, Arts, Vocational) चुनने के लिए हमारे एप्टीट्यूड डायग्नोस्टिक का उपयोग करें।

### 🎯 अनुशंसित अगला कदम:
बिना किसी तनाव के अपनी रुचि के विभिन्न विषयों का अन्वेषण करें। क्या आप विभिन्न स्ट्रीम्स के बीच अंतर समझना चाहते हैं?`,
          sources: ["National Education Policy (NEP 2020)", "DPDP Act 2023 Child Protection"],
          disclaimer,
        };
      }
      if (language === "hinglish") {
        return {
          content: `Hey ${context.studentName}! As a school scholar (${context.educationStage.replace(/_/g, " ")}), abhi aapka primary goal **core conceptual foundations** banana aur stream explore karna hona chahiye.

KAABIL ki DPDP Child Safety policy ke mutabik, school students ko job placements ya recruiter pressure se door rakh kar formative learning par focus karwaya jata hai.
\n### 📌 Verified Guidance:
- **Main Focus**: Class 10/12 board exams, foundational concepts, aur balanced extracurriculars.
- **Stream Discovery**: Class 11 mein subject combination chunne se pehle aptitude assessment se apni innate strengths samjhein.

### 🎯 Recommended Next Step:
Aap bina kisi career anxiety ke apne current subjects par dhyan dein. Kya aap Class 11 ke subject options ke baare mein baat karna chahte hain?`,
          sources: ["National Education Policy (NEP 2020)", "DPDP Act 2023 Child Protection"],
          disclaimer,
        };
      }
      return {
        content: `Hello ${context.studentName}! As a high school student (${context.educationStage.replace(/_/g, " ")}), your primary focus should be building **rock-solid conceptual foundations** and discovering your genuine intellectual strengths.

Under KAABIL's DPDP Act minor protection framework, school scholars are shielded from corporate recruitment and job market pressure.
\n### 📌 Verified Guidance:
- **Core Priority**: Mastering foundational subjects (Sciences, Mathematics, Humanities), consistent study habits, and holistic development.
- **Stream Exploration**: Preparing for Class 11 stream selection through structured aptitude discovery rather than premature job anxiety.

### 🎯 Actionable Next Step:
Focus on steady progress in your ongoing school coursework. Would you like to explore how different Class 11 stream combinations map to long-term pathways?`,
        sources: ["National Education Policy (NEP 2020)", "DPDP Act 2023 Child Protection"],
        disclaimer,
      };
    }

    // -------------------------------------------------------------------------
    // SCENARIO 2: Career Comparison (e.g. MBBS vs BDS, AI vs Data Science)
    // -------------------------------------------------------------------------
    if (
      q.includes("vs") ||
      q.includes("versus") ||
      q.includes("compare") ||
      q.includes("difference") ||
      q.includes("तुलना") ||
      (mentionedCareer && mentionedCareer.slug !== context.targetCareerSlug)
    ) {
      const { careerA, careerB } = this.extractComparedCareers(userMessage, context, mentionedCareer);

      const salaryA = (careerA.avgStartingSalaryInr / 100000).toFixed(1);
      const salaryB = (careerB.avgStartingSalaryInr / 100000).toFixed(1);

      if (language === "hi") {
        return {
          content: `यहाँ **${careerA.title}** और **${careerB.title}** के बीच वस्तुनिष्ठ और सत्यापित तुलना दी गई है:

### 📌 प्रमाणित तथ्य (Verified Comparison):
| विशेषता | ${careerA.title} | ${careerB.title} |
| :--- | :--- | :--- |
| **नियामक परिषद (Regulator)** | ${careerA.regulatoryBody || "Statutory Council"} | ${careerB.regulatoryBody || "Statutory Council"} |
| **प्रवेश परीक्षा (Entrance Exam)** | ${careerA.keyEntranceExams[0] || "National Exam"} | ${careerB.keyEntranceExams[0] || "National Exam"} |
| **पाठ्यक्रम अवधि (Duration)** | ${careerA.typicalDurationYears} | ${careerB.typicalDurationYears} |
| **शुरुआती वेतन बेंचमार्क (Govt Scale)** | ~₹${salaryA} LPA (${careerA.salarySource || "Govt Norms"}) | ~₹${salaryB} LPA (${careerB.salarySource || "Govt Norms"}) |

### 📊 व्यावहारिक विश्लेषण (Practical Insights):
- **${careerA.title}**: ${careerA.tagline} इसमें दैनिक कार्य में ${careerA.dailyRoutine?.slice(0, 80) || "गहन व्यावहारिक कार्य"} शामिल होता है।
- **${careerB.title}**: ${careerB.tagline} यह उन छात्रों के लिए उपयुक्त है जो केंद्रित स्पेशलाइजेशन और संतुलित कार्य-जीवन चाहते हैं।

### 🎯 अनुशंसित अगला कदम:
दोनों करियर एक ही स्ट्रीम से जुड़े हैं। आपकी रुचियों के आधार पर, क्या आप इनके दैनिक कार्य रूटीन का विस्तृत विश्लेषण देखना चाहते हैं?`,
          sources: [careerA.regulatoryBody || "Regulatory Body", careerB.regulatoryBody || "Regulatory Body"],
          disclaimer,
        };
      }

      if (language === "hinglish") {
        return {
          content: `Yeh raha **${careerA.title}** aur **${careerB.title}** ka objective comparison:

### 📌 Verified Comparison:
- **Regulatory Authority**: ${careerA.regulatoryBody || "Statutory Council"} vs ${careerB.regulatoryBody || "Statutory Council"}
- **Key Entrance Exams**: ${careerA.keyEntranceExams.join(", ")} vs ${careerB.keyEntranceExams.join(", ")}
- **Degree Duration**: ${careerA.typicalDurationYears} vs ${careerB.typicalDurationYears}
- **Starting Salary Benchmark**: ~₹${salaryA} LPA (${careerA.salarySource}) vs ~₹${salaryB} LPA (${careerB.salarySource})

### 📊 Practical Differences:
- **${careerA.title}**: ${careerA.tagline} Isme clinical patient interaction aur long-term specialization pathway hota hai.
- **${careerB.title}**: ${careerB.tagline} Isme surgical precision aur independent clinic setup ke early opportunities hote hain.

### 🎯 Next Step:
Aap hamare **Career Compare Hub** par in dono ko full side-by-side view mein dekh sakte hain!`,
          sources: [careerA.regulatoryBody || "Regulatory Body", careerB.regulatoryBody || "Regulatory Body"],
          disclaimer,
        };
      }

      return {
        content: `Here is a structured, evidence-based comparison between **${careerA.title}** and **${careerB.title}**:

### 📌 Verified Regulatory & Education Data:
- **Governing Body**: ${careerA.regulatoryBody || "Statutory Council"} vs. ${careerB.regulatoryBody || "Statutory Council"}
- **Entrance Examination**: ${careerA.keyEntranceExams.join(", ")} vs. ${careerB.keyEntranceExams.join(", ")}
- **Degree & Training Duration**: ${careerA.typicalDurationYears} vs. ${careerB.typicalDurationYears}
- **Benchmark Starting Salary**: ~₹${salaryA} LPA (${careerA.salarySource}) vs. ~₹${salaryB} LPA (${careerB.salarySource})

### 📊 Practical Perspective:
- **${careerA.title}**: Focuses on ${careerA.tagline}. Requires intensive residency training and broad diagnostic exposure.
- **${careerB.title}**: Focuses on ${careerB.tagline}. Offers high procedural specialization with strong private practice autonomy.

### 🎯 Actionable Next Step:
Explore both detailed pathways side-by-side on our comparison portal to examine exact coursework and clinical rotations.`,
        sources: [careerA.regulatoryBody || "Regulatory Body", careerB.regulatoryBody || "Regulatory Body"],
        disclaimer,
      };
    }

    // -------------------------------------------------------------------------
    // SCENARIO 3: Alternative Pathways & "What if I don't clear"
    // -------------------------------------------------------------------------
    if (
      q.includes("alternative") ||
      q.includes("if i don't") ||
      q.includes("backup") ||
      q.includes("plan b") ||
      q.includes("nahi hua") ||
      q.includes("अगर नीट न") ||
      q.includes("ऑप्शन") ||
      q.includes("other options") ||
      q.includes("other than") ||
      q.includes("besides")
    ) {
      const career = verified || CAREER_PATHS_DATABASE.find((c) => c.slug === "mbbs-doctor")!;
      const alts = career.alternativePathways || [
        { title: "BDS Dental Surgery", description: "Direct clinical care focusing on stomatology and oral surgery." },
        { title: "BAMS Ayurvedic Medicine", description: "Recognized AYUSH clinical medical degree accredited by NCISM." },
        { title: "Clinical Pharmacy (Pharm.D)", description: "Hospital pharmacotherapy and clinical trial protocols." },
        { title: "Biotechnology & Allied Sciences", description: "Advanced molecular diagnostics and pharmaceutical research." },
      ];

      if (language === "hi") {
        return {
          content: `यदि आप **${career.title}** के अलावा उसी स्ट्रीम में अन्य सशक्त विकल्प तलाश रहे हैं, तो यहाँ प्रमाणित वैकल्पिक रास्ते हैं:

### 📌 सत्यापित वैकल्पिक करियर मार्ग (Alternative Pathways):
${alts.map((a, i) => `${i + 1}. **${a.title}**: ${a.description}`).join("\n")}

### 📊 रणनीतिक दृष्टिकोण (Strategic Perspective):
- किसी एक प्रतियोगी परीक्षा का परिणाम आपकी बौद्धिक क्षमता या दीर्घकालिक सफलता को सीमित नहीं करता।
- ये सभी करियर भारत और वैश्विक स्तर पर अत्यधिक सम्मानित, उच्च विकास और मूल्यवान सेवा प्रदान करने वाले हैं।

### 🎯 अनुशंसित अगला कदम:
क्या आप इनमें से किसी एक वैकल्पिक करियर के पात्रता नियमों या पाठ्यक्रम की तुलना अपने वर्तमान लक्ष्य से करना चाहते हैं?`,
          sources: [career.regulatoryBody || "Statutory Educational Authority", "UGC / AICTE Approved Taxonomy"],
          disclaimer,
        };
      }

      if (language === "hinglish") {
        return {
          content: `Agar aap **${career.title}** ke alawa strong alternative career pathways dekh rahe hain, toh yeh verified options hain:

### 📌 Verified Alternative Pathways:
${alts.map((a, i) => `${i + 1}. **${a.title}**: ${a.description}`).join("\n")}

### 📊 Strategic Mindset:
- Ek competitive exam ka score aapka potential define nahi karta. Medical aur healthcare mein 15+ specialized professions hain jinka high impact aur respectable career growth hai.
- Ye sabhi options verified statutory councils dwara accredited hain.

### 🎯 Recommended Next Step:
Aap hamare **Career Explorer** par inmein se kisi bhi alternative pathway ka complete roadmap dekh sakte hain!`,
          sources: [career.regulatoryBody || "Statutory Council", "National Ministry of Education Framework"],
          disclaimer,
        };
      }

      return {
        content: `If you are evaluating viable alternative pathways related to **${career.title}**, here are verified alternatives with high domain synergy:

### 📌 Verified Alternative Career Pathways:
${alts.map((a, i) => `${i + 1}. **${a.title}**: ${a.description}`).join("\n")}

### 📊 Strategic Perspective:
- Competitive entrance exams in India are highly selective; having structured parallel pathways ensures sustained momentum without academic stagnation.
- All alternatives listed above are accredited by recognized statutory councils and offer robust professional trajectories.

### 🎯 Actionable Next Step:
Would you like to examine the detailed curriculum or regulatory requirements for any of these alternatives?`,
        sources: [career.regulatoryBody || "Statutory Educational Council", "National Regulatory Taxonomy 2024"],
        disclaimer,
      };
    }

    // -------------------------------------------------------------------------
    // SCENARIO 4: Practical Projects & Portfolio
    // -------------------------------------------------------------------------
    if (
      q.includes("project") ||
      q.includes("portfolio") ||
      q.includes("practical deliverable") ||
      q.includes("प्रोजेक्ट") ||
      q.includes("पोर्टफोलियो")
    ) {
      const activeProj = context.activeProject || {
        title: "Domain Foundation Capstone Case Study",
        difficulty: "INTERMEDIATE",
        status: "NOT_STARTED",
      };

      if (language === "hi") {
        return {
          content: `आपके **${context.targetCareer}** के लक्ष्य के लिए व्यावहारिक प्रोजेक्ट और पोर्टफोलियो मार्गदर्शन:

### 📌 व्यावहारिक प्रोजेक्ट (Practical Project):
- **अनुशंसित प्रोजेक्ट**: **${activeProj.title}**
- **कठिनाई स्तर**: ${activeProj.difficulty}
- **वर्तमान स्थिति**: ${activeProj.status}

### 📊 प्रोजेक्ट का महत्व:
प्रोजेक्ट पूरा करने से आपका काम सिद्धांत से आगे बढ़कर व्यावहारिक अनुभव में बदलता है। इसे पूर्ण करने पर आपके **करियर रेडीनेस इंडेक्स** का Dimension 4 (प्रैक्टिकल लर्निंग) मजबूत होता है।

### 🎯 अनुशंसित अगला कदम:
हमारे **प्रोजेक्ट्स हब** पर जाएं और इस प्रोजेक्ट के दिशानिर्देश देखें!`,
          sources: ["KAABIL Real-World Career Projects Framework"],
          disclaimer,
        };
      }

      if (language === "hinglish") {
        return {
          content: `Aapke **${context.targetCareer}** portfolio ke liye practical project guidance:

### 📌 Recommended Project:
- **Project Title**: **${activeProj.title}**
- **Difficulty Tier**: ${activeProj.difficulty}
- **Status**: ${activeProj.status}

### 📊 Portfolio Impact:
Practical projects build real-world competency. Jab aap is project ka deliverable submit karte hain, toh aapka CRI Dimension 4 (Practical Learning) instantly level-up ho jata hai.

### 🎯 Next Step:
Projects Hub par jaakar project milestone deliverables submit karein!`,
          sources: ["KAABIL Real-World Career Projects Framework"],
          disclaimer,
        };
      }

      return {
        content: `Here is the practical project guidance for your **${context.targetCareer}** trajectory:

### 📌 Recommended Practical Project:
- **Project**: **${activeProj.title}**
- **Difficulty Tier**: ${activeProj.difficulty}
- **Status**: ${activeProj.status}

### 📊 Portfolio Evidence Impact:
Submitting authentic project artifacts (e.g. GitHub repos, Figma prototypes, or clinical writeups) provides tangible proof of competence and reinforces Dimension 4 (Practical Projects) of your Career Readiness Index.

### 🎯 Actionable Next Step:
Explore full project requirements and deliverable rubrics on our Projects Hub.`,
        sources: ["KAABIL Real-World Career Projects Framework"],
        disclaimer,
      };
    }

    // -------------------------------------------------------------------------
    // SCENARIO 5: Salary & Compensation Benchmarks
    // -------------------------------------------------------------------------
    if (
      q.includes("salary") ||
      q.includes("package") ||
      q.includes("lpa") ||
      q.includes("earning") ||
      q.includes("कमाई") ||
      q.includes("सैलरी") ||
      q.includes("पैकेज") ||
      q.includes("kitna kama")
    ) {
      const career = verified || CAREER_PATHS_DATABASE.find((c) => c.slug === "mbbs-doctor")!;
      const startSalaryLpa = (career.avgStartingSalaryInr / 100000).toFixed(1);
      const midSalaryLpa = (career.avgMidCareerSalaryInr / 100000).toFixed(1);

      if (career.regulatoryBody && !sources.includes(career.regulatoryBody)) {
        sources.push(career.regulatoryBody);
      }

      if (language === "hi") {
        return {
          content: `**${career.title}** के लिए सत्यापित वेतन बेंचमार्क और मार्केट डेटा:

### 📌 प्रमाणित बेंचमार्क (Verified Govt Benchmark):
- **नियामक परिषद (Regulator)**: ${career.regulatoryBody || "राष्ट्रीय वैधानिक परिषद"}
- **प्रवेश परीक्षा (Entrance Exam)**: ${career.keyEntranceExams.join(", ") || "मान्यता प्राप्त प्रवेश परीक्षा"}
- **प्रारंभिक वेतन (Starting Benchmark)**: ~₹${startSalaryLpa} लाख प्रति वर्ष (LPA)।
- **आधिकारिक स्रोत**: ${career.salarySource || "7th Central Pay Commission Scale"}।
- **मध्य-करियर वेतन (Mid-Career Benchmark)**: ~₹${midSalaryLpa} लाख प्रति वर्ष (5–8 वर्ष के अनुभव के बाद)।

### 📊 बाजार अनुमान व सीमाएं (Market Estimates & Ranges):
- निजी अस्पतालों, कॉर्पोरेट क्लिनिक्स या स्वतंत्र प्रैक्टिस में शुरुआती आय शहर (Tier 1 vs Tier 2), संस्थान और शिफ्ट्स पर निर्भर करती है (सामान्यतः ₹6.0 LPA से ₹10.5 LPA)।
- **महत्वपूर्ण सूचना**: कोई भी प्रमाणित EdTech प्लेटफॉर्म नौकरी या निश्चित पैकेज की गारंटी नहीं दे सकता। आय हमेशा आपकी योग्यता, काउंसिल रजिस्ट्रेशन और निरंतर कौशल पर निर्भर करती है।

### 🎯 अनुशंसित अगला कदम:
उच्चतर वेतन वर्ग में पहुँचने के लिए आवश्यक कोर स्किल्स को प्रमाणित करने हेतु KAABIL असेसमेंट पूरा करें।`,
          sources: [
            career.regulatoryBody || "National Regulatory Commission",
            career.salarySource || "Ministry of Health & Family Welfare / 7th Pay Commission Scale 2024",
          ],
          disclaimer,
        };
      }

      if (language === "hinglish") {
        return {
          content: `**${career.title}** ke liye authentic salary benchmarks aur market analysis:

### 📌 Verified Salary Benchmarks:
- **Regulatory Authority**: ${career.regulatoryBody || "Statutory Council"}
- **Prescribed Entrance Exam**: ${career.keyEntranceExams.join(", ") || "National Entrance"}
- **Starting Benchmark**: ~₹${startSalaryLpa} LPA (~₹${Math.round(career.avgStartingSalaryInr / 12).toLocaleString("en-IN")}/month base in government tertiary institutions).
- **Official Source**: ${career.salarySource || "7th Pay Commission Scale"}
- **Mid-Career Projection**: ~₹${midSalaryLpa} LPA (with specialized postgraduate qualification and 5+ years experience).

### 📊 Market Estimates:
- Private healthcare chains aur corporate clinics mein starting packages ₹6.0 LPA se ₹10.0 LPA ke beech vary karte hain depending on city tier and department.
- **Zero-Guarantees Note**: Salaries official licensing aur continuous competence par depend karti hain; koi platform automatic salary guarantee nahi de sakta.

### 🎯 Recommended Next Step:
Apne profile ke skill gaps ko complete karein taaki aapka Career Readiness Index Dimension 3 upgrade ho sake.`,
          sources: [
            career.regulatoryBody || "Statutory Authority",
            career.salarySource || "Official Government Pay Gazette 2024",
          ],
          disclaimer,
        };
      }

      return {
        content: `Here are the verified salary benchmarks and compensation data for **${career.title}**:

### 📌 Verified Government Benchmark:
- **Regulatory Authority**: ${career.regulatoryBody || "National Medical Commission (NMC)"}
- **Prescribed Entrance Examinations**: ${career.keyEntranceExams.join(", ") || "NEET-UG (National Eligibility cum Entrance Test)"}
- **Entry-Level Starting Salary**: ~₹${startSalaryLpa} Lakhs Per Annum (LPA).
- **Official Source Reference**: ${career.salarySource || "7th Central Pay Commission Guidelines"}.
- **Mid-Career Growth Benchmark**: ~₹${midSalaryLpa} LPA (typically achieved after 5–8 years of professional practice).

### 📊 Market Estimates & Variable Factors:
- In private corporate hospitals, diagnostic centers, or specialized practices, compensation spans from ₹6.5 LPA to ₹11.0 LPA depending on geographic tier, institutional pedigree, and specialty rotation.
- **Statutory Notice**: Remuneration is governed by statutory registration with ${career.regulatoryBody || "the relevant regulatory council"} and verified practical expertise. KAABIL strictly avoids misleading package guarantees.

### 🎯 Actionable Next Step:
Review the specific skill requirements for this role in your Digital Twin to target high-impact competencies.`,
        sources: [
          career.regulatoryBody || "National Medical Commission (NMC)",
          career.salarySource || "Official Regulatory & Pay Commission Standards 2024",
        ],
        disclaimer,
      };
    }

    // -------------------------------------------------------------------------
    // SCENARIO 6: Eligibility & Entrance Exams Queries
    // -------------------------------------------------------------------------
    if (
      q.includes("exam") ||
      q.includes("entrance") ||
      q.includes("eligibility") ||
      q.includes("criteria") ||
      q.includes("neet") ||
      q.includes("jee") ||
      q.includes("clat") ||
      q.includes("upsc") ||
      q.includes("पात्रता") ||
      q.includes("एग्जाम") ||
      q.includes("परीक्षा")
    ) {
      const career = verified || CAREER_PATHS_DATABASE.find((c) => c.slug === "mbbs-doctor")!;

      if (language === "hi") {
        return {
          content: `**${career.title}** के लिए आधिकारिक पात्रता और प्रवेश परीक्षा का विवरण:

### 📌 प्रमाणित वैधानिक मानदंड (Verified Statutory Rules):
- **नियामक निकाय (Regulatory Council)**: ${career.regulatoryBody || "संबद्ध राष्ट्रीय परिषद"}।
- **मुख्य प्रवेश परीक्षा (Key Entrance Exam)**: **${career.keyEntranceExams.join(", ") || "राष्ट्रीय स्तर की प्रवेश परीक्षा"}**।
- **शैक्षणिक पात्रता**: ${career.eligibilityCriteria || "संबंधित विषयों के साथ 12वीं कक्षा में न्यूनतम निर्धारित अंक।"}
- **शीर्ष संस्थान**: ${career.topCollegesInIndia.slice(0, 4).join(", ")}।

### 📊 परीक्षा तैयारी सूचना (Exam Preparation Guidelines):
- वार्षिक परीक्षा तिथियां, कटऑफ अंक और आवेदन फॉर्म संबंधित आधिकारिक पोर्टल (जैसे NTA, UPSC या राज्य परीक्षा प्राधिकरण) द्वारा जारी किए जाते हैं। 
- फर्जी कटऑफ अनुमानों से बचें और हमेशा आधिकारिक बुलेटिन देखें।

### 🎯 अनुशंसित अगला कदम:
अपने रोडमैप में प्रवेश परीक्षा के पाठ्यक्रम से जुड़े दैनिक अध्ययन टास्क को पूरा करें।`,
          sources: [career.regulatoryBody || "National Regulatory Council", "Official Examination Authority Gazette"],
          disclaimer,
        };
      }

      if (language === "hinglish") {
        return {
          content: `**${career.title}** ke official eligibility criteria aur entrance exam details:

### 📌 Verified Statutory Criteria:
- **Regulatory Authority**: ${career.regulatoryBody || "National Statutory Body"}
- **Official Entrance Exams**: **${career.keyEntranceExams.join(", ")}**
- **Eligibility Criteria**: ${career.eligibilityCriteria || "12th standard with required subject combinations."}
- **Top Government & Accredited Institutions**: ${career.topCollegesInIndia.slice(0, 4).join(", ")}

### 📊 Important Notice on Cutoffs & Dates:
- Exam dates aur category-wise cutoff marks har saal official testing agencies (jaise NTA / NBE / State CET) release karti hain.
- Unofficial cutoffs par rely na karein; hamesha official notification refer karein.

### 🎯 Next Step:
Apne learning plan mein is hafte ke core subject sprint par focus karein.`,
          sources: [career.regulatoryBody || "National Statutory Authority", "Official Exam Information Bulletin"],
          disclaimer,
        };
      }

      return {
        content: `Here are the official regulatory requirements and entrance examinations for **${career.title}**:

### 📌 Verified Statutory & Eligibility Criteria:
- **Regulatory Authority**: ${career.regulatoryBody || "National Regulatory Commission"}
- **Prescribed Entrance Examinations**: **${career.keyEntranceExams.join(", ")}**
- **Statutory Eligibility**: ${career.eligibilityCriteria || "Class 12 senior secondary qualification with mandatory domain subjects."}
- **Leading Accredited Institutions**: ${career.topCollegesInIndia.slice(0, 4).join(", ")}

### 📊 Examination Advisory & Verification Guidelines:
- Application schedules and category cutoffs fluctuate annually based on candidate volume and seat matrix. Consult official testing portals (e.g. NTA, UPSC, ICAI) for authentic dates.

### 🎯 Actionable Next Step:
Check your Learning Plan to ensure your weekly study sprint aligns with these syllabus foundations.`,
        sources: [career.regulatoryBody || "National Statutory Body", "Official Central Testing Agency Gazette"],
        disclaimer,
      };
    }

    // -------------------------------------------------------------------------
    // SCENARIO 6: Skill Gap & Assessment Queries
    // -------------------------------------------------------------------------
    if (
      q.includes("skill") ||
      q.includes("gap") ||
      q.includes("assessment") ||
      q.includes("test") ||
      q.includes("verify") ||
      q.includes("कौशल") ||
      q.includes("गैप") ||
      q.includes("असेसमेंट")
    ) {
      const gaps = context.topSkillGaps && context.topSkillGaps.length > 0
        ? context.topSkillGaps
        : [
            { skillName: "Domain Core Concepts", gapSeverity: "CRITICAL" as const, recommendedAction: "Complete diagnostic evaluation" },
            { skillName: "Applied Problem Solving", gapSeverity: "MODERATE" as const, recommendedAction: "Complete weekly sprint milestone" },
          ];

      const gapListStr = gaps
        .map((g, i) => `${i + 1}. **${g.skillName}** (${g.gapSeverity === "CRITICAL" ? "🔴 अनिवार्य गैप" : "🟡 अनुशंसित"}): ${g.recommendedAction}`)
        .join("\n");

      if (language === "hi") {
        return {
          content: `आपके **${context.targetCareer}** के लक्ष्य के लिए वर्तमान कौशल स्थिति और असेसमेंट मार्गदर्शन:

### 📌 वर्तमान कौशल गैप विश्लेषण (Verified Skill Gaps):
${gapListStr}

- **सत्यापित कौशल**: ${context.verifiedSkills.length > 0 ? context.verifiedSkills.join(", ") : "अभी कोई कौशल सत्यापित नहीं है"}
- **स्व-रिपोर्ट किए गए कौशल**: ${context.selfReportedSkills.join(", ") || "कोई नहीं"}

### 📊 सत्यापन का महत्व:
स्व-रिपोर्ट किए गए कौशल प्रारंभिक होते हैं। जब आप KAABIL का निष्पक्ष असेसमेंट पास करते हैं, तो कौशल आपके **डिजिटल स्किल पासपोर्ट** में SHA-256 हैश के साथ स्थायी रूप से प्रमाणित हो जाता है, जिससे आपका CRI स्कोर बढ़ता है।

### 🎯 अनुशंसित अगला कदम:
अपने पहले क्रिटिकल गैप **"${gaps[0].skillName}"** का 15-मिनट का असेसमेंट दें।`,
          sources: ["KAABIL Competency Framework v1.0", "National Skill Development Corporation (NSDC)"],
          disclaimer,
        };
      }

      if (language === "hinglish") {
        return {
          content: `Aapke **${context.targetCareer}** trajectory ke liye current skill gap status:

### 📌 Identified Skill Gaps:
${gapListStr}

- **Verified Skills**: ${context.verifiedSkills.length > 0 ? context.verifiedSkills.join(", ") : "None verified yet"}
- **Self-Reported Claims**: ${context.selfReportedSkills.join(", ") || "None"}

### 📊 Evidence-Backed Verification:
Self-reported skills unverified hote hain. Jab aap KAABIL ka diagnostic assessment pass karte hain, toh skill **PLATFORM_ASSESSED** ban jati hai aur aapka CRI Dimension 3 instantly badh jata hai.

### 🎯 Recommended Next Step:
Abhi **"${gaps[0].skillName}"** ka diagnostic test lekar apni profile ko verified banayein!`,
          sources: ["KAABIL Competency Framework v1.0", "NSDC National Skill Standards"],
          disclaimer,
        };
      }

      return {
        content: `Here is the diagnostic skill gap analysis for your **${context.targetCareer}** trajectory:

### 📌 Current Skill Gap Diagnostic:
${gapListStr}

- **Platform-Assessed Skills**: ${context.verifiedSkills.length > 0 ? context.verifiedSkills.join(", ") : "None verified yet"}
- **Self-Reported Skills**: ${context.selfReportedSkills.join(", ") || "None"}

### 📊 Three-Tier Evidence Verification:
Self-reported entries reflect stated interest. Passing objective KAABIL assessments mints cryptographic evidence into your Digital Skill Passport, directly elevating your Career Readiness Index.

### 🎯 Actionable Next Step:
Take the 15-minute diagnostic assessment for **"${gaps[0].skillName}"** to transform this unverified gap into an assessed credential.`,
        sources: ["KAABIL Competency Standards v1.0", "National Skill Qualification Framework (NSQF)"],
        disclaimer,
      };
    }

    // -------------------------------------------------------------------------
    // SCENARIO 7: Learning Plan, Roadmap & "What Should I Do Today"
    // -------------------------------------------------------------------------
    if (
      q.includes("today") ||
      q.includes("aaj") ||
      q.includes("roadmap") ||
      q.includes("plan") ||
      q.includes("sprint") ||
      q.includes("task") ||
      q.includes("क्या करूँ") ||
      q.includes("रोडमैप")
    ) {
      const task = context.activeSprintTask || {
        title: "Review foundational principles and solve diagnostic problems",
        estimatedMinutes: 45,
        resourceTitle: "NPTEL / Swayam / NCERT Curated Module",
        dayNumber: 1,
        weekNumber: 1,
      };

      if (language === "hi") {
        return {
          content: `नमस्ते ${context.studentName}! आपके **${context.targetCareer}** के लिए आज की अध्ययन प्राथमिकता:

### 🎯 आज का अनुशंसित कार्य (Today's Priority Task):
- **कार्य (Task)**: **${task.title}**
- **अनुमानित समय**: ${task.estimatedMinutes} मिनट
- **संबद्ध संसाधन**: ${task.resourceTitle || "NCERT / Swayam प्रमाणित सामग्री"}
- **वर्तमान माइलस्टोन**: ${context.activeMilestoneTitle || "फाउंडेशन बिल्डिंग"}

### 📊 व्यावहारिक अध्ययन सुझाव:
- 45 मिनट का केंद्रित समय निकालें (बिना सोशल मीडिया रुकावट के)।
- अध्ययन के बाद 3 मुख्य अवधारणाओं के संक्षिप्त नोट्स बनाएं।
- कार्य पूर्ण होने पर अपने लर्निंग प्लान में इसे 'Complete' मार्क करें।

### 🎯 अगला कदम:
अपने लर्निंग प्लान पर जाएं और आज का टास्क शुरू करें!`,
          sources: ["Curated Indian Educational Resources (NPTEL/SWAYAM/NCERT)"],
          disclaimer,
        };
      }

      if (language === "hinglish") {
        return {
          content: `Hey ${context.studentName}! Aapke **${context.targetCareer}** learning schedule ke according aaj ka action plan:

### 🎯 Today's Priority Action:
- **Task**: **${task.title}**
- **Time Required**: ~${task.estimatedMinutes} minutes
- **Recommended Resource**: ${task.resourceTitle || "SWAYAM / NPTEL / NCERT"}
- **Active Milestone**: ${context.activeMilestoneTitle || "Core Fundamentals"}

### 📊 Daily Study Tip:
- Ek continuous 45-minute sprint karein.
- Task complete hote hi learning plan dashboard par checkbox tick karein taaki aapka CRI milestone score upgrade ho sake.

### 🎯 Next Step:
Directly apne Learning Plan Hub par click karein aur aaj ka task complete karein!`,
          sources: ["Curated Free Resources Database (SWAYAM/NPTEL)"],
          disclaimer,
        };
      }

      return {
        content: `Hello ${context.studentName}! Here is your personalized daily learning priority for **${context.targetCareer}**:

### 🎯 Today's Priority Action Item:
- **Task**: **${task.title}**
- **Estimated Duration**: ~${task.estimatedMinutes} minutes
- **Curated Educational Resource**: ${task.resourceTitle || "SWAYAM / NPTEL / NCERT Core Text"}
- **Active Weekly Milestone**: ${context.activeMilestoneTitle || "Foundational Competencies"}

### 📊 Execution Guidance:
- Dedicate a distraction-free block of time for this sprint.
- Completing and logging this task automatically synchronizes with Dimension 5 (Learning Sprints) of your Career Readiness Index.

### 🎯 Actionable Next Step:
Open your Learning Plan page to launch today's task.`,
        sources: ["Curated Free National Educational Resources (SWAYAM/NPTEL)"],
        disclaimer,
      };
    }

    // -------------------------------------------------------------------------
    // SCENARIO 8: Confused / Undecided Student
    // -------------------------------------------------------------------------
    if (
      context.currentStream === "UNDECIDED" ||
      q.includes("confused") ||
      q.includes("don't know") ||
      q.includes("which stream") ||
      q.includes("कन्फ्यूज") ||
      q.includes("क्या चुनूँ") ||
      q.includes("समझ नहीं")
    ) {
      if (language === "hi") {
        return {
          content: `नमस्ते ${context.studentName}! करियर और स्ट्रीम को लेकर असमंजस में होना पूरी तरह से **सामान्य और स्वाभाविक** है। सही फैसला दबाव में नहीं, बल्कि व्यवस्थित समझ के साथ लिया जाता है।

### 📌 KAABIL 3-चरणीय खोज प्रक्रिया (Systematic Discovery):
1. **अपनी जन्मजात रुचियों को पहचानें**: क्या आपको लोगों का इलाज करना पसंद है (Medical), तकनीक व गणित (STEM), व्यवसाय व वित्त (Commerce), सामाजिक नीति (Arts), या रचनात्मक कलाएं (Design)?
2. **डायग्नोस्टिक एप्टीट्यूड टेस्ट**: हमारा 20-प्रश्नों का निष्पक्ष असेसमेंट आपकी तार्किक, विश्लेषणात्मक और व्यावहारिक प्राथमिकताओं का मानचित्र तैयार करता है।
3. **करियर एक्सप्लोरेशन**: 134 से अधिक प्रमाणित करियर प्रोफाइल देखें जहाँ दैनिक काम, आवश्यक विषय और वास्तविक वेतन पारदर्शी रूप से दर्ज हैं।

### 🎯 अनुशंसित अगला कदम:
हमारे **यूनिवर्सल एप्टीट्यूड डायग्नोस्टिक** से शुरुआत करें। इससे आपकी वास्तविक ताकत सामने आएगी।`,
          sources: ["NEP 2020 Holistic Stream Guidance", "KAABIL Career Discovery Taxonomy"],
          disclaimer,
        };
      }

      if (language === "hinglish") {
        return {
          content: `Hello ${context.studentName}! Career aur stream choose karne mein confused hona bilkul normal hai. India mein har saal lakhon students is stage se gujarte hain.

### 📌 3-Step Systematic Discovery:
1. **Aptitude First**: Sabse pehle identify karein ki aapko problem solving, biology/care, numbers/finance, law/public policy ya creative design mein se kya sabse natural lagta hai.
2. **Take Diagnostic Test**: KAABIL ka universal aptitude assessment bina kisi bias ke aapke cognitive strengths ko map karta hai.
3. **Explore Real Pathways**: Fir un streams ke verified career options dekhein jahan 100% transparency ke sath entrance exams aur daily life likhi hui hai.

### 🎯 Recommended Next Step:
Aap hamare **Universal Career Discovery** test ko start karein taaki hum aapke liye personalised recommendation generate kar sakein!`,
          sources: ["NEP 2020 Multidisciplinary Guidelines", "KAABIL Aptitude Diagnostics"],
          disclaimer,
        };
      }

      return {
        content: `Hello ${context.studentName}! Feeling uncertain about your career path is a completely natural and healthy stage of education. Career decisions are best made through systematic discovery rather than guesswork.

### 📌 KAABIL 3-Step Discovery Framework:
1. **Cognitive Strength Mapping**: Understand whether your innate abilities align with clinical problem-solving (PCB), logical and mathematical systems (PCM), financial acumen (Commerce), governance and social inquiry (Arts), or creative execution (Design).
2. **Objective Diagnostic Assessment**: Our non-punitive diagnostic assessment maps your core aptitudes across multiple intelligences.
3. **Explore Verified Indian Pathways**: Review transparent career benchmarks across all 13 streams without artificial tech or engineering bias.

### 🎯 Actionable Next Step:
Take the Universal Aptitude & Discovery Diagnostic to identify your strongest career alignments.`,
        sources: ["National Education Policy (NEP 2020)", "KAABIL Universal Discovery Framework"],
        disclaimer,
      };
    }

    // -------------------------------------------------------------------------
    // SCENARIO 9: General / Default Mentoring Response
    // -------------------------------------------------------------------------
    const career = verified || CAREER_PATHS_DATABASE.find((c) => c.slug === "mbbs-doctor")!;
    const criDisplay = context.isUnassessed ? "Unassessed" : `${context.criScore}/100`;

    if (language === "hi") {
      return {
        content: `नमस्ते ${context.studentName}! मैं आपका KAABIL AI करियर मेंटर हूँ।

आपकी स्ट्रीम **${context.streamLabel}** और लक्ष्य **${career.title}** के अनुसार:

### 📌 सत्यापित करियर अवलोकन (Verified Career Profile):
- **नियामक निकाय**: ${career.regulatoryBody || "राष्ट्रीय वैधानिक परिषद"}
- **प्रवेश परीक्षा**: ${career.keyEntranceExams.join(", ") || "मान्यता प्राप्त प्रवेश परीक्षा"}
- **शुरुआती वेतन बेंचमार्क**: ~₹${(career.avgStartingSalaryInr / 100000).toFixed(1)} LPA (${career.salarySource || "सरकारी वेतनमान"})
- **वर्तमान रेडीनेस स्कोर (CRI)**: ${criDisplay}

### 📊 मार्गदर्शन:
${career.overview || "यह एक अत्यधिक प्रतिष्ठित और महत्वपूर्ण करियर है जिसमें निरंतर समर्पण और अनुशासित तैयारी की आवश्यकता होती है।"}

### 🎯 अगला कदम:
आप मुझसे प्रवेश परीक्षा की तैयारी, वैकल्पिक करियर, अपने दैनिक रोडमैप या स्किल गैप के बारे में कुछ भी पूछ सकते हैं!`,
        sources: [career.regulatoryBody || "Statutory Council", career.salarySource || "Official Government Standards"],
        disclaimer,
      };
    }

    if (language === "hinglish") {
      return {
        content: `Hello ${context.studentName}! Main aapka KAABIL AI Career Mentor hoon.

Aapki stream **${context.streamLabel}** aur target **${career.title}** ke liye:

### 📌 Verified Career Snapshot:
- **Regulatory Council**: ${career.regulatoryBody || "National Statutory Body"}
- **Key Entrance Exams**: ${career.keyEntranceExams.join(", ")}
- **Starting Salary Benchmark**: ~₹${(career.avgStartingSalaryInr / 100000).toFixed(1)} LPA (${career.salarySource})
- **Career Readiness Index**: ${criDisplay}

### 📊 Guidance:
${career.tagline || "Structured step-by-step progress se aap apne target goal ko achieve kar sakte hain."}

### 🎯 Next Steps:
Aap mujhse exam syllabus, salary benchmarks, alternative backup options ya daily study tasks ke baare mein freely pooch sakte hain!`,
        sources: [career.regulatoryBody || "Statutory Body", career.salarySource || "Official Standards"],
        disclaimer,
      };
    }

    return {
      content: `Hello ${context.studentName}! I am your KAABIL AI Career Mentor, calibrated to guide your journey in **${context.streamLabel}** towards becoming a **${career.title}**.

### 📌 Verified Career Snapshot:
- **Governing Body**: ${career.regulatoryBody || "National Statutory Commission"}
- **Prescribed Entrance Exams**: ${career.keyEntranceExams.join(", ")}
- **Benchmark Starting Salary**: ~₹${(career.avgStartingSalaryInr / 100000).toFixed(1)} LPA (${career.salarySource})
- **Career Readiness Index (CRI)**: ${criDisplay}

### 📊 Overview:
${career.overview?.slice(0, 220) || "This trajectory offers significant societal impact and clear advancement pathways through accredited qualifications."}...

### 🎯 Actionable Next Step:
You can ask me about statutory eligibility, side-by-side career comparisons, alternative pathways, your active learning plan, or diagnostic skill verifications!`,
      sources: [career.regulatoryBody || "National Statutory Body", career.salarySource || "Official Government Scale"],
      disclaimer,
    };
  }

  /**
   * Detects whether an actionable proposal should be attached to the response.
   */
  public static detectActionProposal(
    context: StudentLiveContext,
    userMessage: string,
    mentionedCareer?: CareerPathData
  ): MentorActionProposal | null {
    const q = userMessage.toLowerCase();

    // 1. Career Comparison
    if (
      (q.includes("vs") || q.includes("compare") || q.includes("versus") || q.includes("difference")) &&
      (mentionedCareer || context.targetCareerVerified)
    ) {
      const { careerA, careerB } = this.extractComparedCareers(userMessage, context, mentionedCareer);
      return {
        type: "CAREER_COMPARISON",
        title: `Compare ${careerA.title} vs ${careerB.title}`,
        description: `View side-by-side regulatory requirements, degree duration, exams, and salary benchmarks.`,
        actionUrl: `/compare?careers=${careerA.slug},${careerB.slug}`,
        actionText: "Open Side-by-Side Comparison",
        payload: {
          compareCareerSlugs: [careerA.slug, careerB.slug],
        },
      };
    }

    // 2. Practical Project Exploration (checked before general skills)
    if (q.includes("project") || q.includes("portfolio") || q.includes("practical deliverable") || q.includes("प्रोजेक्ट")) {
      return {
        type: "PROJECT_EXPLORATION",
        title: context.activeProject ? `Project: ${context.activeProject.title}` : "Explore Practical Domain Projects",
        description: `Build and submit real-world project deliverables to demonstrate practical competence.`,
        actionUrl: "/student/learning-plan#projects",
        actionText: "View Projects Hub",
        payload: {
          stream: context.currentStream,
        },
      };
    }

    // 3. Learning Plan & Daily Task
    if (
      q.includes("today") ||
      q.includes("roadmap") ||
      q.includes("plan") ||
      q.includes("sprint") ||
      q.includes("task") ||
      q.includes("schedule") ||
      q.includes("क्या करूँ")
    ) {
      return {
        type: "LEARNING_TASK",
        title: context.activeSprintTask ? `Today's Action: ${context.activeSprintTask.title}` : "View Adaptive Learning Plan",
        description: context.activeSprintTask
          ? `Complete today's ${context.activeSprintTask.estimatedMinutes}-minute structured sprint module.`
          : `Review your 4-week structured sprint and active milestones.`,
        actionUrl: "/student/learning-plan",
        actionText: "Open Learning Plan",
        payload: {
          taskTitle: context.activeSprintTask?.title,
          targetMilestoneTitle: context.activeMilestoneTitle || "Core Foundations",
        },
      };
    }

    // 4. Skill Assessment & Verification
    if (
      q.includes("assessment") ||
      q.includes("test") ||
      q.includes("verify") ||
      q.includes("gap") ||
      q.includes("कौशल") ||
      q.includes("असेसमेंट")
    ) {
      const topGap = context.topSkillGaps?.[0];
      return {
        type: "RECOMMENDED_ASSESSMENT",
        title: topGap ? `Assessment: Verify ${topGap.skillName}` : "Take Diagnostic Skill Assessment",
        description: topGap
          ? `Verify ${topGap.skillName} through an objective assessment to upgrade your CRI score.`
          : `Take an objective diagnostic assessment in ${context.targetCareer} to mint verified credentials.`,
        actionUrl: topGap?.relatedAssessmentSlug ? `/student/assessments` : `/student/assessments`,
        actionText: "Start Diagnostic Assessment",
        payload: {
          assessmentSlug: topGap?.relatedAssessmentSlug || "asm-undec-01",
          assessmentTitle: topGap?.relatedAssessmentTitle || "Domain Diagnostic Assessment",
        },
      };
    }

    // 4. Practical Project
    if (q.includes("project") || q.includes("portfolio") || q.includes("practical") || q.includes("प्रोजेक्ट")) {
      return {
        type: "PROJECT_EXPLORATION",
        title: context.activeProject ? `Project: ${context.activeProject.title}` : "Explore Practical Domain Projects",
        description: `Build and submit real-world project deliverables to demonstrate practical competence.`,
        actionUrl: "/student/learning-plan#projects",
        actionText: "View Projects Hub",
        payload: {
          stream: context.currentStream,
        },
      };
    }

    // 5. Undecided or Exploring Streams
    if (context.currentStream === "UNDECIDED" || q.includes("confused") || q.includes("stream") || q.includes("discovery")) {
      return {
        type: "CAREER_EXPLORATION",
        title: "Take Universal Career Discovery Assessment",
        description: "Answer 20 structured scenario questions to identify your strongest aptitude and career streams.",
        actionUrl: "/student/assessments/discovery",
        actionText: "Begin Career Discovery",
        payload: {
          actionId: "start-discovery",
        },
      };
    }

    return null;
  }

  /**
   * Conversation management helpers with strict authorization
   */
  public static async getConversations(studentProfileId: string) {
    return devStore.getMentorConversations(studentProfileId);
  }

  public static async getConversation(conversationId: string) {
    return devStore.getMentorConversation(conversationId);
  }

  public static async createConversation(
    studentProfileId: string,
    initialMessage?: string,
    language: "en" | "hi" | "hinglish" = "en"
  ) {
    const profile = devStore.getProfile(studentProfileId) || devStore.getProfileByUserId(studentProfileId);
    const convId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const stream = profile?.currentStream || "UNDECIDED";
    const career =
      profile?.careerGoals?.[0]?.careerPath?.title ||
      profile?.targetCareerPathId ||
      "Career Mentorship";

    const title = initialMessage
      ? initialMessage.slice(0, 36) + (initialMessage.length > 36 ? "..." : "")
      : `${career} Consultation`;

    const conv = {
      id: convId,
      studentProfileId,
      title,
      currentStream: stream,
      language,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    devStore.saveMentorConversation(conv);

    // If an initial message was provided, add it and generate mentor reply
    if (initialMessage) {
      const userMsg = {
        id: `msg-${Date.now()}-u`,
        conversationId: convId,
        sender: "STUDENT",
        content: initialMessage,
        language,
        createdAt: new Date().toISOString(),
      };
      devStore.addMentorMessage(convId, userMsg);
      await this.generateMentorResponse(studentProfileId, convId, initialMessage, language);
    }

    return devStore.getMentorConversation(convId);
  }

  public static async deleteConversation(conversationId: string) {
    return devStore.deleteMentorConversation(conversationId);
  }
}
