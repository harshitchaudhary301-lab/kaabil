"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Users,
  ShieldAlert,
  RefreshCw,
  FileText,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { INSTITUTION_NAV } from "@/components/institution/institution-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ParsedRow {
  rowNumber: number;
  fullName: string;
  email: string;
  rollNumber?: string;
  department?: string;
  program?: string;
  batchYear?: string;
  stage?: string;
  stream?: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export default function BulkStudentImportPage() {
  const [csvContent, setCsvContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    totalRows: number;
    importedCount: number;
    failedCount: number;
    errors: Array<{ row: number; reason: string }>;
  } | null>(null);

  // Formula injection check (CWE-1236)
  const sanitizeCell = (cell: string): string => {
    const trimmed = cell.trim();
    if (/^[=+@\-\t\r]/.test(trimmed)) {
      return "'" + trimmed;
    }
    return trimmed;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      parseAndValidateCsv(content);
    };
    reader.readAsText(file);
  };

  const parseAndValidateCsv = (text: string) => {
    setImportResult(null);
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      setParsedRows([]);
      setIsValidated(false);
      return;
    }

    // Header validation
    const headerLine = lines[0];
    const headers = headerLine.split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
    const rows: ParsedRow[] = [];

    const seenEmails = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      if (i > 500) {
        // Enforce 500 row limit
        break;
      }

      const cols = lines[i].split(",").map((c) => sanitizeCell(c.trim().replace(/^["']|["']$/g, "")));
      const rowData: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowData[h] = cols[idx] || "";
      });

      const rowErrors: string[] = [];
      const rowWarnings: string[] = [];

      const fullName = rowData["fullname"] || rowData["full name"] || rowData["name"] || "";
      const email = rowData["email"] || "";
      const rollNumber = rowData["rollnumber"] || rowData["roll number"] || rowData["roll_no"] || "";
      const department = rowData["department"] || "";
      const program = rowData["program"] || "";
      const batchYear = rowData["batchyear"] || rowData["batch year"] || rowData["year"] || "";
      const stage = rowData["stage"] || "";
      const stream = rowData["stream"] || "";

      if (!fullName) {
        rowErrors.push("Missing full name");
      }
      if (!email) {
        rowErrors.push("Missing email address");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        rowErrors.push("Invalid email format");
      } else if (seenEmails.has(email.toLowerCase())) {
        rowErrors.push("Duplicate email in CSV");
      } else {
        seenEmails.add(email.toLowerCase());
      }

      if (stage && (stage.includes("8") || stage.includes("9") || stage.includes("10"))) {
        rowWarnings.push("DPDP Minor: Guardian consent required before external sharing");
      }

      rows.push({
        rowNumber: i,
        fullName,
        email,
        rollNumber,
        department,
        program,
        batchYear,
        stage,
        stream,
        isValid: rowErrors.length === 0,
        errors: rowErrors,
        warnings: rowWarnings,
      });
    }

    setParsedRows(rows);
    setIsValidated(true);
  };

  const executeImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/institution/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvData: csvContent,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const resObj = data.result || data.data || {};
        setImportResult({
          success: true,
          totalRows: resObj.totalRows ?? parsedRows.length,
          importedCount: resObj.importedCount ?? resObj.imported ?? 0,
          failedCount: resObj.failedCount ?? resObj.failed ?? 0,
          errors: resObj.errors || [],
        });
      } else {
        setImportResult({
          success: false,
          totalRows: parsedRows.length,
          importedCount: 0,
          failedCount: parsedRows.length,
          errors: [{ row: 0, reason: data.error || "Import failed" }],
        });
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        totalRows: parsedRows.length,
        importedCount: 0,
        failedCount: parsedRows.length,
        errors: [{ row: 0, reason: err.message || "Network error during import" }],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Institution", "Students", "Bulk CSV Import"]}
    >
      <div className="space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Link href="/institution/students" className="hover:text-blue-600 flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                Student Directory
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-medium">Bulk CSV Import</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              Bulk Student Onboarding
            </h1>
            <p className="text-sm text-slate-500">
              Upload institutional rosters across any stream with automated sanitization, duplicate detection and DPDP Act compliance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/institution/students/import"
              download="kaabil_student_import_template.csv"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Template CSV
            </a>
          </div>
        </div>

        {/* Security & Guidance Callout */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">
              Institutional Roster Security & DPDP Compliance Guidelines:
            </p>
            <p>
              1. Maximum 500 rows per batch. All cells are sanitized against formula injection (CWE-1236).
            </p>
            <p>
              2. Minor students (Classes 8-10 or age &lt;18) are flagged for guardian consent before any external placement participation.
            </p>
            <p>
              3. Private student mentor conversations and reflection journals are strictly non-disclosable to campus staff.
            </p>
          </div>
        </div>

        {/* Step 1: Upload or Paste */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-600" />
              1. Choose File or Paste CSV Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50 flex flex-col items-center justify-center">
                <FileSpreadsheet className="h-10 w-10 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Upload CSV Spreadsheet
                </p>
                <p className="text-xs text-slate-500 mb-3">
                  UTF-8 CSV format, up to 500 records
                </p>
                <label className="cursor-pointer">
                  <span className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Browse File
                  </span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                {fileName && (
                  <p className="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {fileName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Or Paste Raw CSV Data (Header + Comma-separated Rows):
                </label>
                <textarea
                  rows={6}
                  value={csvContent}
                  onChange={(e) => {
                    setCsvContent(e.target.value);
                    if (e.target.value.trim()) {
                      parseAndValidateCsv(e.target.value);
                    } else {
                      setParsedRows([]);
                      setIsValidated(false);
                    }
                  }}
                  placeholder="fullName,email,rollNumber,department,program,batchYear,stage,stream&#10;Aarav Sharma,aarav@institution.edu,CS-2026-042,Computer Science,B.Tech,2026,HIGHER_ED,Engineering"
                  className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Validation Preview */}
        {isValidated && (
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  2. Validation & Quality Check
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parsed {parsedRows.length} rows &bull;{" "}
                  <span className="text-emerald-700 font-medium">{validCount} valid</span> &bull;{" "}
                  <span className="text-rose-700 font-medium">{invalidCount} invalid</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={executeImport}
                  disabled={isSubmitting || validCount === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Importing {validCount} Students...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Commit Import ({validCount} Valid Records)
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {importResult && (
                <div
                  className={`p-4 rounded-xl mb-4 border ${
                    importResult.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    {importResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-600" />
                    )}
                    {importResult.success
                      ? `Batch import complete! Enrolled ${importResult.importedCount} of ${importResult.totalRows} students.`
                      : "Import encountered errors."}
                  </div>
                  {importResult.errors.length > 0 && (
                    <ul className="text-xs mt-2 list-disc list-inside space-y-0.5 text-rose-800">
                      {importResult.errors.map((err, idx) => (
                        <li key={idx}>
                          Row {err.row}: {err.reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">Row</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Name</th>
                      <th className="px-3 py-2.5">Email</th>
                      <th className="px-3 py-2.5">Roll No.</th>
                      <th className="px-3 py-2.5">Department</th>
                      <th className="px-3 py-2.5">Stream</th>
                      <th className="px-3 py-2.5">Validation Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {parsedRows.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={row.isValid ? "hover:bg-slate-50/50" : "bg-rose-50/40 hover:bg-rose-50/60"}
                      >
                        <td className="px-3 py-2 font-mono text-[11px]">{row.rowNumber}</td>
                        <td className="px-3 py-2">
                          {row.isValid ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                              Ready
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                              Error
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900">{row.fullName || "—"}</td>
                        <td className="px-3 py-2 font-mono text-slate-600">{row.email || "—"}</td>
                        <td className="px-3 py-2 font-mono text-slate-500">{row.rollNumber || "—"}</td>
                        <td className="px-3 py-2">{row.department || "—"}</td>
                        <td className="px-3 py-2">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                            {row.stream || "General"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {row.errors.length > 0 && (
                            <div className="flex items-center gap-1 text-rose-600 font-medium">
                              <XCircle className="h-3 w-3" />
                              {row.errors.join("; ")}
                            </div>
                          )}
                          {row.warnings.length > 0 && (
                            <div className="flex items-center gap-1 text-amber-600 mt-0.5">
                              <AlertTriangle className="h-3 w-3" />
                              {row.warnings.join("; ")}
                            </div>
                          )}
                          {row.isValid && row.warnings.length === 0 && (
                            <span className="text-slate-400">Validated</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
