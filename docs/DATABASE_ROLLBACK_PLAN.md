# DATABASE_ROLLBACK_PLAN.md — Verified Production Recovery & Rollback Strategy

> **System**: KAABIL (काबिल) Career & Education Ecosystem  
> **Environment**: Neon Serverless PostgreSQL (`neondb`, AWS us-east-1)  
> **ORM & Migration Tool**: Prisma ORM v6 with PgBouncer connection pooling  
> **Document Status**: Production Operational Standard (Phase 4)  
> **Safety Directive**: DO NOT execute live database migration or restoration during routine code inspection.

---

## 1. Executive Summary & Clarification of Common Misconceptions

### 1.1 Why `node prisma/seed.js` Is NOT a Database Rollback
A common misconception in early development phases was assuming that running `node prisma/seed.js` serves as a database rollback or restoration procedure. **This assumption is false and unsafe for production operations for the following reasons:**

1. **Upsert vs. Recovery**: `node prisma/seed.js` executes `upsert` queries on baseline domain definitions, 13 canonical careers, standard skill categories, entrance exams, and a single demo user.
2. **Zero Recovery of Student Data**: It does not recover or restore mutated, corrupted, or deleted student profiles (`StudentProfile`), authenticated users (`User`), assessment attempts (`StudentAssessmentAttempt`), skill passport records (`DigitalPassport`), roadmap milestones (`UserRoadmap`), or project deliverables (`StudentProjectSubmission`).
3. **No Schema Rollback**: If a bad Prisma migration altered table constraints, dropped columns, renamed relations, or introduced invalid foreign key definitions, `seed.js` cannot revert the schema. Running `seed.js` against a broken schema will simply crash with Prisma foreign key or constraint errors.
4. **Baseline Incompleteness**: Upserting 13 baseline records into a production database that should contain 134 authentic careers and real student progress records does not restore prior state; it only overwrites or inserts those 13 baseline rows.

### 1.2 Distinguishing Application Fallback from Database Recovery
KAABIL implements a dual-layer resilience architecture. It is vital to maintain a clear operational boundary between these two layers:

| Layer | Mechanism | Scope | Purpose | What It Does NOT Do |
| :--- | :--- | :--- | :--- | :--- |
| **Application Fallback** | `CareerRepository` local catalog (`CAREER_PATHS_DATABASE`), `devStore` memory/disk cache | Read availability & graceful degradation | Prevents 500 errors and keeps student portal operational during transient DB outages, cold starts, or network timeouts ($>2500\text{ms}$). | Does NOT repair PostgreSQL, does NOT recover lost database transactions, and does NOT persist writes to disk. |
| **Database Recovery** | Neon point-in-time branch restoration, automated WAL replay, logical `pg_dump` backups | Storage state & relational integrity | Restores actual relational state, table schemas, indices, and foreign-key integrity in PostgreSQL. | Not a real-time HTTP fallback; requires controlled operational execution. |

---

## 2. Pre-Migration Safety: Database Branching & Backup Architecture

Before applying any migration (`prisma migrate deploy` or manual DDL schema changes) to the live Neon PostgreSQL database, the following zero-downtime branching and backup workflow must be enforced.

```
       [Live Production Neon Branch: 'main']
                       │
       ┌───────────────┴───────────────┐
       ▼ (Instant Copy-on-Write)        ▼
[Pre-Migration Branch: 'backup-YYYYMMDD-HHMM']   [Staging Migration Test Branch]
       │                                                 │
       │ (Preserved untouched)                           │ (Test `prisma migrate deploy`)
       │                                                 ▼
       │                                   [Verify FKs, Data & Queries]
       │                                                 │
       ▼                                                 ▼ (If verified)
[Safe Fallback Pointer]                        [Apply to Production 'main']
```

### 2.1 Strategy A: Neon Instant Point-in-Time Database Branching (Recommended)
Neon serverless PostgreSQL separates compute from storage, allowing instantaneous, space-efficient **Copy-on-Write (CoW)** branches with zero downtime.

#### Step 1: Create Pre-Migration Point-in-Time Branch
Prior to triggering any migration script, capture a snapshot branch directly via the Neon CLI or API:
```bash
# 1. Authenticate with Neon CLI
neon auth

# 2. Create isolated point-in-time branch from production 'main' branch
neon branches create \
  --project-id icy-heart-79451826 \
  --name pre-migration-$(date +%Y%m%d-%H%M%S) \
  --parent main
```
*Latency: $<1000\text{ms}$. Zero locking on production database.*

#### Step 2: Record Branch Connection Strings
Store the connection string for the pre-migration branch in the secure operational key-vault:
```bash
# Obtain direct and pooled URLs of the snapshot branch
neon connection-string pre-migration-YYYYMMDD-HHMM --project-id icy-heart-79451826
```

### 2.2 Strategy B: Logical Dump Backup (`pg_dump`)
For off-site disaster recovery and compliance with DPDP Act data protection standards, execute a logical schema and data dump:
```bash
# Run logical pg_dump against DIRECT_URL (bypassing PgBouncer)
pg_dump "$DIRECT_URL" \
  --format=custom \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --file="kaabil-backup-$(date +%Y%m%d-%H%M%S).dump"
```

---

## 3. Tested Recovery Procedure Using an Isolated Database

