import React from "react";
import {
  LayoutDashboard,
  Bot,
  Compass,
  ClipboardCheck,
  BarChart3,
  BookOpen,
  Map,
  FolderGit2,
  ShieldCheck,
  FileText,
  Mic,
  Briefcase,
  Trophy,
  Settings,
} from "lucide-react";
import { NavItem } from "@/components/shared/PortalLayout";

export const STUDENT_NAV_ITEMS: NavItem[] = [
  {
    title: "Overview",
    href: "/student/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    category: "Main",
  },
  {
    title: "AI Career Mentor",
    href: "/student/mentor",
    icon: <Bot className="h-4 w-4" />,
    badge: "AI",
    category: "Main",
  },
  {
    title: "Career Discovery",
    href: "/student/discover",
    icon: <Compass className="h-4 w-4" />,
    category: "Explore",
  },
  {
    title: "Skill Assessment",
    href: "/student/assessments",
    icon: <ClipboardCheck className="h-4 w-4" />,
    category: "Competence",
  },
  {
    title: "Skill Gap Analysis",
    href: "/student/skill-gaps",
    icon: <BarChart3 className="h-4 w-4" />,
    category: "Competence",
  },
  {
    title: "My Learning",
    href: "/student/academy",
    icon: <BookOpen className="h-4 w-4" />,
    category: "Competence",
  },
  {
    title: "Career Roadmap",
    href: "/student/roadmap",
    icon: <Map className="h-4 w-4" />,
    category: "Planning",
  },
  {
    title: "Projects",
    href: "/student/portfolio",
    icon: <FolderGit2 className="h-4 w-4" />,
    category: "Evidence",
  },
  {
    title: "Digital Skill Passport",
    href: "/student/passport",
    icon: <ShieldCheck className="h-4 w-4" />,
    badge: "Verified",
    category: "Evidence",
  },
  {
    title: "Resume Studio",
    href: "/student/resume",
    icon: <FileText className="h-4 w-4" />,
    category: "Employability",
  },
  {
    title: "Interview Lab",
    href: "/student/interview-lab",
    icon: <Mic className="h-4 w-4" />,
    category: "Employability",
  },
  {
    title: "Jobs & Internships",
    href: "/student/opportunities",
    icon: <Briefcase className="h-4 w-4" />,
    category: "Employability",
  },
  {
    title: "Achievements",
    href: "/student/challenges",
    icon: <Trophy className="h-4 w-4" />,
    category: "Growth",
  },
  {
    title: "Settings",
    href: "/student/settings",
    icon: <Settings className="h-4 w-4" />,
    category: "Account",
  },
];

export const STUDENT_NAV = STUDENT_NAV_ITEMS;
