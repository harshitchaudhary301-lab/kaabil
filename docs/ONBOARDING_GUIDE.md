# KAABIL Intelligent All-Streams Onboarding Guide

## 1. Overview & Pedagogical Purpose

The KAABIL Onboarding Wizard is an intelligent 7-step diagnostic calibration system. Unlike typical technology-biased platforms that assume every student wants to become a software developer, KAABIL provides universal career exploration and calibration across all 13 educational streams recognized in India.

The onboarding process initializes the student's **Career Digital Twin**, calculates their baseline **Career Readiness Index (CRI)**, and configures the trilingual AI Career Mentor.

---

## 2. The 7-Step Calibration Workflow

### Step 1: Educational Stage & DPDP Minor Protection
- **Target Segments**:
  - Secondary School: Class 8, Class 9, Class 10
  - Senior Secondary School: Class 11, Class 12
  - Technical Trades: ITI (Industrial Training Institutes)
  - Polytechnic & Vocational Diplomas
  - Undergraduate Degrees: BA, B.Sc, B.Tech, B.Com, MBBS, LLB, BBA, B.Des, etc.
  - Postgraduate Degrees: MA, M.Sc, M.Tech, MBA, MD, LLM, etc.
  - Working Professionals & Career Transitioners
- **Dynamic Minor Detection**:
  - Automatically activates when Class 8–12 is selected.
  - Displays DPDP Act 2023 Minor Protection shield.
  - Enforces mandatory parental/guardian consent verification.
  - Completely blocks recruiter search and corporate contact.

### Step 2: Educational Stream & Focus Area (13 Streams)
Students select one **Primary Stream** and optional secondary streams for interdisciplinary exploration:
1. **Medical & Healthcare (PCB)**: Medicine, Dental, Ayurveda, Pharmacy, Nursing, Biotech.
2. **STEM & Pure Sciences (PCM)**: Engineering, AI, Physics, Mathematics, Data Science.
3. **Commerce & Business**: CA, Auditing, FinTech, Stock Markets, Banking, Taxation.
4. **Arts & Humanities**: Public Policy, UPSC, Psychology, Journalism, Literature.
5. **Law & Legal Studies**: Corporate Law, Judiciary, Cyber Law, Human Rights, Litigation.
6. **Management & Leadership**: Product Management, Consulting, Marketing, Startups.
7. **Creative Arts & Design**: UI/UX, Animation, Industrial Design, Game Design, Fashion.
8. **Agriculture & Allied Sciences**: Agronomy, Organic Farming, AgTech, Food Science.
9. **Vocational Education & Trades**: PLC Robotics, Smart Grids, CNC Mechatronics.
10. **Sports & Physical Education**: Sports Kinesiology, Athletic Coaching, Physiotherapy.
11. **Hospitality & Tourism**: Hotel Operations, Culinary Arts, Luxury Resort Management.
12. **Interdisciplinary Fields**: Computational Biology, Climate Telemetry, Cognitive Science.
13. **Undecided / Career Exploratory**: Diagnostic aptitude calibration and broad discovery.

### Step 3: Interests & Passion Signals
- Searchable tag selector and multi-domain tag clouds (Healthcare, STEM, Business, Legal, Creative, Trades, Sports, Humanities).
- Allows selecting 3 to 10 interests to calibrate the psychometric matching engine.

### Step 4: Existing Self-Reported Competencies
- Technical, analytical, domain, and interpersonal skills.
- Multi-tier proficiency selector: `Novice`, `Beginner`, `Intermediate`, `Proficient`, `Expert`.
- Ability to type and add custom skills.

### Step 5: Career Goals & Aspirations
- Target objectives:
  - Entrance Exam Preparation (NEET, JEE, CUET, CLAT, CAT, UPSC, GATE, NDA)
  - Higher Education & Degree Admissions
  - Skill Acquisition & Digital Skill Passport
  - Career Discovery & Aptitude Mapping
  - Internship & Job Readiness (18+ only; locked for minors)
- Target dream role (e.g. "AI Research Engineer", "Corporate Lawyer", "MBBS Doctor").
- Target completion year (2025–2030).

### Step 6: AI Career Mentor & Learning Preferences
- Language dialect:
  - **English**: Formal, academic, international.
  - **Hinglish**: Colloquial conversational Indian blend.
  - **हिन्दी (Hindi)**: Natural, culturally contextual Hindi.
- Learning style: Practical/Projects, Concept First/Theoretical, Exam Drills, Mentor Guided.
- Weekly time commitment: 3–5 hrs (Light), 8–12 hrs (Balanced), 15–20 hrs (Intensive), 25+ hrs (Full-Time).
- Live sample preview of AI Mentor tone.

### Step 7: Calibration Review & Confirmation
- Full digital twin summary card showing education stage, streams, interests, skills, target role, and mentor configuration.
- Quick "Edit" buttons to jump back to any previous step.
- Single-click submission saving profile to PostgreSQL via `POST /api/student/onboarding`.

---

## 3. Save & Resume Draft Persistence

Students can save their draft at any point via the "Save Progress" button or automatically:
- **Endpoint**: `POST /api/student/onboarding/progress`
- Stores `currentStep` and `stepDataJson` in the `OnboardingProgress` model.
- Upon returning to `/onboarding`, the client automatically resumes at the exact step with all previously entered fields populated.
