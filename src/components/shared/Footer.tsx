"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  GraduationCap,
  Building2,
  Briefcase,
  Lock,
  Mail,
  FileCheck2,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { KaabilLogo } from "@/components/shared/KaabilLogo";

export function Footer() {
  const careerStreams = [
    { name: "Medical & Healthcare (PCB)", id: "MEDICAL_PCB" },
    { name: "STEM & Pure Sciences (PCM)", id: "NON_MEDICAL_PCM" },
    { name: "Commerce & Finance", id: "COMMERCE" },
    { name: "Arts & Humanities", id: "ARTS_HUMANITIES" },
    { name: "Law & Legal Studies", id: "LAW" },
    { name: "Management & Business", id: "MANAGEMENT" },
    { name: "Creative Arts & Design", id: "CREATIVE_DESIGN" },
    { name: "Agriculture & Food Sciences", id: "AGRICULTURE" },
    { name: "Vocational & Technical Trades", id: "VOCATIONAL_TRADES" },
    { name: "Sports & Physical Education", id: "SPORTS_PHYSICAL_ED" },
    { name: "Hospitality & Tourism", id: "HOSPITALITY_TOURISM" },
    { name: "Interdisciplinary & Emerging", id: "INTERDISCIPLINARY" },
    { name: "Undecided / Career Discovery", id: "UNDECIDED" },
  ];

  return (
    <footer className="border-t border-border bg-white text-text-secondary">
      {/* Top DPDP Act Compliance Strip */}
      <div className="border-b border-border/70 bg-slate-50/80 py-3.5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-text-primary">
              DPDP Act 2023 & Minor Safety Safeguards
            </span>
            <span className="hidden sm:inline text-text-muted">•</span>
            <span className="hidden sm:inline text-text-secondary">
              Zero public profiles or recruiter solicitation for school students and minors under 18
            </span>
          </div>
          <Badge variant="demo">KAABIL 2.0 • Demonstration Preview</Badge>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Info (Col 1-2) */}
          <div className="lg:col-span-2 space-y-4">
            <KaabilLogo variant="full" size="md" href="/" />
            <p className="text-sm font-semibold text-text-primary">
              Discover Your Skills. Define Your Future.
            </p>
            <p className="text-xs leading-relaxed text-text-secondary max-w-sm">
              KAABIL is India&apos;s AI-powered universal career, education, skill development, and employment ecosystem engineered for every educational stream and student background.
            </p>
            <div className="pt-2 text-xs text-text-muted space-y-1 border-t border-border/60">
              <p className="font-semibold text-text-primary">Grievance & Support Desk:</p>
              <div className="flex items-center gap-2 text-text-secondary">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>support@kaabil.in</span>
              </div>
              <p className="text-[11px] text-text-muted">
                Statutory Grievance Redressal Officer appointed per DPDP Rules 2023.
              </p>
            </div>
          </div>

          {/* Portals (Col 3) */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wider">
              Ecosystem Portals
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link
                  href="/student/dashboard"
                  className="hover:text-primary transition-colors flex items-center gap-2"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                  Student Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/institution/dashboard"
                  className="hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Building2 className="h-3.5 w-3.5 text-secondary" />
                  Institution Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/employer/dashboard"
                  className="hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  Employer Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard"
                  className="hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                  Admin Governance
                </Link>
              </li>
              <li className="pt-2 border-t border-border/60">
                <Link
                  href="/login"
                  className="hover:text-primary transition-colors text-text-muted hover:underline"
                >
                  Portal Sign In &rarr;
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-primary transition-colors text-text-muted hover:underline"
                >
                  Create Account &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* 13 Career Categories (Col 4) */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wider">
              13 Streams Supported
            </h4>
            <ul className="space-y-1 text-xs">
              {careerStreams.map((cs) => (
                <li key={cs.id}>
                  <Link
                    href="/#streams"
                    className="hover:text-primary transition-colors text-text-secondary hover:underline line-clamp-1"
                  >
                    {cs.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Legal (Col 5) */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wider">
              Trust & Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Explainable AI (No black-box rejection algorithms)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>Child Data Privacy (POCSO & DPDP Act 2023)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>Zero Fabricated Stats or Artificial Placement Numbers</span>
              </li>
              <li className="pt-2 border-t border-border/60 text-text-muted">
                <p className="font-semibold text-text-primary mb-1">Legal Policies</p>
                <div className="space-y-1">
                  <div>
                    <a
                      href="#privacy"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("KAABIL Privacy Notice: In compliance with DPDP Act 2023, all minor student accounts are strictly private with no recruiter access. Adult data is encrypted at rest and never sold to third parties.");
                      }}
                      className="hover:text-primary transition-colors underline"
                    >
                      Privacy Policy (DPDP 2023)
                    </a>
                  </div>
                  <div>
                    <a
                      href="#terms"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("KAABIL Terms of Service: Free educational and career discovery access for students. All career database benchmarks are verified against official regulatory boards.");
                      }}
                      className="hover:text-primary transition-colors underline"
                    >
                      Terms of Service
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>&copy; {new Date().getFullYear()} KAABIL Ecosystem. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>Free & Open Source Core</span>
            <span>•</span>
            <span>Demonstration Environment</span>
            <span>•</span>
            <span>Proudly Built for India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
