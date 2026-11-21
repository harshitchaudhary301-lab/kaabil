// ==============================================================================
// KAABIL (काबिल) — Institution Management Service
// Multi-tenant institution registration, verification, and dashboard analytics.
// Universal support across all 13 educational streams and institution types.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import { db, checkDatabaseConnection } from "@/lib/db";
import {
  InstitutionRecord,
  InstitutionType,
  InstitutionVerificationStatus,
  InstitutionDashboardStats,
} from "@/types/institution";
import { EducationalStream } from "@/types";

export class InstitutionService {
  /**
   * Resolves the current active institution for a user or returns the default demo institution.
   */
  public static async getActiveInstitution(
    institutionIdOrSlug?: string
  ): Promise<InstitutionRecord | null> {
    if (institutionIdOrSlug) {
      const byId = devStore.getInstitution(institutionIdOrSlug);
      if (byId) return byId;
      const bySlug = devStore.getInstitutionBySlug(institutionIdOrSlug);
      if (bySlug) return bySlug;
    }

    // Default demo institution for preview
    return devStore.getInstitution("inst-demo-tech");
  }

  /**
   * Registers a new institution with DRAFT or SUBMITTED status.
   */
  public static async registerInstitution(params: {
    name: string;
    orgType: InstitutionType;
    officialEmail: string;
    officialWebsite?: string;
    registrationNumber?: string;
    accreditationBody?: string;
    city: string;
    state: string;
    country?: string;
    supportedStreams: EducationalStream[];
    authorizedPersonName: string;
    authorizedPersonDesignation: string;
  }): Promise<InstitutionRecord> {
    const slug = params.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Generate unique 8-character invitation code
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const prefix = params.name.substring(0, 3).toUpperCase();
    const invitationCode = `${prefix}-${randomHex}`;

    const id = `inst-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const record: InstitutionRecord = {
      id,
      name: params.name,
      slug: `${slug}-${randomHex.toLowerCase()}`,
      orgType: params.orgType,
      verificationStatus: "SUBMITTED",
      officialEmail: params.officialEmail,
      officialWebsite: params.officialWebsite,
      registrationNumber: params.registrationNumber,
      accreditationBody: params.accreditationBody,
      city: params.city,
      state: params.state,
      country: params.country || "India",
      supportedStreams: params.supportedStreams || ["NON_MEDICAL_PCM"],
      authorizedPersonName: params.authorizedPersonName,
      authorizedPersonDesignation: params.authorizedPersonDesignation,
      isVerified: false,
      invitationCode,
      createdAt: now,
      updatedAt: now,
    };

    devStore.saveInstitution(record);
    return record;
  }

  /**
   * Updates an institution's verification status (Administrative action).
   */
  public static async updateVerificationStatus(
    institutionId: string,
    status: InstitutionVerificationStatus
  ): Promise<InstitutionRecord | null> {
    const inst = devStore.getInstitution(institutionId);
    if (!inst) return null;

    inst.verificationStatus = status;
    inst.isVerified = status === "VERIFIED";
    if (status === "VERIFIED" && !inst.verifiedAt) {
      inst.verifiedAt = new Date().toISOString();
    }

    return devStore.saveInstitution(inst);
  }

  /**
   * Aggregates real database/store metrics for the Institution Intelligence Console.
   */
  public static async getDashboardStats(
    institutionId: string,
    filters?: {
      departmentId?: string;
      stream?: string;
    }
  ): Promise<InstitutionDashboardStats | null> {
    const institution: InstitutionRecord | null = devStore.getInstitution(institutionId);
    if (!institution) return null;

    let students = devStore.getStudentEnrollments(institutionId);
    const faculty = devStore.getFacultyMembers(institutionId);
    const departments = devStore.getDepartments(institutionId);
    const programs = devStore.getPrograms(institutionId);
    const batches = devStore.getClassesBatches(institutionId);

    // Apply optional department/stream filters
    if (filters?.departmentId && filters.departmentId !== "ALL") {
      students = students.filter((s) => s.departmentId === filters.departmentId);
    }
    if (filters?.stream && filters.stream !== "ALL") {
      students = students.filter((s) => s.stream === filters.stream);
    }

    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === "ACTIVE").length;

    // Stream distribution
    const streamCounts: Record<string, number> = {};
    for (const s of students) {
      streamCounts[s.stream] = (streamCounts[s.stream] || 0) + 1;
    }
    const streamDistribution = Object.entries(streamCounts).map(([stream, count]) => ({
      stream,
      streamTitle: stream.replace(/_/g, " "),
      studentCount: count,
    }));

    // Stage distribution
    const stageCounts: Record<string, number> = {};
    for (const s of students) {
      stageCounts[s.stage] = (stageCounts[s.stage] || 0) + 1;
    }
    const stageDistribution = Object.entries(stageCounts).map(([stage, count]) => ({
      stage: stage.replace(/_/g, " "),
      studentCount: count,
    }));

    // Readiness Index distribution & average
    let sumCRI = 0;
    let assessedCount = 0;
    let unassessed = 0;
    let developing = 0;
    let competent = 0;
    let advanced = 0;

    for (const s of students) {
      if (s.readinessIndex === null || s.readinessIndex === undefined) {
        unassessed++;
      } else {
        assessedCount++;
        sumCRI += s.readinessIndex;
        if (s.readinessIndex >= 75) advanced++;
        else if (s.readinessIndex >= 50) competent++;
        else developing++;
      }
    }

    const avgReadinessIndex =
      assessedCount > 0 ? Math.round(sumCRI / assessedCount) : 0;

    const onboardingCompletedCount = students.filter(
      (s) => s.onboardingCompleted
    ).length;
    const onboardingCompletionPercentage =
      totalStudents > 0
        ? Math.round((onboardingCompletedCount / totalStudents) * 100)
        : 0;

    const assessmentParticipantsCount = students.filter(
      (s) => s.assessmentsCompletedCount > 0
    ).length;
    const assessmentParticipationPercentage =
      totalStudents > 0
        ? Math.round((assessmentParticipantsCount / totalStudents) * 100)
        : 0;

    // Recent activity logs
    const recentActivities = [
      ...students.slice(0, 3).map((s) => ({
        id: `act-enr-${s.id}`,
        type: "STUDENT_ENROLLED" as const,
        title: `Student Enrolled: ${s.studentName} in ${s.programName || "Program"}`,
        timestamp: s.enrolledAt,
      })),
      ...faculty.slice(0, 2).map((f) => ({
        id: `act-fac-${f.id}`,
        type: "STAFF_INVITED" as const,
        title: `Faculty Member: ${f.name} (${f.designation})`,
        timestamp: f.createdAt,
      })),
      ...batches.slice(0, 2).map((b) => ({
        id: `act-batch-${b.id}`,
        type: "BATCH_CREATED" as const,
        title: `Academic Cohort: ${b.name}`,
        timestamp: b.createdAt,
      })),
    ].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      institution,
      metrics: {
        totalStudents,
        activeStudents,
        totalFaculty: faculty.length,
        totalDepartments: departments.length,
        totalPrograms: programs.length,
        totalBatches: batches.length,
        avgReadinessIndex,
        onboardingCompletionPercentage,
        assessmentParticipationPercentage,
      },
      streamDistribution,
      stageDistribution,
      readinessDistribution: {
        unassessed,
        developing,
        competent,
        advanced,
      },
      recentActivities,
    };
  }
}
