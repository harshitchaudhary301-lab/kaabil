# KAABIL Authentication & Account Security Guide

## 1. Overview & Architectural Philosophy

KAABIL is an AI-powered universal career, education, skill development, and employment ecosystem serving all streams across India. Authentication and account identity in KAABIL must handle diverse user demographics:
- School students (Class 8–12) requiring strict compliance with the **Digital Personal Data Protection (DPDP) Act 2023** and minor protection safeguards.
- Higher education and vocational students (Polytechnic, ITI, Undergraduate, Postgraduate).
- Academic institutions (Schools, Colleges, Universities, Training Centers).
- Corporate and public employers (Enterprises, Healthcare Groups, Law Firms).
- System administrators and verification officers.

KAABIL enforces secure, native cryptographic authentication without external bloat or non-compliant native binaries.

---

## 2. Password Security & Cryptographic Hashing

### Algorithm Specification: Scrypt
- KAABIL utilizes Node.js native `crypto.scrypt` (NIST SP 800-132 memory-hard password derivation).
- **Parameters**:
  - CPU/Memory Cost ($N$): 16,384
  - Block Size ($r$): 8
  - Parallelization ($p$): 1
  - Salt Length: 16 bytes (32 hex characters cryptographically generated via `crypto.randomBytes`)
  - Key Length: 64 bytes (128 hex characters)
- **Hash Format**: `scrypt:<salt-hex>:<derived-key-hex>`

### Timing-Safe Verification
Password verification performs a constant-time comparison via `crypto.timingSafeEqual` over the derived key buffer to eliminate side-channel and timing-attack vulnerabilities.

### Password Strength Evaluator
Both client and server validate passwords using a multi-factor strength evaluator:
- Minimum length: 8 characters.
- Uppercase and lowercase letters.
- At least one numeric digit.
- At least one special symbol (`@`, `#`, `$`, `%`, etc.).
- Visual feedback on login and registration pages: `Weak` (1-2), `Fair` (3), `Strong` (4+).

---

## 3. Session Management & Cookie Security

KAABIL implements HTTP-only session cookies with persistent database synchronization:
- **Cookie Name**: `kaabil_session_token`
- **Token Generation**: 32-byte cryptographically secure random hex string.
- **Attributes**:
  - `httpOnly: true` (prevents XSS access)
  - `sameSite: "lax"` (mitigates CSRF)
  - `secure: process.env.NODE_ENV === "production"`
  - `path: "/"`
  - `maxAge`: 30 days (when "Remember Me" is selected) or 24 hours (default session).
- **Session Lookup**: `src/lib/auth/session.ts` verifies session validity against PostgreSQL `Session` table, attaching the user identity, role, minor status, and organizational memberships.

---

## 4. Rate Limiting & Brute-Force Shield

- **Mechanism**: In-memory sliding-window limiter (`src/lib/auth/rate-limiter.ts`).
- **Default Constraints**:
  - Max 5 failed login attempts per IP/Email within a 15-minute sliding window (900 seconds).
  - Max 3 password recovery attempts within 15 minutes.
- **Lockout Response**: HTTP `429 Too Many Requests` returning exact `resetInSeconds` for client countdown.
- **Lockout Reset**: Counter resets automatically upon a successful authenticated login.

---

## 5. Account Lifecycle & Workflows

### Multi-Role Registration (`POST /api/auth/register`)
- **Student**: Full name, email, password, educational stage (Class 8 to Working Professional).
  - If secondary or senior secondary (Class 8–12), automatic minor protection is enabled (`isMinor: true`). Parental/guardian consent checkbox is mandatory.
- **Institution**: Representative name, official institutional email, organization name, type (School, University, Vocational), city, and state. Assigned status: `PENDING_VERIFICATION`.
- **Employer**: Recruiter name, corporate domain email, company name, sector, city, and state. Assigned status: `PENDING_VERIFICATION`.

### Sign In (`POST /api/auth/login`)
- Authenticates credentials against stored scrypt hash.
- Generic error messages: `"Invalid email or password"` prevents account enumeration.
- Updates `lastLoginAt` and resets failed attempts.

### Password Recovery & Reset (`/forgot-password` & `/reset-password`)
- Generates 64-character one-time expiring token (valid for 60 minutes) stored in `PasswordResetToken`.
- **Transparent SMTP Reporting**: In development mode where external email delivery is unconfigured, the API returns `emailSent: false` along with the direct reset link in the response, eliminating fake email simulation.
- Successful reset invalidates all existing user sessions across devices.

### DPDP Right to Erasure (`DELETE /api/auth/account`)
- Requires password confirmation.
- Cascades deletion of `User`, `StudentProfile`, `EducationalBackground`, `StudentInterest`, `UserSkill`, and active sessions.
- Clears session cookie and invalidates authentication.
