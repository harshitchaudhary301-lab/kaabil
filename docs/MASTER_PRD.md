# MASTER_PRD.md — Product Requirements Document (PRD)

## Project: KAABIL (काबिल)
**Version:** 1.0.0-PROD  
**Status:** Architecture & Specification Approved  
**Author:** Harshit Chaudhary & Lead Architecture Team  
**Category:** AI-Powered Universal Career, Education, Skill Development, and Employment Ecosystem  
**Target Market:** India (Nationwide: Tier-1, Tier-2, Tier-3, and Rural Reach)  

---

## 1. Executive Summary & Brand Identity

### 1.1 The Problem
In India, career decision-making and employability are fundamentally broken by hyper-fragmentation and extreme engineering/tech bias. Over 85% of existing edtech and career platforms focus almost exclusively on software engineering and digital tech roles, leaving millions of students in Medical, Commerce, Humanities, Law, Design, Agriculture, and Vocational trades without structured guidance. Furthermore, career guidance is disconnected from skill acquisition, skill acquisition is disconnected from credible verification, and recruitment remains reliant on inflated resumes and arbitrary filters rather than demonstrable competencies.

### 1.2 The Solution
**KAABIL** is an end-to-end, unified SaaS ecosystem connecting **Students**, **Educational Institutions**, and **Verified Employers** on a shared foundation of transparent, verified skills and data-driven career pathways. It guides learners from Class 8 through school, higher education, vocational training, and professional life.

- **Product Name**: KAABIL (काबिल)
- **Tagline**: *Discover Your Skills. Define Your Future.*
- **Brand Message**: *Every Stream. Every Skill. Every Future.*
- **Core Mission**: Democratize personalized career clarity, skill acceleration, and merit-based opportunity access for every student in India across every educational stream.

---

## 2. Target Audience & Universal Stream Coverage

KAABIL is built with a non-negotiable architectural requirement: **It must NEVER be limited to engineering or tech students.**

### 2.1 Learner Segments (Class 8 to Professional Life)
1. **Middle & Secondary School (Classes 8–10)**: Exploratory career awareness, aptitude profiling, subject-interest mapping, and stream selection (PCB, PCM, Commerce, Arts, Vocational).
2. **Senior Secondary Students (Classes 11–12)**: Stream-aligned entrance exam preparation, university/college discovery, eligibility validation, and foundation competency building.
3. **Diploma & ITI Students**: Vocational trade mastery, practical skill verification, apprenticeship readiness, and industry alignment.
4. **Undergraduate Students (UG)**: BA, B.Sc, B.Com, B.Tech, BBA, LLB, MBBS, B.Des, B.Sc Agri, etc. Academic-to-career gap analysis, internships, and skill passports.
5. **Postgraduate Students (PG)**: Specialization refinement, research-to-industry pathways, advanced certification, and direct placement.
6. **Graduates & Working Professionals**: Career transitions, upskilling, leadership trajectories, and continuous skill verification.
7. **Undecided Learners**: Diagnostic discovery pathways to identify latent strengths and career opportunities without social bias.

### 2.2 Comprehensive Educational Streams Supported
| Stream | Domains Covered | Example Roles & Pathways |
| :--- | :--- | :--- |
| **Medical & Healthcare (PCB)** | Medicine, Dentistry, AYUSH, Nursing, Allied Health, Pharmacy, Biotech | MBBS Doctor, Clinical Pharmacist, Radiologist, Physiotherapist, Medical Lab Scientist |
| **Non-Medical / STEM (PCM)** | Pure Sciences, Maths, Stats, Architecture, Civil/Mech/Elec/Chem/Aerospace, Aviation | Data Scientist, Research Physicist, Architect, Commercial Pilot, Structural Engineer |
| **Commerce & Finance** | Accountancy, Banking, Taxation, Audit, Financial Markets, Actuarial | Chartered Accountant (CA), Investment Banker, Actuary, Auditor, Tax Consultant |
| **Arts & Humanities** | Public Policy, Civil Services, Psychology, Journalism, Literature, History | IAS/IPS Officer, Clinical Psychologist, Policy Analyst, Investigative Journalist, Content Strategist |
| **Law & Legal Studies** | Corporate Law, Litigation, Judiciary, IPR, Cyber Law, Human Rights | Corporate Counsel, High Court Litigator, Cyber Law Specialist, Legal Researcher |
| **Management & Business** | General Management, HR, Operations, Marketing, Entrepreneurship | Product Manager, Brand Strategist, Supply Chain Director, Talent Acquisition Lead |
| **Creative Arts & Design** | Fashion, Industrial Design, Graphic/UX, Animation, VFX, Film, Fine Arts | UI/UX Designer, VFX Artist, Fashion Director, Industrial Designer, Creative Producer |
| **Agriculture & Food Tech** | Agronomy, Horticulture, Dairy Technology, Food Processing, Agri-Business | Agri-Tech Specialist, Food Safety Inspector, Soil Scientist, Dairy Plant Manager |
| **Vocational & Trades** | ITI Trades (Electrician, Fitter, Welder, CNC), Green Energy, HVAC | Solar Installation Engineer, CNC Machinist, Industrial Automation Tech, Mechatronics Tech |
| **Sports & Physical Ed** | Sports Management, Coaching, Sports Nutrition, Physiotherapy, Analytics | Performance Analyst, Sports Physiotherapist, Athletic Trainer, Sports Event Manager |
| **Hospitality & Culinary** | Hotel Operations, Culinary Arts, Beverage Management, Travel & Tourism | Executive Chef, F&B Manager, Luxury Resort General Manager, Travel Experience Curator |
| **Interdisciplinary** | Bio-informatics, Cognitive Science, Environmental Policy, Urban Tech | Bioinformatician, Climate Policy Advisor, Smart City Urban Planner |

