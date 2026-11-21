# KAABIL Universal AI Career Mentor Specification
**Document ID:** DOC-D1-01  
**Product:** KAABIL (काबिल) — AI-Powered Universal Career Ecosystem  
**Milestone:** Part D1 (Prompt 12)  
**Status:** Implemented & Verified  

---

## 1. Executive Summary

The **Universal AI Career Mentor** (`काबिल करियर मेंटर`) is an empathetic, pragmatic, and context-aware guidance engine designed to support Indian students across **all 13 educational streams** from Class 8 through higher education and vocational trades.

Unlike generic conversational chatbots, the KAABIL AI Mentor is deeply anchored in the student's **Career Digital Twin**, **Career Readiness Index (CRI)**, **Adaptive 12-Week Roadmap**, and **Verified Skills Portfolio**.

---

## 2. Core Capabilities & Architectural Design

### 2.1 Trilingual Conversational Parity
The mentor natively supports three language modalities without dialect degradation:
1. **English:** Professional, encouraging, structured terminology for global and domestic career trajectories.
2. **Hindi (हिन्दी):** Formal, grammatically clean Devanagari script for national reach across tier-2 and tier-3 ecosystems.
3. **Hinglish:** Natural conversational blend of Romanized Hindi and professional English career terms, widely favored by high school and college students across urban and semi-urban India.

### 2.2 Live Digital Twin Context Injection
At the start of every consultation, the mentor dynamically compiles a real-time student context snapshot:
- **Demographic & Educational Stage:** (Class 8–10, Class 11–12, Undergraduate, Vocational, Working Professional).
- **Minor Protection Status (DPDP Act 2023):** For students in Class 8–10 (age < 18), parental consent indicators and age-appropriate content filters are enforced.
- **Active Educational Stream & Target Career:** Context-aware advice specific to any of the 13 streams.
- **Career Readiness Index (CRI) 5-Dimension Breakdown:**
  - Dimension 1: Career Knowledge
  - Dimension 2: Educational Preparation
  - Dimension 3: Skill Development
  - Dimension 4: Practical Learning
  - Dimension 5: Milestone Progression
- **Verified vs. Self-Reported Skills:** The mentor explicitly knows which competencies are backed by tamper-evident assessment proof and which remain self-reported.
- **Active Roadmap Milestone & Completed Missions:** References current week assignments to keep guidance immediately actionable.

---

## 3. Strict Ethical Boundaries & Zero-Hallucination Guardrails

1. **Zero Hallucination of Admissions & Cutoffs:**
   - The mentor NEVER invents fake cutoff percentiles for government exams (NEET, JEE, CLAT, CAT, UPSC, GATE).
   - If exact current-year counseling cutoffs are not verified in official records, the mentor directs students to official NTA/MCC/Consortium portals.
2. **Zero Fake Licensing Guarantees:**
   - Passing an online assessment or completing a KAABIL milestone NEVER constitutes a government medical license (MCI/NMC), legal practicing certificate (Bar Council of India), or statutory audit license (ICAI).
   - The mentor explicitly reinforces that KAABIL verified skill badges demonstrate competence, not statutory regulatory registration.
3. **Stream Parity & Anti-Bias:**
   - No stream is treated as superior to another. Arts, humanities, agriculture, sports, hospitality, and vocational trades receive identical algorithmic depth and prestige as engineering and medicine.

---

## 4. Actionable Proposals Workflow

When advising students, the mentor can generate structured proposals:
- `RECOMMENDED_ASSESSMENT`: Suggests a specific assessment (e.g., *Clinical Reasoning Foundations*) to convert a self-reported skill into verified proof.
- `ROADMAP_UPDATE`: Recommends adjustments to milestone allocations based on student pace.
- `MISSION_SUGGESTION`: Suggests micro-tasks reinforcing applied knowledge.

Each proposal renders as an interactive card in the chat and opens a confirmation review modal before modifying any student record.

---

## 5. REST API Reference

- `GET /api/student/mentor/conversations`: Retrieves all sessions for the authenticated student.
- `POST /api/student/mentor/conversations`: Initiates a new conversation session.
- `GET /api/student/mentor/conversations/[id]`: Retrieves conversation history.
- `DELETE /api/student/mentor/conversations/[id]`: Safely archives/deletes session.
- `POST /api/student/mentor/conversations/[id]/messages`: Sends student query, generates trilingual reply, and persists history.
- `GET /api/student/mentor/context`: Returns the real-time context snapshot for the Context Drawer.
