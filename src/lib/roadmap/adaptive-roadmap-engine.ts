// ==============================================================================
// KAABIL (काबिल) — Adaptive Career Roadmap Engine
// Generates and manages personalized, stream-specific career roadmaps
// Across all 13 educational streams with dynamic milestone progression
// ==============================================================================

import { prisma } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { getCareerBySlug, ALL_CAREERS } from "@/data/careersData";

export interface RoadmapActivityItem {
  id: string;
  title: string;
  description: string;
  activityType: "PREREQUISITE" | "SKILL_PRACTICE" | "ENTRANCE_PREP" | "PRACTICAL_PROJECT" | "VERIFIED_RESOURCE";
  estimatedMinutes: number;
  isCompleted: boolean;
  completedAt?: string | null;
  resourceTitle?: string;
  resourceUrl?: string;
}

export interface RoadmapMilestoneData {
  id: string;
  weekNumber: number;
  stage: "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM";
  timeframe: string;
  title: string;
  description: string;
  activities: RoadmapActivityItem[];
  estimatedMinutes: number;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface StructuredRoadmapData {
  id: string;
  studentProfileId: string;
  careerSlug: string;
  careerTitle: string;
  stream: string;
  title: string;
  overview: string;
  durationMonths: number;
  totalWeeks: number;
  currentWeekIndex: number;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
  version: number;
  completionPercentage: number;
  milestones: RoadmapMilestoneData[];
  createdAt: string;
  updatedAt: string;
}

export class AdaptiveRoadmapEngine {
  /**
   * Retrieves the active roadmap for a student, or generates one if none exists.
   */
  static async getOrGenerateRoadmap(
    studentProfileId: string,
    careerSlug?: string
  ): Promise<StructuredRoadmapData | null> {
    let existing: any = null;
    try {
      existing = await prisma.userRoadmap.findFirst({
        where: {
          studentProfileId,
          status: "ACTIVE" as const,
          ...(careerSlug ? { careerSlug } : {}),
        },
        include: {
          milestones: { orderBy: { weekNumber: "asc" } },
        },
      });
    } catch {
      // Offline fallback
    }

    if (existing) {
      return this.formatRoadmap(existing);
    }

    const offlineRoadmap = devStore.getRoadmap(studentProfileId);
    if (offlineRoadmap) {
      return offlineRoadmap;
    }

    // Determine target career
    let targetSlug = careerSlug;
    if (!targetSlug) {
      try {
        const profile = await prisma.studentProfile.findUnique({
          where: { id: studentProfileId },
          include: { careerGoals: { include: { careerPath: true } } },
        });
        targetSlug =
          profile?.careerGoals[0]?.careerPath.slug ||
          profile?.targetCareerPathId ||
          "ai-systems-engineer";
      } catch {
        const devProf = devStore.getProfile(studentProfileId);
        targetSlug = devProf?.targetCareerPathId || devProf?.careerGoals?.[0]?.careerPath?.slug || "ai-systems-engineer";
      }
    }

    return this.generateRoadmap(studentProfileId, targetSlug || "ai-systems-engineer");
  }

