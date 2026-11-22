// ==============================================================================
// KAABIL (काबिल) — Test Suite: Step 3.4 Evidence-Backed Skill Passport & Career Readiness
// Validates 3-tier skill classification, zero fabrication, "Not enough information yet"
// empty state, Next Best Action, self-reported correction, and DPDP Act minor protection.
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { PassportService } from "@/lib/passport/passport-service";
import { CareerReadinessEngine } from "@/lib/readiness/cri-engine";
import { PassportSharingService } from "@/lib/passport/sharing-service";
import { devStore } from "@/lib/dev-store";
import { ProfileService } from "@/lib/student/profile-service";
import {
  GET as getPassportRoute,
  DELETE as deletePassportRoute,
  POST as postPassportRoute,
} from "@/app/api/student/passport/route";
import { GET as getReadinessRoute } from "@/app/api/student/readiness/route";
import { NextRequest } from "next/server";

describe("Step 3.4 — Evidence-Backed Skill Passport & Career Readiness", () => {
  const profileId = "demo-profile-id";

  beforeEach(() => {
    devStore.reset();
  });

  // --------------------------------------------------------------------------
  // 1. Three-Tier Skill Classification & Provenance Segregation
  // --------------------------------------------------------------------------
  describe("1. Three-Tier Skill Classification in Skill Passport", () => {
    it("strictly segregates self-reported, platform-assessed, and externally verified skills", async () => {
      // Setup demo student with:
      // 1 self-reported skill: 'Docker'
      // 1 platform-assessed skill: 'Python' (with verified diagnostic evidence)
      // 1 external credential: 'Ind AS Financial Reporting'
      await ProfileService.updateStudentProfile("demo.student@kaabil.in", {
        selfReportedSkills: [{ name: "Docker", proficiency: "BEGINNER" }],
      });

      devStore.saveSkillEvidence({
        id: "ev-py-01",
        studentProfileId: profileId,
        skillName: "Python",
        evidenceType: "AUTOMATED_ASSESSMENT",
        title: "Python Diagnostic Checkpoint",
        isVerified: true,
        scorePercentage: 88,
        verifiedAt: new Date().toISOString(),
        verifier: "KAABIL Assessment Engine",
      });

      devStore.saveSkillEvidence({
        id: "ev-ext-01",
        studentProfileId: profileId,
        skillName: "Ind AS Financial Reporting",
        evidenceType: "EXTERNAL_CREDENTIAL",
        title: "ICAI Technical Direct Tax Certificate",
        isVerified: true,
        scorePercentage: 92,
        verifiedAt: new Date().toISOString(),
        verifier: "Institute of Chartered Accountants of India",
      });

      const passport = await PassportService.generatePassport(profileId);

      expect(passport).toBeDefined();
      expect(passport.skills.length).toBeGreaterThanOrEqual(3);

      const docker = passport.skills.find((s) => s.skillName.toLowerCase() === "docker");
      const python = passport.skills.find((s) => s.skillName.toLowerCase() === "python");
      const indAs = passport.skills.find(
        (s) => s.skillName.toLowerCase().includes("ind as")
      );

      // 1. Docker MUST be SELF_REPORTED
      expect(docker).toBeDefined();
      expect(docker?.evidenceLayer).toBe("SELF_REPORTED");
      expect(docker?.isVerified).toBe(false);
      expect(docker?.canEditOrRemove).toBe(true);

      // 2. Python MUST be PLATFORM_ASSESSED
      expect(python).toBeDefined();
      expect(python?.evidenceLayer).toBe("PLATFORM_ASSESSED");
      expect(python?.isVerified).toBe(true);
      expect(python?.scorePercentage).toBe(88);
      expect(python?.canEditOrRemove).toBe(false);

      // 3. Ind AS MUST be EXTERNALLY_VERIFIED
      expect(indAs).toBeDefined();
      expect(indAs?.evidenceLayer).toBe("EXTERNALLY_VERIFIED");
      expect(indAs?.isVerified).toBe(true);
      expect(indAs?.canEditOrRemove).toBe(false);
    });

    it("NEVER automatically marks self-reported or self-directed project skills as verified (Rule 5 & 14)", async () => {
      // Record a self-directed project deliverable
      devStore.saveProjectEnrollment(profileId, "proj-pcm-001", {
        projectId: "proj-pcm-001",
        studentProfileId: profileId,
        status: "SUBMITTED",
        submissionUrl: "https://github.com/kaabil/my-app",
        submittedAt: new Date().toISOString(),
      });

      const passport = await PassportService.generatePassport(profileId);

      // Verify project submission exists
      expect(passport.projectSubmissions.length).toBeGreaterThanOrEqual(1);
      const proj = passport.projectSubmissions.find((p) => p.projectId === "proj-pcm-001");
      expect(proj).toBeDefined();
      expect(proj?.isVerified).toBe(false); // CRITICAL: Must be false!
      expect(proj?.evidenceType).toBe("SELF_DIRECTED_PROJECT");
    });
  });

  // --------------------------------------------------------------------------
  // 2. Self-Reported Skill Correction (Requirement 7)
  // --------------------------------------------------------------------------
  describe("2. Self-Reported Skill Correction & Removal", () => {
    it("allows student to correct or remove inaccurate self-reported claims", async () => {
      await ProfileService.updateStudentProfile("demo.student@kaabil.in", {
        selfReportedSkills: [
          { name: "Kubernetes Cluster Architecture", proficiency: "EXPERT" }, // Inaccurate claim
          { name: "HTML & CSS", proficiency: "INTERMEDIATE" },
        ],
      });

      // Remove the inaccurate claim
      const res = await PassportService.removeSelfReportedSkill(
        profileId,
        "Kubernetes Cluster Architecture"
      );

      expect(res.success).toBe(true);

      const passport = await PassportService.generatePassport(profileId);
      const k8s = passport.skills.find((s) => s.skillName.includes("Kubernetes"));
      expect(k8s).toBeUndefined(); // Successfully removed!

      // Genuine skill remains
      const html = passport.skills.find((s) => s.skillName.includes("HTML"));
      expect(html).toBeDefined();
    });

    it("prevents removal of verified skills via self-report correction", async () => {
      devStore.saveSkillEvidence({
        id: "ev-verified-node",
        studentProfileId: profileId,
        skillName: "Machine Learning Algorithms",
        evidenceType: "AUTOMATED_ASSESSMENT",
        isVerified: true,
      });

      // Attempt to remove verified skill via self-report removal
      await PassportService.removeSelfReportedSkill(
        profileId,
        "Machine Learning Algorithms"
      );

      const passport = await PassportService.generatePassport(profileId);
      const ml = passport.skills.find((s) => s.skillName.includes("Machine Learning"));
      expect(ml).toBeDefined();
      expect(ml?.isVerified).toBe(true); // Verified skill protected
    });
  });

  // --------------------------------------------------------------------------
  // 3. Explainable Career Readiness & Insufficient Evidence Guard (Rule 10)
  // --------------------------------------------------------------------------
  describe("3. Explainable Career Readiness & Insufficient Evidence Guard", () => {
    it("displays 'Not enough information yet' with null score for fresh unassessed student", async () => {
      // Non-existent or fresh empty profile
      const emptyResult = await CareerReadinessEngine.calculateReadiness(
        "fresh-empty-student-id"
      );

      expect(emptyResult.status).toBe("UNASSESSED");
      expect(emptyResult.overallScore).toBeNull(); // CRITICAL: Zero fabrication!
      expect(emptyResult.statusLabel).toContain("Unassessed");
      expect(emptyResult.isInsufficientEvidence).toBe(true);
      expect(emptyResult.nextBestAction).toBeDefined();
      expect(emptyResult.nextBestAction?.actionUrl).toBe("/student/assessments");
    });

    it("computes explainable readiness with 5 distinct preparation dimensions", async () => {
      const result = await CareerReadinessEngine.calculateReadiness(
        profileId,
        "ai-systems-engineer"
      );

      expect(result.careerSlug).toBe("ai-systems-engineer");
      expect(result.dimensions.careerKnowledge.weight).toBe(20);
      expect(result.dimensions.educationalPreparation.weight).toBe(25);
      expect(result.dimensions.skillDevelopment.weight).toBe(25);
      expect(result.dimensions.practicalLearning.weight).toBe(15);
      expect(result.dimensions.milestoneProgress.weight).toBe(15);

      const totalWeight =
        result.dimensions.careerKnowledge.weight +
        result.dimensions.educationalPreparation.weight +
        result.dimensions.skillDevelopment.weight +
        result.dimensions.practicalLearning.weight +
        result.dimensions.milestoneProgress.weight;
      expect(totalWeight).toBe(100);

      expect(result.calculationFormula).toContain("Readiness =");
      expect(result.nextBestAction).toBeDefined();
      expect(result.nextBestAction?.impactPoints).toBeGreaterThan(0);
      expect(result.disclaimer).toContain("does NOT predict admission probability");
    });
  });

  // --------------------------------------------------------------------------
  // 4. Age-Appropriate Privacy & DPDP Act Minor Shield (Requirements 13 & 14)
  // --------------------------------------------------------------------------
  describe("4. Age-Appropriate Sharing & DPDP Act Minor Protections", () => {
    it("locks public link generation and recruiter visibility for school students (Class 8-12 minors)", async () => {
      // Set student stage to CLASS_10 (Minor)
      await ProfileService.updateStudentProfile("demo.student@kaabil.in", {
        educationStage: "CLASS_10",
      });

      // Attempting to generate public share token for minor must be blocked
      await expect(
        PassportSharingService.createShareToken({
          studentProfileId: profileId,
          isMinor: true,
        })
      ).rejects.toThrow("UNDER_18_PROTECTION");

      const passport = await PassportService.generatePassport(profileId);
      expect(passport.privacy.isMinor).toBe(true);
      expect(passport.privacy.isPublic).toBe(false);
      expect(passport.privacy.allowRecruiterView).toBe(false);
    });

    it("generates expiring tokenized share link for adult students with sanitized privacy", async () => {
      // Adult student
      const shareResult = await PassportSharingService.createShareToken({
        studentProfileId: profileId,
        isMinor: false,
        expiryDays: 7,
      });

      expect(shareResult.token).toBeDefined();
      expect(shareResult.shareUrl).toContain("/verify/");
      expect(shareResult.expiresAt).toBeDefined();

      // Verify public sanitized representation
      const publicVerified = await PassportSharingService.verifyPublicShareToken(
        shareResult.token
      );
      expect(publicVerified.isValid).toBe(true);
      expect(publicVerified.student.displayName).toBeDefined();
      // Sanitized: raw address and contact numbers must not be exposed
      expect((publicVerified.student as any).phoneNumber).toBeUndefined();
      expect((publicVerified.student as any).fullAddress).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // 5. API Route Handlers
  // --------------------------------------------------------------------------
  describe("5. Step 3.4 API Route Handlers", () => {
    it("GET /api/student/passport returns complete passport with 3-tier skills", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/passport");
      const res = await getPassportRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.passport).toBeDefined();
      expect(data.passport.passportIntegrityChecksum).toBeDefined();
      expect(data.passport.careerReadiness).toBeDefined();
    });

    it("DELETE /api/student/passport removes an inaccurate self-reported skill", async () => {
      // First ensure a self-reported skill exists
      await ProfileService.updateStudentProfile("demo.student@kaabil.in", {
        selfReportedSkills: [{ name: "Rust", proficiency: "NOVICE" }],
      });

      const deleteReq = new NextRequest(
        "http://localhost:3000/api/student/passport?skillName=Rust",
        { method: "DELETE" }
      );
      const res = await deletePassportRoute(deleteReq);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain("Rust");
    });

    it("GET /api/student/readiness returns explainable CRI scorecard", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/readiness");
      const res = await getReadinessRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.readiness).toBeDefined();
      expect(data.readiness.dimensions).toBeDefined();
    });
  });
});
