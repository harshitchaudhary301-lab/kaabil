// ==============================================================================
// KAABIL (काबिल) — Universal Institution Portal Types
// Multi-Tenant Architecture supporting all 13 educational streams and institution types.
// Compliant with DPDP Act 2023 Child Safety & Least-Privilege RBAC.
// ==============================================================================

import { EducationalStream, EducationStage } from "@/types";

export type InstitutionType =
  | "SCHOOL"
  | "COLLEGE_UNIVERSITY"
  | "VOCATIONAL_INSTITUTE"
  | "MEDICAL_COLLEGE"
  | "ENGINEERING_COLLEGE"
  | "COMMERCE_MANAGEMENT_COLLEGE"
  | "LAW_COLLEGE"
  | "ARTS_HUMANITIES_COLLEGE"
  | "AGRICULTURE_INSTITUTE"
  | "DESIGN_INSTITUTE"
  | "POLYTECHNIC"
  | "ITI_TRADE_CENTER"
  | "SKILL_DEVELOPMENT_CENTER";

export type InstitutionVerificationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED";

export type InstitutionRole =
  | "INSTITUTION_ADMIN"
  | "PRINCIPAL_DIRECTOR"
  | "DEPARTMENT_HEAD"
  | "FACULTY"
  | "CAREER_COUNSELOR"
  | "TRAINING_COORDINATOR"
  | "PLACEMENT_OFFICER"
  | "STAFF";

export type StudentEnrollmentStatus =
  | "INVITED"
  | "ACTIVE"
  | "TRANSFERRED"
  | "ALUMNI"
  | "REVOKED";

export type GuardianConsentStatus = "PENDING" | "APPROVED" | "NOT_REQUIRED";

export interface InstitutionRecord {
  id: string;
  name: string;
  slug: string;
  orgType: InstitutionType;
  verificationStatus: InstitutionVerificationStatus;
  officialEmail: string;
  officialWebsite?: string;
  registrationNumber?: string; // AISHE, CBSE Affiliation, AICTE, BCI, NMC code
  accreditationBody?: string; // NAAC, NBA, CBSE, ICAR, NCVT
  city: string;
  state: string;
  country: string;
  supportedStreams: EducationalStream[];
  authorizedPersonName: string;
  authorizedPersonDesignation: string;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  invitationCode: string; // 8-char student join code (e.g. "DTU-2026")
}

