# KAABIL (काबिल) — Two-Way Explainable Talent Matching Guide

**Tagline:** Discover Your Skills. Define Your Future.  
**Core Principle:** Every Stream. Every Skill. Every Future.  
**Platform Version:** 1.0.0 (Part F2)  
**Date:** November 2026

---

## 1. Executive Summary

KAABIL's Two-Way Explainable AI Talent Matching Engine replaces opaque black-box resume filters with a transparent, skills-first compatibility architecture. Unlike traditional recruitment platforms that penalize non-linear career paths or reject candidates without explanation, KAABIL evaluates candidates across five objective dimensions with configurable weights, generates deterministic plain-language explanations, and provides actionable skill bridge recommendations.

The matching engine works bidirectionally:
- **Direction A (Student to Job):** Recommends published opportunities aligned with the student's verified competencies, highlighting strengths and roadmaps to bridge missing skills.
- **Direction B (Job to Candidate):** Ranks opted-in adult talent for verified employer opportunities with granular score breakdowns and plain-language justifications.

---

## 2. Five-Dimensional Scoring Model

Candidate compatibility is calculated using five core dimensions with initial default weights:

| Dimension | Default Weight | Description | Evaluation Logic |
| :--- | :---: | :--- | :--- |
| **Verified Skills** | **35%** | Competencies backed by platform assessments or Digital Skill Passport credentials | Direct canonical match or normalized synonym lookup |
| **Proficiency Depth** | **25%** | Mastery level across required competencies | Comparison of candidate proficiency level against opportunity requirement |
| **Project Evidence** | **15%** | Real-world projects, GitHub repositories, case analyses | Verified project deliverables linked in candidate profile |
| **Assessment Benchmarks** | **15%** | Standardized platform assessment scores | Objective score percentages on stream-specific benchmarks |
| **Preferred Skills** | **10%** | Desirable secondary competencies | Bonus coverage of preferred competencies |

### Weight Normalization Formula

Recruiters may adjust dimension weights via the Employer Portal UI or API (`/api/employer/matching`). All weight vectors are dynamically normalized to guarantee that their sum equals 1.0:

$$\tilde{w}_i = \frac{w_i}{\sum_{j=1}^{5} w_j}$$

---

## 3. Mandatory Statutory Qualification Separation

Statutory and legal requirements (e.g., MBBS degree for clinical diagnostics, Bar Council registration for litigation) are evaluated as a separate independent dimension:
- **SATISFIED:** All required degrees/licenses confirmed.
- **PROVISIONAL:** Candidate is in final year or holds an interim license.
- **UNMET:** Degree requirement not met.

> **Responsible AI Standard:** Missing evidence or qualification is never classified as incompetence. If a student has not uploaded a certificate, the engine marks the qualification as `UNMET` or `PROVISIONAL` while still objectively evaluating demonstrated skills.

---

## 4. Multi-Stream Skill Synonym Dictionary

The engine normalizes cross-domain synonyms across all 13 educational categories:
- **Medical / PCB:** `"ecg"`, `"electrocardiogram"`, `"ecg analysis"` $\to$ `"electrocardiography"`
- **Medical / PCB:** `"phlebotomy"`, `"venipuncture"` $\to$ `"clinical phlebotomy"`
- **PCM / Engineering:** `"react.js"`, `"reactjs"`, `"react framework"` $\to$ `"react"`
- **PCM / Engineering:** `"postgres"`, `"psql"`, `"postgres database"` $\to$ `"postgresql"`
- **Commerce / Finance:** `"gst"`, `"goods and services tax"`, `"gst taxation"` $\to$ `"gst compliance"`
- **Legal Studies:** `"contract drafting"`, `"agreement drafting"`, `"pleadings"` $\to$ `"legal drafting"`
- **Vocational Trades:** `"tig"`, `"gtaw"` $\to$ `"tig welding"`; `"cnc"`, `"cnc milling"` $\to$ `"cnc machining"`

---

## 5. Algorithmic Invariance & Fairness

The matching engine enforces mathematical invariance with respect to protected characteristics:
- Gender
- Religion
- Caste
- Ethnicity
- Geographic State / Region
- Physical Appearance

As verified in `src/__tests__/fairness-invariance.test.ts`, two candidates with identical skills and project evidence will receive identical match percentages and rankings regardless of personal identity attributes.
