"use client";

import React from "react";
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Search,
  Sparkles,
  FileText,
  Users,
  Calendar,
  CheckCircle2,
  BarChart3,
  Building,
  ShieldCheck,
  Award,
} from "lucide-react";
import { NavItem } from "@/components/shared/PortalLayout";

export const EMPLOYER_NAV: NavItem[] = [
  // 1. Overview
  {
    category: "Main",
    title: "Overview",
    href: "/employer/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  // 2. Post a Job & Manage Jobs
  {
    category: "Opportunities",
    title: "Post a Job",
    href: "/employer/opportunities/new",
    icon: <PlusCircle className="h-4 w-4" />,
    badge: "Post",
  },
  {
    category: "Opportunities",
    title: "Manage Jobs",
    href: "/employer/opportunities",
    icon: <Briefcase className="h-4 w-4" />,
  },
  // 3. Find Candidates & AI Matching
  {
    category: "Talent Discovery",
    title: "Find Candidates",
    href: "/employer/discovery",
    icon: <Search className="h-4 w-4" />,
  },
  {
    category: "Talent Discovery",
    title: "AI Talent Matching",
    href: "/employer/matching",
    icon: <Sparkles className="h-4 w-4" />,
    badge: "AI",
  },
  {
    category: "Talent Discovery",
    title: "Verify Skill Passport",
    href: "/employer/passport-verify",
    icon: <Award className="h-4 w-4" />,
  },
  // 4. Applications & Pipeline
  {
    category: "Recruitment Pipeline",
    title: "Applications",
    href: "/employer/applications",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    category: "Recruitment Pipeline",
    title: "Shortlisted Candidates",
    href: "/employer/pipeline",
    icon: <Users className="h-4 w-4" />,
  },
  {
    category: "Recruitment Pipeline",
    title: "Interviews",
    href: "/employer/interviews",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    category: "Recruitment Pipeline",
    title: "Hired Candidates",
    href: "/employer/pipeline?stage=HIRED",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  // 5. Analytics & Profile
  {
    category: "Governance & Company",
    title: "Analytics",
    href: "/employer/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    category: "Governance & Company",
    title: "Company Profile",
    href: "/employer/settings",
    icon: <Building className="h-4 w-4" />,
  },
  {
    category: "Governance & Company",
    title: "Verification & KYC",
    href: "/employer/verification",
    icon: <ShieldCheck className="h-4 w-4" />,
    badge: "KYC",
  },
];
