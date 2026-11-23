// ==============================================================================
// KAABIL (काबिल) — Phase 3: Authentic Career Data Integration Test Suite
// Verifies 13 Canonical Streams, Catalog Reconciliation, Authentic Data Enrichment,
// Learning Academy Coverage, and Reusable Import Pipeline.
// ==============================================================================

import { describe, it, expect } from "vitest";
import { CAREER_PATHS_DATABASE, STREAMS_CONFIG, getAllCareers, getCareerBySlug, getCareersByStream } from "@/data/careersData";
import { CURATED_LEARNING_RESOURCES, getCuratedResourcesForCareer } from "@/data/learningResourcesData";
import { CareerRepository } from "@/repositories/career.repository";
import { CareerDataImportPipeline } from "@/lib/data-pipeline/career-import-pipeline";
import { devStore } from "@/lib/dev-store";
import { EducationalStream } from "@/types";

describe("Phase 3: Authentic Career Data Integration", () => {
  // ---------------------------------------------------------------------------
  // 1. Catalog Reconciliation & 13 Canonical Streams Integrity
  // ---------------------------------------------------------------------------
  describe("1. Catalog Reconciliation & 13 Canonical Streams", () => {
    it("recognizes all 13 canonical educational streams in STREAMS_CONFIG", () => {
      const canonicalStreams: EducationalStream[] = [
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
      for (const streamCode of canonicalStreams) {
        const found = STREAMS_CONFIG.find((s) => s.stream === streamCode);
        expect(found).toBeDefined();
        expect(found?.title).toBeTruthy();
        expect(found?.hindiTitle).toBeTruthy();
        expect(found?.topCareers.length).toBeGreaterThan(0);
      }
    });

    it("verifies CAREER_PATHS_DATABASE contains 134 authentic pathways with 0 invalid stream mappings", () => {
      expect(CAREER_PATHS_DATABASE.length).toBe(134);

      const validStreams = new Set(STREAMS_CONFIG.map((s) => s.stream));
      for (const career of CAREER_PATHS_DATABASE) {
        expect(validStreams.has(career.stream)).toBe(true);
        expect(career.slug).toBeTruthy();
        expect(career.title).toBeTruthy();
        expect(career.domainName).toBeTruthy();
      }
    });

    it("ensures zero duplicate slugs and zero duplicate titles across the career catalog", () => {
      const slugs = new Set<string>();
      const titles = new Set<string>();

      for (const career of CAREER_PATHS_DATABASE) {
        expect(slugs.has(career.slug)).toBe(false);
        slugs.add(career.slug);

        const normalizedTitle = career.title.toLowerCase().trim();
        expect(titles.has(normalizedTitle)).toBe(false);
        titles.add(normalizedTitle);
      }
    });

    it("validates every career has complete salary, duration, entrance exams, and 4-week roadmap", () => {
      for (const career of CAREER_PATHS_DATABASE) {
        // Salary progression rule
        expect(career.avgStartingSalaryInr).toBeGreaterThan(0);
        expect(career.avgMidCareerSalaryInr).toBeGreaterThan(0);
        expect(career.avgMidCareerSalaryInr).toBeGreaterThanOrEqual(career.avgStartingSalaryInr);
        expect(career.salarySource).toBeTruthy();

        // Duration & Stage
        expect(career.typicalDurationYears).toBeTruthy();
        expect(career.minEducationStage).toBeTruthy();

        // Exams & Roadmap
        expect(career.keyEntranceExams.length).toBeGreaterThanOrEqual(1);
        expect(career.learningRoadmapSample.length).toBeGreaterThanOrEqual(2);

        // Verified source attribution
        expect(career.sources).toBeDefined();
        expect(career.sources!.length).toBeGreaterThanOrEqual(1);
        expect(career.lastReviewedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Learning Academy Coverage across all streams
  // ---------------------------------------------------------------------------
  describe("2. Learning Academy Coverage & Multi-Stream Enrichment", () => {
    it("provides curated authentic public learning resources across all 13 streams", () => {
      expect(CURATED_LEARNING_RESOURCES.length).toBeGreaterThanOrEqual(40);

      for (const streamConfig of STREAMS_CONFIG) {
        const streamResources = CURATED_LEARNING_RESOURCES.filter(
          (r) => r.stream === streamConfig.stream
        );
        expect(
          streamResources.length,
          `Stream ${streamConfig.stream} should have at least 2 verified learning resources`
        ).toBeGreaterThanOrEqual(2);

        for (const res of streamResources) {
          expect(res.url).toMatch(/^https?:\/\//);
          expect(res.title.length).toBeGreaterThan(3);
          expect(res.provider.length).toBeGreaterThan(2);
          expect(res.isFree).toBe(true);
        }
      }
    });

    it("verifies specific coverage for previously under-served streams: Law, Agriculture, Sports, Hospitality, Interdisciplinary", () => {
      const lawRes = CURATED_LEARNING_RESOURCES.filter((r) => r.stream === "LAW");
      expect(lawRes.length).toBeGreaterThanOrEqual(3);
      expect(lawRes.some((r) => r.provider.includes("NLSIU") || r.provider.includes("NLU Delhi"))).toBe(true);

      const agriRes = CURATED_LEARNING_RESOURCES.filter((r) => r.stream === "AGRICULTURE");
      expect(agriRes.length).toBeGreaterThanOrEqual(3);
      expect(agriRes.some((r) => r.provider.includes("ICAR"))).toBe(true);

      const sportsRes = CURATED_LEARNING_RESOURCES.filter((r) => r.stream === "SPORTS_PHYSICAL_ED");
      expect(sportsRes.length).toBeGreaterThanOrEqual(3);
      expect(sportsRes.some((r) => r.provider.includes("LNIPE") || r.provider.includes("SAI"))).toBe(true);

      const hospRes = CURATED_LEARNING_RESOURCES.filter((r) => r.stream === "HOSPITALITY_TOURISM");
      expect(hospRes.length).toBeGreaterThanOrEqual(3);
      expect(hospRes.some((r) => r.provider.includes("NCHMCT") || r.provider.includes("Tourism"))).toBe(true);

      const interRes = CURATED_LEARNING_RESOURCES.filter((r) => r.stream === "INTERDISCIPLINARY");
      expect(interRes.length).toBeGreaterThanOrEqual(3);
      expect(interRes.some((r) => r.provider.includes("ISRO") || r.provider.includes("IIT Madras"))).toBe(true);
    });

    it("ensures undecided students receive neutral exploration tools with ZERO STEM/coding contamination", () => {
      const undecidedResources = getCuratedResourcesForCareer("UNDECIDED");
      expect(undecidedResources.length).toBeGreaterThanOrEqual(3);

      for (const res of undecidedResources) {
        expect(res.stream).toBe("UNDECIDED");
        // Must NOT contain arbitrary coding/software engineering courses
        expect(res.stream).not.toBe("NON_MEDICAL_PCM");
        expect(res.title).not.toMatch(/Python|DSA|React|JavaScript|DBMS|C\+\+/i);
      }

      // Check providers: NCERT, National Career Service, NITI Aayog AIM, Swayam Critical Thinking
      const providers = undecidedResources.map((r) => r.provider);
      expect(providers.some((p) => p.includes("NCERT") || p.includes("National Career Service") || p.includes("NITI Aayog"))).toBe(true);
    });

    it("confirms DevStore provides rich Academy resources across all 13 streams", () => {
      const devStoreResources = devStore.getAcademyResources();
      expect(devStoreResources.length).toBeGreaterThanOrEqual(20);

      for (const s of STREAMS_CONFIG) {
        const streamRes = devStore.getAcademyResources({ stream: s.stream });
        expect(
          streamRes.length,
          `DevStore should contain resources for stream ${s.stream}`
        ).toBeGreaterThanOrEqual(1);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Reusable Import Pipeline (Step 5)
  // ---------------------------------------------------------------------------
  describe("3. Reusable Data Import Pipeline", () => {
    it("runs deterministic dry-run validation on the entire career and resource catalog with 0 errors", async () => {
      const report = await CareerDataImportPipeline.run({ dryRun: true });

      expect(report.success).toBe(true);
      expect(report.isDryRun).toBe(true);
      expect(report.errors.length).toBe(0);
      expect(report.validCareersCount).toBe(134);
      expect(report.invalidCareersCount).toBe(0);
      expect(report.validResourcesCount).toBeGreaterThanOrEqual(40);
      expect(report.totalUniqueSkills).toBeGreaterThanOrEqual(400);
      expect(report.summary.existingStudentProgressPreserved).toBe(true);
    });

    it("validates stream filtering in the import pipeline", async () => {
      const medicalReport = await CareerDataImportPipeline.run({
        dryRun: true,
        targetStream: "MEDICAL_PCB",
      });

      expect(medicalReport.success).toBe(true);
      expect(medicalReport.totalCareersEvaluated).toBe(11);
      expect(medicalReport.validCareersCount).toBe(11);
      expect(medicalReport.streamBreakdown["MEDICAL_PCB"].careersCount).toBe(11);
    });

    it("proves pipeline idempotency: repeated execution yields identical statistics without drift", async () => {
      const run1 = await CareerDataImportPipeline.run({ dryRun: true });
      const run2 = await CareerDataImportPipeline.run({ dryRun: true });

      expect(run1.validCareersCount).toBe(run2.validCareersCount);
      expect(run1.validResourcesCount).toBe(run2.validResourcesCount);
      expect(run1.totalUniqueSkills).toBe(run2.totalUniqueSkills);
      expect(run1.errors.length).toBe(run2.errors.length);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Career Repository & Data Access Consistency
  // ---------------------------------------------------------------------------
  describe("4. Career Repository & Data Access Consistency", () => {
    it("queries careers by stream through CareerRepository and local catalog cleanly", async () => {
      // 1. CareerRepository query (DB or local fallback)
      const pcbResult = await CareerRepository.getCareers({ stream: "MEDICAL_PCB", limit: 50 });
      expect(pcbResult.careers.length).toBeGreaterThanOrEqual(1);
      for (const c of pcbResult.careers) {
        expect(c.stream).toBe("MEDICAL_PCB");
      }

      // 2. Authoritative local catalog verification
      const localPcb = getCareersByStream("MEDICAL_PCB");
      expect(localPcb.length).toBe(11);
      for (const c of localPcb) {
        expect(c.stream).toBe("MEDICAL_PCB");
      }

      const localLaw = getCareersByStream("LAW");
      expect(localLaw.length).toBe(8);
      for (const c of localLaw) {
        expect(c.stream).toBe("LAW");
      }
    });

    it("retrieves career by slug through CareerRepository", async () => {
      const res = await CareerRepository.getCareerBySlug("mbbs-doctor-physician");
      expect(res.data).toBeDefined();
      expect(res.data?.title).toContain("Doctor");
      expect((res.data as any)?.stream).toBe("MEDICAL_PCB");
    });

    it("reports accurate catalogue counts through CareerRepository", async () => {
      const counts = await CareerRepository.getCatalogueCounts();
      expect(counts.totalCareers).toBeGreaterThanOrEqual(13);
      expect(counts.totalStreams).toBe(13);
    });
  });
});
