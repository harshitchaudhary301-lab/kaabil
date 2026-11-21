import React from "react";
import {
  LayoutDashboard,
  Bot,
  Compass,
  TrendingUp,
  ClipboardCheck,
  SlidersHorizontal,
  BookOpen,
  Map,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Mic,
  Briefcase,
  Trophy,
  Settings,
} from "lucide-react";
import { NavItem } from "@/components/shared/PortalLayout";

export const STUDENT_NAV_ITEMS: NavItem[] = [
  // 1. Overview
  {
    title: "Overview",
    href: "/student/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    category: "Main",
  },
  // 2. AI Career Mentor
  {
    title: "AI Career Mentor",
    href: "/student/mentor",
    icon: <Bot className="h-4 w-4" />,
    badge: "AI",
    category: "Main",
  },
  // 3. Explore Careers
  {
    title: "Explore Careers",
    href: "/student/discover",
    icon: <Compass className="h-4 w-4" />,
    category: "Explore",
  },
  // 4. Career Readiness
  {
    title: "Career Readiness",
    href: "/student/readiness",
    icon: <TrendingUp className="h-4 w-4" />,
    badge: "CRI",
    category: "Explore",
  },
  // 5. Skill Assessment
  {
    title: "Skill Assessment",
    href: "/student/assessments",
    icon: <ClipboardCheck className="h-4 w-4" />,
    category: "Competence",
  },
  // 6. Skill Gap Analyzer
  {
    title: "Skill Gap Analyzer",
    href: "/student/skill-gaps",
    icon: <SlidersHorizontal className="h-4 w-4" />,
    category: "Competence",
  },
  // 7. My Learning
  {
    title: "My Learning",
    href: "/student/academy",
    icon: <BookOpen className="h-4 w-4" />,
    category: "Competence",
  },
  // 8. Career Roadmap
  {
    title: "Career Roadmap",
    href: "/student/roadmap",
    icon: <Map className="h-4 w-4" />,
    category: "Planning",
  },
  // 9. Project Challenges
  {
    title: "Project Challenges",
    href: "/student/challenges",
    icon: <CheckCircle2 className="h-4 w-4" />,
    category: "Evidence",
  },
  // 10. Digital Skill Passport
  {
    title: "Digital Skill Passport",
    href: "/student/passport",
    icon: <ShieldCheck className="h-4 w-4" />,
    badge: "Verified",
    category: "Evidence",
  },
  // 11. Resume Studio
  {
    title: "Resume Studio",
    href: "/student/resume",
    icon: <FileText className="h-4 w-4" />,
    category: "Employability",
  },
  // 12. Interview Lab
  {
    title: "Interview Lab",
    href: "/student/interview-lab",
    icon: <Mic className="h-4 w-4" />,
    category: "Employability",
  },
  // 13. Jobs & Internships
  {
    title: "Jobs & Internships",
    href: "/student/opportunities",
    icon: <Briefcase className="h-4 w-4" />,
    category: "Employability",
  },
  // 14. Achievements
  {
    title: "Achievements",
    href: "/student/portfolio",
    icon: <Trophy className="h-4 w-4" />,
    category: "Growth",
  },
  // 15. Settings
  {
    title: "Settings",
    href: "/student/settings",
    icon: <Settings className="h-4 w-4" />,
    category: "Account",
  },
];

export const STUDENT_NAV = STUDENT_NAV_ITEMS;
