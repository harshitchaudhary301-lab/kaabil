# KAABIL (काबिल) — Industry Assessment & Challenge Hub Guide

**Module:** `src/lib/employer/industry-challenge-service.ts`  
**Route:** `/employer/challenges`, `/student/challenges`  
**Credential Standard:** W3C-aligned Digital Skill Passport Credentials (HMAC-SHA256 & SHA-256 evidence hashing)  

---

## 1. Concept & Purpose

The Industry Challenge Hub bridges the gap between academic theory and real-world employment. Employers host practical challenges—such as medical pathology case analyses, legal agreement drafting competitions, algorithmic trading models, or precision engineering CAD design briefs.

Unlike ordinary hackathons, KAABIL challenges:
1. Are stream-specific across all 13 educational domains.
2. Require objective methodology and compliance reasoning.
3. Require human reviewer rubric evaluation.
4. **Mint Verified Credentials Directly on Approval:** When a verified employer approves a student's deliverable, the platform mints verified `SkillEvidence` records with cryptographic hashes and issues an official credential to the student's Digital Skill Passport, automatically updating their Career Digital Twin and CRI!

---

## 2. DPDP Act Under-18 Safeguards

Corporate recruitment challenges are legally restricted to adult learners (`isAdultOnly: true`):
- Students under 18 years of age or in Class 8, 9, 10 cannot enroll in or submit deliverables to corporate industry challenges.
- Minors receive guidance directing them to age-appropriate academic missions and foundational learning roadmaps.

---

## 3. Challenge Lifecycle

```
[Verified Employer Publishes Challenge]
  (Category, Stream, Difficulty, Deliverables, Rubric Criteria, Reward Credential Title)
                       │
                       ▼
         [Adult Student Discovers & Enrolls]
                       │
                       ▼
       [Student Submits Deliverable URL & Summary]
                       │
                       ▼
    [Employer Reviews Rubric & Scores (0 - 100)]
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
        [APPROVED]      [REVISION / REJECTED]
            │                     │
            ▼                     ▼
 ┌──────────────────────┐  [Feedback sent
 │ MINTING LIFECYCLE:   │   to student]
 │ 1. Verified Evidence │
 │ 2. SHA-256 Hashes    │
 │ 3. HMAC Credential   │
 │ 4. Passport Updated  │
 │ 5. Twin Recalculated │
 └──────────────────────┘
```
