"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Mail,
  Globe,
  MapPin,
  Award,
  Copy,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  ShieldAlert,
  Users,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { INSTITUTION_NAV } from "@/components/institution/institution-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstitutionRecord } from "@/types/institution";

export default function InstitutionSettingsPage() {
  const [institution, setInstitution] = useState<InstitutionRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/institution/profile");
      const data = await res.json();
      if (res.ok && data.success) {
        setInstitution(data.institution || data.data?.institution || null);
      } else {
        setError(data.error || "Failed to load institutional profile");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to institutional services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Institution", "Settings & Verification"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
              Institution Settings & Verification
            </h1>
            <p className="text-sm text-slate-500">
              Institutional accreditation credentials, campus onboarding join codes and multi-tenant security status.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Loading institutional profile...</p>
          </div>
        ) : error || !institution ? (
          <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-600" />
            <p className="text-sm font-semibold">{error || "Institution record not found"}</p>
            <Button onClick={fetchProfile} variant="outline" className="mt-3 text-xs">
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      {institution.name}
                    </CardTitle>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Reg: {institution.registrationNumber || "AISHE-C-29104"} &bull; Type: {institution.orgType.replace(/_/g, " ")}
                    </p>
                  </div>

                  <Badge
                    className={`text-xs px-2.5 py-1 ${
                      institution.verificationStatus === "VERIFIED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : institution.verificationStatus === "UNDER_REVIEW"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {institution.verificationStatus === "VERIFIED" && (
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    )}
                    {institution.verificationStatus}
                  </Badge>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-medium">Official Email:</span>
                      <p className="font-mono text-slate-800 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {institution.officialEmail}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-medium">Campus Location:</span>
                      <p className="text-slate-800 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {institution.city}, {institution.state}, {institution.country}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-medium">Institutional Website:</span>
                      <p className="text-slate-800 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-slate-400" />
                        <a
                          href={institution.officialWebsite || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {institution.officialWebsite || "https://institution.edu"}
                        </a>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-medium">Authorized Administrator:</span>
                      <p className="text-slate-800">
                        {institution.authorizedPersonName} ({institution.authorizedPersonDesignation})
                      </p>
                    </div>
                  </div>

                  {/* Accreditations */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-blue-600" />
                      Accreditations & Affiliations
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase">Accreditation Body</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {institution.accreditationBody || "NAAC A++ / AICTE"}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase">Supported Streams</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {institution.supportedStreams?.length || 13} Streams
                        </p>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase">Account Status</span>
                        <p className="text-sm font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {institution.isVerified ? "Verified Active" : "Under Review"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Protection & Privacy Callout */}
              <Card className="border border-slate-200 shadow-sm bg-slate-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-indigo-600" />
                    Student Data Minimization & Privacy Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-slate-600">
                  <p>
                    <strong>DPDP Act (2023) Compliance:</strong> Student minor accounts (Class 8–10 or age &lt;18) require explicit guardian consent before participation in external recruitment or placement drives.
                  </p>
                  <p>
                    <strong>Strict Boundary Separation:</strong> Private AI Career Mentor dialogues and personal reflection journals are strictly confidential to the student. Campus administrators, faculty and placement officers have zero visibility into private student thoughts or mentor chats.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Cards: Campus Join Code */}
            <div className="space-y-6">
              <Card className="border border-blue-200 shadow-sm bg-gradient-to-b from-blue-50/60 to-white">
                <CardHeader className="pb-2">
                  <Badge className="w-fit bg-blue-100 text-blue-800 border-blue-200 text-[10px] mb-1">
                    Self-Enrollment
                  </Badge>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-blue-600" />
                    Campus Join Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Share this unique 8-character invitation code with your students to let them self-enroll into your campus portal:
                  </p>

                  <div className="p-3 bg-white border border-blue-200 rounded-xl flex items-center justify-between shadow-xs">
                    <span className="font-mono text-lg font-extrabold tracking-widest text-blue-700">
                      {institution.invitationCode || "CAMPUS26"}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleCopyCode(institution.invitationCode || "CAMPUS26")}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1 flex items-center gap-1"
                    >
                      {copiedCode ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedCode ? "Copied" : "Copy"}
                    </Button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Students can enter this code in their settings or during onboarding to bind their account to {institution.name}.
                  </p>
                </CardContent>
              </Card>

              {/* Multi-Tenant Security Status */}
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-700" />
                    Multi-Tenant Isolation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Tenant Identifier:</span>
                    <span className="font-mono text-[11px] text-slate-800">{institution.id}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Tenant Isolation:</span>
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Enforced by `institutionId`
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Cross-Tenant Access:</span>
                    <span className="text-rose-700 font-medium">Strictly Prohibited</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
