# KAABIL (काबिल) — Responsible AI & Fairness Invariance Architecture

**Tagline:** Discover Your Skills. Define Your Future.  
**Core Principle:** Every Stream. Every Skill. Every Future.  

---

## 1. Principles of Responsible Career Intelligence

KAABIL rejects opaque black-box AI algorithms that perpetuate systemic bias, filter out non-traditional candidates, or make automated hiring and rejection decisions without human oversight.

The platform enforces five pillars of Responsible AI:
1. **Explainability Over Black Boxes:** Every compatibility match, gap analysis, and readiness score must provide plain-language reasons and granular component breakdowns.
2. **Protected-Attribute Invariance:** Algorithmic scoring must be mathematically invariant with respect to gender, caste, religion, ethnicity, state/region, and physical appearance.
3. **Strict Prohibition on Automated Rejection:** Zero automated rejections based solely on AI or CRI scores. Hiring and rejection decisions require human reviewer sign-off.
4. **Missing Evidence ≠ Incompetence:** If a candidate lacks a verified credential or diploma evidence, the engine classifies the requirement as `PROVISIONAL` or `UNMET`, rather than declaring the candidate incompetent.
5. **Child Privacy & Safety First:** Complete isolation of minor students (<18 or Class 8–10) from commercial recruitment discovery, marketing profiling, and employment targeting per DPDP Act (2023).

---

## 2. Invariance Verification

Mathematical invariance is formally proven and verified in automated tests (`src/__tests__/fairness-invariance.test.ts`).

Let $f(c, o)$ denote the compatibility scoring function for candidate $c$ and opportunity $o$.  
Let $A$ represent the vector of protected personal attributes:
$$A = (\text{gender}, \text{religion}, \text{caste}, \text{ethnicity}, \text{state}, \text{appearance})$$

For any two candidate profiles $c_1$ and $c_2$ such that their skills, proficiencies, projects, and assessments are identical, but their protected attributes differ ($A_1 \neq A_2$):

$$f(c_1, o) = f(c_2, o) \quad \text{and} \quad \text{Breakdown}(c_1, o) = \text{Breakdown}(c_2, o)$$

This ensures that no candidate is advantaged or disadvantaged based on their identity or demographic background.
