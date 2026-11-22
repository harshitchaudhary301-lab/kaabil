// ==============================================================================
// KAABIL (काबिल) — Personalized Learning Plan & Projects Hub Types
// Multi-stream learning roadmaps, daily micro-tasks, and practical project deliverables
// ==============================================================================

import { EducationalStream, EducationStage } from "@/types";

export type ProjectDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "PAUSED" | "SUBMITTED" | "EVALUATED";

export type LearningTaskType =
  | "READING"
  | "VIDEO"
  | "HANDS_ON_PRACTICE"
  | "DIAGNOSTIC_QUIZ"
  | "CASE_STUDY"
  | "PROJECT_MILESTONE";

export interface LearningTask {
  id: string;
  dayNumber: number; // 1 to 7 (for weekly sprint)
  dayLabel: string; // e.g. "Monday", "Day 1"
  title: string;
  titleHi?: string;
  titleHinglish?: string;
  skillTarget: string;
  estimatedMinutes: number;
  type: LearningTaskType;
  resourceTitle: string;
  resourceUrl: string;
  isFreeResource: boolean;
  resourceProvider: string; // e.g. "NPTEL", "Swayam", "MIT OCW", "ICAI BoS", "ICAR"
  completionCriteria: string;
  completionCriteriaHi?: string;
  completionCriteriaHinglish?: string;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface WeeklySprintMilestone {
  weekNumber: number;
  title: string;
  titleHi?: string;
  titleHinglish?: string;
  focusSkill: string;
  objective: string;
  estimatedHours: number;
  tasks: LearningTask[];
  isCompleted: boolean;
  progressPercent: number;
}

export interface CuratedLearningResource {
  id: string;
  title: string;
  provider: string; // e.g. "NPTEL / IIT Madras", "Swayam", "MIT OpenCourseWare", "ICAI BoS Knowledge Portal"
  url: string;
  isFree: boolean;
  estimatedHours: number;
  stream: EducationalStream;
  careerSlug?: string;
  targetSkillName: string;
  format: "VIDEO_SERIES" | "INTERACTIVE_COURSE" | "OFFICIAL_CURRICULUM" | "DOCUMENTATION";
  description: string;
  accreditedBy?: string;
}

export interface ProjectMilestone {
  id: string;
  stepNumber: number;
  title: string;
  titleHi?: string;
  titleHinglish?: string;
  description: string;
  deliverableHint: string;
  isCompleted?: boolean;
}

export interface CareerProject {
  id: string;
  slug: string;
  title: string;
  titleHi?: string;
  titleHinglish?: string;
  stream: EducationalStream;
  streamTitle: string;
  careerSlug: string;
  careerTitle: string;
  difficulty: ProjectDifficulty;
  estimatedHours: number;
  objective: string;
  objectiveHi?: string;
  objectiveHinglish?: string;
  requiredSkills: string[];
  recommendedTools: string[];
  materialsOrResources: { name: string; url: string; note: string }[];
  milestones: ProjectMilestone[];
  submissionTypes: ("GITHUB_REPO" | "LIVE_URL" | "DOCUMENT_PDF" | "DESIGN_PROTOTYPE" | "CASE_STUDY_WRITEUP")[];
  completionCriteria: string[];
  realWorldContext: string;
}

export interface StudentProjectEnrollment {
  id: string;
  projectId: string;
  studentProfileId: string;
  status: ProjectStatus;
  startedAt: string;
  lastUpdatedAt: string;
  completedMilestoneIds: string[];
  submissionUrl?: string | null;
  submissionNotes?: string | null;
  submittedAt?: string | null;
  selfAssessedReflection?: string | null;
}

export interface LearningPlanPreferences {
  weeklyTimeCommitmentHours: 5 | 10 | 15 | 20;
  budgetPreference: "FREE_ONLY" | "AFFORDABLE_PAID" | "ANY";
  learningPace: "STEADY" | "ACCELERATED" | "WEEKEND_FOCUS";
}

export interface PersonalizedLearningPlanData {
  studentProfileId: string;
  careerSlug: string;
  careerTitle: string;
  careerStream: EducationalStream;
  streamTitle: string;
  educationStage: EducationStage;
  preferences: LearningPlanPreferences;

  // Real Metrics
  totalTasks: number;
  completedTasks: number;
  overallPlanProgressPercent: number;
  currentStreakDays: number;

  // "What Should I Do Today?"
  todaysTask: LearningTask | null;

  // 4-Week Modular Sprints
  weeklySprints: WeeklySprintMilestone[];

  // Recommended Resources
  recommendedResources: CuratedLearningResource[];

  // Relevant Projects
  enrolledProjects: {
    project: CareerProject;
    enrollment: StudentProjectEnrollment;
  }[];
  suggestedProjects: CareerProject[];
}
