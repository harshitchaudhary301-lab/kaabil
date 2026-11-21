# KAABIL Intelligent Skill Assessment Engine
**Document ID:** DOC-D1-03  
**Product:** KAABIL (काबिल) — AI-Powered Universal Career Ecosystem  
**Milestone:** Part D1 (Prompt 12)  
**Status:** Implemented & Verified  

---

## 1. System Architecture

The **Intelligent Skill Assessment Engine** provides standardized, stage-adaptive, and stream-aware skill evaluations across all 13 educational streams.

### Core Objectives
1. **Objective Skill Verification:** Transform self-reported student interests and claims into verified competencies.
2. **Deterministic Auto-Grading & Rubrics:** Evaluate objective MCQs and complex scenario items with weighted scoring criteria.
3. **Cryptographic Skill Evidence Minting:** Automatically generate tamper-evident verification records upon achieving passing thresholds (60%–70%).
4. **Direct CRI Linkage:** Instantly feed verified assessment results into the **Career Readiness Index (CRI) Dimension 3 (Skill Development)** and the **Career Digital Twin**.

---

## 2. Assessment Taxonomy & Streams

Assessments are categorized into five functional types:
- `FOUNDATION`: Core numeracy, literacy, problem-solving, and scientific method.
- `SUBJECT_SPECIFIC`: Physics, Physiology, Accounting, Constitutional Law, Agronomy.
- `DOMAIN_COMPETENCY`: UX/UI design heuristics, electrical troubleshooting, marketing analytics.
- `LOGICAL_REASONING`: Deductive reasoning, algorithmic thinking, interdisciplinary trade-offs.
- `CAREER_AWARENESS`: Understanding day-to-day realities and professional ethics of specific professions.

### 13 Stream Coverage Matrix

| Stream Code | Representative Assessment Title | Target Skill | Passing % |
|:---|:---|:---|:---:|
| `MEDICAL_PCB` | Clinical Reasoning & Human Physiology | Human Physiology | 70% |
| `NON_MEDICAL_PCM` | Algorithmic Thinking & Python Problem Solving | Data Structures & Algorithms | 65% |
| `COMMERCE` | Financial Statement Analysis & Corporate Accounting | Financial Analysis | 65% |
| `ARTS_HUMANITIES` | Critical Textual Analysis & Sociological Reasoning | Critical Analysis | 60% |
| `LAW` | Constitutional Law & Legal Reasoning Principles | Legal Reasoning | 70% |
| `MANAGEMENT` | Strategic Decision-Making & Marketing Analytics | Business Strategy | 65% |
| `CREATIVE_ARTS_DESIGN` | User Experience Heuristics & Design Systems | UX/UI Design | 65% |
| `AGRICULTURE` | Agronomy Principles & Sustainable Soil Management | Soil Science & Agronomy | 60% |
| `VOCATIONAL_SKILLED` | Electrical Safety & Industrial Circuit Troubleshooting | Electrical Systems | 65% |
| `SPORTS` | Exercise Physiology & Athletic Conditioning | Sports Physiology | 60% |
| `HOSPITALITY_TOURISM` | Hospitality Operations & Guest Service Excellence | Guest Relations & Operations | 65% |
| `INTERDISCIPLINARY` | Data-Driven Public Policy & Problem Solving | Interdisciplinary Problem Solving | 65% |
| `UNDECIDED` | Universal Logical Reasoning & Aptitude Diagnostic | Critical Problem Solving | 60% |

---

## 3. Test Security & Anti-Cheat Protocols

1. **Option Sanitization:**
   - The test retrieval API endpoint (`GET /api/student/assessments/[id]`) strips `isCorrect`, `explanation`, and `rubricGuide` fields before returning the question payload to the browser.
2. **Server-Side Auto-Grading:**
   - All evaluation and score calculations take place strictly on the server in `AssessmentEngine.submitAttempt`.
3. **Timed Attempts:**
   - Timers run on client countdown with server-side `startedAt` and `completedAt` timestamps.

---

## 4. Non-Punitive Philosophy

KAABIL enforces a growth-mindset, non-punitive assessment policy:
- Failing an assessment **never deducts points** from a student's existing CRI or removes their self-reported skills.
- The student receives detailed diagnostic feedback explaining the correct reasoning for every question.
- Re-attempts are encouraged once the student completes preparatory daily missions or roadmap activities.
