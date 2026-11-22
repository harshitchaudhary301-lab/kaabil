// ==============================================================================
// KAABIL (काबिल) — Universal AI Career Mentor Service
// Personalized, Trilingual (English, Hindi, Hinglish), All 13 Streams
// Gemini 2.0 Flash integration with deterministic fallback & actionable proposals
// ==============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { devStore } from "@/lib/dev-store";
import { CareerDigitalTwinService } from "@/lib/digital-twin/digital-twin-service";
import { CareerReadinessEngine } from "@/lib/readiness/cri-engine";
import { AdaptiveRoadmapEngine } from "@/lib/roadmap/adaptive-roadmap-engine";
import { DailyMissionsEngine } from "@/lib/missions/daily-missions-engine";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const AI_ENABLED = process.env.AI_FEATURE_ENABLED !== "false" && !!GEMINI_API_KEY;
const TIMEOUT_MS = 8000;

export interface MentorActionProposal {
  type: "ROADMAP_UPDATE" | "RECOMMENDED_ASSESSMENT" | "MISSION_SUGGESTION";
  title: string;
  description: string;
  payload: {
    actionId?: string;
    targetMilestoneTitle?: string;
    assessmentId?: string;
    assessmentTitle?: string;
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
  actionProposal?: MentorActionProposal | null;
  createdAt: string;
}

export interface StudentLiveContext {
  studentName: string;
  educationStage: string;
  currentStream: string;
  targetCareer: string;
  criScore: number;
  criStatus: string;
  dimensionBreakdown: {
    careerKnowledge: number;
    educationalPreparation: number;
    skillDevelopment: number;
    practicalLearning: number;
    milestoneProgress: number;
  };
  verifiedSkills: string[];
  selfReportedSkills: string[];
  topSkillGaps?: string[];
  verifiedCredentialsCount?: number;
  activeMilestoneTitle?: string;
  completedMissionsCount: number;
  isMinor: boolean;
}

export class AiMentorService {
  private static genAI: GoogleGenerativeAI | null = null;

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
   * Builds the comprehensive live context for a student from Digital Twin, CRI, and Roadmaps.
   */
  public static async getStudentLiveContext(studentProfileId: string): Promise<StudentLiveContext> {
    let profile = devStore.getProfile(studentProfileId);
    if (!profile) {
      profile = devStore.getProfileByUserId(studentProfileId);
    }
    if (!profile) {
      profile = devStore.getProfileByEmail(studentProfileId);
    }
    let criData = {
      overallScore: 0,
      status: "UNASSESSED",
      breakdown: {
        careerKnowledge: 0,
        educationalPreparation: 0,
        skillDevelopment: 0,
        practicalLearning: 0,
        milestoneProgress: 0,
      },
    };

    try {
      const cri = await CareerReadinessEngine.calculateReadiness(studentProfileId);
      criData = {
        overallScore: cri.overallScore || 0,
        status: cri.status,
        breakdown: {
          careerKnowledge: cri.dimensions.careerKnowledge.score,
          educationalPreparation: cri.dimensions.educationalPreparation.score,
          skillDevelopment: cri.dimensions.skillDevelopment.score,
          practicalLearning: cri.dimensions.practicalLearning.score,
          milestoneProgress: cri.dimensions.milestoneProgress.score,
        },
      };
    } catch (e) {
      console.warn("[AiMentorService] CRI fetch note:", e);
    }

    const roadmap = devStore.getRoadmap(studentProfileId);
    const activeMilestone = roadmap?.milestones?.find((m: any) => !m.isCompleted)?.title || roadmap?.milestones?.[0]?.title;
    const missions = devStore.getMissions(studentProfileId);
    const completedMissionsCount = missions.filter((m: any) => m.status === "COMPLETED").length;

    const verifiedSkills = (profile?.userSkills || [])
      .filter((s: any) => s.isVerified)
      .map((s: any) => s.skill?.name || s.name);
    const selfReportedSkills = (profile?.userSkills || [])
      .filter((s: any) => !s.isVerified)
      .map((s: any) => s.skill?.name || s.name);

    // Latest Skill Gaps
    const pastAnalyses = devStore.getSkillGapAnalyses(studentProfileId);
    const latestAnalysis = pastAnalyses[0];
    const topSkillGaps = (latestAnalysis?.priorityDevelopmentAreas || [])
      .map((p: any) => p.skillName)
      .slice(0, 3);

    // Verified credentials count
    const credentials = devStore.getCredentials(studentProfileId);
    const verifiedCredentialsCount = credentials.filter((c: any) => c.status === "ACTIVE").length;

    return {
      studentName: profile?.user?.name || "Student",
      educationStage: profile?.educationStage || "CLASS_12",
      currentStream: profile?.currentStream || "UNDECIDED",
      targetCareer: profile?.careerGoals?.[0]?.careerPath?.title || profile?.targetCareerPathId || "Exploring Paths",
      criScore: criData.overallScore,
      criStatus: criData.status,
      dimensionBreakdown: criData.breakdown,
      verifiedSkills: verifiedSkills.length > 0 ? verifiedSkills : ["Basic Foundations"],
      selfReportedSkills: selfReportedSkills.length > 0 ? selfReportedSkills : ["Domain Interest"],
      topSkillGaps,
      verifiedCredentialsCount,
      activeMilestoneTitle: activeMilestone,
      completedMissionsCount,
      isMinor: ["CLASS_8", "CLASS_9", "CLASS_10"].includes(profile?.educationStage),
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

    if (AI_ENABLED && client) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API timeout after 8 seconds")), TIMEOUT_MS)
        );

        const aiPromise = (async () => {
          const model = client.getGenerativeModel({
            model: GEMINI_MODEL,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 600,
            },
          });

          const systemPrompt = `You are KAABIL AI Career Mentor (काबिल करियर मेंटर), a senior, empathetic, pragmatic, and highly knowledgeable career guide for Indian students across ALL 13 educational streams (Medical, Non-Medical/STEM, Commerce, Arts/Humanities, Law, Management, Creative Design, Agriculture, Vocational/Trades, Sports, Hospitality, Interdisciplinary, Undecided).

STUDENT PROFILE CONTEXT:
- Name: ${context.studentName}
- Stage: ${context.educationStage} ${context.isMinor ? "(MINOR / HIGH SCHOOL STUDENT - enforce DPDP Act 2023 age-appropriate guidance)" : ""}
- Current Stream: ${context.currentStream}
- Target Career: ${context.targetCareer}
- Career Readiness Index (CRI): ${context.criScore}/100 (${context.criStatus})
- Verified Skills: ${context.verifiedSkills.join(", ")}
- Self-Reported Skills: ${context.selfReportedSkills.join(", ")}
- Active Milestone: ${context.activeMilestoneTitle || "None"}
- Completed Daily Missions: ${context.completedMissionsCount}

LANGUAGE REQUIREMENT:
${
  language === "hi"
    ? "Respond entirely in clean, encouraging Hindi (हिन्दी) using Devanagari script with high clarity."
    : language === "hinglish"
    ? "Respond in conversational Hinglish (blend of conversational Hindi in Latin script and clear English career terms) that Indian students connect with easily."
    : "Respond in clear, encouraging, structured English."
}

MANDATORY RULES:
1. Equal respect and parity for all 13 streams: Never demean non-STEM streams or treat engineering/medicine as superior to arts, law, sports, or vocational trades.
2. ZERO Hallucination: Do not invent fake admission guarantees, fake official cutoffs, or non-existent government exams.
3. Action-oriented: Provide 1-2 concrete, actionable next steps tied directly to their roadmap or skill verification.
4. Keep the response concise, structured (2-3 paragraphs or bullet points), and warm.`;

          const result = await model.generateContent([
            { text: systemPrompt },
            { text: `Student says: "${userMessage}"` },
          ]);

          return result.response.text();
        })();

