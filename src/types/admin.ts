import { EducationalStream, EducationStage, UserRole } from "./index";

// -----------------------------------------------------------------------------
// Admin Telemetry & Metrics
// -----------------------------------------------------------------------------
export interface AdminPlatformMetrics {
  totalUsers: number;
  activeStudents: number;
  registeredInstitutions: number;
  registeredEmployers: number;
  pendingVerifications: {
    institutions: number;
    employers: number;
    total: number;
  };
  activeOpportunities: number;
  assessmentStats: {
    totalAssessments: number;
    totalAttempts: number;
    passRatePct: number;
  };
  platformActivity: {
    dailyActiveUsers: number;
    weeklyNewRegistrations: number;
    credentialsMinted: number;
  };
  aiHealth: {
    status: "HEALTHY" | "DEGRADED" | "DOWN";
    p95LatencyMs: number;
    errorRatePct: number;
    fallbackRatePct: number;
    activeProvider: string;
  };
  securityAlertsCount: number;
  growthMetrics: {
    studentGrowthPct: number;
    institutionGrowthPct: number;
    employerGrowthPct: number;
  };
}

// -----------------------------------------------------------------------------
// User Management
// -----------------------------------------------------------------------------
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED" | "PENDING_DELETION";

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: AccountStatus;
  isMinor: boolean;
  educationStage?: EducationStage;
  stream?: EducationalStream;
  organizationId?: string;
  organizationName?: string;
  createdAt: string;
  lastLoginAt?: string;
  suspensionReason?: string;
  deletionRequestedAt?: string;
}

