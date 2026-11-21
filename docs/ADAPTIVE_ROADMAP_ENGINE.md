# KAABIL Adaptive Career Roadmap Engine Specification

## 1. Overview & Vision

The **Adaptive Career Roadmap Engine** in KAABIL (काबिल) is an intelligent, dynamic guidance engine that generates structured, milestone-driven, multi-week developmental pathways for students across all 13 educational streams.

Rather than giving students rigid, one-size-fits-all checklists, the Adaptive Roadmap:
- **Tailors to Educational Stages**: Calibrated for Class 8–10 (exploratory & stream choice), Class 11–12 (board prep, foundational competencies & entrance exams), Undergraduates & Diploma/ITI (applied competencies, projects, certifications), and Working Professionals (lateral specialization).
- **Supports All 13 Streams**: Dedicated 12-week modular curriculums for Medical, Non-Medical, Commerce, Law, Humanities, Design, Agriculture, Vocational, Sports, Hospitality, and Undecided students.
- **Adapts Dynamically**: When a student marks activities completed, the completion percentage recalculates in real time. If a student changes goals, streams, or pacing, the roadmap can be regenerated via version-tracked history.
- **Integrates with NEP 2020**: Provides cross-stream bridging guidance when students transition between disparate fields.

---

## 2. Dynamic 12-Week Roadmap Structure

Each generated roadmap is organized into 12 structured weekly milestones, grouped into three progressive 4-week phases:

```
[ Weeks 1 - 4: Foundation & Domain Immersion ]
       │
       ▼
[ Weeks 5 - 8: Competency Building & Applied Projects ]
       │
       ▼
[ Weeks 9 - 12: Advanced Synthesis, Portfolio & Readiness ]
```

### Milestone Schema
Each weekly milestone contains:
- `weekNumber`: 1 through 12.
- `title`: Focused theme for the week (e.g. "Human Anatomy Fundamentals", "Statutory Interpretation & Landmark Case Analysis").
- `description`: Core learning objectives.
- `activities`: Array of actionable checklist items (`id`, `title`, `description`, `estimatedMinutes`, `isCompleted`).
- `deliverable`: Tangible outcome (e.g. "Comparative case brief", "Working prototype on GitHub", "Business model canvas").
- `isCompleted`: Boolean status automatically computed when all activities in that week are verified/checked.

---

## 3. All-Streams Pathway Coverage

The engine (`src/lib/roadmap/adaptive-roadmap-engine.ts`) implements canonical pathways across diverse streams:

1. **Medical (PCB)** (e.g., MBBS / Clinical Specialist):
   - Cell biology, genetics, human physiology, NEET diagnostic drills, clinical observation case analyses, pharmacology foundations.
2. **Non-Medical (PCM)** (e.g., AI Systems Engineer, Aerospace Designer):
   - High-performance computing, Python/C++, transformer architectures, physics simulation, vector databases, distributed system design.
3. **Commerce** (e.g., Chartered Accountant, Investment Analyst):
   - Financial accounting principles, corporate law, tax regulatory frameworks, financial modeling in Excel, equity valuation briefs.
4. **Law** (e.g., Corporate Advocate, Cyber Law Specialist):
   - Constitutional law, contract drafting, statutory interpretation, CLAT/Bar mock drills, moot court simulation briefs.
5. **Humanities & Civil Services** (e.g., Public Policy Analyst, IAS/Civil Servant):
   - Indian polity, macroeconomic analysis, ethics & governance, essay writing mastery, multilateral policy briefs.
6. **Design & Creative Arts** (e.g., UI/UX Architect, Product Designer):
   - Design thinking, Figma prototyping, usability testing, design systems, end-to-end portfolio review.
7. **Agriculture & Sustainable Tech** (e.g., Precision Agronomist):
   - Soil health analytics, IoT sensors in irrigation, crop lifecycle management, sustainable yield case studies.
8. **Vocational & Technical Trades** (e.g., Advanced CNC / Industrial Automation Technician):
   - Blueprint reading, PLC programming, preventive maintenance, industrial safety protocols, trade apprentice portfolio.
9. **Sports & Athletic Performance** (e.g., Sports Physiotherapist, Elite Coach):
   - Biomechanics, sports nutrition, periodized training design, injury rehabilitation protocols.
10. **Hospitality & Culinary Arts** (e.g., Luxury Hotelier, Executive Chef):
    - Food safety standards (HACCP), revenue management, guest experience curation, culinary technique masterclasses.

---

## 4. API Reference

### 4.1. `GET /api/student/roadmap`
- Fetches the active roadmap for the authenticated student, including all 12 weekly milestones and completion percentages.
- Automatically generates a baseline pathway if none exists.

### 4.2. `PATCH /api/student/roadmap/activity`
- Toggles the completion status of a specific activity item.
- Body: `{ milestoneId: string, activityId: string, isCompleted: boolean }`.
- Automatically recalculates milestone and overall roadmap completion percentage in PostgreSQL.

### 4.3. `POST /api/student/roadmap/regenerate`
- Safely archives current roadmap version to `RoadmapVersionHistory` and synthesizes a fresh 12-week roadmap based on updated career goals, stream, or difficulty level.
