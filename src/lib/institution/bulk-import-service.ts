// ==============================================================================
// KAABIL (काबिल) — Bulk Student CSV Import Service
// Safe CSV parsing, formula injection sanitization, duplicate checks, and batch enrollment.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import { InstitutionStudentService } from "./student-service";
import { BulkImportJobRecord } from "@/types/institution";
import { EducationalStream, EducationStage } from "@/types";

export interface ParsedCsvRow {
  name: string;
  email: string;
  rollNumber?: string;
  stream: EducationalStream;
  stage: EducationStage;
}

export interface BulkImportResult {
  jobId: string;
  totalRows: number;
  successfulCount: number;
  failedCount: number;
  errors: { row: number; email?: string; error: string }[];
}

const VALID_STREAMS = new Set<string>([
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
]);

const VALID_STAGES = new Set<string>([
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
]);

export class BulkImportService {
  /**
   * Generates a sample CSV template for bulk student onboarding.
   */
  public static getCsvTemplate(): string {
    return [
      "Full Name,Email Address,Roll Number,Stream,Education Stage",
      "Priya Sharma,priya.sharma@example.edu.in,DTC-24-CS-101,NON_MEDICAL_PCM,UNDERGRADUATE",
      "Rohan Verma,rohan.verma@example.edu.in,DTC-24-CS-102,NON_MEDICAL_PCM,UNDERGRADUATE",
      "Kavita Nair,kavita.nair@example.edu.in,DTC-24-MED-05,MEDICAL_PCB,UNDERGRADUATE",
      "Aarav Patel,aarav.patel@example.edu.in,DTC-24-SCH-11,NON_MEDICAL_PCM,CLASS_11",
    ].join("\n");
  }

  /**
   * Sanitizes cell string against CSV formula injection attacks (CWE-1236).
   */
  public static sanitizeCell(cell: string): string {
    if (!cell) return "";
    if (/^[\t\r=+@\-]/.test(cell)) {
      return `'${cell}`;
    }
    const trimmed = cell.trim();
    if (/^[=+@\-\t\r]/.test(trimmed)) {
      return `'${trimmed}`;
    }
    return trimmed;
  }

  /**
   * Parses and validates raw CSV content. Max 500 rows.
   */
  public static parseCsv(csvText: string): {
    validRows: { rowNumber: number; data: ParsedCsvRow }[];
    errors: { row: number; email?: string; error: string }[];
  } {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const errors: { row: number; email?: string; error: string }[] = [];
    const validRows: { rowNumber: number; data: ParsedCsvRow }[] = [];

    if (lines.length < 2) {
      errors.push({ row: 1, error: "CSV file is empty or missing data rows." });
      return { validRows, errors };
    }

    // Row limit: 500 data rows maximum
    if (lines.length > 501) {
      errors.push({
        row: 502,
        error: "File exceeds 500 row limit. Please split the batch into smaller files.",
      });
      return { validRows, errors };
    }

    // Parse Header
    const headerLine = lines[0].toLowerCase();
    if (!headerLine.includes("name") || !headerLine.includes("email")) {
      errors.push({
        row: 1,
        error: "Invalid CSV header. Expected: Full Name, Email Address, Roll Number, Stream, Education Stage",
      });
      return { validRows, errors };
    }

    const seenEmails = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const rowNumber = i + 1;
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));

      if (cols.length < 2) {
        errors.push({ row: rowNumber, error: "Insufficient columns in row." });
        continue;
      }

      const name = this.sanitizeCell(cols[0] || "");
      const email = cols[1]?.toLowerCase().trim();
      const rollNumber = cols[2] ? this.sanitizeCell(cols[2]) : undefined;
      let streamStr = (cols[3] || "NON_MEDICAL_PCM").toUpperCase().trim().replace(/ /g, "_");
      let stageStr = (cols[4] || "UNDERGRADUATE").toUpperCase().trim().replace(/ /g, "_");

      if (!name || name.length < 2) {
        errors.push({ row: rowNumber, email, error: "Invalid student name." });
        continue;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({ row: rowNumber, email, error: "Invalid email address syntax." });
        continue;
      }

      if (seenEmails.has(email)) {
        errors.push({ row: rowNumber, email, error: "Duplicate email address within same CSV batch." });
        continue;
      }
      seenEmails.add(email);

      // Normalization of common aliases
      if (streamStr === "PCM" || streamStr === "STEM") streamStr = "NON_MEDICAL_PCM";
      if (streamStr === "PCB" || streamStr === "MEDICAL") streamStr = "MEDICAL_PCB";
      if (!VALID_STREAMS.has(streamStr)) {
        streamStr = "NON_MEDICAL_PCM";
      }

      if (stageStr === "COLLEGE" || stageStr === "BTECH" || stageStr === "UG") stageStr = "UNDERGRADUATE";
      if (!VALID_STAGES.has(stageStr)) {
        stageStr = "UNDERGRADUATE";
      }

      validRows.push({
        rowNumber,
        data: {
          name,
          email,
          rollNumber,
          stream: streamStr as EducationalStream,
          stage: stageStr as EducationStage,
        },
      });
    }

    return { validRows, errors };
  }

  /**
   * Executes the bulk import and enrolls all valid rows into the specified institution.
   */
  public static async executeBulkImport(params: {
    institutionId: string;
    fileName: string;
    csvContent: string;
    departmentId?: string;
    programId?: string;
    batchId?: string;
  }): Promise<BulkImportResult> {
    const { validRows, errors } = this.parseCsv(params.csvContent);
    const totalInputRows = validRows.length + errors.length;

    let successfulCount = 0;
    const existingEnrollments = devStore.getStudentEnrollments(params.institutionId);
    const existingEmailSet = new Set(existingEnrollments.map((e) => e.studentEmail.toLowerCase()));

    for (const item of validRows) {
      const { rowNumber, data } = item;

      if (existingEmailSet.has(data.email)) {
        errors.push({
          row: rowNumber,
          email: data.email,
          error: "Student is already enrolled in this institution.",
        });
        continue;
      }

      try {
        InstitutionStudentService.enrollStudent({
          institutionId: params.institutionId,
          studentName: data.name,
          studentEmail: data.email,
          rollNumber: data.rollNumber,
          departmentId: params.departmentId,
          programId: params.programId,
          batchId: params.batchId,
          stream: data.stream,
          stage: data.stage,
        });

        existingEmailSet.add(data.email);
        successfulCount++;
      } catch (err: any) {
        errors.push({
          row: rowNumber,
          email: data.email,
          error: err.message || "Failed to enroll student.",
        });
      }
    }

    const jobId = `job-${crypto.randomUUID()}`;
    const jobRecord: BulkImportJobRecord = {
      id: jobId,
      institutionId: params.institutionId,
      fileName: params.fileName,
      totalRows: totalInputRows,
      successfulRows: successfulCount,
      failedRows: totalInputRows - successfulCount,
      errors,
      status: successfulCount > 0 ? "COMPLETED" : "FAILED",
      importedAt: new Date().toISOString(),
    };

    devStore.saveBulkImportJob(jobRecord);

    return {
      jobId,
      totalRows: totalInputRows,
      successfulCount,
      failedCount: totalInputRows - successfulCount,
      errors,
    };
  }
}
