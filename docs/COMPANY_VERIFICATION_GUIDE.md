# KAABIL (काबिल) — Company & Organization Verification Guide

**Directorate:** Trust, Verification & Regulatory Compliance  
**Standard:** Ministry of Corporate Affairs (MCA) 21, GST Portal & Bar/Medical Council Registry Cross-Validation

---

## 1. Overview & Purpose

To ensure that every opportunity presented to students and jobseekers across India is legitimate, non-exploitative, and compliant with statutory labor and wage standards, KAABIL implements a **Human-Reviewed Trust & Verification System**.

Unverified entities cannot publish public job postings or contact students directly.

---

## 2. Verification Status States

```
[ NOT_SUBMITTED ]
        │
        ▼ (Submit CIN/GSTIN + Business Proof)
[ PENDING_REVIEW ] ────(Additional info requested)───► [ ADDITIONAL_INFO_REQUIRED ]
        │                                                         │
        │                                                         ▼
        ├────────────────(Approved by Human Compliance)─────────► [ VERIFIED ]
        │                                                         │
        ▼ (Fraud / Policy Breach)                                  ▼ (Breach)
   [ REJECTED ]                                              [ SUSPENDED ]
```

### State Definitions
1. **`NOT_SUBMITTED`**:
   - Initial state upon corporate registration.
   - Employer may draft opportunities, configure team members, and explore platform templates.
   - **Publishing Live Opportunities is Strictly Blocked.**
2. **`PENDING_REVIEW`**:
   - Employer has submitted official business registration details and proof of incorporation.
   - Enters the human compliance queue for verification officers.
3. **`ADDITIONAL_INFO_REQUIRED`**:
   - Compliance officers require supplemental documentation (e.g., active GSTIN return filing, MSME Udyam certificate, authorized power of attorney).
4. **`VERIFIED`**:
   - Official credentials validated against the MCA / GST / state regulatory database.
   - Authorized to publish live job, internship, and campus recruitment opportunities.
5. **`REJECTED`**:
   - Verification failed due to falsified documents, shell company indicators, or unauthorized impersonation.
6. **`SUSPENDED`**:
   - Previously verified organization suspended due to candidate complaints, wage non-payment, or statutory violations.

---

## 3. Human Review Requirement

> **Statutory Mandate:** Under platform integrity guidelines, **automated verification based solely on email domain (e.g. `@company.com`) is strictly prohibited**. All verification approvals must be authorized by a human compliance reviewer with timestamped audit records (`verifiedBy`, `verifiedAt`).
