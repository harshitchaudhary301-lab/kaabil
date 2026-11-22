// ==============================================================================
// KAABIL (काबिल) — Student Career Profile Types
// View & Edit separation, demonstrated skills (assessed vs self-reported)
// DPDP Act Minor Shield & deterministic integrity
// ==============================================================================

import { EducationStage, EducationalStream } from "./index";

export type SkillProficiencyLevel =
  | "NOVICE"
  | "BEGINNER"
  | "INTERMEDIATE"
  | "PROFICIENT"
  | "EXPERT";

export const STAGE_LABELS: Record<string, string> = {
  CLASS_8: "Class 8",
  CLASS_9: "Class 9",
  CLASS_10: "Class 10 (Secondary)",
  CLASS_11: "Class 11 (Senior Secondary)",
  CLASS_12: "Class 12 (Senior Secondary)",
  DIPLOMA: "Polytechnic / Diploma",
  ITI: "Vocational / ITI Trades",
  UNDERGRADUATE: "Undergraduate (UG)",
  POSTGRADUATE: "Postgraduate (PG)",
  WORKING_PROFESSIONAL: "Early Career / Working Professional",
  OTHER: "Continuing Education",
};

export const STREAM_LABELS: Record<string, string> = {
  MEDICAL_PCB: "Medical & Healthcare (PCB)",
  NON_MEDICAL_PCM: "Non-Medical / STEM (PCM)",
  COMMERCE: "Commerce & Finance",
  ARTS_HUMANITIES: "Arts, Humanities & Social Sciences",
  LAW: "Law & Legal Studies",
  MANAGEMENT: "Management & Business",
  CREATIVE_DESIGN: "Creative Arts & Design",
  AGRICULTURE: "Agriculture & Food Tech",
  VOCATIONAL_TRADES: "Vocational Trades & Emerging Frontiers",
  SPORTS_PHYSICAL_ED: "Sports & Physical Education",
  HOSPITALITY_TOURISM: "Hospitality, Tourism & Sports",
  INTERDISCIPLINARY: "Interdisciplinary & Emerging",
  UNDECIDED: "Undecided / Exploring",
};

export interface AssessedSkill {
  name: string;
  proficiency: SkillProficiencyLevel;
  scorePercentage: number;
  verifiedAt: string;
  evidenceType: string;
  assessmentTitle: string;
  issuerOrVerifier?: string;
  isVerified: true;
}

export interface SelfReportedSkill {
  name: string;
  proficiency: SkillProficiencyLevel;
  isVerified: false;
}

export interface TargetCareerGoal {
  slug: string;
  title: string;
  stream: string;
  regulatoryBody?: string;
  targetYear?: number | null;
  priorityRank: number;
  notes?: string | null;
}

export interface AcademicDetails {
  stage: EducationStage;
  stageLabel: string;
  stream: EducationalStream;
  streamLabel: string;
  institutionName?: string | null;
  boardOrUniversity?: string | null;
  specialization?: string | null;
  graduationYear?: number | null;
  grade?: string | null;
}

export interface AssessmentHistoryItem {
  id: string;
  title: string;
  stream: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface StudentProfileViewData {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  isMinor: boolean;
  academic: AcademicDetails;
  location: {
    city?: string | null;
    state?: string | null;
  };
  languagePreference: string;
  targetCareer?: TargetCareerGoal | null;
  interests: string[];
  skills: {
    assessed: AssessedSkill[];
    selfReported: SelfReportedSkill[];
    totalCount: number;
    assessedCount: number;
    selfReportedCount: number;
  };
  assessmentHistory: AssessmentHistoryItem[];
  privacy: {
    isProfilePublic: boolean;
    allowRecruiterView: boolean;
    isMinorShieldActive: boolean;
  };
  careerReadinessIndex: number | null;
  onboardingCompleted: boolean;
  lastUpdated: string;
}

export interface UpdateStudentProfileInput {
  name?: string;
  bio?: string;
  educationStage?: EducationStage;
  currentStream?: EducationalStream;
  institutionName?: string;
  boardOrUniversity?: string;
  specialization?: string;
  graduationYear?: number;
  grade?: string;
  city?: string;
  state?: string;
  languagePreference?: string;
  targetCareerSlug?: string;
  targetYear?: number;
  careerGoalNotes?: string;
  interests?: string[];
  selfReportedSkills?: {
    name: string;
    proficiency: SkillProficiencyLevel;
  }[];
  isProfilePublic?: boolean;
  allowRecruiterView?: boolean;
}
