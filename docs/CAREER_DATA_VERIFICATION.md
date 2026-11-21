# KAABIL — Career Data Verification & Regulatory Standards Protocol (Docs)

## 1. Overview

In the Indian educational landscape, inaccurate career information causes severe harm. Students frequently waste years preparing for invalid degrees or unaccredited institutions.

KAABIL enforces a strict **Statutory Verification Protocol** for every career path added to the ecosystem.

---

## 2. Verification Protocol & Gazette Standards

Every career in the `CAREER_PATHS_DATABASE` must cite published statutory regulations, gazette notifications, or recognized regulatory bodies:

1. **Medical & Allied Health**:
   - National Medical Commission (NMC) Act 2019 / MBBS Regulations.
   - Dental Council of India (DCI) BDS Regulations.
   - Pharmacy Council of India (PCI) Pharm.D Regulations 2008.
   - Rehabilitation Council of India (RCI) for Clinical Psychology.
2. **Engineering & Technology**:
   - All India Council for Technical Education (AICTE) Approval Process Handbook 2024-25.
   - IIT Council & Joint Entrance Examination (JEE) Advanced Information Brochure.
3. **Commerce & Finance**:
   - Institute of Chartered Accountants of India (ICAI) Chartered Accountants Regulations.
   - Securities and Exchange Board of India (SEBI) Regulations.
   - Institute of Actuaries of India (IAI).
4. **Law & Judiciary**:
   - Bar Council of India (BCI) Rules of Legal Education.
   - Consortium of National Law Universities (CLAT).
5. **Agriculture & Forestry**:
   - Indian Council of Agricultural Research (ICAR) Accreditation Standards.
6. **Vocational & Technical Trades**:
   - Directorate General of Training (DGT), Ministry of Skill Development and Entrepreneurship.
   - National Council for Vocational Training (NCVT) Craft Instructor Training Scheme (CITS).

---

## 3. Compensation Benchmark Methodology

Salary numbers in KAABIL are strictly grounded in multi-tier market realities in India (in Indian Rupees INR):

- **Entry-Level (0-2 Yrs)**: Actual starting packages for fresh graduates.
- **Mid-Level (5-8 Yrs)**: Median earnings of established practitioners.
- **Senior-Level (10+ Yrs)**: Experienced specialists, partners, or leadership roles.

### Primary Data Sources:
- NASSCOM Annual Salary Survey & Tech Talent Reports
- ICAI Campus Placement Committee Reports
- NMC Junior Resident / Senior Resident Pay Scales (7th Central Pay Commission)
- Bureau of Public Enterprises & Central Government Gazetted Pay Scales
- AmbitionBox / Glassdoor India 2024-2025 Aggregated Benchmark Data

---

## 4. AI & Automation Risk Methodology

Automation risk is assessed across three empirical dimensions:
1. **Physical Manipulative & Bedside Dexterity**: High physical touch (MBBS surgery, dentistry, agriculture soil science) $\to$ **Low Risk**.
2. **Statutory & Ethical Accountability**: Vocation legally requiring human signature and liability under Indian law (Chartered Accountant tax audit, Court Advocate arguing before judge) $\to$ **Low Risk**.
3. **Algorithmic & Routine Cognitive Tasks**: Routine bookkeeping, generic coding, or template drafting $\to$ **Medium to High Risk**.

---

## 5. Lifecycle & Audit Rhythm

- Every career record maintains a `lastReviewedDate` timestamp.
- Quarterly audits verify changes in entrance exam formats (e.g. CUET pattern shifts, NEET-UG scoring changes).
- Discontinued entrance exams or unaccredited titles are flagged for archival.
