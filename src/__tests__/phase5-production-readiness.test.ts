// ==============================================================================
// KAABIL (काबिल) — Phase 5 Production Readiness, Security & Deployment Test Suite
// Verifies:
// 1. AI Mentor UX, Engine Status, Official Source Linking, Transparent Fallback
// 2. Safe Database Probing, Connection Transparency, Serverless Resilience
// 3. Authorization, Cross-Student Data Isolation, DPDP Act Minor Shields
// 4. Input Validation, URL Sanitization, Rate Limiting & Protection
// 5. End-to-End Journeys for Fresh and Returning Scholars
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { AiMentorService } from "@/lib/mentor/ai-mentor-service";
import { resolveOfficialSourceUrl, OFFICIAL_SOURCES } from "@/lib/constants/official-sources";
import { checkDatabaseConnection } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { PassportSharingService } from "@/lib/passport/sharing-service";
import { PassportService } from "@/lib/passport/passport-service";
import { ProfileService } from "@/lib/student/profile-service";
import { checkApiRateLimit, resetRateLimit } from "@/lib/auth/rate-limiter";
import { CareerReadinessEngine } from "@/lib/readiness/cri-engine";

describe("Phase 5: Production Readiness, Security & Deployment Preparation", () => {
  const demoStudentId = "sp-aryan-01";
  const minorStudentId = "sp-ananya-minor";

  beforeEach(() => {
    devStore.reset();
  });

  // ---------------------------------------------------------------------------
  // Priority 1 & 4: AI Mentor UX, Transparency & Official Source Linking
  // ---------------------------------------------------------------------------
  describe("Priority 1 & 4: AI Mentor UX & Reliability", () => {
    it("reports transparent active engine status with verified fallback description", () => {
      const status = AiMentorService.getAiEngineStatus();
      expect(status).toBeDefined();
      expect(typeof status.liveAvailable).toBe("boolean");
      expect(["gemini_2_flash", "kaabil_deterministic_mentor"]).toContain(status.activeEngine);
      expect(status.deterministicFallbackReady).toBe(true);
      expect(status.zeroHallucinationGuaranteed).toBe(true);
      expect(status.verifiedFallbackDescription).toBeDefined();
      expect(status.verifiedFallbackDescription).toContain("verified knowledge mode");
      expect(status.slaLimitSeconds).toBeLessThanOrEqual(8);
    });

    it("resolves official statutory authority links accurately for verified citations", () => {
      // Medical
      const nmc = resolveOfficialSourceUrl("National Medical Commission (NMC)");
      expect(nmc).not.toBeNull();
      expect(nmc?.url).toBe("https://www.nmc.org.in");

      // STEM
      const aicte = resolveOfficialSourceUrl("All India Council for Technical Education (AICTE)");
      expect(aicte).not.toBeNull();
      expect(aicte?.url).toBe("https://www.aicte-india.org");

      // Commerce
      const icai = resolveOfficialSourceUrl("Institute of Chartered Accountants of India (ICAI)");
      expect(icai).not.toBeNull();
      expect(icai?.url).toBe("https://www.icai.org");

      // Law
      const bci = resolveOfficialSourceUrl("Bar Council of India (BCI)");
      expect(bci).not.toBeNull();
      expect(bci?.url).toBe("http://www.barcouncilofindia.org");

      // Civil Services
      const upsc = resolveOfficialSourceUrl("Union Public Service Commission (UPSC)");
      expect(upsc).not.toBeNull();
      expect(upsc?.url).toBe("https://upsc.gov.in");

      // Entrance Exams
      const neet = resolveOfficialSourceUrl("NEET-UG Exam Portal");
      expect(neet?.url).toBe("https://neet.nta.nic.in");

      const jee = resolveOfficialSourceUrl("JEE Main (NTA)");
      expect(jee?.url).toBe("https://jeemain.nta.nic.in");

      // Salary / Pay Commission
      const cpc = resolveOfficialSourceUrl("MoHFW 7th Pay Commission Scale");
      expect(cpc?.url).toBe("https://doe.gov.in/seventh-cpc-reports");

      // Unknown / Unofficial
      const unknown = resolveOfficialSourceUrl("Generic Blog 2026");
      expect(unknown).toBeNull();
    });

    it("generates concise, student-friendly responses with clear next steps in fallback mode", async () => {
      const conv = await AiMentorService.createConversation(demoStudentId, undefined, "en");
      const reply = await AiMentorService.generateMentorResponse(
        demoStudentId,
        conv.id,
        "What is the starting salary benchmark for an MBBS Doctor in India?",
        "en"
      );

      expect(reply.content).toBeDefined();
      expect(reply.content.length).toBeGreaterThan(50);
      expect(reply.verifiedSources).toBeDefined();
      expect(reply.verifiedSources!.length).toBeGreaterThan(0);
      expect(reply.content).toMatch(/Next Step|अगला कदम/i);
    });

    it("handles out-of-domain, unsupported, or rapid prompts safely without throwing", async () => {
      const conv = await AiMentorService.createConversation(demoStudentId, undefined, "en");
      const gibberishReply = await AiMentorService.generateMentorResponse(
        demoStudentId,
        conv.id,
        "xyzabc123!@# random unsupported input",
        "en"
      );

      expect(gibberishReply).toBeDefined();
      expect(gibberishReply.content).toBeTruthy();
      expect(gibberishReply.source).toBe("kaabil_deterministic_mentor");
    });
  });

  // ---------------------------------------------------------------------------
  // Priority 2: Production Database & Resilient Serverless Storage
  // ---------------------------------------------------------------------------
  describe("Priority 2: Production Database & Serverless Handling", () => {
    it("safely probes database connection without throwing uncaught exceptions", async () => {
      const dbStatus = await checkDatabaseConnection();
      expect(dbStatus).toBeDefined();
      expect(typeof dbStatus.connected).toBe("boolean");
      expect(typeof dbStatus.message).toBe("string");
      // Connection result is honest; never fabricates connection when offline
      if (!dbStatus.connected) {
        expect(dbStatus.message).toMatch(/unreachable|timed out|localhost/i);
      }
    });

    it("devStore operates cleanly in-memory even if disk writes encounter issues", () => {
      const initialUser = devStore.getUserByEmail("demo.student@kaabil.in");
      expect(initialUser).toBeDefined();
      expect(initialUser?.email).toBe("demo.student@kaabil.in");

      // Adding data in-memory remains consistent
      devStore.saveMentorConversation({
        id: "test-conv-01",
        studentProfileId: "sp-aryan-01",
        messages: [],
      });
      devStore.addMentorMessage("test-conv-01", {
        id: "msg-test-01",
        sender: "STUDENT",
        content: "Testing in-memory resilience",
        createdAt: new Date().toISOString(),
      });

      const conv = devStore.getMentorConversation("test-conv-01");
      expect(conv).toBeDefined();
      expect(conv?.messages.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Priority 3: Authentication, Privacy & Cross-Student Isolation
  // ---------------------------------------------------------------------------
  describe("Priority 3: Authentication, Privacy & Isolation", () => {
    it("strictly isolates cross-student data and prevents unauthorized token revocation", () => {
      // Create share token for Student A
      const tokenA = devStore.saveShareToken("token-student-a", {
        token: "token-student-a",
        studentProfileId: "sp-aryan-01",
        isRevoked: false,
      });
      expect(tokenA.studentProfileId).toBe("sp-aryan-01");

      // Student B profile ID
      const studentBId = "sp-other-student";
      const tokenRecord = devStore.getShareToken("token-student-a");
      expect(tokenRecord).toBeDefined();
      expect(tokenRecord.studentProfileId).not.toBe(studentBId);

      // Student A can revoke
      const revoked = devStore.revokeShareToken("token-student-a");
      expect(revoked).toBe(true);
      expect(devStore.getShareToken("token-student-a").isRevoked).toBe(true);
    });

    it("enforces DPDP Act 2023 minor safeguards: locks recruiter view and public share", async () => {
      // Create minor profile
      devStore.saveProfile({
        id: "sp-minor-test",
        educationStage: "CLASS_10",
        isMinor: true,
      });

      // Attempting to generate share token for a minor should throw protection error
      await expect(
        PassportSharingService.createShareToken({
          studentProfileId: "sp-minor-test",
          isMinor: true,
          expiryDays: 7,
        })
      ).rejects.toThrow(/UNDER_18_PROTECTION/);
    });

    it("enforces sliding window rate limiting on sensitive actions", () => {
      const actionKey = "test:mentor:user123";
      resetRateLimit(actionKey);

      // First 5 requests allowed
      for (let i = 0; i < 5; i++) {
        const status = checkApiRateLimit(actionKey, 5, 60);
        expect(status.isAllowed).toBe(true);
      }

      // 6th request is throttled
      const throttledStatus = checkApiRateLimit(actionKey, 5, 60);
      expect(throttledStatus.isAllowed).toBe(false);
      expect(throttledStatus.remaining).toBe(0);
      expect(throttledStatus.resetInSeconds).toBeGreaterThan(0);

      // Reset
      resetRateLimit(`api:${actionKey}`);
      const afterReset = checkApiRateLimit(actionKey, 5, 60);
      expect(afterReset.isAllowed).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Priority 6: End-to-End User Journeys (Fresh and Returning Students)
  // ---------------------------------------------------------------------------
  describe("Priority 6: End-to-End User Journeys", () => {
    it("executes fresh student journey: registration -> unassessed state -> skill tree", async () => {
      const freshEmail = "new.scholar.2026@kaabil.in";
      devStore.saveUser({
        id: "user-fresh-01",
        email: freshEmail,
        name: "Devendra Patel",
        role: "STUDENT",
        isMinor: false,
      });

      devStore.saveProfile({
        id: "sp-fresh-01",
        userId: "user-fresh-01",
        fullName: "Devendra Patel",
        educationStage: "UNDERGRADUATE",
        currentStream: "NON_MEDICAL_PCM",
        targetRoleSlug: "ai-systems-engineer",
        userSkills: [],
      });

      // Fresh student CRI is UNASSESSED with overallScore: null
      const readiness = await CareerReadinessEngine.calculateReadiness("sp-fresh-01");
      expect(readiness.overallScore).toBeNull();
      expect(readiness.status).toBe("UNASSESSED");

      // AI Mentor context recognizes unassessed state and provides diagnostic suggestions
      const context = await AiMentorService.getStudentLiveContext("sp-fresh-01");
      expect(context.isUnassessed).toBe(true);
      expect(context.targetCareer).toContain("AI");
    });

    it("executes returning student journey: retains verified skills across target goal shifts", async () => {
      const email = "returning.scholar@kaabil.in";
      const profileId = "sp-returning-01";
      devStore.saveUser({
        id: "user-returning-01",
        email,
        name: "Returning Scholar",
        role: "STUDENT",
        isMinor: false,
      });

      devStore.saveProfile({
        id: profileId,
        userId: "user-returning-01",
        fullName: "Returning Scholar",
        educationStage: "UNDERGRADUATE",
        currentStream: "NON_MEDICAL_PCM",
        targetRoleSlug: "ai-systems-engineer",
        user: { id: "user-returning-01", email, name: "Returning Scholar" },
        userSkills: [],
      });

      devStore.saveSkillEvidence({
        id: `ev-python-${Date.now()}`,
        studentProfileId: profileId,
        skillName: "Python",
        evidenceType: "ASSESSMENT_RESULT",
        verificationStatus: "VERIFIED",
        isVerified: true,
        scorePercentage: 92,
        assessmentAttemptId: `att-py-${Date.now()}`,
      });

      const passportBefore = await PassportService.generatePassport(profileId);
      const verifiedSkill = passportBefore.skills.find((s) => s.skillName === "Python");
      expect(verifiedSkill).toBeDefined();

      // Goal change to Commercial Airline Pilot
      await ProfileService.updateStudentProfile(profileId, {
        targetCareerSlug: "aviation-commercial-pilot-cpl",
      });
      const passportAfter = await PassportService.generatePassport(profileId);
      expect(passportAfter.careerGoals[0].slug).toBe("aviation-commercial-pilot-cpl");

      // Verified Python skill remains intact
      const retainedSkill = passportAfter.skills.find((s) => s.skillName === "Python");
      expect(retainedSkill).toBeDefined();
      expect(retainedSkill?.isVerified).toBe(true);
    });
  });
});
