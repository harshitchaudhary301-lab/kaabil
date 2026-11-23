# KAABIL (काबिल) — Universal Career, Education, Skill Development & Employment Ecosystem

> **Tagline:** Discover Your Skills. Define Your Future.  
> **Brand Message:** Every Stream. Every Skill. Every Future.  
> **Version:** Release Candidate v1.0.0-rc1 (Universal 13-Stream Intelligence, Isolated Preview Deployment & Full Verification)  
> **Market:** India (All 28 States & UTs)  
> **Core Principle:** KAABIL is **NEVER** limited to engineering or technology. It is a universal ecosystem built from the ground up for **ALL 13 educational streams** from Class 8 onward to working professionals.

---

## 🌟 Architecture & Implemented Capabilities

1. **Phase 1: Premium Landing Page Transformation**:
   - **Completely Redesigned Two-Column Hero:**
     - Left column with small eyebrow ("Your Future. Powered by Intelligence."), main headline ("Every Stream. Every Skill. Every Future." with vibrant blue-purple gradient), supporting description, primary CTA ("Explore Your Career", min 48px), and secondary CTA ("See How KAABIL Works", min 48px). No overlapping floating badges!
     - Right column with an original, layered glass career ecosystem illustration combining CRI `ScoreRing` gauge, 4-stream presets (STEM, Healthcare, Commerce, Law), granular competency stack, AI Career Mentor speech card, and HMAC-SHA256 Digital Skill Passport credential badge.
   - **Three Dedicated Portal Cards:**
     - Student (Blue & lavender theme), Institution (Mint & teal theme), and Employer (Purple & soft orange theme) with custom micro-illustrations and direct CTAs.
   - **Interactive All 13 Educational Streams Explorer:**
     - Stream category filter pills, color-coded icons, pathway previews, salary benchmarks, and modal drilldown connecting to verified career pathways.
   - **Signature KAABIL Innovations Bento Grid:**
     - 8 feature cards with dedicated mini-visualizations: AI Career Mentor, Career Digital Twin, Career Readiness Index, Career What-If Simulator, Skill Gap Analyzer, Digital Skill Passport, Adaptive Career Roadmap, Explainable Talent Matching.
   - **KAABIL Intelligence Loop:**
     - 6-stage closed cycle: Discover &rarr; Learn &rarr; Assess &rarr; Verify &rarr; Improve &rarr; Connect with stakeholder tabs (Student, Institution, Employer).
   - **Interactive Product Showcase:**
     - 5-tab preview for Student Command Center, AI Career Mentor, Career Digital Twin, Institution Analytics, and Employer Matching.
   - **Lightweight 3-Second Brand Intro:**
     - KAABIL logo reveal &rarr; Discover Your Skills &rarr; Define Your Future with reduced-motion compliance and instant Skip option.
   - **Final High-Impact CTA & Clean Compliance Footer:**
     - "Your Future Starts With KAABIL." with Get Started CTA and zero fabricated testimonials or user statistics.

2. **KAABIL 2.0 — Executive Portal Redesign & Career Command Center**:
   - **Executive Bento-Grid Command Center (`/student/dashboard`):** Modern bento grid layout featuring:
     - Gradient illustrated welcome banner with dynamic stream and educational stage badges.
     - **Card 1 (Span 8):** Career Readiness Index (CRI) with animated SVG `ScoreRing` and 5 preparation dimension gauges (honest empty-state diagnostics for new students).
     - **Card 2 (Span 4):** Multi-axial SVG `SkillRadar` competency polygon benchmarked against stream demands.
     - **Card 3 (Span 6):** Career Digital Twin snapshot and target horizon.
     - **Card 4 (Span 6):** Daily AI Micro-Learning Mission with interactive reflection modal.
     - **Card 5 (Span 12):** Interactive 12-week Adaptive Learning Roadmap with milestone accordion and live task checklists.
     - **Fixed Floating AI Mentor Pill:** One-tap floating button (`fixed bottom-6 right-6 z-40`) connecting students immediately to their AI Career Mentor.
   - **Split-Screen Authentication (`/login`, `/register`):**
     - Illustrated 5:7 split screen with platform value journey on the left and clean role-tabbed auth on the right.
     - Dynamic password visibility toggles, live password strength meter, DPDP under-18 guardian consent notice, and one-click demo credentials for all 4 portals.
   - **Categorized Collapsible Sidebar in `PortalLayout`:**
     - Collapsible, categorized sidebar navigation deployed across all four portals (Student, Institution, Employer, Admin) with active route auto-expansion and responsive mobile drawer.
   - **Strict Security Hardening:**
     - Removed password-verification bypasses from production paths; fails closed with HTTP 503 if database is disconnected in non-demo production environments. Enforces scrypt hash verification across all accounts, including admin accounts.

