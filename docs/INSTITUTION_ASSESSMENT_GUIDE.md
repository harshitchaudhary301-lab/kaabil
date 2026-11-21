# KAABIL (काबिल) — Institutional Assessment Scheduling & Management

**Tagline:** Discover Your Skills. Define Your Future.  
**Phase:** Part E2 (Milestone E2.2)  
**Status:** Implemented & Verified  

---

## 1. Overview

The Institutional Assessment module allows academic departments and institutions to schedule standardized diagnostic and competency evaluations across entire cohorts or specific academic batches.

Rather than authoring arbitrary unstandardized questionnaires, institutions draw from KAABIL's standardized assessment banks (`KAABIL_ASSESSMENTS`) covering all 13 educational categories.

---

## 2. Assessment Banks & Categorization

Assessments in KAABIL feature:
- **Objective Auto-Grading:** Standardized multiple-choice questions with clear explanations.
- **Scenario Analysis:** Complex diagnostic scenarios with standardized rubric guides.
- **Difficulty Stages:** Calibrated for Class 8, Class 10, Class 12, and Undergraduate / Postgraduate learners.
- **Stream Categories:**
  - `FOUNDATION`: Core literacy, numeracy, and logical deduction.
  - `SUBJECT_SPECIFIC`: Disciplinary physics, biology, accounting, jurisprudence, mechanics.
  - `CAREER_AWARENESS`: Understanding of industry norms, ethics, and workplace expectations.
  - `LOGICAL_REASONING`: Quantitative analysis and problem decomposition.
  - `DOMAIN_COMPETENCY`: Advanced technical frameworks and clinical diagnostic reasoning.

---

## 3. Cohort Assignment & Progress Tracking

Institutions schedule assessments by defining:
- `institutionId`: Multi-tenant boundary.
- `assessmentId`: Standardized bank ID (e.g. `asm-med-01`, `asm-tech-01`, `asm-com-01`).
- `departmentId` or `batchId`: Target student cohort.
- `scheduledDate` & `deadline`: Time window for student completion.

The schedule tracks:
- `totalAssigned`: Count of enrolled students in the target cohort.
- `totalSubmitted`: Real-time submission counter.
- `status`: `"SCHEDULED" | "ACTIVE" | "CLOSED"`.
