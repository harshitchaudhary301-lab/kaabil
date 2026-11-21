# KAABIL (काबिल) — Vercel Production Deployment Guide

**Universal Career, Education, Skill Development & Employment Ecosystem**  
*Tagline: Discover Your Skills. Define Your Future.*  
*Core Principle: Every Stream. Every Skill. Every Future.*

---

## 1. Overview & Architecture on Vercel

KAABIL is built with **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM (PostgreSQL 15+)**.

When deploying to Vercel's serverless infrastructure:
1. **Compute**: Next.js App Router API routes execute inside Vercel Serverless Functions (AWS Lambda).
2. **Database**: PostgreSQL hosted on **Neon.tech**, **Supabase**, or **AWS RDS** with connection pooling.
3. **Storage & Fallback**: The persistent offline development store (`.dev-store`) gracefully switches to `/tmp/.dev-store` in ephemeral serverless environments.
4. **AI Intelligence**: Google Gemini 1.5 Pro / Flash models via the official Google Generative AI SDK.

---

## 2. Prerequisites

1. A **GitHub** account (to host your code repository).
2. A **Vercel** account ([https://vercel.com](https://vercel.com)).
3. A managed **PostgreSQL database** (we recommend **Neon.tech** or **Supabase** free tiers).
4. A **Google Gemini API Key** ([https://aistudio.google.com](https://aistudio.google.com)).

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Set Up Hosted PostgreSQL (Neon / Supabase)

#### Option A: Neon.tech (Recommended)
1. Go to [https://neon.tech](https://neon.tech) and create a free account.
2. Create a new project named `kaabil-prod`.
3. In your dashboard, locate the **Connection Details**:
   - Check **Pooled connection** (port 5432 or with `-pooler` suffix):
     ```
     DATABASE_URL="postgresql://user:password@ep-sample-123456-pooler.region.aws.neon.tech/neondb?sslmode=require"
     ```
   - Uncheck pooled connection to get the **Direct connection** (for migrations):
     ```
     DIRECT_URL="postgresql://user:password@ep-sample-123456.region.aws.neon.tech/neondb?sslmode=require"
     ```

#### Option B: Supabase
1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings → Database → Connection string**:
   - Transaction Mode (port 6543): `DATABASE_URL`
   - Session / Direct Mode (port 5432): `DIRECT_URL`

---

### Step 2: Push Database Schema to Hosted PostgreSQL

From your local machine or terminal:
```bash
# Push Prisma schema to your hosted PostgreSQL database:
npx prisma db push
```

Alternatively, run database seed to create initial roles and taxonomies:
```bash
npm run db:seed
```

---

### Step 3: Configure Vercel Project

1. Log in to [Vercel](https://vercel.com) and click **"Add New..." → "Project"**.
2. Select your imported GitHub repository (`kaabil`).
3. In **Build and Output Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npx prisma generate && next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

---

### Step 4: Add Environment Variables in Vercel

Navigate to the **Environment Variables** tab in your Vercel project settings and add the following keys:

| Environment Variable | Description | Example / Recommended Value |
|----------------------|-------------|-----------------------------|
| `DATABASE_URL` | Pooled PostgreSQL connection string | `postgresql://neondb_owner:...@...-pooler.aws.neon.tech/neondb?sslmode=require` |
| `DIRECT_URL` | Direct PostgreSQL connection string for Prisma | `postgresql://neondb_owner:...@...aws.neon.tech/neondb?sslmode=require` |
| `AUTH_SECRET` | 32+ char secret for JWT authentication | Generate via: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical production domain URL | `https://your-kaabil-app.vercel.app` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` (from Google AI Studio) |
| `CREDENTIAL_SIGNING_SECRET` | HMAC secret for Digital Skill Passport | `kaabil-prod-credential-signing-key-2026-min-32-chars` |
| `NEXT_PUBLIC_APP_ENV` | Application environment indicator | `production` |
| `NEXT_PUBLIC_APP_URL` | Public application URL | `https://your-kaabil-app.vercel.app` |
| `NEXT_PUBLIC_DEMO_MODE` | Disable demo bypasses in production | `false` |

---

### Step 5: Deploy & Verify

1. Click **"Deploy"**.
2. Vercel will build the Next.js production bundle, generate the Prisma client, and deploy the serverless functions.
3. When the build completes:
   - Visit `https://your-kaabil-app.vercel.app` to see the live Landing Page.
   - Navigate to `/login` to access the portals.
   - Access `/student/dashboard` to experience the redesigned Student Dashboard.
   - Verify that your database is connected by checking `/api/health` or `/api/system/status`.

---

## 4. Production Checklist

- [x] Prisma Client generated before `next build` (`npx prisma generate && next build`).
- [x] Both `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) configured in Prisma schema.
- [x] Read-only serverless filesystem addressed (`/tmp/.dev-store` fallback).
- [x] DPDP Act 2023 minor safeguards active.
- [x] Real Google Gemini fallback resilience configured.
- [x] `NEXT_PUBLIC_DEMO_MODE` set to `"false"` in production.
- [x] All `.env*` files excluded from Git tracking via `.gitignore`.
