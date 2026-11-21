# KAABIL (काबिल) — Beginner's Quick Start Guide for Windows & VS Code

**Platform Tagline:** Discover Your Skills. Define Your Future.  
**Core Principle:** Every Stream. Every Skill. Every Future.  

Welcome to **KAABIL**! This step-by-step guide is designed to help anyone—including beginners—get the complete KAABIL platform running on Windows 10/11 using Visual Studio Code.

---

## 1. Prerequisites (Free Tools to Install)

Before you start, make sure you have installed:
1. **Node.js (v18.17+ or v20 LTS recommended):**  
   Download and install the LTS version from [https://nodejs.org/](https://nodejs.org/).  
   *Verify in PowerShell:* `node -v` (should show v18.x or v20.x) and `npm -v`.
2. **Visual Studio Code (VS Code):**  
   Download from [https://code.visualstudio.com/](https://code.visualstudio.com/).
3. **Git for Windows (Optional but recommended):**  
   Download from [https://git-scm.com/](https://git-scm.com/).

---

## 2. Opening the Project in VS Code

1. Unzip the downloaded project archive `KAABIL_Final_FullStack_Project.zip` into a directory of your choice (e.g. `C:\Users\YourName\kaabil`).
2. Open **VS Code**.
3. Click **File** $\to$ **Open Folder...** (or press `Ctrl + K, Ctrl + O`).
4. Select the unpacked `kaabil` folder and click **Select Folder**.
5. Open an integrated terminal in VS Code:
   - Press **`Ctrl + \``** (backtick) or go to **Terminal** $\to$ **New Terminal**.
   - Make sure your terminal prompt says `PowerShell` or `Command Prompt`.

---

## 3. Installing Dependencies

In the VS Code terminal, run:

```powershell
npm install
```

*This will install all required Next.js, React, Tailwind, and Prisma packages.*

---

## 4. Configuring Environment Variables

Create your local environment configuration file:

```powershell
Copy-Item .env.example .env
```

Now open `.env` in VS Code to inspect the settings:
- **`DATABASE_URL`**:
  - **Option 1 (Zero-Install Offline Resilience - Recommended for Quick Testing):** You do NOT need to install PostgreSQL! The platform automatically detects when PostgreSQL is offline and switches to the disk-backed `.dev-store/store.json` data store. Everything works out of the box with zero setup!
  - **Option 2 (Local PostgreSQL):** If you have PostgreSQL installed on Windows, set:  
    `DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/kaabil_dev?schema=public"`
  - **Option 3 (Free Cloud Neon Database):** Create a free account at [https://neon.tech](https://neon.tech), create a project, and paste your connection URL.
- **`AUTH_SECRET`**: Pre-filled with a secure default for development.
- **`CREDENTIAL_SIGNING_SECRET`**: Pre-filled with a development HMAC key.
- **`GEMINI_API_KEY`**: Optional. If omitted, the platform uses its deterministic career intelligence engine with clear labeling. To activate live Gemini 2.0 Flash AI, get a free key from [https://aistudio.google.com/](https://aistudio.google.com/) and paste it here.

---

## 5. Generating Database Client & Seeds

Run the following command to generate the Prisma client:

```powershell
npx prisma generate
```

*(Optional: If you connected a real PostgreSQL database, run `npx prisma migrate deploy` and `npm run db:seed`)*.

---

## 6. Running the Development Server

Start the local server:

```powershell
npm run dev
```

You should see output similar to:
```
  ▲ Next.js 14.2.23
  - Local:        http://localhost:3000
  - Network:      http://...
 ✓ Ready in 1.8s
```

Now open your web browser (Chrome, Edge, or Firefox) and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 7. Exploring the 4 Portals (Fictional Demo Logins)

The platform includes full demonstration accounts to explore all portals immediately:

### 🎓 1. Student Portal (`/student/dashboard`)
- **Direct Link:** [http://localhost:3000/student/dashboard](http://localhost:3000/student/dashboard)
- **Features to try:**
  - View Career Readiness Index (CRI) with animated SVG `ScoreRing`.
  - Inspect 5-axis `SkillRadar` chart.
  - Review DPDP Act (2023) minor student privacy banner.
  - Explore Daily AI Missions, Digital Skill Passport (`/student/passport`), and AI Career Mentor (`/student/mentor`).

### 🏛️ 2. Institution Console (`/institution/dashboard`)
- **Direct Link:** [http://localhost:3000/institution/dashboard](http://localhost:3000/institution/dashboard)
- **Features to try:**
  - AISHE and NAAC A+ accreditation status badges.
  - Student Cohort analytics across 13 educational streams.
  - Multi-stream Skill Heatmap (`/institution/analytics`).
  - Student Interventions (`/institution/interventions`) and Campus Join Code.

### 💼 3. Employer Console (`/employer/dashboard`)
- **Direct Link:** [http://localhost:3000/employer/dashboard](http://localhost:3000/employer/dashboard)
- **Features to try:**
  - MCA CIN verified corporate profile.
  - Two-way explainable talent matching (`/employer/matching`).
  - Kanban Recruitment Pipeline (`/employer/pipeline`).
  - Digital Skill Passport verification (`/employer/passport-verify`).
  - Statutory DPDP safeguard notice shielding minors under 18 from recruitment.

### 🛡️ 4. Admin Governance Console (`/admin/dashboard`)
- **Direct Link:** [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)
- **Features to try:**
  - Operational platform telemetry and Gemini AI latency monitor.
  - Trust & Safety Verification Directorate for pending college and company KYCs.
  - User management and DPDP account deletion directorate (`/admin/users`).

---

## 8. Running Automated Tests

To verify that all 49 test suites and 235 tests pass on your machine:

```powershell
npm test
```

---

## 9. Building & Running in Production Mode

To test the optimized production build:

```powershell
# 1. Build the application
npm run build

# 2. Start the production server
npm run start
```

---

## 10. Troubleshooting Common Windows Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **`EPERM: operation not permitted`** | Windows file lock on `.next` folder | Delete the `.next` folder (`Remove-Item -Recurse -Force .next`) and run `npm run build` again. |
| **`Port 3000 is already in use`** | Another node process is running | Run `Stop-Process -Name node -Force` or run on a different port: `npm run dev -- -p 3001`. |
| **`Database connection error`** | PostgreSQL is not running | No action required! KAABIL automatically falls back to `.dev-store/store.json` without failing. |
| **`Missing script: "start"`** | Wrong working directory | Make sure you are in the directory containing `package.json`. |
