# KAABIL (काबिल) — Smart Training Management & Adaptive Workshops

**Tagline:** Discover Your Skills. Define Your Future.  
**Phase:** Part E2 (Milestone E2.2)  
**Status:** Implemented & Verified  

---

## 1. Overview

The Smart Training Management subsystem allows institutions to design, schedule, enroll, and monitor stream-specific workshops and faculty-led skill development sessions. 

Critically, training is not disconnected from the rest of the application. It forms the central bridge of the **KAABIL Closed-Loop Intelligence Lifecycle**:
1. Diagnosed skill gaps in student cohorts generate **Adaptive Training Proposals**.
2. Campus admins convert proposals into active workshops with one click.
3. Students enroll and attend sessions (tracked via attendance percentages).
4. Upon successful completion (attendance >= 75%), the system **automatically mints verified SkillEvidence**, updating the student's Digital Skill Passport and increasing their Career Readiness Index (CRI).

---

## 2. Adaptive Training Proposal Engine

The proposal engine (`TrainingService.getAdaptiveRecommendations`) inspects the cohort skill heatmap. Any competency where demonstrated proficiency falls into `CRITICAL` (<25%) or `GAP` (25–44%) triggers an explainable proposal:

```typescript
interface AdaptiveTrainingProposal {
  id: string;
  departmentId: string;
  departmentName: string;
  stream: EducationalStream;
  targetedSkill: string;
  demonstratedPercent: number;
  gapStatus: "CRITICAL" | "GAP";
  proposedTitle: string;
  recommendedMode: "ONLINE" | "OFFLINE" | "HYBRID";
  suggestedDuration: string;
  educationalRationale: string;
}
```

---

## 3. Training Program Lifecycle

```
[PLANNING / PROPOSAL]
  │
  ▼
[CREATED / UPCOMING] (Scheduled with instructor, targeted skills, max capacity)
  │
  ▼
[ACTIVE] (Students enrolled; sessions and attendance tracked)
  │
  ▼
[COMPLETED] (Attendance evaluated; verified SkillEvidence minted for >= 75%)
```

---

## 4. Automatic SkillEvidence Minting

When `TrainingService.updateCompletion` is called with `status: "COMPLETED"` and `attendancePercent >= 75`:
- A verified `SkillEvidence` record is generated with `evidenceType: "EXTERNAL"`.
- Issuer is set to `"Institutional Training Program: <Title>"`.
- Confidence score is set to `0.9` (verified by faculty institution).
- The student's `verifiedSkillsCount` increments automatically.
- This feeds directly into the student's Digital Skill Passport, QR verification code, and placement eligibility engine.
