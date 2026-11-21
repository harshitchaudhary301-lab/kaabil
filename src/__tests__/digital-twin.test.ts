import { describe, it, expect } from "vitest";
import { CareerDigitalTwinService, DIGITAL_TWIN_DISCLAIMER } from "../lib/digital-twin/digital-twin-service";

describe("Career Digital Twin Service", () => {
  it("exports official algorithm version and disclaimer", () => {
    expect(CareerDigitalTwinService.ALGORITHM_VERSION).toBe("v1.0");
    expect(DIGITAL_TWIN_DISCLAIMER).toBeDefined();
    expect(DIGITAL_TWIN_DISCLAIMER).toContain("not a psychometric diagnosis");
    expect(DIGITAL_TWIN_DISCLAIMER).toContain("promise of employment");
  });

  it("handles non-existent student profile gracefully without throwing uncaught exceptions", async () => {
    const twin = await CareerDigitalTwinService.getDigitalTwin("non-existent-profile-id");
    expect(twin).toBeNull();
  });
});
