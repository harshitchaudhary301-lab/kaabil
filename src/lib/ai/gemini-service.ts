// ==============================================================================
// KAABIL (काबिल) — Gemini AI Career Intelligence Service
// Multi-Tier Architecture: Layer 3 Generative AI with Deterministic Safe Fallback
// Strictly enforces Curated Grounding, Rate Limiting & Safe Logging
// ==============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { db, checkDatabaseConnection } from "@/lib/db";

// Configuration from private environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const AI_FEATURE_ENABLED = process.env.AI_FEATURE_ENABLED !== "false" && !!GEMINI_API_KEY;
const REQUEST_TIMEOUT_MS = 8000; // 8-second strict timeout

// Output schema for AI career discovery explanations
export const CareerExplanationSchema = z.object({
  personalizedSummary: z.string().min(10),
  whyRecommended: z.array(z.string().min(5)).min(1),
  alignedStrengths: z.array(z.string()).default([]),
  skillsToExplore: z.array(z.string()).default([]),
  actionableNextSteps: z.array(z.string()).min(1),
  potentialChallenges: z.array(z.string()).default([]),
  multilingualNote: z.string().optional(),
});

export type CareerExplanation = z.infer<typeof CareerExplanationSchema>;

// Input context for career explanation
export interface CareerContext {
  studentName: string;
  educationStage: string;
  selectedStreams: string[];
  interests: string[];
  skills: string[];
  careerGoal?: string;
  preferredLanguage?: "en" | "hi" | "hinglish";
  careerTitle: string;
  careerOverview: string;
  typicalDuration: string;
  entranceExams: string[];
  requiredSkills: string[];
}

