import { describe, it, expect } from "vitest";
import { StreamRepository } from "@/repositories/stream.repository";
import { CareerRepository } from "@/repositories/career.repository";
import { SkillRepository } from "@/repositories/skill.repository";
import { checkDatabaseConnection } from "@/lib/db";

describe("KAABIL Database & Repository Layer Tests", () => {
  describe("checkDatabaseConnection()", () => {
    it("handles connection probe safely without throwing uncaught exceptions", async () => {
      const status = await checkDatabaseConnection();
      expect(typeof status.connected).toBe("boolean");
      expect(typeof status.message).toBe("string");
      expect(status.message.length).toBeGreaterThan(0);
    });
  });

  describe("StreamRepository", () => {
    it("returns all 13 educational streams with verified metadata", async () => {
      const result = await StreamRepository.getAllStreams();
      expect(result.data.length).toBe(13);
      expect(["database", "local_catalogue"]).toContain(result.source);

      const streamCodes = result.data.map((s) => s.stream);
      expect(streamCodes).toContain("MEDICAL_PCB");
      expect(streamCodes).toContain("NON_MEDICAL_PCM");
      expect(streamCodes).toContain("COMMERCE");
      expect(streamCodes).toContain("ARTS_HUMANITIES");
      expect(streamCodes).toContain("LAW");
      expect(streamCodes).toContain("MANAGEMENT");
      expect(streamCodes).toContain("CREATIVE_DESIGN");
      expect(streamCodes).toContain("AGRICULTURE");
      expect(streamCodes).toContain("VOCATIONAL_TRADES");
      expect(streamCodes).toContain("SPORTS_PHYSICAL_ED");
      expect(streamCodes).toContain("HOSPITALITY_TOURISM");
      expect(streamCodes).toContain("INTERDISCIPLINARY");
      expect(streamCodes).toContain("UNDECIDED");
    });

    it("retrieves single stream details by code", async () => {
      const result = await StreamRepository.getStreamByCode("MEDICAL_PCB");
      expect(result.data).toBeDefined();
    });
  });

  describe("CareerRepository", () => {
    it("queries careers with pagination and returns correct structure", async () => {
      const result = await CareerRepository.getCareers({ page: 1, limit: 5 });
      expect(result.careers.length).toBeLessThanOrEqual(5);
      expect(result.careers.length).toBeGreaterThan(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.total).toBeGreaterThanOrEqual(13);
      expect(result.totalPages).toBeGreaterThanOrEqual(1);
      expect(["database", "local_catalogue"]).toContain(result.source);
    });

    it("filters careers by educational stream", async () => {
      const result = await CareerRepository.getCareers({ stream: "MEDICAL_PCB" });
      expect(result.careers.length).toBeGreaterThan(0);
      result.careers.forEach((c) => {
        expect(c.stream).toBe("MEDICAL_PCB");
      });
    });

    it("searches careers by keyword query", async () => {
      const result = await CareerRepository.getCareers({ search: "Doctor" });
      expect(result.careers.length).toBeGreaterThan(0);
      expect(result.careers[0].title).toContain("Doctor");
    });

    it("retrieves career by slug", async () => {
      const result = await CareerRepository.getCareerBySlug("mbbs-doctor-physician");
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.title).toContain("Doctor");
      }
    });

    it("returns catalogue summary counts", async () => {
      const counts = await CareerRepository.getCatalogueCounts();
      expect(counts.totalCareers).toBeGreaterThanOrEqual(13);
      expect(counts.totalStreams).toBe(13);
    });
  });

  describe("SkillRepository", () => {
    it("retrieves standard competency categories", async () => {
      const result = await SkillRepository.getCategories();
      expect(result.data.length).toBeGreaterThanOrEqual(4);
    });
  });
});