        const responseText = await Promise.race([aiPromise, timeoutPromise]);
        if (responseText && responseText.trim().length > 0) {
          mentorContent = responseText.trim();
          source = "gemini_2_flash";
        }
      } catch (err) {
        console.warn("[AiMentorService] Gemini live invocation failed, switching to deterministic fallback:", err);
      }
    }

    // Fallback if AI was unavailable or failed
    if (!mentorContent) {
      mentorContent = this.generateDeterministicMentorResponse(context, userMessage, language);
      source = "kaabil_deterministic_mentor";
    }

    // Check if we should attach an actionable proposal
    actionProposal = this.detectActionProposal(context, userMessage);

    const reply: MentorReply = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId,
      sender: "MENTOR",
      content: mentorContent,
      language,
      source,
      actionProposal,
      createdAt: new Date().toISOString(),
    };

    // Save message to devStore
    devStore.addMentorMessage(conversationId, reply);

    return reply;
  }

  /**
   * High-quality deterministic mentor fallback covering all 13 streams and 3 languages.
   */
  private static generateDeterministicMentorResponse(
    context: StudentLiveContext,
    userMessage: string,
    language: "en" | "hi" | "hinglish"
  ): string {
    const qLower = userMessage.toLowerCase();
    const stream = context.currentStream;
    const career = context.targetCareer;
    const cri = context.criScore;

    if (language === "hi") {
      if (qLower.includes("roadmap") || qLower.includes("रोडमैप") || qLower.includes("प्लान")) {
        return `नमस्ते ${context.studentName}! आपके **${career}** के लक्ष्य के लिए वर्तमान रोडमैप माइलस्टोन **"${context.activeMilestoneTitle || "बुनियादी तैयारी"}"** पर केंद्रित है।\n\nआपका वर्तमान करियर रेडीनेस इंडेक्स (CRI) **${cri}/100** है। अगले स्तर पर पहुँचने के लिए:\n1. अपने दैनिक मिशन पूरे करें ताकि प्रैक्टिकल ज्ञान बढ़े।\n2. अपने कौशलों को प्रमाणित (Verify) करने के लिए स्किल असेसमेंट दें।\n\nक्या आप चाहते हैं कि हम इस सप्ताह के लक्ष्यों को एडजस्ट करें?`;
      }
      if (qLower.includes("skill") || qLower.includes("कौशल") || qLower.includes("असेसमेंट")) {
        return `कौशल विकास आपके करियर का आधार है। आपके पास वर्तमान में सत्यापित कौशल हैं: **${context.verifiedSkills.join(", ")}**।\n\nअपने CRI स्कोर के स्किल डाइमेंशन को मजबूत करने के लिए KAABIL असेसमेंट पोर्टल से संबंधित टेस्ट दें। इससे आपकी डिजिटल ट्विन प्रोफाइल इंडस्ट्री-रेडी बनेगी।`;
      }
      return `नमस्ते ${context.studentName}! मैं आपका KAABIL करियर मेंटर हूँ। आपकी स्ट्रीम **${stream.replace(/_/g, " ")}** और लक्ष्य **${career}** के अनुसार, सही दिशा में निरंतर छोटे कदम सबसे प्रभावी होते हैं। आपका वर्तमान रेडीनेस स्कोर **${cri}/100** है।\n\nआप मुझसे रोडमैप, एंट्रेंस एग्ज़ाम, स्किल गैप या दैनिक अध्ययन रूटीन के बारे में कुछ भी पूछ सकते हैं।`;
    }

    if (language === "hinglish") {
      if (qLower.includes("roadmap") || qLower.includes("milestone") || qLower.includes("plan")) {
        return `Hey ${context.studentName}! Aapke **${career}** ke goal ke liye abhi current milestone **"${context.activeMilestoneTitle || "Foundation Building"}"** chal raha hai.\n\nAapka CRI score abhi **${cri}/100** hai. Next level par jaane ke liye:\n1. Apne pending Daily AI Missions ko complete karein.\n2. Self-reported skills ko KAABIL assessments se verify karein taaki profile strong bane.\n\nKuch specific doubt hai toh batayein!`;
      }
      if (qLower.includes("skill") || qLower.includes("test") || qLower.includes("assessment")) {
        return `Skills ko verify karna bohot important hai! Abhi aapke verified skills hain: **${context.verifiedSkills.join(", ")}**.\n\nAgar aap **${context.selfReportedSkills[0] || "core domain skills"}** ka assessment dekar pass karte hain, toh aapka CRI Dimension 3 instantly upgrade ho jaayega.`;
      }
      return `Hello ${context.studentName}! Main aapka KAABIL Career Mentor hoon. Aapki stream **${stream.replace(/_/g, " ")}** aur target **${career}** ke hisaab se hum step-by-step progress karenge. Aapka current CRI Score **${cri}/100** hai.\n\nAap mujhse exam prep, roadmaps, stream switch ya practical skills ke baare mein freely pooch sakte hain!`;
    }

    // Default English
    if (qLower.includes("roadmap") || qLower.includes("milestone") || qLower.includes("plan")) {
      return `Hello ${context.studentName}! Looking at your **${career}** trajectory, your active milestone is currently **"${context.activeMilestoneTitle || "Core Foundations"}"** with a Career Readiness Index (CRI) of **${cri}/100**.\n\nTo maintain strong momentum:\n1. Complete your 2 daily micro-missions to reinforce applied concepts.\n2. Back your self-reported skills with verified KAABIL assessments.\n\nWould you like me to recommend specific adjustments to your 12-week schedule?`;
    }
    if (qLower.includes("skill") || qLower.includes("assessment") || qLower.includes("test") || qLower.includes("verify")) {
      return `Skill verification provides authentic proof of competence. Currently, your verified portfolio includes: **${context.verifiedSkills.join(", ")}**.\n\nTo strengthen Dimension 3 of your CRI, I recommend taking the **"${stream.replace(/_/g, " ")}"** skill assessment. Passing will mint verified tamper-evident evidence into your Career Digital Twin.`;
    }
    return `Hello ${context.studentName}! I am your KAABIL AI Career Mentor. I am calibrated to support your journey in **${stream.replace(/_/g, " ")}** towards becoming a **${career}**. Your current Career Readiness Index stands at **${cri}/100**.\n\nFeel free to ask about strategic subject selection, competitive exams, practical project ideas, or reviewing your active learning roadmap.`;
  }

  /**
   * Detects whether an actionable proposal should be attached to the response.
   */
  private static detectActionProposal(context: StudentLiveContext, userMessage: string): MentorActionProposal | null {
    const qLower = userMessage.toLowerCase();

    if (qLower.includes("assessment") || qLower.includes("test") || qLower.includes("verify") || qLower.includes("test me")) {
      return {
        type: "RECOMMENDED_ASSESSMENT",
        title: "Take Verified Skill Assessment",
        description: `Verify your competence in ${context.targetCareer} fundamentals to increase your CRI score.`,
        payload: {
          assessmentId: "asm-undec-01",
          assessmentTitle: "Universal Aptitude & Critical Reasoning Diagnostic",
        },
      };
    }

    if (qLower.includes("roadmap") || qLower.includes("schedule") || qLower.includes("change plan")) {
      return {
        type: "ROADMAP_UPDATE",
        title: "Review Milestone Progression",
        description: `Review active milestone "${context.activeMilestoneTitle || "Foundations"}" and adjust weekly allocations.`,
        payload: {
          targetMilestoneTitle: context.activeMilestoneTitle || "Foundations",
          suggestedWeeks: 12,
        },
      };
    }

    return null;
  }

  /**
   * Conversation management helpers
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
    const profile = devStore.getProfile(studentProfileId);
    const convId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const stream = profile?.currentStream || "UNDECIDED";
    const career = profile?.careerGoals?.[0]?.careerPath?.title || profile?.targetCareerPathId || "Career Mentorship";

    const title = initialMessage
      ? initialMessage.slice(0, 36) + (initialMessage.length > 36 ? "..." : "")
      : `${career} Guidance`;

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
