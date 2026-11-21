import React from "react";
import {
  Home,
  Bot,
  Box,
  BarChart2,
  BookOpen,
  Map,
  ClipboardCheck,
  ShieldCheck,
  FileText,
  Briefcase,
} from "lucide-react";
import { NavItem } from "@/components/shared/PortalLayout";

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { title: "My Plan (Overview)", href: "/student/dashboard", icon: <Home className="h-4 w-4" /> },
  { title: "AI Career Mentor", href: "/student/mentor", icon: <Bot className="h-4 w-4" /> },
  { title: "Career Digital Twin", href: "/student/digital-twin", icon: <Box className="h-4 w-4" /> },
  { title: "Skill Gap Analyzer", href: "/student/skill-gaps", icon: <BarChart2 className="h-4 w-4" /> },
  { title: "Learning Academy", href: "/student/academy", icon: <BookOpen className="h-4 w-4" /> },
  { title: "Career Roadmap", href: "/student/dashboard#roadmap", icon: <Map className="h-4 w-4" /> },
  { title: "Assessments & Quiz", href: "/student/assessments", icon: <ClipboardCheck className="h-4 w-4" /> },
  { title: "Skill Passport", href: "/student/passport", icon: <ShieldCheck className="h-4 w-4" /> },
  { title: "Resume Studio", href: "/student/resume", icon: <FileText className="h-4 w-4" /> },
  { title: "Jobs & Opportunities", href: "/student/opportunities", icon: <Briefcase className="h-4 w-4" /> },
];

export const STUDENT_NAV = STUDENT_NAV_ITEMS;
