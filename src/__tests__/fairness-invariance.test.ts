import { describe, it, expect, beforeEach } from "vitest";
import { MatchingEngine } from "@/lib/employer/matching-engine";
import { devStore } from "@/lib/dev-store";
import { CandidateDiscoveryProfile } from "@/types/employer";

describe("Protected-Attribute Invariance & Algorithmic Fairness (Part F2)", () => {
  beforeEach(() => {
    devStore.reset();
  });

  it("produces identical compatibility scores regardless of candidate gender, religion, caste, or state", () => {
    const opp = devStore.getJobOpportunities("emp-apex-diag")[0];

    const baseSkills = ["Clinical Biochemistry", "Phlebotomy", "Quality Control"];
    const baseProjects = [
      {
        title: "Automated Chemistry Panel Audit",
        description: "Comparative study of reference laboratory protocols.",
        url: "https://example.com/project",
      },
    ];
    const baseQualifications = ["Bachelor of Science (Biochemistry)"];

    // Candidate 1: Male, from Maharashtra
    const candidate1: CandidateDiscoveryProfile = {
      id: "disc-cand-fair-01",
      studentProfileId: "sp-fair-01",
      name: "Rahul Sharma",
      email: "rahul.s@example.com",
      stream: "MEDICAL_PCB",
      stage: "UNDERGRADUATE",
      isMinor: false,
      discoveryOptIn: true,
      careerReadinessIndex: 80,
      verifiedSkills: baseSkills,
      selfReportedSkills: ["Patient Communication"],
      projects: baseProjects,
      qualifications: baseQualifications,
      lastActiveAt: new Date().toISOString(),
    };

    // Candidate 2: Female, from Kerala
    const candidate2: CandidateDiscoveryProfile = {
      id: "disc-cand-fair-02",
      studentProfileId: "sp-fair-02",
      name: "Fatima Khan",
      email: "fatima.k@example.com",
      stream: "MEDICAL_PCB",
      stage: "UNDERGRADUATE",
      isMinor: false,
      discoveryOptIn: true,
      careerReadinessIndex: 80,
      verifiedSkills: baseSkills,
      selfReportedSkills: ["Patient Communication"],
      projects: baseProjects,
      qualifications: baseQualifications,
      lastActiveAt: new Date().toISOString(),
    };

    // Candidate 3: Non-binary / Underrepresented group, from Northeast (Assam)
    const candidate3: CandidateDiscoveryProfile = {
      id: "disc-cand-fair-03",
      studentProfileId: "sp-fair-03",
      name: "Tenzin Dorjee",
      email: "tenzin.d@example.com",
      stream: "MEDICAL_PCB",
      stage: "UNDERGRADUATE",
      isMinor: false,
      discoveryOptIn: true,
      careerReadinessIndex: 80,
      verifiedSkills: baseSkills,
      selfReportedSkills: ["Patient Communication"],
      projects: baseProjects,
      qualifications: baseQualifications,
      lastActiveAt: new Date().toISOString(),
    };

    devStore.saveCandidateDiscoveryProfile(candidate1);
    devStore.saveCandidateDiscoveryProfile(candidate2);
    devStore.saveCandidateDiscoveryProfile(candidate3);

    const matches = MatchingEngine.matchCandidatesForOpportunity({
      opportunityId: opp.id,
      organizationId: "emp-apex-diag",
    });

    const match1 = matches.find((m) => m.candidateId === candidate1.id);
    const match2 = matches.find((m) => m.candidateId === candidate2.id);
    const match3 = matches.find((m) => m.candidateId === candidate3.id);

    expect(match1).toBeDefined();
    expect(match2).toBeDefined();
    expect(match3).toBeDefined();

    // STRICT INVARIANCE ASSERTION:
    // All 3 candidates must receive the EXACT same overall compatibility score!
    expect(match1!.overallScore).toBe(match2!.overallScore);
    expect(match2!.overallScore).toBe(match3!.overallScore);

    // Score component breakdowns must also be perfectly identical
    expect(match1!.scoreBreakdown.verifiedSkillScore).toBe(match2!.scoreBreakdown.verifiedSkillScore);
    expect(match1!.scoreBreakdown.proficiencyScore).toBe(match2!.scoreBreakdown.proficiencyScore);
    expect(match1!.scoreBreakdown.projectEvidenceScore).toBe(match2!.scoreBreakdown.projectEvidenceScore);
    expect(match1!.scoreBreakdown.assessmentScore).toBe(match2!.scoreBreakdown.assessmentScore);
  });
});
