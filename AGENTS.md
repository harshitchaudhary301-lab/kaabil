# AGENTS.md — Development Guidance for KAABIL Ecosystem

> **Current Status**: Project Architecture & Documentation Phase Complete. Awaiting Phase 1 Implementation Prompt.  
> **Target Framework**: Next.js 15 App Router (Modular Monolith) with TypeScript (Strict Mode), PostgreSQL, Prisma ORM, Auth.js, Tailwind CSS, Shadcn/UI, and Gemini API.  
> **Workspace Location**: `C:\Users\Harshit\.gemini\antigravity\scratch\kaabil`

---

## 1. Core Mission & Philosophy

You are working on **KAABIL** (काबिल) — an AI-Powered Universal Career, Education, Skill Development, and Employment Ecosystem designed for India.

- **Tagline**: *Discover Your Skills. Define Your Future.*
- **Brand Message**: *Every Stream. Every Skill. Every Future.*
- **Core Principle**: KAABIL is **NEVER** limited to engineering, coding, or technology. It is a universal ecosystem built from the ground up for **ALL** educational streams and career pathways.

### Universal Stream Coverage
KAABIL explicitly supports:
1. **Medical & Healthcare (PCB)**: MBBS, BDS, BAMS, BHMS, Nursing, Allied Health, Pharmacy, Physiotherapy, Biotechnology.
2. **Non-Medical / STEM (PCM)**: Engineering, Pure Sciences, Mathematics, Statistics, Data Science, Architecture, Aviation.
3. **Commerce & Finance**: Chartered Accountancy (CA), Company Secretary (CS), CMA, Banking, Financial Markets, Actuarial Science, B.Com, BAF, BBI.
4. **Arts, Humanities & Social Sciences**: Civil Services (UPSC/State PCS), Psychology, Sociology, History, International Relations, Journalism, Public Policy.
5. **Law & Legal Studies**: Corporate Law, Litigation, Judiciary, Cyber Law, Intellectual Property, Human Rights.
6. **Management & Business**: General Management, Marketing, Human Resources, Supply Chain, Entrepreneurship.
7. **Creative Arts & Design**: Fashion Design, Graphic & UI/UX Design, Animation, VFX, Game Art, Interior Design, Fine Arts, Film Making.
8. **Agriculture & Food Technology**: Agronomy, Horticulture, Food Processing, Dairy Technology, Agricultural Engineering.
9. **Vocational & Technical Trades**: ITI Trades (Electrician, Fitter, Welder, Machinist), Poly-technic Diplomas, Renewable Energy Technicians.
10. **Sports & Physical Education**: Sports Management, Sports Physiotherapy, Coaching, Fitness & Nutrition, Athletic Training.
11. **Hospitality, Tourism & Culinary**: Hotel Management, Culinary Arts, Travel Operations, Event Management.
12. **Interdisciplinary & Emerging**: Environmental Science, Bio-informatics, Cognitive Science, Space Commerce.
13. **Undecided Students**: Systematic diagnostic discovery and aptitude guidance.

---

## 2. Key Architecture Rules for AI Agents and Developers

### Rule 1: Production-Oriented Modular Monolith
- Build KAABIL as a unified, real-world, scalable SaaS platform inside Next.js App Router.
- Avoid unnecessary microservices, premature distributed systems, or paid SaaS services during initial development.
- All four portals (**Student**, **Institution**, **Employer**, and **Admin**) share the same backend, database schema, and core intelligence engines.
- Strict multi-tenancy: Institution and Employer records must be isolated by `organizationId`.

### Rule 2: Configurable Data-Driven Career Architecture
- **NEVER** hardcode stream logic, career paths, or skill trees inside UI components or application business logic.
- Career streams, roles, eligibility criteria, exam mappings, and skill benchmarks must be stored in the relational database (`Domain`, `SubDomain`, `CareerPath`, `Skill`, `CareerSkillRequirement`, `EligibilityRule`).
- New careers (e.g., Drone Pilot, Ayurvedic Doctor, Sports Analyst) must be addable via Admin CMS or database seeds without code redeployment.

### Rule 3: The KAABIL Intelligence Loop
All intelligent features must adhere to the closed-loop feedback workflow:
$$\text{Industry Demand} \to \text{Career Requirements} \to \text{Skill Gap Analysis} \to \text{Personalized Learning} \to \text{Skill Verification} \to \text{Eligible Opportunity Matching} \to \text{Hiring Feedback} \to \text{Continuous Improvement}$$

- For **School Students (Class 8–12)**: Prioritize discovery, stream selection, foundation skills, entrance exam prep, and educational pathways. **NEVER** expose school students to recruitment pipelines, employer headhunting, or public profiles.
- For **Higher Ed, Vocational, and Professionals**: Connect verified skills with internships, apprenticeships, and jobs.

### Rule 4: Explainable AI & Zero Hallucination
- Generative AI (Gemini API) must be used for contextual explanations, mentoring dialogue, synthesis, and conversational interaction.
- **NEVER** fabricate AI results, test scores, qualifications, market salaries, or job guarantees.
- Scoring formulas (Readiness Index, Gap Analysis, Talent Match) must be **deterministic, transparent, and auditable**. Provide users and employers with the exact breakdown of weights, coverage percentages, and verified evidence.
- AI scores must **never** be used as automatic rejection criteria.

