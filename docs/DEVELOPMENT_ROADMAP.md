# DEVELOPMENT_ROADMAP.md — 10-Phase Implementation Roadmap

## Project: KAABIL (काबिल)
**Architecture Execution:** Sequential Phased Rollout (Modular Monolith)  
**Standard:** Production-Grade SaaS (No Hackathon Shortcuts or Placeholders)  

---

## 1. Roadmap Overview & Phasing Strategy

To maintain engineering discipline and prevent architectural drift, KAABIL is executed across **10 sequential phases**. Application code must be introduced strictly in alignment with these phases.

### Master Implementation Sequencing (Phased Delivery)

```
[Phase 1 / Prompt 1-3: Foundation & Landing Page] (COMPLETED)
                     │
                     ▼
[Phase 2 / Prompt 4: Real PostgreSQL Database Integration] (COMPLETED)
                     │
                     ▼
[Part A / Prompt 5-6: Secure Auth, RBAC & Multi-Stream Onboarding] (COMPLETED)
                     │
                     ▼
[Part B / Prompt 7-9: Universal Career Intelligence & Hybrid AI] (COMPLETED)
                     │
                     ▼
[Part C / Prompt 10-11: Smart Student Dashboard, Digital Twin & Adaptive Roadmap] (COMPLETED)
                     │
                     ▼
[Part D1 / Prompt 12: Universal AI Career Mentor & Skill Assessment Engine] (COMPLETED)
 ├── AI Career Mentor (Gemini 2.0 Flash Trilingual EN/HI/Hinglish, 8s SLA, Fallback)
 └── Skill Assessment Engine (13-Stream Question Banks, Objective Auto-Grading, SkillEvidence)
                     │
                     ▼
[Part D2 / Prompt 13: Skill Gap Analyzer & Digital Skill Passport] (COMPLETED)
 ├── Multi-Dimensional Skill Gap Analyzer (Mandatory vs Recommended Gaps, Explainable v1.0)
 ├── Digital Skill Passport (Cryptographic Passbook with Evidence Layers & HMAC-SHA256 Signing)
 └── QR Sharing Gateway (Expiring Links, Audit Logging, Server-Side DPDP Under-18 Privacy Lock)
                     │
                     ▼
[Part E1 / Prompt 14: Universal Institution Portal, Faculty & Student Management] (COMPLETED)
 ├── Multi-Tenant Institutional Architecture (Strict Tenant Isolation by institutionId)
 ├── Institutional Dashboard (Telemetry, Stream Breakdown, CRI Distributions, Recent Activity)
 ├── 4-Tier Academic Hierarchy (Departments, Programs, Academic Sessions, Classes & Cohorts)
 ├── Faculty & Academic Staff Management (Least-Privilege RBAC & Expiring 7-Day Invite Tokens)
 ├── Student Roster & Onboarding (Single Enrollment, Campus Join Codes & DPDP Minor Safeguards)
 └── Bulk Student CSV Import (Formula Injection Sanitization CWE-1236, 500-Row Limit)
                     │
                     ▼
[Part E2 / Prompt 15: Institution Intelligence, Analytics, Interventions & Placements] (COMPLETED)
 ├── Multi-Stream Cohort Skill Analytics Heatmap & Curated Industry Demand Intelligence
 ├── Smart Student Intervention System (Transparent Rules, 14-Day SLA, Non-Punitive Framing)
 ├── Smart Training Management (Adaptive Proposals & Automatic SkillEvidence Minting)
 ├── Institutional Assessment Scheduling (Standardized Banks across 13 Streams)
 ├── Campus Placement Drives (Explainable Eligibility Engine & DPDP Under-18 Protection)
 └── Institutional Outcome Reports (NAAC II/V, NIRF GO/GPH, NBA OBE & CWE-1236 Sanitized CSV)
                     │
                     ▼
[Part F1 / Prompt 16: Universal Employer Portal, Organization Management & ATS] (COMPLETED)
 ├── Employer Organization Management & Multi-Role RBAC (Admin, Recruiter, Hiring Manager)
 ├── Company Trust & Safety Verification Gate (MCA/GSTIN Human Review Required, No Domain Auto-Approval)
 ├── Skills-First Opportunity Builder (13 Universal Streams, Mandatory vs Preferred, Licenses)
 ├── Applicant Tracking System & Explainable Matching (Stream 25%, Stage 25%, Verified Evidence 50%)
 ├── Accessible Kanban Pipeline (/employer/pipeline) with Recruiter Notes & Status Audit Trail
 ├── Campus Placement Drive Coordination & Partnership Agreements (/employer/campus)
 ├── Descriptive Recruitment Intelligence & Funnel Analytics (/employer/analytics)
 └── Strict DPDP Under-18 Protection (Minors <18 and Class 8-10 Shielded from Job Application/Discovery)
                     │
                     ▼
[Part F2 / Prompt 17: Two-Way Explainable Matching, Discovery & Industry Challenges] (COMPLETED)
 ├── Two-Way Explainable Matching Engine (5-Dimensional Scoring Model, Configurable Weights, Synonyms)
 ├── Candidate Discovery & Under-18 Safeguards (Opt-In Search, Immediate Withdrawal, Under-18 Block)
 ├── Digital Skill Passport Verification (HMAC-SHA256 Signatures, SHA-256 Hashes, QR Verification)
 ├── Interview Management Hub & Structured Rubrics (1-5 Competency Scoring & ATS Synchronization)
 ├── Multi-Stream Industry Challenge Hub (Project Deliverables & Automatic Credential Minting)
 └── Unified Intelligence Loop (Full Closed Loop from Employer Demand to Student Hire Verified)
                     │
                     ▼
[Part G / Prompt 18: Universal Admin Portal, Governance, Student Tools & Advanced AI] (COMPLETED)
 ├── Platform Directorate Administration & Real Telemetry Dashboard (/admin/dashboard)
 ├── Trust & Safety Verification Directorate for Institutions & Employers (/admin/verifications)
 ├── User Management & DPDP Right to be Forgotten Directorate (/admin/users)
 ├── Universal Platform CMS across 13 Streams (/admin/cms)
 ├── AI Governance, Safety & Telemetry Monitor (/admin/ai-governance)
 ├── Student Learning Academy with Real-Time Progress Tracking (/student/academy)
 ├── Resume Studio with Digital Passport Badges & 3 Professional Templates (/student/resume)
 ├── Interview Practice Lab with Rubric Evaluation & Zero Biometric Scoring (/student/interview-lab)
 ├── Student Portfolio with DPDP Privacy Controls (/student/portfolio)
 ├── Career What-If Simulator with Illustrative Statutory Disclaimers (/student/simulator)
 └── Multi-Stream Industry Demand Intelligence & Global Search (/api/analytics/industry-demand)
                     │
                     ▼
[Part H / Prompt 19: Premium UI/UX Transformation & Professional SaaS Experience] (COMPLETED)
 ├── Design System & Visual Hierarchy (#F8FAFC, #FFFFFF, #4169E1, #7952D9, #38BDF8, #172033, #64748B, #E8ECF4)
 ├── ScoreRing Component: Pure SVG Circular Progress Gauge with Dynamic Color-Coding & Centered Score
 ├── SkillRadar Component: Interactive Pure SVG Multi-Axis Radar Chart for 5-Dimension Competencies
 ├── KaabilLogo Component: Animated Brand SVG Mark with Orbital Rings & Bilingual Typography (KAABIL | काबिल)
 ├── Landing Page Transformation: Sticky Glassmorphism Header, Hero with ScoreRing & Switchers, 13 Streams Grid
 ├── Student Portal Elevation: ScoreRing CRI Indicator, SkillRadar Dimension Radar, Adaptive Checklist
 └── Portal Layout Polish: Unified Responsive Sidebar, Breadcrumbs, Role Badges, Evaluator Portal Switcher
                     │
                     ▼
[Part I / Prompt 20: Full Platform Integration, Functional Verification & Bug Resolution] (COMPLETED)
 ├── Master Integration Suite (src/__tests__/platform-integration-part-i.test.ts, 11 tests)
 ├── Unified KAABIL Intelligence Loop (10-Phase End-to-End Demand-to-Hire Loop Verified)
 ├── Full Vitest Regression Suite (49 Test Files, 235 Tests, 100% Passing)
 ├── Clean TypeScript Compilation (0 Errors with npx tsc --noEmit)
 ├── Clean Next.js 14 Production Build (Exit Code 0, 68 Static & Dynamic Routes)
 ├── Multi-Portal Visual QA Verified (Student, Institution, Employer, Admin)
 ├── DPDP Act (2023) Minor Safeguards & Multi-Tenant Isolation Verified
 └── Zero-Loss Dual-Mode Persistence (PostgreSQL with Transparent Disk-Backed Fallback)
                     │
                     ▼
[Part J / Prompt 21: Final Security Hardening, Production Readiness & Project Delivery] (COMPLETED)
 ├── Enterprise Security Hardening (NIST scrypt, Security Headers, API Rate Limiting, OWASP Top 10)
 ├── Health Check & Telemetry (/api/health endpoint with system & statutory metrics)
 ├── Production Containerization (Multi-stage Dockerfile, docker-compose.yml & Prisma migrations)
 ├── Windows VS Code Quick Start (Beginner-friendly QUICK_START_WINDOWS.md)
 ├── Multi-Portal Visual QA across 12 surfaces (Desktop/Mobile Landing, Auth, Student, Mentor, Twin, Gaps, Passport, Org, ATS, Admin)
 ├── Distributable Archive Packaging (KAABIL_Final_FullStack_Project.zip)
 └── Final Release Checkpoint (checkpoints/kaabil-final-release)
```

