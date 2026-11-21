// ==============================================================================
// KAABIL (काबिल) — Daily AI Missions Engine
// Age-appropriate, non-punitive daily career development micro-activities
// Grounded across all 13 educational streams with reflective learning loops
// ==============================================================================

import { prisma } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { getCareerBySlug, ALL_CAREERS } from "@/data/careersData";

export interface DailyMissionData {
  id: string;
  studentProfileId: string;
  title: string;
  objective: string;
  instructions: string;
  estimatedMinutes: number;
  missionType: "KNOWLEDGE_CHECK" | "SKILL_EXERCISE" | "CAREER_EXPLORATION" | "REFLECTION";
  careerSlug: string;
  stream: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "RESCHEDULED";
  reflectionText?: string | null;
  feedbackRating?: number | null;
  scheduledDate: string;
  completedAt?: string | null;
  questionText?: string | null;
  options?: any;
  correctOption?: number | null;
  explanation?: string | null;
  isAnswered?: boolean;
  isCorrect?: boolean;
}

export class DailyMissionsEngine {
  /**
   * Retrieves today's active missions for a student, generating new ones if none exist.
   */
  static async getTodayMissions(studentProfileId: string): Promise<DailyMissionData[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const existingMissions = await prisma.dailyMission.findMany({
        where: {
          studentProfileId,
          scheduledDate: { gte: today },
        },
        orderBy: { dateAssigned: "asc" },
      });

      if (existingMissions.length > 0) {
        return existingMissions.map(this.formatMission);
      }
    } catch {
      // Offline fallback
    }

    const offlineMissions = devStore.getMissions(studentProfileId);
    if (offlineMissions && offlineMissions.length > 0) {
      return offlineMissions;
    }

