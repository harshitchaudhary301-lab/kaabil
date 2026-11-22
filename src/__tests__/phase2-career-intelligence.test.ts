import { describe, it, expect } from "vitest";
import {
  CAREER_PATHS_DATABASE,
  ALL_CAREERS,
  STREAMS_CONFIG,
  getCareerBySlug,
  getCareersByStream,
  searchCareers,
} from "../data/careersData";
import { DISCOVERY_QUESTIONS } from "../data/discoveryQuestions";
import {
  CareerRecommendationEngine,
  StudentProfileContext,
} from "../lib/recommendations/recommendation-engine";
import { CareerEligibilityChecker } from "../lib/eligibility/eligibility-checker";
import { EducationalStream } from "../types";

describe("KAABIL Phase 2 — Career Intelligence Engine & Multi-Stream Pathways", () => {
  // ============================================================================
  // 1. MULTI-STREAM CAREER DATABASE EXPANSION & INTEGRITY
  // ============================================================================
  describe("Multi-Stream Career Database (120+ pathways)", () => {
    it("contains at least 120 authentic verified career pathways", () => {
      expect(CAREER_PATHS_DATABASE.length).toBeGreaterThanOrEqual(120);
      expect(ALL_CAREERS.length).toBe(CAREER_PATHS_DATABASE.length);
    });

    it("covers all 13 educational streams without exception", () => {
      const allStreams = new Set(CAREER_PATHS_DATABASE.map((c) => c.stream));
      const expectedStreams: EducationalStream[] = [
        "MEDICAL_PCB",
        "NON_MEDICAL_PCM",
        "COMMERCE",
        "ARTS_HUMANITIES",
        "LAW",
        "MANAGEMENT",
        "CREATIVE_DESIGN",
        "AGRICULTURE",
        "VOCATIONAL_TRADES",
        "SPORTS_PHYSICAL_ED",
        "HOSPITALITY_TOURISM",
        "INTERDISCIPLINARY",
        "UNDECIDED",
      ];

      expectedStreams.forEach((stream) => {
        expect(allStreams.has(stream)).toBe(true);
      });
    });

    it("verifies every career record contains complete Phase 2 metadata", () => {
      CAREER_PATHS_DATABASE.forEach((c) => {
        expect(c.id).toBeDefined();
        expect(c.slug).toBeDefined();
        expect(c.title).toBeDefined();
        expect(c.overview).toBeDefined();
        expect(c.minEducationStage).toBeDefined();
        expect(c.typicalDurationYears).toBeDefined();
        expect(c.regulatoryBody).toBeDefined();
        expect(c.verificationStatus).toBe("VERIFIED");
        expect(c.salarySource).toBeDefined();

        // Phase 2 Enhanced Attributes
        expect(c.requiredEducation).toBeDefined();
        expect(c.eligibilityCriteria).toBeDefined();
        expect(Array.isArray(c.relevantSubjects)).toBe(true);
        expect(c.relevantSubjects!.length).toBeGreaterThan(0);
        expect(Array.isArray(c.advantages)).toBe(true);
        expect(c.advantages!.length).toBeGreaterThan(0);
        expect(Array.isArray(c.challenges)).toBe(true);
        expect(c.challenges!.length).toBeGreaterThan(0);
        expect(c.estimatedEducationCost).toBeDefined();
        expect(c.estimatedEducationCost?.govt).toBeDefined();
        expect(c.estimatedEducationCost?.private).toBeDefined();

        // Skills & 4-week roadmap sample
        expect(c.skills.length).toBeGreaterThan(0);
        expect(c.learningRoadmapSample.length).toBe(4);
        expect(c.isDemoData).toBe(true);
      });
    });

    it("supports search and stream filtering helpers seamlessly", () => {
      const medCareers = getCareersByStream("MEDICAL_PCB");
      expect(medCareers.length).toBeGreaterThanOrEqual(10);
      expect(medCareers.every((c) => c.stream === "MEDICAL_PCB")).toBe(true);

      const mbbs = getCareerBySlug("mbbs-doctor");
      expect(mbbs).toBeDefined();
      expect(mbbs?.title).toContain("MBBS Doctor");

      const searchResults = searchCareers("drone");
      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults.some((c) => c.title.toLowerCase().includes("drone"))).toBe(true);
    });
  });

  // ============================================================================
  // 2. SMART STUDENT ASSESSMENT (STRENGTHS & DISCOVERY)
  // ============================================================================
  describe("Smart Student Assessment (Discovery & Strengths)", () => {
    it("evaluates all 8 required adaptive dimensions", () => {
      const dimensions = DISCOVERY_QUESTIONS.map((q) => q.dimension);
      expect(dimensions).toContain("INTERESTS");
      expect(dimensions).toContain("SUBJECT_PREFERENCES");
      expect(dimensions).toContain("LOGICAL_REASONING");
      expect(dimensions).toContain("CREATIVITY");
      expect(dimensions).toContain("COMMUNICATION");
      expect(dimensions).toContain("PRACTICAL_PROBLEM_SOLVING");
      expect(dimensions).toContain("WORKSTYLE_PREFERENCES");
      expect(dimensions).toContain("LEARNING_GOALS");
      expect(DISCOVERY_QUESTIONS.length).toBe(8);
    });

    it("includes situational real-world scenarios and multi-select / Not Sure option", () => {
      const q1 = DISCOVERY_QUESTIONS.find((q) => q.id === "q1_interests")!;
      expect(q1.isMultiSelect).toBe(true);
      const notSureOpt = q1.options.find((o) => o.id === "not_sure");
      expect(notSureOpt).toBeDefined();
      expect(notSureOpt?.associatedStreams).toContain("UNDECIDED");

      const scenarioQuestions = DISCOVERY_QUESTIONS.filter((q) => !!q.scenario);
      expect(scenarioQuestions.length).toBeGreaterThanOrEqual(3);
    });

    it("supports English, Hindi (हिन्दी), and Hinglish for all questions and options", () => {
      DISCOVERY_QUESTIONS.forEach((q) => {
        expect(q.title).toBeDefined();
        expect(q.hindiTitle).toBeDefined();
        expect(q.hinglishTitle).toBeDefined();
        expect(q.subtitle).toBeDefined();
        expect(q.hindiSubtitle).toBeDefined();
        expect(q.hinglishSubtitle).toBeDefined();

        q.options.forEach((opt) => {
          expect(opt.label).toBeDefined();
          expect(opt.hindiLabel).toBeDefined();
          expect(opt.hinglishLabel).toBeDefined();
        });
      });
    });
  });

  // ============================================================================
  // 3. EXPLAINABLE CAREER MATCHING ENGINE
  // ============================================================================
  describe("Explainable Career Matching Engine", () => {
    const studentWithInterests: StudentProfileContext = {
      id: "student-pcb-1",
      name: "Diya Sharma",
      educationStage: "CLASS_12",
      primaryStream: "MEDICAL_PCB",
      selectedStreams: ["MEDICAL_PCB"],
      interests: ["Healthcare, Medicine & Helping Patients", "Biology & Life Sciences"],
      preferredSubjects: ["Biology", "Chemistry", "Physics"],
      skills: [
        { name: "Biology", proficiency: "PROFICIENT", isVerified: false },
        { name: "Empathy", proficiency: "INTERMEDIATE", isVerified: false },
      ],
      careerGoal: {
        goalType: "CLINICAL_SERVICE",
        targetRole: "Physician",
      },
      learningPreferences: {
        preferredPace: "MODERATE",
        preferredStyle: "PRACTICAL",
        weeklyHoursAvailable: 15,
        primaryLanguage: "en",
      },
    };

    it("returns top 3–5 recommendations with deterministic bounded match scores", () => {
      const recs = CareerRecommendationEngine.getRecommendations(studentWithInterests, ALL_CAREERS, 5);
      expect(recs.length).toBe(5);

      recs.forEach((rec) => {
        expect(rec.compatibilityScore).toBeGreaterThanOrEqual(25);
        expect(rec.compatibilityScore).toBeLessThanOrEqual(98);
        expect(rec.breakdown.interestScore).toBeGreaterThanOrEqual(0);
        expect(rec.breakdown.streamScore).toBeGreaterThanOrEqual(0);
        expect(rec.breakdown.skillScore).toBeGreaterThanOrEqual(0);
        expect(rec.breakdown.goalScore).toBeGreaterThanOrEqual(0);
        expect(rec.breakdown.preferenceScore).toBeGreaterThanOrEqual(0);
      });
    });

    it("distinguishes interest alignment from formal regulatory eligibility", () => {
      const mbbsCareer = ALL_CAREERS.find((c) => c.slug === "mbbs-doctor")!;
      const rec = CareerRecommendationEngine.evaluateCareerCompatibility(studentWithInterests, mbbsCareer);

      // High interest alignment
      expect(rec.breakdown.interestScore).toBeGreaterThan(15);
      expect(rec.compatibilityScore).toBeGreaterThan(65);

      // Formal regulatory eligibility evaluation
      expect(rec.eligibility).toBeDefined();
      expect(rec.eligibility.status).toBeDefined();
      expect(rec.eligibility.regulatoryDisclaimer).toContain("National Medical Commission");
    });

    it("provides complete explainability points, strengths, and recommended next action", () => {
      const mbbsCareer = ALL_CAREERS.find((c) => c.slug === "mbbs-doctor")!;
      const rec = CareerRecommendationEngine.evaluateCareerCompatibility(studentWithInterests, mbbsCareer);

      expect(rec.whySuited).toBeDefined();
      expect(rec.whySuited.length).toBeGreaterThan(20);
      expect(rec.alignedStrengths.length).toBeGreaterThan(0);
      expect(rec.skillsToImprove.length).toBeGreaterThan(0);
      expect(rec.recommendedNextAction).toBeDefined();
      expect(rec.recommendedNextAction).toContain("NEET-UG");
    });

    it("communicates uncertainty and marks data as INSUFFICIENT for empty profiles", () => {
      const emptyStudent: StudentProfileContext = {
        id: "student-empty",
        name: "Confused Student",
        educationStage: "CLASS_10",
        primaryStream: "UNDECIDED",
        selectedStreams: [],
        interests: [],
        skills: [],
      };

      const rec = CareerRecommendationEngine.evaluateCareerCompatibility(emptyStudent, ALL_CAREERS[0]);
      expect(rec.dataSufficiency).toBe("INSUFFICIENT");
      expect(rec.uncertaintyFollowUpQuestions).toBeDefined();
      expect(rec.uncertaintyFollowUpQuestions!.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================================================
  // 4. CAREER COMPARISON MODULE LOGIC
  // ============================================================================
  describe("Career Comparison Module (Up to 3 careers)", () => {
    it("correctly compares 3 disparate careers with full side-by-side attributes", () => {
      const slugs = ["mbbs-doctor", "ai-systems-engineer", "chartered-accountant-icai"];
      const compared = slugs.map((s) => getCareerBySlug(s)!);

      expect(compared.length).toBe(3);

      // Verify each career has verified cost, subjects, skills, advantages and challenges
      compared.forEach((c) => {
        expect(c.estimatedEducationCost?.govt).toBeDefined();
        expect(c.estimatedEducationCost?.private).toBeDefined();
        expect(c.relevantSubjects).toBeDefined();
        expect(c.advantages).toBeDefined();
        expect(c.challenges).toBeDefined();
        expect(c.careerProgression).toBeDefined();
        expect(c.degreeAndDiplomaPathways).toBeDefined();
      });

      // Verify Medical vs Tech vs Commerce specific contrasts
      const mbbs = compared[0];
      const ai = compared[1];
      const ca = compared[2];

      expect(mbbs.regulatoryBody).toContain("National Medical Commission");
      expect(ca.regulatoryBody).toContain("Institute of Chartered Accountants of India");
      expect(ai.typicalDurationYears).toContain("4");
      expect(mbbs.typicalDurationYears).toContain("5.5");
    });
  });

  // ============================================================================
  // 5. SCHOOL VS COLLEGE SEPARATION & CHILD SAFETY
  // ============================================================================
  describe("School vs College Separation & Minor Safeguards", () => {
    it("preserves school student guidance without minor recruitment exposure", () => {
      const schoolStages = ["CLASS_8", "CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"];
      schoolStages.forEach((stage) => {
        const student: StudentProfileContext = {
          id: `school-${stage}`,
          name: "School Student",
          educationStage: stage,
          primaryStream: "NON_MEDICAL_PCM",
          selectedStreams: ["NON_MEDICAL_PCM"],
          interests: ["Robotics"],
          skills: [],
        };

        const rec = CareerRecommendationEngine.evaluateCareerCompatibility(student, ALL_CAREERS[0]);
        // Recommended next action for school students guides subject choice or entrance exams, never job placement
        expect(rec.recommendedNextAction.toLowerCase()).not.toContain("apply for job");
        expect(rec.recommendedNextAction.toLowerCase()).not.toContain("internship placement");
      });
    });
  });
});
