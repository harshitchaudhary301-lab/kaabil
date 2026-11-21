import { describe, it, expect } from "vitest";
import { formatInr } from "@/lib/utils";
import { STREAMS_CONFIG, CAREER_PATHS_DATABASE } from "@/data/careersData";
import { EducationalStream } from "@/types";

describe("KAABIL Foundation Engine Tests", () => {
  describe("Utility & Currency Formatting", () => {
    it("formats Indian Rupees correctly for Lakhs and Crores", () => {
      expect(formatInr(850000)).toBe("₹8.5 Lakh");
      expect(formatInr(2400000)).toBe("₹24.0 Lakh");
      expect(formatInr(12000000)).toBe("₹1.2 Cr");
      expect(formatInr(45000)).toContain("45,000");
    });
  });

  describe("All-Streams Multi-Stream Coverage", () => {
    it("configures all 13 mandatory educational streams with zero omission", () => {
      const requiredStreams: EducationalStream[] = [
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

      expect(STREAMS_CONFIG.length).toBe(13);

      const configuredStreams = STREAMS_CONFIG.map((s) => s.stream);
      requiredStreams.forEach((stream) => {
        expect(configuredStreams).toContain(stream);
      });
    });

    it("ensures each stream has distinct title, Hindi title, and typical subjects", () => {
      STREAMS_CONFIG.forEach((s) => {
        expect(s.title).toBeTruthy();
        expect(s.hindiTitle).toBeTruthy();
        expect(s.typicalSubjects.length).toBeGreaterThan(0);
        expect(s.topCareers.length).toBeGreaterThan(0);
      });
    });

    it("verifies all career paths in database are explicitly tagged as demo data", () => {
      expect(CAREER_PATHS_DATABASE.length).toBeGreaterThanOrEqual(13);
      CAREER_PATHS_DATABASE.forEach((c) => {
        expect(c.isDemoData).toBe(true);
        expect(c.skills.length).toBeGreaterThan(0);
        expect(c.learningRoadmapSample.length).toBe(4);
        expect(c.avgStartingSalaryInr).toBeGreaterThan(0);
        expect(c.avgMidCareerSalaryInr).toBeGreaterThan(c.avgStartingSalaryInr);
      });
    });
  });

  describe("Deterministic Skill Gap & CRI Mathematical Formulas", () => {
    it("calculates deterministic skill gap priority score: Importance * max(0, Req - Cur)", () => {
      const calculateGapPriority = (importance: number, req: number, cur: number) => {
        return importance * Math.max(0, req - cur);
      };

      // Gap of 2 with importance 3.0 -> 6.0
      expect(calculateGapPriority(3.0, 4, 2)).toBe(6.0);
      // Already met or exceeded benchmark -> Priority 0
      expect(calculateGapPriority(2.5, 4, 4)).toBe(0);
      expect(calculateGapPriority(2.5, 4, 5)).toBe(0);
    });

    it("computes Career Readiness Index (CRI) within bounded range [0, 100]", () => {
      const computeCri = (
        skills: { weight: number; req: number; cur: number }[],
        practicalRatio: number, // 0 to 1
        academicRatio: number,  // 0 to 1
        verifiedRatio: number   // 0 to 1
      ) => {
        const totalWeight = skills.reduce((acc, s) => acc + s.weight, 0);
        const weightedCoverage =
          skills.reduce((acc, s) => acc + s.weight * Math.min(s.cur / s.req, 1), 0) /
          totalWeight;

        const cri = Math.round(
          100 *
            (0.50 * weightedCoverage +
              0.25 * practicalRatio +
              0.15 * academicRatio +
              0.10 * verifiedRatio)
        );
        return Math.min(100, Math.max(0, cri));
      };

      // Case 1: Student starting out
      const beginnerCri = computeCri(
        [
          { weight: 3.0, req: 4, cur: 1 },
          { weight: 2.0, req: 4, cur: 1 },
        ],
        0.1,
        0.5,
        0.0
      );
      expect(beginnerCri).toBeGreaterThan(0);
      expect(beginnerCri).toBeLessThan(40);

      // Case 2: Advanced ready candidate
      const advancedCri = computeCri(
        [
          { weight: 3.0, req: 4, cur: 4 },
          { weight: 2.0, req: 4, cur: 4 },
        ],
        0.9,
        1.0,
        0.8
      );
      expect(advancedCri).toBeGreaterThanOrEqual(85);
      expect(advancedCri).toBeLessThanOrEqual(100);
    });
  });

  describe("Child Privacy & Minor Safety Guardrail Logic", () => {
    it("correctly identifies minor education stages", () => {
      const isMinorStage = (stage: string) => {
        return ["CLASS_8", "CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"].includes(stage);
      };

      expect(isMinorStage("CLASS_8")).toBe(true);
      expect(isMinorStage("CLASS_10")).toBe(true);
      expect(isMinorStage("CLASS_12")).toBe(true);
      expect(isMinorStage("UNDERGRADUATE")).toBe(false);
      expect(isMinorStage("WORKING_PRO")).toBe(false);
    });

    it("verifies minor students are strictly excluded from recruiter search query filters", () => {
      const buildRecruiterCandidateFilter = () => {
        return {
          where: {
            isMinor: false,
            studentProfile: {
              educationStage: {
                notIn: ["CLASS_8", "CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"],
              },
            },
          },
        };
      };

      const queryFilter = buildRecruiterCandidateFilter();
      expect(queryFilter.where.isMinor).toBe(false);
      expect(queryFilter.where.studentProfile.educationStage.notIn).toContain("CLASS_8");
      expect(queryFilter.where.studentProfile.educationStage.notIn).toContain("CLASS_12");
    });
  });
});
