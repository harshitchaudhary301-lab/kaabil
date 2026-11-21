// ==============================================================================
// KAABIL (काबिल) — Career Educational Eligibility Checker
// Validates documented prerequisites without guaranteeing admission or employment
// Grounded strictly in recognized regulatory rules (NMC, BCI, AICTE, ICAI, etc.)
// ==============================================================================

import { EducationStage, EducationalStream } from "@/types";

export type EligibilityStatus =
  | "KNOWN_PREREQUISITES_SATISFIED"
  | "ADDITIONAL_QUALIFICATION_REQUIRED"
  | "INSUFFICIENT_INFORMATION"
  | "REQUIREMENTS_NOT_YET_VERIFIED";

export interface StudentEligibilityProfile {
  educationStage: EducationStage | string;
  stream: EducationalStream | string;
  subjects?: string[];
  age?: number;
  percentage?: number;
}

export interface EligibilityResult {
  status: EligibilityStatus;
  statusLabel: string;
  isEligibleToApply: boolean;
  satisfiedPrerequisites: string[];
  missingPrerequisites: string[];
  suggestedBridgePathways: string[];
  regulatoryDisclaimer: string;
}

// Stage ranking for prerequisite hierarchy comparison
const STAGE_RANK: Record<string, number> = {
  CLASS_8: 1,
  CLASS_9: 2,
  CLASS_10: 3,
  CLASS_11: 4,
  CLASS_12: 5,
  DIPLOMA: 6,
  ITI: 6,
  UNDERGRADUATE: 7,
  POSTGRADUATE: 8,
  WORKING_PROFESSIONAL: 9,
};

export class CareerEligibilityChecker {
  static evaluate(
    student: StudentEligibilityProfile,
    career: {
      slug: string;
      title: string;
      minEducationStage: EducationStage | string;
      regulatoryBody?: string | null;
      stream: string;
      typicalDurationYears: string;
      keyEntranceExams: string[];
    }
  ): EligibilityResult {
    const satisfiedPrerequisites: string[] = [];
    const missingPrerequisites: string[] = [];
    const suggestedBridgePathways: string[] = [];

    const studentStageStr = String(student.educationStage || "CLASS_10").replace(/_/g, " ");
    const careerStageStr = String(career.minEducationStage || "CLASS_12").replace(/_/g, " ");

    const studentRank = STAGE_RANK[String(student.educationStage || "CLASS_10")] || 0;
    // In India, undergraduate programs (MBBS, B.Tech, etc.) have entrance exams where Class 12 candidates are eligible to apply
    const effectiveRequiredRank =
      career.minEducationStage === "UNDERGRADUATE" && career.keyEntranceExams && career.keyEntranceExams.length > 0
        ? STAGE_RANK["CLASS_12"]
        : (STAGE_RANK[String(career.minEducationStage || "CLASS_12")] || 5);

    // 1. Stage Check
    if (studentRank >= effectiveRequiredRank) {
      satisfiedPrerequisites.push(`Current education stage (${studentStageStr}) meets or exceeds minimum requirement (${careerStageStr}).`);
    } else {
      missingPrerequisites.push(`Minimum education stage required is Class 12. You are currently at ${studentStageStr}.`);
      suggestedBridgePathways.push(`Complete secondary/senior secondary education to reach Class 12.`);
    }

    // 2. Stream & Subject Specific Rules
    if (career.slug.includes("mbbs") || career.slug.includes("dental")) {
      const hasBio = student.stream === "MEDICAL_PCB" || (student.subjects && student.subjects.some((s) => s.toLowerCase().includes("bio")));
      if (hasBio) {
        satisfiedPrerequisites.push("Physics, Chemistry, and Biology (PCB) curriculum background satisfied.");
      } else {
        missingPrerequisites.push("Mandatory senior secondary Physics, Chemistry, Biology (PCB) subjects required under NMC/DCI regulations.");
        suggestedBridgePathways.push("Complete Class 12 Biology through recognized National Institute of Open Schooling (NIOS) or bridge board.");
      }

      if (student.age !== undefined) {
        if (student.age >= 17) {
          satisfiedPrerequisites.push(`Minimum age criterion (17+ years as of Dec 31) satisfied (Age: ${student.age}).`);
        } else {
          missingPrerequisites.push(`Candidate must be at least 17 years old by December 31 of admission year (Current age: ${student.age}).`);
        }
      }
    } else if (career.slug.includes("ai") || career.slug.includes("aerospace") || career.slug.includes("actuary")) {
      const hasMath = student.stream === "NON_MEDICAL_PCM" || student.stream === "COMMERCE" || (student.subjects && student.subjects.some((s) => s.toLowerCase().includes("math")));
      if (hasMath) {
        satisfiedPrerequisites.push("Mathematics foundational background satisfied.");
      } else {
        missingPrerequisites.push("Senior secondary Mathematics is mandatory for quantitative modeling and engineering admission.");
        suggestedBridgePathways.push("Enroll in bridge mathematics certification or open schooling senior secondary mathematics.");
      }
    } else if (career.slug.includes("law") || career.slug.includes("consultant") || career.slug.includes("product") || career.slug.includes("multidisciplinary")) {
      satisfiedPrerequisites.push("Universal stream eligibility: Open to graduates of all educational streams through national entrance examinations.");
    }

    // 3. Entrance Exam Notice
    if (career.keyEntranceExams.length > 0) {
      satisfiedPrerequisites.push(`Target national entrance examination: ${career.keyEntranceExams[0]}.`);
    }

    // 4. Overall Status Determination
    let status: EligibilityStatus = "KNOWN_PREREQUISITES_SATISFIED";
    let statusLabel = "Known Prerequisites Satisfied";
    let isEligibleToApply = true;

    if (missingPrerequisites.length > 0) {
      status = "ADDITIONAL_QUALIFICATION_REQUIRED";
      statusLabel = "Additional Milestones Required";
      isEligibleToApply = false;
    } else if (satisfiedPrerequisites.length === 0) {
      status = "INSUFFICIENT_INFORMATION";
      statusLabel = "Insufficient Profile Information";
      isEligibleToApply = false;
    }

    const disclaimer = career.regulatoryBody
      ? `Educational eligibility criteria based on published regulations of ${career.regulatoryBody}. KAABIL evaluation is strictly informational and does not guarantee formal university admission, entrance qualification, or professional licensure.`
      : "Educational eligibility criteria based on standard Indian university academic benchmarks. Formal admission is governed by respective institution cutoffs and official exam authority guidelines.";

    return {
      status,
      statusLabel,
      isEligibleToApply,
      satisfiedPrerequisites,
      missingPrerequisites,
      suggestedBridgePathways,
      regulatoryDisclaimer: disclaimer,
    };
  }
}