export interface DepartmentRecord {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  stream: EducationalStream;
  description?: string;
  headOfDepartmentName?: string;
  headOfDepartmentEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramRecord {
  id: string;
  institutionId: string;
  departmentId?: string;
  name: string; // e.g. "B.Tech Computer Science & AI", "MBBS", "Class 10 CBSE"
  code: string;
  stage: EducationStage;
  stream: EducationalStream;
  durationYears: number;
  totalSemestersOrYears: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicSessionRecord {
  id: string;
  institutionId: string;
  name: string; // e.g. "2025-2026", "2024-2025"
  isCurrent: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface ClassBatchRecord {
  id: string;
  institutionId: string;
  programId?: string;
  departmentId?: string;
  sessionId: string;
  name: string; // e.g. "Class 11-A", "B.Tech CSE - Batch 2024", "Electrician Trade Batch 1"
  semesterOrYearNumber: number; // e.g. Year 1 or Semester 3
  sectionName?: string; // e.g. "A", "B"
  stream: EducationalStream;
  academicYear: string;
  maxCapacity: number;
  enrolledCount: number;
  createdAt: string;
}

export interface FacultyMemberRecord {
  id: string;
  institutionId: string;
  userId?: string;
  name: string;
  email: string;
  designation: string;
  role: InstitutionRole;
  departmentId?: string;
  departmentName?: string;
  specialization?: string;
  isLead: boolean;
  invitationStatus: "ACCEPTED" | "PENDING_INVITE" | "REVOKED";
  invitationToken?: string;
  joinedAt?: string;
  createdAt: string;
}

export interface StudentEnrollmentRecord {
  id: string;
  institutionId: string;
  studentProfileId: string;
  userId?: string;
  studentName: string;
  studentEmail: string;
  rollNumber?: string;
  departmentId?: string;
  programId?: string;
  batchId?: string;
  departmentName?: string;
  programName?: string;
  batchName?: string;
  stream: EducationalStream;
  stage: EducationStage;
  status: StudentEnrollmentStatus;
  guardianConsent: GuardianConsentStatus;
  isMinor: boolean;
  enrolledAt: string;
  // Educational progress summary (sanitized, zero exposure of private mentor reflections)
  readinessIndex: number | null;
  onboardingCompleted: boolean;
  assessmentsCompletedCount: number;
  verifiedSkillsCount: number;
}

export interface BulkImportJobRecord {
  id: string;
  institutionId: string;
  fileName: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: { row: number; email?: string; error: string }[];
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  importedAt: string;
}

export interface InstitutionDashboardStats {
  institution: InstitutionRecord;
  metrics: {
    totalStudents: number;
    activeStudents: number;
    totalFaculty: number;
    totalDepartments: number;
    totalPrograms: number;
    totalBatches: number;
    avgReadinessIndex: number;
    onboardingCompletionPercentage: number;
    assessmentParticipationPercentage: number;
  };
  streamDistribution: {
    stream: string;
    streamTitle: string;
    studentCount: number;
  }[];
  stageDistribution: {
    stage: string;
    studentCount: number;
  }[];
  readinessDistribution: {
    unassessed: number;
    developing: number; // CRI 1-49
    competent: number; // CRI 50-74
    advanced: number; // CRI 75-100
  };
  recentActivities: {
    id: string;
    type: "STUDENT_ENROLLED" | "STAFF_INVITED" | "BATCH_CREATED" | "ASSESSMENT_COMPLETED";
    title: string;
    timestamp: string;
  }[];
}

// ==============================================================================
// PART E2: ADVANCED INSTITUTION INTELLIGENCE TYPES
// ==============================================================================

export interface SkillHeatmapCompetency {
  skillId: string;
  skillName: string;
  category: "TECHNICAL" | "PRACTICAL" | "CLINICAL" | "DOMAIN" | "SOFT_SKILL";
  demonstratedPercent: number; // 0 - 100
  verifiedCount: number;
  selfReportedCount: number;
  missingCount: number;
  benchmarkCoveragePercent: number;
  status: "STRONG" | "MODERATE" | "GAP" | "CRITICAL";
}

export interface DepartmentSkillHeatmap {
  departmentId: string;
  departmentName: string;
  stream: EducationalStream;
  totalStudents: number;
  competencies: SkillHeatmapCompetency[];
}

export interface IndustryDemandRecord {
  id: string;
  sector: string;
  stream: EducationalStream;
  roleTitle: string;
  topSkills: string[];
  growthTrend: "HIGH" | "STEADY" | "EMERGING";
  sourceAttribution: string;
  collectionDate: string;
  verificationStatus: "VERIFIED_STATUTORY" | "INDUSTRY_COUNCIL" | "CURATED_BENCHMARK";
}

export type InterventionTrigger =
  | "INCOMPLETE_ONBOARDING"
  | "NO_ASSESSMENT_ATTEMPTS"
  | "LOW_READINESS_SCORE"
  | "CRITICAL_SKILL_GAP"
  | "STALLED_ROADMAP";

export type InterventionSeverity = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type InterventionStatus =
  | "NEW"
  | "ASSIGNED"
  | "UNDER_REVIEW"
  | "ACTION_PLANNED"
  | "IN_PROGRESS"
  | "FOLLOW_UP_REQUIRED"
  | "RESOLVED"
  | "DISMISSED";

export interface StudentInterventionRecord {
  id: string;
  institutionId: string;
  studentEnrollmentId: string;
  studentProfileId: string;
  studentName: string;
  studentEmail: string;
  rollNumber?: string;
  stream: EducationalStream;
  departmentName?: string;
  triggerReason: InterventionTrigger;
  severity: InterventionSeverity;
  status: InterventionStatus;
  evidenceSummary: string;
  suggestedAction: string;
  assignedToFacultyId?: string;
  assignedToFacultyName?: string;
  reviewDate: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingProgramRecord {
  id: string;
  institutionId: string;
  title: string;
  description: string;
  stream: EducationalStream;
  departmentId?: string;
  departmentName?: string;
  mode: "ONLINE" | "OFFLINE" | "HYBRID";
  targetedSkills: string[];
  instructorName: string;
  startDate: string;
  endDate: string;
  scheduleInfo: string;
  maxCapacity: number;
  enrolledCount: number;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}

export interface TrainingEnrollmentRecord {
  id: string;
  programId: string;
  studentEnrollmentId: string;
  studentName: string;
  studentEmail: string;
  attendancePercent: number;
  status: "ENROLLED" | "COMPLETED" | "DROPPED";
  feedback?: string;
  certificateIssued: boolean;
  completedAt?: string;
}

export interface InstitutionalAssessmentSchedule {
  id: string;
  institutionId: string;
  title: string;
  assessmentId: string;
  departmentId?: string;
  batchId?: string;
  scheduledDate: string;
  deadline: string;
  totalAssigned: number;
  totalSubmitted: number;
  status: "SCHEDULED" | "ACTIVE" | "CLOSED";
}

export interface PlacementDriveRecord {
  id: string;
  institutionId: string;
  companyName: string;
  companyLogo?: string;
  driveTitle: string;
  roleType: "FULL_TIME" | "INTERNSHIP" | "APPRENTICESHIP";
  streams: EducationalStream[];
  minStage: EducationStage;
  minCRI?: number;
  requiredSkills: string[];
  packageLPA?: string;
  stipendMonthly?: string;
  driveDate: string;
  deadline: string;
  venueOrLink: string;
  status: "SCHEDULED" | "ACTIVE" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  totalApplicants: number;
  shortlistedCount: number;
  offeredCount: number;
  isVerifiedPartner: boolean;
  createdAt: string;
}

export interface PlacementApplicationRecord {
  id: string;
  driveId: string;
  institutionId: string;
  studentEnrollmentId: string;
  studentProfileId: string;
  studentName: string;
  studentEmail: string;
  stream: EducationalStream;
  isMinor: boolean;
  eligibilityCheck: {
    isEligible: boolean;
    reasons: string[];
    missingRequirements: string[];
  };
  status:
    | "APPLIED"
    | "SHORTLISTED"
    | "INTERVIEW_SCHEDULED"
    | "OFFERED"
    | "ACCEPTED"
    | "REJECTED";
  interviewSlot?: string;
  offerDetails?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface InstitutionalOutcomeReport {
  id: string;
  institutionId: string;
  title: string;
  reportType:
    | "NAAC_CRITERIA"
    | "NIRF_METRICS"
    | "NBA_OUTCOMES"
    | "STUDENT_DEVELOPMENT"
    | "PLACEMENT_SUMMARY";
  academicSession: string;
  generatedAt: string;
  generatedBy: string;
  frameworkSource: string;
  summaryMetrics: Record<string, any>;
  isInternalSupportingOnly: boolean;
}

export interface InstitutionNotificationRecord {
  id: string;
  institutionId: string;
  userId?: string;
  targetRole?: InstitutionRole | "ALL";
  title: string;
  message: string;
  type: "INTERVENTION" | "TRAINING" | "ASSESSMENT" | "PLACEMENT" | "REPORT" | "SYSTEM";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const STATUTORY_REPORT_DISCLAIMER =
  "This document is an internal institutional development and supporting analysis report generated by the KAABIL Career Intelligence Platform. It does not replace statutory accreditation submissions or regulatory filings with NAAC, NIRF, NBA, UGC, or AICTE.";

