// ==============================================================================
// KAABIL (काबिल) — Academic Administration Service
// Multi-tenant Departments, Programs, Academic Sessions, and Classes/Batches.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import {
  DepartmentRecord,
  ProgramRecord,
  AcademicSessionRecord,
  ClassBatchRecord,
} from "@/types/institution";
import { EducationalStream, EducationStage } from "@/types";

export class AcademicService {
  // --------------------------------------------------------------------------
  // Departments
  // --------------------------------------------------------------------------
  public static getDepartments(institutionId: string): DepartmentRecord[] {
    return devStore.getDepartments(institutionId);
  }

  public static getDepartment(
    institutionId: string,
    departmentId: string
  ): DepartmentRecord | null {
    return devStore.getDepartment(institutionId, departmentId);
  }

  public static createDepartment(params: {
    institutionId: string;
    name: string;
    code: string;
    stream: EducationalStream;
    description?: string;
    headOfDepartmentName?: string;
    headOfDepartmentEmail?: string;
  }): DepartmentRecord {
    const existing = devStore
      .getDepartments(params.institutionId)
      .find((d) => d.code.toUpperCase() === params.code.toUpperCase().trim());

    if (existing) {
      throw new Error(`Department with code '${params.code}' already exists.`);
    }

    const id = `dept-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const record: DepartmentRecord = {
      id,
      institutionId: params.institutionId,
      name: params.name,
      code: params.code.toUpperCase().trim(),
      stream: params.stream,
      description: params.description,
      headOfDepartmentName: params.headOfDepartmentName,
      headOfDepartmentEmail: params.headOfDepartmentEmail,
      createdAt: now,
      updatedAt: now,
    };

    return devStore.saveDepartment(record);
  }

  public static updateDepartment(
    institutionId: string,
    departmentId: string,
    updates: Partial<DepartmentRecord>
  ): DepartmentRecord | null {
    const dept = devStore.getDepartment(institutionId, departmentId);
    if (!dept) return null;

    const updated = {
      ...dept,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return devStore.saveDepartment(updated);
  }

  public static deleteDepartment(
    institutionId: string,
    departmentId: string
  ): boolean {
    return devStore.deleteDepartment(institutionId, departmentId);
  }

  // --------------------------------------------------------------------------
  // Programs
  // --------------------------------------------------------------------------
  public static getPrograms(institutionId: string): ProgramRecord[] {
    return devStore.getPrograms(institutionId);
  }

  public static getProgram(
    institutionId: string,
    programId: string
  ): ProgramRecord | null {
    return devStore.getProgram(institutionId, programId);
  }

  public static createProgram(params: {
    institutionId: string;
    departmentId?: string;
    name: string;
    code: string;
    stage: EducationStage;
    stream: EducationalStream;
    durationYears: number;
    totalSemestersOrYears: number;
    description?: string;
  }): ProgramRecord {
    const id = `prog-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const record: ProgramRecord = {
      id,
      institutionId: params.institutionId,
      departmentId: params.departmentId,
      name: params.name,
      code: params.code.toUpperCase().trim(),
      stage: params.stage,
      stream: params.stream,
      durationYears: params.durationYears,
      totalSemestersOrYears: params.totalSemestersOrYears,
      description: params.description,
      createdAt: now,
      updatedAt: now,
    };

    return devStore.saveProgram(record);
  }

  // --------------------------------------------------------------------------
  // Academic Sessions
  // --------------------------------------------------------------------------
  public static getAcademicSessions(institutionId: string): AcademicSessionRecord[] {
    return devStore.getAcademicSessions(institutionId);
  }

  public static createAcademicSession(params: {
    institutionId: string;
    name: string;
    isCurrent?: boolean;
    startDate: string;
    endDate: string;
  }): AcademicSessionRecord {
    if (params.isCurrent) {
      const existingSessions = devStore.getAcademicSessions(params.institutionId);
      for (const s of existingSessions) {
        if (s.isCurrent) {
          s.isCurrent = false;
          devStore.saveAcademicSession(s);
        }
      }
    }

    const id = `sess-${crypto.randomUUID()}`;
    const record: AcademicSessionRecord = {
      id,
      institutionId: params.institutionId,
      name: params.name,
      isCurrent: params.isCurrent ?? false,
      startDate: params.startDate,
      endDate: params.endDate,
      createdAt: new Date().toISOString(),
    };

    return devStore.saveAcademicSession(record);
  }

  // --------------------------------------------------------------------------
  // Classes & Batches
  // --------------------------------------------------------------------------
  public static getClassesBatches(institutionId: string): ClassBatchRecord[] {
    return devStore.getClassesBatches(institutionId);
  }

  public static getClassBatch(
    institutionId: string,
    batchId: string
  ): ClassBatchRecord | null {
    return devStore.getClassBatch(institutionId, batchId);
  }

  public static createClassBatch(params: {
    institutionId: string;
    programId?: string;
    departmentId?: string;
    sessionId: string;
    name: string;
    semesterOrYearNumber: number;
    sectionName?: string;
    stream: EducationalStream;
    academicYear: string;
    maxCapacity?: number;
  }): ClassBatchRecord {
    const id = `batch-${crypto.randomUUID()}`;
    const record: ClassBatchRecord = {
      id,
      institutionId: params.institutionId,
      programId: params.programId,
      departmentId: params.departmentId,
      sessionId: params.sessionId,
      name: params.name,
      semesterOrYearNumber: params.semesterOrYearNumber,
      sectionName: params.sectionName,
      stream: params.stream,
      academicYear: params.academicYear,
      maxCapacity: params.maxCapacity || 60,
      enrolledCount: 0,
      createdAt: new Date().toISOString(),
    };

    return devStore.saveClassBatch(record);
  }

  public static updateClassCapacity(
    batchId: string,
    enrolledCount: number,
    institutionId?: string
  ): ClassBatchRecord | null {
    if (institutionId) {
      const batch = devStore.getClassBatch(institutionId, batchId);
      if (batch) {
        batch.enrolledCount = enrolledCount;
        return devStore.saveClassBatch(batch);
      }
    }

    const store = (devStore as any).loadStore();
    for (const iid in store.classesBatches || {}) {
      const batch = (store.classesBatches[iid] as ClassBatchRecord[]).find(
        (b) => b.id === batchId
      );
      if (batch) {
        batch.enrolledCount = enrolledCount;
        return devStore.saveClassBatch(batch);
      }
    }
    return null;
  }
}
