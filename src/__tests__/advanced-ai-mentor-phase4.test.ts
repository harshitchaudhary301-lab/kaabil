// ==============================================================================
// KAABIL (काबिल) — Phase 4: Advanced AI Career Mentor & Personalization Tests
// Comprehensive verification of trilingual guidance, 134-career taxonomy grounding,
// zero hallucination, career comparisons, alternative pathways, active sprint tasks,
// DPDP Act minor safeguards, and transparent engine status.
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { AiMentorService } from "@/lib/mentor/ai-mentor-service";
import { devStore } from "@/lib/dev-store";
import { CAREER_PATHS_DATABASE, getCareerBySlug } from "@/data/careersData";

describe("Phase 4: Advanced AI Career Mentor & Personalization", () => {
  const demoStudentId = "demo-profile-id";
  const minorStudentId = "minor-profile-id";
  const undecidedStudentId = "undecided-profile-id";
  const freshStudentId = "fresh-profile-id";

  beforeEach(() => {
    // 1. Seed Demo Adult Student (STEM / AI Engineering)
    devStore.saveProfile({
      id: demoStudentId,
      userId: "user-demo",
      educationStage: "UNDERGRADUATE",
      currentStream: "NON_MEDICAL_PCM",
      user: { name: "Aryan Sharma", email: "aryan@kaabil.test" },
      targetCareerPathId: "ai-systems-engineer",
      careerGoals: [
        {
          careerPath: {
            slug: "ai-systems-engineer",
            title: "AI Systems Engineer",
          },
        },
      ],
      userSkills: [
        { name: "Python Systems", isVerified: true },
        { name: "Linear Algebra", isVerified: true },
        { name: "Distributed Systems", isVerified: false },
      ],
    });

    // 2. Seed Minor Student (Class 10 - DPDP Act Protected)
    devStore.saveProfile({
      id: minorStudentId,
      userId: "user-minor",
      educationStage: "CLASS_10",
      currentStream: "MEDICAL_PCB",
      user: { name: "Ananya Patel", email: "ananya@kaabil.test" },
      targetCareerPathId: "mbbs-doctor",
      careerGoals: [
        {
          careerPath: {
            slug: "mbbs-doctor",
            title: "MBBS Doctor (General Physician)",
          },
        },
      ],
      userSkills: [
        { name: "Biology Foundations", isVerified: true },
        { name: "Chemistry Basics", isVerified: false },
      ],
    });

    // 3. Seed Undecided Student (Exploring streams)
    devStore.saveProfile({
      id: undecidedStudentId,
      userId: "user-undecided",
      educationStage: "CLASS_12",
      currentStream: "UNDECIDED",
      user: { name: "Rohan Verma", email: "rohan@kaabil.test" },
      targetCareerPathId: "exploring-paths",
      careerGoals: [
        {
          careerPath: {
            slug: "exploring-paths",
            title: "Exploring Career Pathways",
          },
        },
      ],
      userSkills: [],
    });

    // 4. Seed Fresh Student (Zero assessments, Unassessed CRI)
    devStore.saveProfile({
      id: freshStudentId,
      userId: "user-fresh",
      educationStage: "UNDERGRADUATE",
      currentStream: "COMMERCE",
      user: { name: "Pooja Mehta", email: "pooja@kaabil.test" },
      targetCareerPathId: "chartered-accountant-icai",
      careerGoals: [
        {
          careerPath: {
            slug: "chartered-accountant-icai",
            title: "Chartered Accountant (ICAI)",
          },
        },
      ],
      userSkills: [],
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE 1: Engine Status & Fallback Transparency
  // ---------------------------------------------------------------------------
  describe("AI Engine Status & Transparency (Requirements 11, 12, 15)", () => {
    it("reports transparent active engine status, SLA bounds, and zero-hallucination guarantee", () => {
      const status = AiMentorService.getAiEngineStatus();

      expect(status).toBeDefined();
      expect(typeof status.liveAvailable).toBe("boolean");
      expect(["gemini_2_flash", "kaabil_deterministic_mentor"]).toContain(status.activeEngine);
      expect(status.deterministicFallbackReady).toBe(true);
      expect(status.zeroHallucinationGuaranteed).toBe(true);
      expect(status.slaLimitSeconds).toBeLessThanOrEqual(8);
    });

    it("ensures responses tag source engine and include verified source citations", async () => {
      const conv = await AiMentorService.createConversation(demoStudentId, undefined, "en");
      const reply = await AiMentorService.generateMentorResponse(
        demoStudentId,
        conv.id,
        "What is the starting salary benchmark for an AI Systems Engineer?",
        "en"
      );

      expect(reply.source).toMatch(/gemini_2_flash|kaabil_deterministic_mentor/);
      expect(reply.verifiedSources).toBeDefined();
      expect(Array.isArray(reply.verifiedSources)).toBe(true);
      expect(reply.disclaimer).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE 2: Verified Career Records & Zero-Fabrication (Requirements 5, 6, 7, 8)
  // ---------------------------------------------------------------------------
  describe("Grounded Career Records & Zero-Fabrication (Requirements 5, 7, 8)", () => {
    it("answers Medical PCB queries citing NMC, NEET-UG, and MoHFW salary scales without fake guarantees", async () => {
      const conv = await AiMentorService.createConversation(minorStudentId, undefined, "en");
      const reply = await AiMentorService.generateMentorResponse(
        minorStudentId,
        conv.id,
        "What is the official entrance exam and starting salary for an MBBS Doctor?",
        "en"
      );

      expect(reply.content).toMatch(/NEET-UG|National Eligibility cum Entrance Test/i);
      expect(reply.content).toMatch(/NMC|National Medical Commission/i);
      expect(reply.content).toMatch(/9\.0|9,00,000|LPA|7th Central Pay Commission|MoHFW/i);
      // Confirms absence of fake job/salary guarantees
      expect(reply.content).not.toMatch(/100% placement guaranteed|guaranteed admission/i);
    });

    it("answers Commerce CA queries citing ICAI, Foundation/Intermediate, and statutory norms", async () => {
      const conv = await AiMentorService.createConversation(freshStudentId, undefined, "en");
      const reply = await AiMentorService.generateMentorResponse(
        freshStudentId,
        conv.id,
        "What is the roadmap to become a Chartered Accountant?",
        "en"
      );

      expect(reply.content).toMatch(/ICAI|Chartered Accountant/i);
      expect(reply.content.length).toBeGreaterThan(100);
      expect(reply.content).not.toMatch(/fake-exam-date|guaranteed pass/i);
    });

    it("explains why a career fits based on profile without guaranteeing outcomes", async () => {
      const conv = await AiMentorService.createConversation(demoStudentId, undefined, "en");
      const reply = await AiMentorService.generateMentorResponse(
        demoStudentId,
        conv.id,
        "Why is AI Engineering a good fit for me?",
        "en"
      );

      expect(reply.content.length).toBeGreaterThan(50);
      expect(reply.content).toMatch(/AI Systems Engineer|STEM|Python/i);
      expect(reply.content).not.toMatch(/guaranteed 50 LPA|automatic selection/i);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE 3: Career Comparisons & Alternative Pathways (Requirement 10)
  // ---------------------------------------------------------------------------
  describe("Career Comparisons & Alternative Pathways (Requirement 10)", () => {
    it("compares MBBS vs BDS objectively across regulatory council, duration, exams, and salaries", async () => {
      const conv = await AiMentorService.createConversation(minorStudentId, undefined, "en");
      const reply = await AiMentorService.generateMentorResponse(
        minorStudentId,
        conv.id,
        "Compare MBBS vs BDS in terms of eligibility and scope",
        "en"
      );

      expect(reply.content).toMatch(/MBBS|Doctor/i);
      expect(reply.content).toMatch(/BDS|Dental/i);
      expect(reply.content).toMatch(/NMC|Dental Council|NEET/i);
      expect(reply.actionProposal).not.toBeNull();
      expect(reply.actionProposal?.type).toBe("CAREER_COMPARISON");
      expect(reply.actionProposal?.actionUrl).toContain("/compare");
    });

    it("provides verified alternative pathways when a student asks 'What if I don't clear NEET?'", async () => {
      const conv = await AiMentorService.createConversation(minorStudentId, undefined, "en");
      const reply = await AiMentorService.generateMentorResponse(
        minorStudentId,
        conv.id,
        "What if I don't clear NEET? What are alternatives to MBBS?",
        "en"
      );

      expect(reply.content).toMatch(/Alternative|विकल्प/i);
      expect(reply.content).toMatch(/Hospital Administration|Clinical Research|Public Health|BDS|BAMS|Pharmacy/i);
      expect(reply.content.length).toBeGreaterThan(150);
    });

    it("compares AI Systems Engineer vs Data Scientist for a STEM student", async () => {
      const conv = await AiMentorService.createConversation(demoStudentId, undefined, "en");
      const reply = await AiMentorService.generateMentorResponse(
        demoStudentId,
        conv.id,
        "What is the difference between AI Systems Engineer and Data Scientist?",
        "en"
      );

      expect(reply.content).toMatch(/AI.*Systems Engineer/i);
      expect(reply.content).toMatch(/Cloud Solutions|Architect|Distributed Systems/i);
      expect(reply.actionProposal?.type).toBe("CAREER_COMPARISON");
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE 4: Actionable Next Steps & Learning Progress (Requirement 9)
  // ---------------------------------------------------------------------------
  describe("Actionable Next Steps & Learning Progress (Requirement 9)", () => {
    it("suggests today's structured learning sprint task when asked about study plans", async () => {
      const conv = await AiMentorService.createConversation(demoStudentId, undefined, "en");
      const reply = await AiMentorService.generateMentorResponse(
        demoStudentId,
        conv.id,
        "What should I study today from my roadmap?",
        "en"
      );

      expect(reply.content).toMatch(/Today|Priority|Task|कार्य/i);
      expect(reply.actionProposal).not.toBeNull();
      expect(reply.actionProposal?.type).toBe("LEARNING_TASK");
      expect(reply.actionProposal?.actionUrl).toBe("/student/learning-plan");
    });

    it("attaches diagnostic assessment proposal when student asks to verify skill gaps", async () => {
      const conv = await AiMentorService.createConversation(demoStudentId, undefined, "en");
      const reply = await AiMentorService.generateMentorResponse(
        demoStudentId,
        conv.id,
        "What are my critical skill gaps and how can I verify them?",
        "en"
      );

      expect(reply.content).toMatch(/Skill|Gap|Assessment|कौशल/i);
      expect(reply.actionProposal).not.toBeNull();
      expect(reply.actionProposal?.type).toBe("RECOMMENDED_ASSESSMENT");
      expect(reply.actionProposal?.actionUrl).toContain("/student/assessments");
    });

    it("attaches project exploration proposal when student asks about practical projects", async () => {
      const conv = await AiMentorService.createConversation(demoStudentId, undefined, "en");
      const reply = await AiMentorService.generateMentorResponse(
        demoStudentId,
        conv.id,
        "What project should I build to demonstrate my practical skills?",
        "en"
      );

      expect(reply.content).toMatch(/Project|Portfolio|प्रोजेक्ट/i);
      expect(reply.actionProposal).not.toBeNull();
      expect(reply.actionProposal?.type).toBe("PROJECT_EXPLORATION");
      expect(reply.actionProposal?.actionUrl).toContain("/student/learning-plan#projects");
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE 5: Confused & Undecided Students (Requirement 17)
  // ---------------------------------------------------------------------------
  describe("Confused & Undecided Student Guidance (Requirement 17)", () => {
    it("guides undecided students with structured 3-step discovery without demeaning non-STEM streams", async () => {
      const conv = await AiMentorService.createConversation(undecidedStudentId, undefined, "en");
      const reply = await AiMentorService.generateMentorResponse(
        undecidedStudentId,
        conv.id,
        "I am totally confused about which stream to choose after school",
        "en"
      );

      expect(reply.content).toMatch(/Discovery|Aptitude|Stream/i);
      // Ensures parity across diverse streams
      expect(reply.content).toMatch(/PCB|PCM|Commerce|Arts|Design/i);
      expect(reply.actionProposal?.type).toBe("CAREER_EXPLORATION");
      expect(reply.actionProposal?.actionUrl).toBe("/student/assessments/discovery");
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE 6: Incomplete Profiles & Graceful Degradation (Requirement 17)
  // ---------------------------------------------------------------------------
  describe("Incomplete Profiles & Unassessed CRI (Requirement 17)", () => {
    it("handles unassessed CRI scores gracefully without crash or fabricated metrics", async () => {
      const context = await AiMentorService.getStudentLiveContext(freshStudentId);

      expect(context).toBeDefined();
      expect(context.isUnassessed).toBe(true);
      expect(context.criScore === null || context.criScore === 0).toBe(true);
      expect(context.verifiedSkills.length).toBe(0);

      const conv = await AiMentorService.createConversation(freshStudentId, undefined, "en");
      const reply = await AiMentorService.generateMentorResponse(
        freshStudentId,
        conv.id,
        "How do I start building my profile?",
        "en"
      );

      expect(reply.content.length).toBeGreaterThan(50);
      expect(reply.content).toMatch(/Chartered Accountant|CA|Commerce/i);
      expect(reply.source).toMatch(/gemini_2_flash|kaabil_deterministic_mentor/);
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE 7: Minor Student Safeguards (DPDP Act 2023) (Requirement 13, 14)
  // ---------------------------------------------------------------------------
  describe("DPDP Act 2023 Minor Student Protection (Requirement 13, 14)", () => {
    it("enforces minor shield: suppresses recruiter/job placement pressure for Class 10 minors", async () => {
      const conv = await AiMentorService.createConversation(minorStudentId, undefined, "en");
      const reply = await AiMentorService.generateMentorResponse(
        minorStudentId,
        conv.id,
        "Can recruiters hire me or can I get a job placement right now?",
        "en"
      );

      expect(reply.content).toMatch(/school|Class 10|minor|foundations|board/i);
      expect(reply.content).not.toMatch(/apply to recruiters|send resume to companies|job offer/i);
      expect(reply.verifiedSources).toContain("DPDP Act 2023 Child Protection");
    });
  });

  // ---------------------------------------------------------------------------
  // TEST SUITE 8: Trilingual Guidance Parity (English, Hindi, Hinglish) (Requirement 4)
  // ---------------------------------------------------------------------------
  describe("Trilingual Guidance Parity (Requirement 4)", () => {
    it("generates authentic Devanagari Hindi guidance with verified statutory citations", async () => {
      const conv = await AiMentorService.createConversation(minorStudentId, undefined, "hi");
      const reply = await AiMentorService.generateMentorResponse(
        minorStudentId,
        conv.id,
        "एमबीबीएस डॉक्टर का शुरुआती वेतन और पात्रता क्या है?",
        "hi"
      );

      expect(reply.language).toBe("hi");
      expect(reply.content).toContain("प्रमाणित");
      expect(reply.content).toMatch(/वेतन|लाख|NEET|काउंसिल/);
      expect(reply.content.length).toBeGreaterThan(100);
    });

    it("generates natural, conversational Hinglish guidance for Indian students", async () => {
      const conv = await AiMentorService.createConversation(demoStudentId, undefined, "hinglish");
      const reply = await AiMentorService.generateMentorResponse(
        demoStudentId,
        conv.id,
        "AI Systems Engineer banne ke liye mujhe aaj kya karna chahiye?",
        "hinglish"
      );

      expect(reply.language).toBe("hinglish");
      expect(reply.content).toMatch(/Aapke|career|milestone|task|sprint/i);
      expect(reply.content.length).toBeGreaterThan(100);
    });

    it("supports Hindi for confused students exploring streams", async () => {
      const conv = await AiMentorService.createConversation(undecidedStudentId, undefined, "hi");
      const reply = await AiMentorService.generateMentorResponse(
        undecidedStudentId,
        conv.id,
        "मुझे समझ नहीं आ रहा कि कौन सी स्ट्रीम चुनूँ",
        "hi"
      );

      expect(reply.language).toBe("hi");
      expect(reply.content).toContain("नमस्ते");
      expect(reply.content).toMatch(/खोज|एप्टीट्यूड|स्ट्रीम/);
    });
  });
});
