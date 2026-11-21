"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  Download,
  FileSpreadsheet,
  BookOpen,
  Calendar,
  Layers,
  ShieldCheck,
  Briefcase,
  Compass,
  Bell,
  CheckSquare,
} from "lucide-react";
import { NavItem } from "@/components/shared/PortalLayout";

export const INSTITUTION_NAV: NavItem[] = [
  // 1. Overview
  { category: "Overview", title: "Dashboard", href: "/institution/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },

  // 2. Academic Operations
  { category: "Academic Operations", title: "Student Directory", href: "/institution/students", icon: <Users className="h-4 w-4" /> },
  { category: "Academic Operations", title: "Bulk CSV Import", href: "/institution/students/import", icon: <FileSpreadsheet className="h-4 w-4" /> },
  { category: "Academic Operations", title: "Departments", href: "/institution/departments", icon: <Building2 className="h-4 w-4" /> },
  { category: "Academic Operations", title: "Academic Programs", href: "/institution/programs", icon: <BookOpen className="h-4 w-4" /> },
  { category: "Academic Operations", title: "Classes & Batches", href: "/institution/classes", icon: <Layers className="h-4 w-4" /> },
  { category: "Academic Operations", title: "Faculty & Staff", href: "/institution/faculty", icon: <GraduationCap className="h-4 w-4" /> },
  { category: "Academic Operations", title: "Academic Sessions", href: "/institution/sessions", icon: <Calendar className="h-4 w-4" /> },

  // 3. Intelligence & Analytics
  { category: "Intelligence & Analytics", title: "Cohort Skill Analytics", href: "/institution/analytics", icon: <TrendingUp className="h-4 w-4" /> },
  { category: "Intelligence & Analytics", title: "Industry Demand", href: "/institution/industry-demand", icon: <Compass className="h-4 w-4" /> },
  { category: "Intelligence & Analytics", title: "Intervention Queue", href: "/institution/interventions", icon: <AlertTriangle className="h-4 w-4" />, badge: "Alerts" },

  // 4. Placements & Outcomes
  { category: "Placements & Outcomes", title: "Training & Workshops", href: "/institution/training", icon: <GraduationCap className="h-4 w-4" /> },
  { category: "Placements & Outcomes", title: "Cohort Assessments", href: "/institution/assessments", icon: <CheckSquare className="h-4 w-4" /> },
  { category: "Placements & Outcomes", title: "Campus Placements", href: "/institution/placements", icon: <Briefcase className="h-4 w-4" /> },
  { category: "Placements & Outcomes", title: "Outcome Reports", href: "/institution/reports", icon: <Download className="h-4 w-4" /> },

  // 5. Governance & Settings
  { category: "Governance & Settings", title: "Notifications", href: "/institution/notifications", icon: <Bell className="h-4 w-4" /> },
  { category: "Governance & Settings", title: "Settings & Verification", href: "/institution/settings", icon: <ShieldCheck className="h-4 w-4" /> },
];
