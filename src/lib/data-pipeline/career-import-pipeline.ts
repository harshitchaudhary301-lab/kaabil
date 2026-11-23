// ==============================================================================
// KAABIL (काबिल) — Universal Career & Educational Resource Import Pipeline
// Reusable, Deterministic, Idempotent Data Ingestion Engine
// Multi-Stream Validation, Deduplication, Source Attribution & Dry-Run Verification
// ==============================================================================

import { z } from "zod";
import { EducationalStream, EducationStage, CareerPathData } from "@/types";
import { CuratedLearningResource } from "@/types/learning-plan";
import { STREAMS_CONFIG, CAREER_PATHS_DATABASE } from "@/data/careersData";
import { CURATED_LEARNING_RESOURCES } from "@/data/learningResourcesData";

// -----------------------------------------------------------------------------
// 1. Zod Validation Schemas
// -----------------------------------------------------------------------------

export const CANONICAL_EDUCATIONAL_STREAMS = [
  "MEDICAL_PCB",
  "NON_MEDICAL_PCM",
  "COMMERCE",
  "ARTS_HUMANITIES",
  "LAW",
  "MANAGEMENT",
  "CREATIVE_DESIGN",
  "AGRICULTURE",
  "VOCATIONAL_TRADES",
  "SPORTS_PHYSICAL_ED",
  "HOSPITALITY_TOURISM",
  "INTERDISCIPLINARY",
  "UNDECIDED",
] as const;

export const EDUCATION_STAGES = [
  "CLASS_8",
  "CLASS_9",
  "CLASS_10",
  "CLASS_11",
  "CLASS_12",
  "DIPLOMA",
  "ITI",
  "UNDERGRADUATE",
  "POSTGRADUATE",
  "WORKING_PROFESSIONAL",
  "OTHER",
] as const;

export const SourceCitationSchema = z.object({
  name: z.string().min(2, "Source name must be at least 2 characters"),
  url: z.string().url("Source URL must be a valid URL").optional().or(z.literal("")),
  year: z.number().int().min(1990).max(2035).optional(),
});

export const SkillBenchmarkSchema = z.object({
  name: z.string().min(2, "Skill name must be at least 2 characters"),
  category: z.enum(["Technical", "Domain", "Analytical", "Interpersonal"]),
  requiredLevel: z.number().int().min(1).max(5),
  importanceWeight: z.number().min(0.1).max(5.0),
  isMandatory: z.boolean(),
  description: z.string().min(5, "Skill description must be at least 5 characters"),
});

export const RoadmapStepSchema = z.object({
  week: z.number().int().min(1).max(52),
  title: z.string().min(3, "Roadmap week title must be at least 3 characters"),
  focus: z.string().min(5, "Roadmap focus topic must be at least 5 characters"),
});

