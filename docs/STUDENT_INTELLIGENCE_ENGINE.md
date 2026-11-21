# STUDENT_INTELLIGENCE_ENGINE.md — KAABIL Unified Student Intelligence Engine

> **Ecosystem:** KAABIL (काबिल) — Universal Career, Education, Skill Development & Employment Platform  
> **Module:** Unified Closed-Loop Feedback Architecture  
> **Scope:** Student Portal Lifecycle (Discovery $\to$ Assessment $\to$ Gaps $\to$ Roadmap $\to$ Missions $\to$ Passport)

---

## 1. The Closed-Loop Intelligence Lifecycle

The **KAABIL Unified Student Intelligence Engine** connects seven core pedagogical modules into an automated, feedback-driven career development cycle:

```
┌─────────────────────────┐
│   1. Career Discovery   │ ◄─── 13-Stream Psychometric & Market Exploration
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  2. Career Digital Twin │ ◄─── 5-Horizon Preparation & Capability Genome
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 3. Skill Gap Diagnostic │ ◄─── Target Career Benchmark Comparison (v1.0)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  4. Skill Assessments   │ ◄─── Multi-Stream Challenges & Objective Auto-Grading
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│    5. SkillEvidence     │ ◄─── SHA-256 Hashed Evidence & UserSkill Verification
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  6. CRI Recalibration   │ ◄─── Dimension 3 (Skill Development) Score Lift
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 7. Digital Skill        │ ◄─── HMAC-SHA256 Signed Credential Auto-Minting
│    Passport             │
└─────────────────────────┘
```

---

## 2. Dynamic Integration Signals

### A. Assessment $\to$ SkillEvidence $\to$ Passport
When a student completes an assessment in `/student/assessments/[id]`:
1. `AssessmentEngine.submitAttempt` scores the submission objectively.
2. If passing, a `SkillEvidence` record is minted with a SHA-256 hash.
3. Student's `userSkills` entry is updated to `isVerified: true`.
4. `PassportService.mintPendingCredentials` issues a digitally signed `KaabilCredential`.
5. Digital Skill Passport reflects the new verified credential immediately.

### B. SkillEvidence $\to$ Skill Gap Analyzer
1. `SkillGapEngine.analyzeGaps` scans active evidences.
2. The skill transitions from `MISSING_EVIDENCE` or `SELF_REPORTED` to `DEMONSTRATED`.
3. `overallCoveragePercent` and `mandatoryCoveragePercent` re-index deterministically.
4. The resolved skill is removed from `priorityDevelopmentAreas`.

### C. Skill Gaps $\to$ AI Career Mentor Context
1. `AiMentorService.getStudentLiveContext` fetches the student's top 3 priority skill gaps and verified credentials count.
2. When the student engages in conversation (in English, Hindi, or Hinglish), the mentor contextualizes advice using the actual gap matrix.
3. The mentor can propose targeted roadmap additions or assessment challenges directly via interactive action proposals.

---

## 3. Data Flow & Transactional Integrity

All modules share a unified data layer (`devStore` for offline development and Prisma ORM for PostgreSQL production). Writes are atomic and update both cache and persistent storage on disk to prevent state drift.
