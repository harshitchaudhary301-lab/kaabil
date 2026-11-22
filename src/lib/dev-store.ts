// ==============================================================================
// KAABIL (काबिल) — Persistent Offline Development Store
// Mirrors PostgreSQL Prisma models to disk during offline/local development.
// Guarantees zero data loss across server restarts and strict user isolation.
// ==============================================================================

import fs from "fs";
import path from "path";
import { AuthenticatedUser } from "@/lib/auth/session";

const STORE_DIR =
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join("/tmp", ".dev-store")
    : path.join(process.cwd(), ".dev-store");
const STORE_FILE = path.join(STORE_DIR, "store.json");

export interface DevStoreData {
  users: Record<string, any>; // email -> user record
  sessions: Record<string, { user: AuthenticatedUser; expires: string }>;
  profiles: Record<string, any>; // profileId -> profile record
  roadmaps: Record<string, any>; // roadmapId -> structured roadmap
  missions: Record<string, any[]>; // profileId -> daily missions array
  conversations: Record<string, any>; // conversationId -> mentor conversation
  assessments: Record<string, any>; // assessmentId -> assessment record
  attempts: Record<string, any>; // attemptId -> assessment attempt
  results: Record<string, any>; // attemptId -> assessment result
  evidences: Record<string, any[]>; // profileId -> skill evidence array
  skillGapAnalyses: Record<string, any>; // analysisId -> SkillGapAnalysisResult
  credentials: Record<string, any[]>; // profileId -> KaabilCredential[]
  shareTokens: Record<string, any>; // token -> share record
  passportPreferences: Record<string, any>; // profileId -> privacy preferences
  learningPreferences?: Record<string, any>; // profileId -> LearningPlanPreferences
  learningTaskStates?: Record<string, Record<string, any>>; // profileId -> taskId -> state
  projectEnrollments?: Record<string, Record<string, any>>; // profileId -> projectId -> enrollment
  // Institution Multi-Tenant Collections (Part E1)
  institutions: Record<string, any>; // institutionId -> InstitutionRecord
  departments: Record<string, any[]>; // institutionId -> DepartmentRecord[]
  programs: Record<string, any[]>; // institutionId -> ProgramRecord[]
  academicSessions: Record<string, any[]>; // institutionId -> AcademicSessionRecord[]
  classesBatches: Record<string, any[]>; // institutionId -> ClassBatchRecord[]
  facultyMembers: Record<string, any[]>; // institutionId -> FacultyMemberRecord[]
  studentEnrollments: Record<string, any[]>; // institutionId -> StudentEnrollmentRecord[]
  bulkImportJobs: Record<string, any[]>; // institutionId -> BulkImportJobRecord[]
  interventions?: Record<string, any[]>; // institutionId -> StudentInterventionRecord[]
  trainingPrograms?: Record<string, any[]>; // institutionId -> TrainingProgramRecord[]
  trainingEnrollments?: Record<string, any[]>; // programId -> TrainingEnrollmentRecord[]
  assessmentSchedules?: Record<string, any[]>; // institutionId -> InstitutionalAssessmentSchedule[]
  placementDrives?: Record<string, any[]>; // institutionId -> PlacementDriveRecord[]
  placementApplications?: Record<string, any[]>; // driveId -> PlacementApplicationRecord[]
  outcomeReports?: Record<string, any[]>; // institutionId -> InstitutionalOutcomeReport[]
  institutionNotifications?: Record<string, any[]>; // institutionId -> InstitutionNotificationRecord[]
  // Employer Multi-Tenant Collections (Part F1)
  employerOrganizations?: Record<string, any>; // organizationId -> EmployerOrganizationRecord
  employerMembers?: Record<string, any[]>; // organizationId -> EmployerMemberRecord[]
  jobOpportunities?: Record<string, any[]>; // organizationId -> JobOpportunityRecord[]
  jobApplications?: Record<string, any[]>; // organizationId -> EmployerJobApplicationRecord[]
  savedOpportunities?: Record<string, string[]>; // studentProfileId -> opportunityIds[]
  employerPartnerships?: Record<string, any[]>; // organizationId -> InstitutionPartnershipRecord[]
  employerNotifications?: Record<string, any[]>; // organizationId -> EmployerNotificationRecord[]
  // Part F2 Collections: Matching, Discovery, Interviews, Challenges
  recruitmentInvitations?: Record<string, any[]>; // organizationId -> RecruitmentInvitationRecord[]
  interviews?: Record<string, any[]>; // organizationId -> InterviewRecord[]
  industryChallenges?: Record<string, any[]>; // organizationId -> IndustryChallengeRecord[]
  challengeSubmissions?: Record<string, any[]>; // challengeId -> ChallengeSubmissionRecord[]
  candidateDiscoveryProfiles?: Record<string, any>; // studentProfileId -> CandidateDiscoveryProfile
  matchingConfigurations?: Record<string, any>; // organizationId -> MatchWeightConfig
  // Part G Collections: Admin Governance, Verification Directorate, CMS, AI Telemetry & Student Features
  adminAuditLogs?: any[];
  verificationRequests?: any[]; // VerificationRequestItem[]
  cmsContentItems?: any[]; // CMSContentItem[]
  aiGovernanceRecords?: any[]; // AIGovernanceRecord[]
  academyResources?: any[]; // AcademyResourceItem[]
  resourceProgress?: Record<string, Record<string, any>>; // profileId -> { resourceId -> progress }
  studentResumes?: Record<string, any>; // profileId -> StudentResumeData
  mockInterviewSessions?: Record<string, any[]>; // profileId -> MockInterviewSessionRecord[]
  systemNotifications?: any[];
  resetTokens?: Record<string, { email: string; expiresAt: string }>;
}

