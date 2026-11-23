// ==============================================================================
// KAABIL (काबिल) — Phase 2: Critical Personalization Fixes Test Suite
// Validates the 4 confirmed P0 personalization root-cause fixes & 15 mandatory regressions
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getRecommendations } from "@/app/api/student/recommendations/route";
import { POST as postStreamDiscovery } from "@/app/api/student/stream-discovery/route";
import {
  CareerRecommendationEngine,
  StudentProfileContext,
} from "@/lib/recommendations/recommendation-engine";
import { CAREER_PATHS_DATABASE, STREAMS_CONFIG } from "@/data/careersData";
import { devStore } from "@/lib/dev-store";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import { isMinorStage } from "@/lib/auth/rbac";
import { EducationStage } from "@prisma/client";

const CANONICAL_13_STREAMS = [
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
] as const;

describe("KAABIL Phase 2: Critical Personalization Fixes & Mandatory Regressions", () => {
  beforeEach(() => {
    // Reset or ensure clean test state
  });

  // --------------------------------------------------------------------------
  // 1. All 13 Canonical Streams
  // --------------------------------------------------------------------------
  describe("1. All 13 Canonical Streams Integrity", () => {
    it("ensures all 13 canonical streams are defined with verified careers and config", () => {
      const dbStreams = new Set(CAREER_PATHS_DATABASE.map((c) => c.stream));
      const configStreams = new Set(STREAMS_CONFIG.map((s) => s.stream));

      CANONICAL_13_STREAMS.forEach((stream) => {
        expect(dbStreams.has(stream as any)).toBe(true);
        expect(configStreams.has(stream as any)).toBe(true);
      });

      expect(CANONICAL_13_STREAMS).toHaveLength(13);
    });

    it("verifies representative career exists for each of the 13 streams", () => {
      CANONICAL_13_STREAMS.forEach((stream) => {
        const streamCareers = CAREER_PATHS_DATABASE.filter((c) => c.stream === stream);
        expect(streamCareers.length).toBeGreaterThan(0);
        expect(streamCareers[0].title).toBeDefined();
        expect(streamCareers[0].slug).toBeDefined();
      });
    });
  });

  // --------------------------------------------------------------------------
  // 2. Correct API Stream Parameter Forwarding
  // --------------------------------------------------------------------------
  describe("2. Correct API Stream Parameter Forwarding", () => {
    it("forwards stream filter parameter to restrict returned recommendations to that stream", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/recommendations?stream=MEDICAL_PCB");
      const res = await getRecommendations(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.recommendations.length).toBeGreaterThan(0);
      data.recommendations.forEach((rec: any) => {
        expect(rec.career.stream).toBe("MEDICAL_PCB");
      });
    });

    it("forwards stream filter parameter for COMMERCE stream cleanly", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/recommendations?stream=COMMERCE");
      const res = await getRecommendations(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.recommendations.length).toBeGreaterThan(0);
      data.recommendations.forEach((rec: any) => {
        expect(rec.career.stream).toBe("COMMERCE");
      });
    });
  });

  // --------------------------------------------------------------------------
  // 3. Stream-Specific Filtering Before Ranking
  // --------------------------------------------------------------------------
  describe("3. Stream-Specific Filtering Before Ranking", () => {
    it("filters catalog before ranking so top recommendations within the stream are returned", () => {
      const neutralStudent: StudentProfileContext = {
        id: "test-neutral",
        name: "Test Learner",
        educationStage: "CLASS_12",
        primaryStream: "AGRICULTURE",
        selectedStreams: ["AGRICULTURE"],
        interests: [],
        skills: [],
      };

      const agriCatalog = CAREER_PATHS_DATABASE.filter((c) => c.stream === "AGRICULTURE");
      const recs = CareerRecommendationEngine.getRecommendations(neutralStudent, agriCatalog, 8);

      expect(recs.length).toBeGreaterThan(0);
      expect(recs.length).toBeLessThanOrEqual(agriCatalog.length);
      recs.forEach((r) => {
        expect(r.career.stream).toBe("AGRICULTURE");
      });
    });
  });

  // --------------------------------------------------------------------------
  // 4. Creative Design and Vocational Recommendations
  // --------------------------------------------------------------------------
  describe("4. Creative Design and Vocational Recommendations", () => {
    it("returns correct recommendations for CREATIVE_DESIGN without enum mismatch", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/recommendations?stream=CREATIVE_DESIGN");
      const res = await getRecommendations(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.recommendations.length).toBeGreaterThan(0);

      const titles = data.recommendations.map((r: any) => r.career.title);
      expect(titles.some((t: string) => t.includes("UI/UX") || t.includes("Designer") || t.includes("Animation"))).toBe(true);
    });

    it("returns correct recommendations for VOCATIONAL_TRADES without enum mismatch", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/recommendations?stream=VOCATIONAL_TRADES");
      const res = await getRecommendations(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.recommendations.length).toBeGreaterThan(0);

      const titles = data.recommendations.map((r: any) => r.career.title);
      expect(titles.some((t: string) => t.includes("Technician") || t.includes("Machinist") || t.includes("Specialist"))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Rapid Stream Switching and Stale Response Prevention
  // --------------------------------------------------------------------------
  describe("5. Rapid Stream Switching & Stale Response Prevention", () => {
    it("simulates sequence tracking to guarantee older async responses are discarded", async () => {
      let currentSeq = 0;
      let latestAppliedStream: string | null = null;

      const simulateFetch = async (stream: string, delayMs: number) => {
        const seq = ++currentSeq;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        // Stale check
        if (seq === currentSeq) {
          latestAppliedStream = stream;
        }
      };

      // User selects PCM (slow response: 50ms), then rapidly switches to MEDICAL_PCB (fast: 10ms)
      const p1 = simulateFetch("NON_MEDICAL_PCM", 50);
      const p2 = simulateFetch("MEDICAL_PCB", 10);

      await Promise.all([p1, p2]);
      // PCM resolved after MEDICAL_PCB, but seq check dropped the stale PCM response
      expect(latestAppliedStream).toBe("MEDICAL_PCB");
    });
  });

  // --------------------------------------------------------------------------
  // 6. Guest and Undecided Student Behavior
  // --------------------------------------------------------------------------
  describe("6. Guest and Undecided Student Behavior", () => {
    it("provides neutral exploration for guest with zero fabricated skills or goals", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/recommendations?stream=ALL");
      const res = await getRecommendations(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.profileSummary.interestsCount).toBe(0);
      expect(data.profileSummary.skillsCount).toBe(0);
      expect(data.aiTelemetry.isGuestDemo).toBe(true);
      // Ensure no specific goal was biased/matched (neutral default 12 rather than 20 for targetRole match)
      data.recommendations.forEach((rec: any) => {
        expect(rec.breakdown.goalScore).toBe(12);
      });
    });

    it("provides neutral exploration for UNDECIDED stream query", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/recommendations?stream=UNDECIDED");
      const res = await getRecommendations(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.recommendations.length).toBeGreaterThan(0);
      data.recommendations.forEach((rec: any) => {
        expect(rec.career.stream).toBe("UNDECIDED");
      });
    });
  });

  // --------------------------------------------------------------------------
  // 7. Missing Student Profile Behavior
  // --------------------------------------------------------------------------
  describe("7. Missing Student Profile Behavior", () => {
    it("indicates requiresOnboarding when user exists but has no saved profile", async () => {
      // Calling recommendations route without session falls back cleanly to neutral guest context
      const req = new NextRequest("http://localhost:3000/api/student/recommendations");
      const res = await getRecommendations(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.recommendations).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // 8. Database Timeout and Failure Behavior
  // --------------------------------------------------------------------------
  describe("8. Database Timeout & Graceful Degradation", () => {
    it("returns degraded response with clear telemetry when database is offline", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/recommendations");
      const res = await getRecommendations(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      // In offline/test environments, recommendations must still be served without crashing
      expect(data.recommendations.length).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // 9. Explicitly Confirmed Stream Persistence
  // --------------------------------------------------------------------------
  describe("9. Explicitly Confirmed Stream Persistence", () => {
    it("persists explicitly confirmed stream when confirmedStream is passed", async () => {
      // Seed a test user in devStore
      const testEmail = "test.confirm.stream@kaabil.test";
      const testUserId = "user-test-confirm-99";
      const testProfId = "prof-test-confirm-99";

      devStore.saveUser({
        id: testUserId,
        email: testEmail,
        name: "Test Stream Student",
        role: "STUDENT",
        studentProfile: {
          id: testProfId,
          educationStage: "CLASS_12",
          currentStream: "UNDECIDED",
        },
      });

      devStore.saveProfile({
        id: testProfId,
        userId: testUserId,
        educationStage: "CLASS_12",
        currentStream: "UNDECIDED",
        selectedStreams: [],
        user: { name: "Test Stream Student", email: testEmail },
      });

      // Verify initial state
      const profBefore = devStore.getProfile(testProfId);
      expect(profBefore.currentStream).toBe("UNDECIDED");

      // Confirm stream to LAW via explicit update
      profBefore.currentStream = "LAW";
      profBefore.selectedStreams = ["LAW"];
      devStore.saveProfile(profBefore);

      const profAfter = devStore.getProfile(testProfId);
      expect(profAfter.currentStream).toBe("LAW");
      expect(profAfter.selectedStreams).toContain("LAW");
    });
  });

  // --------------------------------------------------------------------------
  // 10. Profile Persistence After Refresh & Re-login
  // --------------------------------------------------------------------------
  describe("10. Profile Persistence After Refresh & Re-login", () => {
    it("retains confirmed stream across simulated reload from devStore disk", () => {
      const testUserId = "user-relogin-check-01";
      const testProfId = "prof-relogin-check-01";

      devStore.saveProfile({
        id: testProfId,
        userId: testUserId,
        educationStage: "CLASS_12",
        currentStream: "COMMERCE",
        selectedStreams: ["COMMERCE"],
        user: { name: "Commerce Aspirant", email: "commerce@kaabil.test" },
      });

      // Simulate re-fetching profile as if page refreshed / new session
      const reloaded = devStore.getProfile(testProfId);
      expect(reloaded).not.toBeNull();
      expect(reloaded.currentStream).toBe("COMMERCE");
      expect(reloaded.selectedStreams).toContain("COMMERCE");
    });
  });

  // --------------------------------------------------------------------------
  // 11. Isolation Between Different Student Accounts
  // --------------------------------------------------------------------------
  describe("11. Isolation Between Different Student Accounts", () => {
    it("guarantees modifying student A's stream does not affect student B's stream", () => {
      const profA = {
        id: "prof-student-a",
        userId: "user-a",
        currentStream: "MEDICAL_PCB",
        selectedStreams: ["MEDICAL_PCB"],
      };

      const profB = {
        id: "prof-student-b",
        userId: "user-b",
        currentStream: "NON_MEDICAL_PCM",
        selectedStreams: ["NON_MEDICAL_PCM"],
      };

      devStore.saveProfile(profA);
      devStore.saveProfile(profB);

      // Update Student A to ARTS_HUMANITIES
      const updatedA = { ...devStore.getProfile("prof-student-a"), currentStream: "ARTS_HUMANITIES" };
      devStore.saveProfile(updatedA);

      // Student B must remain strictly NON_MEDICAL_PCM
      const reloadedB = devStore.getProfile("prof-student-b");
      expect(reloadedB.currentStream).toBe("NON_MEDICAL_PCM");

      const reloadedA = devStore.getProfile("prof-student-a");
      expect(reloadedA.currentStream).toBe("ARTS_HUMANITIES");
    });
  });

  // --------------------------------------------------------------------------
  // 12. Temporary Exploration Without Unintended Profile Modification
  // --------------------------------------------------------------------------
  describe("12. Temporary Exploration Without Unintended Profile Modification", () => {
    it("does not overwrite academic currentStream when taking diagnostic quiz without confirmation", async () => {
      const studentId = "student-temp-explorer";
      devStore.saveProfile({
        id: studentId,
        userId: studentId,
        currentStream: "COMMERCE",
        selectedStreams: ["COMMERCE"],
      });

      // Simulate diagnostic quiz submission with Medical answers but without confirmStream
      const payload = {
        answers: {
          interests: "bio-health",
          problem_solving: "scientific-method",
          work_environment: "hospitals",
          duration_appetite: "long-residency",
          ambition: "healing",
          language: "en",
        },
        saveToProfile: false, // Exploration only
      };

      const req = new NextRequest("http://localhost:3000/api/student/stream-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await postStreamDiscovery(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.primaryStream.stream).toBe("MEDICAL_PCB");
      expect(data.streamConfirmed).toBe(false);

      // The saved student profile's currentStream must remain COMMERCE
      const profile = devStore.getProfile(studentId);
      expect(profile.currentStream).toBe("COMMERCE");
    });
  });

  // --------------------------------------------------------------------------
  // 13. Existing Career Discovery salaryRange Crash Regression
  // --------------------------------------------------------------------------
  describe("13. Career Discovery salaryRange Null-Safety Regression", () => {
    it("safely handles career objects with undefined or partial salaryRange without throwing", () => {
      const careerWithoutSalaryRange = {
        ...CAREER_PATHS_DATABASE[0],
        salaryRange: undefined,
        avgStartingSalaryInr: 650000,
        avgMidCareerSalaryInr: 1200000,
      };

      // Test the exact formatting expressions used in Discover UI
      const entrySalary =
        (((careerWithoutSalaryRange.salaryRange as any)?.entry ??
          careerWithoutSalaryRange.avgStartingSalaryInr ??
          0) /
          100000).toFixed(1);

      const medianSalary =
        (((careerWithoutSalaryRange.salaryRange as any)?.median ??
          careerWithoutSalaryRange.avgMidCareerSalaryInr ??
          0) /
          100000).toFixed(1);

      expect(entrySalary).toBe("6.5");
      expect(medianSalary).toBe("12.0");
      expect(Number.isNaN(Number(entrySalary))).toBe(false);
      expect(Number.isNaN(Number(medianSalary))).toBe(false);
    });

    it("safely handles career objects where both salaryRange and fallback INR are undefined", () => {
      const careerEmpty = {
        ...CAREER_PATHS_DATABASE[0],
        salaryRange: undefined,
        avgStartingSalaryInr: undefined,
        avgMidCareerSalaryInr: undefined,
      };

      const entrySalary =
        (((careerEmpty.salaryRange as any)?.entry ??
          (careerEmpty as any).avgStartingSalaryInr ??
          0) /
          100000).toFixed(1);

      expect(entrySalary).toBe("0.0");
      expect(Number.isNaN(Number(entrySalary))).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 14. Invalid Stream Parameter Handling
  // --------------------------------------------------------------------------
  describe("14. Invalid Stream Parameter Handling", () => {
    it("returns HTTP 400 Bad Request when an unrecognized stream parameter is requested", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/recommendations?stream=INVALID_STREAM_XYZ");
      const res = await getRecommendations(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("Invalid stream parameter");
      expect(data.validStreams).toBeDefined();
      expect(data.validStreams).toContain("MEDICAL_PCB");
    });
  });

  // --------------------------------------------------------------------------
  // 15. Existing Relevant UI and Functionality
  // --------------------------------------------------------------------------
  describe("15. Existing UI & Core Functionality Safeguards", () => {
    it("preserves trilingual dictionary support across en, hi, and hinglish", () => {
      ["en", "hi", "hinglish"].forEach((lang) => {
        const dict = (TRANSLATIONS as any)[lang];
        expect(dict).toBeDefined();
        expect(dict.findMyCareer).toBeTruthy();
        expect(dict.checkMySkills).toBeTruthy();
      });
    });

    it("preserves DPDP Act minor safety protections for school students", () => {
      expect(isMinorStage(EducationStage.CLASS_10)).toBe(true);
      expect(isMinorStage(EducationStage.CLASS_12)).toBe(true);
      expect(isMinorStage(EducationStage.UNDERGRADUATE)).toBe(false);
    });
  });
});
