# KAABIL (काबिल) — Institution Role-Based Access Control (RBAC) Matrix

**Security Standard:** Principle of Least Privilege, zero horizontal escalation, role-separated administrative boundaries.

---

## 1. Institutional Roles

| Role | Target Persona | Scope of Responsibility |
|---|---|---|
| `INSTITUTION_ADMIN` | Registrar / System Admin | Full campus tenant configuration, academic hierarchy, staff invitations, and settings. |
| `PRINCIPAL_DIRECTOR` | Head of Institution | Executive dashboard insights, NAAC/NIRF metrics, institutional verification overview. |
| `DEPARTMENT_HEAD` | Head of Department (HOD) | Department-level curriculum, faculty allocation, batch monitoring within assigned department. |
| `FACULTY` | Professor / Instructor | Class cohort management, student skill verifications, classroom attendance and readiness checks. |
| `CAREER_COUNSELOR` | Career Mentor / Advisor | Cohort career readiness tracking, career recommendations, intervention alerts. |
| `TRAINING_COORDINATOR`| Skill Development Incharge | Industry skills training, vocational trade cohorts, practical assessments. |
| `PLACEMENT_OFFICER` | TPO / Campus Placement Head| Placement cohort preparation, employer drives (Part E2), CRI readiness filtering. |
| `STAFF` | Academic Office Clerk | Student roster entry, CSV import preparation, general directory lookups. |

---

## 2. Permission Matrix

| Capability | `INSTITUTION_ADMIN` | `PRINCIPAL_DIRECTOR` | `DEPARTMENT_HEAD` | `FACULTY` | `CAREER_COUNSELOR` | `PLACEMENT_OFFICER` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| View Dashboard Telemetry | Full | Full | Dept Only | Batch Only | Full | Placement Cohorts |
| Manage Departments | Yes | Read-Only | Read-Only | No | No | No |
| Manage Programs | Yes | Read-Only | Dept Only | No | No | No |
| Manage Sessions & Batches | Yes | Read-Only | Dept Only | Batch Only | No | Read-Only |
| Invite Staff Members | Yes | Read-Only | No | No | No | No |
| Enroll Students (Single) | Yes | Read-Only | Dept Only | Batch Only | No | Read-Only |
| Bulk CSV Student Import | Yes | No | Dept Only | No | No | Read-Only |
| View Student CRI Scores | Yes | Yes | Dept Only | Batch Only | Yes | Yes |
| View Student AI Mentor Chats| **NEVER** | **NEVER** | **NEVER** | **NEVER** | **NEVER** | **NEVER** |
| View Student Reflections | **NEVER** | **NEVER** | **NEVER** | **NEVER** | **NEVER** | **NEVER** |

> [!IMPORTANT]
> Student personal journals, reflections, and private AI Mentor dialogues are strictly isolated to the student and are cryptographically inaccessible to all campus staff roles without exception.
