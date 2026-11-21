# KAABIL (काबिल) — Institutional Intelligence & Analytics Architecture

**Tagline:** Discover Your Skills. Define Your Future.  
**Core Principle:** Every Stream. Every Skill. Every Future.  
**Phase:** Part E2 (Prompt 15)  
**Status:** Implemented & Fully Verified  

---

## 1. Executive Summary

KAABIL Institutional Intelligence provides educational leaders, deans, department heads, faculty mentors, and placement officers with real-time, explainable intelligence across the entire student lifecycle. Unlike legacy Academic ERPs or student management software that focus narrowly on attendance percentages and exam roll numbers, KAABIL translates student diagnostic data, verified skill assessments, and career digital twin models into actionable institutional strategy.

The ecosystem is deliberately universal across all **13 educational categories** recognized in India, serving schools (Class 8–10), secondary colleges (Class 11–12), undergraduate universities, polytechnic diploma institutes, and vocational ITI centers.

---

## 2. Institutional Architecture & Pillars

```
+-----------------------------------------------------------------------------------+
|                           KAABIL INSTITUTION PORTAL                               |
+-----------------------------------------------------------------------------------+
        |                     |                     |                     |
        v                     v                     v                     v
 [Skill Heatmap]     [Proactive Intervention]  [Smart Training]     [Campus Placements]
  - Multi-stream      - Transparent rules       - Gap-derived        - Explainable match
  - Verified ratio    - Non-punitive            - Attendance track   - Under-18 shielded
  - Benchmark gap     - Human review SLA        - Evidence minting   - Pipeline tracking
        |                     |                     |                     |
        +---------------------+---------------------+---------------------+
                                      |
                                      v
                     [Institutional Outcome Reporting]
                      - NAAC Criterion II & V Supporting
                      - NIRF Metrics Supporting (GO/GPH)
                      - NBA OBE Program Outcomes (POs)
                      - CWE-1236 Sanitized CSV Exports
```

---

## 3. Statutory Safeguards & Privacy Boundaries

### 3.1 DPDP Act (2023) Child Safety
- Minor students (<18 or Class 8–10) are strictly shielded from commercial employer recruitment drives.
- Minor student accounts participate exclusively in developmental exploration, foundation assessments, and interest discovery.

### 3.2 Non-Punitive Educational Framing
- Interventions are designed for guidance, not punishment.
- The platform never labels students as failures, never produces automatic academic rejections, and never infers psychological or mental health conditions from behavioral telemetry.

### 3.3 Student Privacy Isolation
- Campus administrators and faculty have access to cohort aggregate competencies, curriculum alignment gaps, and authorized intervention tickets.
- Private student AI mentor dialogues and personal reflective journals remain cryptographically isolated and are **never** accessible to campus staff.

---

## 4. Multi-Tenant Operational Isolation

Every institutional query, assessment schedule, training program, intervention ticket, and placement drive strictly filters by `institutionId`. Even in offline testing or database fallback modes, the `devStore` maintains partition keys per institution ID, completely preventing data cross-talk between rival colleges or multi-branch educational trusts.
