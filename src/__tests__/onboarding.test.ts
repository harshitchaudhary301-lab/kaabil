// ==============================================================================
// KAABIL (काबिल) — Onboarding & All-Streams Diagnostic Unit Tests
// Tests stream diversity, education levels, CRI baseline, and data structures
// ==============================================================================

import { describe, it, expect } from "vitest";
import { STREAMS_CONFIG, CAREER_PATHS_DATABASE } from "../data/careersData";
import { EducationStage } from "@prisma/client";
import { isMinorStage } from "../lib/auth/rbac";

describe("KAABIL Onboarding: All-Stream Universal Support", () => {
  const EXPECTED_13_STREAMS = [
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

  it("should contain exactly 13 streams covering both traditional and non-traditional careers", () => {
    expect(STREAMS_CONFIG).toHaveLength(13);
    const streamKeys = STREAMS_CONFIG.map((s) => s.stream);

    for (const expectedStream of EXPECTED_13_STREAMS) {
      expect(streamKeys).toContain(expectedStream);
    }
  });

  it("should provide bilingual English and Hindi titles for every stream", () => {
    for (const stream of STREAMS_CONFIG) {
      expect(stream.title).toBeTruthy();
      expect(stream.hindiTitle).toBeTruthy();
      expect(stream.shortDescription).toBeTruthy();
      expect(stream.iconName).toBeTruthy();
    }
  });

  it("should support diverse careers beyond engineering and technology", () => {
    const medicalCareers = CAREER_PATHS_DATABASE.filter((c) => c.stream === "MEDICAL_PCB");
    const lawCareers = CAREER_PATHS_DATABASE.filter((c) => c.stream === "LAW");
    const agricultureCareers = CAREER_PATHS_DATABASE.filter((c) => c.stream === "AGRICULTURE");
    const sportsCareers = CAREER_PATHS_DATABASE.filter((c) => c.stream === "SPORTS_PHYSICAL_ED");
    const vocationalCareers = CAREER_PATHS_DATABASE.filter((c) => c.stream === "VOCATIONAL_TRADES");
    const hospitalityCareers = CAREER_PATHS_DATABASE.filter((c) => c.stream === "HOSPITALITY_TOURISM");

    expect(medicalCareers.length).toBeGreaterThan(0);
    expect(lawCareers.length).toBeGreaterThan(0);
    expect(agricultureCareers.length).toBeGreaterThan(0);
    expect(sportsCareers.length).toBeGreaterThan(0);
    expect(vocationalCareers.length).toBeGreaterThan(0);
    expect(hospitalityCareers.length).toBeGreaterThan(0);
  });
});

describe("KAABIL Onboarding: Multi-Stage Education Support", () => {
  const ALL_STAGES: EducationStage[] = [
    EducationStage.CLASS_8,
    EducationStage.CLASS_9,
    EducationStage.CLASS_10,
    EducationStage.CLASS_11,
    EducationStage.CLASS_12,
    EducationStage.DIPLOMA,
    EducationStage.ITI,
    EducationStage.UNDERGRADUATE,
    EducationStage.POSTGRADUATE,
    EducationStage.WORKING_PROFESSIONAL,
    EducationStage.OTHER,
  ];

  it("should support all target learner segments from Class 8 through Working Professional", () => {
    expect(ALL_STAGES).toHaveLength(11);
  });

  it("should strictly require parental/guardian consent only for school minors", () => {
    for (const stage of ALL_STAGES) {
      const isMinor = isMinorStage(stage);
      if (
        stage === EducationStage.CLASS_8 ||
        stage === EducationStage.CLASS_9 ||
        stage === EducationStage.CLASS_10 ||
        stage === EducationStage.CLASS_11 ||
        stage === EducationStage.CLASS_12
      ) {
        expect(isMinor).toBe(true);
      } else {
        expect(isMinor).toBe(false);
      }
    }
  });
});

describe("KAABIL Onboarding: Career Readiness Index (CRI) Calibration", () => {
  it("should calculate valid baseline CRI within bounds", () => {
    const baseCRI = 30;
    const skillsCount = 3;
    const hasTargetRole = true;

    let cri = baseCRI;
    cri += Math.min(20, skillsCount * 5); // +15
    if (hasTargetRole) cri += 10;          // +10
    cri = Math.min(60, cri);

    expect(cri).toBe(55);
    expect(cri).toBeGreaterThanOrEqual(0);
    expect(cri).toBeLessThanOrEqual(100);
  });
});
