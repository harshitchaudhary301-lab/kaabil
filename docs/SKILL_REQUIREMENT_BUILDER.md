# KAABIL (काबIL) — Skills-First Competency Requirement Builder

---

## 1. Concept: Competency Over Pedigree

Traditional job boards rely heavily on keyword-stuffed resumes and university prestige. KAABIL replaces this with structured, machine-evaluable competency requirements tied directly to verified student credentials.

---

## 2. Structured Competency Schema

Each competency requirement in an opportunity posting comprises:

```typescript
export interface StructuredCompetencyRequirement {
  skillName: string;
  category: "TECHNICAL" | "DOMAIN" | "PRACTICAL" | "CLINICAL" | "SOFT_SKILL" | "REGULATORY";
  importance: "MANDATORY" | "PREFERRED";
  minProficiency: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  acceptableEvidence: ("PLATFORM_ASSESSMENT" | "EXTERNAL_CREDENTIAL" | "PROJECT_WORK" | "ANY")[];
}
```

### Proficiency Tiers
- **BEGINNER:** Conceptual knowledge and basic execution under supervision.
- **INTERMEDIATE:** Independent execution of routine domain workflows.
- **ADVANCED:** Complex problem diagnosis, optimization, and edge-case resolution.
- **EXPERT:** Architectural leadership, statutory certification, and cross-functional mastery.

### Acceptable Evidence Modes
- **`PLATFORM_ASSESSMENT`:** Passed a timed, proctored KAABIL Skill Assessment.
- **`EXTERNAL_CREDENTIAL`:** Verified cryptographic certificate or institutional diploma stored in the Digital Skill Passport.
- **`PROJECT_WORK`:** Portfolio artifact, GitHub repository, clinical case audit, or architectural design submission.
- **`ANY`:** Any credible verification mode accepted.