2. **Premium UI/UX Transformation & Professional SaaS Experience (Part H)**:
   - **Executive Design System:** Built on a light, bright, investor-ready SaaS aesthetic (`#F8FAFC` background, `#FFFFFF` cards, `#4169E1` royal blue, `#7952D9` deep iris purple, `#38BDF8` sky blue, `#172033` primary text, `#64748B` secondary text, and `#E8ECF4` borders) with generous whitespace and rounded cards (`rounded-2xl`).
   - **Interactive Visual Primitives:**
     - `ScoreRing`: Dependency-free animated SVG circular gauge displaying Career Readiness Index (CRI) with dynamic color-coding (emerald $\ge 75$, royal blue 60–74, amber < 60) and centered score typography.
     - `SkillRadar`: Pure SVG multi-axis radar chart displaying 5-dimension competency breakdowns without external heavy charting libraries.
     - `KaabilLogo`: Animated brand mark with orbital discovery rings and bilingual typography (`KAABIL | काबिल`).
   - **Elevated Public Experience:** Sticky glassmorphism navigation header, high-converting hero with live simulated student dashboard, interactive stream switchers (STEM, Medical, Commerce, Law), complete 13-stream grid with dedicated regulatory icons, and statutory DPDP Act compliance banner.
   - **Student Dashboard Elevation:** Seamless integration of `ScoreRing` for real-time CRI monitoring, `SkillRadar` for multi-axial readiness breakdown, expandable milestone checklist, and daily AI micro-learning missions.
   - **Universal Layout Consistency:** Reusable `PortalLayout` providing responsive sidebar navigation, breadcrumb navigation, role badges, user avatar, and one-click evaluator portal switcher.

