# KAABIL (काबिल) — Digital Skill Passport Verification Guide

**Module:** `src/lib/passport/credential-service.ts`, `src/lib/passport/sharing-service.ts`  
**Route:** `/employer/passport-verify`, `/api/employer/passport-verify`  
**Security Standard:** HMAC-SHA256 Signatures, SHA-256 Content Hashes  

---

## 1. Cryptographic Verification Architecture

Every credential issued on the KAABIL platform (including assessment achievements, readiness checkpoints, and industry challenge awards) is protected by dual cryptographic validation:

```
[Student Credential]
       │
       ├───► [HMAC-SHA256 Signature Check]
       │        Key: PLATFORM_SIGNING_SECRET
       │        Payload: deterministic canonical fields (id, studentProfileId, title, score, issuedAt)
       │        Verdict: Signature Valid / Invalid (Detects key forgery)
       │
       ├───► [SHA-256 Verification Hash Check]
       │        Computed over entire credential JSON (with empty hash placeholder)
       │        Verdict: Hash Matched / Tampered (Detects payload modification)
       │
       ├───► [Revocation & Expiration Check]
       │        Checks status !== "REVOKED" and now < expiresAt
       │        Verdict: Active / Revoked / Expired
       │
       ▼
[Unified Authenticity Verdict: AUTHENTIC | TAMPERED | FORGED | REVOKED]
```

---

## 2. Employer Verification Interface

Employers can verify candidate credentials via two workflows on `/employer/passport-verify`:
1. **Public Share Token / QR Code Scan:**
   - The candidate shares a 24-byte crypto token or QR link (e.g., `http://localhost:3000/verify/<token>`).
   - The employer enters the token into the verification input.
   - The platform verifies expiration, revocation, and token authenticity, returning a sanitized verified view of the student's competencies.
2. **Direct Cryptographic Credential Audit:**
   - The employer supplies the credential object or ID.
   - The platform computes both the HMAC-SHA256 signature and SHA-256 hash in real time.
   - Displays exact tamper-detection logs.

---

## 3. Verification Audit Trail

All verification requests are recorded in the employer audit trail:
- Verifier Organization ID & Name
- Target Candidate / Token
- Verification Type (TOKEN vs CRYPTOGRAPHIC)
- Validity Verdict & Timestamp
- Detailed verification status message
