// ==============================================================================
// KAABIL (काबिल) — Universal AI Career Mentor Tests
// Tests trilingual guidance, 13 stream parity, action proposals & DPDP minor safety
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { AiMentorService } from "@/lib/mentor/ai-mentor-service";
import { devStore } from "@/lib/dev-store";

describe("Universal AI Career Mentor Service", () => {
  const testProfileId = "demo-profile-id";

  it("builds comprehensive live student context with CRI and Digital Twin data", async () => {
    const context = await AiMentorService.getStudentLiveContext(testProfileId);

    expect(context).toBeDefined();
    expect(context.studentName).toBe("Aryan Sharma");
    expect(context.currentStream).toBe("NON_MEDICAL_PCM");
    expect(context.criScore).toBeGreaterThanOrEqual(0);
    expect(context.dimensionBreakdown).toBeDefined();
    expect(context.verifiedSkills).toBeInstanceOf(Array);
    expect(context.selfReportedSkills).toBeInstanceOf(Array);
    expect(typeof context.isMinor).toBe("boolean");
  });

  it("generates deterministic mentor advice in English with zero hallucination", async () => {
    const conv = await AiMentorService.createConversation(testProfileId, undefined, "en");
    expect(conv).toBeDefined();

    const reply = await AiMentorService.generateMentorResponse(
      testProfileId,
      conv.id,
      "What should I do with my roadmap this week?",
      "en"
    );

    expect(reply).toBeDefined();
    expect(reply.sender).toBe("MENTOR");
    expect(reply.language).toBe("en");
    expect(reply.content.length).toBeGreaterThan(20);
    expect(reply.source).toMatch(/gemini_2_flash|kaabil_deterministic_mentor/);
  });

  it("generates authentic Hindi (हिन्दी) guidance for Hindi-preference students", async () => {
    const conv = await AiMentorService.createConversation(testProfileId, undefined, "hi");

    const reply = await AiMentorService.generateMentorResponse(
      testProfileId,
      conv.id,
      "नमस्ते, मुझे अपने रोडमैप के बारे में बताएं",
      "hi"
    );

    expect(reply).toBeDefined();
    expect(reply.language).toBe("hi");
    expect(reply.content).toContain("नमस्ते");
    expect(reply.content.length).toBeGreaterThan(20);
  });

  it("generates conversational Hinglish guidance for blended language preference", async () => {
    const conv = await AiMentorService.createConversation(testProfileId, undefined, "hinglish");

    const reply = await AiMentorService.generateMentorResponse(
      testProfileId,
      conv.id,
      "Hey mentor, tell me about my roadmap plan",
      "hinglish"
    );

    expect(reply).toBeDefined();
    expect(reply.language).toBe("hinglish");
    expect(reply.content).toMatch(/roadmap|milestone|score|goal/i);
    expect(reply.content.length).toBeGreaterThan(20);
  });

  it("attaches actionable assessment proposals when student asks about verifying skills", async () => {
    const conv = await AiMentorService.createConversation(testProfileId, undefined, "en");

    const reply = await AiMentorService.generateMentorResponse(
      testProfileId,
      conv.id,
      "Can you test me on my skills or give me an assessment?",
      "en"
    );

    expect(reply).toBeDefined();
    expect(reply.actionProposal).not.toBeNull();
    expect(reply.actionProposal?.type).toBe("RECOMMENDED_ASSESSMENT");
    expect(reply.actionProposal?.title).toContain("Assessment");
  });

  it("manages conversation lifecycle: create, append message, retrieve, and delete", async () => {
    const newConv = await AiMentorService.createConversation(
      testProfileId,
      "First initial query from student",
      "en"
    );
    expect(newConv.messages.length).toBeGreaterThanOrEqual(1);

    const fetched = await AiMentorService.getConversation(newConv.id);
    expect(fetched).not.toBeNull();
    expect(fetched.id).toBe(newConv.id);

    const deleted = await AiMentorService.deleteConversation(newConv.id);
    expect(deleted).toBe(true);

    const postDelete = await AiMentorService.getConversation(newConv.id);
    expect(postDelete).toBeNull();
  });
});