2. **Universal Admin Portal, Platform Governance & Extended AI Capabilities (Part G)**:
   - **Admin Platform Governance & User Directorate (`/admin/dashboard`, `/admin/users`):** Central command console aggregating real operational telemetry (total users, active students, institutions, employers, active opportunities, assessment pass rate, and AI latency). Granular user management supporting role changes, status updates (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`, `PENDING_DELETION`), and DPDP Right to be Forgotten account erasure with full administrative provenance logs.
   - **Trust & Safety Verification Directorate (`/admin/verifications`):** Human-in-the-loop review queue for Educational Institutions (AISHE/CBSE verification) and Corporate Employers (MCA CIN, GSTIN, and business incorporation checks) with mandatory reviewer audit notes and real-time organization status synchronization.
   - **Universal Platform CMS & Taxonomy Engine (`/admin/cms`):** Multi-stream content authoring across all 13 educational domains supporting career catalogues, entrance examinations, scholarships, assessment question banks, and statutory platform policies with automated version control.
   - **AI Governance, Safety & Telemetry Monitor (`/admin/ai-governance`):** Real-time monitoring of Gemini 1.5 Pro latency (P95), token usage, request volume, prompt versions, and deterministic offline fallbacks. Strict curated career information disclaimers and absolute prohibition of algorithmic rejection or biometric scoring.
   - **Student Learning Academy (`/student/academy`):** Curated multi-stream educational repository featuring courses, video masterclasses, and documentation with real-time progress tracking.
   - **Resume Studio with Digital Skill Passport Badges (`/student/resume`):** Professional ATS-friendly resume builder with auto-populated verified skills, 3 professional styling templates (`CLASSIC_IVY`, `MODERN_CLEAN`, `MINIMAL_EXECUTIVE`), and clean browser print/PDF export styling.
   - **Mock Interview Practice Lab (`/student/interview-lab`):** Career-specific question bank across technical and behavioral domains with structured STAR rubric evaluation, instant constructive feedback, and ethical AI guarantees (zero facial or biometric emotion analysis).
   - **Student Portfolio (`/student/portfolio`):** Public/private verifiable portfolio showcasing cryptographically anchored credentials, project artifacts, and DPDP privacy protections.
   - **Career What-If Simulator (`/student/simulator`):** Interactive sandbox simulating the impact of hypothetical skill acquisitions, assessment completions, and roadmap milestones on student CRI and skill gap scores with explicit statutory disclaimers.
   - **Industry Demand Intelligence & Role-Aware Global Search (`/api/analytics/industry-demand`, `/api/search`):** 13-stream market intelligence connecting employer job requirements with emerging skills, and role-aware global search shielding minors from commercial recruitment.

1. **Two-Way Explainable AI Talent Matching, Candidate Discovery & Industry Challenge Hub (Part F2)**:
   - **Two-Way Explainable Talent Matching (`/employer/matching`):** Bidirectional compatibility matching for both student-to-jobs and job-to-candidates. Computes deterministic scores across 5 dimensions: Verified Skills (35%), Proficiency Depth (25%), Project Evidence (15%), Assessment Benchmarks (15%), and Preferred Skills (10%) with configurable dynamic weight sliders, multi-stream skill synonym dictionary, separate statutory qualification checks (`SATISFIED`, `PROVISIONAL`, `UNMET`), and plain-language justification rationales.
   - **Algorithmic Fairness & Invariance:** Mathematical invariance guaranteed with respect to protected characteristics (gender, religion, caste, ethnicity, state, appearance). Candidate scores are strictly identical regardless of demographic metadata.
   - **Candidate Discovery (`/employer/discovery`):** Search opted-in adult talent by stream, minimum CRI score, verified skills, and academic stage. Verified employer gating (`verificationStatus === "VERIFIED"`) enforced.
   - **Under-18 Child Safeguards (DPDP Act 2023):** Minors (<18 or Class 8–10) are strictly shielded from commercial recruitment discovery, job applications, recruitment export, and employer candidate matching.
   - **Digital Skill Passport Verification (`/employer/passport-verify`):** Real-time cryptographic validation using HMAC-SHA256 digital signatures and SHA-256 evidence hashing. Supports public share tokens, QR code payloads, and direct credential verification with tamper detection and audit trail logging.
   - **Interview Management Hub (`/employer/interviews`):** Structured scheduling for Technical, HR Fit, Case Study, and Final rounds. Structured 1–5 competency rubric scoring (Technical, Domain, Problem Solving, Communication) with hiring recommendations (`STRONG_YES`, `YES`, `NEUTRAL`, `NO`) and bi-directional ATS pipeline synchronization.
   - **Industry Challenge Hub (`/employer/challenges`, `/student/challenges`):** Multi-stream practical project challenges, clinical case reviews, and legal drafting challenges. On employer approval, automatically mints verified `SkillEvidence` with SHA-256 hashes and awards authentic cryptographic credentials to the student's Digital Skill Passport!
   - **Unified Intelligence Loop:** Complete 8-stage closed loop verified end-to-end from employer skill demand through institutional alignment, student roadmap learning, assessment, challenge deliverable, credential minting, talent matching, structured interview, to ATS hire!

2. **Universal Employer Portal, Opportunity Builder & Applicant Tracking System (Part F1)**:
   - Comprehensive multi-tenant employer console (`/employer/dashboard`) with telemetry KPIs, active posting performance, and applicant funnel conversion tracking.
   - Company Trust & Safety Verification Gate (`/employer/verification`) requiring official MCA CIN, GSTIN, and business incorporation proof with mandatory human compliance review before publishing live postings.
   - Skills-First Opportunity Builder (`/employer/opportunities/new`) across all 13 educational domains with structured mandatory vs preferred competencies, proficiency levels, acceptable evidence modes, and transparent compensation disclosure.
   - Applicant Tracking System (ATS) Table (`/employer/applications`) featuring explainable candidate match breakdowns (Stream 25%, Stage 25%, Verified Competencies 50%), verified digital passport evidence, recruiter notes, and human-in-the-loop hiring mandates.
   - Interactive Kanban Recruitment Pipeline (`/employer/pipeline`) with accessible stage transitions (`APPLIED` $\to$ `UNDER_REVIEW` $\to$ `SHORTLISTED` $\to$ `INTERVIEW` $\to$ `OFFER` $\to$ `HIRED`).
   - Campus Recruitment & Institutional Partnerships (`/employer/campus`) coordinating placement drives directly with partner universities and colleges.
   - Recruitment Intelligence & Funnel Analytics (`/employer/analytics`) aggregating conversion percentages, review times, and stream volume.
   - Multi-Role Team Management (`/employer/team`) with granular RBAC (`ORGANIZATION_ADMIN`, `RECRUITER`, `HIRING_MANAGER`).
   - Strict DPDP Act (2023) Under-18 Safeguards shielding minor students (<18 or Class 8–10) from commercial recruitment discovery and job applications.
   - Student Opportunity Discovery (`/student/opportunities`) enabling adult learners to explore verified postings and submit applications with affirmative consent.

2. **Advanced Institution Intelligence & Analytics (Part E2)**:
   - Multi-Stream Cohort Skill Analytics Heatmap (`/institution/analytics`) with verified vs self-reported breakdown, benchmark gap alerts, and accessible color matrix.
   - Grounded Industry Demand Intelligence (`/institution/industry-demand`) backed by statutory council benchmarks (NASSCOM, HSSC, BCI, NSDC, ASCI, MESC).
   - Proactive Student Intervention System (`/institution/interventions`) with transparent rule-based triggers (`INCOMPLETE_ONBOARDING`, `NO_ASSESSMENT_ATTEMPTS`, `LOW_READINESS_SCORE`, `CRITICAL_SKILL_GAP`), 14-day review SLA, and non-punitive educational framing.
   - Smart Training Management (`/institution/training`) featuring adaptive workshop proposals derived from cohort gaps and automatic verified `SkillEvidence` minting on completion (attendance $\ge$ 75%).
   - Standardized Institutional Assessment Scheduling (`/institution/assessments`) across all 13 educational categories.
   - Campus Placement Coordination (`/institution/placements`) with explainable eligibility engine, application tracking, interview scheduling, offer recording, and strict DPDP Act (2023) under-18 minor protection.
   - Institutional Outcome Reports (`/institution/reports`) covering NAAC Criterion II/V, NIRF Metrics, and NBA OBE Attainment with mandatory statutory regulatory disclaimers and CWE-1236 sanitized CSV exports.

2. **Universal Institution Portal, Faculty & Student Directory (Part E1)**:
   - Multi-tenant architecture strictly isolated by `institutionId` across all entities.
   - 4-Tier Academic Hierarchy: Departments $\to$ Programs $\to$ Academic Sessions $\to$ Classes/Batches.
   - Student Roster & Onboarding (`/institution/students`) with single enrollment, unique 8-character campus join codes, and automated DPDP under-18 minor detection.
   - Bulk Student CSV Import (`/institution/students/import`) with formula injection sanitization (CWE-1236), 500-row limit, duplicate detection, and batch enrollment.
   - Faculty & Academic Staff Management (`/institution/faculty`) with least-privilege RBAC and 7-day expiring secure invite tokens.
   - Real Database/Store Telemetry Dashboard (`/institution/dashboard`).

3. **Intelligent Skill Gap Analyzer (Part D2)**:
   - Multi-dimensional, deterministic diagnostic engine comparing student profile against published statutory council & industry competency benchmarks (`/student/skill-gaps`).
   - Equal coverage across all 13 educational streams with documented benchmarks in `src/data/careerRequirementsData.ts`.
   - Explainable scoring formula computing weighted overall coverage, mandatory competency coverage, and evidence quality score.
   - Priority development action planner with estimated completion timelines and direct links to corresponding assessments.

2. **Digital Skill Passport & Cryptographic Credentials (Part D2)**:
   - Evidence-based student credential passbook (`/student/passport`) aggregating educational journey, verified competencies, and signed credentials.
   - Distinct evidence layers: `PLATFORM_ASSESSED`, `SELF_REPORTED`, `HUMAN_REVIEWED`, `EXTERNAL`.
   - Dual-layer cryptographic security: HMAC-SHA256 digital signatures and SHA-256 verification hashes for tamper detection.
   - Expiring, revocable share links and QR gateway (`/verify/[token]`) with audit logging.
   - Strict server-side DPDP Act 2023 under-18 privacy lock preventing minor portfolio sharing.

3. **Universal AI Career Mentor (Part D1)**:
   - Personalized, trilingual (English, Hindi, Hinglish) conversational AI guidance (`/student/mentor`).
   - Equal parity across all 13 streams; grounded directly in the student's Career Digital Twin, CRI breakdown, active roadmap milestones, and verified skills.
   - Powered by Gemini 2.0 Flash (`gemini-2.0-flash`) with strict 8-second SLA, bounded retry, and deterministic curated knowledge fallback.
   - Action proposal generator recommending milestone adjustments or skill assessments with a student confirmation review modal.

2. **Intelligent Skill Assessment Engine (Part D1)**:
   - Stage-adaptive, stream-aware question banks across all 13 educational streams (`/student/assessments`).
   - Distraction-free test environment with countdown timer and question navigator (`/student/assessments/[id]`).
   - Objective auto-scoring and rubric evaluation with detailed explanations (`/student/assessments/results/[attemptId]`).
   - Mints tamper-evident `SkillEvidence` records with SHA-256 verification hashes upon passing (60%–70%).
   - Direct integration with Career Digital Twin and Career Readiness Index (CRI) Dimension 3 (Skill Development).
   - Non-punitive growth-mindset feedback on non-passing attempts.

3. **Smart Student Dashboard & Career Digital Twin (Part C)**:
   - Live PostgreSQL command center (`/student/dashboard`) with real database binding, streak mechanics, and task updates.
   - Interactive Career Digital Twin (`/student/digital-twin`) providing multi-dimensional capability modeling, aspirational horizons, verified vs self-reported skills, and learning velocity.
   - Strict DPDP Act (2023) privacy compliance preventing recruiter discovery of minors (< 18 years).

2. **Career Readiness Index (CRI) Engine (Part C)**:
   - Transparent 5-dimension evaluation: Career Knowledge (20%), Educational Preparation (25%), Skill Development (25%), Practical Learning (15%), Milestone Progress (15%).
   - Zero-faked readiness: outputs `UNASSESSED` or `INSUFFICIENT_EVIDENCE` for new profiles instead of invented scores.
   - Self-reported skill discounting pending proctored verification.

3. **Adaptive Career Roadmap Engine (Part C)**:
   - Dynamic 12-week modular roadmaps across all 13 educational streams.
   - Interactive milestone checklist with live database sync (`PATCH /api/student/roadmap/activity`).
   - Dynamic pathway regeneration and version history tracking.

4. **Daily AI Missions Engine (Part C)**:
   - Micro-learning activities (10–30 min) across Discovery, Skill Challenge, Industry Insight, and Practical Action.
   - Non-punitive skip protocol and qualitative reflection modal with ratings.

5. **Universal 13-Stream Taxonomy**:
   - Medical (PCB)
   - STEM (PCM)
   - Commerce & Business
   - Arts & Humanities
   - Law & Legal Studies
   - Management & Leadership
   - Creative Arts & Design
   - Agriculture & Allied Sciences
   - Vocational Education & Trades
   - Sports & Physical Education
   - Hospitality & Tourism
   - Interdisciplinary Fields
   - Undecided / Career Exploratory

2. **Universal Career Knowledge Database (Part B)**:
   - Configurable taxonomy: Stage $\to$ Stream $\to$ Domain $\to$ SubDomain $\to$ CareerPath $\to$ Qualifications $\to$ EntranceExams $\to$ Skills $\to$ LearningPathways $\to$ Opportunities.
   - Authoritative Indian statutory councils integrated: NMC, DCI, PCI, AICTE, ICAI, UPSC, BCI, NID, ICAR, NCVT, SAI, NCHMCT, CSIR, UGC.
   - Multi-tier compensation curves (Entry 0-2 yrs, Median 5-8 yrs, Senior 10+ yrs) in INR with explicit source attribution (NASSCOM, ICAI, 7th CPC, Industry Reports).
   - Dedicated Career Explorer (`/careers`) and Career Detail pages (`/careers/[slug]`) with interactive timeline, benchmark skills, and eligibility checker.

3. **3-Layer Hybrid AI Architecture (Part B)**:
   - **Layer 1: Ground Truth Database** (PostgreSQL + Prisma ORM).
   - **Layer 2: Deterministic Heuristic Engine** (Transparent 5-factor scoring formula: Interests 30%, Stream 20%, Skills 20%, Goals 20%, Preferences 10%).
   - **Layer 3: Generative AI Reasoning** (Google Gemini 2.0 Flash via official `@google/generative-ai` SDK with Zod schema validation, 8s timeout, bounded retries, and telemetry).
   - **Trilingual Guidance**: Full support for English, Hindi, and Hinglish.
   - **Transparent Fallback**: Fully functional offline deterministic recommendation mode when `GEMINI_API_KEY` is not set.

4. **Intelligent Stream Selection Assistant (`/stream-selector`)**:
   - 6-step interactive diagnostic evaluation designed for Class 8-12, undecided students, and adult career switchers.
   - Aligned with the National Education Policy (NEP 2020) multi-disciplinary vision.
   - Unvarnished trade-off analysis (benefits vs academic realities/rigors).
   - Multidisciplinary alternative bridge pathways with concrete transition advice.

5. **Side-by-Side Career Comparison Matrix (`/compare`)**:
   - Dynamic comparison matrix supporting up to 4 careers simultaneously.
   - URL state synchronization (`?slugs=...`), search modal, and quick presets.
   - Evaluates academic prerequisites, entrance exams, training duration, salary curves, automation risk, and statutory licensing requirements.

6. **Educational Eligibility Checker (`/api/careers/eligibility`)**:
   - Prerequisite validator evaluating student stage, subjects, and age against official statutory regulations.
   - Explicit disclaimers preventing false guarantees of university admission or job placement.

7. **Secure Authentication & RBAC (Part A)**:
   - Node.js native `crypto.scrypt` password hashing ($N=16384, r=8, p=1$).
   - Sliding-window brute-force rate limiter.
   - DPDP Act 2023 Minor Protection: permanent exclusion of school minors from recruiter discovery.
   - 7-step onboarding wizard (`/onboarding`) with draft persistence.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14.2 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript 5.7 (Strict Mode enabled)
- **Database & ORM**: PostgreSQL via Prisma ORM 5.22
- **AI / LLM**: Google Gemini 2.0 Flash (`@google/generative-ai` ^0.24.1) with Zod validation
- **Styling**: Tailwind CSS 3.4 with custom KAABIL design tokens
- **Testing**: Vitest 2.1 (51 automated tests passing)

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Generate Prisma client & validate schema
npx prisma generate

# 4. Run automated test suites
npm test

# 5. Start development server
npm run dev

# 6. Build for production
npm run build
```

---

## 🧪 Test Verification & Quality Assurance

All 8 test suites pass with 100% success rate:
- `src/__tests__/recommendation.test.ts` (6 tests)
- `src/__tests__/eligibility.test.ts` (5 tests)
- `src/__tests__/career-explorer.test.ts` (4 tests)
- `src/__tests__/stream-selector.test.ts` (3 tests)
- `src/__tests__/engine.test.ts` (8 tests)
- `src/__tests__/onboarding.test.ts` (6 tests)
- `src/__tests__/database.test.ts` (9 tests)
- `src/__tests__/auth.test.ts` (10 tests)
