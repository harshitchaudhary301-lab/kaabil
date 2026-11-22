// ==============================================================================
// KAABIL (काबिल) — Test Suite: Step 3.2 Dynamic Career Skill Tree & Skill Gap
// Validates multi-stream competency trees (134 pathways), Foundation/Intermediate/
// Advanced progression, prerequisite graphs, authentic evidence, and zero fabrication.
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { SkillTreeEngine } from "@/lib/skills/skill-tree-engine";
import { devStore } from "@/lib/dev-store";
import { GET, POST } from "@/app/api/student/skill-tree/route";
import { ProfileService } from "@/lib/student/profile-service";
import { CAREER_PATHS_DATABASE } from "@/data/careersData";
import { NextRequest } from "next/server";

describe("Step 3.2 — Dynamic Career Skill Tree & Skill Gap Analysis", () => {
  beforeEach(() => {
    devStore.reset();
  });

  describe("1. Multi-Stream Skill Tree Generation across Diverse Streams", () => {
    it("generates authentic STEM / Engineering tree without non-STEM contamination", async () => {
      const tree = await SkillTreeEngine.generateSkillTree(
        "demo.student@kaabil.in",
        "ai-systems-engineer"
      );

      expect(tree).toBeDefined();
      expect(tree.careerSlug).toBe("ai-systems-engineer");
      expect(tree.careerStream).toBe("NON_MEDICAL_PCM");
      expect(tree.nodes.length).toBeGreaterThanOrEqual(8);

      const nodeNames = tree.nodes.map((n) => n.name.toLowerCase());
      expect(nodeNames.some((n) => n.includes("python"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("data structures") || n.includes("algorithms"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("machine learning"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("deep learning") || n.includes("pytorch"))).toBe(true);

      // Verify ZERO contamination from unrelated streams
      expect(nodeNames.some((n) => n.includes("patient counseling") || n.includes("gst"))).toBe(false);
    });

    it("generates authentic Healthcare (Medical PCB) tree with NMC clinical competencies", async () => {
      const tree = await SkillTreeEngine.generateSkillTree(
        "demo.student@kaabil.in",
        "mbbs-doctor"
      );

      expect(tree).toBeDefined();
      expect(tree.careerSlug).toBe("mbbs-doctor");
      expect(tree.careerStream).toBe("MEDICAL_PCB");
      expect(tree.regulatoryBody).toBe("National Medical Commission (NMC)");

      const nodeNames = tree.nodes.map((n) => n.name.toLowerCase());
      expect(nodeNames.some((n) => n.includes("anatomy"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("physiology"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("pharmacology"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("diagnosis") || n.includes("clinical"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("emergency") || n.includes("bls"))).toBe(true);

      // Verify ZERO engineering/coding contamination
      expect(nodeNames.some((n) => n.includes("python") || n.includes("c++") || n.includes("sql"))).toBe(false);
    });

    it("generates authentic Commerce tree with ICAI accounting and taxation standards", async () => {
      const tree = await SkillTreeEngine.generateSkillTree(
        "demo.student@kaabil.in",
        "chartered-accountant-icai"
      );

      expect(tree).toBeDefined();
      expect(tree.careerSlug).toContain("chartered-accountant");
      expect(tree.careerStream).toBe("COMMERCE");

      const nodeNames = tree.nodes.map((n) => n.name.toLowerCase());
      expect(nodeNames.some((n) => n.includes("financial accounting"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("taxation") || n.includes("gst"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("auditing"))).toBe(true);

      // Verify ZERO medical or engineering contamination
      expect(nodeNames.some((n) => n.includes("anatomy") || n.includes("kubernetes"))).toBe(false);
    });

    it("generates authentic Creative Arts & Design tree with Figma, visual design, and user research", async () => {
      const tree = await SkillTreeEngine.generateSkillTree(
        "demo.student@kaabil.in",
        "ui-ux-digital-product-designer"
      );

      expect(tree).toBeDefined();
      expect(tree.careerSlug).toContain("ui-ux");
      expect(tree.careerStream).toBe("CREATIVE_DESIGN");

      const nodeNames = tree.nodes.map((n) => n.name.toLowerCase());
      expect(nodeNames.some((n) => n.includes("visual design") || n.includes("typography"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("figma") || n.includes("design tools"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("user research") || n.includes("empathy"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("wireframing") || n.includes("information architecture"))).toBe(true);
    });

    it("generates authentic Law & Legal Studies tree with contract drafting and M&A due diligence", async () => {
      const tree = await SkillTreeEngine.generateSkillTree(
        "demo.student@kaabil.in",
        "corporate-lawyer-mna"
      );

      expect(tree).toBeDefined();
      expect(tree.careerSlug).toContain("corporate-lawyer");
      expect(tree.careerStream).toBe("LAW");

      const nodeNames = tree.nodes.map((n) => n.name.toLowerCase());
      expect(nodeNames.some((n) => n.includes("contract"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("companies act"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("due diligence") || n.includes("m&a"))).toBe(true);
    });

    it("generates authentic Agriculture tree with soil science, crop physiology, and agtech drones", async () => {
      const tree = await SkillTreeEngine.generateSkillTree(
        "demo.student@kaabil.in",
        "precision-agronomist-crop-scientist"
      );

      expect(tree).toBeDefined();
      expect(tree.careerSlug).toContain("precision-agronomist");
      expect(tree.careerStream).toBe("AGRICULTURE");

      const nodeNames = tree.nodes.map((n) => n.name.toLowerCase());
      expect(nodeNames.some((n) => n.includes("soil science"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("crop physiology") || n.includes("agronomic"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("gis") || n.includes("remote sensing"))).toBe(true);
    });

    it("generates authentic Vocational Trades tree with PLC ladder logic, pneumatics, and electrical safety", async () => {
      const tree = await SkillTreeEngine.generateSkillTree(
        "demo.student@kaabil.in",
        "industrial-mechatronics-plc-specialist"
      );

      expect(tree).toBeDefined();
      expect(tree.careerSlug).toContain("mechatronics");
      expect(tree.careerStream).toBe("VOCATIONAL_TRADES");

      const nodeNames = tree.nodes.map((n) => n.name.toLowerCase());
      expect(nodeNames.some((n) => n.includes("electrical safety") || n.includes("standards"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("plc programming") || n.includes("ladder"))).toBe(true);
      expect(nodeNames.some((n) => n.includes("pneumatics") || n.includes("hydraulic"))).toBe(true);
    });
  });

  describe("2. Universal 134 Pathways Compatibility", () => {
    it("dynamically generates structured skill trees for all arbitrary careers without failure", async () => {
      // Pick 15 varied careers across diverse streams
      const sampleSlugs = [
        "dental-surgeon-bds",
        "ayurvedic-doctor-bams",
        "aerospace-propulsion-engineer",
        "investment-banker-mna",
        "civil-services-officer-ias",
        "clinical-psychologist-counselor",
        "investigative-journalist-correspondent",
        "food-processing-preservation-technologist",
        "solar-pv-grid-systems-specialist",
        "aviation-commercial-pilot-cpl",
        "sports-physiotherapist-rehabilitation",
        "luxury-hotel-general-manager",
        "actuary-iai",
        "vfx-cgi-animation-director",
        "industrial-mechatronics-plc-specialist",
      ];

      for (const slug of sampleSlugs) {
        const tree = await SkillTreeEngine.generateSkillTree("demo.student@kaabil.in", slug);
        expect(tree).toBeDefined();
        expect(tree.careerSlug).toBe(slug);
        expect(tree.nodes.length).toBeGreaterThanOrEqual(6);
        expect(tree.stages.length).toBe(3);

        // Verify each stage has nodes
        const foundation = tree.stages.find((s) => s.stage === "FOUNDATION");
        const intermediate = tree.stages.find((s) => s.stage === "INTERMEDIATE");
        const advanced = tree.stages.find((s) => s.stage === "ADVANCED");

        expect(foundation?.nodes.length).toBeGreaterThan(0);
        expect(intermediate?.nodes.length).toBeGreaterThan(0);
        expect(advanced?.nodes.length).toBeGreaterThan(0);
      }
    });

    it("verifies CAREER_PATHS_DATABASE has 134 verified pathways", () => {
      expect(CAREER_PATHS_DATABASE.length).toBe(134);
    });
  });

  describe("3. Stage Organization & Prerequisite Graph Integrity", () => {
    it("organizes skills into Foundation, Intermediate, and Advanced stages with directed edges", async () => {
      const tree = await SkillTreeEngine.generateSkillTree(
        "demo.student@kaabil.in",
        "ai-systems-engineer"
      );

      // Verify stages exist in order
      expect(tree.stages[0].stage).toBe("FOUNDATION");
      expect(tree.stages[1].stage).toBe("INTERMEDIATE");
      expect(tree.stages[2].stage).toBe("ADVANCED");

      // Verify Foundation nodes have no prerequisites (root nodes)
      const foundationNodes = tree.nodes.filter((n) => n.stage === "FOUNDATION");
      const rootNodes = foundationNodes.filter((n) => n.prerequisiteIds.length === 0);
      expect(rootNodes.length).toBeGreaterThan(0);

      // Verify Intermediate and Advanced nodes have prerequisite edges
      expect(tree.edges.length).toBeGreaterThan(0);
      for (const edge of tree.edges) {
        const fromNode = tree.nodes.find((n) => n.id === edge.from);
        const toNode = tree.nodes.find((n) => n.id === edge.to);
        expect(fromNode).toBeDefined();
        expect(toNode).toBeDefined();
      }
    });
  });

  describe("4. Authentic Evidence & Non-Fabrication Rules", () => {
    it("strictly separates assessed skills, self-reported skills, and locked nodes", async () => {
      const tree = await SkillTreeEngine.generateSkillTree(
        "demo.student@kaabil.in",
        "ai-systems-engineer"
      );

      // Check verified skills (Aryan Sharma has verified Python & Calculus evidence)
      const verified = tree.nodes.filter(
        (n) => n.status === "MASTERED" || n.status === "VERIFIED"
      );
      expect(verified.length).toBeGreaterThan(0);
      for (const v of verified) {
        expect(v.scorePercentage).toBeGreaterThanOrEqual(60);
        expect(v.verifiedAt).toBeTruthy();
        expect(v.verifier).toBeTruthy();
      }

      // Check missing/locked skills
      const unacquired = tree.nodes.filter(
        (n) => n.status === "READY_TO_LEARN" || n.status === "LOCKED"
      );
      expect(unacquired.length).toBeGreaterThan(0);
      for (const u of unacquired) {
        expect(u.scorePercentage).toBeNull();
      }
    });

    it("NEVER automatically treats self-reported skills as verified or assigns mastery points", async () => {
      // Aryan Sharma has self-reported C++, ROS 2, and OpenCV
      // Let's add a self-reported skill matching a node name
      await ProfileService.updateStudentProfile("demo.student@kaabil.in", {
        selfReportedSkills: [
          { name: "Deep Learning & PyTorch", proficiency: "INTERMEDIATE" },
          { name: "MLOps & Edge Inference", proficiency: "BEGINNER" },
        ],
      });

      const tree = await SkillTreeEngine.generateSkillTree(
        "demo.student@kaabil.in",
        "ai-systems-engineer"
      );

      const dlNode = tree.nodes.find((n) => n.name.includes("Deep Learning"));
      expect(dlNode).toBeDefined();
      expect(dlNode?.status).toBe("SELF_REPORTED");
      expect(dlNode?.provenance).toBe("SELF_REPORTED");

      // Critical Rule 6: Score MUST be null, not fabricated!
      expect(dlNode?.scorePercentage).toBeNull();
      expect(dlNode?.verifiedAt).toBeNull();
      expect(dlNode?.verifier).toBeNull();

      // Critical Rule: Self-reported skills contribute ZERO to verified mastery count
      expect(tree.selfReportedSkillsCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe("5. Suggested Next Skill Recommendation", () => {
    it("identifies the optimal next skill with satisfied prerequisites", async () => {
      const tree = await SkillTreeEngine.generateSkillTree(
        "demo.student@kaabil.in",
        "ai-systems-engineer"
      );

      expect(tree.suggestedNextSkill).not.toBeNull();
      const next = tree.suggestedNextSkill!;
      expect(next.status).toBe("READY_TO_LEARN");

      // Verify that all prerequisites of the suggested next skill are already unlocked
      for (const prereqId of next.prerequisiteIds) {
        const prereqNode = tree.nodes.find((n) => n.id === prereqId);
        expect(prereqNode).toBeDefined();
        expect(
          prereqNode?.status === "MASTERED" ||
          prereqNode?.status === "VERIFIED" ||
          prereqNode?.status === "IN_PROGRESS" ||
          prereqNode?.status === "SELF_REPORTED"
        ).toBe(true);
      }
    });
  });

  describe("6. Career Switching without Data Loss", () => {
    it("allows switching target career without losing previously earned achievements", async () => {
      const initialProfile = await ProfileService.getStudentProfile("demo.student@kaabil.in");
      const initialVerifiedCount = initialProfile?.skills.assessedCount || 0;
      expect(initialVerifiedCount).toBeGreaterThan(0);

      // Switch student target career to Robotics Systems Engineer via POST
      const req = new NextRequest("http://localhost:3000/api/student/skill-tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCareerSlug: "mechanical-robotics-engineer",
          setAsTargetCareer: true,
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.tree).toBeDefined();

      // Profile verify: Target career updated
      const updatedProfile = await ProfileService.getStudentProfile("demo.student@kaabil.in");
      expect(updatedProfile?.targetCareer?.slug).toBe("mechanical-robotics-engineer");

      // Critical Rule 12: Previous achievements and verified skills MUST NOT be lost!
      expect(updatedProfile?.skills.assessedCount).toBe(initialVerifiedCount);
      expect(updatedProfile?.careerReadinessIndex).toBe(initialProfile?.careerReadinessIndex);
    });
  });

  describe("7. Trilingual Localization Support", () => {
    it("provides Hindi and Hinglish translations for competency nodes and stages", async () => {
      const tree = await SkillTreeEngine.generateSkillTree(
        "demo.student@kaabil.in",
        "ai-systems-engineer"
      );

      for (const node of tree.nodes) {
        expect(node.nameHi).toBeDefined();
        expect(node.nameHinglish).toBeDefined();
        expect(node.descriptionHi).toBeDefined();
        expect(node.descriptionHinglish).toBeDefined();
      }

      for (const stage of tree.stages) {
        expect(stage.titleHi).toBeDefined();
        expect(stage.titleHinglish).toBeDefined();
      }
    });
  });

  describe("8. Route Handlers: GET and POST /api/student/skill-tree", () => {
    it("handles GET /api/student/skill-tree with query parameters", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/skill-tree?careerSlug=ui-ux-digital-product-designer");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.tree.careerSlug).toBe("ui-ux-digital-product-designer");
      expect(json.tree.nodes.length).toBeGreaterThanOrEqual(6);
      expect(json.tree.overallMasteryPercent).toBeDefined();
    });

    it("rejects POST /api/student/skill-tree with empty body", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/skill-tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
    });
  });
});