If a migration fails, corrupts relational state, or violates foreign key constraints, follow this step-by-step restoration procedure **strictly using an isolated staging branch first**:

```mermaid
flowchart TD
    A["Migration Anomaly Detected"] --> B["Freeze Write Traffic on App"]
    B --> C["Spin up Isolated Recovery DB Branch"]
    C --> D["Restore Point-in-Time State to Recovery DB"]
    D --> E["Run Automated Referential Integrity Audit"]
    E -->|Audit Fails| F["Debug Migration & Replay Fixes on Recovery DB"]
    F --> E
    E -->|Audit Passes| G["Switch Vercel Connection Pooling Target to Recovery DB"]
    G --> H["Verify Live Student Sessions & Health Check"]
    H --> I["Resume Normal Traffic"]
```

### Step 3.1: Isolate the Incident
1. Stop any pending migration pipelines or batch import processes.
2. Verify application fallback is serving read requests safely via `devStore` and `CAREER_PATHS_DATABASE`.

### Step 3.2: Provision Isolated Recovery Branch
Do **not** perform destructive drop or truncate operations on the live production branch. Instead, create a clean recovery target branch:
```bash
neon branches create \
  --project-id icy-heart-79451826 \
  --name staging-recovery-verification \
  --parent pre-migration-YYYYMMDD-HHMM
```

### Step 3.3: Verify Foreign Key Relationships & Data Integrity
Execute the automated integrity validation script against the isolated recovery instance:
```bash
# Set environment to recovery branch
export DATABASE_URL="postgresql://neondb_owner:[PASSWORD]@ep-recovery-...pooler.neon.tech/neondb?sslmode=require"
export DIRECT_URL="postgresql://neondb_owner:[PASSWORD]@ep-recovery-...neon.tech/neondb?sslmode=require"

# Run non-destructive integrity audit
npx tsx scripts/verify-database-integrity.ts
```

The integrity verification must assert:
1. **Student Account Invariance**: `User` count matches `StudentProfile` count; all user credentials and role types (`STUDENT`, `INSTITUTION`, `EMPLOYER`, `ADMIN`) remain valid.
2. **Passport Referential Integrity**: Every `DigitalPassport` has an existing `StudentProfile` (`DigitalPassport.studentProfileId -> StudentProfile.id`).
3. **Assessment Attempt Integrity**: Every `StudentAssessmentAttempt` maps to an existing `Assessment` and `StudentProfile`.
4. **Roadmap Progress Preservation**: All `UserRoadmap` records retain completed `RoadmapMilestone` statuses.
5. **Skill Graph Linkages**: All `StudentSkill` records reference valid `Skill` IDs and preserve 3-tier provenance (`PLATFORM_ASSESSED`, `SELF_REPORTED`, `EXTERNALLY_VERIFIED`).

### Step 3.4: Atomic Production Traffic Cutover
Once the isolated recovery database passes all integrity assertions:
1. In Vercel Project Settings, update the production environment variables:
   - `DATABASE_URL`: `postgresql://neondb_owner:[SECRET]@ep-recovered-pooler.neon.tech/neondb?sslmode=require`
   - `DIRECT_URL`: `postgresql://neondb_owner:[SECRET]@ep-recovered.neon.tech/neondb?sslmode=require`
2. Trigger an atomic zero-downtime redeployment or instant environment variable promotion.
3. Validate `GET https://kaabil-eta.vercel.app/api/health` returns:
   ```json
   {
     "status": "healthy",
     "database": {
       "connected": true,
       "provider": "postgresql"
     }
   }
   ```
4. Confirm student login, passport viewing, and CRI calculations operate with 100% data fidelity.

---

## 4. Preservation Matrix: Critical Entities & Foreign Keys

The rollback and recovery procedure guarantees the preservation of all dependent relationships:

```
User (id, email, role, passwordHash)
  ├── StudentProfile (userId, currentStream, educationStage)
  │     ├── PrivacyPreference (studentProfileId)
  │     ├── DigitalPassport (studentProfileId, passportCode, checksum)
  │     │     ├── StudentSkill (passportId, skillId, provenanceTier)
  │     │     └── PassportShareToken (passportId, token, expiresAt)
  │     ├── CareerReadinessSnapshot (studentProfileId, overallScore, dimensions)
  │     ├── CareerDigitalTwin (studentProfileId, targetCareerSlug, horizons)
  │     ├── UserRoadmap (studentProfileId, targetCareerSlug, completedMilestones)
  │     ├── StudentAssessmentAttempt (studentProfileId, assessmentId, score, answers)
  │     └── StudentProjectSubmission (studentProfileId, projectId, deliverableUrl)
  ├── OrganizationMembership (userId, organizationId)
  └── AuditLog (userId, action, ipAddress, timestamp)
```

No rollback procedure may orphan child records or execute cascading deletes (`ON DELETE CASCADE`) against student educational artifacts.

---

## 5. Summary of Operational Guardrails

- [x] `node prisma/seed.js` is strictly catalog initialization and demo data seeding, never a rollback tool.
- [x] Application memory/disk fallback (`devStore`) ensures high-availability reads, but is distinct from database state restoration.
- [x] Neon point-in-time branch creation is the mandatory prerequisite before applying migrations.
- [x] Recovery testing is executed exclusively on isolated staging branches.
- [x] Production migrations or restorations are NEVER run during development/audit sessions without explicit user authorization.