---

## 2. Phase-by-Phase Technical Specifications

### Phase 1: Project Foundation & Premium Landing Page
- **Goal**: Establish the production Next.js 15 App Router architecture, initialize TypeScript strict mode, configure Tailwind CSS with custom brand tokens, install Shadcn/UI primitives, and build the high-converting marketing landing page.
- **Key Deliverables**:
  - `package.json` with stable dependency pins and lockfile.
  - Next.js root layout with Plus Jakarta Sans and Inter font definitions.
  - Tailwind theme tokens (`#F8FAFC`, `#4169E1`, `#7952D9`, `#38BDF8`, `#172033`, `#E8ECF4`).
  - Shadcn/UI core primitives (Button, Card, Badge, Dialog, Dropdown, Tabs, Input, Tooltip).
  - Premium Landing Page (`src/app/(marketing)/page.tsx`):
    - Hero with dynamic stream switcher showcasing all 12+ streams.
    - The KAABIL Intelligence Loop interactive visual breakdown.
    - Bento grid highlighting the 4 portals (Student, Institution, Employer, Admin).
    - Interactive career discovery preview widget.
    - Transparent comparison table ("Traditional EdTech vs. KAABIL").
    - Call to action, accessibility footer, and DPDP privacy badge.
- **Verification Gate**:
  - `npm run build` passes with zero TypeScript or ESLint errors.
  - Page renders flawlessly at mobile (375px), tablet (768px), and desktop (1440px).
  - Lighthouse performance score $\ge 90$ and WCAG 2.1 AA contrast compliance.

