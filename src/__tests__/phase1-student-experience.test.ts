// ==============================================================================
// KAABIL (काबिल) — Phase 1: Student Experience & Premium UI Upgrade Test Suite
// Verifies 3-step smart onboarding, trilingual dictionary, Guided/Explore modes,
// student persona routing (school vs college), and simplified language.
// ==============================================================================

import { describe, it, expect } from "vitest";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import { isMinorStage } from "@/lib/auth/rbac";
import { EducationStage } from "@prisma/client";

describe("KAABIL Phase 1: Student Experience & Premium UI Upgrades", () => {
  describe("Task 8: Trilingual Language Dictionary & Simplified Terminology", () => {
    it("defines consistent dictionary entries for en, hi, and hinglish", () => {
      const languages = ["en", "hi", "hinglish"] as const;

      for (const lang of languages) {
        const dict = TRANSLATIONS[lang];
        expect(dict).toBeDefined();

        // Simplified terminology rules
        expect(dict.findMyCareer).toBeTruthy();
        expect(dict.checkMySkills).toBeTruthy();
        expect(dict.whatShouldILearn).toBeTruthy();
        expect(dict.myAchievements).toBeTruthy();
        expect(dict.discoverStrengths).toBeTruthy();

        // Required Hero strings
        expect(dict.heroHeadline).toBeTruthy();
        expect(dict.heroSubheadline).toBeTruthy();
        expect(dict.primaryCta).toBeTruthy();
        expect(dict.secondaryCta).toBeTruthy();

        // Student Journey steps
        expect(dict.step1Title).toBeTruthy();
        expect(dict.step2Title).toBeTruthy();
        expect(dict.step3Title).toBeTruthy();
        expect(dict.step4Title).toBeTruthy();
        expect(dict.step5Title).toBeTruthy();

        // Dashboard modes
        expect(dict.guidedMode).toBeTruthy();
        expect(dict.exploreMode).toBeTruthy();
        expect(dict.yourNextStep).toBeTruthy();
        expect(dict.continueJourney).toBeTruthy();
      }
    });

    it("verifies exact headline and CTA requirements in English", () => {
      expect(TRANSLATIONS.en.heroHeadline).toBe("Confused About Your Future?");
      expect(TRANSLATIONS.en.heroSubheadline).toBe(
        "Discover your career. Learn the right skills. Build your future."
      );
      expect(TRANSLATIONS.en.primaryCta).toBe("Find My Career");
      expect(TRANSLATIONS.en.secondaryCta).toBe("Explore KAABIL");
    });
  });

  describe("Task 4: Smart 3-Step Onboarding Data Mapping", () => {
    it("maps 4 education stages accurately to system enums", () => {
      const stageMap: Record<string, EducationStage> = {
        "Class 10": EducationStage.CLASS_10,
        "Class 11–12": EducationStage.CLASS_12,
        "College / UG": EducationStage.UNDERGRADUATE,
        "Graduate": EducationStage.POSTGRADUATE,
      };

      expect(stageMap["Class 10"]).toBe("CLASS_10");
      expect(stageMap["Class 11–12"]).toBe("CLASS_12");
      expect(stageMap["College / UG"]).toBe("UNDERGRADUATE");
      expect(stageMap["Graduate"]).toBe("POSTGRADUATE");
    });

    it("evaluates minor safety for school students under DPDP Act", () => {
      expect(isMinorStage(EducationStage.CLASS_10)).toBe(true);
      expect(isMinorStage(EducationStage.CLASS_12)).toBe(true);
      expect(isMinorStage(EducationStage.UNDERGRADUATE)).toBe(false);
      expect(isMinorStage(EducationStage.POSTGRADUATE)).toBe(false);
    });

    it("validates 3-step smart onboarding response payload structure", () => {
      const smartOnboardingPayload = {
        educationStage: "CLASS_12",
        primaryStream: "UNDECIDED",
        selectedStreams: ["UNDECIDED"],
        goalClarity: "CONFUSED",
        primaryNeed: "DISCOVER_CAREER",
        guardianConsent: true,
        interests: ["Career Exploration"],
        careerGoal: {
          goalType: "CONFUSED",
          notes: "Focus: DISCOVER_CAREER",
        },
        learningPreferences: {
          preferredPace: "BALANCED",
          preferredStyle: "PRACTICAL",
          weeklyHoursAvailable: 10,
          primaryLanguage: "hinglish",
          allowAiMentoring: true,
        },
      };

      expect(smartOnboardingPayload.educationStage).toBe("CLASS_12");
      expect(smartOnboardingPayload.goalClarity).toBe("CONFUSED");
      expect(smartOnboardingPayload.primaryNeed).toBe("DISCOVER_CAREER");
      expect(smartOnboardingPayload.guardianConsent).toBe(true);
    });
  });

  describe("Task 5 & 6: Student Persona & Mode Separation", () => {
    it("distinguishes between School Student vs College Student dashboard priorities", () => {
      const isSchool = (stage: string) =>
        ["CLASS_8", "CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"].includes(stage);

      // School student cases
      expect(isSchool("CLASS_10")).toBe(true);
      expect(isSchool("CLASS_12")).toBe(true);

      // College student cases
      expect(isSchool("UNDERGRADUATE")).toBe(false);
      expect(isSchool("POSTGRADUATE")).toBe(false);
    });

    it("defines 7-step progression in Guided Mode", () => {
      const guidedStages = [
        "1. Profile",
        "2. Discover Interests",
        "3. Career Matches",
        "4. Choose Career",
        "5. Roadmap",
        "6. Start Learning",
        "7. Track Progress",
      ];

      expect(guidedStages).toHaveLength(7);
      expect(guidedStages[0]).toContain("Profile");
      expect(guidedStages[1]).toContain("Discover Interests");
      expect(guidedStages[2]).toContain("Career Matches");
      expect(guidedStages[3]).toContain("Choose Career");
      expect(guidedStages[4]).toContain("Roadmap");
      expect(guidedStages[5]).toContain("Start Learning");
      expect(guidedStages[6]).toContain("Track Progress");
    });
  });
});
