# KAABIL (काबिल) — The Unified Intelligence Loop

**Core Principle:** Every Stream. Every Skill. Every Future.  
**Platform Version:** 1.0.0 (Parts A through F2 Complete)  
**Date:** November 2026  

---

## 1. Architectural Vision

KAABIL connects students, educational institutions, and industry employers into a single, closed-loop career and skills intelligence ecosystem. Rather than treating education and employment as disconnected silos, KAABIL transforms student learning milestones into verified credentials that directly satisfy real-time employer demand.

```
                           ┌────────────────────────────────────────┐
                           │            EMPLOYER PORTAL             │
                           │  - Job Opportunities & Demand          │
                           │  - Multi-Stream Industry Challenges    │
                           │  - ATS Pipeline & Structured Rubrics   │
                           └──────────────────┬─────────────────────┘
                                              │
                      Industry Demand Data    │  Verified Challenge Credentials
                      & Competency Standards  │  & Recruiter Invitations
                                              │
                                              ▼
┌────────────────────────────────────────┐    │    ┌────────────────────────────────────────┐
│           INSTITUTION PORTAL           │    │    │             STUDENT PORTAL             │
│  - Multi-Stream Cohort Analytics       │    │    │  - Career Digital Twin & CRI Index     │
│  - Curriculum Skill Gap Heatmaps       │◄───┴───►│  - AI Career Mentor & Adaptive Roadmap │
│  - Smart Interventions & Bulk Import   │         │  - Skill Assessments & Evidence Engine │
│  - Placement Drives & Employer MoUs    │         │  - Digital Skill Passport (HMAC-SHA256)│
└────────────────────────────────────────┘         └────────────────────────────────────────┘
```

---

## 2. The 8 Stages of the Intelligence Loop

As proven in `src/__tests__/unified-intelligence-loop-f2.test.ts`, the intelligence loop executes seamlessly across all three stakeholder portals:

1. **Employer Demand Generation:**
   Verified employers post skills-first opportunities and practical challenges defining exact competency requirements (e.g., Clinical Biochemistry, Analytical Quality Control).
2. **Institutional Curriculum Alignment:**
   Institution dashboards ingest real-time employer skill requirements, mapping cohort competencies against industry benchmarks and triggering targeted faculty interventions.
3. **Student Skill Gap Discovery:**
   Students inspect their Career Digital Twin and Skill Gap Analyzer to identify required competencies and receive personalized 12-week roadmaps.
4. **Practical Assessment & Evidence Creation:**
   Students complete verified assessments and submit deliverables to real-world Industry Challenges.
5. **Cryptographic Credential Minting:**
   Employer approval triggers the automated issuance of verified `SkillEvidence` with SHA-256 hashes and authentic HMAC-SHA256 credentials to the student's Digital Skill Passport.
6. **Two-Way Explainable Matching:**
   The matching engine detects newly minted credentials, elevating the student's compatibility score to Strong Match ($\ge 75\%$) with plain-language rationale.
7. **Talent Discovery & Direct Outreach:**
   Recruiters discover opted-in adult candidates via multi-stream search and issue official recruitment invitations.
8. **Structured Interview & ATS Hire:**
   Recruiters conduct structured interviews, submit 1–5 competency rubric evaluations, and progress candidates through ATS stages to `OFFER_ISSUED` and `HIRED`.

---

## 3. Statutory Safeguards Across the Loop

- **DPDP Act (2023) Under-18 Shielding:** Minors (<18 or Class 8–10) participate safely in internal educational discovery and learning roadmaps, but are strictly shielded from commercial recruitment discovery, job applications, and marketing profiling.
- **Protected-Attribute Invariance:** Gender, caste, religion, ethnicity, and geography are excluded from scoring, guaranteeing bias-free candidate rankings across India's 28 states and 8 union territories.
- **Zero Automated Rejections:** Every hiring decision requires human recruiter review; missing credentials are never classified as incompetence.
