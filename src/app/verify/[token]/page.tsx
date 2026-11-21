"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  Sparkles,
  FileBadge,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  ArrowLeft,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicVerifiedPassport } from "@/lib/passport/sharing-service";

export default function PublicVerifyPassportPage({
  params,
}: {
  params: { token: string };
}) {
  const [data, setData] = useState<PublicVerifiedPassport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVerification() {
      try {
        setLoading(true);
        const res = await fetch(`/api/verify/${params.token}`);
        const json = await res.json();
        if (json.success && json.verification) {
          setData(json.verification);
        } else {
          setError(json.error || "Failed to verify credential token.");
        }
      } catch (err: any) {
        setError(err.message || "Network error while verifying token.");
      } finally {
        setLoading(false);
      }
    }
    loadVerification();
  }, [params.token]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between shadow-soft-xs sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-soft-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="font-heading text-lg font-bold tracking-tight text-slate-900">
              KAABIL
            </span>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">
              Credential Verification Gateway
            </span>
          </div>
        </Link>

        <Link href="/">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Button>
        </Link>
      </header>

      {/* Main Verification Container */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        {loading && (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Verifying cryptographic digital signatures...</p>
          </div>
        )}

        {!loading && error && (
          <Card className="border-rose-200 bg-rose-50/50">
            <CardContent className="p-6 text-center space-y-2 text-rose-700">
              <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
              <h2 className="text-lg font-bold">Verification Failed</h2>
              <p className="text-xs text-rose-600 max-w-md mx-auto">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && data && (
          <>
            {/* Verification Status Banner */}
            {data.isValid ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft-xs">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-soft-xs">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-lg text-slate-900">
                        Authenticated &amp; Verified Intact
                      </span>
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        Cryptographically Valid
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      {data.verificationMessage}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500 font-mono">
                  <span>Verified at: {new Date(data.verifiedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ) : data.isExpired ? (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 p-6 rounded-3xl flex items-center gap-3">
                <Clock className="h-8 w-8 text-amber-600 shrink-0" />
                <div>
                  <h2 className="font-bold text-base">Verification Link Expired</h2>
                  <p className="text-xs text-amber-800">{data.verificationMessage}</p>
                </div>
              </div>
            ) : data.isRevoked ? (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-900 p-6 rounded-3xl flex items-center gap-3">
                <XCircle className="h-8 w-8 text-rose-600 shrink-0" />
                <div>
                  <h2 className="font-bold text-base">Share Permission Revoked</h2>
                  <p className="text-xs text-rose-800">{data.verificationMessage}</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 border border-slate-300 text-slate-800 p-6 rounded-3xl flex items-center gap-3">
                <ShieldAlert className="h-8 w-8 text-slate-500 shrink-0" />
                <div>
                  <h2 className="font-bold text-base">Verification Invalid</h2>
                  <p className="text-xs text-slate-600">{data.verificationMessage}</p>
                </div>
              </div>
            )}

            {/* Student Credential Header */}
            {data.isValid && (
              <Card className="border-slate-200 bg-white shadow-soft-sm overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-primary tracking-widest uppercase block mb-1">
                        Verified Student Portfolio
                      </span>
                      <h1 className="text-2xl font-bold font-heading text-slate-900">
                        {data.student.displayName}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{data.student.educationStage}</span>
                        <span>&bull;</span>
                        <span className="font-semibold text-slate-700">{data.student.streamTitle}</span>
                        {data.student.institutionName && (
                          <>
                            <span>&bull;</span>
                            <span>{data.student.institutionName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {data.student.careerReadinessIndex && (
                      <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-right">
                        <span className="text-[11px] text-slate-500 block">Career Readiness</span>
                        <span className="text-2xl font-black text-emerald-600">
                          {data.student.careerReadinessIndex}/100
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Passport ID & Checksum */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono bg-slate-50 p-3 rounded-xl">
                    <span>Passport ID: <strong className="text-slate-700">{data.passportId}</strong></span>
                    <span className="truncate max-w-xs">
                      Checksum: {data.passportIntegrityChecksum.substring(0, 24)}...
                    </span>
                  </div>

                  {/* Verified Credentials Section */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileBadge className="h-4 w-4 text-primary" />
                      Digitally Signed Credentials ({data.verifiedCredentials.length})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {data.verifiedCredentials.map((cred) => (
                        <div
                          key={cred.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-soft-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">{cred.title}</span>
                            <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">
                              {cred.status}
                            </Badge>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-50 text-[10px] font-mono text-slate-500 space-y-0.5">
                            <div className="flex justify-between">
                              <span>Signature:</span>
                              <span className="text-slate-700">{cred.digitalSignatureTruncated}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Hash:</span>
                              <span className="text-slate-700">{cred.verificationHashTruncated}</span>
                            </div>
                            <div className="flex justify-between pt-0.5 text-slate-400">
                              <span>Issuer: {cred.issuerName}</span>
                              <span>{new Date(cred.issuedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verified Competencies Section */}
                  <div className="space-y-3 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Award className="h-4 w-4 text-emerald-600" />
                      Platform-Assessed Competencies ({data.verifiedSkills.length})
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {data.verifiedSkills.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/20 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-xs text-slate-900 block truncate max-w-[140px]">
                              {s.skillName}
                            </span>
                            <span className="text-[10px] text-slate-500">{s.category}</span>
                          </div>
                          {s.scorePercentage && (
                            <span className="text-xs font-bold text-emerald-700">
                              {s.scorePercentage}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Public Legal Disclaimer */}
                  <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <p>
                      <strong>Authenticity Notice:</strong> {data.disclaimer}
                    </p>
                    <p className="text-slate-400">
                      KAABIL Platform does not issue statutory university degrees, civil licenses, or employment guarantees. A valid cryptographic signature certifies that the skill challenge and evidence record exist unaltered within the KAABIL verification database.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400 bg-white">
        &copy; {new Date().getFullYear()} KAABIL (काबिल) &bull; Discover Your Skills. Define Your Future. &bull; DPDP Act 2023 Compliant.
      </footer>
    </div>
  );
}
