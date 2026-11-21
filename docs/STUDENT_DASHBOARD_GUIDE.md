# KAABIL Student Dashboard Guide

## 1. Overview & Architecture

The **KAABIL Student Dashboard** (`/student/dashboard`) is the central command center for learners across all 13 educational streams. It connects directly to the PostgreSQL database via REST APIs to provide real-time career guidance, skill tracking, daily micro-learning, and adaptive milestones.

Unlike static demo dashboards, the KAABIL dashboard:
- Fetches real data from Prisma models (`StudentProfile`, `UserRoadmap`, `DailyMission`, `CareerReadinessSnapshot`).
- Disables fake or invented progress scores for newly registered students.
- Synchronizes checkbox clicks and mission reflections immediately with the database.

---

## 2. Dashboard Layout & Components

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KAABIL STUDENT DASHBOARD                        │
├────────────────────────────────────────────────────────────────────────┤
│ [Header] Student Name · Stream Badge · Stage Badge · Streak Counter     │
├──────────────────────────────────┬─────────────────────────────────────┤
│  CAREER READINESS INDEX (CRI)    │  DAILY AI MISSIONS                  │
│  - Overall Score or Unassessed   │  - 2 Daily micro-learning tasks     │
│  - 5 Dimension Breakdown         │  - Interactive Reflection Modal     │
│  - Evidence & Missing Actions    │  - Non-punitive skip option         │
├──────────────────────────────────┴─────────────────────────────────────┤
│  ACTIVE 12-WEEK ADAPTIVE ROADMAP                                       │
│  - Current Active Week (1 to 12) & Deliverable                          │
│  - Interactive Activity Checkboxes (live PATCH database sync)           │
│  - Regenerate Pathway Trigger                                          │
├────────────────────────────────────────────────────────────────────────┤
│  QUICK ACTION PORTALS                                                  │
│  - Career Digital Twin · Career Discovery · Compare · Settings         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Interactive Features & Data Flow

### 3.1. Career Readiness Index (CRI) Widget
- **Live Endpoint**: `GET /api/student/readiness`
- Displays overall readiness score (0–100) or explicit `UNASSESSED` / `INSUFFICIENT_EVIDENCE` badges.
- Expands to show the 5 dimensions: Career Knowledge (20%), Educational Preparation (25%), Skill Development (25%), Practical Learning (15%), and Milestone Progress (15%).
- Lists verified evidence vs missing development steps.

### 3.2. Daily AI Missions Section
- **Live Endpoint**: `GET /api/student/missions`
- Displays today's personalized missions with stream-specific tags and estimated time (10–30 mins).
- Clicking "Complete Mission" opens an interactive modal:
  - Text area for reflection note (minimum 10 characters).
  - Star rating (1 to 5) for task quality.
  - Confidence gain slider/rating (1 to 5).
  - Submits to `POST /api/student/missions/complete`, updating streak and badge state.
- Clicking "Skip" sends `POST /api/student/missions/skip` without penalty.

### 3.3. Adaptive Roadmap Checklist
- **Live Endpoint**: `GET /api/student/roadmap`
- Renders the current active week's milestone and concrete activities.
- Each activity has an interactive checkbox. Checking/unchecking triggers:
  - `PATCH /api/student/roadmap/activity`
  - Instantly recalculates milestone progress and overall roadmap completion percentage.

### 3.4. Navigation Bar
- Seamless one-click access to:
  - **Dashboard**: `/student/dashboard`
  - **Digital Twin**: `/student/digital-twin`
  - **Discover**: `/student/discover`
  - **Settings**: `/student/settings`
