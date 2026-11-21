# KAABIL (काबिल) — Smart Student Intervention System Guide

**Tagline:** Discover Your Skills. Define Your Future.  
**Phase:** Part E2 (Milestone E2.2)  
**Status:** Implemented & Verified  

---

## 1. Core Educational Philosophy

Traditional educational intervention systems are often punitive, flagging students as "at-risk", "defaulters", or "failing". KAABIL rejects this negative framing. 

KAABIL interventions are **proactive, developmental, and supportive opportunities**:
- **Non-Punitive Language:** Students are flagged for "Recommended Development" or "Diagnostic Opportunity", never labeled as failures.
- **No Mental Health Inference:** The system strictly evaluates academic and verified skill progress; it never attempts to infer mental health status or psychological conditions from behavioral telemetry.
- **Human-in-the-Loop Review:** An intervention is a workflow ticket that connects a faculty mentor with a student. Algorithmic flags never execute automatic disciplinary actions or academic expulsions.

---

## 2. Transparent Trigger Rules

The proactive scanner (`InterventionService.scanCohortForInterventions`) runs rule-based audits on cohort records:

| Trigger Reason | Severity | Trigger Condition | Educational Action |
| :--- | :--- | :--- | :--- |
| `INCOMPLETE_ONBOARDING` | MEDIUM | Student enrolled but onboarding incomplete (`onboardingCompleted: false`). | Academic counselor reaches out to assist with stream selection and profile creation. |
| `NO_ASSESSMENT_ATTEMPTS` | HIGH | Student completed onboarding but has 0 objective assessments completed. | Faculty assigns foundational stream diagnostic assessment to establish verified baseline. |
| `LOW_READINESS_SCORE` | URGENT | Career Readiness Index (CRI) < 45/100. | Department HOD reviews adaptive roadmap and assigns targeted skill enhancement workshop. |
| `CRITICAL_SKILL_GAP` | HIGH | Student attempted assessments but holds < 2 verified skill credentials. | Faculty guides student toward re-assessment and remedial skill labs. |
| `STALLED_ROADMAP` | MEDIUM | Student roadmap milestone progress stagnant for > 30 days. | Mentor schedules check-in session to remove blockers. |

---

## 3. Intervention Lifecycle & SLA

```
[NEW] (Triggered by Proactive Scan)
  │
  ▼
[ASSIGNED] (Assigned to Faculty / Mentor with 14-Day Review SLA)
  │
  ▼
[ACTION_PLANNED / IN_PROGRESS] (Workshop Enrolled / Advising Held)
  │
  ▼
[RESOLVED] (Student Completes Workshop, Re-assesses, or Resolves Gap)
```

Every ticket tracks:
- Assigned Faculty Mentor Name & ID
- Review SLA Date (default 14 days)
- Human Review Notes recorded by authorized campus staff
- Student Disciplinary Stream & Roll Number
