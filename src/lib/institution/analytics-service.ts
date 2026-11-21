// ==============================================================================
// KAABIL (काबिल) — Multi-Stream Skill Analytics & Industry Demand Service
// Cohort competency matrices, verified vs self-reported coverage, and statutory demand.
// Universal support across all 13 educational streams and institution types.
// ==============================================================================

import { devStore } from "@/lib/dev-store";
import {
  DepartmentSkillHeatmap,
  SkillHeatmapCompetency,
  IndustryDemandRecord,
} from "@/types/institution";
import { EducationalStream } from "@/types";
import { CAREER_REQUIREMENTS } from "@/data/careerRequirementsData";

export class AnalyticsService {
  /**
   * Computes the Multi-Stream Skill Analytics Heatmap for an institution.
   * Compares enrolled student skill evidences against stream career benchmarks.
   */
  public static async getSkillHeatmap(
    institutionId: string,
    filters?: {
      departmentId?: string;
      stream?: string;
    }
  ): Promise<DepartmentSkillHeatmap[]> {
    const departments = devStore.getDepartments(institutionId);
    const allStudents = devStore.getStudentEnrollments(institutionId);

    const filteredDepts = departments.filter((dept) => {
      if (filters?.departmentId && filters.departmentId !== "ALL") {
        return dept.id === filters.departmentId;
      }
      if (filters?.stream && filters.stream !== "ALL") {
        return dept.stream === filters.stream;
      }
      return true;
    });

    const result: DepartmentSkillHeatmap[] = [];

    for (const dept of filteredDepts) {
      const deptStudents = allStudents.filter(
        (s) => s.departmentId === dept.id || s.stream === dept.stream
      );

      const totalStudents = deptStudents.length;

      // Find canonical benchmark careers for this stream
      const matchingReqs = Object.values(CAREER_REQUIREMENTS).filter(
        (c) => c.stream === dept.stream
      );

      // Collect unique required skills from career requirements
      const skillMap = new Map<
        string,
        {
          name: string;
          category: SkillHeatmapCompetency["category"];
          weight: number;
        }
      >();

      if (matchingReqs.length > 0) {
        for (const req of matchingReqs) {
          const allReqSkills = [...req.mandatorySkills, ...req.recommendedSkills];
          for (const skill of allReqSkills) {
            const skillId = skill.skillName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            if (!skillMap.has(skillId)) {
              let cat: SkillHeatmapCompetency["category"] = "TECHNICAL";
              if (dept.stream === "MEDICAL_PCB") cat = "CLINICAL";
              else if (dept.stream === "VOCATIONAL_TRADES") cat = "PRACTICAL";
              else if (dept.stream === "COMMERCE" || dept.stream === "LAW") cat = "DOMAIN";
              else if (skill.category === "Interpersonal") cat = "SOFT_SKILL";

              skillMap.set(skillId, {
                name: skill.skillName,
                category: cat,
                weight: Math.round(skill.importanceWeight * 3.3),
              });
            }
          }
        }
      } else {
        // Fallback core skills for general streams
        skillMap.set("core-comm", { name: "Professional Communication", category: "SOFT_SKILL", weight: 8 });
        skillMap.set("core-crit", { name: "Critical Problem Solving", category: "TECHNICAL", weight: 9 });
        skillMap.set("core-dig", { name: "Digital Literacy & Research", category: "TECHNICAL", weight: 8 });
        skillMap.set("core-eth", { name: "Professional Ethics & Compliance", category: "DOMAIN", weight: 7 });
      }

      // Aggregate demonstration rates across enrolled students
      const competencies: SkillHeatmapCompetency[] = [];

      for (const [skillId, meta] of Array.from(skillMap.entries()).slice(0, 8)) {
        let verifiedCount = 0;
        let selfReportedCount = 0;

        for (const stu of deptStudents) {
          if (stu.studentProfileId) {
            const evidences = devStore.getSkillEvidences(stu.studentProfileId);
            const ev = evidences.find(
              (e) =>
                e.skillId === skillId ||
                e.skillName.toLowerCase() === meta.name.toLowerCase()
            );

            if (ev) {
              if (ev.isVerified || ev.evidenceType === "PLATFORM_ASSESSED") {
                verifiedCount++;
              } else {
                selfReportedCount++;
              }
            }
          }
        }

        const demonstratedCount = verifiedCount + selfReportedCount;
        const demonstratedPercent =
          totalStudents > 0
            ? Math.round((demonstratedCount / totalStudents) * 100)
            : 0;

        const missingCount = Math.max(0, totalStudents - demonstratedCount);

        let status: SkillHeatmapCompetency["status"] = "STRONG";
        if (demonstratedPercent < 30) status = "CRITICAL";
        else if (demonstratedPercent < 55) status = "GAP";
        else if (demonstratedPercent < 75) status = "MODERATE";

        competencies.push({
          skillId,
          skillName: meta.name,
          category: meta.category,
          demonstratedPercent,
          verifiedCount,
          selfReportedCount,
          missingCount,
          benchmarkCoveragePercent: Math.min(
            100,
            Math.round(demonstratedPercent * (meta.weight / 10))
          ),
          status,
        });
      }

      result.push({
        departmentId: dept.id,
        departmentName: dept.name,
        stream: dept.stream,
        totalStudents,
        competencies,
      });
    }

    return result;
  }

