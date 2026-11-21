"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowRight,
  GraduationCap,
  Building2,
  Briefcase,
  Compass,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KaabilLogo } from "@/components/shared/KaabilLogo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Explore Careers", href: "/careers", icon: <Compass className="h-3.5 w-3.5 text-primary" /> },
    { label: "Features", href: "/#innovations", icon: <Sparkles className="h-3.5 w-3.5 text-secondary" /> },
    { label: "For Students", href: "/#portals", icon: <GraduationCap className="h-3.5 w-3.5 text-emerald-600" /> },
    { label: "For Institutions", href: "/institution/dashboard", icon: <Building2 className="h-3.5 w-3.5 text-indigo-600" /> },
    { label: "For Employers", href: "/employer/dashboard", icon: <Briefcase className="h-3.5 w-3.5 text-sky-600" /> },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-soft-sm border-b border-border/80"
          : "bg-white/75 backdrop-blur-sm border-b border-border/40"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <KaabilLogo variant="full" size="md" href="/" />

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6">
          {navLinks.map((link) => {
            const isExact = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-bold transition-all px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 ${
                  isExact
                    ? "text-primary bg-primary/5 font-extrabold"
                    : "text-text-secondary hover:text-text-primary hover:bg-slate-50"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="font-bold text-xs text-text-secondary hover:text-text-primary px-3 h-10 rounded-xl"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/95 hover:to-secondary/95 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-soft-xs hover:shadow-soft-sm transition-all gap-1.5 active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex xl:hidden items-center gap-2">
          <Link href="/login" className="sm:hidden">
            <Button variant="ghost" size="sm" className="text-xs font-bold text-text-secondary">
              Sign In
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-border bg-white p-2.5 text-text-secondary hover:text-text-primary focus:outline-none shadow-soft-xs transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-border bg-white/98 backdrop-blur-xl px-5 pt-3 pb-6 space-y-4 shadow-soft-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-text-primary hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {link.icon}
                  <span>{link.label}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs h-11 rounded-xl shadow-soft-xs">
                Get Started Free &rarr;
              </Button>
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full font-bold text-xs h-11 rounded-xl">
                Sign In to Existing Account
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
