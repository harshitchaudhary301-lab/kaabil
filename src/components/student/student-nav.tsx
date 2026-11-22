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
  Award,
  FileText,
  Mic,
  Briefcase,
  Trophy,
  Settings,
  Scale,
  GraduationCap,
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
    icon: <Bot className="h-4 w-4 text-purple-600" />,
    badge: "Trilingual",
    category: "Main",
  },
  // 3. Find My Career (Simplified from Explore Careers)
  {
    title: "Find My Career",
    href: "/student/discover",
    icon: <Compass className="h-4 w-4 text-amber-500" />,
    category: "Explore",
  },
  // 4. Compare Courses & Degrees
  {
    title: "Compare Courses",
    href: "/compare",
    icon: <Scale className="h-4 w-4 text-indigo-500" />,
    category: "Explore",
  },
  // 5. Check My Skills (Simplified from Skill Assessment)
  {
    title: "Check My Skills",
    href: "/student/assessments",
    icon: <ClipboardCheck className="h-4 w-4 text-emerald-600" />,
    category: "Competence",
  },
  // 6. What Should I Learn? (Simplified from Skill Gap Analyzer)
  {
    title: "What Should I Learn?",
    href: "/student/skill-gaps",
    icon: <SlidersHorizontal className="h-4 w-4 text-blue-600" />,
    category: "Competence",
  },
  // 7. Learn New Skills (Simplified from My Learning)
  {
    title: "Learn New Skills",
    href: "/student/academy",
    icon: <BookOpen className="h-4 w-4 text-cyan-600" />,
    category: "Competence",
  },
  // 8. My Career Roadmap (Personalized roadmap)
  {
    title: "My Career Roadmap",
    href: "/student/roadmap",
    icon: <Map className="h-4 w-4 text-purple-600" />,
    category: "Planning",
  },
  // 9. Practical Projects (Hands-on practice)
  {
    title: "Practical Projects",
    href: "/student/challenges",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    category: "Evidence",
  },
  // 10. My Achievements (Simplified from Digital Skill Passport)
  {
    title: "My Achievements",
    href: "/student/passport",
    icon: <Award className="h-4 w-4 text-amber-500" />,
    badge: "Verified",
    category: "Evidence",
  },
  // 11. Resume Builder
  {
    title: "Resume Builder",
    href: "/student/resume",
    icon: <FileText className="h-4 w-4 text-indigo-600" />,
    category: "Employability",
  },
  // 12. Interview Practice
  {
    title: "Interview Practice",
    href: "/student/interview-lab",
    icon: <Mic className="h-4 w-4 text-pink-600" />,
    category: "Employability",
  },
  // 13. Internships & Opportunities
  {
    title: "Opportunities",
    href: "/student/opportunities",
    icon: <Briefcase className="h-4 w-4 text-sky-600" />,
    category: "Employability",
  },
  // 14. Settings
  {
    title: "Settings & Privacy",
    href: "/student/settings",
    icon: <Settings className="h-4 w-4" />,
    category: "Account",
  },
];

export const STUDENT_NAV = STUDENT_NAV_ITEMS;
