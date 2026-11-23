// ==============================================================================
// KAABIL (काबिल) — Adaptive Career Roadmap Engine
// Generates and manages personalized, stream-specific career roadmaps
// Across all 13 educational streams with dynamic milestone progression
// ==============================================================================

import { prisma } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { getCareerBySlug, ALL_CAREERS, CAREER_PATHS_DATABASE } from "@/data/careersData";
import { getCuratedResourcesForCareer } from "@/data/learningResourcesData";
import { EducationalStream } from "@/types";

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

    let career = getCareerBySlug(careerSlug);
    if (!career) {
      career = CAREER_PATHS_DATABASE.find(
        (c) =>
          c.slug.includes(careerSlug) ||
          careerSlug.includes(c.slug) ||
          c.title.toLowerCase().includes(careerSlug.toLowerCase())
      );
    }
    if (!career && profile?.currentStream && profile.currentStream !== "UNDECIDED") {
      career = CAREER_PATHS_DATABASE.find((c) => c.stream === profile.currentStream);
    }
    if (!career && (careerSlug.includes("undecided") || careerSlug.includes("discovery") || profile?.currentStream === "UNDECIDED")) {
      career = {
        id: "career-exploration-discovery",
        slug: "career-exploration-discovery",
        title: "Universal Career Discovery & Exploration",
        stream: "UNDECIDED",
        streamTitle: "Undecided / Career Discovery",
        domainName: "Career Exploration",
        regulatoryBody: "NCERT / National Career Service (NCS)",
        skills: [{ name: "Self Assessment" }, { name: "Aptitude Mapping" }],
        keyEntranceExams: ["CUET-UG"],
        overview: "Exploratory roadmap across all 13 streams without bias.",
        minEducationStage: "CLASS_10",
      } as any;
    }
    if (!career) {
      career = ALL_CAREERS[0];
    }
    const stream = career.stream;
    const weeklyHours = profile?.learningPreference?.weeklyHoursAvailable || 10;
    const stage = profile?.educationStage || "CLASS_12";

    // Build stream-specific milestones
    const generatedMilestones = this.buildStreamSpecificMilestones(career, stream, stage, weeklyHours);

    try {
      // Archive any previous active roadmap for this student, strictly preserving milestone history
      await prisma.userRoadmap.updateMany({
        where: { studentProfileId, status: "ACTIVE" },
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
      // Offline persistent fallback in devStore: archive previous active roadmap, keeping history
      const prevActive = devStore.getRoadmap(studentProfileId);
      if (prevActive && prevActive.status === "ACTIVE") {
        prevActive.status = "ARCHIVED";
        devStore.saveRoadmap(prevActive);
      }

      const offlineRoadmap = {
        id: `roadmap-${studentProfileId}-${career.slug}`,
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

    // Query verified Learning Academy resources for this stream
    const targetSkills = (career.skills || []).map((s: any) =>
      typeof s === "string" ? s : s.name
    );
    const curated = getCuratedResourcesForCareer(stream as EducationalStream, targetSkills);
    const r1 = curated[0];
    const r2 = curated[1] || curated[0];

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
              { id: "act-8", title: r1?.title ? `Verified Resource: ${r1.title}` : "Error Log & Weak-Area Remediation", description: r1?.description || "Categorize every incorrect response by concept gap vs calculation slip.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false, resourceTitle: r1?.title, resourceUrl: r1?.url },
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
              { id: "act-c8", title: r1?.title ? `Verified Resource: ${r1.title}` : "ICAI CA Foundation Mock Examination", description: r1?.description || "Complete a full 100-mark Principles & Practice of Accounting test.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 180, isCompleted: false, resourceTitle: r1?.title, resourceUrl: r1?.url },
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
              { id: "act-l8", title: r1?.title ? `Verified Resource: ${r1.title}` : "Bar Council of India Professional Ethics Review", description: r1?.description || "Study statutory BCI advocates' duties to courts and clients.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false, resourceTitle: r1?.title, resourceUrl: r1?.url },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          }
        );
        break;

      case "AGRICULTURE":
        milestones.push(
          {
            weekNumber: 1,
            stage: "SHORT_TERM",
            timeframe: "Week 1–2",
            title: "Soil Science, Plant Nutrition & Agronomy Foundations",
            description: "Understand soil pH, NPK nutrient uptake, and sustainable crop cycles under ICAR standards.",
            activities: [
              { id: "act-ag1", title: "Soil Health Card Analysis", description: "Analyze laboratory soil report parameters and fertilizer dosages.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-ag2", title: "Crop Physiology Terminology", description: "Review plant transpiration, photosynthesis C3/C4 pathways, and seed germination.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 2,
            stage: "SHORT_TERM",
            timeframe: "Week 3–4",
            title: "Precision Farming & Water Management Systems",
            description: "Drip irrigation, sensor-based soil moisture telemetry, and integrated pest management (IPM).",
            activities: [
              { id: "act-ag3", title: "Design a Drip Irrigation Layout", description: "Calculate discharge rates and pipe diameters for a 2-hectare plot.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 90, isCompleted: false },
              { id: "act-ag4", title: "ICAR AIEEA Agriculture Problem Set", description: "Solve 25 ICAR entrance exam questions on plant genetics and horticulture.", activityType: "ENTRANCE_PREP", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 3,
            stage: "MEDIUM_TERM",
            timeframe: "Week 5–8",
            title: "Post-Harvest Processing & Agri-Supply Chain Logistics",
            description: "Cold-chain preservation, FSSAI grading standards, and e-NAM agricultural marketing.",
            activities: [
              { id: "act-ag5", title: "Post-Harvest Loss Audit", description: "Evaluate storage moisture levels to mitigate grain spoilage and mycotoxins.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 120, isCompleted: false },
              { id: "act-ag6", title: "National Agricultural Policy Review", description: "Examine MSP mechanisms and APMC market regulations in India.", activityType: "PREREQUISITE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          },
          {
            weekNumber: 4,
            stage: "LONG_TERM",
            timeframe: "Week 9–12",
            title: "ICAR Agricultural Research Capstone & Mock Exam",
            description: "Complete full-length ICAR AIEEA mock test and agronomy field study proposal.",
            activities: [
              { id: "act-ag7", title: "ICAR Full-Length Mock Examination", description: "Timed examination across plant science, chemistry, and farm engineering.", activityType: "ENTRANCE_PREP", estimatedMinutes: 120, isCompleted: false },
              { id: "act-ag8", title: r1?.title ? `Verified Resource: ${r1.title}` : "AgTech Innovation Case Review", description: r1?.description || "Examine drone-based pesticide delivery case studies in Indian agriculture.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false, resourceTitle: r1?.title, resourceUrl: r1?.url },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          }
        );
        break;

      case "ARTS_HUMANITIES":
        milestones.push(
          {
            weekNumber: 1,
            stage: "SHORT_TERM",
            timeframe: "Week 1–2",
            title: "Indian Constitutional Heritage & Social Structures",
            description: "Study democratic institutions, preamble values, and socio-economic history of modern India.",
            activities: [
              { id: "act-ah1", title: "Constitutional Assembly Debates Analysis", description: "Read key debates on federalism, reservations, and fundamental duties.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-ah2", title: "Social Stratification & Public Institutions", description: "Synthesize sociological perspectives on caste, agrarian structure, and urban development.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 2,
            stage: "SHORT_TERM",
            timeframe: "Week 3–4",
            title: "Public Policy Analysis & Governance Frameworks",
            description: "Deconstruct policy life cycles, budgetary allocations, and welfare delivery mechanisms.",
            activities: [
              { id: "act-ah3", title: "Policy Evaluation Brief", description: "Draft a 2-page brief evaluating the implementation of a national welfare program.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 90, isCompleted: false },
              { id: "act-ah4", title: "UPSC CSE Prelims General Studies Set", description: "Solve 30 past-year GS Paper I questions on Indian Polity and History.", activityType: "ENTRANCE_PREP", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 3,
            stage: "MEDIUM_TERM",
            timeframe: "Week 5–8",
            title: "Social Research Methodologies & Fieldwork Ethics",
            description: "Quantitative surveys, qualitative interviews, ethnography, and ethics in public research.",
            activities: [
              { id: "act-ah5", title: "Field Research Questionnaire Design", description: "Formulate a 15-question survey assessing local civic amenity satisfaction.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 120, isCompleted: false },
              { id: "act-ah6", title: "NITI Aayog Policy Case Study", description: "Analyze Aspirational Districts Programme data and governance indicators.", activityType: "PREREQUISITE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          },
          {
            weekNumber: 4,
            stage: "LONG_TERM",
            timeframe: "Week 9–12",
            title: "Civil Services & Research Capstone Examination",
            description: "Timed Mains essay writing and multi-disciplinary critical argumentation simulation.",
            activities: [
              { id: "act-ah7", title: "UPSC Mains 250-Mark Essay Writing Simulation", description: "Draft a comprehensive structured essay on 'Ethics, Governance, and Technology'.", activityType: "ENTRANCE_PREP", estimatedMinutes: 180, isCompleted: false },
              { id: "act-ah8", title: r1?.title ? `Verified Resource: ${r1.title}` : "e-PG Pathshala Research Frameworks", description: r1?.description || "Access UGC e-PG Pathshala modules in sociological research methods.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false, resourceTitle: r1?.title, resourceUrl: r1?.url },
            ],
            estimatedMinutes: 240,
            isCompleted: false,
          }
        );
        break;

      case "CREATIVE_DESIGN":
        milestones.push(
          {
            weekNumber: 1,
            stage: "SHORT_TERM",
            timeframe: "Week 1–2",
            title: "Design Principles, Form & Visual Grammar",
            description: "Gestalt psychology, color theory, visual hierarchy, and foundational sketching.",
            activities: [
              { id: "act-cd1", title: "Color Contrast & Accessibility Analysis", description: "Audit digital palettes for WCAG AA compliance and emotional resonance.", activityType: "PREREQUISITE", estimatedMinutes: 60, isCompleted: false },
              { id: "act-cd2", title: "Visual Composition & Typography Layout", description: "Create 3 typographic grid hierarchies in Figma for web and print.", activityType: "SKILL_PRACTICE", estimatedMinutes: 90, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 2,
            stage: "SHORT_TERM",
            timeframe: "Week 3–4",
            title: "User Experience Research & Wireframing",
            description: "User empathy mapping, information architecture, and low-fidelity prototypes.",
            activities: [
              { id: "act-cd3", title: "User Persona & Journey Mapping", description: "Synthesize interviews into an actionable archetype for an Indian logistics app.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 90, isCompleted: false },
              { id: "act-cd4", title: "UCEED / NIFT Creative Ability Test Prep", description: "Complete 5 spatial thinking and visual problem-solving questions.", activityType: "ENTRANCE_PREP", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 3,
            stage: "MEDIUM_TERM",
            timeframe: "Week 5–8",
            title: "Interactive Prototyping & Design Systems",
            description: "Component architecture, design tokens, micro-interactions, and usability testing.",
            activities: [
              { id: "act-cd5", title: "Build an Accessible Design System", description: "Construct responsive components with variant properties in Figma.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 120, isCompleted: false },
              { id: "act-cd6", title: "Moderated Usability Testing Session", description: "Run usability tests with 3 users, logging completion rates and friction points.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          },
          {
            weekNumber: 4,
            stage: "LONG_TERM",
            timeframe: "Week 9–12",
            title: "Portfolio Case Study & Professional Review",
            description: "End-to-end design showcase detailing problem statement, iterations, and metrics.",
            activities: [
              { id: "act-cd7", title: "Publish Comprehensive Case Study", description: "Document design decisions, failed iterations, and validated user metrics.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 150, isCompleted: false },
              { id: "act-cd8", title: r1?.title ? `Verified Resource: ${r1.title}` : "Design Council Standards Review", description: r1?.description || "Examine India Design Council design benchmark guidelines.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false, resourceTitle: r1?.title, resourceUrl: r1?.url },
            ],
            estimatedMinutes: 210,
            isCompleted: false,
          }
        );
        break;

      case "VOCATIONAL_TRADES":
        milestones.push(
          {
            weekNumber: 1,
            stage: "SHORT_TERM",
            timeframe: "Week 1–2",
            title: "Workshop Safety, PPE & Blueprint Reading",
            description: "Industrial safety protocols, OSHA/DGT standards, technical drafting, and schematics.",
            activities: [
              { id: "act-vt1", title: "Electrical & Mechanical Schematic Deconstruction", description: "Read single-line electrical diagrams and mechanical tolerance symbols.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-vt2", title: "Industrial PPE & Hazardous Material Protocols", description: "Review DGT/MSDE workshop compliance guidelines and emergency lockouts.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 2,
            stage: "SHORT_TERM",
            timeframe: "Week 3–4",
            title: "Tools, Calibration & Measurement Precision",
            description: "Vernier calipers, micrometers, multimeters, and precision diagnostic instrumentation.",
            activities: [
              { id: "act-vt3", title: "Precision Measurement Calibration Drill", description: "Measure 10 industrial component samples within 0.02mm tolerance limits.", activityType: "SKILL_PRACTICE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-vt4", title: "All India Trade Test (AITT) Question Bank", description: "Practice 25 DGT apprentice exam questions in trade theory.", activityType: "ENTRANCE_PREP", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 3,
            stage: "MEDIUM_TERM",
            timeframe: "Week 5–8",
            title: "Automation, PLC & Electrical Wiring Systems",
            description: "Ladder logic, sensor interfaces, circuit breakers, and industrial motor wiring.",
            activities: [
              { id: "act-vt5", title: "PLC Ladder Logic Simulation", description: "Program a start-stop interlock sequence for an industrial conveyor belt.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 120, isCompleted: false },
              { id: "act-vt6", title: "Fault Isolation & Diagnostic Flowchart", description: "Build a structured troubleshooting flowchart for industrial motor failure.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          },
          {
            weekNumber: 4,
            stage: "LONG_TERM",
            timeframe: "Week 9–12",
            title: "AITT Trade Certification Mock & Demonstration",
            description: "Complete formal trade theory mock exam and hands-on assembly evaluation.",
            activities: [
              { id: "act-vt7", title: "AITT Full Trade Theory Simulation", description: "Timed 100-mark multiple-choice trade assessment under DGT patterns.", activityType: "ENTRANCE_PREP", estimatedMinutes: 120, isCompleted: false },
              { id: "act-vt8", title: r1?.title ? `Verified Resource: ${r1.title}` : "Bharat Skills Digital Learning Portal", description: r1?.description || "Access official DGT / Bharat Skills trade modules and video tutorials.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false, resourceTitle: r1?.title, resourceUrl: r1?.url },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          }
        );
        break;

      case "SPORTS_PHYSICAL_ED":
        milestones.push(
          {
            weekNumber: 1,
            stage: "SHORT_TERM",
            timeframe: "Week 1–2",
            title: "Anatomy, Sports Biomechanics & Kinesiology",
            description: "Musculoskeletal mechanics, lever systems in human movement, and athletic posture.",
            activities: [
              { id: "act-sp1", title: "Joint Articulation & Muscular Levers Analysis", description: "Identify prime movers, antagonists, and joint angles during a sprint cycle.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-sp2", title: "Kinesiology Terminology & Planes of Movement", description: "Classify sagittal, frontal, and transverse athletic movement patterns.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 2,
            stage: "SHORT_TERM",
            timeframe: "Week 3–4",
            title: "Exercise Physiology, Aerobic Capacity & Nutrition",
            description: "Energy systems (ATP-PC, Glycolytic, Oxidative), VO2 max, and macro-nutrient timing.",
            activities: [
              { id: "act-sp3", title: "Cardiovascular Training Zone Calculator", description: "Calculate target heart-rate training zones for sprint vs endurance athletes.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 90, isCompleted: false },
              { id: "act-sp4", title: "LNIPE / SAI B.P.Ed Entrance Exam Review", description: "Review physical education theory and general sports aptitude questions.", activityType: "ENTRANCE_PREP", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 3,
            stage: "MEDIUM_TERM",
            timeframe: "Week 5–8",
            title: "Sports Injury Prevention, First Aid & Triage",
            description: "PRICE protocol, acute sprain/strain management, concussion assessment, and taping.",
            activities: [
              { id: "act-sp5", title: "Acute Athletic Triage Protocol Simulation", description: "Document emergency on-field management for acute ankle inversion sprains.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 120, isCompleted: false },
              { id: "act-sp6", title: "Sports Authority of India (SAI) Coaching Guidelines", description: "Study national coaching curriculum standards published by SAI / NIS Patiala.", activityType: "PREREQUISITE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          },
          {
            weekNumber: 4,
            stage: "LONG_TERM",
            timeframe: "Week 9–12",
            title: "Periodization Planning & Coaching Simulation",
            description: "Macro-cycle, meso-cycle, and micro-cycle athletic training program design.",
            activities: [
              { id: "act-sp7", title: "Annual Athletic Periodization Program", description: "Design a 52-week training periodization calendar for a track-and-field athlete.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 150, isCompleted: false },
              { id: "act-sp8", title: r1?.title ? `Verified Resource: ${r1.title}` : "LNIPE Gwalior Sports Education Portal", description: r1?.description || "Access LNIPE Swayam digital modules on athletic biomechanics.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false, resourceTitle: r1?.title, resourceUrl: r1?.url },
            ],
            estimatedMinutes: 210,
            isCompleted: false,
          }
        );
        break;

      case "HOSPITALITY_TOURISM":
        milestones.push(
          {
            weekNumber: 1,
            stage: "SHORT_TERM",
            timeframe: "Week 1–2",
            title: "Hospitality Industry Overview & Guest Relations",
            description: "Front office operations, guest journey touchpoints, and hospitality ethics.",
            activities: [
              { id: "act-ht1", title: "Hotel Organizational Structure & Standard Operations", description: "Map inter-departmental communications between Front Office, Housekeeping, and F&B.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-ht2", title: "Service Etiquette & Communication Protocols", description: "Practice conflict resolution scripts and VIP guest handling standards.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 2,
            stage: "SHORT_TERM",
            timeframe: "Week 3–4",
            title: "Food Safety Standards (FSSAI) & Culinary Basics",
            description: "HACCP principles, personal hygiene in commercial kitchens, and menu planning.",
            activities: [
              { id: "act-ht3", title: "Commercial Kitchen HACCP Audit Plan", description: "Build a critical control point checklist for raw meat storage and temperature logs.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 90, isCompleted: false },
              { id: "act-ht4", title: "NCHMCT JEE Entrance Examination Prep", description: "Solve 25 hospitality aptitude and English reasoning entrance questions.", activityType: "ENTRANCE_PREP", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 3,
            stage: "MEDIUM_TERM",
            timeframe: "Week 5–8",
            title: "Revenue Management, RevPAR & PMS Systems",
            description: "Property Management Systems (PMS), dynamic pricing, and occupancy calculations.",
            activities: [
              { id: "act-ht5", title: "RevPAR & Yield Management Financial Model", description: "Calculate ADR, RevPAR, and GOPPAR across seasonal pricing tiers in Excel.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 120, isCompleted: false },
              { id: "act-ht6", title: "MICE Event Logistics Framework", description: "Design an operations schedule for a 200-delegate corporate conference.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          },
          {
            weekNumber: 4,
            stage: "LONG_TERM",
            timeframe: "Week 9–12",
            title: "NCHMCT Full-Length Mock & Operations Showcase",
            description: "National Council hotel management mock test and guest service simulation.",
            activities: [
              { id: "act-ht7", title: "NCHMCT JEE Full-Length Mock Exam", description: "Attempt a timed 200-question NCHMCT entrance test under exam conditions.", activityType: "ENTRANCE_PREP", estimatedMinutes: 180, isCompleted: false },
              { id: "act-ht8", title: r1?.title ? `Verified Resource: ${r1.title}` : "e-PG Pathshala Tourism & Hospitality", description: r1?.description || "Access official NCHMCT / UGC Swayam courseware on hospitality operations.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false, resourceTitle: r1?.title, resourceUrl: r1?.url },
            ],
            estimatedMinutes: 240,
            isCompleted: false,
          }
        );
        break;

      case "MANAGEMENT":
        milestones.push(
          {
            weekNumber: 1,
            stage: "SHORT_TERM",
            timeframe: "Week 1–2",
            title: "Business Organizations, Economics & Market Structures",
            description: "Microeconomic supply/demand, corporate structures, and stakeholder value creation.",
            activities: [
              { id: "act-mg1", title: "Market Structure Analysis (Monopoly vs Perfect Competition)", description: "Analyze Indian telecom and FMCG sectors using Porter's Five Forces.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-mg2", title: "Business Terminology & KPI Glossary", description: "Define EBITDA, CAC, LTV, ROIC, and Working Capital cycle.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 2,
            stage: "SHORT_TERM",
            timeframe: "Week 3–4",
            title: "Marketing Strategy, Brand Positioning & Sales Funnels",
            description: "4Ps of marketing, customer segmentation, digital funnels, and CAC optimization.",
            activities: [
              { id: "act-mg3", title: "Go-to-Market (GTM) Strategy Deck", description: "Design a 5-slide GTM launch strategy for a direct-to-consumer healthcare product.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 90, isCompleted: false },
              { id: "act-mg4", title: "CAT / IPMAT Quantitative Reasoning Prep", description: "Solve 20 data interpretation and commercial arithmetic problems.", activityType: "ENTRANCE_PREP", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 3,
            stage: "MEDIUM_TERM",
            timeframe: "Week 5–8",
            title: "Operations Management & Financial Accounting",
            description: "Supply chain bottleneck identification, inventory turnover, and P&L statements.",
            activities: [
              { id: "act-mg5", title: "Supply Chain Bottleneck Simulation", description: "Model lead times, safety stocks, and reorder points for an e-commerce warehouse.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 120, isCompleted: false },
              { id: "act-mg6", title: "Harvard / IIM Case Method Study", description: "Analyze a turnaround business case study and write strategic recommendations.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          },
          {
            weekNumber: 4,
            stage: "LONG_TERM",
            timeframe: "Week 9–12",
            title: "Comprehensive Business Plan & Mock Evaluation",
            description: "Pitch deck presentation, financial projections, and national management entrance mock.",
            activities: [
              { id: "act-mg7", title: "Final Venture Business Plan Presentation", description: "Compile a 10-slide investor deck with 3-year financial projections.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 150, isCompleted: false },
              { id: "act-mg8", title: r1?.title ? `Verified Resource: ${r1.title}` : "IIM / Swayam Management Foundations", description: r1?.description || "Access certified NPTEL management principles courseware.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false, resourceTitle: r1?.title, resourceUrl: r1?.url },
            ],
            estimatedMinutes: 210,
            isCompleted: false,
          }
        );
        break;

      case "INTERDISCIPLINARY":
        milestones.push(
          {
            weekNumber: 1,
            stage: "SHORT_TERM",
            timeframe: "Week 1–2",
            title: "Cross-Disciplinary Methodologies & Foundations",
            description: "Integrating computing, biological systems, spatial data, and environmental science.",
            activities: [
              { id: "act-id1", title: "Cross-Domain Literature Review", description: "Synthesize 2 papers at the intersection of computational data science and life sciences.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-id2", title: "Data Visualization & Spatial Modeling Tools", description: "Set up open-source analytical tools (Python BioPython / QGIS / R).", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 2,
            stage: "SHORT_TERM",
            timeframe: "Week 3–4",
            title: "Applied Computational Systems & Data Extraction",
            description: "Working with genomic FASTA sequences, satellite imagery, or sensory environmental telemetry.",
            activities: [
              { id: "act-id3", title: "Environmental or Biological Dataset Analysis", description: "Process a public dataset and generate statistical distributions of key indicators.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 100, isCompleted: false },
              { id: "act-id4", title: "National Gateway Entrance / Bridge Preparation", description: "Review CUET-PG or GATE interdisciplinary examination syllabus.", activityType: "ENTRANCE_PREP", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 160,
            isCompleted: false,
          },
          {
            weekNumber: 3,
            stage: "MEDIUM_TERM",
            timeframe: "Week 5–8",
            title: "Multi-Disciplinary Modeling & Predictive Analytics",
            description: "Ecological niche modeling, molecular docking simulations, or geospatial remote sensing.",
            activities: [
              { id: "act-id5", title: "Interdisciplinary Predictive Model", description: "Train and evaluate an open-source classifier on multi-stream sensor data.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 120, isCompleted: false },
              { id: "act-id6", title: "Regulatory & Bio-Ethics Compliance Review", description: "Study statutory Indian data governance and environmental impact regulations.", activityType: "PREREQUISITE", estimatedMinutes: 60, isCompleted: false },
            ],
            estimatedMinutes: 180,
            isCompleted: false,
          },
          {
            weekNumber: 4,
            stage: "LONG_TERM",
            timeframe: "Week 9–12",
            title: "Interdisciplinary Research Paper / Capstone Prototype",
            description: "Complete demonstrable capstone bridging traditional stream boundaries.",
            activities: [
              { id: "act-id7", title: "Capstone Research Demonstration", description: "Publish an end-to-end repository with documented cross-stream methodology.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 150, isCompleted: false },
              { id: "act-id8", title: r1?.title ? `Verified Resource: ${r1.title}` : "ISRO / IIT NPTEL Interdisciplinary Courseware", description: r1?.description || "Access NPTEL bioinformatics or IIRS-ISRO remote sensing tutorials.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false, resourceTitle: r1?.title, resourceUrl: r1?.url },
            ],
            estimatedMinutes: 210,
            isCompleted: false,
          }
        );
        break;

      case "UNDECIDED":
        milestones.push(
          {
            weekNumber: 1,
            stage: "SHORT_TERM",
            timeframe: "Week 1–2",
            title: "Universal Stream Discovery & Aptitude Self-Assessment",
            description: "Objective evaluation of natural curiosity across Sciences, Commerce, Humanities, and Vocational pathways.",
            activities: [
              { id: "act-un1", title: r1?.title ? `Verified Resource: ${r1.title}` : "NCERT Official Career Cards Exploration", description: r1?.description || "Review verified career profiles across all 13 streams without pressure or bias.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false, resourceTitle: r1?.title, resourceUrl: r1?.url },
              { id: "act-un2", title: "National Career Service (NCS) Aptitude Mapping", description: "Map your cognitive strengths to high-growth Indian career sectors.", activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false, resourceTitle: r2?.title, resourceUrl: r2?.url },
            ],
            estimatedMinutes: 120,
            isCompleted: false,
          },
          {
            weekNumber: 2,
            stage: "SHORT_TERM",
            timeframe: "Week 3–4",
            title: "Day-in-the-Life Professional Shadowing & Debrief",
            description: "Contrast actual working routines in healthcare, technology, corporate finance, and creative arts.",
            activities: [
              { id: "act-un3", title: "Cross-Stream Professional Routine Comparison", description: "Compare 3 career day-in-the-life profiles to evaluate work-life and stress factors.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 90, isCompleted: false },
              { id: "act-un4", title: "Aptitude vs Passion Matrix Reflection", description: "Write a 300-word reflection balancing subject grades with intrinsic interests.", activityType: "SKILL_PRACTICE", estimatedMinutes: 45, isCompleted: false },
            ],
            estimatedMinutes: 135,
            isCompleted: false,
          },
          {
            weekNumber: 3,
            stage: "MEDIUM_TERM",
            timeframe: "Week 5–8",
            title: "Entrance Exam & Degree Qualification Gateway Mapping",
            description: "Understand educational prerequisites, entrance exams (CUET, NEET, JEE, CLAT, NIFT), and college types.",
            activities: [
              { id: "act-un5", title: "Educational Gateway Comparison Matrix", description: "Map out 3 degree pathways with minimum eligibility percentages and entrance dates.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-un6", title: r2?.title ? `Verified Resource: ${r2.title}` : "Critical Thinking & Decision Making Workshop", description: r2?.description || "Study structured frameworks for long-term career and life choice evaluation.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 60, isCompleted: false, resourceTitle: r2?.title, resourceUrl: r2?.url },
            ],
            estimatedMinutes: 150,
            isCompleted: false,
          },
          {
            weekNumber: 4,
            stage: "LONG_TERM",
            timeframe: "Week 9–12",
            title: "Personalized Stream Decision Roadmap",
            description: "Synthesize discoveries into a confirmed stream or targeted 2-career comparison roadmap.",
            activities: [
              { id: "act-un7", title: "Personal Stream Selection Roadmap Synthesis", description: "Confirm your primary stream choice and select your initial benchmark career path.", activityType: "PRACTICAL_PROJECT", estimatedMinutes: 90, isCompleted: false },
              { id: "act-un8", title: "AI Career Mentor Strategic Review Session", description: "Consult KAABIL AI Mentor to audit your chosen stream transition roadmap.", activityType: "SKILL_PRACTICE", estimatedMinutes: 45, isCompleted: false },
            ],
            estimatedMinutes: 135,
            isCompleted: false,
          }
        );
        break;

      case "NON_MEDICAL_PCM":
      default:
        // Default / STEM / Engineering 12-week framework
        milestones.push(
          {
            weekNumber: 1,
            stage: "SHORT_TERM",
            timeframe: "Week 1–2",
            title: `${career.title} Foundational Principles & Core Prereqs`,
            description: `Core academic and technical prerequisites required under ${career.regulatoryBody || "national AICTE/UGC standards"}.`,
            activities: [
              { id: "act-g1", title: "Core Theoretical Principles Deep Dive", description: "Study introductory principles, mathematics, and textbook foundations.", activityType: "PREREQUISITE", estimatedMinutes: 90, isCompleted: false },
              { id: "act-g2", title: "Benchmark Skill Diagnostic", description: `Evaluate baseline competence against ${targetSkills.slice(0, 2).join(" & ") || "required entry skills"}.`, activityType: "SKILL_PRACTICE", estimatedMinutes: 60, isCompleted: false },
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
              { id: "act-g4", title: "Target Entrance/Licensure Exam Review", description: `Review syllabus of ${career.keyEntranceExams?.[0] || "primary qualification entrance"}.`, activityType: "ENTRANCE_PREP", estimatedMinutes: 60, isCompleted: false },
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
              { id: "act-g6", title: "Professional Standards & Compliance", description: `Study statutory guidelines published by ${career.regulatoryBody || "authoritative councils"}.`, activityType: "PREREQUISITE", estimatedMinutes: 60, isCompleted: false },
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
              { id: "act-g8", title: r1?.title ? `Verified Resource: ${r1.title}` : "Final Readiness Simulation", description: r1?.description || "Complete formal mock assessment under timed evaluation conditions.", activityType: "VERIFIED_RESOURCE", estimatedMinutes: 120, isCompleted: false, resourceTitle: r1?.title, resourceUrl: r1?.url },
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
    let career = getCareerBySlug(dbRoadmap.careerSlug || "");
    if (!career) {
      career = CAREER_PATHS_DATABASE.find(
        (c) =>
          c.slug.includes(dbRoadmap.careerSlug || "") ||
          (dbRoadmap.careerSlug || "").includes(c.slug)
      );
    }
    if (!career && (dbRoadmap.careerSlug?.includes("undecided") || dbRoadmap.careerSlug?.includes("discovery"))) {
      career = {
        slug: "career-exploration-discovery",
        title: "Universal Career Discovery & Exploration",
        stream: "UNDECIDED",
      } as any;
    }
    if (!career) {
      career = ALL_CAREERS[0];
    }
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