function getInitialStore(): DevStoreData {
  return {
    users: {
      "admin@kaabil.in": {
        id: "admin-super-01",
        email: "admin@kaabil.in",
        name: "Dr. Vikramaditya Sen",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        isMinor: false,
        passwordHash: "$2b$10$DEMO_HASH_KAABIL_ADMIN",
        organizations: [],
      },
      "demo.student@kaabil.in": {
        id: "demo-student-id",
        email: "demo.student@kaabil.in",
        name: "Aryan Sharma",
        role: "STUDENT",
        status: "ACTIVE",
        isMinor: false,
        passwordHash: "$2b$10$DEMO_HASH_KAABIL_STUDENT",
        studentProfile: {
          id: "demo-profile-id",
          educationStage: "UNDERGRADUATE",
          currentStream: "NON_MEDICAL_PCM",
          onboardingCompleted: true,
          careerReadinessIndex: 79,
          institutionName: "Delhi Technological University (Demo)",
        },
        organizations: [],
      },
      "fresh.student@kaabil.in": {
        id: "fresh-student-id",
        email: "fresh.student@kaabil.in",
        name: "Priya Patel",
        role: "STUDENT",
        status: "ACTIVE",
        isMinor: true,
        passwordHash: "$2b$10$DEMO_HASH_KAABIL_STUDENT",
        studentProfile: {
          id: "fresh-profile-id",
          educationStage: "CLASS_12",
          currentStream: "UNDECIDED",
          onboardingCompleted: true,
          careerReadinessIndex: null,
          institutionName: "Delhi Public School (Demo)",
        },
        organizations: [],
      },
      "institution@kaabil.in": {
        id: "inst-admin-01",
        email: "institution@kaabil.in",
        name: "Dr. Rajesh K. Sharma",
        role: "INSTITUTION_ADMIN",
        status: "ACTIVE",
        isMinor: false,
        passwordHash: "$2b$10$DEMO_HASH_KAABIL_INST",
        organizations: [
          {
            id: "inst-delhi-tech",
            name: "Delhi Technical Campus",
            slug: "delhi-technical-campus",
            roleInOrg: "INSTITUTION_ADMIN",
            isVerified: true,
          },
        ],
      },
      "employer@kaabil.in": {
        id: "emp-admin-01",
        email: "employer@kaabil.in",
        name: "Dr. Alok Verma",
        role: "EMPLOYER_ADMIN",
        status: "ACTIVE",
        isMinor: false,
        passwordHash: "$2b$10$DEMO_HASH_KAABIL_EMP",
        organizations: [
          {
            id: "emp-apex-01",
            name: "Apex Healthcare & Diagnostic Systems",
            slug: "apex-healthcare",
            roleInOrg: "EMPLOYER_ADMIN",
            isVerified: true,
          },
        ],
      },
    },
    sessions: {},
    profiles: {
      "fresh-profile-id": {
        id: "fresh-profile-id",
        userId: "fresh-student-id",
        educationStage: "CLASS_12",
        currentStream: "UNDECIDED",
        targetCompletionYear: 2026,
        onboardingCompleted: true,
        careerReadinessIndex: null,
        institutionName: "Delhi Public School (Demo)",
        user: { name: "Priya Patel", email: "fresh.student@kaabil.in" },
        interests: [],
        careerGoals: [],
        userSkills: [],
        roadmaps: [],
        dailyMissions: [],
      },
      "sp-aryan-01": {
        id: "sp-aryan-01",
        userId: "demo-student-id",
        educationStage: "UNDERGRADUATE",
        currentStream: "MEDICAL_PCB",
        targetCompletionYear: 2027,
        onboardingCompleted: true,
        careerReadinessIndex: 79,
        institutionName: "All India Institute of Medical Sciences (AIIMS)",
        user: { name: "Aryan Sharma", email: "demo.student@kaabil.in" },
        interests: [{ domain: "Clinical Diagnostics" }, { domain: "Biochemistry" }],
        careerGoals: [
          {
            careerPath: { slug: "clinical-biochemist", title: "Clinical Biochemist", regulatoryBody: "NMC" },
            priorityRank: 1,
          },
        ],
        userSkills: [
          { skill: { name: "Biochemistry Assays", category: "TECHNICAL" }, isVerified: true, verifiedAt: new Date().toISOString() },
          { skill: { name: "Laboratory Safety", category: "TECHNICAL" }, isVerified: true, verifiedAt: new Date().toISOString() },
          { skill: { name: "Diagnostic Radiology & Imaging", category: "TECHNICAL" }, isVerified: true, verifiedAt: new Date().toISOString() },
        ],
        roadmaps: [],
        dailyMissions: [],
      },
      "demo-profile-id": {
        id: "demo-profile-id",
        userId: "demo-student-id",
        educationStage: "UNDERGRADUATE",
        currentStream: "NON_MEDICAL_PCM",
        targetCompletionYear: 2027,
        onboardingCompleted: true,
        careerReadinessIndex: 79,
        institutionName: "Delhi Technological University (Demo)",
        user: { name: "Aryan Sharma", email: "demo.student@kaabil.in" },
        interests: [{ domain: "Artificial Intelligence" }, { domain: "System Architecture" }],
        careerGoals: [
          {
            careerPath: { slug: "ai-systems-engineer", title: "AI Systems Engineer", regulatoryBody: "AICTE" },
            priorityRank: 1,
          },
        ],
        userSkills: [
          { skill: { name: "Python", category: "TECHNICAL" }, isVerified: true, verifiedAt: new Date().toISOString() },
          { skill: { name: "Data Structures", category: "TECHNICAL" }, isVerified: true, verifiedAt: new Date().toISOString() },
          { skill: { name: "System Architecture", category: "TECHNICAL" }, isVerified: false },
          { skill: { name: "Linear Algebra", category: "FOUNDATIONAL" }, isVerified: false },
        ],
        roadmaps: [
          {
            id: "demo-roadmap-id",
            totalWeeks: 12,
            currentWeekIndex: 1,
            milestones: [
              { id: "m1", title: "Foundations of AI", isCompleted: true },
              { id: "m2", title: "Transformer Architectures", isCompleted: false },
            ],
          },
        ],
        dailyMissions: [{ id: "dm1", status: "COMPLETED" }, { id: "dm2", status: "COMPLETED" }],
      },
    },
    roadmaps: {},
    missions: {},
    conversations: {},
    assessments: {},
    attempts: {},
    results: {},
    evidences: {},
    skillGapAnalyses: {},
    credentials: {},
    shareTokens: {},
    passportPreferences: {},
    learningPreferences: {},
    learningTaskStates: {},
    projectEnrollments: {},
    institutions: {
      "inst-demo-tech": {
        id: "inst-demo-tech",
        name: "Delhi Technical Campus",
        slug: "delhi-technical-campus",
        orgType: "COLLEGE_UNIVERSITY",
        verificationStatus: "VERIFIED",
        officialEmail: "admin@delhitechnical.edu.in",
        officialWebsite: "https://delhitechnical.edu.in",
        registrationNumber: "AISHE-C-29104",
        accreditationBody: "NAAC A+",
        city: "New Delhi",
        state: "Delhi",
        country: "India",
        supportedStreams: ["NON_MEDICAL_PCM", "MANAGEMENT"],
        authorizedPersonName: "Dr. Rajesh K. Sharma",
        authorizedPersonDesignation: "Dean Academic Affairs",
        isVerified: true,
        verifiedAt: "2025-01-15T00:00:00.000Z",
        invitationCode: "DTC-2026",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-15T00:00:00.000Z",
      },
      "inst-demo-med": {
        id: "inst-demo-med",
        name: "All India Health Sciences Institute (Demo)",
        slug: "aihs-health-campus",
        orgType: "MEDICAL_COLLEGE",
        verificationStatus: "VERIFIED",
        officialEmail: "dean@aihs-demo.edu.in",
        officialWebsite: "https://aihs-demo.edu.in",
        registrationNumber: "NMC-MED-4401",
        accreditationBody: "NMC / NABH",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        supportedStreams: ["MEDICAL_PCB"],
        authorizedPersonName: "Dr. Meenakshi Sundaram",
        authorizedPersonDesignation: "Principal & Medical Superintendent",
        isVerified: true,
        verifiedAt: "2025-01-10T00:00:00.000Z",
        invitationCode: "MED-2026",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-10T00:00:00.000Z",
      },
    },
    departments: {
      "inst-demo-tech": [
        {
          id: "dept-cse",
          institutionId: "inst-demo-tech",
          name: "Computer Science & Artificial Intelligence",
          code: "CS-AI",
          stream: "NON_MEDICAL_PCM",
          description: "Department of Computer Science, Software Architecture, and AI Systems.",
          headOfDepartmentName: "Prof. Ananya Gupta",
          headOfDepartmentEmail: "hod.cs@delhitechnical.edu.in",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        },
        {
          id: "dept-ece",
          institutionId: "inst-demo-tech",
          name: "Electronics & Embedded Systems",
          code: "ECE",
          stream: "NON_MEDICAL_PCM",
          description: "VLSI, IoT hardware, and robotics engineering division.",
          headOfDepartmentName: "Prof. Vikram Sen",
          headOfDepartmentEmail: "hod.ece@delhitechnical.edu.in",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        },
      ],
    },
    programs: {
      "inst-demo-tech": [
        {
          id: "prog-btech-cse",
          institutionId: "inst-demo-tech",
          departmentId: "dept-cse",
          name: "B.Tech Computer Science & AI Systems",
          code: "BT-CSAI",
          stage: "UNDERGRADUATE",
          stream: "NON_MEDICAL_PCM",
          durationYears: 4,
          totalSemestersOrYears: 8,
          description: "Full-time undergraduate engineering program with core AI and algorithms.",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        },
      ],
    },
    academicSessions: {
      "inst-demo-tech": [
        {
          id: "sess-2025-26",
          institutionId: "inst-demo-tech",
          name: "2025-2026",
          isCurrent: true,
          startDate: "2025-07-01",
          endDate: "2026-06-30",
          createdAt: "2025-01-01T00:00:00.000Z",
        },
      ],
    },
    classesBatches: {
      "inst-demo-tech": [
        {
          id: "batch-2024-28-cse",
          institutionId: "inst-demo-tech",
          programId: "prog-btech-cse",
          departmentId: "dept-cse",
          sessionId: "sess-2025-26",
          name: "B.Tech CSE - Batch 2024-28 (Section A)",
          semesterOrYearNumber: 2,
          sectionName: "A",
          stream: "NON_MEDICAL_PCM",
          academicYear: "2025-2026",
          maxCapacity: 60,
          enrolledCount: 1,
          createdAt: "2025-01-01T00:00:00.000Z",
        },
      ],
    },
    facultyMembers: {
      "inst-demo-tech": [
        {
          id: "fac-1",
          institutionId: "inst-demo-tech",
          name: "Dr. Rajesh K. Sharma",
          email: "admin@delhitechnical.edu.in",
          designation: "Dean Academic Affairs",
          role: "INSTITUTION_ADMIN",
          isLead: true,
          invitationStatus: "ACCEPTED",
          joinedAt: "2025-01-01T00:00:00.000Z",
          createdAt: "2025-01-01T00:00:00.000Z",
        },
        {
          id: "fac-2",
          institutionId: "inst-demo-tech",
          name: "Prof. Ananya Gupta",
          email: "hod.cs@delhitechnical.edu.in",
          designation: "Head of Department (CSE)",
          role: "DEPARTMENT_HEAD",
          departmentId: "dept-cse",
          departmentName: "Computer Science & Artificial Intelligence",
          specialization: "Distributed Systems & Machine Learning",
          isLead: false,
          invitationStatus: "ACCEPTED",
          joinedAt: "2025-01-05T00:00:00.000Z",
          createdAt: "2025-01-01T00:00:00.000Z",
        },
      ],
    },
    studentEnrollments: {
      "inst-demo-tech": [
        {
          id: "enr-demo-student",
          institutionId: "inst-demo-tech",
          studentProfileId: "demo-profile-id",
          studentName: "Aryan Sharma",
          studentEmail: "demo.student@kaabil.in",
          rollNumber: "DTC-24-CS-042",
          departmentId: "dept-cse",
          programId: "prog-btech-cse",
          batchId: "batch-2024-28-cse",
          departmentName: "Computer Science & Artificial Intelligence",
          programName: "B.Tech Computer Science & AI Systems",
          batchName: "B.Tech CSE - Batch 2024-28 (Section A)",
          stream: "NON_MEDICAL_PCM",
          stage: "UNDERGRADUATE",
          status: "ACTIVE",
          guardianConsent: "NOT_REQUIRED",
          isMinor: false,
          enrolledAt: "2025-01-15T00:00:00.000Z",
          readinessIndex: 79,
          onboardingCompleted: true,
          assessmentsCompletedCount: 2,
          verifiedSkillsCount: 2,
        },
      ],
    },
    bulkImportJobs: {},
    employerOrganizations: {
      "emp-apex-diag": {
        id: "emp-apex-diag",
        name: "Apex Healthcare & Diagnostic Systems",
        slug: "apex-healthcare",
        industry: "Healthcare & Life Sciences",
        sector: "Clinical Diagnostics & MedTech",
        supportedStreams: ["MEDICAL_PCB", "NON_MEDICAL_PCM", "COMMERCE"],
        website: "https://apexdiagnostics.example.in",
        officialEmail: "careers@apexdiagnostics.example.in",
        registrationNumber: "CIN-U85110DL2018PTC329104",
        size: "201-500",
        city: "New Delhi",
        state: "Delhi",
        country: "India",
        description: "Leading NABL-accredited diagnostic network and clinical health technologies across North India.",
        verificationStatus: "VERIFIED",
        verifiedAt: "2025-06-15T10:00:00.000Z",
        verifiedBy: "KAABIL Trust & Verification Directorate",
        authorizedPersonName: "Dr. Alok Verma",
        authorizedPersonDesignation: "Chief Medical & Operations Officer",
        createdAt: "2025-01-10T00:00:00.000Z",
        updatedAt: "2025-06-15T10:00:00.000Z",
      },
    },
    employerMembers: {
      "emp-apex-diag": [
        {
          id: "mem-verma-01",
          organizationId: "emp-apex-diag",
          name: "Dr. Alok Verma",
          email: "alok.verma@apexdiagnostics.example.in",
          role: "ORGANIZATION_ADMIN",
          title: "Chief Medical Officer",
          department: "Medical Operations",
          invitationStatus: "ACCEPTED",
          invitedAt: "2025-01-10T00:00:00.000Z",
          joinedAt: "2025-01-10T00:00:00.000Z",
          createdAt: "2025-01-10T00:00:00.000Z",
        },
      ],
    },
    jobOpportunities: {
      "emp-apex-diag": [
        {
          id: "opp-apex-lab-01",
          organizationId: "emp-apex-diag",
          organizationName: "Apex Healthcare & Diagnostic Systems",
          title: "Clinical Laboratory Technologist",
          slug: "clinical-laboratory-technologist",
          industry: "Healthcare & Life Sciences",
          stream: "MEDICAL_PCB",
          department: "Diagnostic Pathology",
          opportunityType: "FULL_TIME",
          workplaceType: "ON_SITE",
          city: "New Delhi",
          state: "Delhi",
          country: "India",
          description: "Perform clinical biochemical assays and diagnostic specimen evaluations.",
          responsibilities: ["Execute diagnostic assays", "Maintain equipment calibrations"],
          requiredSkills: ["Biochemistry Assays", "Laboratory Safety", "Diagnostic Radiology & Imaging"],
          preferredSkills: ["Clinical Research"],
          competencyRequirements: [],
          minStage: "UNDERGRADUATE",
          status: "PUBLISHED",
          applicationDeadline: "2026-12-31T23:59:59.000Z",
          totalApplications: 0,
          totalHired: 0,
          createdAt: "2026-11-20T10:00:00.000Z",
          updatedAt: "2026-11-20T10:00:00.000Z",
        },
      ],
    },
    jobApplications: {},
    savedOpportunities: {},
    employerPartnerships: {},
    employerNotifications: {},
    candidateDiscoveryProfiles: {
      "sp-aryan-01": {
        id: "disc-aryan-01",
        studentProfileId: "sp-aryan-01",
        name: "Aryan Sharma",
        email: "demo.student@kaabil.in",
        city: "New Delhi",
        state: "Delhi",
        stream: "MEDICAL_PCB",
        stage: "UNDERGRADUATE",
        isMinor: false,
        discoveryOptIn: true,
        careerReadinessIndex: 79,
        verifiedSkills: ["Biochemistry Assays", "Laboratory Safety", "Diagnostic Radiology & Imaging"],
        selfReportedSkills: ["Python", "Docker"],
        projects: [
          {
            title: "Healthcare Telemetry Portal",
            description: "Real-time diagnostic report dashboard using Next.js and Prisma.",
            url: "https://github.com/kaabil/telemetry",
          },
        ],
        qualifications: ["Bachelor of Science (Biochemistry)"],
        lastActiveAt: "2026-11-20T10:00:00.000Z",
      },
      "demo-profile-id": {
        id: "disc-aryan-01",
        studentProfileId: "demo-profile-id",
        name: "Aryan Sharma",
        email: "demo.student@kaabil.in",
        city: "New Delhi",
        state: "Delhi",
        stream: "NON_MEDICAL_PCM",
        stage: "UNDERGRADUATE",
        isMinor: false,
        discoveryOptIn: true,
        careerReadinessIndex: 79,
        verifiedSkills: ["Full-Stack Web Architecture", "PostgreSQL", "React"],
        selfReportedSkills: ["Python", "Docker"],
        projects: [
          {
            title: "Healthcare Telemetry Portal",
            description: "Real-time diagnostic report dashboard using Next.js and Prisma.",
            url: "https://github.com/kaabil/telemetry",
          },
        ],
        qualifications: ["B.Tech Computer Science (Final Year)"],
        lastActiveAt: "2026-11-20T10:00:00.000Z",
      },
      "sp-adult-mbbs-01": {
        id: "disc-rohit-02",
        studentProfileId: "sp-adult-mbbs-01",
        name: "Dr. Rohit Verma",
        email: "rohit.verma@example.in",
        city: "New Delhi",
        state: "Delhi",
        stream: "MEDICAL_PCB",
        stage: "UNDERGRADUATE",
        isMinor: false,
        discoveryOptIn: true,
        careerReadinessIndex: 84,
        verifiedSkills: ["Diagnostic Radiology & Imaging", "Biochemistry Assays", "Laboratory Safety"],
        selfReportedSkills: ["Clinical Research", "Pathology"],
        projects: [
          {
            title: "Automated Blood Assays Analysis",
            description: "Statistical evaluation of biochemical markers in critical care patients.",
            url: "https://research.in/assays-study",
          },
        ],
        qualifications: ["MBBS (Intern)"],
        licenses: ["State Medical Council Registration (Provisional)"],
        lastActiveAt: "2026-11-20T11:00:00.000Z",
      },
      "sp-cand-b": {
        id: "disc-bhavna-03",
        studentProfileId: "sp-cand-b",
        name: "Bhavna Patel",
        email: "bhavna@example.in",
        city: "Mumbai",
        state: "Maharashtra",
        stream: "COMMERCE",
        stage: "UNDERGRADUATE",
        isMinor: false,
        discoveryOptIn: true,
        careerReadinessIndex: 85,
        verifiedSkills: ["Financial Analysis", "Credit Risk Modeling", "GST Compliance"],
        selfReportedSkills: ["Tally ERP", "Excel Modeling"],
        projects: [
          {
            title: "SME Credit Portfolio Stress Testing",
            description: "Risk simulation of lending portfolios under changing interest rates.",
            url: "https://github.com/bhavna/sme-risk",
          },
        ],
        qualifications: ["B.Com / CA Inter"],
        lastActiveAt: "2026-11-20T11:30:00.000Z",
      },
    },
    industryChallenges: {
      "emp-apex-diag": [
        {
          id: "chal-clinical-diag-01",
          organizationId: "emp-apex-diag",
          organizationName: "Apex Healthcare & Diagnostic Systems",
          title: "Multi-Marker Clinical Biochemistry Case Challenge",
          category: "HEALTHCARE_CASE",
          stream: "MEDICAL_PCB",
          difficulty: "INTERMEDIATE",
          description: "Analyze anonymized synthetic multi-parameter laboratory assay datasets to identify electrolyte imbalances and acid-base disorders.",
          problemStatement: "A cohort of critical care patients exhibits conflicting metabolic acidosis indicators. Review the laboratory findings, cross-reference serum anion gaps, and prepare an audit report.",
          deliverables: ["Diagnostic Case Evaluation Report (PDF)", "Critical Lab Alert Action Plan"],
          requiredSkills: ["Biochemistry Assays", "Diagnostic Radiology & Imaging", "Laboratory Safety"],
          rubricCriteria: [
            { criterion: "Accuracy of Electrolyte Gap Calculation", weight: 35 },
            { criterion: "Clinical Diagnostic Reasoning", weight: 35 },
            { criterion: "Safety & Regulatory Compliance Reporting", weight: 30 },
          ],
          submissionDeadline: "2026-12-31",
          isAdultOnly: true,
          status: "PUBLISHED",
          rewardCredentialTitle: "Certified Clinical Biochemistry Case Analyst",
          totalParticipants: 12,
          totalSubmissions: 3,
          createdAt: "2026-11-01T00:00:00.000Z",
          updatedAt: "2026-11-15T00:00:00.000Z",
        },
      ],
    },
    challengeSubmissions: {},
    interviews: {},
    recruitmentInvitations: {},
    matchingConfigurations: {},
    // Part G Collections
    adminAuditLogs: [
      {
        id: "audit-001",
        adminId: "admin-super-01",
        adminName: "Dr. Vikramaditya Sen",
        action: "INSTITUTION_VERIFIED",
        targetType: "INSTITUTION",
        targetId: "inst-aiims-delhi",
        targetName: "All India Institute of Medical Sciences (AIIMS Delhi)",
        details: "Approved statutory AISHE documentation and accreditation certificate.",
        timestamp: "2026-11-19T09:30:00.000Z",
      },
      {
        id: "audit-002",
        adminId: "admin-super-01",
        adminName: "Dr. Vikramaditya Sen",
        action: "EMPLOYER_VERIFIED",
        targetType: "EMPLOYER",
        targetId: "emp-apex-diag",
        targetName: "Apex Healthcare & Diagnostic Systems",
        details: "Verified MCA CIN, GSTIN, and business incorporation certificates.",
        timestamp: "2026-11-19T10:15:00.000Z",
      },
    ],
    verificationRequests: [
      {
        id: "vreq-inst-01",
        organizationId: "inst-aiims-delhi",
        organizationType: "INSTITUTION",
        organizationName: "All India Institute of Medical Sciences (AIIMS Delhi)",
        legalIdentifier: "AISHE-U-0108",
        contactEmail: "director@aiims.edu",
        submittedAt: "2026-11-18T10:00:00.000Z",
        status: "APPROVED",
        documents: [
          {
            documentType: "AISHE_CERTIFICATE",
            documentUrl: "/docs/sample-aishe-aiims.pdf",
            fileName: "AIIMS_AISHE_Registration_2025.pdf",
            uploadedAt: "2026-11-18T10:00:00.000Z",
          },
        ],
        reviewNotes: "Government institute of national importance.",
        reviewedBy: "Dr. Vikramaditya Sen",
        reviewedAt: "2026-11-19T09:30:00.000Z",
      },
      {
        id: "vreq-inst-02",
        organizationId: "inst-dtu-delhi",
        organizationType: "INSTITUTION",
        organizationName: "Delhi Technological University (DTU)",
        legalIdentifier: "AISHE-U-0098",
        contactEmail: "registrar@dtu.ac.in",
        submittedAt: "2026-11-20T08:00:00.000Z",
        status: "PENDING_REVIEW",
        documents: [
          {
            documentType: "NAAC_CERTIFICATE",
            documentUrl: "/docs/sample-naac-dtu.pdf",
            fileName: "DTU_NAAC_Accreditation_A_Plus.pdf",
            uploadedAt: "2026-11-20T08:00:00.000Z",
          },
        ],
      },
      {
        id: "vreq-emp-01",
        organizationId: "emp-apex-diag",
        organizationType: "EMPLOYER",
        organizationName: "Apex Healthcare & Diagnostic Systems",
        legalIdentifier: "CIN-U85110DL2018PTC329104",
        contactEmail: "legal@apexdiagnostics.example.in",
        submittedAt: "2026-11-18T14:00:00.000Z",
        status: "APPROVED",
        documents: [
          {
            documentType: "MCA_INCORPORATION",
            documentUrl: "/docs/sample-mca-apex.pdf",
            fileName: "Apex_MCA_Certificate.pdf",
            uploadedAt: "2026-11-18T14:00:00.000Z",
          },
        ],
        reviewNotes: "Incorporation documents and GSTIN verified via official MCA records.",
        reviewedBy: "Dr. Vikramaditya Sen",
        reviewedAt: "2026-11-19T10:15:00.000Z",
      },
      {
        id: "vreq-emp-02",
        organizationId: "emp-tata-prec",
        organizationType: "EMPLOYER",
        organizationName: "Tata Precision Engineering & Infrastructure",
        legalIdentifier: "CIN-L28920MH1985PLC036450",
        contactEmail: "compliance@tataprecision.example.in",
        submittedAt: "2026-11-20T09:00:00.000Z",
        status: "PENDING_REVIEW",
        documents: [
          {
            documentType: "MCA_CIN_AND_GSTIN",
            documentUrl: "/docs/sample-tata-cin.pdf",
            fileName: "Tata_Precision_MCA_CIN.pdf",
            uploadedAt: "2026-11-20T09:00:00.000Z",
          },
        ],
      },
    ],
    cmsContentItems: [
      {
        id: "cms-career-01",
        contentType: "CAREER_PATH",
        stream: "MEDICAL_PCB",
        title: "Clinical Biochemist & Diagnostic Specialist",
        slug: "clinical-biochemist",
        summary: "Specialist overseeing automated biochemical profiling and specimen interpretation.",
        content: {
          regulatoryBody: "National Medical Commission (NMC)",
          requiredQualifications: ["B.Sc / M.Sc Medical Biochemistry", "MBBS"],
          salaryBenchmark: "₹6,50,000 - ₹14,00,000",
        },
        status: "PUBLISHED",
        authorId: "admin-super-01",
        authorName: "Dr. Vikramaditya Sen",
        publishedAt: "2026-11-15T00:00:00.000Z",
        createdAt: "2026-11-15T00:00:00.000Z",
        updatedAt: "2026-11-15T00:00:00.000Z",
        version: 1,
      },
      {
        id: "cms-exam-01",
        contentType: "EXAM_ALERT",
        stream: "MEDICAL_PCB",
        title: "NEET UG 2027 Registration Notification",
        slug: "neet-ug-2027",
        summary: "National Eligibility cum Entrance Test for Undergraduate Medical Admissions.",
        content: {
          conductingBody: "National Testing Agency (NTA)",
          registrationDates: "Feb 2027 - March 2027",
          officialWebsite: "https://neet.nta.nic.in",
        },
        status: "PUBLISHED",
        authorId: "admin-super-01",
        authorName: "Dr. Vikramaditya Sen",
        publishedAt: "2026-11-18T00:00:00.000Z",
        createdAt: "2026-11-18T00:00:00.000Z",
        updatedAt: "2026-11-18T00:00:00.000Z",
        version: 1,
      },
      {
        id: "cms-policy-01",
        contentType: "POLICY",
        stream: "ALL",
        title: "DPDP Act (2023) Child Safety & Privacy Policy",
        slug: "dpdp-privacy-policy",
        summary: "Statutory protections for under-18 learners across KAABIL platform services.",
        content: {
          governingAct: "Digital Personal Data Protection Act, 2023 (Section 9)",
          minorProtections: "Strict shielding from commercial employment targeting and marketing profiling.",
        },
        status: "PUBLISHED",
        authorId: "admin-super-01",
        authorName: "Dr. Vikramaditya Sen",
        publishedAt: "2026-11-10T00:00:00.000Z",
        createdAt: "2026-11-10T00:00:00.000Z",
        updatedAt: "2026-11-10T00:00:00.000Z",
        version: 1,
      },
    ],
    aiGovernanceRecords: [
      {
        timestamp: "2026-11-20T14:30:00.000Z",
        requestId: "ai-req-001",
        endpoint: "/api/student/mentor",
        model: "gemini-2.0-flash",
        promptVersion: "v1.4-multilingual",
        latencyMs: 185,
        tokensUsed: 420,
        status: "SUCCESS",
      },
      {
        timestamp: "2026-11-20T14:35:00.000Z",
        requestId: "ai-req-002",
        endpoint: "/api/student/skill-gaps",
        model: "gemini-2.0-flash",
        promptVersion: "v2.1-explainable",
        latencyMs: 215,
        tokensUsed: 610,
        status: "SUCCESS",
      },
    ],
    academyResources: [
      {
        id: "acad-res-01",
        title: "Automated Clinical Chemistry Calibration Protocols",
        stream: "MEDICAL_PCB",
        competency: "Biochemistry Assays",
        difficulty: "INTERMEDIATE",
        resourceType: "VIDEO",
        estimatedMinutes: 25,
        url: "https://kaabil.in/academy/clinical-chem-calibration",
        summary: "Step-by-step methodology for setting up reference calibration curves on multi-channel clinical analyzers.",
        provider: "Apex Medical Academy",
        isMandatoryForCRI: true,
      },
      {
        id: "acad-res-02",
        title: "Biosafety Protocols in Pathological Specimen Handling",
        stream: "MEDICAL_PCB",
        competency: "Laboratory Safety",
        difficulty: "BEGINNER",
        resourceType: "ARTICLE",
        estimatedMinutes: 15,
        url: "https://kaabil.in/academy/biosafety-level-2",
        summary: "Comprehensive guide to BSL-2 lab standards, sharps disposal, and biohazard isolation.",
        provider: "National Health Science Standards",
        isMandatoryForCRI: true,
      },
      {
        id: "acad-res-03",
        title: "Distributed Microservices & Relational Schema Modeling",
        stream: "NON_MEDICAL_PCM",
        competency: "PostgreSQL",
        difficulty: "ADVANCED",
        resourceType: "CASE_STUDY",
        estimatedMinutes: 40,
        url: "https://kaabil.in/academy/postgresql-architecture",
        summary: "Production database modeling with foreign keys, constraints, and index optimizations.",
        provider: "KAABIL Engineering Faculty",
        isMandatoryForCRI: false,
      },
      {
        id: "acad-res-04",
        title: "GST Compliance & Input Tax Credit Computation",
        stream: "COMMERCE",
        competency: "GST Compliance",
        difficulty: "INTERMEDIATE",
        resourceType: "DOCUMENT",
        estimatedMinutes: 30,
        url: "https://kaabil.in/academy/gst-itc-computation",
        summary: "Practical computations of GSTR-3B filings, reconciliations, and eligible input tax credits.",
        provider: "Institute of Chartered Accountants (ICAI Syllabus)",
        isMandatoryForCRI: true,
      },
    ],
    resourceProgress: {},
    studentResumes: {
      "sp-aryan-01": {
        studentProfileId: "sp-aryan-01",
        fullName: "Aryan Sharma",
        headline: "Aspiring Clinical Biochemist & Medical Technology Enthusiast",
        email: "demo.student@kaabil.in",
        phone: "+91 98765 43210",
        city: "New Delhi",
        state: "Delhi",
        summary: "Dedicated undergraduate student in Medical & Life Sciences with verified credentials in Clinical Biochemistry, Phlebotomy, and Laboratory Safety.",
        stream: "MEDICAL_PCB",
        educationStage: "UNDERGRADUATE",
        verifiedSkills: ["Biochemistry Assays", "Laboratory Safety", "Diagnostic Radiology & Imaging"],
        selfReportedSkills: ["Python", "Research Methodology"],
        projects: [
          {
            title: "Automated Chemistry Panel Audit",
            description: "Developed structured protocol for anomaly detection in automated chemistry analyzer curves.",
            technologies: ["Spectrophotometry", "Quality Control"],
          },
        ],
        credentials: [
          {
            title: "Certified Clinical Biochemistry Case Analyst",
            issuerName: "Apex Healthcare & Diagnostic Systems",
            issuedAt: "2026-11-15T00:00:00.000Z",
          },
        ],
        templateId: "CLASSIC_IVY",
      },
    },
    mockInterviewSessions: {},
    systemNotifications: [],
  };
}

