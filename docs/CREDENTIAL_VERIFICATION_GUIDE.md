# CREDENTIAL_VERIFICATION_GUIDE.md — KAABIL Cryptographic Credential Signing & Verification Guide

> **Ecosystem:** KAABIL (काबिल) — Universal Career, Education, Skill Development & Employment Platform  
> **Module:** Security & Cryptographic Subsystem (`src/lib/passport/credential-service.ts`, `src/lib/passport/sharing-service.ts`)  
> **Standards:** HMAC-SHA256, SHA-256 Checksums, DPDP Act 2023 Child Safety Standards

---

## 1. Cryptographic Signing Architecture

KAABIL implements a dual-layer cryptographic verification architecture using standard Node.js `crypto` primitives:

```
┌────────────────────────────────────────────────────────┐
│               Credential Data Ingestion                │
│  (id, studentProfileId, credentialType, title, score)  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│           Deterministic JSON Normalization             │
│        (Alphabetically sorted key-value pairs)         │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│       HMAC-SHA256       │ │         SHA-256         │
│    Digital Signature    │ │    Verification Hash    │
│  (Secret Key Signer)    │ │   (Full Payload Hash)   │
└─────────────────────────┘ └─────────────────────────┘
```

### Deterministic Payload Serialization
To prevent JSON serialization discrepancies (whitespace, key ordering), signing fields are strictly sorted alphabetically:

```typescript
private static generateSigningPayload(fields: Record<string, any>): string {
  const sorted: Record<string, any> = {};
  for (const key of Object.keys(fields).sort()) {
    sorted[key] = fields[key];
  }
  return JSON.stringify(sorted);
}
```

### Signing and Verification Primitives
- **HMAC-SHA256:** `crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex")`
- **SHA-256 Hash:** `crypto.createHash("sha256").update(data).digest("hex")`

---

## 2. Integrity Verification Workflow

When `CredentialService.verifyCredential(credential)` is called:
1. **Digital Signature Check:** Re-computes the HMAC-SHA256 from the canonical `signedPayload` using `SIGNING_SECRET`. If mismatched, returns `signatureValid: false`.
2. **Payload Tamper Check:** Creates a copy of the credential with `verificationHash: ""` and computes SHA-256. If mismatched, returns `hashValid: false` (detecting any modification of metadata or non-signed fields).
3. **Expiration Check:** Evaluates `expiresAt`. If `new Date(expiresAt) < new Date()`, marks `isExpired: true`.
4. **Revocation Check:** Evaluates `status === "REVOKED"`. If revoked, marks `isRevoked: true`.

Only if **all** four conditions succeed is the credential classified as `isValid: true`.

---

## 3. QR Sharing & Public Verification Gateway

Adult students may generate expiring, revocable share links:
- **Share URL Format:** `https://kaabil.in/verify/<token>`
- **Token Generation:** 24-byte cryptographically secure random bytes (`crypto.randomBytes(24).toString("hex")`).
- **Token Record:** Includes creation timestamp, expiration timestamp, revocation status, view counter, and last viewed audit timestamp.
- **Sanitized Public Verification Interface (`/verify/[token]`):**
  - Displays authenticated student first name/pseudonym, educational stage, and stream.
  - Excludes raw email, phone numbers, and physical addresses.
  - Lists verified skills and active cryptographic credentials.
  - Displays truncated signatures and hashes for independent verification.

---

## 4. Key Management & Rotation Strategy

- **Development Secret:** `kaabil-dev-credential-secret-2026`
- **Production Secret:** Injected via environment variable `CREDENTIAL_SIGNING_SECRET` from HSM / AWS Secrets Manager / Azure Key Vault.
- **Rotation Strategy:** The `issuerVersion` field (currently `v1.0`) allows multi-key rotation where historic signatures are checked against versioned keys.
