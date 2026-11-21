# KAABIL (काबिल) — Employer Role-Based Access Control (RBAC) Matrix

**Version:** 1.0  
**Compliance Standard:** DPDP Act 2023, Section 9 (Child Safeguards) & ISO/IEC 27001  
**Universal Ecosystem:** Multi-stream recruitment across all 13 educational domains.

---

## 1. Executive Summary

KAABIL provides a rigorous multi-tenant Role-Based Access Control (RBAC) architecture for employers. Recruiter and hiring manager capabilities are partitioned to enforce data minimization, prevent unauthorized candidate communication, and guarantee auditability.

---

## 2. Employer Roles Definition

| Role | Identifiers | Scope & Mandate |
| :--- | :--- | :--- |
| **Organization Administrator** | `ORGANIZATION_ADMIN` | Primary corporate representative. Full administrative authority over organization settings, company verification submissions, staff invitations, role modifications, and billing/memberships. |
| **Senior Recruiter** | `RECRUITER` | Talent acquisition specialist. Authorized to author and publish opportunities (if organization is verified), screen applicants, schedule interviews, and advance candidate stages. |
| **Hiring Manager** | `HIRING_MANAGER` | Department or technical lead (e.g. Chief of Pathology, Head of Embedded Robotics, Managing Legal Counsel). Evaluates candidate verified competencies, records technical interview notes, and issues final hiring recommendations. |

---

## 3. Granular Permission Matrix

| Operation / Capability | `ORGANIZATION_ADMIN` | `RECRUITER` | `HIRING_MANAGER` | External / Unauthenticated |
| :--- | :---: | :---: | :---: | :---: |
| **View Organization Dashboard & KPIs** | Full Access | Full Access | Department Filtered | Denied |
| **Edit Organization Profile (Name, Bio, Size)** | Full Access | Read-Only | Read-Only | Denied |
| **Submit MCA / GSTIN Verification Documents** | Full Access | Denied | Denied | Denied |
| **Invite & Revoke Team Members** | Full Access | Denied | Denied | Denied |
| **Create & Draft Job / Internship Postings** | Full Access | Full Access | Department Scoped | Denied |
| **Publish Live Opportunities (Verified Org Only)** | Full Access | Full Access | Read-Only | Denied |
| **Pause, Close, Archive Postings** | Full Access | Full Access | Denied | Denied |
| **Access Applicant Tracking System (ATS)** | Full Access | Full Access | Assigned Candidates | Denied |
| **Inspect Candidate Digital Skill Passports** | Full Access | Full Access | Full Access | Denied |
| **Advance Application Stages (Under Review -> Offer)** | Full Access | Full Access | With Admin Approval | Denied |
| **Record Internal Recruiter Notes & Audio/Video Feedback**| Full Access | Full Access | Full Access | Denied |
| **Request Campus Institutional Partnerships** | Full Access | Full Access | Denied | Denied |
| **Propose Campus Placement Drives** | Full Access | Full Access | Denied | Denied |
| **Export Recruitment Intelligence Analytics** | Full Access | Summary Only | Department Only | Denied |
| **Discover / Apply to Jobs (Minor Accounts <18)** | **BLOCKED (Statutory)** | **BLOCKED (Statutory)** | **BLOCKED (Statutory)** | **BLOCKED (Statutory)** |

---

## 4. Statutory Safeguards & Human Review Mandate

1. **Human-in-the-Loop Requirement:** Under platform policy, no candidate may be automatically rejected by an automated algorithm or CRI score. All hiring stages must be executed with an identifiable recruiter audit identity (`updatedBy`).
2. **Minor Protection:** Under Section 9 of India's Digital Personal Data Protection (DPDP) Act 2023, candidate discovery and applicant tracking strictly exclude children (under 18 years or Class 8–10 learners). No recruiter or administrator may view or solicit minor profiles.
3. **Multi-Tenancy Isolation:** All employer queries are partitioned by `organizationId`. Cross-organization data leakage is strictly prevented at both the database and memory store layers.
