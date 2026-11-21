# DATABASE_PLAN.md — Relational Schema & Data Architecture

## Project: KAABIL (काबिल)
**Database Engine:** PostgreSQL 15+ / 16+  
**ORM:** Prisma ORM 5.22+ with Strict TypeScript Typing  
**Multi-Tenancy Strategy:** Shared Database with Tenant Column Isolation (`organizationId`) & Application-Layer Guardrails  
**Compliance Standard:** Digital Personal Data Protection (DPDP) Act 2023  
**Status:** Schema Defined, Client Generated, Repositories Operational, 17/17 Unit Tests Passing  

---

## 1. Architectural Philosophy & Integrity Guardrails

1. **Configurable Career Taxonomy**: Career domains, sub-domains, career pathways, competencies, and entrance examinations are dynamic relational entities stored in PostgreSQL tables, not hardcoded constants. New career fields can be created without changing frontend code.
2. **Multi-Stream Elasticity**: No student is locked into rigid silos. While pathways have a primary stream, the `CareerPathStream` junction table models interdisciplinary and bridge pathways accessible from other streams via entrance exams or conversion courses.
3. **Statutory Qualifications vs. AI Recommendations**: Formal regulatory requirements (e.g. NMC, BCI, ICAI, Council of Architecture) are modeled separately in `CareerQualification` and `EligibilityRule` tables from probabilistic AI mentor suggestions.
4. **Child Privacy & Minor Safety by Design**: 
   - Minors (`isMinor: true`) have `PrivacyPreference.allowRecruiterView = false` strictly enforced.
   - All parental/guardian consents are timestamped with IP and user-agent in `ConsentRecord`.
   - Recruiter search queries apply mandatory filter `{ isMinor: false }`.
5. **Explainability by Design**:
   - CRI calculations store formula breakdown components (`weightedCoverage`, `practicalRatio`, `academicRatio`, `verifiedRatio`) in `CareerReadinessSnapshot`.
   - Employer matches store transparent rubric math in `CandidateMatch.breakdownJson`.

---

## 2. Relational Entity Architecture

```
                    ┌─────────────────────────┐
                    │          User           │
                    └────────────┬────────────┘
                                 │ 1:1
               ┌─────────────────┴─────────────────┐
               ▼                                   ▼
     ┌──────────────────┐                ┌───────────────────┐
     │  StudentProfile  │                │OrganizationMember │
     └─────────┬────────┘                └─────────┬─────────┘
               │                                   │ N:1
               │ 1:N                               ▼
               ├───────────────┐         ┌───────────────────┐
               ▼               ▼         │   Organization    │
       ┌──────────────┐ ┌─────────────┐  │(Inst. or Employer)│
       │  UserSkill   │ │ UserRoadmap │  └─────────┬─────────┘
       └───────┬──────┘ └──────┬──────┘            │
               │ 1:N           │ 1:N               ▼
               ▼               ▼         ┌───────────────────┐
       ┌──────────────┐ ┌─────────────┐  │JobPosting / Cohort│
       │SkillEvidence │ │WeeklyMilest.│  └─────────┬─────────┘
       └──────────────┘ └─────────────┘            │
                                                   ▼
                                         ┌───────────────────┐
                                         │  CandidateMatch   │
                                         └───────────────────┘

 ═══════════════════════════════════════════════════════════════════════════
                    UNIVERSAL CAREER INTELLIGENCE GRAPH
 ═══════════════════════════════════════════════════════════════════════════
   ┌──────────────┐ 1:N ┌──────────────┐ 1:N ┌─────────────────────────┐
   │    Domain    │────►│  SubDomain   │────►│       CareerPath        │
   │ (13 Streams) │     └──────────────┘     └──────┬──────┬──────┬────┘
   └──────────────┘                                 │      │      │
           ┌────────────────────────────────────────┘      │      │
           │ 1:N                                           │ 1:N  │ 1:N
           ▼                                               ▼      ▼
   ┌──────────────────────┐                     ┌─────────────┐ ┌─────────────┐
   │   CareerPathStream   │                     │CareerPathEx.│ │RoadmapTempl.│
   │(Multi-Stream Bridges)│                     └──────┬──────┘ └─────────────┘
   └──────────────────────┘                            │ N:1
                                                       ▼
                                                ┌─────────────┐
                                                │EntranceExam │
                                                └─────────────┘
```

---

## 3. Database Setup Options (Free-First Approach)

### Option A: Local PostgreSQL (Recommended for Offline Development)

1. **Install PostgreSQL on Windows**:
   - Download the official installer from [EnterpriseDB PostgreSQL](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) (PostgreSQL 16 recommended) or via Windows Package Manager:
     ```powershell
     winget install PostgreSQL.PostgreSQL.16
     ```
   - During setup, set a secure local password for the `postgres` user (e.g. `postgres` or your private password).
   - Keep the default port `5432`.

2. **Create the Database**:
   - Open PowerShell or `psql`:
     ```powershell
     psql -U postgres -c "CREATE DATABASE kaabil_dev;"
     ```

3. **Configure Your Private `.env` File**:
   - In `C:\Users\Harshit\.gemini\antigravity\scratch\kaabil\.env`:
     ```env
     DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/kaabil_dev?schema=public"
     ```
   *(Note: `.env` and `.env.local` are strictly excluded from Git in `.gitignore`)*

4. **Run Migrations & Seed**:
   ```powershell
   cd "C:\Users\Harshit\.gemini\antigravity\scratch\kaabil"
   npx prisma migrate dev --name init_kaabil_schema
   npm run seed
   ```

---

### Option B: Free Managed Neon PostgreSQL (Serverless Cloud, Zero Installation)

1. Sign up for a free tier at [neon.tech](https://neon.tech) (Free tier includes 0.5 GiB storage, 1 project, instantaneous branching).
2. Create a project named `kaabil-dev`.
3. Copy the pooled connection string from the Neon dashboard.
4. Add it to your local private `.env` file:
   ```env
   DATABASE_URL="postgresql://neondb_owner:YOUR_SECRET@ep-sample-123456.ap-southeast-1.aws.neon.tech/kaabil_dev?sslmode=require"
   ```
5. Apply migrations and seed:
   ```powershell
   npx prisma db push
   npm run seed
   ```

---

## 4. Migration & Seeding Procedures

### Schema Validation
```powershell
npx prisma validate
```

### Prisma Client Generation
```powershell
npx prisma generate
```

### Idempotent Database Seed
```powershell
# Executes the native runner with upsert logic:
npm run seed
# or: node prisma/seed.js
```

The seed script is fully idempotent: repeated runs update existing records without creating duplicates.

---

## 5. Offline Fallback & Reliability Architecture

When PostgreSQL is temporarily unreachable or undergoing maintenance:
- The singleton client (`src/lib/db.ts`) probes connectivity with a 2500ms timeout cache.
- The `StreamRepository` and `CareerRepository` gracefully serve from the verified local baseline (`src/data/careersData.ts`).
- The API explicitly returns:
  ```json
  {
    "source": "local_catalogue",
    "isDbConnected": false,
    "dbMessage": "Database unreachable or unconfigured..."
  }
  ```
- The frontend UI displays a transparent status badge: `PostgreSQL Offline • Serving Verified Local Baseline (13 Pathways)` alongside `Demonstration Data`.
- The website never crashes, freezes, or silently fabricates synthetic data.
