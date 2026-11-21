import { describe, it, expect, beforeEach } from "vitest";
import { CandidateDiscoveryService } from "@/lib/employer/candidate-discovery-service";
import { devStore } from "@/lib/dev-store";

describe("Candidate Discovery & DPDP Under-18 Privacy Safeguards (Part F2)", () => {
  beforeEach(() => {
    devStore.reset();
  });

  it("restricts talent search to verified employers only", () => {
    // Unverified employer organization
    devStore.saveEmployerOrganization({
      id: "emp-unverified-org",
      name: "Unverified Startup",
      legalName: "Unverified Startup Pvt Ltd",
      industry: "Technology",
      website: "https://unverified.in",
      companyType: "PRIVATE_LIMITED",
      verificationStatus: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(() => {
      CandidateDiscoveryService.searchCandidates({
        organizationId: "emp-unverified-org",
      });
    }).toThrow(/Only verified employer organizations/i);
  });

  it("permits verified employers to search opted-in candidates", () => {
    const candidates = CandidateDiscoveryService.searchCandidates({
      organizationId: "emp-apex-diag", // Verified organization in devStore
    });

    expect(candidates.length).toBeGreaterThan(0);
    // Confirm all returned candidates have opted in and are adults
    for (const cand of candidates) {
      expect(cand.discoveryOptIn).toBe(true);
      expect(cand.isMinor).toBe(false);
    }
  });

  it("strictly enforces Under-18 shielding per DPDP Act (2023) — minor cannot opt in", () => {
    expect(() => {
      CandidateDiscoveryService.updateDiscoveryPreference({
        studentProfileId: "sp-minor-class9",
        isMinor: true,
        educationStage: "CLASS_9",
        optIn: true,
      });
    }).toThrow(/Statutory Privacy Restriction.*DPDP Act/i);

    expect(() => {
      CandidateDiscoveryService.updateDiscoveryPreference({
        studentProfileId: "sp-minor-class10",
        isMinor: false,
        educationStage: "CLASS_10",
        optIn: true,
      });
    }).toThrow(/Statutory Privacy Restriction.*DPDP Act/i);
  });

  it("honors immediate consent withdrawal — dropping profile from discovery index", () => {
    const studentId = "sp-adult-optout-test";

    // 1. Adult opts in
    CandidateDiscoveryService.updateDiscoveryPreference({
      studentProfileId: studentId,
      isMinor: false,
      educationStage: "UNDERGRADUATE",
      optIn: true,
      profileData: {
        name: "Rohan Varma",
        email: "rohan.v@example.com",
        stream: "NON_MEDICAL_PCM",
        careerReadinessIndex: 82,
        verifiedSkills: ["TypeScript", "Next.js"],
      },
    });

    // Profile should be found in discovery
    let results = CandidateDiscoveryService.searchCandidates({
      organizationId: "emp-apex-diag",
      search: "Rohan",
    });
    expect(results.some((c) => c.name === "Rohan Varma")).toBe(true);

    // 2. Student withdraws consent
    CandidateDiscoveryService.updateDiscoveryPreference({
      studentProfileId: studentId,
      isMinor: false,
      educationStage: "UNDERGRADUATE",
      optIn: false,
    });

    // 3. Profile must be immediately purged from discovery
    results = CandidateDiscoveryService.searchCandidates({
      organizationId: "emp-apex-diag",
      search: "Rohan",
    });
    expect(results.some((c) => c.name === "Rohan Varma")).toBe(false);
  });

  it("sends recruitment invitations from verified employers to opted-in candidates", () => {
    const opp = devStore.getJobOpportunities("emp-apex-diag")[0];
    const candidate = devStore.getCandidateDiscoveryProfiles()[0];

    const invitation = CandidateDiscoveryService.sendInvitation({
      organizationId: "emp-apex-diag",
      recruiterId: "rec-dr-verma",
      recruiterName: "Dr. Rohit Verma",
      opportunityId: opp.id,
      candidateId: candidate.id,
      note: "We would like to invite you for a practical case review.",
    });

    expect(invitation.id).toBeDefined();
    expect(invitation.status).toBe("PENDING");
    expect(invitation.opportunityId).toBe(opp.id);
  });
});