---

## 3. The KAABIL Intelligence Loop

The foundational architectural innovation of KAABIL is the **closed-loop feedback workflow**:

```
[Industry Demand & Job Market Trends]
             │
             ▼
[Dynamic Career Requirements & Competency Benchmarks]
             │
             ▼
[Deterministic Skill Gap Analysis (Current vs. Required)]
             │
             ▼
[Personalized Adaptive Learning & Weekly Milestones]
             │
             ▼
[Skill Verification & Digital Skill Passport Credentialing]
             │
             ▼
[Explainable Opportunity Matching (Jobs, Internships, Projects)]
             │
             ▼
[Employer Hiring Feedback & Performance Signals]
             │
             ▼
[Continuous System Improvement & Curriculum Calibration]
```

### Critical Safeguards:
1. **School Student Isolation**: For Class 8–12 students, the loop operates strictly for **Career Discovery, Educational Pathways, and Foundation Learning**. Minors are never entered into recruiter candidate pools, cannot receive direct messages from employers, and have private profiles by default.
2. **Explainable AI Only**: All recommendations, readiness indexes, and match scores provide an auditable evidence breakdown.
3. **No Automatic Rejections**: AI scores are designed to guide development and highlight strengths, **never** to act as opaque barriers or automated hiring rejections.
4. **No Guarantees of Employment**: All readiness metrics reflect developmental progress against published benchmarks, not contractual placement guarantees.

---

## 4. Multi-Portal Architecture & Detailed Module Specifications

KAABIL consists of four deeply integrated portals served by a single unified modular monolith backend and database.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KAABIL UNIFIED PLATFORM                         │
├───────────────┬───────────────────┬───────────────────┬────────────────┤
│  STUDENT      │   INSTITUTION     │    EMPLOYER       │     ADMIN      │
│  PORTAL       │     PORTAL        │     PORTAL        │     PORTAL     │
│ (28 Modules)  │  (13 Modules)     │  (13 Modules)     │  (15 Modules)  │
├───────────────┴───────────────────┴───────────────────┴────────────────┤
│       SHARED BACKEND SERVICES & MODULAR AI INTELLIGENCE ENGINES        │
│  Career • Skill Graph • Digital Twin • Readiness • Talent Matching     │
├────────────────────────────────────────────────────────────────────────┤
│     DATABASE LAYER: Multi-Tenant PostgreSQL (Prisma ORM) & Redis       │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4.1 Student Portal (28 Modules)

