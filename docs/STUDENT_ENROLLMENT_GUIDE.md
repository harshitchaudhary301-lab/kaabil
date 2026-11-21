# KAABIL (काबिल) — Student Enrollment & Onboarding Guide

## 1. Supported Enrollment Methods

KAABIL supports three distinct student onboarding workflows:

### Method 1: Single Student Enrollment Modal (`/institution/students`)
- Campus administrators or faculty click **Enroll Student**.
- Provide Full Name, Official Email Address, Roll Number, Department, Program, Cohort Batch, Educational Stream, and Education Stage.
- Duplicate detection immediately checks if the student's email already exists in the institutional roster.
- Automatically connects the institutional enrollment to existing student profiles in the system if the student already registered on KAABIL.

### Method 2: Self-Enrollment via Campus Join Code
- Every institution receives a unique 8-character invitation code (e.g. `CAMPUS26`).
- Students enter this join code in their student portal settings or during onboarding.
- The platform automatically validates the code, resolves the institution tenant, and creates an `ACTIVE` enrollment record.

### Method 3: Bulk CSV Roster Import (`/institution/students/import`)
- Institutional rosters with up to 500 students can be imported in a single batch.
- See `docs/BULK_IMPORT_GUIDE.md` for complete format and sanitization specifications.