---

### Phase 2: Authentication, Role Management & Intelligent Onboarding
- **Goal**: Build the secure authentication layer, role-based session routing, and dynamic, age-aware onboarding flow.
- **Key Deliverables**:
  - Auth.js (NextAuth v5) integration with Prisma Adapter.
  - Multi-role support (`STUDENT`, `INSTITUTION_ADMIN`, `FACULTY`, `EMPLOYER_ADMIN`, `RECRUITER`, `SUPER_ADMIN`).
  - Argon2id password hashing, CSRF protection, and session cookie management.
  - Dynamic Intelligent Onboarding wizard:
    - **Step 1: Identity & Age Validation** (detects minors $<18$ and activates DPDP protections).
    - **Step 2: Educational Stage Selection** (Class 8–10, Class 11–12, Diploma, ITI, UG, PG, Pro).
    - **Step 3: Stream Selection / Undecided Pathway**.
    - **Step 4: Primary Aspirations & Language Preference** (English, Hindi, Hinglish).
- **Verification Gate**:
  - Unit tests verifying session generation and route guard redirection.
  - Minor accounts automatically assigned `isMinor = true` with recruiter visibility locks.

---

### Phase 3: All-Streams Career Database & Career Intelligence Engine
- **Goal**: Implement the dynamic PostgreSQL career taxonomy and deterministic career engines covering all 12+ educational streams.
- **Key Deliverables**:
  - Prisma database migration creating `Domain`, `SubDomain`, `CareerPath`, `Skill`, `CareerSkillRequirement`, `EligibilityRule`.
  - Canonical seed dataset containing 12 streams, 50+ sub-domains, and 120+ career paths with verified Indian salary and regulatory criteria.
  - `CareerDiscoveryEngine`: Multi-facet filtering (stream, education level, salary, automation risk).
  - `CareerComparisonEngine`: Side-by-side metric normalization for up to 3 paths.
  - `EligibilityValidator`: Strict regulatory criteria validator (NEET PCB criteria, NDA age limits, BCI legal requirements).
