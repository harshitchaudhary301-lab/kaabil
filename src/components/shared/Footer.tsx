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
  Compass,
  Info,
} from "lucide-react";

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
    <footer className="border-t border-[#56316F]/40 bg-[#241330] text-[#FFF5E9]/75 select-none transition-colors">
      {/* Top DPDP Act Compliance Strip */}
      <div className="border-b border-[#56316F]/30 bg-[#1D0E27]/90 py-3.5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-[#FFF5E9]">
              DPDP Act 2023 &amp; Minor Safety Safeguards
            </span>
            <span className="hidden sm:inline text-[#FFF5E9]/40">•</span>
            <span className="hidden sm:inline text-[#FFF5E9]/70">
              Zero public profiles or recruiter solicitation for school students and minors under 18
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#56316F]/50 border border-[#FFC66B]/30 text-[11px] font-medium text-[#FFC66B]">
            KAABIL 2.0 • Demonstration Preview
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Info (Col 1-2) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#56316F] to-[#A45D88] border border-[#FFC66B]/30 text-[#FFC66B] shadow-md group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#FFC66B]">
                  <path
                    d="M12 3L2 8L12 13L22 8L12 3Z"
                    fill="#FFC66B"
                    stroke="#FFC66B"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 10.5V16C6 18.5 8.7 20.5 12 20.5C15.3 20.5 18 18.5 18 16V10.5"
                    stroke="#FFF5E9"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M19 11V16C19 16.5 19.5 17 20 17"
                    stroke="#FFC66B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-2xl tracking-tight text-[#FFF5E9]">
                    KAABIL
                  </span>
                  <span className="rounded-md bg-[#FFC66B]/15 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-[#FFC66B] border border-[#FFC66B]/30">
                    काबिल
                  </span>
                </div>
                <span className="text-[10px] font-medium tracking-wider text-[#FFC66B]/80 uppercase">
                  Every Stream • Every Skill • Every Future
                </span>
              </div>
            </Link>

            <p className="text-sm font-semibold text-[#FFF5E9]">
              Discover Your Skills. Define Your Future.
            </p>
            <p className="text-xs leading-relaxed text-[#FFF5E9]/70 max-w-sm">
              KAABIL is India&apos;s universal career, education, skill development, and employment ecosystem engineered for every educational stream and student background.
            </p>

            <div className="pt-2 text-xs text-[#FFF5E9]/60 space-y-1.5 border-t border-[#56316F]/40">
              <p className="font-semibold text-[#FFF5E9]">Grievance &amp; Support Desk:</p>
              <div className="flex items-center gap-2 text-[#FFF5E9]/80">
                <Mail className="h-3.5 w-3.5 text-[#FFC66B]" />
                <a href="mailto:support@kaabil.in" className="hover:text-[#FFC66B] transition-colors underline">
                  support@kaabil.in
                </a>
              </div>
              <p className="text-[11px] text-[#FFF5E9]/50">
                Statutory Grievance Redressal Officer appointed per DPDP Rules 2023.
              </p>
            </div>
          </div>

          {/* Portals & Core Navigation (Col 3) */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-[#FFC66B] uppercase tracking-wider">
              Ecosystem Portals
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link
                  href="/student/dashboard"
                  className="hover:text-[#FFC66B] transition-colors flex items-center gap-2 text-[#FFF5E9]/80"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
                  For Students
                </Link>
              </li>
              <li>
                <Link
                  href="/institution/dashboard"
                  className="hover:text-[#FFC66B] transition-colors flex items-center gap-2 text-[#FFF5E9]/80"
                >
                  <Building2 className="h-3.5 w-3.5 text-purple-300" />
                  For Institutions
                </Link>
              </li>
              <li>
                <Link
                  href="/employer/dashboard"
                  className="hover:text-[#FFC66B] transition-colors flex items-center gap-2 text-[#FFF5E9]/80"
                >
                  <Briefcase className="h-3.5 w-3.5 text-[#FFC66B]" />
                  For Employers
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard"
                  className="hover:text-[#FFC66B] transition-colors flex items-center gap-2 text-[#FFF5E9]/80"
                >
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Admin Governance
                </Link>
              </li>
              <li className="pt-2 border-t border-[#56316F]/40">
                <Link
                  href="/stream-selector"
                  className="hover:text-[#FFC66B] transition-colors flex items-center gap-2 text-[#FFF5E9]/90 font-semibold"
                >
                  <Compass className="h-3.5 w-3.5 text-[#FFC66B]" />
                  Explore Careers &rarr;
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  className="hover:text-[#FFC66B] transition-colors flex items-center gap-2 text-[#FFF5E9]/70"
                >
                  <Info className="h-3.5 w-3.5 text-[#E68AAB]" />
                  About KAABIL
                </Link>
              </li>
            </ul>
          </div>

          {/* 13 Career Streams (Col 4) */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-[#FFC66B] uppercase tracking-wider">
              13 Streams Supported
            </h4>
            <ul className="space-y-1 text-xs">
              {careerStreams.map((cs) => (
                <li key={cs.id}>
                  <Link
                    href="/stream-selector"
                    className="hover:text-[#FFC66B] transition-colors text-[#FFF5E9]/70 hover:underline line-clamp-1"
                  >
                    {cs.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust, Contact & Legal (Col 5) */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-[#FFC66B] uppercase tracking-wider">
              Trust &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-[#FFF5E9]/80">Explainable AI (Zero Black-Box Rejections)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#FFC66B] shrink-0 mt-0.5" />
                <span className="text-[#FFF5E9]/80">Child Data Privacy (POCSO &amp; DPDP 2023)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-amber-300 shrink-0 mt-0.5" />
                <span className="text-[#FFF5E9]/80">Verified Regulatory Benchmarks</span>
              </li>
              <li className="pt-2 border-t border-[#56316F]/40 text-[#FFF5E9]/60">
                <p className="font-semibold text-[#FFF5E9] mb-1">Policies &amp; Contact</p>
                <div className="space-y-1">
                  <div>
                    <a
                      href="#privacy"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("KAABIL Privacy Notice: In compliance with the Digital Personal Data Protection (DPDP) Act 2023, all minor student accounts are strictly private with no recruiter access. Adult data is encrypted at rest and never sold to third parties.");
                      }}
                      className="hover:text-[#FFC66B] transition-colors underline"
                    >
                      Privacy Policy (DPDP 2023)
                    </a>
                  </div>
                  <div>
                    <a
                      href="#terms"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("KAABIL Terms of Service: Free universal educational and career discovery access for students. All career database benchmarks are verified against official regulatory boards (AICTE, NMC, ICAI, BCI).");
                      }}
                      className="hover:text-[#FFC66B] transition-colors underline"
                    >
                      Terms of Service
                    </a>
                  </div>
                  <div>
                    <a
                      href="mailto:support@kaabil.in"
                      className="hover:text-[#FFC66B] transition-colors underline"
                    >
                      Contact Us
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#56316F]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FFF5E9]/50">
          <p>&copy; {new Date().getFullYear()} KAABIL Ecosystem. Discover Your Skills. Define Your Future.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>Free &amp; Open Source Core</span>
            <span>•</span>
            <span>Demonstration Environment</span>
            <span>•</span>
            <span className="text-[#FFC66B]">Proudly Built for India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
