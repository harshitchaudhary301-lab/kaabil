import { describe, it, expect } from "vitest";
import { CareerReadinessEngine, CRI_DISCLAIMER } from "../lib/readiness/cri-engine";

describe("Career Readiness Index (CRI) Engine", () => {
  it("enforces UNASSESSED status with null score when profile does not exist", async () => {
    const result = await CareerReadinessEngine.calculateReadiness("non-existent-student-id");

    expect(result.status).toBe("UNASSESSED");
    expect(result.overallScore).toBeNull();
    expect(result.statusLabel).toContain("Unassessed");
    expect(result.disclaimer).toBeDefined();
    expect(result.disclaimer).toContain("does NOT predict admission probability");
  });

  it("exports official algorithm version v1.0 and disclaimer", () => {
    expect(CareerReadinessEngine.VERSION).toBe("v1.0");
    expect(CRI_DISCLAIMER).toBeDefined();
    expect(CRI_DISCLAIMER).toContain("educational preparation assessment framework");
  });

  it("includes all 5 required preparation dimensions in the breakdown", async () => {
    const result = await CareerReadinessEngine.calculateReadiness("test-id", "ai-systems-engineer");

    expect(result.dimensions.careerKnowledge).toBeDefined();
    expect(result.dimensions.careerKnowledge.weight).toBe(20);

    expect(result.dimensions.educationalPreparation).toBeDefined();
    expect(result.dimensions.educationalPreparation.weight).toBe(25);

    expect(result.dimensions.skillDevelopment).toBeDefined();
    expect(result.dimensions.skillDevelopment.weight).toBe(25);

    expect(result.dimensions.practicalLearning).toBeDefined();
    expect(result.dimensions.practicalLearning.weight).toBe(15);

    expect(result.dimensions.milestoneProgress).toBeDefined();
    expect(result.dimensions.milestoneProgress.weight).toBe(15);

    // Sum of dimension weights must equal 100%
    const totalWeight =
      result.dimensions.careerKnowledge.weight +
      result.dimensions.educationalPreparation.weight +
      result.dimensions.skillDevelopment.weight +
      result.dimensions.practicalLearning.weight +
      result.dimensions.milestoneProgress.weight;
    expect(totalWeight).toBe(100);
  });
});