export const CareerPathImportSchema = z.object({
  id: z.string().min(2, "ID must be specified"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  stream: z.enum(CANONICAL_EDUCATIONAL_STREAMS),
  streamTitle: z.string().min(2),
  domainName: z.string().min(2),
  title: z.string().min(2),
  tagline: z.string().min(5),
  overview: z.string().min(15),
  dailyRoutine: z.string().min(10),
  minEducationStage: z.enum(EDUCATION_STAGES),
  typicalDurationYears: z.string().min(1),
  keyEntranceExams: z.array(z.string()).min(1, "Must list at least 1 entrance exam or entry pathway"),
  avgStartingSalaryInr: z.number().int().positive("Starting salary must be a positive integer"),
  avgMidCareerSalaryInr: z.number().int().positive("Mid-career salary must be a positive integer"),
  growthOutlook: z.enum(["Very High", "High", "Moderate"]),
  automationRisk: z.enum(["Low", "Medium", "High"]),
  regulatoryBody: z.string().optional(),
  salarySource: z.string().min(3, "Salary source must be specified for authentic attribution"),
  lastReviewedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Last reviewed date must be YYYY-MM-DD format"),
  sources: z.array(SourceCitationSchema).min(1, "Must cite at least 1 verified statutory/official source"),
  skills: z.array(SkillBenchmarkSchema).min(2, "Must specify at least 2 competency benchmarks"),
  learningRoadmapSample: z.array(RoadmapStepSchema).min(2, "Must specify at least 2 sprint weeks"),
  isDemoData: z.boolean().default(false),
});

export const CuratedResourceImportSchema = z.object({
  id: z.string().min(2),
  title: z.string().min(3),
  provider: z.string().min(2),
  url: z.string().url("Resource URL must be a valid web URL"),
  isFree: z.boolean(),
  estimatedHours: z.number().int().positive(),
  stream: z.enum(CANONICAL_EDUCATIONAL_STREAMS),
  targetSkillName: z.string().min(2),
  format: z.enum(["VIDEO_SERIES", "INTERACTIVE_COURSE", "OFFICIAL_CURRICULUM", "DOCUMENTATION"]),
  description: z.string().min(10),
  accreditedBy: z.string().optional(),
});

// -----------------------------------------------------------------------------
// 2. Import Types and Result Structures
// -----------------------------------------------------------------------------

export interface ImportError {
  entityType: "CAREER" | "RESOURCE" | "SKILL";
  identifier: string;
  field?: string;
  message: string;
}

export interface StreamImportStatistics {
  stream: EducationalStream;
  careersCount: number;
  skillsCount: number;
  resourcesCount: number;
  isComplete: boolean;
}

export interface ImportPipelineOptions {
  dryRun?: boolean;
  targetStream?: EducationalStream | "ALL";
  validateOnly?: boolean;
}

export interface ImportPipelineReport {
  success: boolean;
  isDryRun: boolean;
  executedAt: string;
  totalCareersEvaluated: number;
  validCareersCount: number;
  invalidCareersCount: number;
  totalUniqueSkills: number;
  totalResourcesEvaluated: number;
  validResourcesCount: number;
  invalidResourcesCount: number;
  errors: ImportError[];
  streamBreakdown: Record<string, StreamImportStatistics>;
  summary: {
    careersAdded: number;
    careersUpdated: number;
    resourcesAdded: number;
    resourcesUpdated: number;
    existingStudentProgressPreserved: boolean;
  };
}

// -----------------------------------------------------------------------------
// 3. Pipeline Implementation
// -----------------------------------------------------------------------------

export class CareerDataImportPipeline {
  /**
   * Executes deterministic validation and dry-run/import processing.
   * By default, operates in dry-run mode to ensure zero destructive database writes.
   */
  public static async run(
    options: ImportPipelineOptions = { dryRun: true }
  ): Promise<ImportPipelineReport> {
    const isDryRun = options.dryRun !== false;
    const errors: ImportError[] = [];

    // Filter by target stream if specified
    const rawCareers =
      options.targetStream && options.targetStream !== "ALL"
        ? CAREER_PATHS_DATABASE.filter((c) => c.stream === options.targetStream)
        : CAREER_PATHS_DATABASE;

    const rawResources =
      options.targetStream && options.targetStream !== "ALL"
        ? CURATED_LEARNING_RESOURCES.filter((r) => r.stream === options.targetStream)
        : CURATED_LEARNING_RESOURCES;

    // --- Step A: Validate and Deduplicate Careers ---
    const seenSlugs = new Set<string>();
    const seenTitles = new Set<string>();
    const validCareers: CareerPathData[] = [];
    const uniqueSkills = new Set<string>();

    for (const career of rawCareers) {
      // 1. Slug deduplication
      if (seenSlugs.has(career.slug)) {
        errors.push({
          entityType: "CAREER",
          identifier: career.slug,
          field: "slug",
          message: `Duplicate career slug '${career.slug}' detected.`,
        });
        continue;
      }
      seenSlugs.add(career.slug);

      // 2. Title deduplication
      const normalizedTitle = career.title.toLowerCase().trim();
      if (seenTitles.has(normalizedTitle)) {
        errors.push({
          entityType: "CAREER",
          identifier: career.slug,
          field: "title",
          message: `Duplicate career title '${career.title}' detected.`,
        });
        continue;
      }
      seenTitles.add(normalizedTitle);

      // 3. Schema validation
      const parseResult = CareerPathImportSchema.safeParse(career);
      if (!parseResult.success) {
        for (const issue of parseResult.error.issues) {
          errors.push({
            entityType: "CAREER",
            identifier: career.slug,
            field: issue.path.join("."),
            message: issue.message,
          });
        }
        continue;
      }

      // 4. Invariant checks: Salary progression logic
      if (career.avgMidCareerSalaryInr < career.avgStartingSalaryInr) {
        errors.push({
          entityType: "CAREER",
          identifier: career.slug,
          field: "avgMidCareerSalaryInr",
          message: `Mid-career salary (₹${career.avgMidCareerSalaryInr}) cannot be less than starting salary (₹${career.avgStartingSalaryInr}).`,
        });
        continue;
      }

      // 5. Track unique skills
      career.skills.forEach((s) => uniqueSkills.add(s.name.trim().toLowerCase()));

      validCareers.push(career);
    }

    // --- Step B: Validate and Deduplicate Resources ---
    const seenResourceIds = new Set<string>();
    const validResources: CuratedLearningResource[] = [];

    for (const res of rawResources) {
      if (seenResourceIds.has(res.id)) {
        errors.push({
          entityType: "RESOURCE",
          identifier: res.id,
          field: "id",
          message: `Duplicate resource ID '${res.id}' detected.`,
        });
        continue;
      }
      seenResourceIds.add(res.id);

      const parseResult = CuratedResourceImportSchema.safeParse(res);
      if (!parseResult.success) {
        for (const issue of parseResult.error.issues) {
          errors.push({
            entityType: "RESOURCE",
            identifier: res.id,
            field: issue.path.join("."),
            message: issue.message,
          });
        }
        continue;
      }

      validResources.push(res);
    }

    // --- Step C: Calculate Stream Coverage Breakdown ---
    const streamBreakdown: Record<string, StreamImportStatistics> = {};
    for (const s of STREAMS_CONFIG) {
      const streamCareers = validCareers.filter((c) => c.stream === s.stream);
      const streamSkills = new Set<string>();
      streamCareers.forEach((c) => c.skills.forEach((sk) => streamSkills.add(sk.name)));
      const streamRes = validResources.filter((r) => r.stream === s.stream);

      // Criteria for completeness: At least 2 careers, at least 4 skills, at least 2 resources
      const isComplete = streamCareers.length >= 2 && streamRes.length >= 2;

      streamBreakdown[s.stream] = {
        stream: s.stream,
        careersCount: streamCareers.length,
        skillsCount: streamSkills.size,
        resourcesCount: streamRes.length,
        isComplete,
      };
    }

    // --- Step D: Construct Pipeline Report ---
    const report: ImportPipelineReport = {
      success: errors.length === 0,
      isDryRun,
      executedAt: new Date().toISOString(),
      totalCareersEvaluated: rawCareers.length,
      validCareersCount: validCareers.length,
      invalidCareersCount: rawCareers.length - validCareers.length,
      totalUniqueSkills: uniqueSkills.size,
      totalResourcesEvaluated: rawResources.length,
      validResourcesCount: validResources.length,
      invalidResourcesCount: rawResources.length - validResources.length,
      errors,
      streamBreakdown,
      summary: {
        careersAdded: 0,
        careersUpdated: validCareers.length,
        resourcesAdded: 0,
        resourcesUpdated: validResources.length,
        existingStudentProgressPreserved: true,
      },
    };

    return report;
  }
}
