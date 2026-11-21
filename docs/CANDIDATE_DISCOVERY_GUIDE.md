# KAABIL (काबिल) — Candidate Discovery & Recruiter Search Guide

**Module:** `src/lib/employer/candidate-discovery-service.ts`  
**Route:** `/employer/discovery`, `/api/employer/discovery`  
**Target User:** Verified Employer Talent Acquisition Teams  

---

## 1. Overview

Candidate Discovery enables verified employers to actively identify and invite high-performing students who have voluntarily opted into commercial recruitment. Unlike traditional job boards that expose all student CVs without consent, KAABIL adheres to strict privacy and child protection standards under the Digital Personal Data Protection (DPDP) Act 2023.

---

## 2. Access Controls & Gating

Candidate Discovery is governed by three non-negotiable security layers:
1. **Verified Employer Gating:** Only organizations that have been verified by the KAABIL Trust & Verification Directorate (`verificationStatus === "VERIFIED"`) can search candidates or view profiles.
2. **Adult Opt-In Requirement:** Only adult students (`age >= 18` or undergraduate/postgraduate/diploma) who have affirmatively set `discoveryOptIn === true` appear in search results.
3. **Immediate Consent Withdrawal:** If an adult candidate toggles off discovery consent, their profile is instantly purged from the search index.

---

## 3. Search & Filtering Capabilities

Recruiters can filter vetted talent across multiple criteria:
- **Educational Stream:** All 13 streams supported (e.g. `MEDICAL_PCB`, `NON_MEDICAL_PCM`, `COMMERCE`, `LEGAL_STUDIES`, `VOCATIONAL_TRADES`).
- **Minimum CRI Score:** Filter by Career Readiness Index (e.g., CRI 70+ for Proficient, CRI 85+ for Ready).
- **Verified Skills:** Filter by specific competencies that have been cryptographically verified on the platform.
- **Education Stage:** Filter by degree level (`UNDERGRADUATE`, `POSTGRADUATE`, `DIPLOMA`, etc.).

---

## 4. Recruitment Invitations

When an employer discovers a promising candidate, they can issue an official **Recruitment Invitation**:
- Associated with a specific published opportunity.
- Includes personalized recruiter notes explaining why the candidate's verified skills stood out.
- Sent directly to the candidate's portal dashboard and notification center.
- The candidate can view the invitation details, accept, or decline with zero penalty to their CRI score.
