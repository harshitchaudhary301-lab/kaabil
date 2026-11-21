import { describe, it, expect } from "vitest";
import { ALL_CAREERS, getCareerBySlug } from "../data/careersData";

describe("Adaptive Career Roadmap Architecture", () => {
  it("ensures each canonical career path contains sufficient duration and metadata for roadmap generation", () => {
    ALL_CAREERS.forEach((career) => {
      expect(career.slug).toBeDefined();
      expect(career.title).toBeDefined();
      expect(career.stream).toBeDefined();
      expect(career.skills.length).toBeGreaterThan(0);
      expect(career.learningRoadmapSample.length).toBeGreaterThanOrEqual(4);
    });
  });

  it("verifies Medical, Commerce, Law, and STEM careers have distinct stream-specific milestones", () => {
    const mbbs = getCareerBySlug("mbbs-doctor")!;
    const ca = getCareerBySlug("chartered-accountant-icai")!;
    const law = getCareerBySlug("corporate-lawyer-mna")!;
    const ai = getCareerBySlug("ai-systems-engineer")!;

    // Medical sample must focus on medical sciences
    const medicalFocus = mbbs.learningRoadmapSample.map((m) => m.title.toLowerCase()).join(" ");
    expect(medicalFocus).toContain("anatomy");

    // Commerce sample must focus on accounting / financial audit
    const commerceFocus = ca.learningRoadmapSample.map((m) => m.title.toLowerCase()).join(" ");
    expect(commerceFocus).toContain("audit");

    // Law sample must focus on legal jurisprudence / constitutional law
    const lawFocus = law.learningRoadmapSample.map((m) => m.title.toLowerCase()).join(" ");
    expect(lawFocus).toContain("contract");

    // AI sample must focus on programming / algorithms
    const aiFocus = ai.learningRoadmapSample.map((m) => m.title.toLowerCase()).join(" ");
    expect(aiFocus).toContain("transformer");
  });
});
