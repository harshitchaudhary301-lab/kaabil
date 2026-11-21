# KAABIL (काबिल) — Employer Data Privacy & Child Safeguards Guide

**Governing Legislation:** Digital Personal Data Protection (DPDP) Act, 2023 (Government of India)  
**Applicability:** All recruiters, hiring managers, and employer administrators operating on KAABIL

---

## 1. Statutory Mandate: Under-18 Safeguards (Section 9, DPDP Act 2023)

Under Section 9 of the DPDP Act 2023, data fiduciaries are prohibited from processing personal data of children that is likely to cause any detrimental effect on their well-being, or engaging in behavioral tracking or targeted recruitment toward minors.

### Technical Safeguards Implemented:
1. **Application Shield:** Any student account flagged with `isMinor: true` or academic stage `CLASS_8`, `CLASS_9`, or `CLASS_10` is strictly prevented from submitting job or internship applications.
2. **API Filtering:** The `/api/student/opportunities` endpoint evaluates age and returns a statutory notice rather than employment application actions for minors.
3. **Employer Isolation:** Employer candidate search and discovery APIs exclude minor student records entirely.

---

## 2. Affirmative Student Authorization Consent

Whenever an adult learner applies for an opportunity, the platform requires affirmative consent:
- A clear dialog explicitly specifies what data will be shared: verified skill names, education stream, career readiness score, and optional cover statement.
- The employer receives only what was authorized, enforcing the principle of **Data Minimization**.

---

## 3. Right to Withdraw & Data Deletion

Candidates retain the statutory right to withdraw applications at any point before an offer is formalized. Upon withdrawal, their application state is transitioned to `WITHDRAWN` and personal contact details are inaccessible to recruiters.
