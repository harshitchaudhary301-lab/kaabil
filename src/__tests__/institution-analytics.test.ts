import { describe, it, expect, beforeEach } from "vitest";
import { AnalyticsService } from "@/lib/institution/analytics-service";
import { devStore } from "@/lib/dev-store";
import { DepartmentSkillHeatmap } from "@/types/institution";

describe("KAABIL Institution Analytics & Multi-Stream Skill Heatmap (Milestone E2.1)", () => {
  const testRunId = `${Date.now().toString(36)}-${Math.floor(Math.random() * 100000)}`;
  const instId = `inst-anl-${testRunId}`;

  beforeEach(() => {
    // Setup institution
    devStore.saveInstitution({
      id: instId,
      name: `Delhi Institute of Technology & Research ${testRunId}`,
      slug: `ditr-${testRunId}`,
      orgType: "UNIVERSITY",
      verificationStatus: "VERIFIED",
      officialEmail: `admin@ditr-${testRunId}.edu`,
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      supportedStreams: ["NON_MEDICAL_PCM", "MEDICAL_PCB", "COMMERCE", "LAW", "VOCATIONAL_TRADES"],
      authorizedPersonName: "Dr. K. Verma",
      authorizedPersonDesignation: "Dean Academic Affairs",
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create departments
    devStore.saveDepartment({
      id: `dept-cs-${testRunId}`,
      institutionId: instId,
      name: "Computer Science & Engineering",
      code: "CSE",
      stream: "NON_MEDICAL_PCM",
      studentCount: 2,
      facultyCount: 2,
      createdAt: new Date().toISOString(),
    });

    devStore.saveDepartment({
      id: `dept-med-${testRunId}`,
      institutionId: instId,
      name: "Clinical Life Sciences & Medicine",
      code: "MED",
      stream: "MEDICAL_PCB",
      studentCount: 1,
      facultyCount: 1,
      createdAt: new Date().toISOString(),
    });

    // Create student enrollments
    const stu1 = {
      id: `se-1-${testRunId}`,
      institutionId: instId,
      studentProfileId: `sp-1-${testRunId}`,
      studentName: "Aditya Kumar",
      studentEmail: `aditya.${testRunId}@gmail.com`,
      rollNumber: "CSE-01",
      departmentId: `dept-cs-${testRunId}`,
      departmentName: "Computer Science & Engineering",
      stream: "NON_MEDICAL_PCM",
      stage: "UNDERGRADUATE",
      isMinor: false,
      guardianConsent: "NOT_REQUIRED",
      onboardingCompleted: true,
      readinessIndex: 78,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const stu2 = {
      id: `se-2-${testRunId}`,
      institutionId: instId,
      studentProfileId: `sp-2-${testRunId}`,
      studentName: "Pooja Patel",
      studentEmail: `pooja.${testRunId}@gmail.com`,
      rollNumber: "CSE-02",
      departmentId: `dept-cs-${testRunId}`,
      departmentName: "Computer Science & Engineering",
      stream: "NON_MEDICAL_PCM",
      stage: "UNDERGRADUATE",
      isMinor: false,
      guardianConsent: "NOT_REQUIRED",
      onboardingCompleted: true,
      readinessIndex: 42,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    devStore.saveStudentEnrollment(stu1);
    devStore.saveStudentEnrollment(stu2);

    // Save skill evidence for stu1
    devStore.saveSkillEvidence({
      id: `ev-1-${testRunId}`,
      studentProfileId: `sp-1-${testRunId}`,
      skillId: "python",
      skillName: "Python",
      stream: "NON_MEDICAL_PCM",
      category: "TECHNICAL_CORE",
      evidenceType: "PLATFORM_ASSESSED",
      title: "Data Structures in Python",
      issuer: "KAABIL Assessment Engine",
      score: 85,
      isVerified: true,
      createdAt: new Date().toISOString(),
    });
  });

  describe("Department Skill Heatmap Generation", () => {
    it("computes department skill competencies with demonstrated and benchmark breakdown", async () => {
      const heatmaps = await AnalyticsService.getSkillHeatmap(instId);
      expect(heatmaps).toBeDefined();
      expect(heatmaps.length).toBeGreaterThan(0);

      const csHeatmap = heatmaps.find((h: DepartmentSkillHeatmap) => h.departmentName.includes("Computer"));
      expect(csHeatmap).toBeDefined();
      expect(csHeatmap?.stream).toBe("NON_MEDICAL_PCM");
      expect(csHeatmap?.competencies.length).toBeGreaterThan(0);

      // Check competency data structure
      const comp = csHeatmap?.competencies[0];
      expect(comp).toHaveProperty("skillName");
      expect(comp).toHaveProperty("demonstratedPercent");
      expect(comp).toHaveProperty("benchmarkCoveragePercent");
      expect(comp).toHaveProperty("status");
    });

    it("filters heatmap by stream correctly", async () => {
      const pcbHeatmaps = await AnalyticsService.getSkillHeatmap(instId, {
        stream: "MEDICAL_PCB",
      });
      expect(pcbHeatmaps.length).toBe(1);
      expect(pcbHeatmaps[0].stream).toBe("MEDICAL_PCB");
    });
  });

  describe("Curated Industry Demand Intelligence", () => {
    it("returns curated industry demand data with verified council/statutory sources", () => {
      const demandRecords = AnalyticsService.getIndustryDemand();
      expect(demandRecords.length).toBeGreaterThan(0);

      // Verify each record has statutory attribution and no fabricated live stats
      const validSources = [
        "NASSCOM",
        "Healthcare",
        "HSSC",
        "BFSI",
        "Bar Council",
        "BCI",
        "National Skill",
        "NSDC",
        "Agriculture Skill",
        "ASCI",
        "Media & Entertainment",
        "MESC",
      ];

      for (const rec of demandRecords) {
        expect(rec.sourceAttribution).toBeDefined();
        expect(rec.collectionDate).toBeDefined();
        expect(rec.topSkills.length).toBeGreaterThan(0);
        const matchesSource = validSources.some((s) => rec.sourceAttribution.includes(s));
        expect(matchesSource).toBe(true);
      }
    });

    it("filters industry demand intelligence by specific stream", () => {
      const lawDemand = AnalyticsService.getIndustryDemand("LAW");
      expect(lawDemand.length).toBe(1);
      expect(lawDemand[0].sector).toBe("Legal Practice & Corporate Regulatory Compliance");
      expect(lawDemand[0].sourceAttribution).toContain("Bar Council of India");
    });
  });
});
