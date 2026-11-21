# KAABIL (काबिल) — Institution Self-Registration & Verification Guide

## 1. Institution Registration Flow

Any verified academic institution in India can initiate onboarding on KAABIL. The self-registration process establishes the tenant record and primary administrative contact:

1. **Self-Registration API:** `POST /api/institution/register`
   - Fields:
     - `name`: Full official name (e.g. "Delhi Technological Institute")
     - `orgType`: Category from `InstitutionType` (Engineering, Medical, Commerce, School, ITI, etc.)
     - `officialEmail`: Domain-verified contact (e.g. `admin@dti.edu.in`)
     - `registrationNumber`: AISHE Code, CBSE Affiliation Code, AICTE Approval Number, or BCI Code
     - `accreditationBody`: NAAC, NBA, CBSE, ICAR, NCVT
     - `city`, `state`, `country`
     - `supportedStreams`: Array of streams selected from the 13 universal educational categories
     - `authorizedPersonName`, `authorizedPersonDesignation`: Registrar / Principal / Director details

2. **Tenant Provisioning:**
   - A unique tenant ID `inst-<uuid>` is generated.
   - An 8-character unique Campus Join Code (e.g. `DTI-9A4B2C`) is minted for student self-enrollment.
   - Initial status is assigned as `SUBMITTED`.
   - `isVerified` is initialized to `false`.

3. **Administrative Verification:**
   - Platform compliance officers review accreditation registration numbers.
   - Status transitions to `UNDER_REVIEW` and subsequently `VERIFIED`.
   - Verification timestamp `verifiedAt` is recorded.
