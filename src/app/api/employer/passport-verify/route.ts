import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { PassportSharingService } from "@/lib/passport/sharing-service";
import { CredentialService } from "@/lib/passport/credential-service";
import { devStore } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const orgId = user?.organizations?.[0]?.id || "emp-apex-diag";

    const body = await req.json();
    const { token, credential, credentialId, studentProfileId } = body;

    if (!token && !credential && !credentialId) {
      return NextResponse.json(
        { success: false, error: "Either token, credential, or credentialId must be provided." },
        { status: 400 }
      );
    }

    // Path A: Verification via Public Share Token / QR Code
    if (token) {
      // Clean token if a full URL was provided
      const cleanToken = token.includes("/verify/")
        ? token.split("/verify/")[1].split("?")[0]
        : token.trim();

      const verificationResult = await PassportSharingService.verifyPublicShareToken(cleanToken);

      // Audit log the verification check
      const verificationRecord = {
        id: `ver-${Date.now()}`,
        verifierOrgId: orgId,
        verifierName: user?.name || "Verified Employer",
        verificationType: "TOKEN_VERIFICATION",
        token: cleanToken,
        targetStudent: verificationResult.student?.displayName || "Unknown",
        isValid: verificationResult.isValid,
        checkedAt: new Date().toISOString(),
        details: verificationResult.verificationMessage,
      };

      return NextResponse.json({
        success: true,
        verificationType: "PASSPORT_TOKEN",
        result: verificationResult,
        auditLog: verificationRecord,
      });
    }

    // Path B: Direct Credential Cryptographic Verification
    let credToVerify = credential;
    if (!credToVerify && credentialId && studentProfileId) {
      credToVerify = devStore.getCredential(studentProfileId, credentialId);
    }

    if (!credToVerify) {
      return NextResponse.json(
        { success: false, error: "Credential record not found for verification." },
        { status: 404 }
      );
    }

    const credResult = CredentialService.verifyCredential(credToVerify);

    const auditLog = {
      id: `ver-${Date.now()}`,
      verifierOrgId: orgId,
      verifierName: user?.name || "Verified Employer",
      verificationType: "CRYPTOGRAPHIC_SIGNATURE",
      credentialId: credToVerify.id,
      credentialTitle: credToVerify.title,
      isValid: credResult.isValid,
      signatureValid: credResult.signatureValid,
      hashValid: credResult.hashValid,
      isExpired: credResult.isExpired,
      isRevoked: credResult.isRevoked,
      checkedAt: new Date().toISOString(),
      details: credResult.verificationDetails,
    };

    return NextResponse.json({
      success: true,
      verificationType: "CREDENTIAL_CRYPTO",
      result: credResult,
      auditLog,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify credential." },
      { status: 500 }
    );
  }
}