- **Verification Gate**:
  - Automated tests validating eligibility logic against real government norms.
  - Zero hardcoded career lists in UI components; all data fetched from Prisma.

---

### Phase 4 / Part C & D: Complete Student Portal Ecosystem

#### Part C: Foundation MVP (COMPLETED)
- **Smart Student Dashboard**: Real-time command center, streak counters, and DPDP Act minor protection.
- **Career Digital Twin**: 5-horizon capability mapping with verified vs self-reported skill separation.
- **Career Readiness Index (CRI)**: Explainable 5-dimension engine (Knowledge, Educational, Skills, Practical, Milestones) with zero fabricated scores.
- **Adaptive Career Roadmap**: 12-week stream-specific modular curriculums with live activity synchronization.
- **Daily AI Missions**: Non-punitive micro-learning challenges with qualitative reflections and ratings.

#### Part D: Advanced Student Intelligence (NEXT IMMEDIATE MILESTONE)
- **AI Career Mentor**: Trilingual reasoning engine (English, Hindi, Hinglish) via Gemini 2.0 Flash for interactive career dialogue, dilemma resolution, and NEP 2020 cross-stream navigation.
- **Skill Assessment Engine**: Formal proctored/unproctored multi-stream challenges across technical, clinical, legal, commerce, and vocational domains to transform self-reported skills into verified credentials.
- **Skill Gap Analyzer**: Deep diagnostic comparison matrix contrasting student genome against statutory council benchmarks (NMC, AICTE, BCI, ICAI), highlighting critical deficiencies.
- **Digital Skill Passport**: Cryptographically signed, shareable credential portfolio showcasing verified badges, assessment transcripts, and readiness audit trails.

- **Verification Gate for Part D**:
  - Student completes formal assessment challenge $\to$ skill flips from Self-Reported to Verified $\to$ CRI score recalibrates transparently.
  - Digital Skill Passport generates verifiable integrity checksum.
  - Institution and Employer Portals will begin strictly after Part D completion.

---

### Phase 5: Institution Portal
- **Goal**: Equip schools, colleges, and polytechnics with cohort analytics, student management, and placement coordination.
- **Key Deliverables**:
  - Institution Dashboard with enrollment, stream distribution, and cohort health.
  - Student Directory with batch management and CSV/Excel import.
  - Skill Analytics Heatmap highlighting cohort-wide curriculum gaps.
  - Smart Student Intervention system flagging at-risk students falling behind on roadmaps.
  - Placement Management coordinator for campus drives.
  - Exportable NIRF, NAAC, and NBA accreditation outcome reports.
- **Verification Gate**:
  - Institution admins cannot view students from other institutions (`organizationId` isolation).
  - Bulk student CSV import properly parses and seeds student profiles.

