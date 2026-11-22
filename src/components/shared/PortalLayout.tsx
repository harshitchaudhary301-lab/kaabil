"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  User,
  GraduationCap,
  Building2,
  Briefcase,
  Lock,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Search,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KaabilLogo } from "@/components/shared/KaabilLogo";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Language } from "@/lib/i18n/translations";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  category?: string;
}

interface PortalLayoutProps {
  portalName: string;
  portalRole: "STUDENT" | "INSTITUTION" | "EMPLOYER" | "ADMIN";
  navItems: NavItem[];
  breadcrumbs?: string[];
  children: React.ReactNode;
}

export function PortalLayout({
  portalName,
  portalRole,
  navItems,
  breadcrumbs = ["Dashboard"],
  children,
}: PortalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isStudent = portalRole === "STUDENT";

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const groupedNav = React.useMemo(() => {
    const groups: { category: string; items: NavItem[] }[] = [];
    const map = new Map<string, NavItem[]>();

    navItems.forEach((item) => {
      const cat = item.category || "";
      if (!map.has(cat)) {
        map.set(cat, []);
        groups.push({ category: cat, items: map.get(cat)! });
      }
      map.get(cat)!.push(item);
    });
    return groups;
  }, [navItems]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if ((data.authenticated || data.isAuthenticated) && data.user) {
            const user = data.user;
            setCurrentUser(user);

            // Role guard check: prevent unauthorized role access between portals
            const role = user.role;
            const isAuthorized =
              role === "SUPER_ADMIN" ||
              role === "ADMIN" ||
              (portalRole === "STUDENT" && role === "STUDENT") ||
              (portalRole === "INSTITUTION" && (role === "INSTITUTION_ADMIN" || role === "FACULTY")) ||
              (portalRole === "EMPLOYER" && (role === "EMPLOYER_ADMIN" || role === "RECRUITER")) ||
              (portalRole === "ADMIN" && (role === "SUPER_ADMIN" || role === "ADMIN" || role === "CONTENT_ADMIN"));

            if (!isAuthorized) {
              // Redirect to user's authorized portal
              if (role === "STUDENT") router.push("/student/dashboard");
              else if (role === "INSTITUTION_ADMIN" || role === "FACULTY") router.push("/institution/dashboard");
              else if (role === "EMPLOYER_ADMIN" || role === "RECRUITER") router.push("/employer/dashboard");
              else router.push("/login");
            }
          } else {
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      }
    }
    checkAuth();
  }, [portalRole, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    } finally {
      router.push("/login");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (portalRole === "STUDENT") {
        router.push(`/student/discover?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        router.push(`/careers?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const roleStyles = {
    STUDENT: {
      badge: "Student Portal",
      color: "bg-primary/10 text-primary border-primary/20",
      icon: <GraduationCap className="h-4 w-4 text-emerald-600" />,
    },
    INSTITUTION: {
      badge: "Institution Console",
      color: "bg-secondary/10 text-secondary border-secondary/20",
      icon: <Building2 className="h-4 w-4 text-secondary" />,
    },
    EMPLOYER: {
      badge: "Employer Console",
      color: "bg-sky-50 text-sky-700 border-sky-200",
      icon: <Briefcase className="h-4 w-4 text-primary" />,
    },
    ADMIN: {
      badge: "Governance Console",
      color: "bg-slate-900 text-white border-slate-700",
      icon: <Lock className="h-4 w-4 text-slate-300" />,
    },
  }[portalRole];

  return (
    <div className="min-h-screen bg-[#FAF8FD] flex flex-col antialiased text-text-primary">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col border-r select-none shrink-0 transition-all duration-300 ${
            isStudent
              ? "bg-[#150E22] border-[#251838] text-purple-100"
              : "bg-white border-slate-200/80 text-slate-800"
          } ${sidebarCollapsed ? "w-20" : "w-64"}`}
        >
          {/* Brand header */}
          <div className="p-4 px-4 border-b border-inherit flex items-center justify-between gap-2">
            {!sidebarCollapsed ? (
              <KaabilLogo variant={isStudent ? "sidebar-dark" : "sidebar"} href="/" />
            ) : (
              <div className="mx-auto">
                <KaabilLogo variant="icon" size="sm" href="/" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-1.5 rounded-xl transition-colors ${
                isStudent
                  ? "text-purple-300 hover:text-white hover:bg-white/10"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              }`}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {groupedNav.map((group, gIdx) => {
              const isCollapsed = Boolean(collapsedCategories[group.category]);
              const hasActiveItem = group.items.some((i) => pathname === i.href);
              const showItems = !isCollapsed || hasActiveItem;

              return (
                <div key={gIdx} className="space-y-1">
                  {group.category && portalRole !== "STUDENT" && !sidebarCollapsed ? (
                    <button
                      type="button"
                      onClick={() => toggleCategory(group.category)}
                      className="w-full flex items-center justify-between px-2.5 py-1 mt-2.5 first:mt-0 text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors select-none group"
                    >
                      <span className="truncate">{group.category}</span>
                      <span className="text-text-muted group-hover:text-text-primary shrink-0">
                        {showItems ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </span>
                    </button>
                  ) : null}

                  {showItems && (
                    <div className="space-y-1">
                      {group.items.map((item, idx) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={idx}
                            href={item.href}
                            title={sidebarCollapsed ? item.title : undefined}
                            className={`flex items-center ${
                              sidebarCollapsed ? "justify-center px-2 py-3" : "justify-between px-3.5 py-2.5"
                            } rounded-2xl text-xs transition-all ${
                              isActive
                                ? isStudent
                                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold shadow-lg shadow-purple-950/40 border border-purple-400/20"
                                  : "bg-[#4F46E5] text-white font-semibold shadow-md shadow-indigo-100"
                                : isStudent
                                ? "text-purple-200/75 hover:text-white hover:bg-white/[0.08] font-medium"
                                : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={
                                  isActive
                                    ? "text-white shrink-0"
                                    : isStudent
                                    ? "text-purple-300/80 shrink-0"
                                    : "text-slate-500 shrink-0"
                                }
                              >
                                {item.icon}
                              </span>
                              {!sidebarCollapsed && (
                                <span className="truncate">{item.title}</span>
                              )}
                            </div>
                            {!sidebarCollapsed && item.badge && (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0 ${
                                  isActive
                                    ? "bg-white/20 text-white"
                                    : isStudent
                                    ? "bg-purple-900/60 text-purple-200 border border-purple-700/50"
                                    : "bg-slate-100 text-slate-600 border border-border"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* KAABIL Pro Card */}
          <div className="p-3">
            {!sidebarCollapsed ? (
              <div
                className={`p-4 rounded-2xl ${
                  isStudent
                    ? "bg-gradient-to-b from-[#221638] to-[#1A102C] border border-purple-800/40 text-purple-100"
                    : "bg-gradient-to-b from-[#FAF5FF] to-[#F3E8FF]/60 border border-purple-100"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <span>👑</span> <span className={isStudent ? "text-purple-100" : "text-purple-900"}>KAABIL Pro</span>
                </div>
                <p className={`text-[11px] mt-1 leading-snug ${isStudent ? "text-purple-300/70" : "text-slate-500"}`}>
                  Unlock advanced AI tools &amp; personalized guidance
                </p>
                <Link href="/student/mentor" className="block mt-3">
                  <button className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1">
                    Upgrade Now &rarr;
                  </button>
                </Link>
              </div>
            ) : (
              <Link href="/student/mentor" title="Upgrade to KAABIL Pro" className="flex justify-center p-2 rounded-xl hover:bg-white/10 text-amber-400">
                <span>👑</span>
              </Link>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col overflow-y-auto ${isStudent ? "bg-[#FAF8FD]" : "bg-[#F8FAFC]"}`}>
          {/* Top Header Bar */}
          <header className={`h-16 border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 ${
            isStudent
              ? "bg-[#FAF8FD]/90 backdrop-blur-md border-purple-100/70"
              : "bg-white/95 backdrop-blur-md border-slate-200/80"
          }`}>
            {/* Left: Mobile Trigger & Search Input */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 focus:outline-none"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Global Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search careers, skills, courses, jobs..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
                />
              </form>
            </div>

            {/* Right: Security Pill, Notifications, Trilingual switcher, Streak, User Profile Dropdown */}
            <div className="flex items-center gap-2.5">
              {/* Compact Security Indicator (Task 1) */}
              {currentUser ? (
                <div
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-[11px] font-semibold text-emerald-800"
                  title={`Private & Protected: Signed in as ${currentUser.name}. Your student account is confidential and safe.`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden xl:inline">Private &amp; Secure</span>
                  <span className="xl:hidden">Secure</span>
                </div>
              ) : (
                <div
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50/90 border border-amber-200/80 text-[11px] font-semibold text-amber-800"
                  title="Demonstration Preview Mode Active"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span>Preview</span>
                </div>
              )}

              {/* Notification Bell with unread dot */}
              <button
                aria-label="Notifications"
                className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              {/* Trilingual Switcher Pill */}
              <div className="flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-bold">
                <span className="px-1 text-slate-400">
                  <Globe className="h-3 w-3" />
                </span>
                {(["en", "hi", "hinglish"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2 py-0.5 rounded-full transition-all ${
                      language === lang
                        ? "bg-purple-700 text-white shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {lang === "en" ? "EN" : lang === "hi" ? "हिन्दी" : "Hing"}
                  </button>
                ))}
              </div>

              {/* 7 Day Streak Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold select-none">
                <span className="text-sm">🔥</span>
                <span>7 Day Streak</span>
              </div>

              {/* User Profile Chip with Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-full hover:bg-slate-100 transition-all text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-sky-400 p-[1.5px] shrink-0">
                    <div className="w-full h-full rounded-full bg-indigo-50 flex items-center justify-center font-bold text-xs text-indigo-700">
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "H"}
                    </div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser?.name || "Harshit Chaudhary"}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      {currentUser?.studentProfile?.educationStage?.replace(/_/g, " ") || "B.Tech (CSE)"}
                    </div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser?.name || "Harshit Chaudhary"}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {currentUser?.email || "harshit@kaabil.in"}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700">
                        {currentUser?.role || portalRole}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/student/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        Settings & Privacy
                      </Link>
                      <Link
                        href="/student/portfolio"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                        Student Portfolio
                      </Link>
                      <Link
                        href="/"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <ArrowLeft className="h-3 w-3 text-slate-400" />
                        Public Website
                      </Link>
                    </div>

                    <div className="px-3 py-1.5 border-t border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Portal
                    </div>
                    <div className="grid grid-cols-2 gap-1 px-2 py-1">
                      <Link
                        href="/student/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`text-center py-1 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                          portalRole === "STUDENT"
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Student
                      </Link>
                      <Link
                        href="/institution/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`text-center py-1 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                          portalRole === "INSTITUTION"
                            ? "bg-purple-50 text-purple-700"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Institution
                      </Link>
                      <Link
                        href="/employer/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`text-center py-1 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                          portalRole === "EMPLOYER"
                            ? "bg-sky-50 text-sky-700"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Employer
                      </Link>
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`text-center py-1 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                          portalRole === "ADMIN"
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Admin
                      </Link>
                    </div>

                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className={`relative w-72 border-r h-full flex flex-col z-50 p-4 ${
            isStudent ? "bg-[#150E22] border-[#251838] text-purple-100" : "bg-white border-border"
          }`}>
            <div className={`flex items-center justify-between pb-4 border-b ${
              isStudent ? "border-purple-900/50" : "border-border"
            }`}>
              <KaabilLogo variant={isStudent ? "sidebar-dark" : "sidebar"} href="/" />
              <button
                onClick={() => setSidebarOpen(false)}
                className={`p-1.5 rounded-lg ${
                  isStudent ? "text-purple-300 hover:text-white hover:bg-white/10" : "text-text-secondary hover:bg-slate-100"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
              {groupedNav.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  {group.category ? (
                    <div className={`px-3 pt-2 text-[10px] font-bold uppercase tracking-wider ${
                      isStudent ? "text-purple-400/70" : "text-text-muted"
                    }`}>
                      {group.category}
                    </div>
                  ) : null}
                  {group.items.map((item, idx) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-2xl transition-all ${
                          isActive
                            ? isStudent
                              ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold shadow-md shadow-purple-950/40"
                              : "bg-primary text-white font-bold"
                            : isStudent
                            ? "text-purple-200/80 hover:text-white hover:bg-white/[0.08]"
                            : "text-text-primary hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={isActive ? "text-white shrink-0" : isStudent ? "text-purple-300 shrink-0" : "text-text-muted shrink-0"}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.title}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0 ${
                              isActive
                                ? "bg-white/20 text-white"
                                : isStudent
                                ? "bg-purple-900/60 text-purple-200 border border-purple-700/50"
                                : "bg-slate-100 text-slate-600 border border-border"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
            <div className={`pt-4 border-t space-y-2 ${isStudent ? "border-purple-900/50" : "border-border"}`}>
              <Link href="/">
                <Button variant="outline" size="sm" className={`w-full rounded-xl ${
                  isStudent ? "border-purple-800/60 bg-purple-950/40 text-purple-200 hover:bg-purple-900/40 hover:text-white" : ""
                }`}>
                  Public Landing Page
                </Button>
              </Link>
              {currentUser && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full text-rose-400 border-rose-900/40 bg-rose-950/20 hover:bg-rose-900/40 rounded-xl"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
