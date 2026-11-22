import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service | KAABIL (काबिल)",
  description: "KAABIL Universal Career & Skill Development Ecosystem Terms of Service & User Guidelines.",
};

export default function TermsOfServicePage() {
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
            <Scale className="h-4 w-4" />
            Platform Terms & Acceptable Use
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
            Terms of Service & Advisory Notice
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome to KAABIL (काबिल). By using this platform, you agree to these transparent educational terms.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> 1. Educational Guidance & Advisory Notice
            </h2>
            <p>
              KAABIL provides explainable career intelligence, statutory curriculum benchmarks, and diagnostic assessments. While our benchmarks are rigorously grounded in verified notifications from statutory authorities (e.g., NMC, AICTE, BCI, ICAI, UGC), students and parents must verify official exam dates and gazette notifications directly with respective governing bodies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> 2. Assessment Integrity & Verified Credentials
            </h2>
            <p>
              Students agree to attempt diagnostic quizzes and project milestones honestly. Cryptographically signed credentials minted into the Digital Skill Passport reflect authentic assessments. Plagiarism or fraudulent claims will result in credential revocation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="h-4 w-4 text-indigo-600" /> 3. Responsible AI & Zero-Guarantee Policy
            </h2>
            <p>
              AI Career Mentor recommendations are decision-support aids designed to empower students. KAABIL does not guarantee admissions, competitive examination ranks, or job placements. Scoring rubrics (CRI) are deterministic and explainable.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
