import { describe, it, expect, beforeEach } from "vitest";
import { IndustryChallengeService } from "@/lib/employer/industry-challenge-service";
import { CredentialService } from "@/lib/passport/credential-service";
import { devStore } from "@/lib/dev-store";

describe("Industry Challenge Hub & Verified Credential Minting (Part F2)", () => {
  beforeEach(() => {
    devStore.reset();
  });

  it("allows verified employers to create multi-stream industry challenges", () => {
    const challenge = IndustryChallengeService.createChallenge({
      organizationId: "emp-apex-diag",
      title: "Pediatric Pathology Diagnostic Case Challenge",
      category: "PRACTICAL_PROJECT",
      stream: "MEDICAL_PCB",
      difficulty: "ADVANCED",
      description: "Analyze complex pediatric blood profiles and identify metabolic abnormalities.",
      problemStatement: "Given a 10-patient dataset of pediatric chemistry panels, construct diagnostic rationale.",
      deliverables: ["Diagnostic Case Report (PDF)", "Biochemical Differential Analysis"],
      requiredSkills: ["Clinical Biochemistry", "Pediatric Pathology", "Data Interpretation"],
      rubricCriteria: [
        { criterion: "Diagnostic Accuracy", weight: 40 },
        { criterion: "Differential Reasoning", weight: 30 },
        { criterion: "Clinical Documentation", weight: 30 },
      ],
      submissionDeadline: "2026-12-31T23:59:59Z",
      rewardCredentialTitle: "Certified Pediatric Pathology Specialist",
    });

    expect(challenge.id).toBeDefined();
    expect(challenge.title).toBe("Pediatric Pathology Diagnostic Case Challenge");
    expect(challenge.rewardCredentialTitle).toBe("Certified Pediatric Pathology Specialist");
    expect(challenge.isAdultOnly).toBe(true);
  });

  it("blocks unverified employers from publishing challenges", () => {
    devStore.saveEmployerOrganization({
      id: "emp-unverified-test",
      name: "Fake Medical Labs",
      legalName: "Fake Medical Labs LLP",
      industry: "Healthcare",
      companyType: "LLP",
      verificationStatus: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(() => {
      IndustryChallengeService.createChallenge({
        organizationId: "emp-unverified-test",
        title: "Unauthorized Challenge",
        category: "PRACTICAL_PROJECT",
        stream: "MEDICAL_PCB",
        difficulty: "BEGINNER",
        description: "Test",
        problemStatement: "Test",
        deliverables: ["Test"],
        requiredSkills: ["Test"],
        rubricCriteria: [],
        submissionDeadline: "2026-12-31",
        rewardCredentialTitle: "Test",
      });
    }).toThrow(/Only verified employers/i);
  });

  it("strictly prohibits under-18 minors from registering or submitting deliverables", () => {
    const challenge = devStore.getIndustryChallenges()[0];
    const minorStudent = {
      id: "sp-minor-01",
      name: "Aman Gupta",
      email: "aman@school.edu",
      isMinor: true,
      educationStage: "CLASS_9",
    };

    // 1. Minor registration blocked
    expect(() => {
      IndustryChallengeService.registerParticipant(challenge.id, minorStudent);
    }).toThrow(/DPDP Act/i);

    // 2. Minor submission blocked
    expect(() => {
      IndustryChallengeService.submitChallengeDeliverable({
        challengeId: challenge.id,
        studentProfile: minorStudent,
        submissionUrl: "https://drive.google.com/sample-minor-doc",
        summary: "My science project analysis",
      });
    }).toThrow(/DPDP Act/i);
  });

  it("processes adult submission, rubric evaluation, and automatically mints verified credential to Digital Skill Passport", () => {
    const challenge = devStore.getIndustryChallenges()[0];
    const adultStudent = {
      id: "sp-aryan-01",
      name: "Aryan Sharma",
      email: "aryan.sharma@example.com",
      isMinor: false,
      educationStage: "UNDERGRADUATE",
    };

    // 1. Register
    const registered = IndustryChallengeService.registerParticipant(challenge.id, adultStudent);
    expect(registered).toBe(true);

    // 2. Submit deliverable
    const submission = IndustryChallengeService.submitChallengeDeliverable({
      challengeId: challenge.id,
      studentProfile: adultStudent,
      submissionUrl: "https://github.com/aryan-sharma/biochem-case-analysis",
      summary: "Detailed diagnostic analysis of 12 clinical biochemical case studies with quality control data.",
    });

    expect(submission.id).toBeDefined();
    expect(submission.status).toBe("SUBMITTED");

    // 3. Employer evaluates submission with rubric score and approves
    const evaluated = IndustryChallengeService.evaluateSubmission({
      submissionId: submission.id,
      organizationId: challenge.organizationId,
      reviewerName: "Dr. Rohit Verma",
      score: 92,
      feedback: "Exceptional clinical reasoning and thorough methodological validation.",
      decision: "APPROVED",
    });

    expect(evaluated.status).toBe("APPROVED");
    expect(evaluated.awardedCredentialId).toBeDefined();

    // 4. Verify that Skill Evidence was minted in store
    const evidenceList = devStore.getSkillEvidence(adultStudent.id);
    expect(evidenceList.length).toBeGreaterThan(0);
    const mintedEvidence = evidenceList.find((e: any) => e.evidenceUrl === submission.submissionUrl);
    expect(mintedEvidence).toBeDefined();
    expect(mintedEvidence.isVerified).toBe(true);
    expect(mintedEvidence.verificationHash).toBeDefined();

    // 5. Verify that authentic Digital Skill Passport Credential was minted and passes cryptographic verification
    const credentials = devStore.getStudentCredentials(adultStudent.id);
    const awardedCred = credentials.find((c: any) => c.id === evaluated.awardedCredentialId);
    expect(awardedCred).toBeDefined();
    expect(awardedCred.title).toBe(challenge.rewardCredentialTitle);
    expect(awardedCred.digitalSignature).toBeDefined();
    expect(awardedCred.verificationHash).toBeDefined();

    // 6. Verify cryptographic integrity
    const cryptoCheck = CredentialService.verifyCredential(awardedCred);
    expect(cryptoCheck.isValid).toBe(true);
  });
});