  /**
   * Curated and statutory Industry Demand Intelligence across India's key economic sectors.
   * With explicit source attribution, collection dates, and verified council status.
   */
  public static getIndustryDemand(streamFilter?: string): IndustryDemandRecord[] {
    const records: IndustryDemandRecord[] = [
      {
        id: "ind-tech-01",
        sector: "Information Technology & Software Services",
        stream: "NON_MEDICAL_PCM",
        roleTitle: "Full-Stack AI & Cloud Application Engineer",
        topSkills: ["TypeScript / Next.js", "PostgreSQL", "REST APIs", "Cloud Infrastructure", "Prompt Engineering"],
        growthTrend: "HIGH",
        sourceAttribution: "NASSCOM FutureSkills Prime Talent Trends 2025",
        collectionDate: "2025-10-15",
        verificationStatus: "INDUSTRY_COUNCIL",
      },
      {
        id: "ind-med-02",
        sector: "Healthcare & Clinical Services",
        stream: "MEDICAL_PCB",
        roleTitle: "Clinical Resident & Diagnostic Specialist",
        topSkills: ["Clinical Patient Assessment", "Pharmacology & Dosage", "Emergency Triage", "Infection Control Protocols"],
        growthTrend: "HIGH",
        sourceAttribution: "Healthcare Sector Skill Council (HSSC) & National Medical Commission",
        collectionDate: "2025-09-30",
        verificationStatus: "VERIFIED_STATUTORY",
      },
      {
        id: "ind-com-03",
        sector: "Banking, Financial Services & Insurance (BFSI)",
        stream: "COMMERCE",
        roleTitle: "Financial Analyst & Risk Auditor",
        topSkills: ["Financial Statement Analysis", "Statutory Auditing (Ind AS)", "Advanced Excel & Financial Modeling", "GST & Corporate Tax"],
        growthTrend: "HIGH",
        sourceAttribution: "BFSI Sector Skill Council of India & ICAI Curated Roster 2025",
        collectionDate: "2025-11-01",
        verificationStatus: "INDUSTRY_COUNCIL",
      },
      {
        id: "ind-law-04",
        sector: "Legal Practice & Corporate Regulatory Compliance",
        stream: "LAW",
        roleTitle: "Corporate Legal Associate & Compliance Officer",
        topSkills: ["Contract Drafting & Review", "Regulatory Compliance (DPDP Act 2023)", "Civil & Commercial Litigation", "Legal Research"],
        growthTrend: "STEADY",
        sourceAttribution: "Bar Council of India (BCI) Academic Guidelines & Legal Tech Index 2025",
        collectionDate: "2025-08-20",
        verificationStatus: "VERIFIED_STATUTORY",
      },
      {
        id: "ind-voc-05",
        sector: "Industrial Automation & Renewable Energy",
        stream: "VOCATIONAL_TRADES",
        roleTitle: "Industrial Automation Technician & Solar Plant Installer",
        topSkills: ["PLC Programming & Troubleshooting", "Solar PV Grid Installation", "Industrial Electrical Safety", "Sensor Calibration"],
        growthTrend: "HIGH",
        sourceAttribution: "National Skill Development Corporation (NSDC) & Skill Council for Green Jobs",
        collectionDate: "2025-10-10",
        verificationStatus: "INDUSTRY_COUNCIL",
      },
      {
        id: "ind-des-06",
        sector: "Creative Media & User Experience Design",
        stream: "CREATIVE_DESIGN",
        roleTitle: "Digital Product Designer & Visual Strategist",
        topSkills: ["Design Systems (Figma)", "User Research & Journey Mapping", "Usability Testing", "Design Heuristics"],
        growthTrend: "EMERGING",
        sourceAttribution: "Media & Entertainment Skills Council (MESC) & India Design Council",
        collectionDate: "2025-09-12",
        verificationStatus: "CURATED_BENCHMARK",
      },
      {
        id: "ind-agr-07",
        sector: "Precision Agriculture & AgTech",
        stream: "AGRICULTURE",
        roleTitle: "Agri-Tech Field Specialist & Soil Health Analyst",
        topSkills: ["Precision Soil Chemistry Testing", "Drone Crop Health Monitoring", "Hydroponic & Drip Irrigation", "Organic Certification"],
        growthTrend: "EMERGING",
        sourceAttribution: "Agriculture Skill Council of India (ASCI) & ICAR Advisory 2025",
        collectionDate: "2025-07-25",
        verificationStatus: "VERIFIED_STATUTORY",
      },
    ];

    if (streamFilter && streamFilter !== "ALL") {
      return records.filter((r) => r.stream === streamFilter);
    }
    return records;
  }
}
