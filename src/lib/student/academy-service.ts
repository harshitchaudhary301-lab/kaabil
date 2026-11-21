// ==============================================================================
// KAABIL (काबिल) — Learning Academy Service
// Multi-stream curated educational repository and student progress tracker.
// ==============================================================================

import { devStore } from "@/lib/dev-store";
import { AcademyResourceItem, StudentResourceProgress } from "@/types/admin";
import { EducationalStream } from "@/types";

export class AcademyService {
  /**
   * Retrieves resources matching stream, difficulty, format, or search term.
   */
  public static getResources(filters?: {
    stream?: string;
    difficulty?: string;
    format?: string;
    search?: string;
  }): AcademyResourceItem[] {
    return devStore.getAcademyResources(filters);
  }

  /**
   * Retrieves or initializes progress for a student across all resources.
   */
  public static getStudentProgress(studentId: string): StudentResourceProgress[] {
    const rawMap = devStore.getStudentResourceProgress(studentId);
    return Object.values(rawMap || {});
  }

  /**
   * Updates student progress for a specific resource (e.g., mark completed, update minutes, save notes).
   */
  public static updateProgress(params: {
    studentId: string;
    resourceId: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    progressPct: number;
    notes?: string;
    rating?: number;
  }): StudentResourceProgress {
    const progressList = this.getStudentProgress(params.studentId);
    const existing = progressList.find((p) => p.resourceId === params.resourceId);

    const now = new Date().toISOString();
    const progressRecord: StudentResourceProgress = {
      id: existing?.id || `prog-${params.studentId}-${params.resourceId}`,
      studentId: params.studentId,
      studentProfileId: params.studentId,
      resourceId: params.resourceId,
      status: params.status,
      isCompleted: params.status === "COMPLETED",
      progressPct: Math.min(100, Math.max(0, params.progressPct)),
      notes: params.notes ?? existing?.notes,
      rating: params.rating ?? existing?.rating,
      startedAt: existing?.startedAt || now,
      completedAt: params.status === "COMPLETED" ? now : existing?.completedAt,
      lastAccessedAt: now,
    };

    devStore.saveStudentResourceProgress(progressRecord);
    return progressRecord;
  }
}
