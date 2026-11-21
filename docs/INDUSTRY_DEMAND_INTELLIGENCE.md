# KAABIL (काबिल) — Industry Demand Intelligence

**Tagline:** Discover Your Skills. Define Your Future.  
**Phase:** Part E2 (Milestone E2.1)  
**Status:** Implemented & Verified  

---

## 1. Statutory Grounding Principle

A common failure mode in ed-tech applications is showing fabricated, unverified real-time job opening counts (e.g. *"1,429 jobs open in your city right now!"*). KAABIL explicitly prohibits fabricated statistics. 

Instead, the **KAABIL Industry Demand Intelligence** module is grounded in authoritative, published statutory and industry council benchmarks from recognized bodies across India:
- **Technology & IT-BPM:** NASSCOM FutureSkills Prime Talent Trends & AI Readiness Framework.
- **Healthcare & Life Sciences:** Healthcare Sector Skill Council (HSSC) & National Medical Commission (NMC).
- **BFSI & Commerce:** BFSI Sector Skill Council & Institute of Chartered Accountants of India (ICAI).
- **Legal & Judicial Practice:** Bar Council of India (BCI) Academic Guidelines & Legal Tech Index.
- **Vocational Trades & Green Jobs:** National Skill Development Corporation (NSDC) & Skill Council for Green Jobs.
- **Creative & Media Design:** Media & Entertainment Skills Council (MESC) & India Design Council.
- **Agriculture & Allied Fields:** Agriculture Skill Council of India (ASCI) & ICAR Advisory.

---

## 2. Intelligence Record Structure

Each industry demand record surfaces:
```typescript
interface IndustryDemandRecord {
  id: string;
  sector: string;
  stream: EducationalStream;
  roleTitle: string;
  topSkills: string[];
  growthTrend: "HIGH" | "STEADY" | "EMERGING";
  sourceAttribution: string;
  collectionDate: string;
  verificationStatus: "VERIFIED_STATUTORY" | "INDUSTRY_COUNCIL" | "CURATED_BENCHMARK";
}
```

---

## 3. Usage within the Institution Ecosystem

1. **Curriculum Alignment:** Department leaders can compare their department's skill heatmap against statutory top skills to identify outdated syllabi.
2. **Adaptive Workshop Generation:** Gaps identified between cohort competency and council demand automatically populate the **Adaptive Training Proposal** queue.
3. **Transparent Source Badges:** Every record in the UI displays its verification badge (`VERIFIED_STATUTORY`, `INDUSTRY_COUNCIL`, `CURATED_BENCHMARK`) alongside the formal publication date and issuing body.
