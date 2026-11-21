// ==============================================================================
// KAABIL (काबिल) — Universal Employer Portal & Recruitment Types
// Compliant with DPDP Act 2023. Universal across all 13 educational streams.
// ==============================================================================

import { EducationalStream, EducationStage } from "./index";

export type EmployerVerificationStatus =
  | "NOT_SUBMITTED"
  | "PENDING_REVIEW"
  | "ADDITIONAL_INFO_REQUIRED"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED";

export type EmployerRole =
  | "ORGANIZATION_ADMIN"
  | "RECRUITER"
  | "HIRING_MANAGER";

export interface EmployerOrganizationRecord {
  id: string;
  name: string;
  slug: string;
  industry: string;
  sector: string;
  supportedStreams: EducationalStream[];
  website?: string;
  officialEmail: string;
  registrationNumber?: string; // CIN, GSTIN, LLPIN, Society Registration
  size: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+";
  city: string;
  state: string;
  country: string;
  description: string;
  logoUrl?: string;
  verificationStatus: EmployerVerificationStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  authorizedPersonName: string;
  authorizedPersonDesignation: string;
  businessProofUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployerMemberRecord {
  id: string;
  organizationId: string;
  userId?: string;
  name: string;
  email: string;
  role: EmployerRole;
  title: string;
  department?: string;
  invitationStatus: "ACCEPTED" | "PENDING_INVITE" | "REVOKED";
  invitationToken?: string;
  invitedAt: string;
  joinedAt?: string;
  createdAt: string;
}

export type OpportunityType =
  | "FULL_TIME"
  | "PART_TIME"
  | "INTERNSHIP"
  | "APPRENTICESHIP"
  | "GRADUATE_TRAINEE"
  | "FREELANCE"
  | "RESEARCH"
  | "VOCATIONAL"
  | "CAMPUS";

export type WorkplaceType = "REMOTE" | "HYBRID" | "ON_SITE";

export type OpportunityStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "PAUSED"
  | "CLOSED"
  | "ARCHIVED";

export interface StructuredCompetencyRequirement {
  skillName: string;
  category: "TECHNICAL" | "DOMAIN" | "PRACTICAL" | "CLINICAL" | "SOFT_SKILL" | "REGULATORY";
  importance: "MANDATORY" | "PREFERRED";
  minProficiency: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  acceptableEvidence: ("PLATFORM_ASSESSMENT" | "EXTERNAL_CREDENTIAL" | "PROJECT_WORK" | "ANY")[];
}

export interface JobOpportunityRecord {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationLogo?: string;
  title: string;
  slug: string;
  industry: string;
  stream: EducationalStream;
  department?: string;
  opportunityType: OpportunityType;
  workplaceType: WorkplaceType;
  city?: string;
  state?: string;
  country: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  competencyRequirements: StructuredCompetencyRequirement[];
  minStage: EducationStage;
  requiredQualifications: string[];
  requiredLicenses?: string[]; // e.g. State Medical Council, Bar Council, Pharmacy Council
  experienceYearsMin: number;
  experienceYearsMax?: number;
  compensation: {
    minSalary?: number; // In INR Lakhs per Annum (LPA)
    maxSalary?: number;
    stipendMonthly?: number; // In INR per month
    currency: string;
    isDisclosed: boolean;
  };
  deadline: string;
  availablePositions: number;
  status: OpportunityStatus;
  totalApplications: number;
  shortlistedCount: number;
  hiredCount: number;
  isCampusDrive?: boolean;
  partnerInstitutionId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStage =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "ASSESSMENT_REQUESTED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_COMPLETED"
  | "OFFER_ISSUED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export interface ApplicationStatusHistoryItem {
  stage: ApplicationStage;
  updatedBy: string;
  updatedAt: string;
  notes?: string;
}

export interface EmployerJobApplicationRecord {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  organizationId: string;
  organizationName: string;
  studentProfileId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentStage: EducationStage;
  studentStream: EducationalStream;
  isMinor: boolean; // MUST ALWAYS BE FALSE
  readinessIndex?: number;
  verifiedSkills: string[];
  coverNote?: string;
  resumeUrl?: string;
  matchScore: number; // 0 - 100
  matchExplanation?: {
    streamMatch: boolean;
    stageMatch: boolean;
    criQualified: boolean;
    matchedSkills: string[];
    missingSkills: string[];
  };
  stage: ApplicationStage;
  recruiterNotes: string;
  assignedRecruiterId?: string;
  assignedRecruiterName?: string;
  interviewSlot?: string;
  offerDetails?: string;
  statusHistory: ApplicationStatusHistoryItem[];
  appliedAt: string;
  updatedAt: string;
}

export interface InstitutionPartnershipRecord {
  id: string;
  employerOrganizationId: string;
  employerOrganizationName: string;
  institutionId: string;
  institutionName: string;
  status: "REQUESTED" | "APPROVED" | "DECLINED" | "TERMINATED";
  driveProposalsCount: number;
  notes?: string;
  establishedAt: string;
  updatedAt: string;
}

export interface EmployerNotificationRecord {
  id: string;
  organizationId: string;
  userId?: string;
  type: "APPLICATION" | "STAGE_CHANGE" | "OPPORTUNITY" | "VERIFICATION" | "PARTNERSHIP" | "SYSTEM";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface EmployerAnalyticsData {
  totalOpportunities: number;
  activeOpportunities: number;
  totalApplications: number;
  shortlistedCount: number;
  interviewsCount: number;
  offersCount: number;
  hiresCount: number;
  stageDistribution: Record<ApplicationStage, number>;
  streamDistribution: Record<string, number>;
  averageReviewDays: number;
  conversionRatePct: number;
}

// ==============================================================================
// PART F2 EXTENSIONS: TWO-WAY MATCHING, DISCOVERY, INTERVIEWS & CHALLENGES
// ==============================================================================

export interface MatchWeightConfig {
  verifiedSkillWeight: number; // default: 0.35
  proficiencyWeight: number; // default: 0.25
  projectEvidenceWeight: number; // default: 0.15
  assessmentWeight: number; // default: 0.15
  preferredSkillWeight: number; // default: 0.10
}

export interface ScoreComponentBreakdown {
  verifiedSkillScore: number; // 0 - 100
  proficiencyScore: number; // 0 - 100
  projectEvidenceScore: number; // 0 - 100
  assessmentScore: number; // 0 - 100
  preferredSkillScore: number; // 0 - 100
  weightedOverallScore: number; // 0 - 100
}

export interface ExplainableMatchResult {
  candidateId: string;
  candidateName: string;
  opportunityId: string;
  opportunityTitle: string;
  stream: EducationalStream;
  overallScore: number; // 0 - 100
  isEligible: boolean;
  ineligibilityReasons: string[];
  mandatoryQualificationsStatus: "SATISFIED" | "UNMET" | "PROVISIONAL";
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedPreferredSkills: string[];
  missingPreferredSkills: string[];
  verifiedEvidencesCount: number;
  selfReportedCount: number;
  relevantProjectsCount: number;
  assessmentsPassedCount: number;
  evidenceCoveragePct: number;
  evidenceFreshness: "FRESH" | "MODERATE" | "NEEDS_REFRESH";
  scoreBreakdown: ScoreComponentBreakdown;
  plainLanguageExplanation: string;
  suggestedRoadmapBridgeActions: string[];
  modelVersion: string;
  calculatedAt: string;
}

export interface CandidateDiscoveryProfile {
  id: string;
  studentProfileId: string;
  name: string;
  email: string;
  city?: string;
  state?: string;
  stream: EducationalStream;
  stage: EducationStage;
  isMinor: boolean; // MUST ALWAYS BE FALSE
  discoveryOptIn: boolean;
  careerReadinessIndex?: number;
  verifiedSkills: string[];
  selfReportedSkills: string[];
  projects: { title: string; description: string; url?: string }[];
  qualifications: string[];
  licenses?: string[];
  lastActiveAt: string;
}

export interface RecruitmentInvitationRecord {
  id: string;
  organizationId: string;
  organizationName: string;
  opportunityId: string;
  opportunityTitle: string;
  candidateId: string;
  candidateEmail: string;
  candidateName: string;
  recruiterId: string;
  recruiterName: string;
  invitationNote?: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  sentAt: string;
  respondedAt?: string;
}

export type InterviewType =
  | "TECHNICAL"
  | "BEHAVIORAL"
  | "CLINICAL_CASE"
  | "PANEL"
  | "PORTFOLIO_REVIEW"
  | "HR_FIT"
  | "CASE_STUDY"
  | "GENERAL";

export type InterviewStatus = "SCHEDULED" | "RESCHEDULED" | "COMPLETED" | "CANCELLED";

export interface InterviewRecord {
  id: string;
  organizationId: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  opportunityTitle: string;
  recruiterId: string;
  recruiterName: string;
  interviewType: InterviewType;
  scheduledDate: string;
  startTime: string;
  durationMinutes: number;
  venueOrMeetingLink: string;
  notes?: string;
  status: InterviewStatus;
  cancellationReason?: string;
  rubricScores?: {
    technicalCompetency: number; // 1 to 5
    domainKnowledge: number;
    problemSolving: number;
    communication: number;
  };
  recommendation?: "STRONG_YES" | "YES" | "NEUTRAL" | "NO";
  feedbackNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ChallengeDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type ChallengeCategory =
  | "TECH_PROJECT"
  | "FINANCIAL_CASE"
  | "LEGAL_BRIEF"
  | "DESIGN_SPRINT"
  | "HEALTHCARE_CASE"
  | "AGRITECH_STUDY"
  | "VOCATIONAL_TASK"
  | "PRACTICAL_PROJECT"
  | "INTERDISCIPLINARY";

export interface IndustryChallengeRecord {
  id: string;
  organizationId: string;
  organizationName: string;
  title: string;
  category: ChallengeCategory;
  stream: EducationalStream;
  difficulty: ChallengeDifficulty;
  description: string;
  problemStatement: string;
  deliverables: string[];
  requiredSkills: string[];
  rubricCriteria: { criterion: string; weight: number }[];
  submissionDeadline: string;
  isAdultOnly: boolean; // MUST ALWAYS BE TRUE for corporate challenges
  status: "PUBLISHED" | "CLOSED" | "DRAFT";
  rewardCredentialTitle: string;
  totalParticipants: number;
  totalSubmissions: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeSubmissionRecord {
  id: string;
  challengeId: string;
  challengeTitle: string;
  organizationId: string;
  studentProfileId: string;
  studentName: string;
  studentEmail: string;
  isMinor: boolean;
  submissionUrl: string;
  summary: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REVISION_REQUESTED" | "REJECTED";
  reviewerName?: string;
  score?: number; // 0 - 100
  feedback?: string;
  awardedCredentialId?: string;
  submittedAt: string;
  reviewedAt?: string;
}
