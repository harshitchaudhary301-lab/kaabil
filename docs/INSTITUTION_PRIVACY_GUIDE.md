# KAABIL (काबिल) — Institution Student Privacy & DPDP Compliance Guide

**Compliance Reference:** Digital Personal Data Protection (DPDP) Act, 2023 (India) & Universal Student Safeguards.

---

## 1. Under-18 Minor Safeguards

In accordance with Section 9 of the DPDP Act 2023:
- Any student enrolled in Class 8, Class 9, or Class 10 (or self-reported age < 18) is automatically flagged as a **Minor** (`isMinor: true`).
- The enrollment record is initialized with `guardianConsent: "PENDING"`.
- Minor profiles are restricted from public QR sharing or inclusion in external employer recruitment drives until guardian consent is verified.
- Campus administrators can record verified guardian consent via the Institution Portal upon receipt of physical or digital parental authorization.

---

## 2. Institutional Data Minimization

The Institution Portal strictly separates **Academic Telemetry** from **Personal Student Reflection**:

### Permitted Institutional Visibility:
- Student Name, Official Email, Roll Number, Stream, Batch, and Department
- Career Readiness Index (CRI) score and 5-dimension readiness breakdown
- Assessment attempt counts and passed status
- Cryptographically verified skill credentials and badges minted on the student's Digital Skill Passport

### Strictly Prohibited & Cryptographically Isolated:
- **Universal AI Career Mentor conversations:** Private dialogues between the student and the AI Mentor are strictly confidential.
- **Personal Career Reflection journals:** Private student self-evaluations and journaling entries are never exposed to campus faculty, HODs, or placement officers.
- **Off-campus applications:** Student applications to external employers remain private unless explicitly shared by the student.
