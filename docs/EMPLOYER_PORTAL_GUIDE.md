# KAABIL (काबिल) — Universal Employer Portal User & Architectural Guide

**Platform:** KAABIL (काबिल) — Career Development, Skills Intelligence & Employment SaaS  
**Tagline:** Discover Your Skills. Define Your Future.  
**Core Principle:** Every Stream. Every Skill. Every Future.  
**Scope:** Universal Multi-Stream Recruitment across All 13 Educational Categories in India  
**Legal Framework:** DPDP Act 2023, Sections 9 & 11; Equal Opportunity & Fair Labor Practices

---

## 1. Architectural Architecture & Portal Overview

The KAABIL Universal Employer Portal empowers forward-looking enterprises, MSMEs, hospital networks, legal firms, research centers, and manufacturing giants across India to transition from pedigree-biased hiring to **skills-first competency recruitment**.

### Core Tenets:
1. **Universal Multi-Stream Support:** Never confined to software/IT roles. Natively powers recruitment across Medicine (PCB), Engineering (PCM), Commerce & Banking, Law, Creative Arts & Design, Agriculture, Vocational Trades & Crafts, Sports, Hospitality, and Interdisciplinary science.
2. **Strict Trust & Safety Verification Gate:** Only verified employers (cross-checked against MCA CIN and GSTIN databases with human compliance review) can publish live recruitment listings to students.
3. **Child Safeguard (DPDP Act 2023):** Minor student accounts (<18 years or Class 8–10 learners) are strictly shielded from employer candidate discovery, job applications, recruitment export, and employer APIs.
4. **Human Review Mandate:** Algorithmic match scores and Career Readiness Indexes (CRI) are advisory signals only. Automatic rejections based solely on AI or CRI are strictly forbidden.

---

## 2. Navigation & Interface Architecture

| Route | View Name | Primary Functionality |
| :--- | :--- | :--- |
| `/employer/dashboard` | Executive Overview | Recruitment KPI command center, verification status, active postings, candidate conversion funnel. |
| `/employer/verification` | Trust & Safety | MCA/GSTIN document submission, compliance audit status, human review tracking. |
| `/employer/opportunities` | Manage Postings | Table view of all draft, published, paused, and archived roles with quick stats. |
| `/employer/opportunities/new` | Skills-First Builder | Multi-stream competency requirement authoring, proficiency benchmarks, and transparent compensation disclosure. |
| `/employer/applications` | ATS Candidate Table | Filterable candidate applications with explainable match breakdowns, verified skills, and recruiter notes. |
| `/employer/pipeline` | Interactive Kanban | Visual recruitment funnel (`APPLIED` $\to$ `UNDER_REVIEW` $\to$ `SHORTLISTED` $\to$ `INTERVIEW` $\to$ `OFFER` $\to$ `HIRED`). |
| `/employer/campus` | Campus Recruitment | Institutional partnership coordination, placement drive proposals, and student opt-in management. |
| `/employer/analytics` | Intelligence & Funnel | Descriptive metrics on conversion rates, stream distribution, and time-to-hire. |
| `/employer/team` | Staff Management | Multi-role RBAC management (`ORGANIZATION_ADMIN`, `RECRUITER`, `HIRING_MANAGER`). |
| `/employer/notifications` | Activity Feed | Timestamped alerts on candidate applications, pipeline changes, and verification updates. |
| `/employer/settings` | Organization Profile | Entity name, industry, registration numbers, supported streams, and corporate bio. |
| `/student/opportunities` | Student Discovery | Consensual job and internship discovery for adult students with DPDP authorization. |

---

## 3. Universal Stream Competency Modeling

KAABIL enables recruiters to construct competency benchmarks tailored to their specific industry:
- **Medicine & Healthcare (PCB):** Clinical diagnostics, pathology specimen handling, patient triage, biomedical safety.
- **Engineering & Technology (PCM):** Full-stack web architecture, embedded robotics, PLC programming, cloud automation.
- **Commerce & Finance:** Financial statement analysis, credit risk modeling, GST corporate taxation, Tally ERP.
- **Law & Legal Services:** Indian Contract Law, statutory compliance, litigation drafting, corporate due diligence.
- **Vocational Trades & Crafts:** 5-axis CNC machining, TIG/MIG welding, workshop safety standards (OSHA/BIS).
- **Agriculture:** Soil chemistry assays, crop yield sensing, irrigation telemetry.
