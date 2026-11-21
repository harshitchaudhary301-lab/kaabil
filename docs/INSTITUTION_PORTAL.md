# KAABIL (काबिल) — Universal Institution Portal Architecture

**Product Tagline:** Discover Your Skills. Define Your Future.  
**Core Mission:** Every Stream. Every Skill. Every Future.  
**Specification:** Part E1 (Prompt 14) — Universal Institution Portal, Institutional Dashboard, Faculty, Departments & Student Management.

---

## 1. Executive Summary

The **KAABIL Universal Institution Portal** delivers an enterprise-grade, multi-tenant academic and placement intelligence console designed for all educational institutions in India. Breaking away from legacy platforms that exclusively cater to standard engineering colleges, KAABIL provides native first-class support for:
- Secondary & Senior Secondary Schools (CBSE, ICSE, State Boards)
- Engineering & Technology Universities (AICTE, NBA, UGC)
- Medical, Dental & Nursing Colleges (NMC, DCI, INC)
- Commerce, Management & Business Schools (AICTE, AACSB)
- Law Schools & Legal Academies (BCI)
- Arts, Humanities & Social Sciences Colleges
- Pure Sciences & Research Institutes
- Industrial Training Institutes (ITI) & Polytechnic Centers (NCVT/SCVT)
- Design, Fine Arts & Creative Media Academies
- Agriculture & Environmental Institutes (ICAR)

---

## 2. Portal Feature Overview

| Module | Route | Functionality |
|---|---|---|
| **Institutional Dashboard** | `/institution/dashboard` | Aggregated executive telemetry, stream breakdown, CRI cohort health distributions, recent activities, and campus code. |
| **Student Directory** | `/institution/students` | Full roster view, search/filter across 13 streams, single student enrollment modal, DPDP minor status badge. |
| **Bulk CSV Import** | `/institution/students/import` | Safe batch roster onboarding (up to 500 rows) with formula injection sanitization (CWE-1236), preview table, and error logging. |
| **Academic Departments** | `/institution/departments` | Disciplinary divisions management with unique codes, stream assignment, HOD allocation, and capacity counters. |
| **Academic Programs** | `/institution/programs` | Curriculum paths from secondary classes (8–10) to doctoral degrees with duration and degree stage. |
| **Classes & Batches** | `/institution/classes` | Section-level cohort management with academic session binding, semester schedule, and capacity progress bar. |
| **Faculty & Staff Directory** | `/institution/faculty` | Staff directory with least-privilege role assignment and 7-day secure expiring invitation tokens. |
| **Academic Sessions** | `/institution/sessions` | Multi-year institutional calendar manager with active single-session toggle enforcement. |
| **Settings & Verification** | `/institution/settings` | Institutional accreditation credentials (NAAC, NIRF), official contact info, self-enrollment campus join code, and tenant isolation status. |

---

## 3. Security, Multi-Tenancy & Student Privacy

1. **Strict Multi-Tenant Isolation:**
   All data queries, academic entities, faculty records, and student rosters are strictly partitioned by `institutionId`. Zero cross-tenant data leakage is permitted.

2. **Data Minimization & Boundary Separation:**
   Institutional staff have access only to academic performance, CRI scores, assessment completion counts, and verified skill evidence. **Private student AI Career Mentor dialogues and personal reflection journals are strictly confidential to the student** and cannot be viewed by campus faculty or administrators.

3. **DPDP Act (2023) Child Safety:**
   Any student in Class 8, 9, 10 or verified under the age of 18 is classified as a minor. The platform enforces `guardianConsent: "PENDING"` until explicit guardian verification is recorded. Minor student profiles are prohibited from external publication or placement marketing.
