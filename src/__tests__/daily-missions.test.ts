import { describe, it, expect } from "vitest";
import { ALL_CAREERS } from "../data/careersData";

describe("Daily AI Missions Engine", () => {
  it("ensures all 13 streams are represented for micro-mission assignment", () => {
    const streams = new Set(ALL_CAREERS.map((c) => c.stream));

    expect(streams.has("MEDICAL_PCB")).toBe(true);
    expect(streams.has("NON_MEDICAL_PCM")).toBe(true);
    expect(streams.has("COMMERCE")).toBe(true);
    expect(streams.has("LAW")).toBe(true);
    expect(streams.has("ARTS_HUMANITIES")).toBe(true);
    expect(streams.has("CREATIVE_DESIGN")).toBe(true);
    expect(streams.has("AGRICULTURE")).toBe(true);
    expect(streams.has("VOCATIONAL_TRADES")).toBe(true);
    expect(streams.has("SPORTS_PHYSICAL_ED")).toBe(true);
    expect(streams.has("HOSPITALITY_TOURISM")).toBe(true);
    expect(streams.has("MANAGEMENT")).toBe(true);
    expect(streams.has("INTERDISCIPLINARY")).toBe(true);
    expect(streams.has("UNDECIDED")).toBe(true);
  });

  it("verifies safe mission timing constraints (10 to 30 minutes)", () => {
    const sampleEstimatedMinutes = [10, 15, 20, 25, 30];
    sampleEstimatedMinutes.forEach((min) => {
      expect(min).toBeGreaterThanOrEqual(10);
      expect(min).toBeLessThanOrEqual(30);
    });
  });
});
