# DIGITAL_SKILL_PASSPORT.md — KAABIL Digital Skill Passport Technical Documentation

> **Ecosystem:** KAABIL (काबिल) — Universal Career, Education, Skill Development & Employment Platform  
> **Module:** Student Portal & Digital Skill Passport Engine (`src/lib/passport/passport-service.ts`)  
> **Version:** v1.0 Production-Grade Architecture  
> **Applicability:** All 13 Educational Streams & Stages

---

## 1. Executive Summary & Purpose

The **KAABIL Digital Skill Passport** is an evidence-based, tamper-evident digital credential passbook designed to transform how students across India document and prove competencies.

### Core Architecture
- **Dynamic Aggregation:** Automatically synthesizes the student's educational trajectory, career goals, skill portfolio, objective assessment results, roadmap milestones, and micro-mission achievements.
- **Evidence Layer Separation:** Explicitly distinguishes:
  - **`PLATFORM_ASSESSED`**: Cryptographically verifiable competency records minted upon passing objective platform evaluations.
  - **`SELF_REPORTED`**: Self-declared skills claimed during onboarding or profile editing without formal testing.
  - **`HUMAN_REVIEWED`**: Evaluated by accredited institutional faculty or verified industry mentors.
  - **`EXTERNAL`**: Independent external certifications.
- **Cryptographic Signing (HMAC-SHA256 & SHA-256):** Every credential is digitally signed by the KAABIL platform engine and given a unique verification hash.
- **Whole-Passport Integrity Checksum:** An aggregate SHA-256 checksum calculated over the entire portfolio guarantees that no individual badge or record can be injected or manipulated out-of-band.

---

## 2. Digital Skill Passport Structure

```typescript
export interface DigitalSkillPassport {
  passportId: string;                     // e.g., "KP-DEMOPROF-XYZ"
  studentProfileId: string;
  studentName: string;
  studentEmail?: string;
  generatedAt: string;
  passportIntegrityChecksum: string;     // SHA-256 of the aggregate passport

  education: {
    stage: string;                       // e.g., "UNDERGRADUATE"
    stream: string;                      // e.g., "NON_MEDICAL_PCM"
    streamTitle: string;
    institutionName?: string;
    targetCompletionYear?: number;
  };

  careerGoals: {
    title: string;
    slug: string;
    regulatoryBody?: string;
    priorityRank: number;
  }[];

  skills: PassportSkillEntry[];
  achievements: PassportAchievement[];
  credentials: KaabilCredential[];

  summary: {
    totalSkills: number;
    verifiedSkills: number;
    selfReportedSkills: number;
    assessmentsCompleted: number;
    assessmentsPassed: number;
    milestonesCompleted: number;
    missionsCompleted: number;
    currentCRI: number | null;
    credentialCount: number;
  };

  disclaimer: string;
}
```

---

## 3. Auto-Minting Lifecycle

When a student completes an assessment challenge in `src/lib/assessment/assessment-engine.ts` with a score $\ge$ the passing threshold:
1. `SkillEvidence` is minted with a SHA-256 verification hash.
2. The student's `UserSkill` record is flipped to `isVerified: true`.
3. Career Readiness Index (CRI) Dimension 3 (Skill Development) is immediately recalculated.
4. `PassportService.mintPendingCredentials(studentProfileId)` is triggered.
5. If no active credential exists for this evidence, a new `KaabilCredential` is generated with:
   - Unique UUID
   - HMAC-SHA256 digital signature computed over sorted canonical fields
   - Full-payload SHA-256 verification hash
   - Status `ACTIVE`
6. Persisted securely into `devStore`/PostgreSQL.

---

## 4. Statutory Disclaimer & Pedagogical Guardrails

> [!IMPORTANT]
> **Legal Notice:** Credentials listed in the KAABIL Digital Skill Passport are **NOT** government-issued licenses, statutory degrees, or public civil service appointments. They attest to objective assessments and learning achievements completed within the KAABIL platform ecosystem.

KAABIL never fabricates statutory degrees, medical council licenses, or bar council enrollments. Official external council registrations (e.g., NMC, BCI, ICAI) are explicitly classified as external prerequisites requiring statutory council verification.
