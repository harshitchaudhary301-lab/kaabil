# PASSPORT_PRIVACY_POLICY.md — KAABIL Digital Skill Passport Privacy & Child Safety Policy

> **Ecosystem:** KAABIL (काबिल) — Universal Career, Education, Skill Development & Employment Platform  
> **Regulatory Alignment:** Digital Personal Data Protection Act (DPDP) 2023, India  
> **Effective Date:** November 20, 2026

---

## 1. Principles of Privacy by Design

The **KAABIL Digital Skill Passport** adheres to the following privacy and data protection principles:
1. **Private by Default:** All student profiles, skill records, assessment attempts, and credentials are strictly private and accessible only to the authenticated student.
2. **Student-Controlled Disclosure:** No third-party, recruiter, or external organization may access a student's portfolio without an active, student-generated share token.
3. **Purpose Limitation:** Information collected during assessments and skill gaps is strictly used for career guidance and competency development.
4. **Data Minimization:** Public verification links expose only sanitized display names, educational streams, and verified competency badges. Raw contact information (phone number, home address, personal email) is strictly excluded from public verification views.

---

## 2. DPDP Act 2023: Special Protections for Minors (Under 18)

In strict accordance with Section 9 of the Digital Personal Data Protection Act (DPDP) 2023:

### Server-Side Enforcement (Not Cosmetic UI Buttons)
- **Automatic Minor Detection:** Accounts tagged with `isMinor: true` or enrolled in school stages (`CLASS_8`, `CLASS_9`, `CLASS_10`) are classified as protected minors.
- **Sharing Lock:** `PassportSharingService.createShareToken` evaluates student age and educational stage server-side:
  ```typescript
  const MINOR_STAGES = new Set(["CLASS_8", "CLASS_9", "CLASS_10"]);
  if (isProfileMinor || isStageMinor) {
    throw new Error(
      "UNDER_18_PROTECTION: In compliance with DPDP Act 2023 child safety provisions, public passport sharing and QR verification are restricted for school students under 18. Personal portfolio remains private."
    );
  }
  ```
- **Recruiter Non-Discoverability:** Minor profiles are systematically excluded from search queries, employer candidate browsing, and talent discovery indexes.
- **No Behavioral Tracking / Targeted Ads:** KAABIL does not engage in behavioral monitoring, commercial targeting, or advertisement tracking of minor students.
- **Private Achievement Portfolio:** Minor students still enjoy full access to the Digital Skill Passport as a private self-development log and personal record of achievement.

---

## 3. Adult Student Sharing & Revocation Controls

For adult students (higher education, vocational, and working professionals):
- **Expiring Links:** Every share token has a maximum TTL (configurable, default 7 days).
- **Instant Revocation:** Students can revoke any active share link with a single click in their Settings & Privacy or Passport console (`DELETE /api/student/passport/share/[token]`).
- **Selective Sharing:** Students can choose whether to share all credentials or select specific badges relevant to an internship or application.
- **Access Audit Logs:** The platform logs total view counts and the timestamp of the last verification request for full student visibility.

---

## 4. Student Data Rights & Deletion

Students maintain full rights under Indian data protection law:
- **Right to Access & Portability:** Students can print or download their entire verified credential portfolio as a PDF or JSON export.
- **Right to Correction:** Discrepancies in self-reported skills can be updated at any time. Verified skills can be re-tested through subsequent assessment challenges.
- **Right to Erasure:** Deleting an account systematically cascades to purge all session tokens, user skills, credentials, and share links.
