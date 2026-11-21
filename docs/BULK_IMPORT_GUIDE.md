# KAABIL (काबिल) — Bulk CSV Import & Formula Injection Protection Guide

## 1. Specification Overview

The bulk student import utility enables institutions to onboard entire class cohorts, departments, or entire campus rosters rapidly while adhering to strict security and data hygiene controls.

### Technical Parameters:
- **Maximum Batch Size:** 500 records per upload.
- **Accepted File Formats:** Standard CSV (`text/csv`, UTF-8).
- **Template Route:** `GET /api/institution/students/import`
- **Execution Endpoint:** `POST /api/institution/students/import`

---

## 2. CSV Header Format & Fields

```csv
Full Name,Email Address,Roll Number,Stream,Education Stage
Aarav Sharma,aarav@institution.edu,CS-2026-042,NON_MEDICAL_PCM,UNDERGRADUATE
Pooja Hegde,pooja@institution.edu,MED-2026-015,MEDICAL_PCB,UNDERGRADUATE
Karan Gupta,karan@institution.edu,COM-2026-088,COMMERCE,HIGHER_SECONDARY
Neha Patel,neha@institution.edu,SCH-8-022,NON_MEDICAL_PCM,CLASS_8
```

### Column Specifications:
1. `Full Name` (Required): Student's full official legal name.
2. `Email Address` (Required): Valid email address. Must be unique within the CSV and within the institution.
3. `Roll Number` (Optional): Campus registration or roll number.
4. `Stream` (Optional, defaults to `NON_MEDICAL_PCM`): One of the 13 supported educational streams (or common aliases like `PCM`, `PCB`, `STEM`).
5. `Education Stage` (Optional, defaults to `UNDERGRADUATE`): Education level (`CLASS_8`, `CLASS_9`, `CLASS_10`, `CLASS_11`, `CLASS_12`, `DIPLOMA`, `UNDERGRADUATE`, `POSTGRADUATE`).

---

## 3. Security: Formula Injection Mitigation (CWE-1236)

Spreadsheet applications (Microsoft Excel, LibreOffice Calc, Google Sheets) execute dynamic formulas if a cell value begins with special prefix characters (`=`, `+`, `-`, `@`, `\t`, `\r`). Attackers can craft malicious student names or roll numbers (e.g. `=cmd|' /C calc'!A0`) that execute code on an administrator's machine upon export.

**KAABIL Mitigation:**
All cells in CSV files are passed through `BulkImportService.sanitizeCell()`. Any cell beginning with formula prefix characters is neutralized with a prepended single apostrophe (`'`), instructing spreadsheet software to treat the contents strictly as literal text.
