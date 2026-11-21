# KAABIL Daily AI Missions Engine Specification

## 1. Overview & Non-Punitive Philosophy

The **Daily AI Missions Engine** in KAABIL (काबिल) provides students with bite-sized, high-impact career learning micro-activities (10–30 minutes) tailored to their target careers and educational stages.

### Core Philosophy
1. **Consistency Over Burnout**: Focuses on small daily actions that compound into deep career clarity over time.
2. **Strictly Non-Punitive**: Missing a day or skipping a task does **not** reset progress destructively. Students can choose to complete or skip missions without penalty.
3. **Stream-Specific Relevance**: Missions are customized across all 13 educational streams (Medical, Non-Medical, Commerce, Law, Humanities, Design, Agriculture, Vocational, Sports, Hospitality).
4. **Direct Feedback Loop to CRI**: Completing daily missions provides concrete evidence that boosts Dimension 1 (Career Knowledge) and Dimension 5 (Milestone Progress) of the Career Readiness Index.

---

## 2. Mission Types & Architecture

Missions fall into four primary pedagogical categories:

```
┌────────────────────────────────────────────────────────┐
│               Daily AI Mission Typology               │
├───────────────────┬────────────────────────────────────┤
│ DISCOVERY         │ Exploration of market trends,      │
│ (10-15 mins)      │ day-in-the-life realities & paths  │
├───────────────────┼────────────────────────────────────┤
│ SKILL_CHALLENGE   │ Micro-problems, conceptual quizzes │
│ (15-25 mins)      │ & scenario analysis               │
├───────────────────┼────────────────────────────────────┤
│ INDUSTRY_INSIGHT  │ Policy updates, salary metrics &   │
│ (10-20 mins)      │ regulatory shifts in India         │
├───────────────────┼────────────────────────────────────┤
│ PRACTICAL_ACTION  │ Concrete outputs (e.g. briefs,    │
│ (20-30 mins)      │ models, sketches, calculations)    │
└───────────────────┴────────────────────────────────────┘
```

---

## 3. Daily Synthesis Engine

The engine (`src/lib/missions/daily-missions-engine.ts`) dynamically generates missions:

1. **Target Identification**: Retrieves the student's active career goal or defaults to their current stream focus.
2. **Contextual Calibration**: Matches task complexity to academic stage (Class 8–10 get conceptual exploration, Undergraduates get practical case drills).
3. **Daily Cadence**: Generates 2 fresh missions per day (1 core competency challenge + 1 industry insight / practical action).
4. **Persistence & Streaks**: Stores missions in PostgreSQL under `DailyMission`. Streaks increment upon successful completion within consecutive 24-to-48 hour windows.

---

## 4. Submission & Reflection Protocol

To ensure genuine engagement rather than mindless clicking, mission completion requires active reflection:
- `reflectionNote`: Student's qualitative takeaway or summary of work done (minimum 10 characters).
- `userRating`: Feedback on task quality (1 to 5 stars).
- `confidenceGain`: Self-assessed boost in confidence (1 to 5 scale).

---

## 5. API Reference

### 5.1. `GET /api/student/missions`
- Returns today's active missions, completion counts, and current streak statistics.
- Automatically instantiates new daily missions if none exist for the current date.

### 5.2. `POST /api/student/missions/complete`
- Body:
```json
{
  "missionId": "cm3...",
  "reflectionNote": "Analyzed the corporate debt restructuring framework under IBC 2016.",
  "userRating": 5,
  "confidenceGain": 4
}
```
- Marks mission as `COMPLETED`, records completion timestamp, and increments streak.

### 5.3. `POST /api/student/missions/skip`
- Body: `{ "missionId": "cm3..." }`
- Marks mission as `SKIPPED` without deducting streak or readiness points.
