/**
 * Core TypeScript Types for KAABIL Platform
 */

export type EducationalStream =
  | "MEDICAL_PCB"
  | "NON_MEDICAL_PCM"
  | "COMMERCE"
  | "ARTS_HUMANITIES"
  | "LAW"
  | "MANAGEMENT"
  | "CREATIVE_DESIGN"
  | "AGRICULTURE"
  | "VOCATIONAL_TRADES"
  | "SPORTS_PHYSICAL_ED"
  | "HOSPITALITY_TOURISM"
  | "INTERDISCIPLINARY"
  | "UNDECIDED";

export type EducationStage =
  | "CLASS_8"
  | "CLASS_9"
  | "CLASS_10"
  | "CLASS_11"
  | "CLASS_12"
  | "DIPLOMA"
  | "ITI"
  | "UNDERGRADUATE"
  | "POSTGRADUATE"
  | "WORKING_PROFESSIONAL";

export type UserRole =
  | "STUDENT"
  | "INSTITUTION_ADMIN"
  | "FACULTY"
  | "EMPLOYER_ADMIN"
  | "RECRUITER"
  | "SUPER_ADMIN";

export interface SkillBenchmark {
  name: string;
  category: "Technical" | "Domain" | "Analytical" | "Interpersonal";
  requiredLevel: 1 | 2 | 3 | 4 | 5; // 1: Novice to 5: Expert
  importanceWeight: number; // 1.0 to 3.0
  isMandatory: boolean;
  description: string;
}

export interface CareerPathData {
  id: string;
  slug: string;
  stream: EducationalStream;
  streamTitle: string;
  domainName: string;
  title: string;
  tagline: string;
  overview: string;
  dailyRoutine: string;
  minEducationStage: EducationStage;
  typicalDurationYears: string;
  keyEntranceExams: string[];
  topCollegesInIndia: string[];
  avgStartingSalaryInr: number;
  avgMidCareerSalaryInr: number;
  growthOutlook: "Very High" | "High" | "Moderate";
  automationRisk: "Low" | "Medium" | "High";
  regulatoryBody?: string;
  verificationStatus?: "VERIFIED" | "PENDING_REVIEW" | "DRAFT";
  specializations?: string[];
  responsibilities?: string[];
  workEnvironment?: string;
  licensingRequirement?: string;
  educationalPathways?: {
    step: number;
    stage: string;
    description: string;
    exams?: string[];
  }[];
  sources?: {
    name: string;
    url?: string;
    year?: number;
  }[];
  salarySource?: string;
  lastReviewedDate?: string;
  skills: SkillBenchmark[];
  learningRoadmapSample: {
    week: number;
    title: string;
    focus: string;
  }[];
  isDemoData: boolean; // Explicit label as per instructions
}

export type CareerPath = CareerPathData;

export interface StreamOverview {
  stream: EducationalStream;
  title: string;
  hindiTitle: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
  };
  iconName: string;
  shortDescription: string;
  topCareers: string[];
  typicalSubjects: string[];
}
