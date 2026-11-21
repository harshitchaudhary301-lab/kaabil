import { describe, it, expect, beforeEach } from "vitest";
import { devStore } from "@/lib/dev-store";
import { AIGovernanceRecord } from "@/types/admin";

describe("Part G2: AI Governance, Safety & Telemetry", () => {
  beforeEach(() => {
    devStore.reset();
  });

  it("retrieves operational AI telemetry and health overview", () => {
    const overview = devStore.getAIGovernanceOverview();

    expect(overview).toBeDefined();
    expect(overview.serviceStatus).toBe("HEALTHY");
    expect(["gemini-2.0-flash", "gemini-1.5-pro"]).toContain(overview.primaryModel);
    expect(overview.averageLatencyMs).toBeGreaterThan(0);
    expect(overview.totalRequests24h).toBeGreaterThan(0);
    expect(overview.activePromptVersions).toBeDefined();
  });

  it("records new telemetry invocations and calculates latency statistics", () => {
    const initialRecords = devStore.getAIGovernanceRecords();

    const newRecord: AIGovernanceRecord = {
      id: "ai-log-test-01",
      timestamp: new Date().toISOString(),
      endpoint: "universal-career-mentor",
      model: "gemini-1.5-pro",
      promptVersion: "v2.4-strict-safety",
      latencyMs: 380,
      tokensUsed: 1100,
      status: "SUCCESS",
      fallbackUsed: false,
    };

    devStore.saveAIGovernanceRecord(newRecord);

    const updatedRecords = devStore.getAIGovernanceRecords();
    expect(updatedRecords.length).toBe(initialRecords.length + 1);

    const found = updatedRecords.find((r) => r.id === "ai-log-test-01");
    expect(found).toBeDefined();
    expect(found?.latencyMs).toBe(380);
  });

  it("tracks fallback invocations when deterministic engine is engaged", () => {
    const fallbackRecord: AIGovernanceRecord = {
      id: "ai-fallback-test-01",
      timestamp: new Date().toISOString(),
      endpoint: "intelligent-skill-gap-analyzer",
      model: "gemini-1.5-pro",
      promptVersion: "v1.8-rubric",
      latencyMs: 45,
      tokensUsed: 0,
      status: "FALLBACK",
      fallbackUsed: true,
      errorDetails: "Rate limit reached; engaged offline deterministic gap engine.",
    };

    devStore.saveAIGovernanceRecord(fallbackRecord);

    const records = devStore.getAIGovernanceRecords();
    const match = records.find((r) => r.id === "ai-fallback-test-01");
    expect(match?.fallbackUsed).toBe(true);
    expect(match?.status).toBe("FALLBACK");
  });
});
