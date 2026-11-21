"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  ClipboardCheck,
  GraduationCap,
  Briefcase,
  Download,
  Settings,
  FileSpreadsheet,
  Bell,
  Compass,
  AlertTriangle,
} from "lucide-react";
import { NavItem } from "@/components/shared/PortalLayout";

export const INSTITUTION_NAV: NavItem[] = [
  // 1. Overview
  {
    category: "Main",
    title: "Overview",
    href: "/institution/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  // 2. Student Management
  {
    category: "Academic Operations",
    title: "Student Management",
    href: "/institution/students",
    icon: <Users className="h-4 w-4" />,
  },
  {
    category: "Academic Operations",
    title: "Bulk CSV Import",
    href: "/institution/students/import",
    icon: <FileSpreadsheet className="h-4 w-4" />,
  },
  // 3. Departments
  {
    category: "Academic Operations",
    title: "Departments",
    href: "/institution/departments",
    icon: <Building2 className="h-4 w-4" />,
  },
  // 4. Skill Analytics
  {
    category: "Intelligence & Analytics",
    title: "Skill Analytics",
    href: "/institution/analytics",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    category: "Intelligence & Analytics",
    title: "Industry Demand",
    href: "/institution/industry-demand",
    icon: <Compass className="h-4 w-4" />,
  },
  {
    category: "Intelligence & Analytics",
    title: "Intervention Queue",
    href: "/institution/interventions",
    icon: <AlertTriangle className="h-4 w-4" />,
    badge: "Alerts",
  },
  // 5. Assessments
  {
    category: "Outcomes & Training",
    title: "Assessments",
    href: "/institution/assessments",
    icon: <ClipboardCheck className="h-4 w-4" />,
  },
  // 6. Training Management
  {
    category: "Outcomes & Training",
    title: "Training Management",
    href: "/institution/training",
    icon: <GraduationCap className="h-4 w-4" />,
  },
  // 7. Placement Drives
  {
    category: "Outcomes & Training",
    title: "Placement Drives",
    href: "/institution/placements",
    icon: <Briefcase className="h-4 w-4" />,
  },
  // 8. Placement Reports
  {
    category: "Governance & Reports",
    title: "Placement Reports",
    href: "/institution/reports",
    icon: <Download className="h-4 w-4" />,
  },
  // 9. Settings
  {
    category: "Governance & Reports",
    title: "Settings",
    href: "/institution/settings",
    icon: <Settings className="h-4 w-4" />,
  },
];
