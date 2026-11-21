# KAABIL (काबिल) — Opportunity Management & Lifecycle Specification

---

## 1. Opportunity Lifecycle Architecture

Every recruitment listing in KAABIL traverses a strict state lifecycle:

```
[ DRAFT ] ──(Verification Gate Check)──► [ PUBLISHED ] ◄──► [ PAUSED ]
    │                                          │
    ▼                                          ▼
[ ARCHIVED ] ◄─────────────────────────── [ CLOSED ]
```

### Lifecycle Rules:
1. **DRAFT:** Default state upon creation. Any registered employer (regardless of verification status) can draft opportunities.
2. **PUBLISHED:** Only organizations with `verificationStatus === "VERIFIED"` can move postings to `PUBLISHED`. Live postings are immediately discoverable by adult students in `/student/opportunities`.
3. **PAUSED:** Temporarily suspends incoming applications while active applicants continue through the ATS pipeline.
4. **CLOSED:** Finalized opportunity. No new applications accepted.
5. **ARCHIVED:** Soft-deleted posting preserved for statutory compliance and recruitment audit records.

---

## 2. Transparent Compensation Disclosure Standards

In alignment with global fair labor benchmarks:
- **Internships & Apprenticeships:** Display monthly stipend (₹ INR / month) or clearly state "Unpaid Research / Academic Credit".
- **Full-Time & Lateral Roles:** Disclose CTC range (e.g. ₹6.0 LPA - ₹9.5 LPA).
- **Undisclosed Roles:** Marked with a clear disclaimer: *"Compensation: Competitive / Commensurate with Verifiable Skill Readiness"*.

---

## 3. Rapid Duplication

Recruiters hiring for recurring cycles (e.g., Annual Trainee Cohorts) can duplicate existing opportunities with a single click. The duplicate automatically resets counters (`totalApplications: 0`, `hiredCount: 0`) and starts in `DRAFT` status for safe editing.
