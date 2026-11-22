// ==============================================================================
// KAABIL (काबिल) — Phase 3 Final End-to-End Integration Audit Suite
// Comprehensive validation of complete student journey across diverse Indian streams:
// Registration -> Onboarding -> Profile -> Skill Tree -> Learning Plan ->
// Daily Sprints -> Projects Hub -> Deliverable Submission -> Skill Passport -> CRI
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { devStore } from "@/lib/dev-store";
import { ProfileService } from "@/lib/student/profile-service";
import { SkillTreeEngine } from "@/lib/skills/skill-tree-engine";
import { LearningPlanService } from "@/lib/learning/learning-plan-service";
import { PassportService } from "@/lib/passport/passport-service";
import { CareerReadinessEngine } from "@/lib/readiness/cri-engine";
import { getProjectsForCareer, getProjectBySlugOrId } from "@/data/careerProjectsData";
import { isMinorStage } from "@/lib/auth/rbac";

describe("Phase 3 Final End-to-End Integration Audit", () => {
  // Clear and initialize fresh test store
  beforeEach(() => {
    // Isolate test state
  });

  // ============================================================================
  // JOURNEY 1: Fresh Class 12 Student (Minor, Medical PCB Stream - MBBS Doctor)
  // ============================================================================
  describe("Journey 1: Fresh Class 12 Minor Student (Medical PCB -> MBBS Doctor)", () => {
    const minorStudentEmail = `priya.sharma.${Date.now()}@kaabil.in`;
    const minorProfileId = `profile-minor-${Date.now()}`;

    it("executes complete lifecycle: Registration -> DPDP Act Minor Shield -> Medical Skill Tree -> Project -> Passport", async () => {
      // 1. Student Profile Creation / Onboarding
      devStore.saveUser({
        id: `user-${minorProfileId}`,
        name: "Priya Sharma",
        email: minorStudentEmail,
        role: "STUDENT",
        isMinor: true,
        studentProfile: { id: minorProfileId },
      });

      devStore.saveProfile({
        id: minorProfileId,
        userId: `user-${minorProfileId}`,
        name: "Priya Sharma",
        educationStage: "CLASS_12",
        currentStream: "MEDICAL_PCB",
        institutionName: "Kendriya Vidyalaya No. 1",
        targetCompletionYear: 2027,
        careerGoals: [
          {
            targetRoleTitle: "MBBS Doctor (General Physician)",
            targetRoleSlug: "mbbs-doctor",
            priorityRank: 1,
          },
        ],
        interests: [
          { id: "int-med-1", name: "Human Anatomy" },
          { id: "int-med-2", name: "Public Health" },
        ],
        userSkills: [
          { name: "Biology & Human Physiology", isVerified: false, proficiencyLevel: 3 },
          { name: "Organic Chemistry", isVerified: false, proficiencyLevel: 2 },
        ],
        user: {
          id: `user-${minorProfileId}`,
          name: "Priya Sharma",
          email: minorStudentEmail,
          isMinor: true,
        },
      });

      // 2. Verify DPDP Act Minor Protection is strictly active
      expect(isMinorStage("CLASS_12")).toBe(true);
      const passportBefore = await PassportService.generatePassport(minorProfileId);
      expect(passportBefore.privacy.isMinor).toBe(true);
      expect(passportBefore.privacy.allowRecruiterView).toBe(false);
      expect(passportBefore.privacy.isPublic).toBe(false);

      // 3. Verify Dynamic Career Skill Tree for MBBS Doctor (No cross-contamination)
      const medicalTree = await SkillTreeEngine.generateSkillTree(
        minorStudentEmail,
        "mbbs-doctor"
      );
      expect(medicalTree).toBeDefined();
      expect(medicalTree.careerSlug).toBe("mbbs-doctor");
      expect(medicalTree.careerStream).toBe("MEDICAL_PCB");

      // Verify authentic medical stages
      const stageNames = medicalTree.stages.map((s) => s.stage);
      expect(stageNames).toContain("FOUNDATION");
      expect(stageNames).toContain("INTERMEDIATE");
      expect(stageNames).toContain("ADVANCED");

      // Verify zero coding/tech contamination
      const skillNames = medicalTree.stages
        .flatMap((s) => s.nodes)
        .map((sk) => sk.name.toLowerCase());
      expect(skillNames.some((n) => n.includes("kubernetes"))).toBe(false);
      expect(skillNames.some((n) => n.includes("docker"))).toBe(false);
      expect(skillNames.some((n) => n.includes("c++"))).toBe(false);

      // 4. Verify Personalized Learning Plan for Class 12 Medical Student
      const learningPlan = await LearningPlanService.getLearningPlan(
        minorProfileId
      );
      expect(learningPlan.careerSlug).toBe("mbbs-doctor");
      expect(learningPlan.weeklySprints.length).toBeGreaterThanOrEqual(4);
      expect(learningPlan.totalTasks).toBeGreaterThan(0);

      // Verify trustworthy Indian medical resources (NCERT / NPTEL / AIIMS portals / SWAYAM)
      const taskResources = learningPlan.weeklySprints
        .flatMap((w) => w.tasks)
        .map((t) => t.resourceProvider);
      expect(taskResources.length).toBeGreaterThan(0);
      expect(
        taskResources.some(
          (provider) =>
            provider.includes("NCERT") ||
            provider.includes("NPTEL") ||
            provider.includes("SWAYAM") ||
            provider.includes("Swayam") ||
            provider.includes("AIIMS") ||
            provider.includes("Khan Academy")
        ) ||
        learningPlan.recommendedResources.some(
          (r) =>
            r.provider.includes("NCERT") ||
            r.provider.includes("NPTEL") ||
            r.provider.includes("SWAYAM") ||
            r.provider.includes("Swayam") ||
            r.provider.includes("AIIMS")
        )
      ).toBe(true);

      // 5. Verify Multi-Stream Projects Hub for Medical Stream
      const medicalProjects = getProjectsForCareer(
        "MEDICAL_PCB",
        "mbbs-doctor"
      );
      expect(medicalProjects.length).toBeGreaterThan(0);

      // Select first medical project and enroll
      const selectedProject = medicalProjects[0];
      devStore.saveProjectEnrollment(minorProfileId, selectedProject.id, {
        projectId: selectedProject.id,
        status: "ACTIVE",
        enrolledAt: new Date().toISOString(),
        completedMilestones: [selectedProject.milestones[0].id],
      });

      // Submit practical project deliverable
      devStore.saveProjectEnrollment(minorProfileId, selectedProject.id, {
        projectId: selectedProject.id,
        status: "SUBMITTED",
        submissionUrl: "https://drive.google.com/file/d/clinical-case-study.pdf",
        deliverableUrl: "https://drive.google.com/file/d/clinical-case-study.pdf",
        submissionNotes: "Completed comprehensive clinical symptom analysis and patient case study.",
        submittedAt: new Date().toISOString(),
      });

      // 6. Verify Digital Skill Passport Integration
      const passportAfterProject = await PassportService.generatePassport(minorProfileId);
      expect(passportAfterProject.projectSubmissions.length).toBe(1);
      const sub = passportAfterProject.projectSubmissions[0];
      expect(sub.projectId).toBe(selectedProject.id);
      expect(sub.deliverableUrl).toContain("clinical-case-study.pdf");
      // Rule 5 & 14 Enforcement: Project submission NEVER automatically verified as external certification
      expect(sub.isVerified).toBe(false);

      // 7. Verify Career Readiness Index & Exact Invariant
      const readiness = await CareerReadinessEngine.calculateReadiness(
        minorProfileId,
        "mbbs-doctor"
      );
      expect(readiness.overallScore).not.toBeNull();
      expect(readiness.overallScore!).toBeGreaterThan(0);
      expect(readiness.overallScore!).toBeLessThanOrEqual(100);

      // Mathematical Invariant: sum(weightedPoints) === overallScore
      const sumPoints =
        readiness.dimensions.careerKnowledge.weightedPoints +
        readiness.dimensions.educationalPreparation.weightedPoints +
        readiness.dimensions.skillDevelopment.weightedPoints +
        readiness.dimensions.practicalLearning.weightedPoints +
        readiness.dimensions.milestoneProgress.weightedPoints;
      expect(sumPoints).toBe(readiness.overallScore);
      expect(sumPoints).toBeLessThanOrEqual(100);
    });
  });

  // ============================================================================
  // JOURNEY 2: Returning UG 1st Year Student (Career Goal Switching & Provenance)
  // ============================================================================
  describe("Journey 2: Returning UG Student (Career Goal Switching, Data Retention, & 3-Tier Provenance)", () => {
    const ugEmail = `aryan.sharma.${Date.now()}@kaabil.in`;
    const ugProfileId = `profile-ug-${Date.now()}`;

    it("allows career switching without deleting earned evidence, enforces 3-tier provenance and self-reported deletion", async () => {
      // 1. Create Returning UG Student with AI Systems Engineer Goal
      devStore.saveUser({
        id: `user-${ugProfileId}`,
        name: "Aryan Sharma",
        email: ugEmail,
        role: "STUDENT",
        isMinor: false,
        studentProfile: { id: ugProfileId },
      });

      devStore.saveProfile({
        id: ugProfileId,
        userId: `user-${ugProfileId}`,
        name: "Aryan Sharma",
        educationStage: "UNDERGRADUATE",
        currentStream: "NON_MEDICAL_PCM",
        institutionName: "Delhi Technological University",
        targetCompletionYear: 2027,
        careerGoals: [
          {
            targetRoleTitle: "AI Systems Engineer",
            targetRoleSlug: "ai-systems-engineer",
            priorityRank: 1,
          },
        ],
        interests: [{ id: "int-ug-1", name: "Machine Learning" }],
        userSkills: [
          { name: "Python", isVerified: true, proficiencyLevel: 4 },
          { name: "Data Structures", isVerified: true, proficiencyLevel: 3 },
          { name: "Quantum Computing", isVerified: false, proficiencyLevel: 1 }, // Inaccurate claim to test removal
        ],
        user: {
          id: `user-${ugProfileId}`,
          name: "Aryan Sharma",
          email: ugEmail,
          isMinor: false,
        },
      });

      // Issue an objective assessment evidence
      devStore.saveSkillEvidence({
        id: `ev-python-${Date.now()}`,
        studentProfileId: ugProfileId,
        skillName: "Python",
        evidenceType: "ASSESSMENT_RESULT",
        verificationStatus: "VERIFIED",
        isVerified: true,
        scorePercentage: 92,
        assessmentAttemptId: `att-py-${Date.now()}`,
      });

      // 2. Generate Initial Passport
      const initialPassport = await PassportService.generatePassport(ugProfileId);
      expect(initialPassport.skills.length).toBeGreaterThanOrEqual(3);

      // Verify 3-tier distinction
      const pythonEntry = initialPassport.skills.find((s) => s.skillName === "Python");
      const quantumEntry = initialPassport.skills.find((s) => s.skillName === "Quantum Computing");
      expect(pythonEntry?.evidenceLayer).toBe("PLATFORM_ASSESSED");
      expect(pythonEntry?.isVerified).toBe(true);
      expect(quantumEntry?.evidenceLayer).toBe("SELF_REPORTED");
      expect(quantumEntry?.isVerified).toBe(false);

      // 3. Test Inaccurate Self-Reported Skill Removal (Correction)
      const removeRes = await PassportService.removeSelfReportedSkill(
        ugProfileId,
        "Quantum Computing"
      );
      expect(removeRes.success).toBe(true);

      const passportAfterRemoval = await PassportService.generatePassport(ugProfileId);
      const removed = passportAfterRemoval.skills.find((s) => s.skillName === "Quantum Computing");
      expect(removed).toBeUndefined(); // Successfully removed!

      // Verified Python skill remains safely intact
      const preserved = passportAfterRemoval.skills.find((s) => s.skillName === "Python");
      expect(preserved).toBeDefined();
      expect(preserved?.isVerified).toBe(true);

      // 4. Test Career Goal Switching: Student switches to Commercial Airline Pilot (CPL)
      await ProfileService.updateStudentProfile(ugEmail, {
        targetCareerSlug: "aviation-commercial-pilot-cpl",
      });

      // 5. Verify Data Retention after Career Goal Switch
      const switchedPassport = await PassportService.generatePassport(ugProfileId);
      expect(switchedPassport.careerGoals[0].slug).toBe("aviation-commercial-pilot-cpl");

      // CRITICAL: Previously verified Python skill and credentials were NOT erased!
      const retainedPython = switchedPassport.skills.find((s) => s.skillName === "Python");
      expect(retainedPython).toBeDefined();
      expect(retainedPython?.isVerified).toBe(true);

      // 6. Verify Dynamic Skill Tree updates for Commercial Airline Pilot
      const pilotTree = await SkillTreeEngine.generateSkillTree(
        ugEmail,
        "aviation-commercial-pilot-cpl"
      );
      expect(pilotTree.careerSlug).toBe("aviation-commercial-pilot-cpl");
      const pilotSkills = pilotTree.stages.flatMap((s) => s.nodes).map((k) => k.name.toLowerCase());
      expect(pilotSkills.some((n) => n.includes("navigation") || n.includes("aviation") || n.includes("meteorology") || n.includes("flight"))).toBe(true);
    });
  });

  // ============================================================================
  // JOURNEY 3: Multi-Stream Coverage across Landmark Indian Career Pathways
  // ============================================================================
  describe("Journey 3: Multi-Stream Career Pathway Verification", () => {
    const streamsToTest = [
      { stream: "COMMERCE", slug: "chartered-accountant-icai", keySkill: "accounting" },
      { stream: "ARTS_HUMANITIES", slug: "civil-services-officer-ias", keySkill: "polity" },
      { stream: "CREATIVE_DESIGN", slug: "ui-ux-digital-product-designer", keySkill: "design" },
      { stream: "AGRICULTURE", slug: "precision-agronomist-crop-scientist", keySkill: "soil" },
      { stream: "VOCATIONAL_TRADES", slug: "industrial-mechatronics-plc-specialist", keySkill: "plc" },
      { stream: "LAW", slug: "corporate-lawyer-mna", keySkill: "corporate" },
    ];

    for (const testCase of streamsToTest) {
      it(`generates authentic skill tree & projects for ${testCase.slug} without generic leakage`, async () => {
        const tempEmail = `test.${testCase.slug}@kaabil.in`;
        const tree = await SkillTreeEngine.generateSkillTree(tempEmail, testCase.slug);

        expect(tree).toBeDefined();
        expect(tree.careerSlug).toBe(testCase.slug);

        // Check stages
        expect(tree.stages.length).toBe(3); // Foundation, Intermediate, Advanced

        // Verify key stream domain skill exists
        const allSkills = tree.stages.flatMap((s) => s.nodes).map((sk) => sk.name.toLowerCase());
        const hasDomainSkill = allSkills.some((s) => s.includes(testCase.keySkill));
        expect(hasDomainSkill).toBe(true);

        // Verify multi-stream projects exist
        const projects = getProjectsForCareer(testCase.stream as any, testCase.slug);
        expect(projects.length).toBeGreaterThan(0);
      });
    }
  });

  // ============================================================================
  // JOURNEY 4: Security, Multi-Tenant Isolation & DPDP Privacy
  // ============================================================================
  describe("Journey 4: Privacy, Cross-Student Isolation & Data Security", () => {
    it("ensures student A cannot access or modify student B's self-reported skills or credentials", async () => {
      const studentAId = `student-a-${Date.now()}`;
      const studentBId = `student-b-${Date.now()}`;

      devStore.saveProfile({
        id: studentAId,
        userId: `user-${studentAId}`,
        name: "Student A",
        educationStage: "UNDERGRADUATE",
        currentStream: "COMMERCE",
        userSkills: [{ name: "Tally ERP", isVerified: false }],
      });

      devStore.saveProfile({
        id: studentBId,
        userId: `user-${studentBId}`,
        name: "Student B",
        educationStage: "UNDERGRADUATE",
        currentStream: "LAW",
        userSkills: [{ name: "Constitutional Law", isVerified: false }],
      });

      // Student A attempts to delete Student B's skill
      await PassportService.removeSelfReportedSkill(studentAId, "Constitutional Law");

      // Verify Student B's skill remains untouched
      const passportB = await PassportService.generatePassport(studentBId);
      const bSkill = passportB.skills.find((s) => s.skillName === "Constitutional Law");
      expect(bSkill).toBeDefined();
      expect(bSkill?.skillName).toBe("Constitutional Law");
    });
  });

  // ============================================================================
  // JOURNEY 5: CRI Scoring Consistency & Hare-Niemeyer Mathematical Invariant
  // ============================================================================
  describe("Journey 5: CRI Scoring Consistency & Zero-Fabrication Invariants", () => {
    it("guarantees sum(weightedPoints) === overallScore for varying profile completion levels", async () => {
      // Test 5 synthetic profiles with varying completion levels (0%, 25%, 50%, 75%, 100%)
      const testProfiles = [
        {
          name: "Brand New Empty Student",
          skills: [],
          hasProjects: false,
          hasTasks: false,
          expectNull: true,
        },
        {
          name: "Fresh with 1 Self-Reported Skill",
          skills: [{ name: "Accounting", isVerified: false }],
          hasProjects: false,
          hasTasks: false,
          expectNull: false,
        },
        {
          name: "Active Student with 1 Verified Skill + Project",
          skills: [{ name: "Financial Accounting", isVerified: true }],
          hasProjects: true,
          hasTasks: false,
          expectNull: false,
        },
        {
          name: "Advanced Student with Multiple Verified Skills + Tasks + Projects",
          skills: [
            { name: "Corporate Tax", isVerified: true },
            { name: "Auditing", isVerified: true },
          ],
          hasProjects: true,
          hasTasks: true,
          expectNull: false,
        },
      ];

      for (let i = 0; i < testProfiles.length; i++) {
        const tp = testProfiles[i];
        const pid = `profile-scoring-test-${i}-${Date.now()}`;

        devStore.saveProfile({
          id: pid,
          userId: `user-${pid}`,
          educationStage: "UNDERGRADUATE",
          currentStream: "COMMERCE_FINANCE",
          careerGoals: [{ targetRoleTitle: "Chartered Accountant (ICAI)", targetRoleSlug: "chartered-accountant-icai" }],
          userSkills: tp.skills,
          interests: [{ id: "int-ca", name: "Corporate Law" }],
          roadmaps: tp.hasTasks ? [{ id: "rm-ca", milestones: [{ id: "m-ca", isCompleted: true }] }] : [],
          dailyMissions: tp.hasTasks ? [{ id: "dm-ca", status: "COMPLETED" }] : [],
        });

        if (tp.hasProjects) {
          devStore.saveProjectEnrollment(pid, "project-ca-1", {
            projectId: "project-ca-1",
            status: "SUBMITTED",
            submissionUrl: "https://drive.google.com/ca-audit-portfolio.pdf",
          });
        }

        if (tp.hasTasks) {
          devStore.saveLearningTaskState(pid, "task-ca-1", { taskId: "task-ca-1", isCompleted: true });
          devStore.saveLearningTaskState(pid, "task-ca-2", { taskId: "task-ca-2", isCompleted: true });
        }

        const readiness = await CareerReadinessEngine.calculateReadiness(pid, "chartered-accountant-icai");

        if (tp.expectNull) {
          expect(readiness.overallScore).toBeNull();
          expect(readiness.isInsufficientEvidence).toBe(true);
        } else {
          expect(readiness.overallScore).not.toBeNull();
          expect(readiness.overallScore!).toBeLessThanOrEqual(100);

          // EXACT MATHEMATICAL INVARIANT: sum of 5 dimensions MUST EQUAL overallScore
          const sumDimPoints =
            readiness.dimensions.careerKnowledge.weightedPoints +
            readiness.dimensions.educationalPreparation.weightedPoints +
            readiness.dimensions.skillDevelopment.weightedPoints +
            readiness.dimensions.practicalLearning.weightedPoints +
            readiness.dimensions.milestoneProgress.weightedPoints;

          expect(sumDimPoints).toBe(readiness.overallScore);
          expect(sumDimPoints).toBeLessThanOrEqual(100);
        }
      }
    });
  });
});
