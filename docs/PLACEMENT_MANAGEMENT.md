# KAABIL (काबिल) — Campus Placement Management & Explainable Eligibility

**Tagline:** Discover Your Skills. Define Your Future.  
**Phase:** Part E2 (Milestone E2.3)  
**Status:** Implemented & Verified  

---

## 1. Overview

The Campus Placement Management subsystem coordinates recruitment events, internship drives, and apprenticeship fairs across adult student cohorts.

Unlike legacy job boards or opaque applicant tracking systems, KAABIL introduces two transformative innovations:
1. **Explainable Placement Eligibility Engine:** Every applicant receives transparent, audit-ready justifications detailing exactly why they are eligible or what prerequisites remain unfulfilled.
2. **DPDP Act (2023) Statutory Safeguard:** Complete shielding of minor students (<18) from corporate recruitment discovery and employer databases.

---

## 2. DPDP Act (2023) Child Safety Rules

Under India's Digital Personal Data Protection Act (2023):
- Any student where `isMinor: true` or `stage in ["CLASS_8", "CLASS_9", "CLASS_10"]` is **strictly prohibited** from applying to or being visible in commercial recruitment drives.
- If a minor attempts to register or is evaluated for a recruitment drive, the engine blocks the action with the statutory explanation:
  `"Minor student accounts (Class 8–10 or age <18) are strictly shielded from employer recruitment drives under the DPDP Act (2023)."`
- Minor students participate exclusively in academic stream exploration, foundation skill assessments, and faculty-guided workshops.

---

## 3. Explainable Eligibility Engine

The eligibility engine (`PlacementService.evaluateEligibility`) evaluates candidates across four objective dimensions:

1. **Disciplinary Stream Match:** Verifies that the candidate's academic stream matches one of the drive's targeted streams (`drive.streams`).
2. **Academic Stage Prerequisite:** Verifies that the student's stage rank meets or exceeds the drive's minimum stage (`STAGE_HIERARCHY`: Class 12 < ITI/Diploma < Undergraduate < Postgraduate).
3. **Career Readiness Benchmark (CRI):** If the drive specifies a minimum CRI (e.g. 65/100), the student's current index must meet the threshold.
4. **Verified Competencies:** Compares the student's verified `SkillEvidence` records against `drive.requiredSkills`. Unverified self-reports do not satisfy requirements.

Every evaluation produces an explainable result:
```typescript
{
  isEligible: boolean;
  isMinor: boolean;
  reasons: string[];
  missingRequirements: string[];
}
```

---

## 4. Recruitment Pipeline Stages

```
[APPLIED] -> [SHORTLISTED] -> [INTERVIEW_SCHEDULED] -> [OFFERED] -> [ACCEPTED / ARCHIVED]
```

Placement officers can:
- View applicants in a responsive drawer with explainable eligibility badges.
- Assign interview slots (e.g. `"2026-12-22 10:30 AM IST"`).
- Record verified compensation packages (e.g. `"CTC: 8.5 LPA, Location: Bengaluru"`).
- Automatically update drive applicant, shortlist, and offer statistics.