---

### Phase 6: Employer Portal
- **Goal**: Provide verified employers with skills-first candidate discovery, challenge creation, and explainable talent matching.
- **Key Deliverables**:
  - Employer Recruitment Dashboard.
  - Job Vacancy Management with explicit mandatory and preferred skill thresholds.
  - Explainable AI Talent Matcher displaying exact mathematical match breakdowns.
  - Candidate Discovery Engine querying verified Digital Skill Passports (excluding minors).
  - Industry Challenge Hub for practical candidate work trials.
  - Visual Kanban Recruitment Pipeline (Applied $\to$ Screened $\to$ Challenge $\to$ Interview $\to$ Offer).
  - Structured Hiring Feedback module returning actionable signals to applicants.
- **Verification Gate**:
  - Recruiter search strictly filters out any student tagged as `isMinor`.
  - Recruiter view renders exact match score calculations without black-box metrics.

---

### Phase 7: Complete Admin Portal & CMS
- **Goal**: Full administrative governance, verification workflows, and career content management.
- **Key Deliverables**:
  - Superadmin Platform Dashboard with real-time system metrics and token usage.
  - Institution Verification queue (validating AISHE/UGC/CBSE affiliation).
  - Employer Verification queue (validating CIN/GSTIN corporate identity).
  - Dynamic Career Taxonomy CMS (add/edit domains, careers, and skills without code deploy).
  - Central Question & Assessment Bank manager.
  - Job Vacancy Moderation queue.
  - Immutable Audit Log viewer.
- **Verification Gate**:
  - Superadmin can add a new career domain via CMS and immediately see it live in the Student Career Explorer.

---

### Phase 8: Advanced AI Intelligence Engines
- **Goal**: Deep Gemini API integration with streaming conversational mentorship, multilingual support, and scenario simulation.
- **Key Deliverables**:
  - Trilingual AI Career Mentor supporting English, Hindi (हिन्दी), and Hinglish with streaming UI.
  - Stream Selection Assistant with psychometric diagnostic evaluation.
  - Career What-If Simulator testing career transitions and alternative education paths.
  - ATS-Optimized Resume Studio with structured bullet feedback.
  - Interactive AI Mock Interview Lab with real-time response analysis.
  - Prompt safety guardrails and token budget controls.
- **Verification Gate**:
  - AI Mentor correctly responds to queries asked in Hinglish ("Main 12th PCM mein hoon, aerospace engineer kaise banu?").
  - Zero hallucination of regulated eligibility requirements.

---

### Phase 9: Full Integration & End-to-End Testing
- **Goal**: Connect all portals, execute cross-portal user journeys, and validate test coverage.
- **Key Deliverables**:
  - Complete end-to-end integration tests using Playwright.
  - User Journey 1: Student onboarded $\to$ roadmap generated $\to$ skill verified $\to$ passport minted $\to$ matched to job.
  - User Journey 2: Institution uploads cohort $\to$ identifies skill gap $\to$ assigns targeted training.
  - User Journey 3: Employer posts job $\to$ evaluates applicants with explainable match $\to$ submits hiring feedback.
  - Vitest unit test suite covering all scoring and ranking formulas.
- **Verification Gate**:
  - 100% pass rate on all E2E critical flows.
  - Zero data leakage between tenants or across role boundaries.

---

### Phase 10: Security Review & Production Beta Deployment
- **Goal**: Penetration testing, DPDP Act compliance audit, environment hardening, and staged beta release.
- **Key Deliverables**:
  - Comprehensive security audit (OWASP Top 10, SQL injection, CSRF, rate-limit stress tests).
  - DPDP Act compliance validation: parental consent flows, profile deletion, data export in JSON.
  - Production environment configuration and database connection pooling.
  - Automated database backup and disaster recovery validation.
  - Production beta release to pilot institutions and initial employer cohort.
- **Verification Gate**:
  - Clean penetration test report with zero critical or high vulnerabilities.
  - Formal sign-off on legal and child privacy protections.
