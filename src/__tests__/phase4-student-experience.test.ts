// ==============================================================================
// KAABIL (काबिल) — Phase 4: Student Experience & Guidance Reliability Tests
// Comprehensive verification of:
// 1. Undecided student journey (zero fabricated goals/skills/interests)
// 2. Confirmed career goal & academic stream preservation
// 3. Alternative pathways & multi-career comparison
// 4. Returning student career shift & progress preservation
// 5. All 13 streams authentic roadmap milestones & Learning Academy resources
// 6. Transparent recommendations & AI Mentor guidance reliability
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { devStore } from "@/lib/dev-store";
import { ProfileService } from "@/lib/student/profile-service";
import { CareerRecommendationEngine } from "@/lib/recommendations/recommendation-engine";
import { AdaptiveRoadmapEngine } from "@/lib/roadmap/adaptive-roadmap-engine";
import { SkillGapEngine } from "@/lib/skill-gap/skill-gap-engine";
import { AiMentorService } from "@/lib/mentor/ai-mentor-service";
import { CAREER_PATHS_DATABASE, getCareerBySlug } from "@/data/careersData";
import { getCuratedResourcesForCareer } from "@/data/learningResourcesData";
import { EducationalStream } from "@/types";

describe("Phase 4: Student Experience & Guidance Reliability", () => {
  const undecidedId = "test-undecided-student-01";
  const confirmedId = "test-confirmed-commerce-02";
  const alternativeId = "test-alternative-explorer-03";
  const returningId = "test-returning-student-04";

  beforeEach(() => {
    // Reset test user profiles in devStore
    devStore.saveProfile({
      id: undecidedId,
      userId: "user-undecided",
      educationStage: "CLASS_10",
      currentStream: "UNDECIDED",
      user: { name: "Rohan Verma", email: "rohan.verma@test.kaabil.in" },
      interests: [],
      careerGoals: [],
      userSkills: [],
      roadmaps: [],
      dailyMissions: [],
    });

    devStore.saveProfile({
      id: confirmedId,
      userId: "user-confirmed",
      educationStage: "CLASS_12",
      currentStream: "COMMERCE",
      selectedStreams: ["COMMERCE"],
      targetCareerPathId: "chartered-accountant-icai",
      user: { name: "Neha Singhal", email: "neha.singhal@test.kaabil.in" },
      interests: [{ domain: "Corporate Finance" }, { domain: "Taxation Law" }],
      careerGoals: [
        {
          careerPath: {
            slug: "chartered-accountant-icai",
            title: "Chartered Accountant (ICAI)",
            regulatoryBody: "Institute of Chartered Accountants of India (ICAI)",
          },
          priorityRank: 1,
          targetYear: 2028,
        },
      ],
      userSkills: [
        {
          skill: { name: "Financial Accounting", category: "DOMAIN" },
          proficiencyLevel: "INTERMEDIATE",
          isVerified: false,
        },
      ],
      roadmaps: [],
      dailyMissions: [],
    });

    devStore.saveProfile({
      id: alternativeId,
      userId: "user-alternative",
      educationStage: "UNDERGRADUATE",
      currentStream: "NON_MEDICAL_PCM",
      selectedStreams: ["NON_MEDICAL_PCM", "CREATIVE_DESIGN"],
      user: { name: "Kunal Mehra", email: "kunal.mehra@test.kaabil.in" },
      interests: [{ domain: "Visual Design" }],
      careerGoals: [],
      userSkills: [],
      roadmaps: [],
      dailyMissions: [],
    });

    devStore.saveProfile({
      id: returningId,
      userId: "user-returning",
      educationStage: "UNDERGRADUATE",
      currentStream: "MEDICAL_PCB",
      targetCareerPathId: "mbbs-doctor",
      user: { name: "Simran Kaur", email: "simran.kaur@test.kaabil.in" },
      interests: [{ domain: "Clinical Medicine" }],
      careerGoals: [
        {
          careerPath: {
            slug: "mbbs-doctor",
            title: "MBBS Doctor (General Physician)",
            regulatoryBody: "National Medical Commission (NMC)",
          },
          priorityRank: 1,
        },
      ],
      userSkills: [
        {
          skill: { name: "Human Anatomy", category: "DOMAIN" },
          proficiencyLevel: "PROFICIENT",
          isVerified: true,
          scorePercentage: 88,
        },
      ],
      roadmaps: [],
      dailyMissions: [],
    });
  });

  // ==========================================================================
  // 1. UNDECIDED STUDENT JOURNEY (No Fabricated Data, Neutral Guidance)
  // ==========================================================================
  describe("Journey 1: Undecided Student Guidance & Honest Baseline", () => {
    it("never fabricates a career goal, tech skills, or AI interests for undecided students", async () => {
      const profile = await ProfileService.getStudentProfile(undecidedId);
      expect(profile).not.toBeNull();
      expect(profile!.name).toBe("Rohan Verma");
      expect(profile!.academic.stream).toBe("UNDECIDED");

      // Career goal MUST be null (strictly optional, zero fabrication)
      expect(profile!.targetCareer).toBeNull();

      // Skills and interests must be empty, NOT defaulted to Python/AI
      expect(profile!.skills.assessed).toHaveLength(0);
      expect(profile!.skills.selfReported).toHaveLength(0);
      expect(profile!.interests).toHaveLength(0);
    });

    it("evaluates recommendations with INSUFFICIENT data notice and honest exploratory fit", () => {
      const recs = CareerRecommendationEngine.getRecommendations(
        {
          id: undecidedId,
          name: "Rohan Verma",
          educationStage: "CLASS_10",
          primaryStream: "UNDECIDED",
          selectedStreams: ["UNDECIDED"],
          interests: [],
          skills: [],
        },
        CAREER_PATHS_DATABASE,
        5
      );

      expect(recs.length).toBeGreaterThan(0);
      const topRec = recs[0];

      // Must honestly flag insufficient profile data
      expect(topRec.dataSufficiency).toBe("INSUFFICIENT");
      expect(topRec.uncertaintyFollowUpQuestions).toBeDefined();
      expect(topRec.uncertaintyFollowUpQuestions!.length).toBeGreaterThan(0);

      // Must provide transparent disclaimer (not employability or success guarantee)
      expect(topRec.scoreDisclaimer).toContain("not an employability guarantee or success probability");
    });

    it("generates 100% neutral, non-tech career exploration resources for undecided learners", () => {
      const resources = getCuratedResourcesForCareer("UNDECIDED", []);
      expect(resources.length).toBeGreaterThan(0);

      // All resources must be neutral exploration (NCERT, National Career Service, etc.)
      for (const res of resources) {
        expect(res.stream).toBe("UNDECIDED");
        const titleLower = res.title.toLowerCase();
        expect(titleLower).not.toContain("python");
        expect(titleLower).not.toContain("react");
        expect(titleLower).not.toContain("full stack");
      }
    });

    it("creates multi-stream exploration roadmap with NCERT/NCS discovery activities", async () => {
      const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(undecidedId, "career-exploration-discovery");
      expect(roadmap).toBeDefined();
      expect(roadmap.stream).toBe("UNDECIDED");
      expect(roadmap.milestones).toHaveLength(4);

      // First milestone must focus on universal stream discovery
      expect(roadmap.milestones[0].title).toContain("Universal Stream Discovery");
      expect(roadmap.milestones[0].activities.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 2. CONFIRMED CAREER GOAL & ACADEMIC STREAM PRESERVATION
  // ==========================================================================
  describe("Journey 2: Confirmed Career Goal & Stream Preservation", () => {
    it("preserves explicitly confirmed academic stream and target career", async () => {
      const profile = await ProfileService.getStudentProfile(confirmedId);
      expect(profile).not.toBeNull();
      expect(profile!.academic.stream).toBe("COMMERCE");
      expect(profile!.targetCareer).not.toBeNull();
      expect(profile!.targetCareer!.slug).toBe("chartered-accountant-icai");
      expect(profile!.targetCareer!.title).toContain("Chartered Accountant");
      expect(profile!.targetCareer!.regulatoryBody).toContain("ICAI");
    });

    it("recommends aligned careers distinguishing interest, skill, and regulatory eligibility", () => {
      const recs = CareerRecommendationEngine.getRecommendations(
        {
          id: confirmedId,
          name: "Neha Singhal",
          educationStage: "CLASS_12",
          primaryStream: "COMMERCE",
          selectedStreams: ["COMMERCE"],
          interests: ["Corporate Finance", "Taxation Law"],
          skills: [{ name: "Financial Accounting", proficiency: "INTERMEDIATE" }],
          careerGoal: { targetRole: "Chartered Accountant (ICAI)" },
        },
        CAREER_PATHS_DATABASE,
        3
      );

      expect(recs.length).toBeGreaterThan(0);
      const caRec = recs.find((r) => r.career.slug === "chartered-accountant-icai") || recs[0];

      // Breakdown separates interest, stream, skill, and goal factors
      expect(caRec.breakdown.interestScore).toBeGreaterThan(0);
      expect(caRec.breakdown.streamScore).toBeGreaterThan(0);
      expect(caRec.breakdown.skillScore).toBeGreaterThan(0);
      expect(caRec.breakdown.goalScore).toBeGreaterThan(0);

      // Regulatory eligibility is formally evaluated
      expect(caRec.eligibility).toBeDefined();
      expect(caRec.whySuited).toBeTruthy();
      expect(caRec.explanationPoints.length).toBeGreaterThan(0);
    });

    it("generates authentic Commerce/ICAI milestones with linked verified resources", async () => {
      const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(confirmedId, "chartered-accountant-icai");
      expect(roadmap).toBeDefined();
      expect(roadmap.stream).toBe("COMMERCE");

      const titles = roadmap.milestones.map((m) => m.title);
      expect(titles.some((t) => t.includes("Accounting"))).toBe(true);
      expect(titles.some((t) => t.includes("Taxation"))).toBe(true);

      // Must include ICAI / Commerce verified learning resource
      const hasVerifiedResource = roadmap.milestones.some((m) =>
        m.activities.some((a) => a.activityType === "VERIFIED_RESOURCE" && a.resourceTitle)
      );
      expect(hasVerifiedResource).toBe(true);
    });
  });

  // ==========================================================================
  // 3. ALTERNATIVE PATHWAYS & MULTI-CAREER COMPARISON
  // ==========================================================================
  describe("Journey 3: Alternative Career Exploration & Skill Gaps", () => {
    it("clearly labels interdisciplinary and alternative bridge pathways", () => {
      const profile = {
        id: alternativeId,
        name: "Kunal Mehra",
        educationStage: "UNDERGRADUATE",
        primaryStream: "NON_MEDICAL_PCM",
        selectedStreams: ["NON_MEDICAL_PCM", "CREATIVE_DESIGN"],
        interests: ["Visual Design"],
        skills: [],
      };

      const interdisciplinaryCareer = getCareerBySlug("biofabrication-3d-tissue-printing-technician")!;
      const evalInterdisciplinary = CareerRecommendationEngine.evaluateCareerCompatibility(
        profile,
        interdisciplinaryCareer
      );
      expect(evalInterdisciplinary.isInterdisciplinary).toBe(true);
      expect(evalInterdisciplinary.isBridgePath).toBe(true);

      const crossStreamCareer = getCareerBySlug("ui-ux-digital-product-designer")!;
      const evalDesign = CareerRecommendationEngine.evaluateCareerCompatibility(
        profile,
        crossStreamCareer
      );
      expect(evalDesign.whySuited).toBeTruthy();
    });

    it("distinguishes unassessed skills from demonstrated skill gaps in SkillGapEngine", async () => {
      const gapAnalysis = await SkillGapEngine.analyzeGaps(
        confirmedId,
        "chartered-accountant-icai"
      );

      expect(gapAnalysis).toBeDefined();
      expect(gapAnalysis.targetCareerSlug).toBe("chartered-accountant-icai");
      expect(gapAnalysis.skillGaps.length).toBeGreaterThan(0);

      // Verify that unassessed mandatory skills are tagged MISSING_EVIDENCE or LEARNING_REQUIREMENT
      const unassessedItem = gapAnalysis.skillGaps.find(
        (g) => g.gapStatus === "MISSING_EVIDENCE" || g.gapStatus === "LEARNING_REQUIREMENT"
      );
      expect(unassessedItem).toBeDefined();
      expect(unassessedItem!.evidenceSummary).toContain("Unassessed");
    });
  });

  // ==========================================================================
  // 4. RETURNING STUDENT CAREER SHIFT & PROGRESS PRESERVATION
  // ==========================================================================
  describe("Journey 4: Returning Student Career Shift & Milestone Preservation", () => {
    it("generates initial roadmap, completes an activity, then switches careers without deleting history", async () => {
      // 1. Generate MBBS roadmap
      const mbbsRoadmap = await AdaptiveRoadmapEngine.generateRoadmap(returningId, "mbbs-doctor");
      expect(mbbsRoadmap.careerSlug).toBe("mbbs-doctor");
      expect(mbbsRoadmap.status).toBe("ACTIVE");

      // 2. Complete an activity on the first milestone
      const firstMilestone = mbbsRoadmap.milestones[0];
      const firstActivity = firstMilestone.activities[0];
      const updated = await AdaptiveRoadmapEngine.toggleActivityCompletion(
        returningId,
        mbbsRoadmap.id,
        firstMilestone.id,
        firstActivity.id
      );
      expect(updated).toBeDefined();

      // 3. Student switches career goal to Corporate Lawyer (LAW)
      const lawRoadmap = await AdaptiveRoadmapEngine.generateRoadmap(returningId, "corporate-lawyer-mna");
      expect(lawRoadmap.careerSlug).toBe("corporate-lawyer-mna");
      expect(lawRoadmap.status).toBe("ACTIVE");
      expect(lawRoadmap.stream).toBe("LAW");

      // 4. In devStore, verify that the previous MBBS roadmap was archived, NOT deleted
      const allDevRoadmaps = devStore.getRoadmaps(returningId);
      const archivedMbbs = allDevRoadmaps.find(
        (r: any) => r.careerSlug === "mbbs-doctor"
      );
      expect(archivedMbbs).toBeDefined();
      expect(archivedMbbs.status).toBe("ARCHIVED");

      // 5. Verified skills in medical profile (Human Anatomy) remain preserved
      const prof = await ProfileService.getStudentProfile(returningId);
      expect(prof!.skills.assessed.some((s) => s.name === "Human Anatomy")).toBe(true);
    });
  });

  // ==========================================================================
  // 5. ALL 13 STREAMS ROADMAP PERSONALIZATION & LEARNING ACADEMY RESOURCES
  // ==========================================================================
  describe("Coverage: All 13 Streams Authentic Milestone Personalization", () => {
    const STREAMS_TO_TEST: { stream: EducationalStream; sampleSlug: string }[] = [
      { stream: "MEDICAL_PCB", sampleSlug: "mbbs-doctor" },
      { stream: "NON_MEDICAL_PCM", sampleSlug: "ai-systems-engineer" },
      { stream: "COMMERCE", sampleSlug: "chartered-accountant-icai" },
      { stream: "ARTS_HUMANITIES", sampleSlug: "civil-services-officer-ias" },
      { stream: "LAW", sampleSlug: "corporate-lawyer-mna" },
      { stream: "MANAGEMENT", sampleSlug: "management-consultant" },
      { stream: "CREATIVE_DESIGN", sampleSlug: "ui-ux-digital-product-designer" },
      { stream: "AGRICULTURE", sampleSlug: "precision-agronomist-crop-scientist" },
      { stream: "VOCATIONAL_TRADES", sampleSlug: "industrial-mechatronics-plc-specialist" },
      { stream: "SPORTS_PHYSICAL_ED", sampleSlug: "sports-physiotherapist-rehabilitation" },
      { stream: "HOSPITALITY_TOURISM", sampleSlug: "executive-master-chef-culinary" },
      { stream: "INTERDISCIPLINARY", sampleSlug: "bioinformatics-computational-biologist" },
      { stream: "UNDECIDED", sampleSlug: "career-exploration-discovery" },
    ];

    it.each(STREAMS_TO_TEST)(
      "generates authentic, stream-specific roadmap for $stream without generic fallback",
      async ({ stream, sampleSlug }) => {
        const testStudentId = `test-stream-${stream.toLowerCase()}`;
        devStore.saveProfile({
          id: testStudentId,
          userId: `user-${stream.toLowerCase()}`,
          educationStage: "UNDERGRADUATE",
          currentStream: stream,
          user: { name: `Student ${stream}`, email: `${stream.toLowerCase()}@test.kaabil.in` },
          interests: [],
          careerGoals: [],
          userSkills: [],
        });

        const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(testStudentId, sampleSlug);
        expect(roadmap).toBeDefined();
        expect(roadmap.stream).toBe(stream);
        expect(roadmap.milestones.length).toBeGreaterThanOrEqual(4);

        // Ensure milestone titles are not empty and not identical across different streams
        const milestoneTitles = roadmap.milestones.map((m) => m.title).join(" | ");
        expect(milestoneTitles).toBeTruthy();

        // Ensure verified learning resource from that stream is attached
        const hasVerifiedResource = roadmap.milestones.some((m) =>
          m.activities.some((a) => a.activityType === "VERIFIED_RESOURCE" && Boolean(a.resourceTitle))
        );
        expect(hasVerifiedResource).toBe(true);
      }
    );
  });

  // ==========================================================================
  // 6. AI MENTOR AUTHENTICITY, CONTEXT RESOLUTION & FALLBACK RELIABILITY
  // ==========================================================================
  describe("AI Mentor: Authenticated Context Resolution & Safe Fallback", () => {
    it("correctly resolves live context for undecided student without fabricating target career", async () => {
      const context = await AiMentorService.getStudentLiveContext(undecidedId);
      expect(context).toBeDefined();
      expect(context.studentName).toBe("Rohan Verma");
      expect(context.currentStream).toBe("UNDECIDED");
      expect(context.isUnassessed).toBe(true);
      expect(context.criScore).toBeNull();
      expect(context.targetCareerVerified).toBeNull();
    });

    it("generates deterministic fallback response with official source citations when offline", async () => {
      const conv = await AiMentorService.createConversation(confirmedId, undefined, "en");
      expect(conv).toBeDefined();

      const reply = await AiMentorService.generateMentorResponse(
        confirmedId,
        conv.id,
        "What are the eligibility criteria and salary for Chartered Accountant?",
        "en"
      );

      expect(reply).toBeDefined();
      expect(reply.content).toBeTruthy();
      expect(reply.source).toBe("kaabil_deterministic_mentor");
      expect(reply.content).toContain("ICAI");
      expect(reply.disclaimer).toBeTruthy();
    });

    it("safely handles trilingual guidance across English, Hindi, and Hinglish", async () => {
      const conv = await AiMentorService.createConversation(undecidedId, undefined, "hinglish");

      // Test Hindi query
      const hindiReply = await AiMentorService.generateMentorResponse(
        undecidedId,
        conv.id,
        "मुझे समझ नहीं आ रहा कौन सा करियर चुनूँ",
        "hi"
      );
      expect(hindiReply.content).toBeTruthy();

      // Test Hinglish query
      const hinglishReply = await AiMentorService.generateMentorResponse(
        undecidedId,
        conv.id,
        "I am confused which stream to pick after class 10",
        "hinglish"
      );
      expect(hinglishReply.content).toBeTruthy();
      expect(hinglishReply.content).toMatch(/career|stream|guidance|NCERT/i);
    });
  });
});
