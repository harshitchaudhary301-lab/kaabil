# KAABIL (काबिल) — Interview Management & Structured Evaluation Guide

**Module:** `src/lib/employer/interview-service.ts`  
**Route:** `/employer/interviews`, `/api/employer/interviews`  
**Integration:** Direct bi-directional synchronization with Applicant Tracking System (ATS)  

---

## 1. Overview

KAABIL's Interview Management module replaces informal, inconsistent interview feedback with structured competency rubric scoring. Every interview scheduled through the platform automatically updates the candidate's ATS stage, records calendar and venue information, and prompts recruiters to evaluate candidates across four standardized competency dimensions.

---

## 2. Interview Scheduling Workflow

1. **Candidate Shortlisting:** When an application reaches the `SHORTLISTED` stage in the ATS, the recruiter can schedule an interview.
2. **Round Types:**
   - `TECHNICAL` (Technical and practical skills)
   - `HR_FIT` (Cultural and behavioral fit)
   - `CASE_STUDY` (Clinical case study, legal brief, financial model)
   - `FINAL_ROUND` (Senior leadership and hiring decision)
3. **Automatic ATS Synchronization:**
   - Scheduling an interview immediately transitions the application stage to `INTERVIEW_SCHEDULED`.
   - The candidate's slot time and meeting link (`venueOrMeetingLink`) are appended to the ATS application record.

---

## 3. Structured 1–5 Rubric Evaluation

Recruiters evaluate candidate performance across four competencies bounded strictly between 1 and 5:
- **Technical / Clinical Competency (1–5)**
- **Domain & Methodology Knowledge (1–5)**
- **Problem Solving & Diagnostic Reasoning (1–5)**
- **Communication & Team Collaboration (1–5)**

Scores outside this range are rejected by the service.

### Hiring Recommendations
Recruiters conclude the evaluation with one of four structured decisions:
- `STRONG_YES`: Exceptional candidate exceeding benchmarks.
- `YES`: Solid candidate meeting all core requirements.
- `NEUTRAL`: Acceptable performance; additional data or secondary interview suggested.
- `NO`: Candidate does not meet the necessary competency threshold.

### Stage Progression
Submitting interview feedback automatically transitions the ATS application stage to `INTERVIEW_COMPLETED` and appends rubric averages and qualitative recruiter notes to the permanent candidate audit trail.
