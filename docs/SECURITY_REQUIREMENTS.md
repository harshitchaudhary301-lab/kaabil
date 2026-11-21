# SECURITY_REQUIREMENTS.md — Security, Privacy & Compliance Specification

## Project: KAABIL (काबिल)
**Compliance Standards:** India Digital Personal Data Protection Act (DPDP Act 2023), OWASP Top 10, POCSO Child Safety Directives  
**Security Model:** Defense-in-Depth, Server-Side Zero-Trust, Multi-Tenant Isolation  

---

## 1. Authentication & Session Security

### 1.1 Password Security & Storage
- Passwords must be hashed using **Argon2id** (memory cost: 64MB, iterations: 3, parallelism: 4) or **bcrypt** with a minimum work factor of 12.
- Plaintext passwords must never be logged, printed to console, or persisted in temporary cache.
- Passwords require minimum 8 characters with at least one uppercase letter, one digit, and one special symbol.

### 1.2 Session Management
- Sessions are managed via **Auth.js (NextAuth v5)** using secure, HTTP-only, `SameSite=Lax`, and `Secure` cookies.
- Session tokens are cryptographically random 256-bit strings.
- Inactive sessions expire after 14 days; absolute timeout is 30 days.
- User logout must invalidate the session both in the browser cookie and in the database session store.

### 1.3 Protection Against Brute Force & Credential Stuffing
- Login endpoints enforce rate limiting: maximum 5 failed attempts per IP/Email pair within 15 minutes.
- Accounts are temporarily locked for 30 minutes after 10 consecutive failed attempts, with an automated notification sent to the registered email.

---

## 2. Server-Side Role-Based Access Control (RBAC) & Multi-Tenancy

### 2.1 Principle of Server-Side Enforcement
- **Never trust client-side claims.** UI visibility checks (`if (role === 'ADMIN')`) are purely cosmetic; every Server Action, Route Handler, and Database Mutation must independently verify session identity, role, and organization ownership on the server.

```typescript
// Architectural Pattern for Secure Server Actions
export async function updateInstitutionDepartment(departmentId: string, data: DepartmentUpdateDTO) {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError("Authentication required");
  
  if (session.user.role !== "INSTITUTION_ADMIN" && session.user.role !== "SUPER_ADMIN") {
    throw new ForbiddenError("Insufficient administrative permissions");
  }

  // Multi-tenant boundary check
  const department = await db.department.findUnique({
    where: { id: departmentId },
    select: { organizationId: true }
  });

  if (!department || department.organizationId !== session.user.organizationId) {
    throw new NotFoundError("Department not found in your organization");
  }

  return await db.department.update({
    where: { id: departmentId },
    data
  });
}
```

### 2.2 Multi-Tenant Data Isolation
- Institutions and Employers share the same database schema but must be strictly partitioned by `organizationId`.
- Automated Prisma client extensions or explicit query filters must enforce `where: { organizationId: currentOrgId }` on every query involving tenant data.
- Cross-tenant data leakage is classified as a Critical Severity vulnerability.

---

## 3. Child Safety & Minor Protection (DPDP Act 2023)

KAABIL serves students from Class 8 onward, meaning a substantial segment of users are legal minors (under 18 years old). Protecting children from commercial exploitation, predatory contact, and unwarranted data collection is a non-negotiable architectural requirement.

### 3.1 Identification of Minors
- Users enrolled in `CLASS_8`, `CLASS_9`, `CLASS_10`, `CLASS_11`, `CLASS_12` or reporting date of birth $<18$ years are flagged with `isMinor = true`.

### 3.2 Architectural Restrictions for Minors
1. **No Recruiter Visibility**:
   - Minor student profiles are strictly excluded from the Employer Portal's Candidate Discovery search, matching pools, and applicant suggestions.
   - Any API search query in `src/app/api/employer/discovery` automatically injects `where: { isMinor: false }`.
2. **No Direct External Messaging**:
   - Minors cannot receive direct messages, chat invites, or interview requests from corporate recruiters.
   - All communications for school students are restricted to verified institutional teachers and verified academic counselors within their registered school.
3. **No Public Profiles by Default**:
   - Public web profile URLs (`kaabil.in/p/[username]`) are permanently disabled for minor accounts.
4. **Parental / Guardian Consent Workflow**:
   - For users under 16, registration requires an optional or mandatory guardian email verification link in accordance with Section 9 of the DPDP Act 2023.