### Rule 5: Multilingual & Inclusive Mentorship
- The AI Career Mentor must natively understand and respond in **English**, **Hindi (हिन्दी)**, and **Hinglish** (conversational Indian colloquial phrasing).
- Maintain empathetic, encouraging, culturally grounded guidance respecting diverse Indian socioeconomic backgrounds.

---

## 3. Technology Stack & Directory Conventions

```
kaabil/
├── docs/                      # Permanent system documentation
│   ├── MASTER_PRD.md          # Comprehensive Product Requirements Document
│   ├── ARCHITECTURE.md        # Modular Monolith & System Architecture
│   ├── DESIGN_SYSTEM.md       # Visual tokens, Tailwind config, UI principles
│   ├── DATABASE_PLAN.md       # PostgreSQL schema & relational domain model
│   ├── DEVELOPMENT_ROADMAP.md # 10-Phase detailed implementation roadmap
│   ├── SECURITY_REQUIREMENTS.md # Security, RBAC, DPDP Act & child safety
│   └── PROGRESS.md            # Active implementation status & changelog
├── AGENTS.md                  # This guidance file
├── prisma/                    # Prisma ORM schema, migrations, seeders
│   ├── schema.prisma          # PostgreSQL schema
│   └── seed/                  # Real-world benchmark seeds for all streams
├── src/
│   ├── app/                   # Next.js App Router routes
│   │   ├── (marketing)/       # Landing page, public features, about
│   │   ├── (auth)/            # Sign in, sign up, role selection, verification
│   │   ├── (student)/         # Student Portal (Dashboard, Roadmap, Passport)
│   │   ├── (institution)/     # Institution Portal (Cohorts, Analytics, Interventions)
│   │   ├── (employer)/        # Employer Portal (Jobs, Verified Matching, Pipeline)
│   │   ├── (admin)/           # Admin Portal (User management, CMS, Audit logs)
│   │   └── api/               # Next.js Route Handlers (Auth, AI, Sync, Webhooks)
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Base Shadcn/UI primitives
│   │   ├── shared/            # Common layouts, navbars, headers, cards
│   │   ├── student/           # Student-specific components
│   │   ├── institution/       # Institution-specific components
│   │   ├── employer/          # Employer-specific components
│   │   └── admin/             # Admin-specific components
│   ├── lib/                   # Utility libraries, DB clients, constants
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── auth.ts            # Auth.js configuration
│   │   ├── gemini.ts          # Gemini API client wrapper
│   │   └── utils.ts           # Class merging (cn) and helpers
│   ├── engines/               # Modular Core Intelligence Engines
│   │   ├── career/            # Career discovery, matching & eligibility
│   │   ├── skill/             # Skill graph, NLP extraction, gap analysis
│   │   ├── learning/          # Roadmap generation & adaptive milestones
│   │   ├── readiness/         # Career Readiness Index & scoring
│   │   └── matching/          # Explainable talent matching & rubric scoring
│   └── types/                 # Shared TypeScript interfaces and Zod schemas
└── tests/                     # Unit, Integration, and E2E tests (Vitest + Playwright)
```

---

## 4. Current State vs. Planned State

| Dimension | Legacy Scratch Prototype (`scratch/kaabil`) | Production Target (Commencing Phase 1) |
| :--- | :--- | :--- |
| **Framework** | Client-only React 18 + Vite | Next.js 15 App Router (Modular Monolith) |
| **Backend & DB** | None (client-side `localStorage`) | Next.js Route Handlers + PostgreSQL + Prisma ORM |
| **Authentication** | Pseudo mock selection | Auth.js (NextAuth v5) with secure RBAC & session tokens |
| **Streams Covered** | 8 tech/business fresher roles | All 12+ Indian Educational Streams from Class 8 to Pro |
| **Portals** | Single student workspace mock | 4 Full Portals: Student, Institution, Employer, Admin |
| **AI Integration** | Client-side 3-gram string match | Gemini API + Deterministic Rubrics + Multilingual Support |
| **Data Architecture** | Static TS arrays (`roles.ts`) | Dynamic, relational, admin-configurable database schema |
| **Child Protection** | Not addressed | DPDP Act compliant, age-aware protections, minor safety |
| **Testing** | None | Vitest (unit/integration) + Playwright (E2E) |

---

## 5. Development Protocol & Quality Standards

1. **Strict Phased Execution**: Always adhere strictly to the 10 phases defined in `docs/DEVELOPMENT_ROADMAP.md`. Do not jump ahead to build unprompted features.
2. **No Fake Functionality**: Never build mock buttons that do nothing, empty `onClick={() => {}}` handlers, or misleading statistics. If a feature is scheduled for a future phase, omit it or show a clear disabled state with a roadmap badge.
3. **No Unapproved Public Deployments or Paid Tools**: Use open-source packages, standard Next.js, and free-tier Gemini API. Do not purchase services without explicit user direction.
4. **Clean Code & Strict Typing**: No `any` types in TypeScript. Every server action and API route must validate inputs using Zod.
5. **Security First**: Validate all permissions server-side. Never rely on client-side role guards alone.
6. **Preserve User Data**: When migrating or updating the database, write repeatable Prisma migration scripts and seeds. Never perform destructive database actions without prompting.

---

## 6. Communication Style

- Maintain an articulate, senior architect tone.
- Reference exact file paths using `file:///` URLs.
- Document any architectural decisions or trade-offs clearly in `docs/PROGRESS.md`.
- Keep the user informed at the end of each phase with clear verification steps.