1. **Personalized Dashboard**: Holistic command center showing current stream progress, Career Digital Twin status, weekly streaks, upcoming deadlines, and top recommended actions.
2. **Intelligent Onboarding**: Multi-step, age-aware questionnaire capturing education stage, current stream/interests, geographic preferences, career aspirations, and language preference.
3. **AI Career Mentor**: Conversational AI assistant supporting English, Hindi (हिन्दी), and Hinglish with contextual memory of the student's profile and progress.
4. **Stream Selection Assistant**: For Classes 8–10; uses multi-dimensional diagnostic assessments to recommend optimal streams (PCB, PCM, Commerce, Arts, Vocational) with transparent rationale.
5. **Career Discovery Engine**: Interactive explorer covering 500+ careers across all 12+ streams, with daily routines, salary realities in India, growth trajectories, and required skills.
6. **Career Comparison**: Side-by-side comparative analysis of up to 3 careers (educational investment, time to break-even, day-in-the-life, automation risk, regulatory barriers).
7. **Interest and Aptitude Assessments**: Validated psychometric instruments (Holland RIASEC, Gardner Multiple Intelligences, Big Five, Numerical/Verbal/Spatial aptitude).
8. **Career Digital Twin**: Dynamic algorithmic representation of the student’s evolving capabilities, simulating readiness across multiple alternative future careers.
9. **AI Skill Genome**: Visual competency map categorizing technical, domain-specific, interpersonal, and analytical competencies with verified proficiency levels.
10. **Career Readiness Index (CRI)**: Deterministic 0–100 score calculating benchmark alignment for a chosen career path based on verified skills, projects, and coursework.
11. **Skill Gap Analyzer**: High-contrast, interactive comparison of the student’s current profile against verified industry benchmarks, highlighting high-priority gaps.
12. **Skill Verification**: Objective skill checkpoint system featuring timed MCQ evaluations, code/work sample submissions, and peer/mentor validations.
13. **Dynamic Career Roadmap**: Chronological step-by-step pathway from current status to career entry, dynamically adjusting when milestones are achieved or delayed.
14. **Personalized Weekly Action Plan**: Micro-actions for the current week (3–5 achievable tasks) preventing overwhelm and fostering consistent progress.
15. **Learning Academy**: Curated free and open-source learning resources (NPTEL, SWAYAM, Khan Academy, MIT OCW, Coursera/YouTube open courses) indexed by skill.
16. **Daily AI Missions**: 5-minute bite-sized daily challenges reinforcing career concepts, industry trivia, and problem-solving habits with streak mechanics.
17. **Entrance Exam Hub**: Comprehensive database of Indian entrance examinations (NEET, JEE, CUET, CLAT, CAT, NDA, NATA, NIFT, GATE, UPSC) with syllabus, dates, and eligibility rules.
18. **College and Course Explorer**: NIRF ratings, government accreditation (NAAC, NBA), real fee structures, cutoffs, and verified placement statistics.
19. **Scholarship Finder**: Eligibility matcher for National Scholarship Portal (NSP), state government schemes, and corporate scholarships (e.g., Reliance Foundation, Tata Trusts).
20. **Career Eligibility Checker**: Strict deterministic validator verifying regulatory criteria (e.g., minimum 12th PCB percentage for NEET, age limits for NDA/UPSC, bar council norms).
21. **Career What-If Simulator**: Interactive scenario planner ("What if I switch from PCM to Commerce?", "What if I pursue an MBA after B.Sc Biotech?").
22. **Project Challenge Hub**: Real-world capstone briefs submitted by industry partners allowing students to gain hands-on portfolio proof.
23. **Digital Skill Passport**: Cryptographically verifiable, tamper-evident digital credential summarizing verified skills, scores, and milestones for employers.
24. **Resume Studio**: AI-assisted, ATS-optimized resume builder that formats verified skills and achievements into industry-standard layouts without exaggeration.
25. **Interview Lab**: Interactive AI mock interview environment providing real-time voice/text feedback on technical accuracy, clarity, and communication structure.
26. **Human Mentorship**: Verified connection hub for 1-on-1 sessions with senior college students, verified alumni, and working industry professionals.
27. **Jobs and Internships**: Verified opportunity board for students aged 18+ featuring internships, apprenticeships, and entry-level positions matched by verified skills.
28. **Application Tracker**: Kanban tracking system monitoring submitted applications, interview stages, offer letters, and feedback.
29. **Portfolio and Achievements**: Showcase space for artifacts, research papers, design portfolios, GitHub repositories, and verified certificates.
30. **Privacy and Account Settings**: Granular student privacy controls, DPDP-compliant data export, account deletion, and guardian linkage for minors.

---

### 4.2 Institution Portal (13 Modules)

1. **Institution Dashboard**: Executive overview of student enrollment, stream distributions, aggregate skill readiness, and placement progress.
2. **Student Management**: Directory of enrolled students with bulk CSV/Excel onboarding, individual profile inspection, and academic history tracking.
3. **Department Management**: Configuration of schools, faculties, departments, and specific degree programs.
4. **Faculty Management**: Assignment of faculty mentors, department heads, and placement officers with role-based permissions.
5. **Skill Analytics**: Macro-level heatmaps revealing skill proficiencies and curricular gaps across cohorts, batches, and degree specializations.
6. **Assessment Management**: Creation and scheduling of internal skill evaluations, diagnostic quizzes, and semester readiness benchmarks.
7. **Industry Intelligence**: Live feed of hiring demands, emerging skill requirements, and regional employment trends relevant to the institution's offerings.
8. **Smart Student Intervention**: Automated alerts flagging at-risk students who are falling behind on roadmap milestones or exhibiting low engagement.
9. **Training Management**: Organization of upskilling bootcamps, guest lectures, and corporate training programs mapped directly to identified cohort skill gaps.
10. **Placement Management**: Campus recruitment drive coordinator, recruiter invitation management, interview scheduling, and offer letter tracking.
11. **Reports and Analytics**: Exportable accreditation-ready reports (NAAC, NIRF, NBA criteria) documenting student progression, skill benchmarks, and outcomes.
12. **Announcements**: Multi-channel broadcast system (email, in-app notifications) for campus drives, academic deadlines, and workshops.
13. **Institution Settings**: Organization branding, domain verification, SSO integration, and API access configurations.

