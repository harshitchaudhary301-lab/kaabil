# KAABIL Skill Evidence & Verification Framework
**Document ID:** DOC-D1-04  
**Product:** KAABIL (काबिल) — AI-Powered Universal Career Ecosystem  
**Milestone:** Part D1 (Prompt 12)  
**Status:** Implemented & Verified  

---

## 1. Skill Evidence Taxonomy

KAABIL establishes an authentic, multi-tier taxonomy of skill proof to ensure strict credibility across academic institutions and hiring employers:

```
[Layer 0: Self-Reported]
  └── Student identifies interest during onboarding (isVerified = false)
        │
        ▼ (Passes KAABIL Assessment)
[Layer 1: Automated Assessment]
  └── Auto-graded objective & rubric tests (isVerified = true, issuer = "KAABIL Assessment Engine")
        │
        ▼ (Submits Project / Portfolio)
[Layer 2: Human-Reviewed / Portfolio Review]
  └── Mentor or industry mentor evaluations (verifiedBy = "Mentor ID")
        │
        ▼ (Connects External Authority)
[Layer 3: External Credential]
  └── University degrees, NPTEL/Swayam, AWS, ICAI, Bar Council credentials
```

---

## 2. Tamper-Evident Verification Architecture

When a student passes an assessment (`scorePercentage >= passingPercentage`), the engine mints a `SkillEvidence` record containing:
- **`id`:** Unique CUID (e.g. `evi-...`)
- **`studentProfileId`:** Student profile foreign key
- **`skillName`:** Standardized skill identifier (e.g., "Human Physiology", "Data Structures & Algorithms")
- **`evidenceType`:** `AUTOMATED_ASSESSMENT`
- **`scorePercentage`:** Exact score achieved (e.g. 85%)
- **`verificationHash`:** SHA-256 cryptographic digest computed as:
  ```
  SHA256(studentProfileId + ":" + skillName + ":" + scorePercentage + ":" + timestamp)
  ```
- **`issuerOrVerifier`:** `KAABIL Automated Assessment Engine`
- **`verifiedAt`:** ISO 8601 timestamp

---

## 3. Career Readiness Index (CRI) Recalibration

Upon minting a `SkillEvidence` record:
1. The student's `UserSkill` model is updated to `isVerified = true` and `scorePercentage = result.percentage`.
2. The `CareerReadinessEngine.calculateReadiness` engine is executed.
3. **Dimension 3 (Skill Development)** score is recalculated using verified skill counts and weighted proficiencies.
4. The **Career Digital Twin** immediately reflects the verified badge in the student's live portfolio.
