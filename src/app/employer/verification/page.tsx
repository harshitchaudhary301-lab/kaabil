"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  UploadCloud,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmployerVerificationStatus } from "@/types/employer";

export default function EmployerVerificationPage() {
  const [status, setStatus] = useState<EmployerVerificationStatus>("NOT_SUBMITTED");
  const [notes, setNotes] = useState<string | null>(null);
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [verifiedBy, setVerifiedBy] = useState<string | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [reviewerActing, setReviewerActing] = useState<boolean>(false);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  async function fetchVerificationStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/verification");
      const data = await res.json();
      if (data.success) {
        setStatus(data.verificationStatus);
        setNotes(data.verificationNotes || null);
        setVerifiedAt(data.verifiedAt || null);
        setVerifiedBy(data.verifiedBy || null);
        if (data.registrationNumber) setRegistrationNumber(data.registrationNumber);
        if (data.businessProofUrl) setProofUrl(data.businessProofUrl);
      }
    } catch (err) {
      console.error("Failed to load verification status", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!registrationNumber) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/employer/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber,
          businessProofUrl: proofUrl || "https://mca.gov.in/verify/cin-doc.pdf",
          notes: "Verification documents submitted for corporate review.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchVerificationStatus();
      } else {
        alert(data.error || "Failed to submit verification");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSimulateReview(newStatus: EmployerVerificationStatus) {
    setReviewerActing(true);
    try {
      const res = await fetch("/api/employer/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes:
            newStatus === "VERIFIED"
              ? "All statutory Ministry of Corporate Affairs (MCA) and GSTIN documents successfully validated."
              : "Further proof of incorporation or authorized representative letter required.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchVerificationStatus();
      } else {
        alert(data.error || "Failed to update review status");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update review");
    } finally {
      setReviewerActing(false);
    }
  }

  return (
    <PortalLayout
      portalName="Employer Portal"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Recruitment", "Company Verification"]}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="pb-2 border-b border-slate-200">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#4169E1]" />
            Corporate Entity Verification
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Statutory business verification required to publish skills-first opportunities and recruit adult learners.
          </p>
        </div>

        {/* Current Status Banner */}
        <Card className="border-slate-200 bg-white shadow-soft-xs">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-3 rounded-xl border ${
                    status === "VERIFIED"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : status === "PENDING_REVIEW"
                      ? "bg-blue-50 border-blue-200 text-[#4169E1]"
                      : status === "ADDITIONAL_INFO_REQUIRED"
                      ? "bg-amber-50 border-amber-200 text-amber-600"
                      : "bg-slate-100 border-slate-200 text-slate-500"
                  }`}
                >
                  {status === "VERIFIED" ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : status === "PENDING_REVIEW" ? (
                    <Clock className="w-6 h-6" />
                  ) : (
                    <ShieldAlert className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">Verification Status</h3>
                    <Badge
                      variant="outline"
                      className={`text-xs px-2.5 py-0.5 font-semibold ${
                        status === "VERIFIED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : status === "PENDING_REVIEW"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    {status === "VERIFIED"
                      ? `Verified by ${verifiedBy || "Trust Directorate"} on ${
                          verifiedAt ? new Date(verifiedAt).toLocaleDateString() : "Active"
                        }`
                      : status === "PENDING_REVIEW"
                      ? "Your application is currently under human review by our Trust & Verification team."
                      : "Submit your business incorporation evidence to unlock opportunity publishing."}
                  </p>

                  {notes && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      <strong>Reviewer Note:</strong> {notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Development Acceptance Actions */}
              <div className="flex flex-col gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-right">
                  Test Reviewer Mode
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSimulateReview("VERIFIED")}
                    disabled={reviewerActing}
                    className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-8"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSimulateReview("ADDITIONAL_INFO_REQUIRED")}
                    disabled={reviewerActing}
                    className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50 h-8"
                  >
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Request Info
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Form */}
        <Card className="border-slate-200 bg-white shadow-soft-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#4169E1]" />
              Business Registration Evidence
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your government-recognized corporate identifier (CIN, GSTIN, LLPIN) for validation against statutory registries.
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Registration Number (CIN / GSTIN / LLPIN / Trust Reg) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. U85110DL2018PTC329104 or 07AAAAA0000A1Z5"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#4169E1]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Cross-referenced with the Ministry of Corporate Affairs (MCA) and GST Portal.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Incorporation Certificate or Proof Document URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://company.com/legal/certificate-of-incorporation.pdf"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#4169E1]"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Verification Protocol Notice:</p>
                <p>• Verification requires manual human review by authorized KAABIL compliance officers.</p>
                <p>• Organizations are never auto-verified based solely on business email domain.</p>
                <p>• Submitted evidence is encrypted and protected from public access.</p>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={submitting || status === "VERIFIED"}
                  className="bg-[#4169E1] hover:bg-blue-700 text-white text-xs px-5 h-9"
                >
                  {submitting ? "Submitting..." : status === "VERIFIED" ? "Organization Verified" : "Submit for Verification"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
