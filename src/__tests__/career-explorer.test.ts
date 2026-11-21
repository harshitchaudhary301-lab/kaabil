import { describe, it, expect } from "vitest";
import { ALL_CAREERS, getCareerBySlug, searchCareers } from "../data/careersData";

describe("Universal Career Knowledge Explorer", () => {
  it("has unique URL-safe slugs for all career paths", () => {
    const slugs = ALL_CAREERS.map((c) => c.slug);
    const uniqueSlugs = new Set(slugs);

    expect(slugs.length).toBe(uniqueSlugs.size);
    slugs.forEach((slug) => {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it("retrieves career by slug correctly", () => {
    const mbbs = getCareerBySlug("mbbs-doctor");
    expect(mbbs).toBeDefined();
    expect(mbbs?.title).toContain("Doctor");
    expect(mbbs?.stream).toBe("MEDICAL_PCB");
    expect(mbbs?.regulatoryBody).toBe("National Medical Commission (NMC)");

    const nonExistent = getCareerBySlug("invalid-slug-999");
    expect(nonExistent).toBeUndefined();
  });

  it("searches careers by title, stream, and skills", () => {
    const aiResults = searchCareers("AI");
    expect(aiResults.length).toBeGreaterThan(0);
    expect(aiResults.some((c) => c.slug === "ai-systems-engineer")).toBe(true);

    const lawResults = searchCareers("Law");
    expect(lawResults.length).toBeGreaterThan(0);
    expect(lawResults.some((c) => c.stream === "LAW")).toBe(true);
  });

  it("ensures each career contains benchmark skills, duration, and growth outlook", () => {
    ALL_CAREERS.forEach((c) => {
      expect(c.skills.length).toBeGreaterThanOrEqual(3);
      expect(c.typicalDurationYears.length).toBeGreaterThan(0);
      expect(c.growthOutlook.length).toBeGreaterThan(0);
      expect(["Low", "Medium", "High"]).toContain(c.automationRisk);
    });
  });
});