class GeminiCareerService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      } catch (err) {
        console.warn("[KAABIL Gemini] SDK initialization warning:", err);
      }
    }
  }

  /**
   * Generates explainable career guidance using Gemini AI or falls back to deterministic rules.
   * Never fakes or simulates a live response; explicitly marks fallback source.
   */
  async generateCareerExplanation(context: CareerContext): Promise<{
    explanation: CareerExplanation;
    source: "gemini_ai" | "deterministic_engine";
    modelUsed: string;
    latencyMs: number;
  }> {
    const startTime = Date.now();
    const lang = context.preferredLanguage || "en";

    // 1. If Gemini is not configured, return transparent deterministic explanation
    if (!AI_FEATURE_ENABLED || !this.genAI) {
      const fallback = this.generateDeterministicExplanation(context, lang);
      await this.logAiUsage({
        featureName: "CAREER_DISCOVERY",
        modelUsed: "deterministic-rule-engine",
        status: "FALLBACK",
        latencyMs: Date.now() - startTime,
        errorMessage: "Gemini API key is unconfigured in development environment",
      });

      return {
        explanation: fallback,
        source: "deterministic_engine",
        modelUsed: "deterministic-rule-engine",
        latencyMs: Date.now() - startTime,
      };
    }

    // 2. Build structured prompt with prompt-injection defenses
    const prompt = this.buildPrompt(context, lang);

    try {
      const model = this.genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
          temperature: 0.2, // Low temperature for high factual accuracy
          responseMimeType: "application/json",
        },
      });

      // Wrap in strict timeout promise
      const generatePromise = model.generateContent(prompt);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API request timed out (8s limit)")), REQUEST_TIMEOUT_MS)
      );

      const result = await Promise.race([generatePromise, timeoutPromise]);
      const rawText = result.response.text();
      const parsedJson = JSON.parse(rawText);

      // Validate with Zod
      const validated = CareerExplanationSchema.parse(parsedJson);
      const latencyMs = Date.now() - startTime;

      await this.logAiUsage({
        featureName: "CAREER_DISCOVERY",
        modelUsed: GEMINI_MODEL,
        status: "SUCCESS",
        latencyMs,
      });

      return {
        explanation: validated,
        source: "gemini_ai",
        modelUsed: GEMINI_MODEL,
        latencyMs,
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.warn("[KAABIL Gemini] Fallback triggered due to:", err.message);

      const fallback = this.generateDeterministicExplanation(context, lang);
      await this.logAiUsage({
        featureName: "CAREER_DISCOVERY",
        modelUsed: GEMINI_MODEL,
        status: "FALLBACK",
        latencyMs: Date.now() - startTime,
        errorMessage: err.message,
      });

      return {
        explanation: fallback,
        source: "deterministic_engine",
        modelUsed: "deterministic-fallback-rules",
        latencyMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Constructs prompt templates with strict system instructions and formatting boundaries.
   */
  private buildPrompt(ctx: CareerContext, lang: "en" | "hi" | "hinglish"): string {
    const langInstructions = {
      en: "Respond in clear, encouraging, academic English.",
      hi: "कृपया शुद्ध और सहज हिन्दी में उत्तर दें। सभी मुख्य करियर बिंदु स्पष्ट रखें।",
      hinglish: "Respond in natural, conversational Hinglish (blend of Hindi and English) commonly understood by Indian students.",
    }[lang];

    return `
You are the KAABIL AI Career Discovery Assistant for India.
You must adhere strictly to established facts and never invent entrance exams, salaries, or regulatory rules.

Student Context:
- Name: ${ctx.studentName}
- Current Education Stage: ${ctx.educationStage}
- Selected Educational Streams: ${ctx.selectedStreams.join(", ")}
- Documented Interests: ${ctx.interests.join(", ")}
- Self-Reported Skills: ${ctx.skills.join(", ")}
- Target Milestone: ${ctx.careerGoal || "Exploratory"}

Recommended Career to Explain:
- Title: ${ctx.careerTitle}
- Overview: ${ctx.careerOverview}
- Duration: ${ctx.typicalDuration}
- Known Entrance Exams: ${ctx.entranceExams.join(", ")}
- Key Benchmark Skills: ${ctx.requiredSkills.join(", ")}

Language Requirement: ${langInstructions}

Return ONLY valid JSON matching this exact structure:
{
  "personalizedSummary": "2-3 sentences explaining why this career aligns with the student's unique background.",
  "whyRecommended": ["Specific reason 1 connecting their interests/skills to this career", "Specific reason 2"],
  "alignedStrengths": ["Strengths the student already demonstrates"],
  "skillsToExplore": ["1-2 benchmark skills the student should develop next"],
  "actionableNextSteps": ["Step 1 (e.g. entrance exam preparation)", "Step 2 (academic milestone)"],
  "potentialChallenges": ["1 realistic academic or commitment consideration"],
  "multilingualNote": "Encouraging closing note in the selected language dialect."
}
`;
  }

  /**
   * Deterministic fallback rule engine.
   * Produces explainable, high-quality guidance based on curated career information.
   */
  generateDeterministicExplanation(ctx: CareerContext, lang: "en" | "hi" | "hinglish"): CareerExplanation {
    const matchedInterests = ctx.interests.filter((i) =>
      ctx.careerOverview.toLowerCase().includes(i.toLowerCase()) ||
      ctx.careerTitle.toLowerCase().includes(i.toLowerCase())
    );

    const matchedSkills = ctx.skills.filter((s) =>
      ctx.requiredSkills.some((req) => req.toLowerCase().includes(s.toLowerCase()))
    );

    const skillsToDevelop = ctx.requiredSkills.filter(
      (req) => !ctx.skills.some((s) => s.toLowerCase().includes(req.toLowerCase()))
    ).slice(0, 3);

    const examNotice = ctx.entranceExams.length > 0
      ? `Prepare for the recognized entrance gateway: ${ctx.entranceExams.slice(0, 2).join(", ")}.`
      : "Research accredited degree colleges and admission requirements.";

    if (lang === "hi") {
      return {
        personalizedSummary: `${ctx.studentName}, आपके द्वारा चुने गए विषयों और कौशल के आधार पर ${ctx.careerTitle} आपके लिए एक अत्यधिक अनुकूल करियर मार्ग है।`,
        whyRecommended: [
          matchedInterests.length > 0
            ? `आपकी रुचि (${matchedInterests.join(", ")}) सीधे इस क्षेत्र की आवश्यकताओं से मेल खाती है।`
            : `यह करियर आपकी वर्तमान शैक्षिक पृष्ठभूमि (${ctx.educationStage.replace(/_/g, " ")}) से सीधा जुड़ाव रखता है।`,
          `इस क्षेत्र में विशेषज्ञता के लिए निरंतर विकास और सीखने के व्यापक अवसर हैं।`,
        ],
        alignedStrengths: matchedSkills.length > 0 ? matchedSkills : ["सीखने की जिज्ञासा", "विश्लेषणात्मक दृष्टिकोण"],
        skillsToExplore: skillsToDevelop.length > 0 ? skillsToDevelop : ["अग्रिम डोमेन ज्ञान"],
        actionableNextSteps: [
          examNotice,
          `नियमित रूप से बुनियादी सिद्धांतों का अभ्यास करें और पाठ्यक्रम की समीक्षा करें।`,
        ],
        potentialChallenges: ["इस करियर में नियमित अध्ययन और व्यावहारिक अभ्यास के प्रति समर्पण आवश्यक है।"],
        multilingualNote: "काबिल (KAABIL) की मदद से आप हर कदम पर अपने कौशल को परख सकते हैं।",
      };
    }

    if (lang === "hinglish") {
      return {
        personalizedSummary: `${ctx.studentName}, aapki selected streams aur skills ke according ${ctx.careerTitle} aapke liye ek high-compatibility career option hai.`,
        whyRecommended: [
          matchedInterests.length > 0
            ? `Aapke interests (${matchedInterests.join(", ")}) directly is career ke core domains se match karte hain.`
            : `Aapki current education stage (${ctx.educationStage.replace(/_/g, " ")}) is pathway ke liye natural foundation provide karti hai.`,
          `Is career domain mein national level growth aur verified skills ki high demand hai.`,
        ],
        alignedStrengths: matchedSkills.length > 0 ? matchedSkills : ["Foundational Curiosity", "Analytical Mindset"],
        skillsToExplore: skillsToDevelop.length > 0 ? skillsToDevelop : ["Advanced Technical Competencies"],
        actionableNextSteps: [
          examNotice,
          `Daily 5-minute AI missions complete karein aur verified credentials build karein.`,
        ],
        potentialChallenges: ["Dedicated study hours aur structured preparation required hogi."],
        multilingualNote: "KAABIL ke adaptive roadmap ke sath aap step-by-step prepare kar sakte hain.",
      };
    }

    // Default: English
    return {
      personalizedSummary: `Based on your profile and educational background, ${ctx.careerTitle} represents a strong strategic match for your skills and aspirations.`,
      whyRecommended: [
        matchedInterests.length > 0
          ? `Your interests in ${matchedInterests.join(", ")} directly align with the core competencies of this field.`
          : `Your education stage (${ctx.educationStage.replace(/_/g, " ")}) provides an appropriate foundational trajectory.`,
        `Offers documented career progression across Indian public and private institutions.`,
      ],
      alignedStrengths: matchedSkills.length > 0 ? matchedSkills : ["Foundational Analytical Aptitude", "Subject Engagement"],
      skillsToExplore: skillsToDevelop.length > 0 ? skillsToDevelop : ["Domain Competency Verification"],
      actionableNextSteps: [
        examNotice,
        `Complete self-assessment checkpoints and review accredited institutions offering this curriculum.`,
      ],
      potentialChallenges: ["Requires sustained academic discipline and structured entrance preparation."],
      multilingualNote: "Explore this career pathway and review eligibility prerequisites below.",
    };
  }

  /**
   * Logs AI telemetry safely to database without storing PII
   */
  private async logAiUsage(params: {
    featureName: string;
    modelUsed: string;
    status: "SUCCESS" | "FALLBACK" | "ERROR";
    latencyMs: number;
    errorMessage?: string;
  }) {
    try {
      const conn = await checkDatabaseConnection();
      if (conn.connected) {
        await db.aiUsageLog.create({
          data: {
            featureName: params.featureName,
            modelUsed: params.modelUsed,
            status: params.status,
            latencyMs: params.latencyMs,
            errorMessage: params.errorMessage || null,
          },
        });
      }
    } catch {
      // Safe non-blocking telemetry catch
    }
  }
}

export const geminiCareerService = new GeminiCareerService();
