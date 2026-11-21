import React from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  Briefcase,
  Layers,
  ClipboardCheck,
  BarChart3,
  Activity,
  FileText,
  Settings,
} from "lucide-react";
import { NavItem } from "@/components/shared/PortalLayout";

export const ADMIN_NAV_ITEMS: NavItem[] = [
  // 1. Overview
  {
    category: "Main",
    title: "Overview",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  // 2. User & Entity Verification
  {
    category: "User & Entity Governance",
    title: "User Management",
    href: "/admin/users",
    icon: <Users className="h-4 w-4" />,
  },
  {
    category: "User & Entity Governance",
    title: "Institution Verification",
    href: "/admin/verifications?type=INSTITUTION",
    icon: <Building2 className="h-4 w-4" />,
    badge: "Queue",
  },
  {
    category: "User & Entity Governance",
    title: "Employer Verification",
    href: "/admin/verifications?type=EMPLOYER",
    icon: <Briefcase className="h-4 w-4" />,
    badge: "KYC",
  },
  // 3. Content & Assessment Management
  {
    category: "Curriculum & Assessments",
    title: "Content Management",
    href: "/admin/cms",
    icon: <Layers className="h-4 w-4" />,
  },
  {
    category: "Curriculum & Assessments",
    title: "Assessment Management",
    href: "/admin/cms?tab=assessments",
    icon: <ClipboardCheck className="h-4 w-4" />,
  },
  // 4. Intelligence & Security
  {
    category: "Intelligence & Security",
    title: "Platform Analytics",
    href: "/admin/dashboard#analytics",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    category: "Intelligence & Security",
    title: "AI Monitoring",
    href: "/admin/ai-governance",
    icon: <Activity className="h-4 w-4" />,
    badge: "AI",
  },
  {
    category: "Intelligence & Security",
    title: "Security and Audit Logs",
    href: "/admin/audit-logs",
    icon: <FileText className="h-4 w-4" />,
  },
];
