// ==============================================================================
// KAABIL (काबिल) — Dynamic Career Skill Tree & Mastery Types
// Multi-stream competency nodes, prerequisite graphs, and authentic evidence
// ==============================================================================

export type SkillTreeNodeStage = "FOUNDATION" | "INTERMEDIATE" | "ADVANCED";

export type SkillMasteryStatus =
  | "MASTERED" // Assessed & verified >= 80% or externally credentialed
  | "VERIFIED" // Assessed & verified 60-79%
  | "IN_PROGRESS" // Attempted diagnostic / enrolled in roadmap activity
  | "SELF_REPORTED" // Claimed by student in profile, unverified
  | "READY_TO_LEARN" // All prerequisites met, ready to acquire
  | "LOCKED"; // Missing one or more prerequisite nodes

export type SkillProvenance =
  | "PLATFORM_ASSESSED"
  | "EXTERNALLY_VERIFIED"
  | "SELF_REPORTED"
  | "NONE";

export interface SkillTreeNode {
  id: string; // e.g. "node-python", "node-anatomy"
  name: string; // e.g. "Human Anatomy & Physiology"
  nameHi?: string;
  nameHinglish?: string;
  stage: SkillTreeNodeStage;
  stageOrder: number; // Order within stage (1, 2, 3...)
  category: "Domain" | "Technical" | "Analytical" | "Interpersonal" | "Foundational";
  description: string;
  descriptionHi?: string;
  descriptionHinglish?: string;
  importanceWeight: number; // 1.0 to 3.0
  prerequisiteIds: string[]; // IDs of prerequisite nodes

  // Real Student Evidence & Mastery Status
  status: SkillMasteryStatus;
  provenance: SkillProvenance;
  scorePercentage: number | null; // e.g. 88, or null if unassessed
  proficiencyLevel: "NOVICE" | "BEGINNER" | "INTERMEDIATE" | "PROFICIENT" | "EXPERT" | null;
  verifiedAt: string | null;
  verifier: string | null;
  assessmentSlug?: string;
  assessmentTitle?: string;
  isMandatory: boolean;
  estimatedHours: number;
}

export interface SkillTreeEdge {
  id: string;
  from: string; // prerequisite node id
  to: string; // dependent node id
  isActive: boolean; // true if prerequisite is mastered/verified
}

export interface CareerSkillTreeStage {
  stage: SkillTreeNodeStage;
  title: string;
  titleHi: string;
  titleHinglish: string;
  description: string;
  nodes: SkillTreeNode[];
  totalNodes: number;
  completedNodes: number;
  masteryPercent: number;
}

export interface CareerSkillTreeData {
  careerSlug: string;
  careerTitle: string;
  careerStream: string;
  streamTitle: string;
  regulatoryBody?: string;
  educationStage: string;

  // Real Metrics (Zero Fabrication)
  overallMasteryPercent: number; // 0-100 weighted by verified skills
  verifiedSkillsCount: number;
  selfReportedSkillsCount: number;
  inProgressSkillsCount: number;
  missingSkillsCount: number;
  totalSkillsCount: number;

  suggestedNextSkill: SkillTreeNode | null;
  stages: CareerSkillTreeStage[];
  edges: SkillTreeEdge[];
  nodes: SkillTreeNode[];
}

export interface CareerSkillSummary {
  slug: string;
  title: string;
  stream: string;
  streamTitle: string;
  nodeCount: number;
}