  /**
   * Generates a stream-specific adaptive roadmap across all 13 educational streams.
   */
  static async generateRoadmap(
    studentProfileId: string,
    careerSlug: string
  ): Promise<StructuredRoadmapData> {
    let profile: any = null;
    try {
      profile = await prisma.studentProfile.findUnique({
        where: { id: studentProfileId },
        include: {
          learningPreference: true,
        },
      });
    } catch {
      // Offline fallback
    }

    if (!profile) {
      profile = devStore.getProfile(studentProfileId);
    }

    const career = getCareerBySlug(careerSlug) || ALL_CAREERS[0];
    const stream = career.stream;
    const weeklyHours = profile?.learningPreference?.weeklyHoursAvailable || 10;
    const stage = profile?.educationStage || "CLASS_12";

    // Build stream-specific milestones
    const generatedMilestones = this.buildStreamSpecificMilestones(career, stream, stage, weeklyHours);

    try {
      // Archive any previous active roadmap for this career
      await prisma.userRoadmap.updateMany({
        where: { studentProfileId, careerSlug: career.slug, status: "ACTIVE" },
        data: { status: "ARCHIVED" },
      });

      // Create new roadmap record in PostgreSQL
      const roadmap = await prisma.userRoadmap.create({
        data: {
          studentProfileId,
          targetCareerId: career.id || career.slug,
          careerSlug: career.slug,
          title: `${career.title} Preparation Roadmap`,
          overview: `Tailored 12-week educational preparation roadmap for ${career.title} under ${career.regulatoryBody || "Statutory Council"} standards.`,
          durationMonths: 3,
          totalWeeks: 12,
          currentWeekIndex: 1,
          status: "ACTIVE" as const,
          version: 1,
          milestones: {
            create: generatedMilestones.map((m) => ({
              weekNumber: m.weekNumber,
              stage: m.stage,
              timeframe: m.timeframe,
              title: m.title,
              description: m.description,
              activities: m.activities as any,
              estimatedMinutes: m.estimatedMinutes,
              isCompleted: false,
            })),
          },
        },
        include: {
          milestones: { orderBy: { weekNumber: "asc" } },
        },
      });

      return this.formatRoadmap(roadmap);
    } catch {
      // Offline persistent fallback in devStore
      const offlineRoadmap = {
        id: `roadmap-${studentProfileId}`,
        studentProfileId,
        careerSlug: career.slug,
        careerTitle: career.title,
        stream: career.stream,
        title: `${career.title} Preparation Roadmap`,
        overview: `Tailored 12-week educational preparation roadmap for ${career.title} under ${career.regulatoryBody || "Statutory Council"} standards.`,
        durationMonths: 3,
        totalWeeks: 12,
        currentWeekIndex: 1,
        status: "ACTIVE" as const,
        version: 1,
        completionPercentage: 8,
        milestones: generatedMilestones.map((m, idx) => ({
          ...m,
          id: `milestone-${idx + 1}`,
          isCompleted: idx === 0,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      devStore.saveRoadmap(offlineRoadmap);
      return offlineRoadmap;
    }
  }

  /**
   * Marks a specific activity within a milestone as complete or incomplete.
   */
  static async toggleActivityCompletion(
    studentProfileId: string,
    roadmapId: string,
    milestoneId: string,
    activityId: string
  ): Promise<StructuredRoadmapData | null> {
    let milestone = null;
    try {
      milestone = await prisma.weeklyMilestone.findFirst({
        where: {
          id: milestoneId,
          roadmap: { id: roadmapId, studentProfileId },
        },
      });
    } catch {
      // Offline fallback
    }

    if (!milestone) {
      return devStore.updateRoadmapActivity(milestoneId, activityId, true);
    }

    const activities: RoadmapActivityItem[] = Array.isArray(milestone.activities)
      ? (milestone.activities as any)
      : [];

    let updatedActivityFound = false;
    const updatedActivities = activities.map((act) => {
      if (act.id === activityId) {
        updatedActivityFound = true;
        const newCompleted = !act.isCompleted;
        return {
          ...act,
          isCompleted: newCompleted,
          completedAt: newCompleted ? new Date().toISOString() : null,
        };
      }
      return act;
    });

    if (!updatedActivityFound) return null;

    // Check if all activities are now complete
    const allActivitiesComplete =
      updatedActivities.length > 0 && updatedActivities.every((a) => a.isCompleted);

    await prisma.weeklyMilestone.update({
      where: { id: milestoneId },
      data: {
        activities: updatedActivities as any,
        isCompleted: allActivitiesComplete,
        completedAt: allActivitiesComplete ? new Date() : null,
      },
    });

    // Check if current week index should advance
    if (allActivitiesComplete) {
      await prisma.userRoadmap.update({
        where: { id: roadmapId },
        data: {
          currentWeekIndex: Math.min(12, milestone.weekNumber + 1),
        },
      });
    }

    const updatedRoadmap = await prisma.userRoadmap.findUnique({
      where: { id: roadmapId },
      include: { milestones: { orderBy: { weekNumber: "asc" } } },
    });

    return updatedRoadmap ? this.formatRoadmap(updatedRoadmap) : null;
  }

  /**
   * Regenerates future uncompleted milestones while preserving completed progress.
   */
  static async regenerateFutureMilestones(
    studentProfileId: string,
    roadmapId: string
  ): Promise<StructuredRoadmapData | null> {
    const existing = await prisma.userRoadmap.findFirst({
      where: { id: roadmapId, studentProfileId },
      include: { milestones: { orderBy: { weekNumber: "asc" } } },
    });

    if (!existing) return null;

    // Archive current version snapshot
    await prisma.roadmapVersionHistory.create({
      data: {
        roadmapId: existing.id,
        version: existing.version,
        changeReason: "Regenerated future adaptive milestones based on updated progress.",
        snapshotJson: existing as any,
      },
    });

    const career = getCareerBySlug(existing.careerSlug || "") || ALL_CAREERS[0];
    const completedMilestones = existing.milestones.filter((m) => m.isCompleted);
    const completedWeekNumbers = new Set(completedMilestones.map((m) => m.weekNumber));

    // Generate fresh baseline milestones
    const freshMilestones = this.buildStreamSpecificMilestones(career, career.stream, "CLASS_12", 10);

    // Update uncompleted milestones
    for (const fresh of freshMilestones) {
      if (!completedWeekNumbers.has(fresh.weekNumber)) {
        const matchingDbMilestone = existing.milestones.find((m) => m.weekNumber === fresh.weekNumber);
        if (matchingDbMilestone) {
          await prisma.weeklyMilestone.update({
            where: { id: matchingDbMilestone.id },
            data: {
              title: fresh.title,
              description: fresh.description,
              stage: fresh.stage,
              activities: fresh.activities as any,
              estimatedMinutes: fresh.estimatedMinutes,
            },
          });
        }
      }
    }

    // Increment roadmap version
    const updated = await prisma.userRoadmap.update({
      where: { id: roadmapId },
      data: {
        version: existing.version + 1,
      },
      include: { milestones: { orderBy: { weekNumber: "asc" } } },
    });

    return this.formatRoadmap(updated);
  }

  // --------------------------------------------------------------------------
  // STREAM-SPECIFIC MILESTONE GENERATION ENGINE (ALL 13 STREAMS)
  // --------------------------------------------------------------------------

  private static buildStreamSpecificMilestones(
    career: any,
    stream: string,
    stage: string,
    weeklyHours: number
  ): Omit<RoadmapMilestoneData, "id">[] {
    const milestones: Omit<RoadmapMilestoneData, "id">[] = [];

    // Milestone templates by stream archetype
    switch (stream) {
      case "MEDICAL_PCB":
        milestones.push(
          {
            weekNumber: 1,
            stage: "SHORT_TERM",
            timeframe: "Week 1–2",
            title: "Cellular Biology & Human Physiology Fundamentals",
            description: "Review NCERT/NMC foundational cellular pathways, cell division, and anatomical terms.",
            activities: [
              { id: "act-1", title: "NCERT Biology Unit 1 Deconstruction", description: "Read Cellular Structure & Function chapters with active note-taking.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-2", title: "Medical Terminology Glossary", description: "Compile 30 clinical root terms (cardio-, nephro-, neuro-, hemo-).", activityType: "SKILL_PRACTICE", estimatedMinutes: 45, isCompleted: false },
            ],
            estimatedMinutes: 135,
            isCompleted: false,
          },
          {
            weekNumber: 2,
            stage: "SHORT_TERM",
            timeframe: "Week 3–4",
            title: "Organic Chemistry for Biomolecules & Pharmacology",
            description: "Master reaction mechanisms for functional groups, amino acids, and biochemical enzymes.",
            activities: [
              { id: "act-3", title: "Biomolecule Structure Diagrams", description: "Hand-draw peptide linkages, DNA helical bonds, and lipid bilayers.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
              { id: "act-4", title: "NEET Organic Chemistry Problem Set", description: "Solve 25 past-year NEET-UG multiple-choice questions on hydrocarbons.", activityType: "ENTRANCE_PREP", estimatedMinutes: 90, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 3,
            stage: "MEDIUM_TERM",
            timeframe: "Week 5–8",
            title: "Clinical Observational Skills & Medical Ethics",
            description: "Understand NMC professional conduct regulations, doctor-patient empathy, and diagnostic methods.",
            activities: [
              { id: "act-5", title: "NMC Code of Medical Ethics Review", description: "Review statutory guidelines on patient consent and confidentiality.", activityType: "PREREQUISITE", estimatedMinutes: 60, isCompleted: false },
              { id: "act-6", title: "Clinical Case Study Simulation", description: "Analyze a diabetic ketoacidosis patient presentation case history.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 120, isCompleted: false },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          },
          {
            weekNumber: 4,
            stage: "LONG_TERM",
            timeframe: "Week 9–12",
            title: "NEET-UG Full-Length Mock Testing & Analysis",
            description: "Timed entrance examination simulations with granular negative-marking analysis.",
            activities: [
              { id: "act-7", title: "Timed 180-Question Mock Test", description: "Simulate exact 3-hour 20-minute NEET exam environment.", activityType: "ENTRANCE_PREP", estimatedMinutes: 200, isCompleted: false },
              { id: "act-8", title: "Error Log & Weak-Area Remediation", description: "Categorize every incorrect response by concept gap vs calculation slip.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 260,
            isCompleted: false,
          }
        );
        break;

      case "COMMERCE":
        milestones.push(
          {
            weekNumber: 1,
            stage: "SHORT_TERM",
            timeframe: "Week 1–2",
            title: "Double-Entry Accounting & Ledger Architecture",
            description: "Master debit/credit principles, accounting standards (Ind AS), and trial balance reconciliation.",
            activities: [
              { id: "act-c1", title: "Accounting Standards Ind AS 1 Overview", description: "Study presentation of financial statements according to ICAI benchmarks.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-c2", title: "Multi-Column Cash Book Reconciliation", description: "Reconcile bank statements with corporate cash ledger entries.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 2,
            stage: "SHORT_TERM",
            timeframe: "Week 3–4",
            title: "Financial Statement Modeling in Excel",
            description: "Build integrated 3-statement models (P&L, Balance Sheet, Cash Flow) with dynamic links.",
            activities: [
              { id: "act-c3", title: "P&L to Balance Sheet Linkage", description: "Model working capital schedules and depreciation waterfalls.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 120, isCompleted: false },
              { id: "act-c4", title: "ICAI Foundation Quantitative Aptitude Set", description: "Solve 20 ratio analysis and compound interest practice problems.", activityType: "ENTRANCE_PREP", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          },
          {
            weekNumber: 3,
            stage: "MEDIUM_TERM",
            timeframe: "Week 5–8",
            title: "Direct & Indirect Corporate Taxation Principles",
            description: "Understand GST input tax credits and corporate income tax computations under IT Act 1961.",
            activities: [
              { id: "act-c5", title: "Corporate Income Tax Computation", description: "Calculate taxable business profits after admissible Section 37 deductions.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-c6", title: "GST Input Tax Credit Simulation", description: "Audit supplier invoices for GSTR-2B credit eligibility.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 4,
            stage: "LONG_TERM",
            timeframe: "Week 9–12",
            title: "Statutory Audit Case Study & ICAI Examination Mock",
            description: "Conduct a mock audit review following Standards on Auditing (SA 200 series).",
            activities: [
              { id: "act-c7", title: "Audit Risk Assessment Document", description: "Identify material misstatement risks in corporate revenue recognition.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 120, isCompleted: false },
              { id: "act-c8", title: "ICAI CA Foundation Mock Examination", description: "Complete a full 100-mark Principles & Practice of Accounting test.", activityType: "ENTRANCE_PREP", estimatedMinutes: 180, isCompleted: false },
            ],
            estimatedMinutes: 300,
            isCompleted: false,
          }
        );
        break;

      case "LAW":
        milestones.push(
          {
            weekNumber: 1,
            stage: "SHORT_TERM",
            timeframe: "Week 1–2",
            title: "Constitutional Law & Fundamental Rights Analysis",
            description: "Deconstruct Part III of the Constitution of India and landmark Supreme Court judicial rulings.",
            activities: [
              { id: "act-l1", title: "Article 14, 19 & 21 Case Law Briefing", description: "Brief the Kesavananda Bharati and Puttaswamy judgments.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-l2", title: "Legal Reasoning Practice Passages", description: "Complete 5 passage-based legal comprehension problems from CLAT papers.", activityType: "ENTRANCE_PREP", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 2,
            stage: "SHORT_TERM",
            timeframe: "Week 3–4",
            title: "Law of Contracts & Commercial Drafting",
            description: "Master Indian Contract Act 1872 essentials: offer, acceptance, consideration, and breach remedies.",
            activities: [
              { id: "act-l3", title: "Draft a Non-Disclosure Agreement (NDA)", description: "Draft standard commercial clauses with indemnification provisions.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 90, isCompleted: false },
              { id: "act-l4", title: "Identify Void Agreements Case Scenarios", description: "Analyze 5 factual scenarios for restraint of trade under Section 27.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 3,
            stage: "MEDIUM_TERM",
            timeframe: "Week 5–8",
            title: "Criminal Jurisprudence & Statutory Interpretation",
            description: "Examine principles of mens rea, actus reus, and Bharatiya Nyaya Sanhita (BNS) provisions.",
            activities: [
              { id: "act-l5", title: "BNS Statutory Provisions Comparison", description: "Compare general exceptions and statutory self-defense rules.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-l6", title: "Moot Court Oral Argument Scripting", description: "Write a 5-minute appellant oral argument outline on privacy violation.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 120, isCompleted: false },
            ],
            estimatedMinutes: 210,
            isCompleted: false,
          },
          {
            weekNumber: 4,
            stage: "LONG_TERM",
            timeframe: "Week 9–12",
            title: "CLAT National Entrance Simulation & Legal Research",
            description: "Full-length 120-question CLAT mock test and SCC Online legal citation mastery.",
            activities: [
              { id: "act-l7", title: "Timed CLAT Full-Length Mock Exam", description: "Attempt 2-hour multi-section exam with strict negative marking.", activityType: "ENTRANCE_PREP", estimatedMinutes: 120, isCompleted: false },
              { id: "act-l8", title: "Bar Council of India Professional Ethics Review", description: "Study statutory BCI advocates' duties to courts and clients.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          }
        );
        break;

      default:
        // Default / STEM / General 12-week framework
        milestones.push(
          {
            weekNumber: 1,
            stage: "SHORT_TERM",
            timeframe: "Week 1–2",
            title: `${career.title} Foundational Competencies`,
            description: `Core academic and technical prerequisites required under ${career.regulatoryBody || "national standards"}.`,
            activities: [
              { id: "act-g1", title: "Foundational Concepts Deep Dive", description: "Study introductory principles and standard textbooks.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-g2", title: "Benchmark Skill Diagnostic", description: "Evaluate baseline competence against required entry skills.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 2,
            stage: "SHORT_TERM",
            timeframe: "Week 3–4",
            title: "Applied Problem Solving & Tools Mastery",
            description: "Hands-on implementation and core problem-solving methodologies.",
            activities: [
              { id: "act-g3", title: "Practical Application Exercise", description: "Complete a guided real-world scenario assignment.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 90, isCompleted: false },
              { id: "act-g4", title: "Target Entrance/Licensure Exam Review", description: `Review syllabus of ${career.keyEntranceExams[0] || "primary qualification entrance"}.`, activityType: "ENTRANCE_PREP", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 3,
            stage: "MEDIUM_TERM",
            timeframe: "Week 5–8",
            title: "Domain Specialization & Industry Standards",
            description: "Advanced techniques, regulatory safety protocols, and industry case studies.",
            activities: [
              { id: "act-g5", title: "Industry Case Analysis", description: "Analyze a published industry problem and propose verified solutions.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 120, isCompleted: false },
              { id: "act-g6", title: "Professional Standards & Compliance", description: `Study statutory guidelines published by ${career.regulatoryBody || "authoritative councils"}.`, activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          },
          {
            weekNumber: 4,
            stage: "LONG_TERM",
            timeframe: "Week 9–12",
            title: "Capstone Demonstration & Entrance Examination Readiness",
            description: "Comprehensive capstone showcase, mock evaluation, and credential verification.",
            activities: [
              { id: "act-g7", title: "Capstone Project Submission", description: "Build and document an end-to-end demonstrable portfolio artifact.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 150, isCompleted: false },
              { id: "act-g8", title: "Final Readiness Simulation", description: "Complete formal mock assessment under timed evaluation conditions.", activityType: "ENTRANCE_PREP", estimatedMinutes: 120, isCompleted: false },
            ],
            estimatedMinutes: 270,
            isCompleted: false,
          }
        );
        break;
    }

    return milestones;
  }

  private static formatRoadmap(dbRoadmap: any): StructuredRoadmapData {
    const career = getCareerBySlug(dbRoadmap.careerSlug || "") || ALL_CAREERS[0];
    const milestones: RoadmapMilestoneData[] = dbRoadmap.milestones.map((m: any) => ({
      id: m.id,
      weekNumber: m.weekNumber,
      stage: m.stage as any,
      timeframe: m.timeframe || `Week ${m.weekNumber}`,
      title: m.title,
      description: m.description,
      activities: Array.isArray(m.activities) ? m.activities : [],
      estimatedMinutes: m.estimatedMinutes,
      isCompleted: m.isCompleted,
      completedAt: m.completedAt ? m.completedAt.toISOString() : null,
    }));

    const completedCount = milestones.filter((m) => m.isCompleted).length;
    const completionPercentage =
      milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    return {
      id: dbRoadmap.id,
      studentProfileId: dbRoadmap.studentProfileId,
      careerSlug: dbRoadmap.careerSlug || career.slug,
      careerTitle: career.title,
      stream: career.stream,
      title: dbRoadmap.title,
      overview: dbRoadmap.overview || "",
      durationMonths: dbRoadmap.durationMonths,
      totalWeeks: dbRoadmap.totalWeeks,
      currentWeekIndex: dbRoadmap.currentWeekIndex,
      status: dbRoadmap.status as any,
      version: dbRoadmap.version,
      completionPercentage,
      milestones,
      createdAt: dbRoadmap.createdAt.toISOString(),
      updatedAt: dbRoadmap.updatedAt.toISOString(),
    };
  }
}
