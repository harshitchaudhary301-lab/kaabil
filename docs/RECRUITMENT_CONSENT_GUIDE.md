# KAABIL (काबिल) — Recruitment Consent & Under-18 Safeguards Guide

**Statutory Framework:** Digital Personal Data Protection (DPDP) Act, 2023 (Section 9)  
**Modules:** `src/lib/employer/candidate-discovery-service.ts`, `src/lib/employer/matching-engine.ts`, `src/app/api/student/discovery-preference/route.ts`  

---

## 1. Statutory Mandate

Section 9 of the DPDP Act (2023) establishes strict statutory duties regarding children (individuals under 18 years of age). In the context of employment and recruitment:
1. **Ban on Behavioral Tracking & Targeting:** Platforms may not track or profile minors for commercial employment or advertising.
2. **Ban on Commercial Exploitation:** Minors in school education (Class 8, 9, 10, 11, 12 under 18) must not be treated as commercial labor candidates.
3. **Data Minimization:** No personal data of a minor may be disclosed to external commercial recruiters without verifiable parental consent.

---

## 2. KAABIL Implementation Rules

KAABIL implements defense-in-depth safeguards across the data and application layers:

### Rule 1: Default Private State
All student accounts default to `discoveryOptIn: false`. A student's profile is never visible to recruiters upon registration.

### Rule 2: Hard Minor Gating
If a user is marked `isMinor: true` OR has an education stage of `CLASS_8`, `CLASS_9`, or `CLASS_10`:
- Any attempt to opt into candidate discovery (`/api/student/discovery-preference`) throws a statutory error and is rejected.
- Matching engine (`MatchingEngine.matchCandidatesForOpportunity`) filters out minor profiles before any ranking is performed.
- Candidate discovery queries (`CandidateDiscoveryService.searchCandidates`) strictly filter out minor profiles.
- Commercial job applications (`ApplicationService.applyToOpportunity`) block minors and return educational guidance instead.

### Rule 3: Immediate Right to Withdraw Consent
Adult students can withdraw their recruitment discovery consent at any moment with a single click. When consent is withdrawn:
- The candidate's record is immediately deleted from `store.candidateDiscoveryProfiles`.
- Recruiters can no longer search or view the profile.
- Existing internal education progress (CRI score, roadmaps, passport) remains completely intact.