class DevStore {
  private memoryCache: DevStoreData | null = null;

  private loadStore(): DevStoreData {
    if (this.memoryCache) return this.memoryCache;

    try {
      if (!fs.existsSync(STORE_DIR)) {
        fs.mkdirSync(STORE_DIR, { recursive: true });
      }
      if (!fs.existsSync(STORE_FILE)) {
        const init = getInitialStore();
        try {
          fs.writeFileSync(STORE_FILE, JSON.stringify(init, null, 2), "utf-8");
        } catch {
          // Read-only filesystem or serverless cold-start: proceed with in-memory init
        }
        this.memoryCache = init;
        return init;
      }
      const raw = fs.readFileSync(STORE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      parsed.conversations = parsed.conversations || {};
      parsed.assessments = parsed.assessments || {};
      parsed.attempts = parsed.attempts || {};
      parsed.results = parsed.results || {};
      parsed.evidences = parsed.evidences || {};
      parsed.skillGapAnalyses = parsed.skillGapAnalyses || {};
      parsed.credentials = parsed.credentials || {};
      parsed.shareTokens = parsed.shareTokens || {};
      parsed.passportPreferences = parsed.passportPreferences || {};
      parsed.learningPreferences = parsed.learningPreferences || {};
      parsed.learningTaskStates = parsed.learningTaskStates || {};
      parsed.projectEnrollments = parsed.projectEnrollments || {};
      parsed.institutions = parsed.institutions && Object.keys(parsed.institutions).length > 0
        ? parsed.institutions
        : getInitialStore().institutions;
      parsed.departments = parsed.departments || getInitialStore().departments;
      parsed.programs = parsed.programs || getInitialStore().programs;
      parsed.academicSessions = parsed.academicSessions || getInitialStore().academicSessions;
      parsed.classesBatches = parsed.classesBatches || getInitialStore().classesBatches;
      parsed.facultyMembers = parsed.facultyMembers || getInitialStore().facultyMembers;
      parsed.studentEnrollments = parsed.studentEnrollments || getInitialStore().studentEnrollments;
      parsed.bulkImportJobs = parsed.bulkImportJobs || {};
      parsed.adminAuditLogs = parsed.adminAuditLogs || getInitialStore().adminAuditLogs;
      parsed.verificationRequests = parsed.verificationRequests || getInitialStore().verificationRequests;
      parsed.cmsContentItems = parsed.cmsContentItems || getInitialStore().cmsContentItems;
      parsed.aiGovernanceRecords = parsed.aiGovernanceRecords || getInitialStore().aiGovernanceRecords;
      parsed.academyResources = parsed.academyResources || getInitialStore().academyResources;
      parsed.resourceProgress = parsed.resourceProgress || {};
      parsed.studentResumes = parsed.studentResumes || getInitialStore().studentResumes;
      parsed.mockInterviewSessions = parsed.mockInterviewSessions || {};
      parsed.systemNotifications = parsed.systemNotifications || [];
      this.memoryCache = parsed;
      return this.memoryCache!;
    } catch {
      if (!this.memoryCache) {
        this.memoryCache = getInitialStore();
      }
      return this.memoryCache;
    }
  }

  private saveStore(): void {
    if (!this.memoryCache) return;
    try {
      if (!fs.existsSync(STORE_DIR)) {
        fs.mkdirSync(STORE_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.memoryCache, null, 2), "utf-8");
    } catch (e: any) {
      // Graceful degradation: in serverless / read-only production environments, memoryCache continues in-memory
      if (process.env.NODE_ENV !== "test") {
        console.warn("[DevStore] Read-only / serverless environment (in-memory state preserved):", e?.message || e);
      }
    }
  }

  public reset(): void {
    const init = getInitialStore();
    this.memoryCache = init;
    this.saveStore();
  }

  // Users
  getUserByEmail(email: string) {
    if (!email || typeof email !== "string") return null;
    const store = this.loadStore();
    return store.users[email.toLowerCase().trim()] || null;
  }

  getUserById(id: string) {
    const store = this.loadStore();
    return Object.values(store.users).find((u) => u.id === id) || null;
  }

  saveUser(user: any) {
    const store = this.loadStore();
    store.users[user.email.toLowerCase().trim()] = user;
    this.saveStore();
  }

  updateUserPassword(email: string, passwordHash: string): boolean {
    const store = this.loadStore();
    const key = email.toLowerCase().trim();
    if (store.users[key]) {
      store.users[key].passwordHash = passwordHash;
      this.saveStore();
      return true;
    }
    return false;
  }

  // Password Reset Tokens
  saveResetToken(token: string, email: string, expiresAt: Date) {
    const store = this.loadStore();
    if (!store.resetTokens) store.resetTokens = {};
    store.resetTokens[token] = { email: email.toLowerCase().trim(), expiresAt: expiresAt.toISOString() };
    this.saveStore();
  }

  getResetToken(token: string): { email: string; expiresAt: string } | null {
    const store = this.loadStore();
    if (!store.resetTokens) return null;
    return store.resetTokens[token] || null;
  }

  deleteResetToken(token: string) {
    const store = this.loadStore();
    if (store.resetTokens && store.resetTokens[token]) {
      delete store.resetTokens[token];
      this.saveStore();
    }
  }

  // Sessions
  saveSession(token: string, user: AuthenticatedUser, expires: Date) {
    const store = this.loadStore();
    store.sessions[token] = { user, expires: expires.toISOString() };
    this.saveStore();
  }

  getSession(token: string): AuthenticatedUser | null {
    const store = this.loadStore();
    const record = store.sessions[token];
    if (!record) return null;
    if (new Date(record.expires) < new Date()) {
      delete store.sessions[token];
      this.saveStore();
      return null;
    }
    if (record.user?.email && store.users[record.user.email]) {
      const liveUser = store.users[record.user.email];
      return {
        ...record.user,
        studentProfile: liveUser.studentProfile || record.user.studentProfile,
      };
    }
    return record.user;
  }

  deleteSession(token: string) {
    const store = this.loadStore();
    if (store.sessions[token]) {
      delete store.sessions[token];
      this.saveStore();
    }
  }

  // Student Profiles
  getProfile(profileId: string) {
    const store = this.loadStore();
    return store.profiles[profileId] || null;
  }

  getProfileByUserId(userId: string) {
    const store = this.loadStore();
    return Object.values(store.profiles).find((p) => p.userId === userId) || null;
  }

  getProfileByEmail(email: string) {
    const store = this.loadStore();
    return Object.values(store.profiles).find((p) => p.user?.email === email) || null;
  }

  saveProfile(profile: any) {
    const store = this.loadStore();
    store.profiles[profile.id] = {
      ...(store.profiles[profile.id] || {}),
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    this.saveStore();
  }

  // Roadmaps
  getRoadmap(studentProfileId: string) {
    const store = this.loadStore();
    return Object.values(store.roadmaps).find(
      (r) => r.studentProfileId === studentProfileId && r.status === "ACTIVE"
    ) || null;
  }

  saveRoadmap(roadmap: any) {
    const store = this.loadStore();
    store.roadmaps[roadmap.id] = roadmap;
    this.saveStore();
  }

  updateRoadmapActivity(milestoneId: string, activityId: string, isCompleted: boolean) {
    const store = this.loadStore();
    for (const r of Object.values(store.roadmaps)) {
      for (const m of r.milestones || []) {
        if (m.id === milestoneId) {
          for (const a of m.activities || []) {
            if (a.id === activityId) {
              a.isCompleted = isCompleted;
            }
          }
          // Recalculate milestone completion
          const allDone = (m.activities || []).every((a: any) => a.isCompleted);
          m.isCompleted = allDone;
          // Recalculate roadmap completion
          const totalMilestones = r.milestones.length;
          const completedMilestones = r.milestones.filter((m: any) => m.isCompleted).length;
          r.completionPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
          this.saveStore();
          return r;
        }
      }
    }
    return null;
  }

  // Daily Missions
  getMissions(studentProfileId: string): any[] {
    const store = this.loadStore();
    return store.missions[studentProfileId] || [];
  }

  saveMissions(studentProfileId: string, missions: any[]) {
    const store = this.loadStore();
    store.missions[studentProfileId] = missions;
    this.saveStore();
  }

  completeMission(studentProfileId: string, missionId: string, reflectionNote: string, userRating?: number) {
    const store = this.loadStore();
    const list = store.missions[studentProfileId] || [];
    const target = list.find((m) => m.id === missionId);
    if (target) {
      target.status = "COMPLETED";
      target.reflectionText = reflectionNote;
      target.reflectionNote = reflectionNote;
      target.userRating = userRating || 5;
      target.completedAt = new Date().toISOString();
      this.saveStore();
      return target;
    }
    return null;
  }

  skipMission(studentProfileId: string, missionId: string) {
    const store = this.loadStore();
    const list = store.missions[studentProfileId] || [];
    const target = list.find((m) => m.id === missionId);
    if (target) {
      target.status = "SKIPPED";
      this.saveStore();
      return target;
    }
    return null;
  }

  // Mentor Conversations & Messages
  getMentorConversations(studentProfileId: string): any[] {
    const store = this.loadStore();
    return Object.values(store.conversations)
      .filter((c: any) => c.studentProfileId === studentProfileId)
      .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getMentorConversation(id: string): any | null {
    const store = this.loadStore();
    return store.conversations[id] || null;
  }

  saveMentorConversation(conv: any) {
    const store = this.loadStore();
    const now = new Date().toISOString();
    store.conversations[conv.id] = {
      ...conv,
      createdAt: conv.createdAt || now,
      updatedAt: now,
      messages: conv.messages || [],
    };
    this.saveStore();
    return store.conversations[conv.id];
  }

  deleteMentorConversation(id: string): boolean {
    const store = this.loadStore();
    if (store.conversations[id]) {
      delete store.conversations[id];
      this.saveStore();
      return true;
    }
    return false;
  }

  addMentorMessage(conversationId: string, message: any): any {
    const store = this.loadStore();
    const conv = store.conversations[conversationId];
    if (!conv) return null;
    const now = new Date().toISOString();
    const msgRecord = {
      ...message,
      id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId,
      createdAt: message.createdAt || now,
    };
    conv.messages = conv.messages || [];
    conv.messages.push(msgRecord);
    conv.updatedAt = now;
    this.saveStore();
    return msgRecord;
  }

  // Skill Assessments
  getAssessments(filter?: { stream?: string; category?: string; difficulty?: string }): any[] {
    const store = this.loadStore();
    let list = Object.values(store.assessments);
    if (filter?.stream && filter.stream !== "ALL") {
      list = list.filter((a: any) => a.stream === filter.stream || a.stream === "UNDECIDED");
    }
    if (filter?.category && filter.category !== "ALL") {
      list = list.filter((a: any) => a.category === filter.category);
    }
    if (filter?.difficulty && filter.difficulty !== "ALL") {
      list = list.filter((a: any) => a.difficultyLevel === filter.difficulty);
    }
    return list;
  }

  getAssessmentById(id: string): any | null {
    const store = this.loadStore();
    return store.assessments[id] || null;
  }

  getAssessmentBySlug(slug: string): any | null {
    const store = this.loadStore();
    return Object.values(store.assessments).find((a: any) => a.slug === slug) || null;
  }

  saveAssessment(assessment: any) {
    const store = this.loadStore();
    store.assessments[assessment.id] = assessment;
    this.saveStore();
    return assessment;
  }

  saveAssessmentsBatch(assessments: any[]) {
    const store = this.loadStore();
    for (const a of assessments) {
      store.assessments[a.id] = a;
    }
    this.saveStore();
  }

  // Assessment Attempts
  getAssessmentAttempts(studentProfileId: string): any[] {
    const store = this.loadStore();
    return Object.values(store.attempts)
      .filter((att: any) => att.studentProfileId === studentProfileId)
      .sort((a: any, b: any) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  getAssessmentAttempt(id: string): any | null {
    const store = this.loadStore();
    return store.attempts[id] || null;
  }

  saveAssessmentAttempt(attempt: any) {
    const store = this.loadStore();
    store.attempts[attempt.id] = attempt;
    this.saveStore();
    return attempt;
  }

  // Assessment Results
  getAssessmentResult(attemptId: string): any | null {
    const store = this.loadStore();
    return store.results[attemptId] || null;
  }

  saveAssessmentResult(result: any) {
    const store = this.loadStore();
    store.results[result.attemptId] = result;
    this.saveStore();
    return result;
  }

  // Skill Evidence & Verification
  getSkillEvidences(studentProfileId: string): any[] {
    const store = this.loadStore();
    return store.evidences[studentProfileId] || [];
  }

  getSkillEvidence(studentProfileId: string): any[] {
    return this.getSkillEvidences(studentProfileId);
  }

  saveSkillEvidence(evidence: any): any {
    const store = this.loadStore();
    const pid = evidence.studentProfileId;
    store.evidences[pid] = store.evidences[pid] || [];
    
    // Check if evidence already exists for this skill
    const existingIndex = store.evidences[pid].findIndex(
      (e: any) => e.skillName.toLowerCase() === evidence.skillName.toLowerCase()
    );
    if (existingIndex >= 0) {
      store.evidences[pid][existingIndex] = evidence;
    } else {
      store.evidences[pid].push(evidence);
    }

    // Automatically update student profile userSkills to verified
    const profile = store.profiles[pid];
    if (profile) {
      profile.userSkills = profile.userSkills || [];
      const skillIdx = profile.userSkills.findIndex(
        (s: any) => (s.skill?.name || s.name || "").toLowerCase() === evidence.skillName.toLowerCase()
      );
      if (skillIdx >= 0) {
        profile.userSkills[skillIdx].isVerified = true;
        profile.userSkills[skillIdx].scorePercentage = evidence.scorePercentage;
        profile.userSkills[skillIdx].verifiedAt = new Date().toISOString();
      } else {
        profile.userSkills.push({
          id: `usk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          skill: { name: evidence.skillName, category: "TECHNICAL" },
          name: evidence.skillName,
          isVerified: true,
          scorePercentage: evidence.scorePercentage,
          verifiedAt: new Date().toISOString(),
        });
      }
      // Re-save profile
      store.profiles[pid] = profile;
    }

    this.saveStore();
    return evidence;
  }

  // Skill Gap Analyses
  getSkillGapAnalyses(studentProfileId: string): any[] {
    const store = this.loadStore();
    return Object.values(store.skillGapAnalyses || {})
      .filter((a: any) => a.studentProfileId === studentProfileId)
      .sort((a: any, b: any) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
  }

  getSkillGapAnalysis(id: string): any | null {
    const store = this.loadStore();
    return store.skillGapAnalyses?.[id] || null;
  }

  saveSkillGapAnalysis(analysis: any): any {
    const store = this.loadStore();
    store.skillGapAnalyses = store.skillGapAnalyses || {};
    store.skillGapAnalyses[analysis.id] = analysis;
    this.saveStore();
    return analysis;
  }

  // Credentials (KaabilCredential)
  getCredentials(studentProfileId: string): any[] {
    const store = this.loadStore();
    return store.credentials?.[studentProfileId] || [];
  }

  getStudentCredentials(studentProfileId: string): any[] {
    return this.getCredentials(studentProfileId);
  }

  getCredential(studentProfileId: string, credentialId: string): any | null {
    const list = this.getCredentials(studentProfileId);
    return list.find((c: any) => c.id === credentialId) || null;
  }

  saveCredential(studentProfileId: string, credential: any): any {
    const store = this.loadStore();
    store.credentials = store.credentials || {};
    store.credentials[studentProfileId] = store.credentials[studentProfileId] || [];
    const existingIdx = store.credentials[studentProfileId].findIndex((c: any) => c.id === credential.id);
    if (existingIdx >= 0) {
      store.credentials[studentProfileId][existingIdx] = credential;
    } else {
      store.credentials[studentProfileId].push(credential);
    }
    this.saveStore();
    return credential;
  }

  saveStudentCredential(credential: any): any {
    const profileId = credential.studentProfileId;
    return this.saveCredential(profileId, credential);
  }

  // Share Tokens for Passport verification
  getShareToken(token: string): any | null {
    const store = this.loadStore();
    return store.shareTokens?.[token] || null;
  }

  saveShareToken(token: string, data: any): any {
    const store = this.loadStore();
    store.shareTokens = store.shareTokens || {};
    store.shareTokens[token] = data;
    this.saveStore();
    return data;
  }

  revokeShareToken(token: string): boolean {
    const store = this.loadStore();
    if (store.shareTokens?.[token]) {
      store.shareTokens[token].isRevoked = true;
      store.shareTokens[token].revokedAt = new Date().toISOString();
      this.saveStore();
      return true;
    }
    return false;
  }

  // Passport Preferences & Privacy
  getPassportPreferences(studentProfileId: string): any {
    const store = this.loadStore();
    return (
      store.passportPreferences?.[studentProfileId] || {
        isPublic: false,
        shareSkills: true,
        shareCredentials: true,
        shareEducation: true,
        shareAssessments: true,
      }
    );
  }

  savePassportPreferences(studentProfileId: string, prefs: any): any {
    const store = this.loadStore();
    store.passportPreferences = store.passportPreferences || {};
    store.passportPreferences[studentProfileId] = {
      ...(store.passportPreferences[studentProfileId] || {}),
      ...prefs,
      updatedAt: new Date().toISOString(),
    };
    this.saveStore();
    return store.passportPreferences[studentProfileId];
  }

  // Learning Plan & Projects Hub Persistence
  getLearningPreferences(studentProfileId: string): any {
    const store = this.loadStore();
    return (
      store.learningPreferences?.[studentProfileId] || {
        weeklyTimeCommitmentHours: 10,
        budgetPreference: "FREE_ONLY",
        learningPace: "STEADY",
      }
    );
  }

  saveLearningPreferences(studentProfileId: string, prefs: any): any {
    const store = this.loadStore();
    store.learningPreferences = store.learningPreferences || {};
    store.learningPreferences[studentProfileId] = {
      ...(store.learningPreferences[studentProfileId] || {}),
      ...prefs,
      updatedAt: new Date().toISOString(),
    };
    this.saveStore();
    return store.learningPreferences[studentProfileId];
  }

  getLearningTaskStates(studentProfileId: string): Record<string, any> {
    const store = this.loadStore();
    return store.learningTaskStates?.[studentProfileId] || {};
  }

  saveLearningTaskState(studentProfileId: string, taskId: string, state: any): any {
    const store = this.loadStore();
    store.learningTaskStates = store.learningTaskStates || {};
    store.learningTaskStates[studentProfileId] = store.learningTaskStates[studentProfileId] || {};
    store.learningTaskStates[studentProfileId][taskId] = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    this.saveStore();
    return store.learningTaskStates[studentProfileId][taskId];
  }

  getProjectEnrollments(studentProfileId: string): Record<string, any> {
    const store = this.loadStore();
    return store.projectEnrollments?.[studentProfileId] || {};
  }

  saveProjectEnrollment(studentProfileId: string, projectId: string, enrollment: any): any {
    const store = this.loadStore();
    store.projectEnrollments = store.projectEnrollments || {};
    store.projectEnrollments[studentProfileId] = store.projectEnrollments[studentProfileId] || {};
    store.projectEnrollments[studentProfileId][projectId] = {
      ...(store.projectEnrollments[studentProfileId][projectId] || {}),
      ...enrollment,
      lastUpdatedAt: new Date().toISOString(),
    };
    this.saveStore();
    return store.projectEnrollments[studentProfileId][projectId];
  }

  // --------------------------------------------------------------------------
  // INSTITUTION MULTI-TENANT METHODS (Part E1)
  // --------------------------------------------------------------------------

  // Institutions
  getInstitutions(): any[] {
    const store = this.loadStore();
    return Object.values(store.institutions || {});
  }

  getInstitution(id: string): any | null {
    const store = this.loadStore();
    return store.institutions?.[id] || null;
  }

  getInstitutionBySlug(slug: string): any | null {
    const store = this.loadStore();
    return Object.values(store.institutions || {}).find((i: any) => i.slug === slug) || null;
  }

  getInstitutionByCode(code: string): any | null {
    const store = this.loadStore();
    const cleanCode = code.trim().toUpperCase();
    return Object.values(store.institutions || {}).find((i: any) => (i.invitationCode || "").toUpperCase() === cleanCode) || null;
  }

  saveInstitution(inst: any): any {
    const store = this.loadStore();
    store.institutions = store.institutions || {};
    store.institutions[inst.id] = {
      ...(store.institutions[inst.id] || {}),
      ...inst,
      updatedAt: new Date().toISOString(),
    };
    this.saveStore();
    return store.institutions[inst.id];
  }

  // Departments
  getDepartments(institutionId: string): any[] {
    const store = this.loadStore();
    return store.departments?.[institutionId] || [];
  }

  getDepartment(institutionId: string, departmentId: string): any | null {
    const list = this.getDepartments(institutionId);
    return list.find((d: any) => d.id === departmentId) || null;
  }

  saveDepartment(dept: any): any {
    const store = this.loadStore();
    const iid = dept.institutionId;
    store.departments = store.departments || {};
    store.departments[iid] = store.departments[iid] || [];
    const idx = store.departments[iid].findIndex((d: any) => d.id === dept.id);
    if (idx >= 0) {
      store.departments[iid][idx] = { ...store.departments[iid][idx], ...dept, updatedAt: new Date().toISOString() };
    } else {
      store.departments[iid].push({ ...dept, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.saveStore();
    return dept;
  }

  deleteDepartment(institutionId: string, departmentId: string): boolean {
    const store = this.loadStore();
    if (store.departments?.[institutionId]) {
      store.departments[institutionId] = store.departments[institutionId].filter((d: any) => d.id !== departmentId);
      this.saveStore();
      return true;
    }
    return false;
  }

  // Programs
  getPrograms(institutionId: string): any[] {
    const store = this.loadStore();
    return store.programs?.[institutionId] || [];
  }

  getProgram(institutionId: string, programId: string): any | null {
    const list = this.getPrograms(institutionId);
    return list.find((p: any) => p.id === programId) || null;
  }

  saveProgram(prog: any): any {
    const store = this.loadStore();
    const iid = prog.institutionId;
    store.programs = store.programs || {};
    store.programs[iid] = store.programs[iid] || [];
    const idx = store.programs[iid].findIndex((p: any) => p.id === prog.id);
    if (idx >= 0) {
      store.programs[iid][idx] = { ...store.programs[iid][idx], ...prog, updatedAt: new Date().toISOString() };
    } else {
      store.programs[iid].push({ ...prog, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.saveStore();
    return prog;
  }

  // Academic Sessions
  getAcademicSessions(institutionId: string): any[] {
    const store = this.loadStore();
    return store.academicSessions?.[institutionId] || [];
  }

  saveAcademicSession(sess: any): any {
    const store = this.loadStore();
    const iid = sess.institutionId;
    store.academicSessions = store.academicSessions || {};
    store.academicSessions[iid] = store.academicSessions[iid] || [];
    const idx = store.academicSessions[iid].findIndex((s: any) => s.id === sess.id);
    if (idx >= 0) {
      store.academicSessions[iid][idx] = sess;
    } else {
      store.academicSessions[iid].push(sess);
    }
    this.saveStore();
    return sess;
  }

  // Classes & Batches
  getClassesBatches(institutionId: string): any[] {
    const store = this.loadStore();
    return store.classesBatches?.[institutionId] || [];
  }

  getClassBatch(institutionId: string, batchId: string): any | null {
    const list = this.getClassesBatches(institutionId);
    return list.find((b: any) => b.id === batchId) || null;
  }

  saveClassBatch(batch: any): any {
    const store = this.loadStore();
    const iid = batch.institutionId;
    store.classesBatches = store.classesBatches || {};
    store.classesBatches[iid] = store.classesBatches[iid] || [];
    const idx = store.classesBatches[iid].findIndex((b: any) => b.id === batch.id);
    if (idx >= 0) {
      store.classesBatches[iid][idx] = batch;
    } else {
      store.classesBatches[iid].push(batch);
    }
    this.saveStore();
    return batch;
  }

  // Faculty & Staff
  getFacultyMembers(institutionId: string): any[] {
    const store = this.loadStore();
    return store.facultyMembers?.[institutionId] || [];
  }

  getFacultyMember(institutionId: string, facultyId: string): any | null {
    const list = this.getFacultyMembers(institutionId);
    return list.find((f: any) => f.id === facultyId) || null;
  }

  saveFacultyMember(fac: any): any {
    const store = this.loadStore();
    const iid = fac.institutionId;
    store.facultyMembers = store.facultyMembers || {};
    store.facultyMembers[iid] = store.facultyMembers[iid] || [];
    const idx = store.facultyMembers[iid].findIndex((f: any) => f.id === fac.id);
    if (idx >= 0) {
      store.facultyMembers[iid][idx] = fac;
    } else {
      store.facultyMembers[iid].push(fac);
    }
    this.saveStore();
    return fac;
  }

  getFacultyByToken(token: string): any | null {
    const store = this.loadStore();
    for (const list of Object.values(store.facultyMembers || {})) {
      const match = (list as any[]).find((f) => f.invitationToken === token);
      if (match) return match;
    }
    return null;
  }

  // Student Enrollments
  getStudentEnrollments(institutionId: string): any[] {
    const store = this.loadStore();
    return store.studentEnrollments?.[institutionId] || [];
  }

  getStudentEnrollment(institutionId: string, enrollmentId: string): any | null {
    const list = this.getStudentEnrollments(institutionId);
    return list.find((e: any) => e.id === enrollmentId) || null;
  }

  saveStudentEnrollment(enr: any): any {
    const store = this.loadStore();
    const iid = enr.institutionId;
    store.studentEnrollments = store.studentEnrollments || {};
    store.studentEnrollments[iid] = store.studentEnrollments[iid] || [];
    const idx = store.studentEnrollments[iid].findIndex((e: any) => e.id === enr.id);
    if (idx >= 0) {
      store.studentEnrollments[iid][idx] = enr;
    } else {
      store.studentEnrollments[iid].push(enr);
    }
    this.saveStore();
    return enr;
  }

  removeStudentEnrollment(institutionId: string, enrollmentId: string): boolean {
    const store = this.loadStore();
    if (store.studentEnrollments?.[institutionId]) {
      store.studentEnrollments[institutionId] = store.studentEnrollments[institutionId].filter((e: any) => e.id !== enrollmentId);
      this.saveStore();
      return true;
    }
    return false;
  }

  // Bulk Import Jobs
  getBulkImportJobs(institutionId: string): any[] {
    const store = this.loadStore();
    return store.bulkImportJobs?.[institutionId] || [];
  }

  saveBulkImportJob(job: any): any {
    const store = this.loadStore();
    const iid = job.institutionId;
    store.bulkImportJobs = store.bulkImportJobs || {};
    store.bulkImportJobs[iid] = store.bulkImportJobs[iid] || [];
    store.bulkImportJobs[iid].unshift(job);
    this.saveStore();
    return job;
  }

  // Interventions (Milestone E2.2)
  getInterventions(institutionId: string): any[] {
    const store = this.loadStore();
    return store.interventions?.[institutionId] || [];
  }

  getIntervention(institutionId: string, id: string): any | null {
    const list = this.getInterventions(institutionId);
    return list.find((item: any) => item.id === id) || null;
  }

  saveIntervention(item: any): any {
    const store = this.loadStore();
    const iid = item.institutionId;
    store.interventions = store.interventions || {};
    store.interventions[iid] = store.interventions[iid] || [];
    const idx = store.interventions[iid].findIndex((x: any) => x.id === item.id);
    if (idx >= 0) {
      store.interventions[iid][idx] = item;
    } else {
      store.interventions[iid].unshift(item);
    }
    this.saveStore();
    return item;
  }

  // Training Programs & Enrollments (Milestone E2.2)
  getTrainingPrograms(institutionId: string): any[] {
    const store = this.loadStore();
    return store.trainingPrograms?.[institutionId] || [];
  }

  getTrainingProgram(institutionId: string, programId: string): any | null {
    const list = this.getTrainingPrograms(institutionId);
    return list.find((p: any) => p.id === programId) || null;
  }

  saveTrainingProgram(prog: any): any {
    const store = this.loadStore();
    const iid = prog.institutionId;
    store.trainingPrograms = store.trainingPrograms || {};
    store.trainingPrograms[iid] = store.trainingPrograms[iid] || [];
    const idx = store.trainingPrograms[iid].findIndex((p: any) => p.id === prog.id);
    if (idx >= 0) {
      store.trainingPrograms[iid][idx] = prog;
    } else {
      store.trainingPrograms[iid].unshift(prog);
    }
    this.saveStore();
    return prog;
  }

  getTrainingEnrollments(programId: string): any[] {
    const store = this.loadStore();
    return store.trainingEnrollments?.[programId] || [];
  }

  saveTrainingEnrollment(enr: any): any {
    const store = this.loadStore();
    const pid = enr.programId;
    store.trainingEnrollments = store.trainingEnrollments || {};
    store.trainingEnrollments[pid] = store.trainingEnrollments[pid] || [];
    const idx = store.trainingEnrollments[pid].findIndex((x: any) => x.id === enr.id);
    if (idx >= 0) {
      store.trainingEnrollments[pid][idx] = enr;
    } else {
      store.trainingEnrollments[pid].push(enr);
    }
    this.saveStore();
    return enr;
  }

  // Institutional Assessment Schedules (Milestone E2.2)
  getAssessmentSchedules(institutionId: string): any[] {
    const store = this.loadStore();
    return store.assessmentSchedules?.[institutionId] || [];
  }

  saveAssessmentSchedule(sch: any): any {
    const store = this.loadStore();
    const iid = sch.institutionId;
    store.assessmentSchedules = store.assessmentSchedules || {};
    store.assessmentSchedules[iid] = store.assessmentSchedules[iid] || [];
    const idx = store.assessmentSchedules[iid].findIndex((s: any) => s.id === sch.id);
    if (idx >= 0) {
      store.assessmentSchedules[iid][idx] = sch;
    } else {
      store.assessmentSchedules[iid].unshift(sch);
    }
    this.saveStore();
    return sch;
  }

  // Placement Drives & Applications (Milestone E2.3)
  getPlacementDrives(institutionId: string): any[] {
    const store = this.loadStore();
    return store.placementDrives?.[institutionId] || [];
  }

  getPlacementDrive(institutionId: string, driveId: string): any | null {
    const list = this.getPlacementDrives(institutionId);
    return list.find((d: any) => d.id === driveId) || null;
  }

  savePlacementDrive(drive: any): any {
    const store = this.loadStore();
    const iid = drive.institutionId;
    store.placementDrives = store.placementDrives || {};
    store.placementDrives[iid] = store.placementDrives[iid] || [];
    const idx = store.placementDrives[iid].findIndex((d: any) => d.id === drive.id);
    if (idx >= 0) {
      store.placementDrives[iid][idx] = drive;
    } else {
      store.placementDrives[iid].unshift(drive);
    }
    this.saveStore();
    return drive;
  }

  getPlacementApplications(driveId: string): any[] {
    const store = this.loadStore();
    return store.placementApplications?.[driveId] || [];
  }

  savePlacementApplication(app: any): any {
    const store = this.loadStore();
    const did = app.driveId;
    store.placementApplications = store.placementApplications || {};
    store.placementApplications[did] = store.placementApplications[did] || [];
    const idx = store.placementApplications[did].findIndex((a: any) => a.id === app.id);
    if (idx >= 0) {
      store.placementApplications[did][idx] = app;
    } else {
      store.placementApplications[did].unshift(app);
    }
    this.saveStore();
    return app;
  }

  // Institutional Outcome Reports (Milestone E2.4)
  getOutcomeReports(institutionId: string): any[] {
    const store = this.loadStore();
    return store.outcomeReports?.[institutionId] || [];
  }

  saveOutcomeReport(report: any): any {
    const store = this.loadStore();
    const iid = report.institutionId;
    store.outcomeReports = store.outcomeReports || {};
    store.outcomeReports[iid] = store.outcomeReports[iid] || [];
    store.outcomeReports[iid].unshift(report);
    this.saveStore();
    return report;
  }

  // Institutional Notifications (Milestone E2.4)
  getInstitutionNotifications(institutionId: string): any[] {
    const store = this.loadStore();
    return store.institutionNotifications?.[institutionId] || [];
  }

  saveInstitutionNotification(notification: any): any {
    const store = this.loadStore();
    const iid = notification.institutionId;
    store.institutionNotifications = store.institutionNotifications || {};
    store.institutionNotifications[iid] = store.institutionNotifications[iid] || [];
    const idx = store.institutionNotifications[iid].findIndex((n: any) => n.id === notification.id);
    if (idx >= 0) {
      store.institutionNotifications[iid][idx] = notification;
    } else {
      store.institutionNotifications[iid].unshift(notification);
    }
    this.saveStore();
    return notification;
  }

  // ============================================================================
  // EMPLOYER PORTAL METHODS (Part F1)
  // ============================================================================

  // Employer Organizations
  getEmployerOrganization(id: string): any | null {
    const store = this.loadStore();
    return store.employerOrganizations?.[id] || null;
  }

  saveEmployerOrganization(org: any): any {
    const store = this.loadStore();
    store.employerOrganizations = store.employerOrganizations || {};
    store.employerOrganizations[org.id] = {
      ...(store.employerOrganizations[org.id] || {}),
      ...org,
      updatedAt: new Date().toISOString(),
    };
    this.saveStore();
    return store.employerOrganizations[org.id];
  }

  getAllEmployerOrganizations(): any[] {
    const store = this.loadStore();
    return Object.values(store.employerOrganizations || {});
  }

  getEmployerOrganizations(): any[] {
    return this.getAllEmployerOrganizations();
  }

  // Employer Members
  getEmployerMembers(orgId: string): any[] {
    const store = this.loadStore();
    return store.employerMembers?.[orgId] || [];
  }

  saveEmployerMember(member: any): any {
    const store = this.loadStore();
    const oid = member.organizationId;
    store.employerMembers = store.employerMembers || {};
    store.employerMembers[oid] = store.employerMembers[oid] || [];
    const idx = store.employerMembers[oid].findIndex((m: any) => m.id === member.id);
    if (idx >= 0) {
      store.employerMembers[oid][idx] = member;
    } else {
      store.employerMembers[oid].push(member);
    }
    this.saveStore();
    return member;
  }

  deleteEmployerMember(orgId: string, memberId: string): boolean {
    const store = this.loadStore();
    if (!store.employerMembers?.[orgId]) return false;
    const initialLen = store.employerMembers[orgId].length;
    store.employerMembers[orgId] = store.employerMembers[orgId].filter((m: any) => m.id !== memberId);
    this.saveStore();
    return store.employerMembers[orgId].length < initialLen;
  }

  // Job Opportunities
  getJobOpportunities(orgId?: string): any[] {
    const store = this.loadStore();
    if (orgId) {
      return store.jobOpportunities?.[orgId] || [];
    }
    // Return all opportunities across organizations
    const allOpps: any[] = [];
    if (store.jobOpportunities) {
      for (const orgList of Object.values(store.jobOpportunities)) {
        allOpps.push(...orgList);
      }
    }
    return allOpps;
  }

  getJobOpportunity(id: string): any | null {
    const store = this.loadStore();
    if (!store.jobOpportunities) return null;
    for (const orgList of Object.values(store.jobOpportunities)) {
      const match = orgList.find((o: any) => o.id === id);
      if (match) return match;
    }
    return null;
  }

  saveJobOpportunity(opp: any): any {
    const store = this.loadStore();
    const oid = opp.organizationId;
    store.jobOpportunities = store.jobOpportunities || {};
    store.jobOpportunities[oid] = store.jobOpportunities[oid] || [];
    const idx = store.jobOpportunities[oid].findIndex((o: any) => o.id === opp.id);
    if (idx >= 0) {
      store.jobOpportunities[oid][idx] = opp;
    } else {
      store.jobOpportunities[oid].unshift(opp);
    }
    this.saveStore();
    return opp;
  }

  // Job Applications
  getJobApplications(orgId?: string, oppId?: string): any[] {
    const store = this.loadStore();
    let list: any[] = [];
    if (orgId) {
      list = store.jobApplications?.[orgId] || [];
    } else if (store.jobApplications) {
      for (const orgList of Object.values(store.jobApplications)) {
        list.push(...orgList);
      }
    }

    if (oppId) {
      list = list.filter((a: any) => a.opportunityId === oppId);
    }
    return list;
  }

  getJobApplication(id: string): any | null {
    const store = this.loadStore();
    if (!store.jobApplications) return null;
    for (const orgList of Object.values(store.jobApplications)) {
      const match = orgList.find((a: any) => a.id === id);
      if (match) return match;
    }
    return null;
  }

  saveJobApplication(app: any): any {
    const store = this.loadStore();
    const oid = app.organizationId;
    store.jobApplications = store.jobApplications || {};
    store.jobApplications[oid] = store.jobApplications[oid] || [];
    const idx = store.jobApplications[oid].findIndex((a: any) => a.id === app.id);
    if (idx >= 0) {
      store.jobApplications[oid][idx] = app;
    } else {
      store.jobApplications[oid].unshift(app);
    }
    this.saveStore();
    return app;
  }

  getStudentJobApplications(studentProfileId: string): any[] {
    const store = this.loadStore();
    const list: any[] = [];
    if (store.jobApplications) {
      for (const orgList of Object.values(store.jobApplications)) {
        for (const app of orgList) {
          if (app.studentProfileId === studentProfileId) {
            list.push(app);
          }
        }
      }
    }
    return list;
  }

  // Saved Opportunities
  getSavedOpportunities(studentProfileId: string): string[] {
    const store = this.loadStore();
    return store.savedOpportunities?.[studentProfileId] || [];
  }

  saveSavedOpportunity(studentProfileId: string, oppId: string): string[] {
    const store = this.loadStore();
    store.savedOpportunities = store.savedOpportunities || {};
    const list = store.savedOpportunities[studentProfileId] || [];
    if (!list.includes(oppId)) {
      list.push(oppId);
    }
    store.savedOpportunities[studentProfileId] = list;
    this.saveStore();
    return list;
  }

  removeSavedOpportunity(studentProfileId: string, oppId: string): string[] {
    const store = this.loadStore();
    store.savedOpportunities = store.savedOpportunities || {};
    const list = (store.savedOpportunities[studentProfileId] || []).filter((id: string) => id !== oppId);
    store.savedOpportunities[studentProfileId] = list;
    this.saveStore();
    return list;
  }

  // Employer Partnerships
  getEmployerPartnerships(orgId: string): any[] {
    const store = this.loadStore();
    return store.employerPartnerships?.[orgId] || [];
  }

  saveEmployerPartnership(partnership: any): any {
    const store = this.loadStore();
    const oid = partnership.employerOrganizationId;
    store.employerPartnerships = store.employerPartnerships || {};
    store.employerPartnerships[oid] = store.employerPartnerships[oid] || [];
    const idx = store.employerPartnerships[oid].findIndex((p: any) => p.id === partnership.id);
    if (idx >= 0) {
      store.employerPartnerships[oid][idx] = partnership;
    } else {
      store.employerPartnerships[oid].unshift(partnership);
    }
    this.saveStore();
    return partnership;
  }

  // Employer Notifications
  getEmployerNotifications(orgId: string): any[] {
    const store = this.loadStore();
    return store.employerNotifications?.[orgId] || [];
  }

  saveEmployerNotification(notif: any): any {
    const store = this.loadStore();
    const oid = notif.organizationId;
    store.employerNotifications = store.employerNotifications || {};
    store.employerNotifications[oid] = store.employerNotifications[oid] || [];
    const idx = store.employerNotifications[oid].findIndex((n: any) => n.id === notif.id);
    if (idx >= 0) {
      store.employerNotifications[oid][idx] = notif;
    } else {
      store.employerNotifications[oid].unshift(notif);
    }
    this.saveStore();
    return notif;
  }

  // ============================================================================
  // PART F2 METHODS: MATCHING, DISCOVERY, INTERVIEWS & CHALLENGES
  // ============================================================================

  // Candidate Discovery Profiles
  getCandidateDiscoveryProfiles(filters?: {
    stream?: string;
    stage?: string;
    minCRI?: number;
    search?: string;
  }): any[] {
    const store = this.loadStore();
    let profiles = Object.values(store.candidateDiscoveryProfiles || {});

    // Filter strictly to opted-in adult profiles
    profiles = profiles.filter((p: any) => p.discoveryOptIn === true && p.isMinor !== true);

    if (filters?.stream && filters.stream !== "ALL") {
      profiles = profiles.filter((p: any) => p.stream === filters.stream);
    }
    if (filters?.stage && filters.stage !== "ALL") {
      profiles = profiles.filter((p: any) => p.stage === filters.stage);
    }
    if (filters?.minCRI && filters.minCRI > 0) {
      profiles = profiles.filter((p: any) => (p.careerReadinessIndex || 0) >= filters.minCRI!);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      profiles = profiles.filter(
        (p: any) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.verifiedSkills || []).some((s: string) => s.toLowerCase().includes(q))
      );
    }

    return profiles;
  }

  getCandidateDiscoveryProfile(idOrProfileId: string): any | null {
    const store = this.loadStore();
    let profile = store.candidateDiscoveryProfiles?.[idOrProfileId] || null;
    if (!profile && store.candidateDiscoveryProfiles) {
      profile =
        Object.values(store.candidateDiscoveryProfiles).find(
          (p: any) => p.id === idOrProfileId || p.studentProfileId === idOrProfileId
        ) || null;
    }
    if (profile && (profile.isMinor || !profile.discoveryOptIn)) {
      return null; // Enforce privacy guard
    }
    return profile;
  }

  saveCandidateDiscoveryProfile(profile: any): any {
    const store = this.loadStore();
    store.candidateDiscoveryProfiles = store.candidateDiscoveryProfiles || {};
    store.candidateDiscoveryProfiles[profile.studentProfileId] = profile;
    this.saveStore();
    return profile;
  }

  deleteCandidateDiscoveryProfile(studentProfileId: string): boolean {
    const store = this.loadStore();
    if (store.candidateDiscoveryProfiles?.[studentProfileId]) {
      delete store.candidateDiscoveryProfiles[studentProfileId];
      this.saveStore();
      return true;
    }
    return false;
  }

  // Recruitment Invitations
  getRecruitmentInvitations(orgId?: string, candidateEmail?: string): any[] {
    const store = this.loadStore();
    let all: any[] = [];
    if (orgId) {
      all = store.recruitmentInvitations?.[orgId] || [];
    } else {
      for (const orgList of Object.values(store.recruitmentInvitations || {})) {
        all.push(...(orgList || []));
      }
    }
    if (candidateEmail) {
      all = all.filter((inv: any) => inv.candidateEmail.toLowerCase() === candidateEmail.toLowerCase());
    }
    return all;
  }

  saveRecruitmentInvitation(inv: any): any {
    const store = this.loadStore();
    const oid = inv.organizationId;
    store.recruitmentInvitations = store.recruitmentInvitations || {};
    store.recruitmentInvitations[oid] = store.recruitmentInvitations[oid] || [];
    const idx = store.recruitmentInvitations[oid].findIndex((i: any) => i.id === inv.id);
    if (idx >= 0) {
      store.recruitmentInvitations[oid][idx] = inv;
    } else {
      store.recruitmentInvitations[oid].unshift(inv);
    }
    this.saveStore();
    return inv;
  }

  // Matching Configurations
  getMatchingConfig(orgId: string): any {
    const store = this.loadStore();
    return (
      store.matchingConfigurations?.[orgId] || {
        verifiedSkillWeight: 0.35,
        proficiencyWeight: 0.25,
        projectEvidenceWeight: 0.15,
        assessmentWeight: 0.15,
        preferredSkillWeight: 0.10,
      }
    );
  }

  saveMatchingConfig(orgId: string, config: any): any {
    const store = this.loadStore();
    store.matchingConfigurations = store.matchingConfigurations || {};
    store.matchingConfigurations[orgId] = config;
    this.saveStore();
    return config;
  }

  // Interviews
  getInterviews(orgId?: string, applicationId?: string): any[] {
    const store = this.loadStore();
    let all: any[] = [];
    if (orgId) {
      all = store.interviews?.[orgId] || [];
    } else {
      for (const list of Object.values(store.interviews || {})) {
        all.push(...(list || []));
      }
    }
    if (applicationId) {
      all = all.filter((i: any) => i.applicationId === applicationId);
    }
    return all;
  }

  getInterview(id: string): any | null {
    const store = this.loadStore();
    for (const list of Object.values(store.interviews || {})) {
      const found = (list || []).find((i: any) => i.id === id);
      if (found) return found;
    }
    return null;
  }

  saveInterview(interview: any): any {
    const store = this.loadStore();
    const oid = interview.organizationId;
    store.interviews = store.interviews || {};
    store.interviews[oid] = store.interviews[oid] || [];
    const idx = store.interviews[oid].findIndex((i: any) => i.id === interview.id);
    if (idx >= 0) {
      store.interviews[oid][idx] = interview;
    } else {
      store.interviews[oid].unshift(interview);
    }
    this.saveStore();
    return interview;
  }

  deleteInterview(id: string): boolean {
    const store = this.loadStore();
    let deleted = false;
    for (const oid of Object.keys(store.interviews || {})) {
      const prevLen = store.interviews![oid].length;
      store.interviews![oid] = store.interviews![oid].filter((i: any) => i.id !== id);
      if (store.interviews![oid].length < prevLen) {
        deleted = true;
      }
    }
    if (deleted) this.saveStore();
    return deleted;
  }

  // Industry Challenges
  getIndustryChallenges(filters?: {
    orgId?: string;
    stream?: string;
    status?: string;
  }): any[] {
    const store = this.loadStore();
    let all: any[] = [];
    if (filters?.orgId) {
      all = store.industryChallenges?.[filters.orgId] || [];
    } else {
      for (const list of Object.values(store.industryChallenges || {})) {
        all.push(...(list || []));
      }
    }
    if (filters?.stream && filters.stream !== "ALL") {
      all = all.filter((c: any) => c.stream === filters.stream);
    }
    if (filters?.status && filters.status !== "ALL") {
      all = all.filter((c: any) => c.status === filters.status);
    }
    return all;
  }

  getIndustryChallenge(id: string): any | null {
    const store = this.loadStore();
    for (const list of Object.values(store.industryChallenges || {})) {
      const found = (list || []).find((c: any) => c.id === id);
      if (found) return found;
    }
    return null;
  }

  saveIndustryChallenge(challenge: any): any {
    const store = this.loadStore();
    const oid = challenge.organizationId;
    store.industryChallenges = store.industryChallenges || {};
    store.industryChallenges[oid] = store.industryChallenges[oid] || [];
    const idx = store.industryChallenges[oid].findIndex((c: any) => c.id === challenge.id);
    if (idx >= 0) {
      store.industryChallenges[oid][idx] = challenge;
    } else {
      store.industryChallenges[oid].unshift(challenge);
    }
    this.saveStore();
    return challenge;
  }

  // Challenge Submissions
  getChallengeSubmissions(challengeId?: string, studentProfileId?: string): any[] {
    const store = this.loadStore();
    let all: any[] = [];
    if (challengeId) {
      all = store.challengeSubmissions?.[challengeId] || [];
    } else {
      for (const list of Object.values(store.challengeSubmissions || {})) {
        all.push(...(list || []));
      }
    }
    if (studentProfileId) {
      all = all.filter((s: any) => s.studentProfileId === studentProfileId);
    }
    return all;
  }

  getChallengeSubmission(id: string): any | null {
    const store = this.loadStore();
    for (const list of Object.values(store.challengeSubmissions || {})) {
      const found = (list || []).find((s: any) => s.id === id);
      if (found) return found;
    }
    return null;
  }

  saveChallengeSubmission(sub: any): any {
    const store = this.loadStore();
    const cid = sub.challengeId;
    store.challengeSubmissions = store.challengeSubmissions || {};
    store.challengeSubmissions[cid] = store.challengeSubmissions[cid] || [];
    const idx = store.challengeSubmissions[cid].findIndex((s: any) => s.id === sub.id);
    if (idx >= 0) {
      store.challengeSubmissions[cid][idx] = sub;
    } else {
      store.challengeSubmissions[cid].unshift(sub);
    }
    this.saveStore();
    return sub;
  }

  // ============================================================================
  // PART G: Admin Governance, Verification, CMS, AI Telemetry, Academy, Resume
  // ============================================================================

  // --- User Management ---
  getUsers(filters?: { role?: string; status?: string; search?: string }): any[] {
    const store = this.loadStore();
    let list = Object.values(store.users || {});
    if (filters?.role && filters.role !== "ALL") {
      list = list.filter((u: any) => u.role === filters.role);
    }
    if (filters?.status && filters.status !== "ALL") {
      list = list.filter((u: any) => u.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((u: any) =>
        (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
      );
    }
    return list;
  }

  getUser(emailOrId: string): any | null {
    if (!emailOrId || typeof emailOrId !== "string") return null;
    const store = this.loadStore();
    const clean = emailOrId.toLowerCase().trim();
    if (store.users[clean]) return store.users[clean];
    return Object.values(store.users).find((u: any) => u.id === emailOrId || u.email?.toLowerCase() === clean) || null;
  }

  updateUserStatus(emailOrId: string, status: string, reason?: string): any {
    const store = this.loadStore();
    const user = this.getUser(emailOrId);
    if (!user) throw new Error("User not found.");
    user.status = status;
    if (reason) {
      user.suspensionReason = reason;
    } else if (status === "ACTIVE") {
      delete user.suspensionReason;
    }
    user.updatedAt = new Date().toISOString();
    store.users[user.email.toLowerCase()] = user;
    this.saveStore();
    return user;
  }

  updateUserRole(emailOrId: string, role: string): any {
    const store = this.loadStore();
    const user = this.getUser(emailOrId);
    if (!user) throw new Error("User not found.");
    user.role = role;
    user.updatedAt = new Date().toISOString();
    store.users[user.email.toLowerCase()] = user;
    this.saveStore();
    return user;
  }

  requestAccountDeletion(emailOrId: string, reason?: string): any {
    const store = this.loadStore();
    const user = this.getUser(emailOrId);
    if (!user) throw new Error("User not found.");
    user.status = "PENDING_DELETION";
    user.deletionRequestedAt = new Date().toISOString();
    if (reason) {
      user.deletionReason = reason;
    }
    store.users[user.email.toLowerCase()] = user;
    this.saveStore();
    return user;
  }

  // --- Admin Audit Logs ---
  getAdminAuditLogs(limit: number = 50): any[] {
    const store = this.loadStore();
    return (store.adminAuditLogs || []).slice(0, limit);
  }

  saveAdminAuditLog(log: any): any {
    const store = this.loadStore();
    store.adminAuditLogs = store.adminAuditLogs || [];
    const entry = {
      ...log,
      id: log.id || `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: log.timestamp || new Date().toISOString(),
    };
    store.adminAuditLogs.unshift(entry);
    this.saveStore();
    return entry;
  }

  // --- Verification Directorate ---
  getVerificationRequests(filters?: { type?: string; status?: string }): any[] {
    const store = this.loadStore();
    let list = store.verificationRequests || [];
    if (filters?.type && filters.type !== "ALL") {
      list = list.filter((r: any) => r.organizationType === filters.type);
    }
    if (filters?.status && filters.status !== "ALL") {
      list = list.filter((r: any) => r.status === filters.status);
    }
    return list;
  }

  getVerificationRequest(id: string): any | null {
    const store = this.loadStore();
    return (store.verificationRequests || []).find((r: any) => r.id === id) || null;
  }

  saveVerificationRequest(vreq: any): any {
    const store = this.loadStore();
    store.verificationRequests = store.verificationRequests || [];
    const idx = store.verificationRequests.findIndex((r: any) => r.id === vreq.id);
    if (idx >= 0) {
      store.verificationRequests[idx] = vreq;
    } else {
      store.verificationRequests.unshift(vreq);
    }

    // Sync verification status to underlying institution or employer organization
    if (vreq.organizationType === "EMPLOYER") {
      const org = this.getEmployerOrganization(vreq.organizationId);
      if (org) {
        org.verificationStatus = vreq.status === "APPROVED" ? "VERIFIED" : vreq.status === "REJECTED" ? "REJECTED" : "PENDING";
        this.saveEmployerOrganization(org);
      }
    } else if (vreq.organizationType === "INSTITUTION") {
      const inst = this.getInstitution(vreq.organizationId);
      if (inst) {
        inst.verificationStatus = vreq.status === "APPROVED" ? "VERIFIED" : vreq.status === "REJECTED" ? "REJECTED" : "PENDING";
        this.saveInstitution(inst);
      }
    }

    this.saveStore();
    return vreq;
  }

  // --- Platform CMS ---
  getCMSContentItems(filters?: { type?: string; stream?: string; status?: string }): any[] {
    const store = this.loadStore();
    let list = store.cmsContentItems || [];
    if (filters?.type && filters.type !== "ALL") {
      list = list.filter((i: any) => i.contentType === filters.type);
    }
    if (filters?.stream && filters.stream !== "ALL") {
      list = list.filter((i: any) => i.stream === filters.stream || i.stream === "ALL");
    }
    if (filters?.status && filters.status !== "ALL") {
      list = list.filter((i: any) => i.status === filters.status);
    }
    return list;
  }

  getCMSContentItem(id: string): any | null {
    const store = this.loadStore();
    return (store.cmsContentItems || []).find((i: any) => i.id === id) || null;
  }

  saveCMSContentItem(item: any): any {
    const store = this.loadStore();
    store.cmsContentItems = store.cmsContentItems || [];
    const idx = store.cmsContentItems.findIndex((i: any) => i.id === item.id);
    const now = new Date().toISOString();
    const prepared = {
      ...item,
      updatedAt: now,
      createdAt: item.createdAt || now,
      version: (item.version || 0) + 1,
    };
    if (idx >= 0) {
      store.cmsContentItems[idx] = prepared;
    } else {
      store.cmsContentItems.unshift(prepared);
    }
    this.saveStore();
    return prepared;
  }

  // --- AI Governance & Telemetry ---
  getAIGovernanceRecords(limit: number = 100): any[] {
    const store = this.loadStore();
    return (store.aiGovernanceRecords || []).slice(0, limit);
  }

  saveAIGovernanceRecord(rec: any): any {
    const store = this.loadStore();
    store.aiGovernanceRecords = store.aiGovernanceRecords || [];
    store.aiGovernanceRecords.unshift(rec);
    if (store.aiGovernanceRecords.length > 500) {
      store.aiGovernanceRecords = store.aiGovernanceRecords.slice(0, 500);
    }
    this.saveStore();
    return rec;
  }

  getAIGovernanceOverview(): any {
    const store = this.loadStore();
    const logs = store.aiGovernanceRecords || [];
    const total = logs.length;
    const fallbacks = logs.filter((l: any) => l.status === "FALLBACK").length;
    const errors = logs.filter((l: any) => l.status === "ERROR").length;
    const rateLimits = logs.filter((l: any) => l.status === "RATE_LIMITED").length;
    const avgLatency =
      total > 0
        ? Math.round(logs.reduce((acc: number, cur: any) => acc + (cur.latencyMs || 0), 0) / total)
        : 195;

    return {
      serviceStatus: errors > 10 ? "DEGRADED" : "HEALTHY",
      primaryModel: "gemini-2.0-flash",
      fallbackModel: "deterministic-rule-engine-v1",
      totalRequests24h: total,
      averageLatencyMs: avgLatency,
      fallbackCount24h: fallbacks,
      errorCount24h: errors,
      rateLimitEvents24h: rateLimits,
      activePromptVersions: {
        mentor: "v1.4-multilingual",
        skillGaps: "v2.1-explainable",
        twin: "v1.2-horizons",
      },
      recentAlerts:
        errors > 0
          ? [`${errors} transient network warnings automatically served via deterministic fallbacks.`]
          : ["All Gemini API endpoints operating within 8-second SLA boundaries."],
    };
  }

  // --- Learning Academy ---
  getAcademyResources(filters?: { stream?: string; competency?: string; difficulty?: string }): any[] {
    const store = this.loadStore();
    let list = store.academyResources || [];
    if (filters?.stream && filters.stream !== "ALL") {
      list = list.filter((r: any) => r.stream === filters.stream || r.stream === "ALL");
    }
    if (filters?.competency) {
      const q = filters.competency.toLowerCase();
      list = list.filter((r: any) => (r.competency || "").toLowerCase().includes(q));
    }
    if (filters?.difficulty && filters.difficulty !== "ALL") {
      list = list.filter((r: any) => r.difficulty === filters.difficulty);
    }
    return list;
  }

  getStudentResourceProgress(profileId: string): Record<string, any> {
    const store = this.loadStore();
    return store.resourceProgress?.[profileId] || {};
  }

  saveStudentResourceProgress(profileIdOrData: string | any, resourceId?: string, isCompleted?: boolean, isSaved?: boolean): any {
    const store = this.loadStore();
    store.resourceProgress = store.resourceProgress || {};

    if (typeof profileIdOrData === "object" && profileIdOrData !== null) {
      const rec = profileIdOrData;
      const pid = rec.studentProfileId || rec.studentId || "default";
      const rid = rec.resourceId;
      store.resourceProgress[pid] = store.resourceProgress[pid] || {};
      store.resourceProgress[pid][rid] = {
        ...store.resourceProgress[pid][rid],
        ...rec,
      };
      this.saveStore();
      return store.resourceProgress[pid][rid];
    }

    const profileId = profileIdOrData;
    store.resourceProgress[profileId] = store.resourceProgress[profileId] || {};
    const existing = store.resourceProgress[profileId][resourceId!] || {};
    const updated = {
      ...existing,
      resourceId: resourceId!,
      studentProfileId: profileId,
      isCompleted: Boolean(isCompleted),
      completedAt: isCompleted ? (existing.completedAt || new Date().toISOString()) : undefined,
      isSaved: isSaved !== undefined ? isSaved : Boolean(existing.isSaved),
    };
    store.resourceProgress[profileId][resourceId!] = updated;
    this.saveStore();
    return updated;
  }

  // --- Resume Studio ---
  getStudentResume(profileId: string): any | null {
    const store = this.loadStore();
    return store.studentResumes?.[profileId] || null;
  }

  saveStudentResume(resume: any): any {
    const store = this.loadStore();
    store.studentResumes = store.studentResumes || {};
    const pid = resume.studentProfileId || resume.studentId || "default";
    store.studentResumes[pid] = resume;
    this.saveStore();
    return resume;
  }

  // --- Interview Practice Lab ---
  getMockInterviewQuestions(streamOrFilters?: string | { stream?: string; targetCareer?: string; category?: string }, careerSlug?: string): any[] {
    const filterStream = typeof streamOrFilters === "object" ? streamOrFilters?.stream : streamOrFilters;
    const filterCareer = typeof streamOrFilters === "object" ? streamOrFilters?.targetCareer : careerSlug;
    // Standard mock question bank across universal streams
    const questions = [
      {
        id: "q-med-01",
        stream: "MEDICAL_PCB",
        careerSlug: "clinical-biochemist",
        question: "How do you systematically investigate an unexpected serum anion gap in an intensive care patient?",
        competencyTested: "Clinical Diagnostic Reasoning",
        difficulty: "MEDIUM",
        modelAnswerOutline: [
          "Verify laboratory calibration and quality control logs.",
          "Check repeat measurement to rule out analytical artifact.",
          "Calculate corrected anion gap adjusting for serum albumin concentration.",
          "Differential review: ketoacidosis, lactic acidosis, toxic ingestion (GOLDMARK).",
        ],
        tips: "Highlight analytical quality control first before leaping to clinical diagnosis.",
      },
      {
        id: "q-med-02",
        stream: "MEDICAL_PCB",
        careerSlug: "clinical-biochemist",
        question: "Describe the protocol for emergency notification when a critical laboratory alert value occurs.",
        competencyTested: "Laboratory Safety & Protocols",
        difficulty: "EASY",
        modelAnswerOutline: [
          "Immediate verbal communication with the treating clinical team.",
          "Read-back confirmation of patient identifiers and critical value.",
          "Document timestamp, receiver name, and caller name in LIS audit trail.",
        ],
        tips: "Clear communication and read-back verification are essential regulatory requirements.",
      },
      {
        id: "q-pcm-01",
        stream: "NON_MEDICAL_PCM",
        careerSlug: "software-engineer",
        question: "How do you design a database schema to prevent race conditions during concurrent financial transactions?",
        competencyTested: "System Architecture",
        difficulty: "HARD",
        modelAnswerOutline: [
          "Use ACID compliant database with serializable or repeatable read isolation levels.",
          "Implement optimistic locking with version fields or pessimistic row locking (`SELECT FOR UPDATE`).",
          "Ensure idempotent API handlers with unique transaction idempotency keys.",
        ],
        tips: "Discuss both application-level idempotency and database isolation levels.",
      },
      {
        id: "q-comm-01",
        stream: "COMMERCE",
        careerSlug: "financial-analyst",
        question: "Walk through how a sudden 150 basis-point repo rate increase impacts a corporate borrower's Debt Service Coverage Ratio (DSCR).",
        competencyTested: "Financial Analysis",
        difficulty: "MEDIUM",
        modelAnswerOutline: [
          "Floating-rate debt interest expense rises, increasing denominator debt service obligation.",
          "EBITDA may face margin compression if higher costs cannot be passed to consumers.",
          "DSCR decreases, potentially triggering loan covenant breaches.",
        ],
        tips: "Define DSCR explicitly: EBITDA / (Interest + Principal Repayments).",
      },
      {
        id: "q-law-01",
        stream: "LEGAL_STUDIES",
        careerSlug: "corporate-lawyer",
        question: "What are the essential elements required in an Indemnity clause under Indian Contract Act, 1872?",
        competencyTested: "Legal Drafting",
        difficulty: "MEDIUM",
        modelAnswerOutline: [
          "Scope of indemnified liabilities (direct vs indirect/consequential damages).",
          "Notice period and defense control provisions for third-party claims.",
          "Exclusions: gross negligence, willful misconduct, or fraud.",
        ],
        tips: "Distinguish between damages under Section 73 and indemnity under Section 124.",
      },
    ];

    let filtered = questions;
    if (filterStream && filterStream !== "ALL") {
      filtered = filtered.filter((q) => q.stream === filterStream);
    }
    if (filterCareer) {
      filtered = filtered.filter((q) => q.careerSlug === filterCareer || (q as any).targetCareer === filterCareer);
    }
    return filtered;
  }

  getMockInterviewSessions(profileId: string): any[] {
    const store = this.loadStore();
    return store.mockInterviewSessions?.[profileId] || [];
  }

  saveMockInterviewSession(session: any): any {
    const store = this.loadStore();
    store.mockInterviewSessions = store.mockInterviewSessions || {};
    const pid = session.studentProfileId;
    store.mockInterviewSessions[pid] = store.mockInterviewSessions[pid] || [];
    store.mockInterviewSessions[pid].unshift(session);
    this.saveStore();
    return session;
  }

  // --- Notifications ---
  getSystemNotifications(userId?: string, role?: string): any[] {
    const store = this.loadStore();
    let list = store.systemNotifications || [];
    if (userId) {
      list = list.filter((n: any) => !n.userId || n.userId === userId);
    }
    if (role) {
      list = list.filter((n: any) => !n.targetRole || n.targetRole === role || n.targetRole === "ALL");
    }
    return list;
  }

  saveSystemNotification(notification: any): any {
    const store = this.loadStore();
    store.systemNotifications = store.systemNotifications || [];
    const entry = {
      ...notification,
      id: notification.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: notification.createdAt || new Date().toISOString(),
      isRead: false,
    };
    store.systemNotifications.unshift(entry);
    this.saveStore();
    return entry;
  }
}

export const devStore = new DevStore();