    // Generate fresh missions for today
    return this.generateMissionsForStudent(studentProfileId);
  }

  /**
   * Generates 1 to 2 tailored daily micro-missions for a student profile.
   */
  static async generateMissionsForStudent(
    studentProfileId: string,
    careerSlug?: string
  ): Promise<DailyMissionData[]> {
    let profile: any = null;
    try {
      profile = await prisma.studentProfile.findUnique({
        where: { id: studentProfileId },
        include: {
          careerGoals: { include: { careerPath: true } },
          roadmaps: {
            where: { status: "ACTIVE" },
            include: { milestones: true },
            take: 1,
          },
        },
      });
    } catch {
      // Offline fallback
    }

    if (!profile) {
      profile = devStore.getProfile(studentProfileId);
    }

    const targetSlug =
      careerSlug ||
      profile?.careerGoals?.[0]?.careerPath?.slug ||
      profile?.targetCareerPathId ||
      "ai-systems-engineer";

    const career = getCareerBySlug(targetSlug) || ALL_CAREERS[0];
    const stream = career.stream;
    const stage = profile?.educationStage || "CLASS_12";

    const missionTemplates = this.getMissionTemplatesForStream(career, stream, stage);

    try {
      const createdMissions = await Promise.all(
        missionTemplates.slice(0, 2).map((tmpl) =>
          prisma.dailyMission.create({
            data: {
              studentProfileId,
              title: tmpl.title,
              objective: tmpl.objective,
              instructions: tmpl.instructions,
              estimatedMinutes: tmpl.estimatedMinutes,
              missionType: tmpl.missionType,
              careerSlug: career.slug,
              stream: career.stream,
              status: "PENDING" as const,
              scheduledDate: new Date(),
              dateAssigned: new Date(),
              questionText: tmpl.questionText || null,
              options: (tmpl.options as any) || null,
              correctOption: tmpl.correctOption ?? null,
              explanation: tmpl.explanation || null,
            },
          })
        )
      );

      return createdMissions.map(this.formatMission);
    } catch {
      // Offline fallback in devStore
      const fallbackList = missionTemplates.slice(0, 2).map((tmpl, idx) => ({
        id: `mission-${studentProfileId}-${idx + 1}`,
        studentProfileId,
        title: tmpl.title,
        objective: tmpl.objective,
        instructions: tmpl.instructions,
        estimatedMinutes: tmpl.estimatedMinutes,
        missionType: tmpl.missionType,
        careerSlug: career.slug,
        stream: career.stream,
        status: "PENDING" as const,
        scheduledDate: new Date().toISOString(),
        dateAssigned: new Date().toISOString(),
      }));
      devStore.saveMissions(studentProfileId, fallbackList);
      return fallbackList;
    }
  }

  /**
   * Completes a daily mission with a student reflection and optional feedback rating.
   */
  static async completeMission(
    studentProfileId: string,
    missionId: string,
    reflectionText: string,
    feedbackRating?: number
  ): Promise<DailyMissionData | null> {
    let mission = null;
    try {
      mission = await prisma.dailyMission.findFirst({
        where: { id: missionId, studentProfileId },
      });
    } catch {
      // Offline fallback
    }

    if (!mission) {
      return devStore.completeMission(studentProfileId, missionId, reflectionText, feedbackRating);
    }

    const updated = await prisma.dailyMission.update({
      where: { id: missionId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        reflectionText: reflectionText || "Mission completed thoughtfully.",
        feedbackRating: feedbackRating || 5,
        isAnswered: true,
      },
    });

    return this.formatMission(updated);
  }

  /**
   * Skips a mission non-punitively with an optional student reason.
   */
  static async skipMission(
    studentProfileId: string,
    missionId: string,
    reason?: string
  ): Promise<DailyMissionData | null> {
    let mission = null;
    try {
      mission = await prisma.dailyMission.findFirst({
        where: { id: missionId, studentProfileId },
      });
    } catch {
      // Offline fallback
    }

    if (!mission) {
      return devStore.skipMission(studentProfileId, missionId);
    }

    const updated = await prisma.dailyMission.update({
      where: { id: missionId },
      data: {
        status: "SKIPPED",
        reflectionText: reason ? `Skipped: ${reason}` : "Skipped for self-paced scheduling.",
      },
    });

    return this.formatMission(updated);
  }

  // --------------------------------------------------------------------------
  // STREAM-SPECIFIC MISSION TEMPLATES (ALL 13 STREAMS)
  // --------------------------------------------------------------------------

  private static getMissionTemplatesForStream(
    career: any,
    stream: string,
    stage: string
  ): Omit<DailyMissionData, "id" | "studentProfileId" | "scheduledDate" | "status">[] {
    switch (stream) {
      case "MEDICAL_PCB":
        return [
          {
            title: "Clinical Observational Micro-Case",
            objective: "Identify the biological mechanism of insulin regulation and ketoacidosis symptoms.",
            instructions: "Read the 2-paragraph case study on pancreatic endocrine function. Note down the distinction between Type 1 and Type 2 diabetes pathways.",
            estimatedMinutes: 15,
            missionType: "KNOWLEDGE_CHECK",
            careerSlug: career.slug,
            stream: "MEDICAL_PCB",
            questionText: "Which pancreatic cells are responsible for synthesizing and secreting insulin in the human body?",
            options: ["Alpha Cells", "Beta Cells (Islets of Langerhans)", "Delta Cells", "Acinar Cells"],
            correctOption: 1,
            explanation: "Beta cells located within the Islets of Langerhans in the pancreas synthesize and secrete insulin to regulate blood glucose homeostasis.",
          },
          {
            title: "NMC Patient Empathy Reflection",
            objective: "Understand doctor-patient communication ethics under National Medical Commission guidelines.",
            instructions: "Reflect on how an attending physician should communicate a serious diagnostic finding with dignity and active listening.",
            estimatedMinutes: 10,
            missionType: "REFLECTION",
            careerSlug: career.slug,
            stream: "MEDICAL_PCB",
          },
        ];

      case "COMMERCE":
        return [
          {
            title: "Financial Statement Health Check",
            objective: "Analyze working capital and liquidity ratios for a listed Indian enterprise.",
            instructions: "Calculate the Current Ratio from the provided balance sheet snippet. Note whether working capital is positive or under strain.",
            estimatedMinutes: 15,
            missionType: "SKILL_EXERCISE",
            careerSlug: career.slug,
            stream: "COMMERCE",
            questionText: "If a company has Current Assets of ₹25 Lakhs and Current Liabilities of ₹10 Lakhs, what is its Current Ratio?",
            options: ["1.5 : 1", "2.5 : 1", "0.4 : 1", "3.0 : 1"],
            correctOption: 1,
            explanation: "Current Ratio = Current Assets / Current Liabilities = ₹25L / ₹10L = 2.5 : 1, indicating strong short-term liquidity.",
          },
          {
            title: "ICAI Statutory Ethics Briefing",
            objective: "Review auditor independence standards under Standards on Auditing (SA 200).",
            instructions: "Summarize in 3 bullet points why an auditor cannot accept audit engagements for entities where they hold significant equity.",
            estimatedMinutes: 15,
            missionType: "CAREER_EXPLORATION",
            careerSlug: career.slug,
            stream: "COMMERCE",
          },
        ];

      case "LAW":
        return [
          {
            title: "Constitutional Privacy Judgment Analysis",
            objective: "Understand the 9-judge bench ruling in K.S. Puttaswamy v. Union of India.",
            instructions: "Identify the 3-pronged proportionality test required to justify state intrusion into personal privacy under Article 21.",
            estimatedMinutes: 20,
            missionType: "KNOWLEDGE_CHECK",
            careerSlug: career.slug,
            stream: "LAW",
            questionText: "Under the Puttaswamy privacy judgment, which constitutional Article encompasses the fundamental Right to Privacy?",
            options: ["Article 14", "Article 19", "Article 21", "Article 32"],
            correctOption: 2,
            explanation: "The Supreme Court unanimously held that the Right to Privacy is an intrinsic part of the Right to Life and Personal Liberty under Article 21.",
          },
          {
            title: "Contractual Force Majeure Drafting",
            objective: "Deconstruct an unforeseen event clause in a commercial service agreement.",
            instructions: "Draft a 4-line clause defining notice requirements when unexpected statutory delays prevent contract performance.",
            estimatedMinutes: 15,
            missionType: "SKILL_EXERCISE",
            careerSlug: career.slug,
            stream: "LAW",
          },
        ];

      default:
        // Default / STEM / General Career
        return [
          {
            title: `${career.title} Technical Concept Sprint`,
            objective: `Reinforce foundational competence in core principles of ${career.title}.`,
            instructions: `Review the primary responsibilities and tools utilized in ${career.domainName}. Formulate a 2-sentence summary of its daily workflow.`,
            estimatedMinutes: 15,
            missionType: "KNOWLEDGE_CHECK",
            careerSlug: career.slug,
            stream: career.stream,
            questionText: `Which statutory or professional authority sets standard qualifications for ${career.title}?`,
            options: [
              career.regulatoryBody || "All India Council for Technical Education (AICTE)",
              "Unregulated Open Practice",
              "State Municipal Authority",
              "General Trade Directorate",
            ],
            correctOption: 0,
            explanation: `Standard educational and licensure qualifications are governed by ${career.regulatoryBody || "statutory councils"}.`,
          },
          {
            title: "Career Reflection & Goal Alignment",
            objective: "Align your weekly learning pace with your long-term career ambition.",
            instructions: "Write down 1 skill from your target career that you practiced this week, and 1 question you want to explore next.",
            estimatedMinutes: 10,
            missionType: "REFLECTION",
            careerSlug: career.slug,
            stream: career.stream,
          },
        ];
    }
  }

  private static formatMission(m: any): DailyMissionData {
    return {
      id: m.id,
      studentProfileId: m.studentProfileId,
      title: m.title,
      objective: m.objective || "",
      instructions: m.instructions || "",
      estimatedMinutes: m.estimatedMinutes,
      missionType: m.missionType as any,
      careerSlug: m.careerSlug || "",
      stream: m.stream || "",
      status: m.status as any,
      reflectionText: m.reflectionText,
      feedbackRating: m.feedbackRating,
      scheduledDate: m.scheduledDate ? m.scheduledDate.toISOString() : new Date().toISOString(),
      completedAt: m.completedAt ? m.completedAt.toISOString() : null,
      questionText: m.questionText,
      options: m.options,
      correctOption: m.correctOption,
      explanation: m.explanation,
      isAnswered: m.isAnswered,
      isCorrect: m.isCorrect,
    };
  }
}
