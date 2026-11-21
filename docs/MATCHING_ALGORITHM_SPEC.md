# KAABIL (काबिल) — Two-Way Matching Algorithm Technical Specification

**Module:** `src/lib/employer/matching-engine.ts`  
**API Endpoints:** `/api/employer/matching`, `/api/student/opportunities/recommendations`  
**Algorithm Version:** 1.0.0-PROD  

---

## 1. Algorithm Architecture

The matching engine implements deterministic scoring across 5 weighted dimensions and 1 statutory gating check:

```
[Candidate Discovery Profile] 
            │
            ▼
[Protected-Attribute Stripping] (Strict Invariance: Gender, Caste, Religion excluded)
            │
            ▼
[Skill Synonym Normalization] (Cross-stream canonicalization via SKILL_SYNONYMS)
            │
            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      5-DIMENSIONAL SCORING ENGINE                      │
├─────────────────────────┬──────────────────────┬───────────────────────┤
│ Dimension               │ Normalized Weight    │ Component Formula     │
├─────────────────────────┼──────────────────────┼───────────────────────┤
│ Verified Skills         │ w_verified (0.35)    │ (Matched / Required)  │
│ Proficiency Depth       │ w_prof (0.25)        │ Avg(Level / Required) │
│ Project Evidence        │ w_project (0.15)     │ Projects / Max(1, Req)│
│ Assessment Benchmarks   │ w_assessment (0.15)  │ Avg Assessment Scores │
│ Preferred Skills        │ w_preferred (0.10)   │ (Matched / Preferred) │
└─────────────────────────┴──────────────────────┴───────────────────────┘
            │
            ▼
[Weighted Aggregation: Overall Compatibility Score S ∈ [0, 100]]
            │
            ▼
[Statutory Qualification Classification: SATISFIED | PROVISIONAL | UNMET]
            │
            ▼
[Plain-Language Explanation Generation & Roadmap Bridge Suggestion]
```

---

## 2. Mathematical Definition

Let $O$ be an opportunity with required skills $R_O = \{r_1, r_2, \dots, r_m\}$ and preferred skills $P_O = \{p_1, \dots, p_k\}$.  
Let $C$ be an opted-in adult candidate profile with verified skills $V_C$, self-reported skills $S_C$, and project evidences $E_C$.

Let $\phi(s)$ denote the canonical skill mapping defined by the synonym dictionary.

### 2.1 Verified Skill Match Score ($S_{\text{verified}}$)
$$S_{\text{verified}} = \frac{|\{\phi(r) \in \phi(R_O) : \phi(r) \in \phi(V_C)\}|}{\max(1, |R_O|)} \times 100$$

### 2.2 Proficiency Score ($S_{\text{proficiency}}$)
For each matched skill $s$, let $L_C(s) \in \{1, \dots, 5\}$ and $L_O(s) \in \{1, \dots, 5\}$:
$$\rho(s) = \min\left(1.0, \frac{L_C(s)}{L_O(s)}\right)$$
$$S_{\text{proficiency}} = \left(\frac{1}{|M|}\sum_{s \in M} \rho(s)\right) \times 100$$

### 2.3 Project Evidence Score ($S_{\text{project}}$)
$$S_{\text{project}} = \min\left(100, \frac{|E_C|}{\max(1, \lceil|R_O| / 2\rceil)} \times 100\right)$$

### 2.4 Overall Score Aggregation
$$S_{\text{overall}} = \text{round}\left(\tilde{w}_1 S_{\text{verified}} + \tilde{w}_2 S_{\text{proficiency}} + \tilde{w}_3 S_{\text{project}} + \tilde{w}_4 S_{\text{assessment}} + \tilde{w}_5 S_{\text{preferred}}\right)$$

### 2.5 Match Tiers
- **Strong Match:** $S_{\text{overall}} \ge 75\%$
- **Moderate Match:** $50\% \le S_{\text{overall}} < 75\%$
- **Developing:** $S_{\text{overall}} < 50\%$
