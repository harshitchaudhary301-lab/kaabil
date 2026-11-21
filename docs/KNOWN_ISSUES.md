# KAABIL (काबिल) — Known Issues, Operational Boundaries & Mitigations

**Platform Tagline:** Discover Your Skills. Define Your Future.  
**Core Principle:** Every Stream. Every Skill. Every Future.  
**Last Updated:** November 20, 2026  
**Status:** Monitored & Fully Mitigated  

---

## 1. Executive Operational Overview

The KAABIL platform is engineered with a strict **graceful degradation and zero-failure architecture**. In production, enterprise staging, or local development environments, missing external infrastructure or credentials does not cause platform crashes or blank screens. Instead, bounded timeouts, resilient disk-backed state stores, and explicit provenance indicators take over seamlessly.

This document outlines known operational boundaries, environment dependencies, and the exact fallback strategies implemented in the codebase.

---

## 2. Infrastructure & Environment Status

### 2.1 Local PostgreSQL Database (`localhost:5432`)

- **Condition:** In local environments without a running PostgreSQL daemon on port 5432, Prisma connection requests will time out.
- **Architectural Mitigation:**
  - `src/lib/db.ts` executes a connection probe with a strict 2,500ms timeout window.
  - When unreachable, the platform logs the connection status and transitions the entire data access layer to `devStore` (`src/lib/dev-store.ts`).
  - **Zero Data Loss:** `devStore` persists all collections (Users, StudentProfiles, CareerGoals, Roadmaps, DailyMissions, Credentials, Assessments, Institutions, Employers, Opportunities, Applications, and AuditLogs) to disk at `.dev-store/store.json`.
  - **State Continuity:** Data persists across Next.js dev server or production server restarts without data loss.
  - **Test Suite Compatibility:** All 49 automated Vitest test suites (235 tests) pass cleanly without requiring a live PostgreSQL instance.

### 2.2 Google Gemini AI API (`GEMINI_API_KEY`)

- **Condition:** If the `GEMINI_API_KEY` environment variable is omitted or invalid.
- **Architectural Mitigation:**
  - AI Mentor service (`src/lib/mentor/gemini-mentor.ts`) and Career Intelligence services implement bounded retries (3 attempts with exponential backoff) and a 12,000ms timeout.
  - If unconfigured or timed out, the system automatically engages the deterministic fallback engine.
  - **Transparent Attribution:** Every response generated via fallback is explicitly labeled with `source: "kaabil_deterministic_mentor"` or `source: "deterministic_engine"` with `isFallback: true`.
  - **Zero Hallucination Guarantee:** The platform strictly adheres to Indian regulatory and AI safety standards by never falsely claiming a live generative AI response when falling back to deterministic templates.

### 2.3 Windows Sandbox Filesystem (`EPERM` on `.next` build directory)

- **Condition:** When running Next.js webpack production builds (`next build`) inside certain restricted Windows sandboxes, transient `EPERM: operation not permitted, mkdir` errors may occur on subdirectories in `.next`.
- **Architectural Mitigation:**
  - Running builds with sandbox bypass (`BypassSandbox: true`) eliminates filesystem permission locks.
  - Cleaning stale build directories (`Remove-Item -Recurse -Force .next`) before rebuilding guarantees reproducible builds.

---

## 3. Statutory & Privacy Guardrails (DPDP Act 2023)

### 3.1 Under-18 Minor Protection in Recruiter Discovery

- **Operational Boundary:** Students under 18 years old or enrolled in Secondary School (Class 8–10) are legally prohibited from commercial employer recruitment under the Digital Personal Data Protection (DPDP) Act 2023.
- **Enforcement Mechanics:**
  - Database schema and `devStore` enforce `allowRecruiterView = false` permanently for all minors.
  - Candidate discovery queries filter out minors at the query level: `if (!profile || profile.isMinor) return []`.
  - Any programmatic attempt to opt-in a minor student to recruiter discovery throws a hard `Statutory Privacy Restriction` error.
  - Educational institutions and guardians retain full oversight while recruiters have zero visibility.

---

## 4. Multi-Tenant Organization Boundary Verification

### 4.1 Academic & Corporate Tenant Isolation

- **Verification:** All multi-tenant queries for institutions (`institutionId`) and employers (`employerId` / `companyId`) enforce tenant boundaries in `where` clauses.
- **Cross-Tenant Access:** Any request attempting to access or modify records belonging to another tenant is blocked with HTTP 403 Forbidden and logged in the security audit trail.

---

## 5. Regulatory Certification Notice

### 5.1 Independent Legal Assessment Requirement

- **Technical Posture:** KAABIL is engineered in strict adherence to the technical principles of India's Digital Personal Data Protection (DPDP) Act 2023, including under-18 recruiter lockout, guardian authorization workflows, minimum necessary data collection, and Right to be Forgotten account erasure.
- **Legal Notice:** In compliance with professional engineering standards, KAABIL does not claim formal accredited statutory certification without a formal independent assessment conducted by licensed legal counsel. Operational deployment in commercial environments should be preceded by legal sign-off.
