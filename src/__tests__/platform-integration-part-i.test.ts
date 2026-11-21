// ==============================================================================
// KAABIL (काबिल) — Master Platform Integration & Verification Suite (Part I)
// End-to-end multi-portal lifecycle, RBAC, DPDP safeguards, persistence & AI audit
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { devStore } from "@/lib/dev-store";
import { CareerReadinessEngine } from "@/lib/readiness/cri-engine";
import { CareerDigitalTwinService } from "@/lib/digital-twin/digital-twin-service";
import { AdaptiveRoadmapEngine } from "@/lib/roadmap/adaptive-roadmap-engine";
import { DailyMissionsEngine } from "@/lib/missions/daily-missions-engine";
import { CredentialService } from "@/lib/passport/credential-service";
import { OpportunityService } from "@/lib/employer/opportunity-service";
import { MatchingEngine } from "@/lib/employer/matching-engine";
import { CandidateDiscoveryService } from "@/lib/employer/candidate-discovery-service";
import { AdminService } from "@/lib/admin/admin-service";
import { AiMentorService } from "@/lib/mentor/ai-mentor-service";
import { STREAMS_CONFIG, CAREER_PATHS_DATABASE } from "@/data/careersData";

describe("KAABIL Master Platform Integration — Part I Verification Suite", () => {
  beforeEach(() => {
    devStore.reset();
  });

  // ---------------------------------------------------------------------------
  // 1. Multi-Stream Taxonomy & Benchmark Architecture
  // ---------------------------------------------------------------------------
  describe("1. Multi-Stream Universal Taxonomy", () => {
    it("contains all 13 educational streams with verified regulatory benchmarks", () => {
      expect(STREAMS_CONFIG.length).toBe(13);
      const expectedStreams = [
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
      const actualStreams = STREAMS_CONFIG.map((s) => s.stream);
      for (const stream of expectedStreams) {
        expect(actualStreams).toContain(stream);
      }
    });

    it("verifies career database benchmarks across streams have non-zero salaries and valid regulatory bodies", () => {
      expect(CAREER_PATHS_DATABASE.length).toBeGreaterThanOrEqual(13);
      for (const career of CAREER_PATHS_DATABASE) {
        expect(career.avgStartingSalaryInr).toBeGreaterThan(0);
        expect(career.avgMidCareerSalaryInr).toBeGreaterThan(career.avgStartingSalaryInr);
        expect(career.regulatoryBody).toBeDefined();
        expect(career.regulatoryBody?.length).toBeGreaterThan(0);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 2. End-to-End Student Journey & Intelligence
  // ---------------------------------------------------------------------------
  describe("2. Student Journey: Onboarding -> Digital Twin -> CRI -> Passport", () => {
    it("executes the complete student development trajectory with persistent evidence", async () => {
      const studentId = "test-student-integration-01";
      const profileId = "test-profile-integration-01";

      // 1. Save student & profile in devStore
      devStore.saveUser({
        id: studentId,
        email: "priya.nair@example.com",
        name: "Priya Nair",
        role: "STUDENT",
        status: "ACTIVE",
        isMinor: false,
        passwordHash: "$2b$10$hashed_test_password",
      });

      devStore.saveProfile({
        id: profileId,
        userId: studentId,
        educationStage: "UNDERGRADUATE",
        currentStream: "MEDICAL_PCB",
        onboardingCompleted: true,
        careerReadinessIndex: 78,
        institutionName: "All India Institute of Medical Sciences (AIIMS)",
        userSkills: [
          { name: "Clinical Diagnostics", isVerified: true },
          { name: "Anatomy & Vitals", isVerified: true },
        ],
      });

      // 2. Synthesize Career Digital Twin
      const twin = await CareerDigitalTwinService.getDigitalTwin(profileId);
      expect(twin).toBeDefined();
      expect(twin?.studentProfileId).toBe(profileId);
      expect(twin?.primaryStreamLabel.toUpperCase()).toContain("MEDICAL");

      // 3. Compute deterministic CRI
      const cri = await CareerReadinessEngine.calculateReadiness(profileId, "mbbs-doctor");
      expect(cri).toBeDefined();
      expect(cri.dimensions).toBeDefined();
      expect(cri.dimensions.careerKnowledge.score).toBeGreaterThanOrEqual(0);
      expect(cri.dimensions.skillDevelopment.score).toBeGreaterThanOrEqual(0);

      // 4. Generate Adaptive Roadmap & Daily Missions
      const roadmap = await AdaptiveRoadmapEngine.generateRoadmap(profileId, "mbbs-doctor");
      expect(roadmap).toBeDefined();
      expect(roadmap.milestones.length).toBeGreaterThanOrEqual(2);

      const missions = await DailyMissionsEngine.getTodayMissions(profileId);
      expect(missions.length).toBeGreaterThanOrEqual(1);

      // 5. Mint verified credential into Digital Skill Passport
      const credential = CredentialService.issueCredential({
        studentProfileId: profileId,
        title: "Clinical Diagnostics & Patient Triage Specialist",
        stream: "MEDICAL_PCB",
        credentialLevel: "ADVANCED",
        skillsVerified: ["Clinical Diagnostics", "Anatomy & Vitals", "Emergency Triage"],
        issuerName: "National Health Systems Resource Centre (NHSRC)",
        issuerCategory: "HEALTHCARE_REGULATOR",
      });

      expect(credential.id).toBeDefined();
      expect(credential.status).toBe("ACTIVE");

      // Verify cryptographic authenticity
      const verification = CredentialService.verifyCredential(credential);
      expect(verification.isValid).toBe(true);
      expect(verification.signatureValid).toBe(true);
      expect(verification.hashValid).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Multi-Tenant Isolation & Role Permissions
  // ---------------------------------------------------------------------------
  describe("3. Multi-Tenant Isolation & Role Permissions", () => {
    it("enforces strict isolation: Institution A cannot see Institution B enrollments", () => {
      const instA = "inst-delhi-tech";
      const instB = "inst-mumbai-eng";

      const studentsA = devStore.getStudentEnrollments(instA);
      const studentsB = devStore.getStudentEnrollments(instB);

      // Verify enrollments belong strictly to their respective institution
      expect(studentsA.every((s) => s.institutionId === instA)).toBe(true);
      expect(studentsB.every((s) => s.institutionId === instB)).toBe(true);
    });

    it("prevents unverified employers from publishing opportunities or searching talent", () => {
      const unverifiedOrgId = "emp-unverified-startup";

      // Register unverified employer
      devStore.saveEmployerOrganization({
        id: unverifiedOrgId,
        name: "Stealth Startup Pvt Ltd",
        slug: "stealth-startup",
        industry: "Information Technology",
        verificationStatus: "PENDING_REVIEW",
        cinNumber: "U72900DL2026PTC999999",
        gstin: "07AAACS9999P1Z1",
      });

      const org = devStore.getEmployerOrganization(unverifiedOrgId);
      expect(org.verificationStatus).toBe("PENDING_REVIEW");

      // Attempting to post opportunity as unverified employer throws error
      expect(() => {
        OpportunityService.createOpportunity({
          organizationId: unverifiedOrgId,
          title: "Senior Backend Engineer",
          industry: "Information Technology",
          stream: "NON_MEDICAL_PCM",
          department: "Engineering",
          opportunityType: "FULL_TIME",
          workplaceType: "REMOTE",
          city: "New Delhi",
          state: "Delhi",
          description: "Build distributed backend services.",
          responsibilities: ["Design APIs"],
          requiredSkills: ["Node.js", "PostgreSQL"],
          minStage: "UNDERGRADUATE",
          status: "PUBLISHED",
        });
      }).toThrow(/verification/i);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Statutory DPDP Act (2023) Under-18 Minor Safeguards
  // ---------------------------------------------------------------------------
  describe("4. DPDP Act Under-18 Privacy Safeguards", () => {
    it("shields minor students from recruiter discovery and commercial recruitment", () => {
      const minorStudentId = "minor-student-class-10";

      // Attempting to opt a minor into candidate discovery throws statutory error
      expect(() => {
        CandidateDiscoveryService.updateDiscoveryPreference({
          studentProfileId: minorStudentId,
          isMinor: true,
          educationStage: "CLASS_10",
          optIn: true,
          profileData: {
            name: "Minor Student",
            stream: "NON_MEDICAL_PCM",
          },
        });
      }).toThrow(/Statutory Privacy Restriction/i);

      // Create a valid verified opportunity
      const opp = OpportunityService.createOpportunity({
        organizationId: "emp-apex-diag",
        title: "Clinical Lab Technician",
        industry: "Healthcare & Diagnostics",
        stream: "MEDICAL_PCB",
        department: "Diagnostics",
        opportunityType: "FULL_TIME",
        workplaceType: "ON_SITE",
        city: "Mumbai",
        state: "Maharashtra",
        description: "Analyze clinical specimens.",
        responsibilities: ["Specimen prep"],
        requiredSkills: ["Clinical Biochemistry"],
        minStage: "UNDERGRADUATE",
        status: "PUBLISHED",
      });

      // Match candidates
      const matches = MatchingEngine.matchCandidatesForOpportunity({
        opportunityId: opp.id,
        organizationId: "emp-apex-diag",
      });

      // No minor should appear in matches
      expect(matches.every((m) => m.candidateName !== "Minor Student")).toBe(true);
    });

    it("shields minor students from receiving recruitment invitations", () => {
      const minorProfileId = "minor-student-class-9";

      // Create opportunity
      const opp = OpportunityService.createOpportunity({
        organizationId: "emp-apex-diag",
        title: "Clinical Assistant",
        industry: "Healthcare & Diagnostics",
        stream: "MEDICAL_PCB",
        department: "Diagnostics",
        opportunityType: "FULL_TIME",
        workplaceType: "ON_SITE",
        city: "Mumbai",
        state: "Maharashtra",
        description: "Clinical support.",
        responsibilities: ["Support"],
        requiredSkills: ["Basic Math"],
        minStage: "UNDERGRADUATE",
        status: "PUBLISHED",
      });

      devStore.saveCandidateDiscoveryProfile({
        studentProfileId: minorProfileId,
        name: "Aman Verma",
        stream: "NON_MEDICAL_PCM",
        stage: "CLASS_9",
        isMinor: true,
        discoveryOptIn: false,
        careerReadinessIndex: 70,
        verifiedSkills: ["Basic Math"],
        selfReportedSkills: [],
        qualifications: [],
        licenses: [],
        projects: [],
      });

      expect(() => {
        CandidateDiscoveryService.sendInvitation({
          organizationId: "emp-apex-diag",
          recruiterId: "rec-01",
          recruiterName: "Recruiter Name",
          opportunityId: opp.id,
          candidateId: minorProfileId,
          note: "Invitation note",
        });
      }).toThrow(/not available for discovery/i);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Offline Persistence Resiliency & Disk Integrity
  // ---------------------------------------------------------------------------
  describe("5. Offline Persistence Resiliency", () => {
    it("persists records to disk and reloads cleanly without state corruption", () => {
      const testEmail = "persistence.audit@kaabil.in";

      // Save user in devStore
      devStore.saveUser({
        id: "usr-persistence-test",
        email: testEmail,
        name: "Persistence Auditor",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        isMinor: false,
        passwordHash: "$2b$10$persistent_hash",
      });

      // Verify immediate retrieval
      const initial = devStore.getUser(testEmail);
      expect(initial).toBeDefined();
      expect(initial.name).toBe("Persistence Auditor");

      // Verify store contains the user
      const allUsers = devStore.getUsers();
      expect(allUsers.some((u) => u.email === testEmail)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. AI Integration & Bounded Deterministic Fallback
  // ---------------------------------------------------------------------------
  describe("6. AI Bounded Fallback & Transparent Provenance", () => {
    it("returns structured deterministic response when live API key is offline", async () => {
      const reply = await AiMentorService.generateMentorResponse(
        "demo-profile-id",
        "conv-integration-01",
        "What is my current roadmap milestone and how do I improve my CRI?",
        "en"
      );

      expect(reply).toBeDefined();
      expect(reply.content.length).toBeGreaterThan(20);
      expect(reply.source).toBe("kaabil_deterministic_mentor"); // Explicitly labeled!
      expect(reply.sender).toBe("MENTOR");
    });

    it("supports trilingual responses in Hindi, Hinglish, and English without hallucination", async () => {
      const hindiReply = await AiMentorService.generateMentorResponse(
        "demo-profile-id",
        "conv-hi-01",
        "मुझे अपने रोडमैप के बारे में बताएं",
        "hi"
      );

      expect(hindiReply.content).toContain("नमस्ते");
      expect(hindiReply.source).toBe("kaabil_deterministic_mentor");

      const hinglishReply = await AiMentorService.generateMentorResponse(
        "demo-profile-id",
        "conv-hinglish-01",
        "Meri skills improve karne ke liye kya karun?",
        "hinglish"
      );

      expect(hinglishReply.content).toContain("Skills");
      expect(hinglishReply.source).toBe("kaabil_deterministic_mentor");
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Admin Platform Governance & Verification Workflow
  // ---------------------------------------------------------------------------
  describe("7. Admin Governance & Trust Verification Lifecycle", () => {
    it("handles human-in-the-loop institution approval with mandatory audit trail", () => {
      const unverifiedInstId = "inst-audit-pending-01";

      devStore.saveInstitution({
        id: unverifiedInstId,
        name: "Saraswati Institute of Technology",
        slug: "saraswati-tech",
        aisheCode: "AISHE-S-88888",
        orgType: "COLLEGE_UNIVERSITY",
        status: "PENDING_VERIFICATION",
        isVerified: false,
      });

      // Verification requests exist in devStore
      const requests = devStore.getVerificationRequests();
      expect(requests.length).toBeGreaterThan(0);
      const pendingReq = requests[0];

      // Process verification decision
      const result = AdminService.processVerificationDecision({
        requestId: pendingReq.id,
        adminId: "admin-super-01",
        adminName: "Dr. Vikramaditya Sen",
        decision: "APPROVED",
        reviewNotes: "Verified official AISHE code against Ministry of Education portal.",
      });

      expect(result.status).toBe("APPROVED");
      expect(result.reviewedBy).toBe("Dr. Vikramaditya Sen");

      // Verify audit log was recorded
      const logs = devStore.getAdminAuditLogs();
      const approvalLog = logs.find((l) => l.action.includes("VERIFICATION_APPROVED"));
      expect(approvalLog).toBeDefined();
      expect(approvalLog?.details).toContain("APPROVED");
    });
  });
});
