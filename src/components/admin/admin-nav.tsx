import React from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Layers,
  Activity,
  FileText,
} from "lucide-react";
import { NavItem } from "@/components/shared/PortalLayout";

export const ADMIN_NAV_ITEMS: NavItem[] = [
  // 1. Overview
  {
    category: "Overview",
    title: "Platform Overview",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },

  // 2. Governance & Users
  {
    category: "Governance & Users",
    title: "User Governance",
    href: "/admin/users",
    icon: <Users className="h-4 w-4" />,
  },
  {
    category: "Governance & Users",
    title: "Verification Queue",
    href: "/admin/verifications",
    icon: <ShieldCheck className="h-4 w-4" />,
    badge: "Queue",
  },

  // 3. Platform & AI
  {
    category: "Platform & AI",
    title: "Platform CMS",
    href: "/admin/cms",
    icon: <Layers className="h-4 w-4" />,
  },
  {
    category: "Platform & AI",
    title: "AI Governance",
    href: "/admin/ai-governance",
    icon: <Activity className="h-4 w-4" />,
    badge: "AI",
  },
  {
    category: "Platform & AI",
    title: "Audit Trail",
    href: "/admin/audit-logs",
    icon: <FileText className="h-4 w-4" />,
  },
];
