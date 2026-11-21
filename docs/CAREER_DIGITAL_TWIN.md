# KAABIL Career Digital Twin (CDT) Architecture & Specification

## 1. Overview & Core Philosophy

The **Career Digital Twin (CDT)** in KAABIL (काबिल) is an evolving, multi-dimensional, live digital model of a student's evolving academic trajectory, validated capabilities, aspirational horizons, learning velocity, and readiness across any educational stream.

Rather than being a static resume or flat profile, the Digital Twin serves as the single source of truth for all intelligent career steering in KAABIL. It dynamically reconciles:
- What the student aspires to become (Target Career Horizons across 13 stream domains).
- Where the student currently stands (Academic stage, enrolled stream, verified vs self-reported skills).
- What gaps must be bridged (Knowledge, experiential, and skill prerequisites).
- How fast the student is progressing (Learning velocity, mission streaks, roadmap milestones completed).

---

## 2. Core Principles & Data Ethics

### 2.1. Strict Separation of Verified vs. Self-Reported Capabilities
In accordance with KAABIL's zero-faked-readiness standard:
- **Verified Skills**: Backed by formal proctored/unproctored skill challenges, academic credentials, competitive examinations, or validated portfolio artifacts. Weighted at 100% value.
- **Self-Reported Skills**: Declared by students during onboarding or profile editing. Discounted (0.4x–0.5x credit) pending verification. Clearly labeled with badges in the UI.

### 2.2. Zero Fabrication & Honest Unassessed States
If a student has just registered or lacks assessment evidence, the Digital Twin does **not** invent arbitrary scores (such as 85% or 72%). Instead, readiness is explicitly reported as:
- `UNASSESSED`: No activity or assessment completed.
- `INSUFFICIENT_EVIDENCE`: Initial preferences set, but no verified skills or milestone achievements recorded yet.

### 2.3. DPDP Act (2023) Compliance & Minor Protection
- Under the Digital Personal Data Protection (DPDP) Act of India, student privacy is strictly enforced.
- **Minors (< 18 years)**: Recruiter discovery and public talent indexing are strictly forbidden. The `isPublic` flag is locked to `false`, and no employer or external agent may view or query minor profiles without parental consent.
- **Adult Students (>= 18 years)**: Recruiter discovery is opt-in, privacy-preserving, and controllable via Student Settings.

---

## 3. Data Model Architecture

The Digital Twin is persisted in PostgreSQL via Prisma:

```prisma
model CareerDigitalTwin {
  id                    String         @id @default(cuid())
  studentProfileId      String         @unique
  studentProfile        StudentProfile @relation(fields: [studentProfileId], references: [id], onDelete: Cascade)
  readinessScore        Int?           // 0-100; null if unassessed
  learningVelocityIndex Float          @default(1.0)
  strengthsSummary      String[]
  priorityGapsSummary   String[]
  lastCalculatedAt      DateTime       @default(now())
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt
}
```

It synthesizes data across:
1. `StudentProfile` (Stream, education stage, NEP 2020 cluster, target completion year).
2. `UserSkill` & `Skill` (Categorized by domain, level, verified status, verification source).
3. `CareerGoal` & `CareerPath` (Primary, secondary, and alternative target careers).
4. `UserRoadmap` & `WeeklyMilestone` (Current active pathway, completed milestones, pending activities).
5. `DailyMission` (Completed micro-learning missions, streaks, learning feedback).

---

## 4. Aggregation & Computation Service

The service `CareerDigitalTwinService` (`src/lib/digital-twin/digital-twin-service.ts`) executes dynamic aggregation:

1. **Identity & Academic Foundation**:
   - Extracts current stage (e.g. `CLASS_10`, `CLASS_12`, `UNDERGRADUATE`) and stream (e.g. `MEDICAL_PCB`, `NON_MEDICAL_PCM`, `COMMERCE`, `ARTS_HUMANITIES`, `VOCATIONAL`).
   - Resolves target completion year and school/institution affiliation.

2. **Target Horizons**:
   - Maps student career goals into prioritized horizons (Primary target, Secondary target, Long-term horizon).
   - Enriches each horizon with stream category, salary trajectory, and eligibility criteria from the universal career database.

3. **Skills Matrix**:
   - Groups student skills into Verified vs. Self-Reported.
   - Calculates verification ratio (`verifiedSkills / totalSkills`).

4. **Priority Development Areas**:
   - Performs a gap analysis between the target career benchmark skills (`SkillBenchmark[]`) and the student's documented skills.
   - Highlights mandatory requirements vs. recommended proficiencies.

5. **Learning Velocity & Progress**:
   - Analyzes roadmap activity completion rates over rolling 30-day windows.
   - Calculates milestone completion percentage and streak continuity.

---

## 5. API Endpoints

### 5.1. `GET /api/student/digital-twin`
- **Authentication**: Requires valid student session (`ROLE: STUDENT`).
- **Response**: Full `CareerDigitalTwinData` payload including educational summary, target horizons, verified skills, self-reported skills, development areas, and learning velocity.

### 5.2. `POST /api/student/digital-twin`
- **Authentication**: Requires valid student session (`ROLE: STUDENT`).
- **Payload**: Optional updates to target career horizons, recalculation trigger, or privacy preferences.
- **Response**: Refreshed Digital Twin snapshot persisted to database.

---

## 6. UI Implementation (`/student/digital-twin`)

The dedicated student Digital Twin interface includes:
- **Capability Matrix**: Visual breakdown of verified competencies with source indicators.
- **Aspirational Horizons**: Visual card deck showing target careers with entry stage requirements.
- **Priority Gaps Card**: Action-oriented list of missing competencies with quick links to adaptive roadmap milestones.
- **Velocity Tracker**: Interactive chart/indicator of weekly learning pace and milestone completion.
