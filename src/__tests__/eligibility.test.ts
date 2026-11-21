import { describe, it, expect } from "vitest";
import { CareerEligibilityChecker } from "../lib/eligibility/eligibility-checker";
import { getCareerBySlug } from "../data/careersData";

describe("Career Educational Eligibility Checker", () => {
  const mbbs = getCareerBySlug("mbbs-doctor")!;
  const aiEngineer = getCareerBySlug("ai-systems-engineer")!;
  const ca = getCareerBySlug("chartered-accountant-icai")!;

  it("identifies prerequisite gap for Class 10 student applying for MBBS", () => {
    const result = CareerEligibilityChecker.evaluate(
      {
        educationStage: "CLASS_10",
        stream: "UNDECIDED",
        age: 15,
      },
      {
        slug: mbbs.slug,
        title: mbbs.title,
        minEducationStage: mbbs.minEducationStage,
        regulatoryBody: mbbs.regulatoryBody,
        stream: mbbs.stream,
        typicalDurationYears: mbbs.typicalDurationYears.toString(),
        keyEntranceExams: mbbs.keyEntranceExams,
      }
    );

    expect(result.status).toBe("ADDITIONAL_QUALIFICATION_REQUIRED");
    expect(result.isEligibleToApply).toBe(false);
    expect(result.missingPrerequisites.length).toBeGreaterThan(0);
    expect(result.missingPrerequisites.some((m) => m.includes("Class 12"))).toBe(true);
    expect(result.suggestedBridgePathways.length).toBeGreaterThan(0);
  });

  it("satisfies prerequisites for Class 12 PCB student with Physics, Chemistry, Biology and Age 18 applying for MBBS", () => {
    const result = CareerEligibilityChecker.evaluate(
      {
        educationStage: "CLASS_12",
        stream: "MEDICAL_PCB",
        subjects: ["Physics", "Chemistry", "Biology", "English"],
        age: 18,
      },
      {
        slug: mbbs.slug,
        title: mbbs.title,
        minEducationStage: mbbs.minEducationStage,
        regulatoryBody: mbbs.regulatoryBody,
        stream: mbbs.stream,
        typicalDurationYears: mbbs.typicalDurationYears.toString(),
        keyEntranceExams: mbbs.keyEntranceExams,
      }
    );

    expect(result.status).toBe("KNOWN_PREREQUISITES_SATISFIED");
    expect(result.isEligibleToApply).toBe(true);
    expect(result.missingPrerequisites.length).toBe(0);
    expect(result.satisfiedPrerequisites.some((s) => s.includes("NEET-UG"))).toBe(true);
  });

  it("detects age prerequisite violation for NEET-UG when candidate is under 17", () => {
    const result = CareerEligibilityChecker.evaluate(
      {
        educationStage: "CLASS_12",
        stream: "MEDICAL_PCB",
        subjects: ["Physics", "Chemistry", "Biology"],
        age: 16, // Under NMC minimum 17 years requirement
      },
      {
        slug: mbbs.slug,
        title: mbbs.title,
        minEducationStage: mbbs.minEducationStage,
        regulatoryBody: mbbs.regulatoryBody,
        stream: mbbs.stream,
        typicalDurationYears: mbbs.typicalDurationYears.toString(),
        keyEntranceExams: mbbs.keyEntranceExams,
      }
    );

    expect(result.status).toBe("ADDITIONAL_QUALIFICATION_REQUIRED");
    expect(result.missingPrerequisites.some((m) => m.includes("17 years"))).toBe(true);
  });

  it("validates PCM student eligibility for AI Systems Engineering", () => {
    const result = CareerEligibilityChecker.evaluate(
      {
        educationStage: "CLASS_12",
        stream: "NON_MEDICAL_PCM",
        subjects: ["Physics", "Mathematics", "Chemistry"],
        age: 18,
      },
      {
        slug: aiEngineer.slug,
        title: aiEngineer.title,
        minEducationStage: aiEngineer.minEducationStage,
        regulatoryBody: aiEngineer.regulatoryBody,
        stream: aiEngineer.stream,
        typicalDurationYears: aiEngineer.typicalDurationYears.toString(),
        keyEntranceExams: aiEngineer.keyEntranceExams,
      }
    );

    expect(result.status).toBe("KNOWN_PREREQUISITES_SATISFIED");
    expect(result.isEligibleToApply).toBe(true);
  });

  it("includes regulatory disclaimer preventing guarantee of admission", () => {
    const result = CareerEligibilityChecker.evaluate(
      {
        educationStage: "CLASS_12",
        stream: "COMMERCE",
        subjects: ["Accountancy", "Economics"],
      },
      {
        slug: ca.slug,
        title: ca.title,
        minEducationStage: ca.minEducationStage,
        regulatoryBody: ca.regulatoryBody,
        stream: ca.stream,
        typicalDurationYears: ca.typicalDurationYears.toString(),
        keyEntranceExams: ca.keyEntranceExams,
      }
    );

    expect(result.regulatoryDisclaimer).toBeDefined();
    expect(result.regulatoryDisclaimer).toContain("does not guarantee");
  });
});