---

### 4.3 Employer Portal (13 Modules)

1. **Recruitment Dashboard**: Real-time snapshot of active job postings, applicant pipelines, verified talent matches, and scheduled interviews.
2. **Job Management**: Structured vacancy creation requiring explicit skill requirements, proficiency thresholds, and education criteria across any industry.
3. **Candidate Discovery**: Reverse search engine querying talent based on verified Digital Skill Passports, practical challenge scores, and stream qualifications.
4. **Explainable AI Talent Matching**: High-precision matching algorithm scoring applicants against job criteria with a transparent breakdown of match factors.
5. **Candidate Comparison**: Side-by-side evaluation of up to 4 candidates comparing verified competencies, challenge performance, and academic pedigree.
6. **Digital Skill Passport Verification**: Instant cryptographic verification of a candidate's claimed skills, test dates, and performance records.
7. **Industry Challenges**: Creation of practical work assessments that candidates complete to automatically demonstrate job readiness.
8. **Application Management**: Applicant tracking system (ATS) with customizable pipeline stages (Applied, Screened, Challenge, Interview, Offer, Hired).
9. **Interview Management**: Integrated interview scheduling with calendar sync, question rubrics, and interviewer scorecards.
10. **Recruitment Pipeline**: Visual Kanban board managing applicants through all hiring phases with automated status update triggers.
11. **Hiring Feedback**: Structured feedback submission interface enabling recruiters to provide actionable gap information to rejected candidates.
12. **Recruitment Analytics**: Time-to-hire, source quality, diversity metrics, offer acceptance rates, and skill-match correlation analytics.
13. **Organization Profile**: Public employer profile showcasing company culture, verified industry badges, open opportunities, and campus initiatives.

---

### 4.4 Admin Portal (15 Modules)

1. **Platform Dashboard**: High-level platform health metrics (daily active users, total institutions, verified employers, active roadmaps, AI token utilization).
2. **User Management**: Unified search, audit, role reassignment, and suspension controls across all platform user accounts.
3. **Institution Verification**: Due-diligence workflow for validating official school, college, and university credentials (UGC, AICTE, AISHE codes).
4. **Employer Verification**: Verification workflow validating corporate registration (CIN, GSTIN, official domain, LinkedIn presence) to eliminate fraudulent job postings.
5. **Career Database Management (CMS)**: Visual taxonomy manager to add, edit, or archive streams, career paths, job roles, and required skill trees without code changes.
6. **Content Management**: Curation of learning materials, exam dates, scholarship opportunities, and curated platform announcements.
7. **Assessment Bank**: Central repository of validated psychometric, technical, and domain-specific questions with difficulty calibration and item response tracking.
8. **Job Moderation**: Quality assurance queue reviewing posted vacancies for misleading compensation, predatory clauses, or inappropriate criteria.
9. **AI Monitoring**: Real-time observability dashboard tracking Gemini API latency, error rates, prompt safety classifications, token expenditures, and user satisfaction ratings.
10. **Platform Analytics**: Macro-economic trends, geographical penetration (Tier-1 vs. Tier-3), stream preference distribution, and platform retention curves.
11. **Support Tickets**: Integrated helpdesk for resolving user disputes, verification inquiries, technical bug reports, and data privacy requests.
12. **Audit Logs**: Immutable system-wide audit trail recording critical actions (role changes, credential verification, profile exports, data deletions).
13. **Security Management**: Active session monitoring, IP rate-limit blocks, suspicious activity alerts, and credential rotation controls.
14. **Subscription Management**: Billing and tier management for premium institutional licenses and corporate recruiting subscriptions.
15. **System Settings**: Global feature flags, maintenance mode controls, backup configuration, and API integration settings.

---

## 5. Non-Functional Requirements & Architecture Guarantees

| Requirement | Target Standard |
| :--- | :--- |
| **Response Latency** | $<200\text{ms}$ for standard database reads; $<1.5\text{s}$ for streaming AI responses. |
| **Availability** | 99.9% uptime design target. |
| **Mobile Responsiveness** | Flawless mobile-first UX across all phone screen sizes (360px to 4K desktop). |
| **Data Protection** | India Digital Personal Data Protection Act (DPDP Act 2023) compliant. |
| **Accessibility** | WCAG 2.1 Level AA compliance, keyboard navigation, and reduced-motion support. |
| **Internationalization** | Trilingual AI Mentor (English, Hindi, Hinglish); localized Indian currency and educational terminology. |
