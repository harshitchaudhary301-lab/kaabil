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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Explore Careers", href: "/careers", icon: <Compass className="h-3.5 w-3.5 text-[#FFC66B]" /> },
    { label: "Features", href: "/#features", icon: <Sparkles className="h-3.5 w-3.5 text-[#E68AAB]" /> },
    { label: "For Students", href: "/#portals", icon: <GraduationCap className="h-3.5 w-3.5 text-emerald-400" /> },
    { label: "For Institutions", href: "/institution/dashboard", icon: <Building2 className="h-3.5 w-3.5 text-purple-300" /> },
    { label: "For Employers", href: "/employer/dashboard", icon: <Briefcase className="h-3.5 w-3.5 text-[#FFA94D]" /> },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-[#1E0F2B]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.35)] border-b border-[#56316F]/40"
          : "bg-[#251336]/80 backdrop-blur-md border-b border-white/10"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with dark-theme styling */}
        <KaabilLogo variant="sidebar-dark" size="md" href="/" />

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6">
          {navLinks.map((link) => {
            const isExact = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-bold transition-all px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                  isExact
                    ? "text-[#FFC66B] bg-[#56316F]/40 font-extrabold"
                    : "text-[#FFF5E9]/80 hover:text-[#FFC66B] hover:bg-white/10"
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
              className="font-bold text-xs text-[#FFF5E9]/85 hover:text-[#FFC66B] hover:bg-white/10 px-3.5 h-10 rounded-xl"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#FFC66B] via-[#FFA94D] to-[#F59E0B] hover:from-[#FFD285] hover:to-[#E08D07] text-[#1E0F2B] font-extrabold text-xs h-10 px-5 rounded-xl shadow-[0_4px_16px_rgba(255,198,107,0.35)] hover:scale-[1.02] transition-all gap-1.5 active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#1E0F2B]" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex xl:hidden items-center gap-2">
          <Link href="/login" className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-[#FFF5E9]/80 h-9 px-2.5 rounded-lg"
            >
              Sign In
            </Button>
          </Link>
          <button
            type="button"
            className="p-2 rounded-xl text-[#FFF5E9]/80 hover:text-[#FFC66B] hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#1E0F2B]/98 border-b border-[#56316F]/50 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-xs font-bold text-[#FFF5E9]/85 hover:text-[#FFC66B] hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {link.icon}
                  <span>{link.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#FFF5E9]/40" />
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-white/20 text-xs font-bold text-[#FFF5E9]"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-[#FFC66B] to-[#FFA94D] text-[#1E0F2B] text-xs font-extrabold shadow-md flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
