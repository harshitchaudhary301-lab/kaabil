# KAABIL (काबिल) — Multi-Stream Cohort Skill Analytics & Heatmap

**Tagline:** Discover Your Skills. Define Your Future.  
**Phase:** Part E2 (Milestone E2.1)  
**Status:** Implemented & Verified  

---

## 1. Overview

The Cohort Skill Analytics engine provides high-resolution, multi-stream visibility into the collective competency attainment of student cohorts across departments, batches, and academic stages. 

Traditional institutional reports only provide subject marks (e.g. 74/100 in Data Structures). KAABIL decomposes curriculums into granular, verifiable competencies (e.g. Algorithmic Complexity, PostgreSQL, Clinical Pharmacology, Financial Statement Analysis, Constitutional Law, Solar PV Installation) and tracks demonstration rates against statutory benchmarks.

---

## 2. Competency Measurement Model

For each department and stream, the engine evaluates:
1. **Total Enrolled Students:** The active student population in the cohort.
2. **Demonstrated Proficiency (%):** The percentage of students in the cohort who have demonstrated competency in the skill.
3. **Verified Demonstrations:** Skills validated through KAABIL standardized objective assessments, scenario evaluations, or verified external credentials.
4. **Self-Reported Proficiency:** Skills added by students during profile discovery that await formal assessment validation.
5. **Benchmark Coverage (%):** Target demonstration threshold recommended by statutory councils (NASSCOM, NMC, ICAI, BCI, NSDC).
6. **Curriculum Gap Status:**
   - **STRONG (Green):** Demonstrated proficiency >= 70%
   - **MODERATE (Yellow):** Demonstrated proficiency between 45% and 69%
   - **GAP (Amber):** Demonstrated proficiency between 25% and 44%
   - **CRITICAL (Rose):** Demonstrated proficiency < 25%

---

## 3. Universal Multi-Stream Support

The analytics engine supports all 13 educational categories with tailored skill banks:
- **PCM & Computer Science:** Cloud Architecture, Distributed Systems, Python, Next.js, Docker.
- **PCB & Healthcare:** Clinical Patient Assessment, Pharmacology & Dosage, Diagnostic Reasoning.
- **Commerce & BFSI:** Financial Modeling, Statutory Auditing (Ind AS), GST Compliance.
- **Legal & Judiciary:** Contract Review, Regulatory Compliance (DPDP Act 2023), Litigation Procedure.
- **Vocational & ITI:** Industrial Automation (PLC), Solar Grid Installation, Precision Machining.
- **Creative & Design:** Design Systems (Figma), Usability Heuristics, Digital Visual Storytelling.
- **Agriculture & Allied:** Precision Soil Testing, Drone Crop Health Monitoring, Drip Irrigation.

---

## 4. UI/UX Accessibility & Color Compliance

The interactive heatmap grid at `/institution/analytics` adheres to accessibility standards:
- **Accessible Palette:** Rose-50/700 for Critical, Amber-50/700 for Gap, Yellow-50/700 for Moderate, and Emerald-50/700 for Strong.
- **Dual Visual Encoding:** Color fills are accompanied by explicit text badges and numerical percentage indicators.
- **Interactive Tooltips:** Hovering over competency cells reveals the exact breakdown of verified assessments vs. unverified self-reports.
