# KAABIL (काबिल) — Closed-Loop Intelligence Lifecycle Architecture

**Tagline:** Discover Your Skills. Define Your Future.  
**Core Principle:** Every Stream. Every Skill. Every Future.  
**Phase:** Part E2 (Milestone E2.4)  
**Status:** Implemented & Verified  

---

## 1. The Broken Paradigm vs. KAABIL Closed-Loop

In conventional education technology, platforms operate in isolated silos:
- Student assessments generate isolated PDF scorecards.
- Institutional dashboards show attendance logs with no link to industry demand.
- Faculty interventions exist as informal WhatsApp messages or disconnected sticky notes.
- Training workshops occur without measuring skill acquisition.
- Campus placement cells manually screen resumes with unverified claims.

**KAABIL unites all five stakeholder experiences into a single, database-backed Closed-Loop Intelligence Lifecycle.**

---

## 2. The 8-Step Closed-Loop Lifecycle

```
[1. Diagnostic Assessment Gap]
       │
       ▼
[2. Cohort Skill Heatmap] (Flags curriculum-level and batch deficiencies)
       │
       ▼
[3. Proactive Student Intervention] (Rule-based triage with human review SLA)
       │
       ▼
[4. Adaptive Training Workshop Proposal] (Auto-generated from identified gaps)
       │
       ▼
[5. Student Workshop Enrollment & Attendance] (Faculty-led session tracking)
       │
       ▼
[6. Automatic Verified Evidence Minting] (Attendance >= 75% mints SkillEvidence)
       │
       ▼
[7. Digital Skill Passport & CRI Recalibration] (Readiness score updates)
       │
       ▼
[8. Explainable Placement Opportunity Matching] (Unlocks verified job drives)
```

---

## 3. Step-by-Step Architectural Walkthrough

### Step 1: Diagnostic Assessment
A student in the Computer Science department completes an objective technical diagnostic but scores low in Cloud Architecture.

### Step 2: Cohort Analytics Heatmap
The Institutional Analytics engine (`AnalyticsService.getSkillHeatmap`) calculates that Cloud Architecture demonstrated proficiency in the department is only 20% (marked `CRITICAL`).

### Step 3: Proactive Intervention
The intervention scanner (`InterventionService.scanCohortForInterventions`) detects the student's low Career Readiness Index and logs a `LOW_READINESS_SCORE` or `CRITICAL_SKILL_GAP` ticket assigned to the department HOD with a 14-day review SLA.

### Step 4: Adaptive Workshop Recommendation
The adaptive training engine (`TrainingService.getAdaptiveRecommendations`) proposes a 3-week *"Intensive Masterclass: Cloud Architecture Competency Sprint"*.

### Step 5: Workshop Conduct & Attendance Tracking
The institution schedules the workshop. The student enrolls and achieves 90% attendance.

### Step 6: Evidence Minting in Digital Skill Passport
Upon workshop completion, `TrainingService.updateCompletion` automatically creates a verified `SkillEvidence` record in `devStore` with `evidenceType: "EXTERNAL"` and `issuer: "Institutional Training Program"`.

### Step 7: Passport & CRI Update
The student's `verifiedSkillsCount` increments, and their Career Readiness Index recalibrates from 45/100 to 72/100.

### Step 8: Placement Eligibility Unlocked
A placement drive from AWS with criteria `minCRI: 60` and `requiredSkills: ["Cloud Architecture"]` runs an eligibility check. The student, previously rejected, is now evaluated as **100% Eligible** with full explainable justification. The student applies, interviews, and receives a confirmed job offer.

### Step 9: Accreditation Telemetry
The Institutional Reporting engine (`ReportingService.generateReport`) includes the resolved intervention and newly minted skill evidence in its NAAC Criterion V and NIRF Graduation Outcome reports.
