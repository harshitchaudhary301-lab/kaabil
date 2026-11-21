# SKILL_GAP_ANALYZER.md — KAABIL Intelligent Skill Gap Analyzer Technical Documentation

> **Ecosystem:** KAABIL (काबिल) — Universal Career, Education, Skill Development & Employment Platform  
> **Module:** Student Portal & Core Skill Intelligence Engine (`src/lib/skill-gap/skill-gap-engine.ts`)  
> **Version:** v1.0 Explainable Deterministic  
> **Applicability:** All 13 Educational Streams (Class 8 through Working Professionals)

---

## 1. Overview & Philosophy

The **KAABIL Skill Gap Analyzer** is a multi-dimensional diagnostic intelligence engine that bridges student aspirations with documented industry, council, and statutory competency requirements across India.

### Core Principles
1. **Universal Multi-Stream Parity:** Covers all 13 educational categories equally (from clinical medicine, veterinary, civil services, and corporate law to precision agronomy, industrial mechatronics, and sports coaching). Engineering is never treated as a privileged pathway.
2. **Deterministic, Explainable Scoring:** Zero arbitrary black-box percentages. Scoring strictly follows a published, transparent mathematical formula based on importance weights, required proficiency, and demonstrated evidence.
3. **Non-Punitive Pedagogical Design:** Missing evidence does **NOT** indicate student incompetence. It transparently flags areas where verifiable artifacts or objective assessment challenges will elevate career readiness.
4. **Statutory vs. Platform Distinction:** Clearly separates mandatory statutory regulations (e.g., NMC MBBS licensing, BCI AIBE, ICAI Articleship, FSSAI FoSTaC) from platform-defined recommended learning competencies.

---

## 2. Mathematical Scoring Formula & Algorithm Specification

The engine evaluates skill coverage using a weighted ratio bounded between 0% and 100%:

$$\text{Coverage Ratio}_i = \min\left(\frac{\text{Current Level}_i}{\text{Required Level}_i}, 1\right)$$

$$\text{Overall Skill Coverage} = \frac{\sum_{i=1}^N \left(\text{Coverage Ratio}_i \times \text{Importance Weight}_i\right)}{\sum_{i=1}^N \text{Importance Weight}_i} \times 100$$

$$\text{Mandatory Competency Coverage} = \frac{\sum_{m \in \text{Mandatory}} \left(\text{Coverage Ratio}_m \times \text{Importance Weight}_m\right)}{\sum_{m \in \text{Mandatory}} \text{Importance Weight}_m} \times 100$$

$$\text{Evidence Quality Score} = \frac{\text{Count of Cryptographically Verified Skills}}{\text{Total Required Skills}} \times 100$$

### Proficiency Level Scale (1 to 5)
- **Level 1 (Novice):** 0%–20% assessment score or introductory awareness.
- **Level 2 (Beginner):** 21%–40% assessment score or basic conceptual grasp.
- **Level 3 (Intermediate):** 41%–60% assessment score; capable of standard problem solving.
- **Level 4 (Proficient):** 61%–80% assessment score; capable of autonomous execution.
- **Level 5 (Expert):** 81%–100% assessment score; advanced synthesis and edge-case handling.

---

## 3. Competency Gap Classification Matrix

Each benchmark requirement is classified into one of six structured states:

| Gap Status | Criteria | Visual Badge | Recommended Action |
| :--- | :--- | :--- | :--- |
| **`DEMONSTRATED`** | Verified `SkillEvidence` minted with SHA-256 hash or profile verified | `bg-emerald-50 text-emerald-700` | Maintain mastery via advanced roadmap projects |
| **`DEVELOPING`** | Assessment attempted or partial learning milestone in progress | `bg-amber-50 text-amber-700` | Review feedback and re-take assessment challenge |
| **`SELF_REPORTED`** | Claimed by student in profile, but not yet verified | `bg-blue-50 text-blue-700` | Take formal skill assessment to verify |
| **`MISSING_EVIDENCE`** | Mandatory core skill with zero platform evidence | `bg-slate-100 text-slate-700` | Prioritize challenge or add to active roadmap |
| **`LEARNING_REQUIREMENT`**| Recommended skill for career differentiation | `bg-purple-50 text-purple-700` | Schedule for future learning horizon |
| **`EDUCATIONAL_PREREQUISITE`** | Educational stage or subject prerequisite not yet met | `bg-rose-50 text-rose-700` | Complete academic stage (e.g., Class 12 PCB) |

---

## 4. Priority Development Action Planner

The engine sorts gaps by severity and weight:
$$\text{Priority Score} = \text{Severity Rank} \times 10 + \text{Importance Weight}$$
where:
- $\text{Severity Rank}(\text{CRITICAL}) = 3$
- $\text{Severity Rank}(\text{MODERATE}) = 2$
- $\text{Severity Rank}(\text{MINOR}) = 1$
- $\text{Severity Rank}(\text{NONE}) = 0$

Top 5 critical gaps are converted into structured action cards with estimated resolution timelines (weeks) and direct links to corresponding KAABIL Skill Assessments.

---

## 5. API Endpoints

- `GET /api/student/skill-gaps`: Returns past analyses for the authenticated student or generates a fresh analysis. Query parameter `?careerSlug=<slug>` triggers real-time analysis against any target career.
- `POST /api/student/skill-gaps`: Body `{ targetCareerSlug: string }`. Runs deterministic analysis, saves snapshot in devStore/PostgreSQL, and returns full results.
- `GET /api/student/skill-gaps/[id]`: Fetches a historical analysis record with strict student ownership authorization.
