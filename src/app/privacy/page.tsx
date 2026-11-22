import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy | KAABIL (काबिल)",
  description: "KAABIL Universal Career & Skill Development Ecosystem Privacy Policy & DPDP Act 2023 Compliance.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <span className="text-xs font-semibold text-slate-500">Effective: November 2026</span>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <ShieldCheck className="h-4 w-4" />
            DPDP Act 2023 Compliant Platform
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
            Privacy Policy & Minor Safety Protections
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            KAABIL (काबिल) is committed to protecting student data privacy and ensuring transparent, explainable career guidance across all Indian educational streams.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" /> 1. Digital Personal Data Protection (DPDP) Act 2023 Compliance
            </h2>
            <p>
              KAABIL strictly adheres to the Digital Personal Data Protection Act 2023 of India. We process personal data solely for providing educational discovery, verified skill credentials, and transparent career planning. We do not sell or monetize personal student information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-600" /> 2. Special Protections for School Students Under 18
            </h2>
            <p>
              In accordance with Section 9 of the DPDP Act 2023:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
              <li>Minor registration requires verifiable parental/guardian consent.</li>
              <li>School student portfolios are strictly private by default.</li>
              <li>Public passport sharing and recruiter candidate discovery are locked for minors.</li>
              <li>No targeted recruitment headhunting or behavioural tracking is conducted on school students.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" /> 3. Data Retention, Portability & Consent Revocation
            </h2>
            <p>
              Students retain complete ownership of their verified credentials and Digital Skill Passport. You may export your verified records at any time or request complete account erasure via Settings & Privacy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