export interface AdminAuditLogRecord {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: "USER" | "INSTITUTION" | "EMPLOYER" | "CMS" | "CMS_CONTENT" | "SYSTEM";
  targetId: string;
  targetName?: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

// -----------------------------------------------------------------------------
// Verification Directorate (Institutions & Employers)
// -----------------------------------------------------------------------------
export type VerificationDecision =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ADDITIONAL_INFO_REQUIRED"
  | "SUSPENDED";

export interface VerificationRequestItem {
  id: string;
  organizationId: string;
  organizationType: "INSTITUTION" | "EMPLOYER";
  organizationName: string;
  legalIdentifier?: string; // AISHE Code, MCA CIN, or GSTIN
  registrationIdentifier?: string;
  officialDomain?: string;
  officialEmail?: string;
  contactEmail?: string;
  city?: string;
  state?: string;
  authorizedSignatory?: {
    name: string;
    designation: string;
    email: string;
    phone: string;
  };
  submittedAt: string;
  status: VerificationDecision;
  documents: {
    documentType?: string;
    type?: string;
    title?: string;
    documentUrl?: string;
    url?: string;
    fileName?: string;
    uploadedAt?: string;
  }[];
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// -----------------------------------------------------------------------------
// Platform CMS
// -----------------------------------------------------------------------------
export type CMSContentType =
  | "CAREER_PATH"
  | "SKILL_TAXONOMY"
  | "QUESTION_BANK"
  | "LEARNING_RESOURCE"
  | "ROADMAP_TEMPLATE"
  | "SCHOLARSHIP"
  | "EXAM_ALERT"
  | "POLICY"
  | "FAQ"
  | "ANNOUNCEMENT"
  | "CAREER_CATALOGUE"
  | "SKILL_COMPETENCY"
  | "ENTRANCE_EXAM"
  | "PLATFORM_POLICY";

export type CMSContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface CMSContentItem {
  id: string;
  type?: CMSContentType;
  contentType?: CMSContentType;
  stream: EducationalStream | "ALL";
  title: string;
  slug?: string;
  summary: string;
  content: any;
  tags?: string[];
  targetAudiences?: string[];
  status: CMSContentStatus;
  authorId: string;
  authorName: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt: string;
  version: number;
}

// -----------------------------------------------------------------------------
// AI Governance & Telemetry
// -----------------------------------------------------------------------------
export interface AIGovernanceRecord {
  id?: string;
  timestamp: string;
  requestId?: string;
  endpoint: string;
  model: string;
  promptVersion: string;
  latencyMs: number;
  tokensUsed?: number;
  status: "SUCCESS" | "FALLBACK" | "RATE_LIMITED" | "ERROR";
  errorMessage?: string;
  errorDetails?: string;
  feedbackScore?: number;
  fallbackUsed?: boolean;
}

export interface AIGovernanceOverview {
  serviceStatus: "HEALTHY" | "DEGRADED" | "OFFLINE";
  primaryModel: string;
  fallbackModel: string;
  totalRequests24h: number;
  averageLatencyMs: number;
  fallbackCount24h: number;
  errorCount24h: number;
  rateLimitEvents24h: number;
  totalTokens24h?: number;
  activePromptVersions: Record<string, string>;
  recentAlerts: string[];
}

// -----------------------------------------------------------------------------
// Learning Academy & Student Expansion Types
// -----------------------------------------------------------------------------
export interface AcademyResourceItem {
  id: string;
  title: string;
  stream: EducationalStream;
  competency?: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  resourceType?: "VIDEO" | "ARTICLE" | "CASE_STUDY" | "INTERACTIVE" | "DOCUMENT";
  format?: "VIDEO" | "ARTICLE" | "COURSE" | "DOCUMENTATION" | "INTERACTIVE";
  estimatedMinutes: number;
  url?: string;
  summary?: string;
  description?: string;
  skillTags?: string[];
  provider: string;
  isMandatoryForCRI?: boolean;
}

export interface StudentResourceProgress {
  id?: string;
  resourceId: string;
  studentId?: string;
  studentProfileId?: string;
  isCompleted?: boolean;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progressPct?: number;
  notes?: string;
  rating?: number;
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt?: string;
  isSaved?: boolean;
}

// -----------------------------------------------------------------------------
// Resume Studio
// -----------------------------------------------------------------------------
export type ResumeTemplateType = "CLASSIC_IVY" | "MODERN_CLEAN" | "MINIMAL_EXECUTIVE";

export interface StudentResumeData {
  id?: string;
  studentId?: string;
  studentProfileId?: string;
  fullName?: string;
  headline?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  summary: string;
  stream?: EducationalStream;
  educationStage?: EducationStage;
  template?: ResumeTemplateType;
  templateId?: ResumeTemplateType;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  education: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: string;
    endYear: string;
    grade?: string;
  }[];
  skills: {
    name: string;
    level?: string;
    verified: boolean;
  }[];
  verifiedSkills?: string[];
  selfReportedSkills?: string[];
  experience: {
    title: string;
    organization: string;
    location?: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  projects: {
    title: string;
    description: string;
    url?: string;
    link?: string;
    technologies: string[];
  }[];
  credentials: {
    title: string;
    issuer?: string;
    issuerName?: string;
    issueDate?: string;
    issuedAt?: string;
    verificationUrl?: string;
    verificationHash?: string;
  }[];
  lastUpdated?: string;
  lastExportedAt?: string;
}

// -----------------------------------------------------------------------------
// Interview Practice Lab
// -----------------------------------------------------------------------------
export interface InterviewQuestionItem {
  id: string;
  stream: EducationalStream;
  careerSlug?: string;
  targetCareer?: string;
  question?: string;
  questionText?: string;
  competencyTested?: string;
  category?: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EASY" | "MEDIUM" | "HARD";
  modelAnswerOutline?: string[];
  rubric?: string[];
  tips?: string;
}

export interface MockInterviewSessionRecord {
  id: string;
  studentId?: string;
  studentProfileId?: string;
  stream: EducationalStream;
  careerSlug?: string;
  targetCareer?: string;
  careerTitle?: string;
  questionId?: string;
  questionText?: string;
  studentAnswer?: string;
  questionCount?: number;
  score?: number;
  overallScorePct?: number;
  competencyScores?: Record<string, number>;
  feedback: string | string[];
  strengths: string[];
  improvements?: string[];
  areasToImprove?: string[];
  completedAt?: string;
  createdAt?: string;
}

// -----------------------------------------------------------------------------
// Career What-If Simulator
// -----------------------------------------------------------------------------
export interface WhatIfSimulationInput {
  studentId?: string;
  studentProfileId?: string;
  targetCareer?: string;
  targetCareerSlugChange?: string;
  hypotheticalSkills?: string[];
  hypotheticalSkillsToAdd?: string[];
  hypotheticalAssessments?: string[];
  hypotheticalAssessmentsCompleted?: {
    skillName: string;
    score: number;
  }[];
  simulatedRoadmapCompletion?: boolean;
  completeCurrentRoadmap?: boolean;
}

export interface WhatIfSimulationResult {
  studentId?: string;
  targetCareer?: string;
  currentCRI: number;
  simulatedCRI: number;
  criDelta?: number;
  deltaCRI?: number;
  currentSkillGap: number;
  simulatedSkillGap: number;
  currentGapsCount?: number;
  simulatedGapsCount?: number;
  resolvedGapsCount?: number;
  resolvedGaps: string[];
  remainingGaps?: string[];
  readinessLevelBefore?: string;
  readinessLevelAfter?: string;
  projectedTimeToAchieveWeeks?: number;
  careerTransitionFeasibilityPct?: number;
  transitionAdvice?: string;
  illustrativeImpactSummary?: string;
  statutoryDisclaimer: string;
}
