"use client";

import React from "react";
import {
  LayoutDashboard,
  Building,
  ShieldCheck,
  Users,
  PlusCircle,
  Briefcase,
  FileText,
  Columns3,
  GraduationCap,
  BarChart3,
  Bell,
  Sparkles,
  Search,
  Award,
  CheckCircle2,
} from "lucide-react";
import { NavItem } from "@/components/shared/PortalLayout";

export const EMPLOYER_NAV: NavItem[] = [
  // 1. Overview
  { category: "Overview", title: "Overview", href: "/employer/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { category: "Overview", title: "Company Verification", href: "/employer/verification", icon: <ShieldCheck className="h-4 w-4" />, badge: "KYC" },

  // 2. Talent Discovery & AI
  { category: "Talent Discovery & AI", title: "AI Talent Matching", href: "/employer/matching", icon: <Sparkles className="h-4 w-4" />, badge: "AI" },
  { category: "Talent Discovery & AI", title: "Candidate Discovery", href: "/employer/discovery", icon: <Search className="h-4 w-4" /> },
  { category: "Talent Discovery & AI", title: "Skill Passport Verify", href: "/employer/passport-verify", icon: <Award className="h-4 w-4" />, badge: "Verify" },

  // 3. Recruitment & Pipeline
  { category: "Recruitment & Pipeline", title: "Post Opportunity", href: "/employer/opportunities/new", icon: <PlusCircle className="h-4 w-4" />, badge: "Post" },
  { category: "Recruitment & Pipeline", title: "Manage Opportunities", href: "/employer/opportunities", icon: <Briefcase className="h-4 w-4" /> },
  { category: "Recruitment & Pipeline", title: "Candidate Applications", href: "/employer/applications", icon: <FileText className="h-4 w-4" /> },
  { category: "Recruitment & Pipeline", title: "Recruitment Pipeline", href: "/employer/pipeline", icon: <Columns3 className="h-4 w-4" /> },
  { category: "Recruitment & Pipeline", title: "Interview Hub", href: "/employer/interviews", icon: <Users className="h-4 w-4" /> },
  { category: "Recruitment & Pipeline", title: "Campus Recruitment", href: "/employer/campus", icon: <GraduationCap className="h-4 w-4" /> },
  { category: "Recruitment & Pipeline", title: "Industry Challenges", href: "/employer/challenges", icon: <CheckCircle2 className="h-4 w-4" /> },

  // 4. Analytics & Governance
  { category: "Analytics & Governance", title: "Recruitment Analytics", href: "/employer/analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { category: "Analytics & Governance", title: "Team Management", href: "/employer/team", icon: <Users className="h-4 w-4" /> },
  { category: "Analytics & Governance", title: "Notifications", href: "/employer/notifications", icon: <Bell className="h-4 w-4" /> },
  { category: "Analytics & Governance", title: "Organization Profile", href: "/employer/settings", icon: <Building className="h-4 w-4" /> },
];