5. **No Behavioral Profiling for Targeted Advertising**:
   - Student usage telemetry is strictly limited to improving learning roadmaps. No behavioral data is sold, licensed, or shared with third-party ad networks.

### 3.3 Data Subject Rights: Export and Deletion
- **Right to Data Portability**: Any student can trigger an automated export of their entire profile, assessment history, verified skill records, and activity logs in machine-readable JSON format.
- **Right to be Forgotten (Account Deletion)**: A two-step deletion workflow completely purges personal identifiers, email, phone numbers, and resumes from PostgreSQL and file storage within 72 hours. Anonymized benchmark statistics are retained for national educational research only.

---

## 4. AI Ethics, Fair Hiring & Anti-Bias Controls

### 4.1 Explainable AI Requirement
- **No Black-Box Scoring**: Every metric (Career Readiness Index, Skill Gap Priority, Talent Match Score) must display its mathematical breakdown and the specific verified evidence driving the number.
- AI must never issue an automated "REJECT" verdict to a job applicant. Recruiter decisions require explicit human review and structured feedback.

### 4.2 Non-Discrimination Protections
- Matching algorithms must **never** take gender, caste, religion, geographic origin, or socio-economic background into account.
- Algorithmic evaluation is strictly grounded in:
  1. Verified skill proficiency scores.
  2. Practical project / challenge submissions.
  3. Objective regulatory eligibility criteria (e.g., degree requirements).

### 4.3 Safe Generative AI Integration (Gemini API)
- **API Key Secrecy**: The `GEMINI_API_KEY` must only exist in server-side environment variables (`process.env.GEMINI_API_KEY`). It must never be prefixed with `NEXT_PUBLIC_` or exposed in client bundles.
- **Strict Content Filtering**: High-threshold safety filters are applied to all Gemini requests to prevent harmful, predatory, or toxic advice.
- **Grounding & Zero Hallucination**: System prompts forbid the AI from inventing cutoffs, fees, or job guarantees. If official data is unavailable, the AI is instructed to state that the information must be verified with the official regulatory body.

---

## 5. API Security, Input Sanitization & Network Hardening

### 5.1 Input Validation via Zod
- All Route Handlers and Server Actions must parse incoming payloads against strict Zod schemas before processing.
- Extra or unexpected fields must be stripped (`strip()` or `strict()`).
- Rich text fields (e.g., resumes, notes, bios) must be sanitized using DOMPurify / sanitize-html to prevent Stored Cross-Site Scripting (XSS).

### 5.2 Rate Limiting
- Public and sensitive API endpoints are protected using a Token Bucket algorithm backed by Redis (or in-memory cache for development):
  - AI Mentor chat: Max 20 queries per user per hour.
  - Resume extraction: Max 5 uploads per user per day.
  - Authentication attempts: Max 5 attempts per IP per 15 minutes.
  - Public passport verification: Max 60 requests per minute per IP.

### 5.3 Secure File Handling
- User resume uploads and project submissions:
  - Allowed MIME types: `application/pdf`, `text/plain`. Executables (`.exe`, `.sh`, `.bat`) and macro-enabled files are rejected immediately.
  - Maximum file size: 5MB.
  - Uploaded files are scanned for malware signatures and stored with randomized UUID filenames, never original user-supplied filenames.

---

## 6. Verification & Due Diligence Workflows

To eliminate fake job postings, predatory recruitment, and fraudulent diploma mills:

### 6.1 Educational Institution Verification
- Institutions must submit their official **AISHE Code** (Higher Education), **UGC Recognition Link**, **AICTE Code**, or **State Board / CBSE Affiliation Code**.
- Verification is approved manually by the Platform Administrator before the institution can publish campus recruitment drives.

### 6.2 Corporate Employer Verification
- Employers must provide a valid **Corporate Identification Number (CIN)**, **GSTIN Certificate**, verified corporate domain email (no free Gmail/Yahoo addresses), and official company registration documents.
- Unverified employers cannot post vacancies or access candidate search.

---

## 7. Audit Logging & Compliance Monitoring

- The `AuditLog` table maintains an immutable record of all consequential operations:
  - Role promotions and revocations.
  - Organization verification decisions.
  - Minor account consent approvals.
  - Student profile data exports and account deletion requests.
  - Job posting approval and moderation interventions.
- Audit logs cannot be modified or deleted through the application interface.
