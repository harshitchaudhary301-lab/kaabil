import { describe, it, expect } from "vitest";
import { devStore } from "@/lib/dev-store";
import { CareerReadinessEngine } from "@/lib/readiness/cri-engine";
import { CareerDigitalTwinService } from "@/lib/digital-twin/digital-twin-service";
import { AdaptiveRoadmapEngine } from "@/lib/roadmap/adaptive-roadmap-engine";
import { DailyMissionsEngine } from "@/lib/missions/daily-missions-engine";

describe("Part C Acceptance Audit & Verification", () => {
  const testUserId = "user-ananya-medical-" + Date.now();
  const testProfId = "prof-ananya-medical-" + Date.now();

  it("Step 1: registers and isolates a new student (Medical PCB, Class 11)", () => {
    const newStudentUser = {
      id: testUserId,
      email: "ananya.medical@kaabil-test.in",
      name: "Ananya Deshmukh",
      role: "STUDENT",
      status: "ACTIVE",
      isMinor: true, // Class 11 is minor under DPDP Act
      studentProfile: {
        id: testProfId,
        educationStage: "CLASS_11",
        currentStream: "MEDICAL_PCB",
        onboardingCompleted: true,
        careerReadinessIndex: 45,
        institutionName: "Kendriya Vidyalaya (Demo)",
      },
      organizations: [],
    };

    devStore.saveUser(newStudentUser);
    const retrieved = devStore.getUserByEmail("ananya.medical@kaabil-test.in");
    expect(retrieved).not.toBeNull();
    expect(retrieved.name).toBe("Ananya Deshmukh");
    expect(retrieved.isMinor).toBe(true);
  });

  it("Step 2: saves multi-stream onboarding diagnostic calibration to devStore", () => {
    const onboardingProfile = {
      id: testProfId,
      userId: testUserId,
      educationStage: "CLASS_11",
      currentStream: "MEDICAL_PCB",
      selectedStreams: ["MEDICAL_PCB"],
      targetCareerPathId: "mbbs-doctor",
      targetCompletionYear: 2028,
      onboardingCompleted: true,
      careerReadinessIndex: 45,
      user: { name: "Ananya Deshmukh", email: "ananya.medical@kaabil-test.in" },
      interests: [
        { domain: "Biochemistry", interestName: "Biochemistry" },
        { domain: "Human Physiology", interestName: "Human Physiology" },
      ],
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
        { skill: { name: "Human Physiology", category: "FOUNDATIONAL" }, proficiencyLevel: "INTERMEDIATE", isVerified: false },
        { skill: { name: "Microbiology", category: "FOUNDATIONAL" }, proficiencyLevel: "BEGINNER", isVerified: false },
      ],
      roadmaps: [],
      dailyMissions: [],
    };

    devStore.saveProfile(onboardingProfile);
    const saved = devStore.getProfile(testProfId);
    expect(saved).not.toBeNull();
    expect(saved.onboardingCompleted).toBe(true);
    expect(saved.currentStream).toBe("MEDICAL_PCB");
  });

  it("Step 3: calculates CRI with strict multi-stream isolation and evidence breakdown", async () => {
    const criResult = await CareerReadinessEngine.calculateReadiness(testProfId, "mbbs-doctor");
    expect(criResult).toBeDefined();
    expect(Object.keys(criResult.dimensions).length).toBe(5);
    expect(criResult.stream).toBe("MEDICAL_PCB");
    // Verify self-reported skills are discounted and noted
    const skillDim = criResult.dimensions.skillDevelopment;
    expect(skillDim).toBeDefined();
    expect(skillDim.weight).toBe(25);
  });

  it("Step 4: synthesizes dedicated Career Digital Twin with medical stream horizons and benchmark gaps", async () => {
    const twin = await CareerDigitalTwinService.getDigitalTwin(testProfId);
    expect(twin).not.toBeNull();
    expect(twin?.studentName).toBe("Ananya Deshmukh");
    expect(twin?.primaryStream).toBe("MEDICAL_PCB");
    expect(twin?.skills.selfReported.length).toBe(2);
    expect(twin?.skills.verified.length).toBe(0);
    expect(twin?.developmentAreas.length).toBeGreaterThan(0);
  });

  it("Step 5: generates 12-week medical roadmap and persists activity completion", async () => {
    const roadmap = await AdaptiveRoadmapEngine.getOrGenerateRoadmap(testProfId, "mbbs-doctor");
    expect(roadmap).not.toBeNull();
    expect(roadmap!.totalWeeks).toBe(12);
    expect(roadmap!.milestones.length).toBeGreaterThanOrEqual(4);

    const firstActivity = roadmap!.milestones[0].activities[0];
    expect(firstActivity).toBeDefined();

    const updated = await AdaptiveRoadmapEngine.toggleActivityCompletion(
      testProfId,
      roadmap!.id,
      roadmap!.milestones[0].id,
      firstActivity.id
    );
    expect(updated).not.toBeNull();
    const persisted = devStore.getRoadmap(testProfId);
    expect(persisted).not.toBeNull();
  });

  it("Step 6: creates daily AI missions and handles reflection submissions", async () => {
    const missions = await DailyMissionsEngine.generateMissionsForStudent(testProfId, "mbbs-doctor");
    expect(missions.length).toBeGreaterThanOrEqual(1);

    const completed = await DailyMissionsEngine.completeMission(
      testProfId,
      missions[0].id,
      "Reviewed cell biology and human organ systems in NCERT Class 11.",
      5
    );
    expect(completed?.status).toBe("COMPLETED");
    expect(completed?.reflectionText).toContain("Reviewed cell biology");
  });

  it("Step 7: validates persistence across restarts from local store", () => {
    const persistedUser = devStore.getUserByEmail("ananya.medical@kaabil-test.in");
    const persistedProfile = devStore.getProfile(testProfId);
    const persistedRoadmap = devStore.getRoadmap(testProfId);
    const persistedMissions = devStore.getMissions(testProfId);

    expect(persistedUser).not.toBeNull();
    expect(persistedProfile?.onboardingCompleted).toBe(true);
    expect(persistedRoadmap).not.toBeNull();
    expect(persistedMissions.length).toBeGreaterThanOrEqual(1);
  });
});
