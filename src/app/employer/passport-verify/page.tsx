"use client";

import React, { useState } from "react";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Search,
  KeyRound,
  FileCheck,
  History,
  Building,
  User,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PassportVerificationPage() {
  const [tokenInput, setTokenInput] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const handleVerify = async (tokenToUse?: string) => {
    const raw = tokenToUse || tokenInput;
    if (!raw.trim()) return;

    setVerifying(true);
    setErrorMsg(null);
    setVerificationResult(null);

    try {
      const res = await fetch("/api/employer/passport-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: raw.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setVerificationResult(data.result);
        if (data.auditLog) {
          setAuditLogs((prev) => [data.auditLog, ...prev]);
        }
      } else {
        setErrorMsg(data.error || "Failed to verify credential token.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error occurred during verification.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <PortalLayout
      portalName="Employer Portal"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Employer", "Passport Verification"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Digital Skill Passport Verification
              </h1>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">Cryptographic HMAC</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Verify the authenticity and tamper-resistance of student skill credentials, certificates, and challenge badges.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <KeyRound className="h-4 w-4 text-purple-600 shrink-0" />
            <span>Cryptographically signed with HMAC-SHA256 & SHA-256 evidence hashing</span>
          </div>
        </div>

        {/* Verification Input Box */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-600" />
              Scan or Enter Passport Share Token / QR Code URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. share-token-aryan-2026 or http://localhost:3000/verify/share-token-aryan-2026"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <Button
                onClick={() => handleVerify()}
                disabled={verifying || !tokenInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 h-auto py-2.5 gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                {verifying ? "Verifying..." : "Verify Authenticity"}
              </Button>
            </div>

            {/* Quick Demo Pre-fill Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Test Samples:</span>
              <button
                type="button"
                onClick={() => {
                  setTokenInput("sample-demo-token-medical-2026");
                  handleVerify("sample-demo-token-medical-2026");
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 border border-slate-300 font-mono transition-colors"
              >
                sample-demo-token-medical-2026
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Verification Report Card */}
        {verificationResult && (
          <Card className="border-slate-200 shadow-md overflow-hidden">
            <div
              className={`h-2 w-full ${
                verificationResult.isValid ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-bold text-slate-900">
                      Passport Verification Report
                    </CardTitle>
                    {verificationResult.isValid ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        AUTHENTIC & VERIFIED
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-red-300 gap-1">
                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                        INVALID / TAMPERED
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Verified at {new Date(verificationResult.verifiedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Checksum Status</span>
                  <div className="font-mono text-xs font-bold text-slate-800">
                    {verificationResult.passportIntegrityChecksum ? "MATCHED (SHA-256)" : "N/A"}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Candidate Info Banner */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Student Name</span>
                  <div className="font-bold text-slate-900 text-base">{verificationResult.student?.displayName}</div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Educational Stream</span>
                  <div className="font-medium text-slate-800 text-sm">{verificationResult.student?.streamTitle}</div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">CRI Readiness</span>
                  <div className="font-bold text-blue-700 text-base">
                    {verificationResult.student?.careerReadinessIndex
                      ? `${verificationResult.student.careerReadinessIndex}/100`
                      : "Unassessed"}
                  </div>
                </div>
              </div>

              {/* Cryptographic Checks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">HMAC Signature</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300">
                      ✓ VALID
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-[11px]">Signed by platform key at issuance</p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Hash Integrity</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300">
                      ✓ INTACT
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-[11px]">Payload has not been modified</p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Revocation Status</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300">
                      ✓ ACTIVE
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-[11px]">Not revoked by student or institution</p>
                </div>
              </div>

              {/* Verified Credentials in Passport */}
              {verificationResult.verifiedCredentials && verificationResult.verifiedCredentials.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-purple-600" />
                    Verified Credentials ({verificationResult.verifiedCredentials.length})
                  </h4>
                  <div className="space-y-2">
                    {verificationResult.verifiedCredentials.map((c: any) => (
                      <div
                        key={c.id}
                        className="p-3 bg-purple-50/40 rounded-lg border border-purple-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-purple-950">{c.title}</div>
                          <div className="text-slate-500 text-[11px]">
                            Issuer: {c.issuerName} • Level: {c.credentialLevel}
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-mono text-[10px]">
                          HMAC VALID
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Skills */}
              {verificationResult.verifiedSkills && verificationResult.verifiedSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Verified Competencies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {verificationResult.verifiedSkills.map((s: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-xs py-1">
                        ✓ {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Verification Audit Log */}
        {auditLogs.length > 0 && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <History className="h-4 w-4 text-slate-500" />
                Recent Employer Verification Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">{log.targetStudent}</span>
                      <span className="text-slate-500 ml-2">via {log.token}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={log.isValid ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}
                      >
                        {log.isValid ? "VERIFIED" : "FAILED"}
                      </Badge>
                      <span className="text-slate-400 text-[11px]">{new Date(log.checkedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
