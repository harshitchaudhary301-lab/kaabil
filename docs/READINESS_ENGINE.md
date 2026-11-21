# KAABIL Career Readiness Index (CRI) Engine Specification

## 1. Overview & Ethical Standard

The **Career Readiness Index (CRI)** is an explainable, multi-dimensional assessment system designed to measure a student's actual career preparedness across all 13 educational streams.

### Core Ethical Pillars
1. **Zero Fabricated Readiness**: If a student is newly registered or has no documented skills or milestones, the system outputs `UNASSESSED` or `INSUFFICIENT_EVIDENCE`. It **never** displays an artificial placeholder score.
2. **Transparent Explainability**: Every CRI calculation returns exact evidence lists ("Why you earned this score") and actionable missing steps ("What you need to advance"), enabling students to understand their trajectory.
3. **Stream-Universal Fair Assessment**: Students in Vocational, Medical, Arts, Law, or Sports streams are evaluated against stream-appropriate criteria rather than biased tech-centric metrics.
4. **Honest Credential Valuation**: Self-reported skills are discounted (0.4x–0.5x credit) pending validation through proctored tests, competitive examinations, or portfolio audits.

---

## 2. The 5 CRI Evaluation Dimensions

The CRI overall readiness score is computed using a weighted sum across 5 explainable dimensions:

| Dimension | Weight | Description & Focus | Key Inputs |
| :--- | :---: | :--- | :--- |
| **1. Career Knowledge** | **20%** | Clarity of career objectives, market awareness, daily mission completion | Target career identification, interest vectors, daily mission reflections |
| **2. Educational Preparation** | **25%** | Academic stage alignment, curriculum stream fit, NEP 2020 cross-stream bridges | Class/Degree level, stream compatibility, prerequisite courses |
| **3. Skill Development** | **25%** | Competency acquisition, verified skills vs self-reported declarations | Verified skill badges, self-reported skills, benchmark coverage |
| **4. Practical Learning** | **15%** | Applied projects, clinical rotations, mock trials, portfolio items, internships | Case studies, research briefs, live code/design submissions, certifications |
| **5. Milestone Progress** | **15%** | Execution of personalized 12-week adaptive roadmap milestones | Completed weekly roadmap activities, learning consistency |

---

## 3. Mathematical Formulation

$$CRI = \sum_{i=1}^{5} (W_i \times D_i)$$

Where:
- $W_1 = 0.20$ (Career Knowledge)
- $W_2 = 0.25$ (Educational Preparation)
- $W_3 = 0.25$ (Skill Development)
- $W_4 = 0.15$ (Practical Learning)
- $W_5 = 0.15$ (Milestone Progress)

### Skill Development Score ($D_3$):
$$D_3 = \min\left(100, (N_{\text{verified}} \times 25) + (N_{\text{self-reported}} \times 10)\right)$$

### Status Classifications:
- **`UNASSESSED`**: No registered skills, interests, or roadmap activity. Score: `null`.
- **`INSUFFICIENT_EVIDENCE`**: Interests set, but 0 skills and 0 roadmap milestones. Score: `null`.
- **`FOUNDATIONAL`**: CRI Score 0 – 39. Basic exploratory orientation.
- **`DEVELOPING`**: CRI Score 40 – 69. Substantial academic and skill development underway.
- **`CAREER_READY`**: CRI Score 70 – 100. Strong validated competencies, milestone completion, and practical evidence.

---

## 4. Stage-Sensitive Adjustments

- **Early Secondary (Class 8–10)**: Baseline criteria prioritize exploratory missions and foundational awareness over formal professional certifications. Readiness targets are calibrated for stream selection readiness rather than immediate industry employability.
- **Senior Secondary (Class 11–12)**: Focus shifts toward entrance examinations (JEE, NEET, CLAT, CUET, NATA) and foundational domain competencies.
- **Higher Education & Vocational (Undergraduate, ITI, Diploma)**: Emphasizes verified competencies, live projects, portfolio reviews, and internship readiness.

---

## 5. API Endpoint Reference

### `GET /api/student/readiness`
- **Query Parameters**:
  - `careerSlug` (optional): Calculate readiness against a specific career pathway. If omitted, uses student's primary active goal.
- **Response Format**:
```json
{
  "success": true,
  "readiness": {
    "overallScore": 68,
    "status": "DEVELOPING",
    "targetCareer": {
      "slug": "ai-systems-engineer",
      "title": "AI Systems Engineer",
      "stream": "NON_MEDICAL_PCM"
    },
    "dimensions": [
      {
        "id": "career-knowledge",
        "name": "Career Knowledge",
        "weight": 20,
        "score": 75,
        "evidence": ["Target career identified", "5 daily missions completed"],
        "missing": ["Complete 5 more career discovery missions"]
      },
      ...
    ],
    "explanation": "Calculated based on 5 multidimensional evaluation pillars with self-reported skills discounted pending verification.",
    "updatedAt": "2026-11-20T07:00:00.000Z"
  }
}
```
