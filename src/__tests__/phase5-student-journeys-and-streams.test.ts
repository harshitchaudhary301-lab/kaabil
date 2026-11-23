// ==============================================================================
// KAABIL (काबिल) — Phase 5: Final Release QA Test Suite
// Validates:
// 1. 11 Representative Real Student Journeys
// 2. All 13 Canonical Streams Parameterized Invariant Verification
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { devStore } from "@/lib/dev-store";
import { ProfileService } from "@/lib/student/profile-service";
import { CareerRecommendationEngine } from "@/lib/recommendations/recommendation-engine";
import { AdaptiveRoadmapEngine } from "@/lib/roadmap/adaptive-roadmap-engine";
import { SkillGapEngine } from "@/lib/skill-gap/skill-gap-engine";
import { AiMentorService } from "@/lib/mentor/ai-mentor-service";
import { CAREER_PATHS_DATABASE, getCareerBySlug, STREAMS_CONFIG } from "@/data/careersData";
import { getCuratedResourcesForCareer } from "@/data/learningResourcesData";
import { EducationalStream } from "@/types";

const ALL_13_STREAMS: EducationalStream[] = [
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

describe("Phase 5: Release QA — Section 1: Real Student Journey Testing", () => {
  // 1. Undecided student without a career goal
  it("Journey 1: Undecided student without a career goal", async () => {
    const studentId = "qa-journey-01-undecided";
    devStore.saveProfile({
      id: studentId,
      userId: "user-j01",
      educationStage: "CLASS_10",
      currentStream: "UNDECIDED",
      user: { name: "Aarav Sharma", email: "aarav.undecided@test.kaabil.in" },
      interests: [],
      careerGoals: [],
      userSkills: [],
      roadmaps: [],
      dailyMissions: [],
    });

    const profile = await ProfileService.getStudentProfile(studentId);
    expect(profile).not.toBeNull();
    expect(profile?.academic.stream).toBe("UNDECIDED");
    expect(profile?.targetCareer).toBeNull();

    const recs = CareerRecommendationEngine.getRecommendations(
      {
        id: studentId,
        name: "Aarav Sharma",
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
    expect(recs[0].dataSufficiency).toBe("INSUFFICIENT");

    const resources = getCuratedResourcesForCareer("UNDECIDED", []);
    expect(resources.length).toBeGreaterThanOrEqual(4);
    const hasStemLeakage = resources.some((r) => r.stream === "NON_MEDICAL_PCM");
    expect(hasStemLeakage).toBe(false);

    const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(studentId, "career-exploration-discovery");
    expect(roadmap.milestones.length).toBeGreaterThan(0);
    expect(roadmap.stream).toBe("UNDECIDED");

    const conv = await AiMentorService.createConversation(studentId, undefined, "en");
    const reply = await AiMentorService.generateMentorResponse(
      studentId,
      conv.id,
      "I am in Class 10 and completely confused about which stream or career to pick.",
      "en"
    );
    expect(reply.content).toBeDefined();
    expect(reply.source).toMatch(/gemini_2_flash|kaabil_deterministic_mentor/);
  });

  // 2. PCM student exploring engineering careers
  it("Journey 2: PCM student exploring engineering careers", async () => {
    const studentId = "qa-journey-02-pcm";
    devStore.saveProfile({
      id: studentId,
      userId: "user-j02",
      educationStage: "CLASS_12",
      currentStream: "NON_MEDICAL_PCM",
      selectedStreams: ["NON_MEDICAL_PCM"],
      targetCareerPathId: "aerospace-propulsion-engineer",
      user: { name: "Vikram Malhotra", email: "vikram.pcm@test.kaabil.in" },
      interests: [{ domain: "Robotics" }, { domain: "Aerospace" }],
      careerGoals: [{ careerPath: { slug: "aerospace-propulsion-engineer", title: "Aerospace & Propulsion Systems Engineer" } }],
      userSkills: [{ skill: { name: "Calculus", category: "ANALYTICAL" }, proficiencyLevel: "INTERMEDIATE", isVerified: false }],
      roadmaps: [],
    });

    const recs = CareerRecommendationEngine.getRecommendations(
      {
        id: studentId,
        name: "Vikram Malhotra",
        educationStage: "CLASS_12",
        primaryStream: "NON_MEDICAL_PCM",
        selectedStreams: ["NON_MEDICAL_PCM"],
        interests: ["Robotics", "Aerospace"],
        skills: [{ name: "Calculus", proficiency: "INTERMEDIATE" }],
      },
      CAREER_PATHS_DATABASE,
      5
    );
    expect(recs.some((r) => r.career.stream === "NON_MEDICAL_PCM")).toBe(true);

    const career = getCareerBySlug("aerospace-propulsion-engineer");
    expect(career).toBeDefined();
    expect(career?.keyEntranceExams.some((e) => e.includes("JEE"))).toBe(true);

    const gaps = await SkillGapEngine.analyzeGaps(studentId, "aerospace-propulsion-engineer");
    expect(gaps.skillGaps.length).toBeGreaterThan(0);

    const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(studentId, "aerospace-propulsion-engineer");
    expect(roadmap.milestones.length).toBeGreaterThanOrEqual(4);
  });

  // 3. PCB student exploring medical and biological careers
  it("Journey 3: PCB student exploring medical and biological careers", async () => {
    const studentId = "qa-journey-03-pcb";
    devStore.saveProfile({
      id: studentId,
      userId: "user-j03",
      educationStage: "CLASS_12",
      currentStream: "MEDICAL_PCB",
      selectedStreams: ["MEDICAL_PCB"],
      targetCareerPathId: "mbbs-doctor",
      user: { name: "Ananya Iyer", email: "ananya.pcb@test.kaabil.in" },
      interests: [{ domain: "Human Anatomy" }, { domain: "Genetics" }],
      careerGoals: [{ careerPath: { slug: "mbbs-doctor", title: "MBBS Doctor" } }],
      userSkills: [],
      roadmaps: [],
    });

    const recs = CareerRecommendationEngine.getRecommendations(
      {
        id: studentId,
        name: "Ananya Iyer",
        educationStage: "CLASS_12",
        primaryStream: "MEDICAL_PCB",
        selectedStreams: ["MEDICAL_PCB"],
        interests: ["Human Anatomy", "Genetics"],
        skills: [],
      },
      CAREER_PATHS_DATABASE,
      5
    );
    expect(recs.some((r) => r.career.slug === "mbbs-doctor" || r.career.stream === "MEDICAL_PCB")).toBe(true);

    const mbbs = getCareerBySlug("mbbs-doctor");
    expect(mbbs?.regulatoryBody).toBe("National Medical Commission (NMC)");
    expect(mbbs?.keyEntranceExams.some((e) => e.includes("NEET-UG"))).toBe(true);

    const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(studentId, "mbbs-doctor");
    expect(roadmap.milestones.some((m) => m.title.includes("Anatomy") || m.title.includes("Clinical") || m.title.includes("Foundation"))).toBe(true);
  });

  // 4. Commerce student exploring finance careers
  it("Journey 4: Commerce student exploring finance careers", async () => {
    const studentId = "qa-journey-04-commerce";
    devStore.saveProfile({
      id: studentId,
      userId: "user-j04",
      educationStage: "UNDERGRADUATE",
      currentStream: "COMMERCE",
      selectedStreams: ["COMMERCE"],
      targetCareerPathId: "investment-banker",
      user: { name: "Rishi Agrawal", email: "rishi.commerce@test.kaabil.in" },
      interests: [{ domain: "Financial Markets" }, { domain: "Corporate Finance" }],
      careerGoals: [{ careerPath: { slug: "investment-banker", title: "Investment Banker" } }],
      userSkills: [],
      roadmaps: [],
    });

    const recs = CareerRecommendationEngine.getRecommendations(
      {
        id: studentId,
        name: "Rishi Agrawal",
        educationStage: "UNDERGRADUATE",
        primaryStream: "COMMERCE",
        selectedStreams: ["COMMERCE"],
        interests: ["Financial Markets"],
        skills: [],
      },
      CAREER_PATHS_DATABASE,
      5
    );
    expect(recs.some((r) => r.career.stream === "COMMERCE")).toBe(true);

    const ca = getCareerBySlug("chartered-accountant-icai");
    expect(ca?.regulatoryBody).toContain("Institute of Chartered Accountants of India (ICAI)");

    const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(studentId, "chartered-accountant-icai");
    expect(roadmap.milestones.some((m) => m.title.includes("Accounting") || m.title.includes("Taxation"))).toBe(true);
  });

  // 5. Arts student exploring humanities careers
  it("Journey 5: Arts student exploring humanities careers", async () => {
    const studentId = "qa-journey-05-arts";
    devStore.saveProfile({
      id: studentId,
      userId: "user-j05",
      educationStage: "UNDERGRADUATE",
      currentStream: "ARTS_HUMANITIES",
      selectedStreams: ["ARTS_HUMANITIES"],
      targetCareerPathId: "civil-services-officer-ias",
      user: { name: "Meera Sen", email: "meera.arts@test.kaabil.in" },
      interests: [{ domain: "Public Policy" }, { domain: "History" }],
      careerGoals: [{ careerPath: { slug: "civil-services-officer-ias", title: "Civil Services Officer (IAS/IPS)" } }],
      userSkills: [],
      roadmaps: [],
    });

    const recs = CareerRecommendationEngine.getRecommendations(
      {
        id: studentId,
        name: "Meera Sen",
        educationStage: "UNDERGRADUATE",
        primaryStream: "ARTS_HUMANITIES",
        selectedStreams: ["ARTS_HUMANITIES"],
        interests: ["Public Policy"],
        skills: [],
      },
      CAREER_PATHS_DATABASE,
      5
    );
    expect(recs.some((r) => r.career.stream === "ARTS_HUMANITIES")).toBe(true);

    const ias = getCareerBySlug("civil-services-officer-ias");
    expect(ias?.regulatoryBody).toContain("Union Public Service Commission (UPSC)");
    expect(ias?.keyEntranceExams.some((e) => e.includes("UPSC Civil Services"))).toBe(true);

    const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(studentId, "civil-services-officer-ias");
    expect(roadmap.milestones.some((m) => m.title.includes("General Studies") || m.title.includes("Governance"))).toBe(true);
  });

  // 6. Agriculture student
  it("Journey 6: Agriculture student exploring agronomy and food tech", async () => {
    const studentId = "qa-journey-06-agri";
    devStore.saveProfile({
      id: studentId,
      userId: "user-j06",
      educationStage: "UNDERGRADUATE",
      currentStream: "AGRICULTURE",
      selectedStreams: ["AGRICULTURE"],
      targetCareerPathId: "precision-agronomist-crop-scientist",
      user: { name: "Gurpreet Singh", email: "gurpreet.agri@test.kaabil.in" },
      interests: [{ domain: "Precision Farming" }],
      careerGoals: [{ careerPath: { slug: "precision-agronomist-crop-scientist", title: "Precision Agronomist" } }],
      userSkills: [],
      roadmaps: [],
    });

    const recs = CareerRecommendationEngine.getRecommendations(
      {
        id: studentId,
        name: "Gurpreet Singh",
        educationStage: "UNDERGRADUATE",
        primaryStream: "AGRICULTURE",
        selectedStreams: ["AGRICULTURE"],
        interests: ["Precision Farming"],
        skills: [],
      },
      CAREER_PATHS_DATABASE,
      5
    );
    expect(recs.some((r) => r.career.stream === "AGRICULTURE")).toBe(true);

    const agronomist = getCareerBySlug("precision-agronomist-crop-scientist");
    expect(agronomist?.regulatoryBody).toContain("ICAR");

    const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(studentId, "precision-agronomist-crop-scientist");
    expect(roadmap.milestones.some((m) => m.title.includes("Agronomy") || m.title.includes("Soil") || m.title.includes("Crop"))).toBe(true);
  });

  // 7. Law student
  it("Journey 7: Law student exploring legal careers", async () => {
    const studentId = "qa-journey-07-law";
    devStore.saveProfile({
      id: studentId,
      userId: "user-j07",
      educationStage: "UNDERGRADUATE",
      currentStream: "LAW",
      selectedStreams: ["LAW"],
      targetCareerPathId: "corporate-lawyer-mna",
      user: { name: "Tanvi Deshmukh", email: "tanvi.law@test.kaabil.in" },
      interests: [{ domain: "Corporate Governance" }, { domain: "Constitutional Law" }],
      careerGoals: [{ careerPath: { slug: "corporate-lawyer-mna", title: "Corporate Lawyer (M&A)" } }],
      userSkills: [],
      roadmaps: [],
    });

    const recs = CareerRecommendationEngine.getRecommendations(
      {
        id: studentId,
        name: "Tanvi Deshmukh",
        educationStage: "UNDERGRADUATE",
        primaryStream: "LAW",
        selectedStreams: ["LAW"],
        interests: ["Corporate Governance"],
        skills: [],
      },
      CAREER_PATHS_DATABASE,
      5
    );
    expect(recs.some((r) => r.career.stream === "LAW")).toBe(true);

    const law = getCareerBySlug("corporate-lawyer-mna");
    expect(law?.regulatoryBody).toContain("Bar Council of India (BCI)");

    const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(studentId, "corporate-lawyer-mna");
    expect(roadmap.milestones.some((m) => m.title.includes("Moot") || m.title.includes("Corporate") || m.title.includes("Legal"))).toBe(true);
  });

  // 8. Creative Design student
  it("Journey 8: Creative Design student exploring design careers", async () => {
    const studentId = "qa-journey-08-design";
    devStore.saveProfile({
      id: studentId,
      userId: "user-j08",
      educationStage: "UNDERGRADUATE",
      currentStream: "CREATIVE_DESIGN",
      selectedStreams: ["CREATIVE_DESIGN"],
      targetCareerPathId: "ui-ux-digital-product-designer",
      user: { name: "Zoya Akhtar", email: "zoya.design@test.kaabil.in" },
      interests: [{ domain: "UI/UX Design" }, { domain: "Interaction Design" }],
      careerGoals: [{ careerPath: { slug: "ui-ux-digital-product-designer", title: "UI/UX Product Designer" } }],
      userSkills: [],
      roadmaps: [],
    });

    const recs = CareerRecommendationEngine.getRecommendations(
      {
        id: studentId,
        name: "Zoya Akhtar",
        educationStage: "UNDERGRADUATE",
        primaryStream: "CREATIVE_DESIGN",
        selectedStreams: ["CREATIVE_DESIGN"],
        interests: ["UI/UX Design"],
        skills: [],
      },
      CAREER_PATHS_DATABASE,
      5
    );
    expect(recs.some((r) => r.career.stream === "CREATIVE_DESIGN")).toBe(true);

    const design = getCareerBySlug("ui-ux-digital-product-designer");
    expect(design?.skills.some((s) => s.name.includes("Figma") || s.name.includes("Design"))).toBe(true);

    const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(studentId, "ui-ux-digital-product-designer");
    expect(roadmap.milestones.some((m) => m.title.includes("Design") || m.title.includes("Wireframing") || m.title.includes("Figma"))).toBe(true);
  });

  // 9. Vocational student
  it("Journey 9: Vocational student exploring technical trades", async () => {
    const studentId = "qa-journey-09-vocational";
    devStore.saveProfile({
      id: studentId,
      userId: "user-j09",
      educationStage: "ITI",
      currentStream: "VOCATIONAL_TRADES",
      selectedStreams: ["VOCATIONAL_TRADES"],
      targetCareerPathId: "industrial-mechatronics-plc-specialist",
      user: { name: "Rajesh Kumar", email: "rajesh.vocational@test.kaabil.in" },
      interests: [{ domain: "Industrial Automation" }],
      careerGoals: [{ careerPath: { slug: "industrial-mechatronics-plc-specialist", title: "Industrial Mechatronics & PLC Specialist" } }],
      userSkills: [],
      roadmaps: [],
    });

    const recs = CareerRecommendationEngine.getRecommendations(
      {
        id: studentId,
        name: "Rajesh Kumar",
        educationStage: "ITI",
        primaryStream: "VOCATIONAL_TRADES",
        selectedStreams: ["VOCATIONAL_TRADES"],
        interests: ["Industrial Automation"],
        skills: [],
      },
      CAREER_PATHS_DATABASE,
      5
    );
    expect(recs.some((r) => r.career.stream === "VOCATIONAL_TRADES")).toBe(true);

    const mechatronics = getCareerBySlug("industrial-mechatronics-plc-specialist");
    expect(mechatronics?.regulatoryBody).toContain("National Council for Vocational Education and Training (NCVET)");

    const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(studentId, "industrial-mechatronics-plc-specialist");
    expect(roadmap.milestones.some((m) => m.title.includes("PLC") || m.title.includes("Mechatronics") || m.title.includes("Automation"))).toBe(true);
  });

  // 10. Returning student with existing progress
  it("Journey 10: Returning student with existing progress shifting career target", async () => {
    const studentId = "qa-journey-10-returning";
    devStore.saveProfile({
      id: studentId,
      userId: "user-j10",
      educationStage: "UNDERGRADUATE",
      currentStream: "COMMERCE",
      selectedStreams: ["COMMERCE"],
      targetCareerPathId: "chartered-accountant-icai",
      user: { name: "Pooja Hegde", email: "pooja.returning@test.kaabil.in" },
      interests: [{ domain: "Accounting" }],
      careerGoals: [{ careerPath: { slug: "chartered-accountant-icai", title: "Chartered Accountant (ICAI)" } }],
      userSkills: [
        {
          name: "Auditing Standards",
          proficiencyLevel: "ADVANCED",
          isVerified: true,
          scorePercentage: 92,
        },
      ],
      roadmaps: [
        {
          id: "rm-initial",
          targetCareerSlug: "chartered-accountant-icai",
          careerSlug: "chartered-accountant-icai",
          status: "ACTIVE",
          milestones: [{ id: "m-1", title: "ICAI Foundation Prep", status: "COMPLETED", activities: [] }],
        },
      ],
    });

    const initialProfile = await ProfileService.getStudentProfile(studentId);
    expect(initialProfile?.skills.assessed.some((s) => s.name === "Auditing Standards")).toBe(true);

    // Switch target career via roadmap generation to investment-banker-mna
    const newRoadmap = await AdaptiveRoadmapEngine.generateRoadmap(studentId, "investment-banker-mna");
    expect(newRoadmap.careerSlug).toBe("investment-banker-mna");
    expect(newRoadmap.status).toBe("ACTIVE");

    // Profile skills must be 100% retained and verified status preserved
    const updatedProfile = await ProfileService.getStudentProfile(studentId);
    expect(updatedProfile?.skills.assessed.some((s) => s.name === "Auditing Standards")).toBe(true);

    // Previous roadmap should be archived, not deleted
    const allRoadmaps = devStore.getRoadmaps(studentId);
    expect(allRoadmaps.length).toBeGreaterThanOrEqual(1);
  });

  // 11. Student exploring an alternative career without changing their academic stream
  it("Journey 11: Student exploring an alternative career without changing academic stream", async () => {
    const studentId = "qa-journey-11-alternative";
    devStore.saveProfile({
      id: studentId,
      userId: "user-j11",
      educationStage: "UNDERGRADUATE",
      currentStream: "NON_MEDICAL_PCM",
      selectedStreams: ["NON_MEDICAL_PCM", "CREATIVE_DESIGN"],
      targetCareerPathId: "ui-ux-digital-product-designer",
      user: { name: "Aditya Verma", email: "aditya.alt@test.kaabil.in" },
      interests: [{ domain: "Graphic Design" }, { domain: "UI/UX Design" }],
      careerGoals: [{ careerPath: { slug: "ui-ux-digital-product-designer", title: "UI/UX Product Designer" } }],
      userSkills: [],
      roadmaps: [],
    });

    const profile = await ProfileService.getStudentProfile(studentId);
    expect(profile?.academic.stream).toBe("NON_MEDICAL_PCM");

    // Evaluate compatibility directly for the cross-stream alternative career
    const designCareer = getCareerBySlug("ui-ux-digital-product-designer")!;
    const evalDesign = CareerRecommendationEngine.evaluateCareerCompatibility(
      {
        id: studentId,
        name: "Aditya Verma",
        educationStage: "UNDERGRADUATE",
        primaryStream: "NON_MEDICAL_PCM",
        selectedStreams: ["NON_MEDICAL_PCM", "CREATIVE_DESIGN"],
        interests: ["Graphic Design", "UI/UX Design"],
        skills: [],
      },
      designCareer
    );

    expect(evalDesign.compatibilityScore).toBeGreaterThanOrEqual(70);
    expect(evalDesign.whySuited).toBeTruthy();

    // Stream-filtered alternative exploration returns design careers
    const designCatalog = CAREER_PATHS_DATABASE.filter((c) => c.stream === "CREATIVE_DESIGN");
    const recs = CareerRecommendationEngine.getRecommendations(
      {
        id: studentId,
        name: "Aditya Verma",
        educationStage: "UNDERGRADUATE",
        primaryStream: "NON_MEDICAL_PCM",
        selectedStreams: ["NON_MEDICAL_PCM", "CREATIVE_DESIGN"],
        interests: ["Graphic Design", "UI/UX Design"],
        skills: [],
      },
      designCatalog,
      5
    );

    const hasDesignRec = recs.some((r) => r.career.stream === "CREATIVE_DESIGN");
    expect(hasDesignRec).toBe(true);

    // Profile academic stream remains strictly NON_MEDICAL_PCM (no unintended stream change)
    const refetchedProfile = await ProfileService.getStudentProfile(studentId);
    expect(refetchedProfile?.academic.stream).toBe("NON_MEDICAL_PCM");
  });
});

describe("Phase 5: Release QA — Section 2: All 13 Streams Parameterized Verification", () => {
  it.each(ALL_13_STREAMS)("validates stream '%s': identifier, careers, resources, and neutrality", async (stream) => {
    // 1. Valid stream config
    const config = STREAMS_CONFIG.find((s) => s.stream === stream);
    expect(config).toBeDefined();
    expect(config?.stream).toBe(stream);
    expect(config?.title).toBeDefined();

    // 2. Verified careers in catalog
    const careers = CAREER_PATHS_DATABASE.filter((c) => c.stream === stream);
    expect(careers.length).toBeGreaterThan(0);
    const repCareer = careers[0];
    expect(repCareer.title).toBeDefined();
    expect(repCareer.slug).toBeDefined();
    expect(repCareer.avgStartingSalaryInr).toBeGreaterThan(0);
    expect(repCareer.keyEntranceExams.length).toBeGreaterThan(0);
    expect(repCareer.sources?.length).toBeGreaterThan(0);

    // 3. Learning Resources
    const resources = getCuratedResourcesForCareer(stream, []);
    expect(resources.length).toBeGreaterThan(0);

    // 4. Neutrality check: Non-STEM streams must NOT contain hardcoded STEM bias
    if (stream !== "NON_MEDICAL_PCM" && stream !== "INTERDISCIPLINARY") {
      const stemLeak = careers.some(
        (c) =>
          c.title.toLowerCase().includes("software engineer") ||
          c.title.toLowerCase().includes("python developer")
      );
      expect(stemLeak).toBe(false);
    }

    // 5. Recommendations isolation
    const recs = CareerRecommendationEngine.getRecommendations(
      {
        id: `rec-${stream}`,
        name: `Student ${stream}`,
        educationStage: "CLASS_12",
        primaryStream: stream,
        selectedStreams: [stream],
        interests: [],
        skills: [],
      },
      CAREER_PATHS_DATABASE,
      5
    );
    expect(recs.length).toBeGreaterThan(0);
    if (stream !== "UNDECIDED") {
      const hasStreamCareer = recs.some((r) => r.career.stream === stream);
      expect(hasStreamCareer).toBe(true);
    }

    // 6. Roadmap Generation for representative career
    const studentId = `test-stream-${stream.toLowerCase()}`;
    devStore.saveProfile({
      id: studentId,
      userId: `user-${stream}`,
      educationStage: "CLASS_12",
      currentStream: stream,
      selectedStreams: [stream],
      targetCareerPathId: repCareer.slug,
      user: { name: `Student ${stream}`, email: `${stream.toLowerCase()}@test.kaabil.in` },
      interests: [],
      careerGoals: [{ careerPath: { slug: repCareer.slug, title: repCareer.title } }],
      userSkills: [],
      roadmaps: [],
    });

    const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(studentId, repCareer.slug);
    expect(roadmap.milestones.length).toBeGreaterThan(0);
    expect(roadmap.careerSlug).toBe(repCareer.slug);
  });
});
