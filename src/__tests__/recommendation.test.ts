import { describe, it, expect } from "vitest";
import {
  CareerRecommendationEngine,
  StudentProfileContext,
} from "../lib/recommendations/recommendation-engine";
import { ALL_CAREERS } from "../data/careersData";

describe("Deterministic Multi-Factor Recommendation Engine", () => {
  const pcmStudent: StudentProfileContext = {
    id: "student-pcm-1",
    name: "Aarav Sharma",
    educationStage: "CLASS_12",
    primaryStream: "NON_MEDICAL_PCM",
    selectedStreams: ["NON_MEDICAL_PCM"],
    interests: ["Artificial Intelligence", "Robotics", "Algorithms", "Physics"],
    skills: [
      { name: "Python", proficiency: "INTERMEDIATE", isVerified: false },
      { name: "Mathematics", proficiency: "PROFICIENT", isVerified: false },
    ],
    careerGoal: {
      goalType: "TECH_LEADERSHIP",
      targetRole: "AI Systems Engineer",
    },
    learningPreferences: {
      preferredPace: "MODERATE",
      preferredStyle: "PROJECT_BASED",
      weeklyHoursAvailable: 15,
      primaryLanguage: "English",
    },
  };

  const pcbStudent: StudentProfileContext = {
    id: "student-pcb-1",
    name: "Ananya Iyer",
    educationStage: "CLASS_12",
    primaryStream: "MEDICAL_PCB",
    selectedStreams: ["MEDICAL_PCB"],
    interests: ["Medicine", "Surgery", "Human Anatomy", "Biology"],
    skills: [
      { name: "Biology", proficiency: "PROFICIENT", isVerified: false },
      { name: "Chemistry", proficiency: "INTERMEDIATE", isVerified: false },
    ],
    careerGoal: {
      goalType: "CLINICAL_SERVICE",
      targetRole: "Physician",
    },
    learningPreferences: {
      preferredPace: "INTENSIVE",
      preferredStyle: "CLINICAL_PRACTICE",
      weeklyHoursAvailable: 20,
      primaryLanguage: "English",
    },
  };

  it("calculates match score bounded between 0 and 100", () => {
    const aiCareer = ALL_CAREERS.find((c) => c.slug === "ai-systems-engineer")!;
    const report = CareerRecommendationEngine.evaluateCareerCompatibility(pcmStudent, aiCareer);

    expect(report.compatibilityScore).toBeGreaterThanOrEqual(0);
    expect(report.compatibilityScore).toBeLessThanOrEqual(100);
    expect(report.breakdown.interestScore).toBeGreaterThanOrEqual(0);
    expect(report.breakdown.streamScore).toBeGreaterThanOrEqual(0);
    expect(report.breakdown.skillScore).toBeGreaterThanOrEqual(0);
    expect(report.breakdown.goalScore).toBeGreaterThanOrEqual(0);
    expect(report.breakdown.preferenceScore).toBeGreaterThanOrEqual(0);
  });

  it("gives higher score to AI engineer for PCM student than MBBS", () => {
    const aiCareer = ALL_CAREERS.find((c) => c.slug === "ai-systems-engineer")!;
    const mbbsCareer = ALL_CAREERS.find((c) => c.slug === "mbbs-doctor")!;

    const aiReport = CareerRecommendationEngine.evaluateCareerCompatibility(pcmStudent, aiCareer);
    const mbbsReport = CareerRecommendationEngine.evaluateCareerCompatibility(pcmStudent, mbbsCareer);

    expect(aiReport.compatibilityScore).toBeGreaterThan(mbbsReport.compatibilityScore);
    expect(aiReport.breakdown.streamScore).toBe(20); // Max 20 points for stream match
  });

  it("gives higher score to MBBS for PCB student than AI engineer", () => {
    const aiCareer = ALL_CAREERS.find((c) => c.slug === "ai-systems-engineer")!;
    const mbbsCareer = ALL_CAREERS.find((c) => c.slug === "mbbs-doctor")!;

    const aiReport = CareerRecommendationEngine.evaluateCareerCompatibility(pcbStudent, aiCareer);
    const mbbsReport = CareerRecommendationEngine.evaluateCareerCompatibility(pcbStudent, mbbsCareer);

    expect(mbbsReport.compatibilityScore).toBeGreaterThan(aiReport.compatibilityScore);
    expect(mbbsReport.breakdown.streamScore).toBe(20);
  });

  it("ranks recommendations in descending score order", () => {
    const recommendations = CareerRecommendationEngine.getRecommendations(pcmStudent, ALL_CAREERS, 6);

    expect(recommendations.length).toBeLessThanOrEqual(6);
    for (let i = 0; i < recommendations.length - 1; i++) {
      expect(recommendations[i].compatibilityScore).toBeGreaterThanOrEqual(
        recommendations[i + 1].compatibilityScore
      );
    }
  });

  it("handles empty student profile gracefully without NaN or errors", () => {
    const emptyStudent: StudentProfileContext = {
      id: "empty-student",
      name: "Undecided Student",
      educationStage: "CLASS_10",
      primaryStream: "UNDECIDED",
      selectedStreams: [],
      interests: [],
      skills: [],
    };

    const recommendations = CareerRecommendationEngine.getRecommendations(emptyStudent, ALL_CAREERS, 5);
    expect(recommendations.length).toBeGreaterThan(0);
    recommendations.forEach((rec) => {
      expect(Number.isNaN(rec.compatibilityScore)).toBe(false);
      expect(rec.compatibilityScore).toBeGreaterThanOrEqual(0);
    });
  });

  it("provides explainability reasons for top recommendation", () => {
    const recommendations = CareerRecommendationEngine.getRecommendations(pcmStudent, ALL_CAREERS, 3);
    const topRec = recommendations[0];

    expect(topRec.explanationPoints).toBeDefined();
    expect(topRec.explanationPoints.length).toBeGreaterThan(0);
  });
});
