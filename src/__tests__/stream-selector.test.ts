import { describe, it, expect } from "vitest";
import { ALL_CAREERS } from "../data/careersData";

describe("Stream Selection Diagnostic Assistant", () => {
  it("covers all 13 educational streams in career dataset", () => {
    const uniqueStreams = new Set(ALL_CAREERS.map((c) => c.stream));

    const expectedStreams = [
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
      expect(uniqueStreams.has(stream as any)).toBe(true);
    });
  });

  it("ensures each career has valid regulatory authority or statutory standards", () => {
    ALL_CAREERS.forEach((career) => {
      expect(career.regulatoryBody).toBeDefined();
      expect(career.regulatoryBody!.length).toBeGreaterThan(0);
      expect(career.verificationStatus).toBeDefined();
    });
  });

  it("verifies multi-tier compensation ranges exist for all careers", () => {
    ALL_CAREERS.forEach((career) => {
      expect(career.avgStartingSalaryInr).toBeGreaterThan(0);
      expect(career.avgMidCareerSalaryInr).toBeGreaterThanOrEqual(career.avgStartingSalaryInr);
    });
  });
});
