# KAABIL Role-Based Access Control (RBAC) & DPDP Minor Protection Matrix

## 1. System Roles

KAABIL defines six primary application roles:

| Role Identifier | Portal | Description |
| :--- | :--- | :--- |
| `STUDENT` | Student Portal | Learners across school (Class 8–12), college, vocational trades, or career transition. |
| `FACULTY` | Institution Console | Teachers, career counsellors, and professors managing student batches and curriculum. |
| `INSTITUTION_ADMIN` | Institution Console | Deans, principals, and administrative heads managing institution profiles and analytics. |
| `RECRUITER` | Employer Console | Talent acquisition specialists sourcing verified talent for internships and jobs (18+). |
| `EMPLOYER_ADMIN` | Employer Console | Corporate HR heads, recruiters, and hiring managers managing job postings and team seats. |
| `SUPER_ADMIN` | Governance Console | Platform operators managing system health, content accreditation, and audits. |

---

## 2. Account Statuses

Accounts transition through the following lifecycle states:

- `PENDING_VERIFICATION`: Default state for registered institutions and employers pending domain/accreditation review.
- `ACTIVE`: Full operational access to role-authorized platform capabilities.
- `SUSPENDED`: Temporarily locked due to security policy breaches or manual administrative hold.
- `RESTRICTED`: Limited read-only access (e.g. unverified email, partial onboarding).
- `DEACTIVATED`: Archived or soft-deleted account.

---

## 3. Comprehensive Permission Matrix

| Capability / Resource | STUDENT (Minor <18) | STUDENT (Adult 18+) | FACULTY | INSTITUTION_ADMIN | RECRUITER | EMPLOYER_ADMIN | SUPER_ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **All-Stream Career Explorer** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **AI Career Mentor (Gemini)** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Aptitude & Diagnostic Assessments** | ✅ | ✅ | 👁️ (Cohort) | 👁️ (Cohort) | ❌ | ❌ | ✅ |
| **Adaptive Roadmap & AI Missions** | ✅ | ✅ | 👁️ (Curriculum) | 👁️ (Curriculum) | ❌ | ❌ | ✅ |
| **Digital Skill Passport** | ✅ (Private) | ✅ | 👁️ (Verified) | 👁️ (Verified) | 👁️ (Adults only) | 👁️ (Adults only) | ✅ |
| **Entrance Exam Hub** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Internship & Job Applications** | ❌ (Blocked) | ✅ | ❌ | ❌ | ❌ | ❌ | 👁️ (Audit) |
| **Recruiter Discovery Index** | ❌ (Excluded) | Optional (User Opt-in) | ❌ | ❌ | ✅ (Search) | ✅ (Search) | ✅ |
| **Batch Roster Management** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Institutional Analytics** | ❌ | ❌ | 👁️ (Assigned) | ✅ (Full) | ❌ | ❌ | ✅ |
| **Job & Internship Posting** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Accreditation & Moderation** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **System Security & Audit Logs** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 4. Strict DPDP Act 2023 Minor Protection Enforcement

Under Section 9 of the **Digital Personal Data Protection (DPDP) Act 2023** (Obligations of Data Fiduciaries regarding Children):
1. **Zero Employer Discovery**:
   - Query filters constructed by `buildRecruiterMinorProtectionFilter()` enforce `isMinor: false` and explicitly filter out `CLASS_8`, `CLASS_9`, `CLASS_10`, `CLASS_11`, and `CLASS_12` learners.
   - Minor student profiles are strictly invisible to recruiters and employers.
2. **Guardian Consent**:
   - Compulsory confirmation checkbox during student registration for minor education stages.
   - Stored in database as a verifiable `ConsentRecord` with IP timestamp.
3. **Tracking & Targeted Advertisements Prohibition**:
   - No tracking or commercial behavioral profiling is permitted on minor accounts.
   - Minor learners focus solely on self-discovery, foundational competencies, and stream exploration.
