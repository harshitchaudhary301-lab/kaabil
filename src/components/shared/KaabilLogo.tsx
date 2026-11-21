"use client";

import React from "react";
import Link from "next/link";

export interface KaabilLogoProps {
  variant?: "full" | "icon" | "compact" | "sidebar";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  showTagline?: boolean;
}

export function KaabilLogo({
  variant = "full",
  size = "md",
  className = "",
  href = "/",
  showTagline = true,
}: KaabilLogoProps) {
  const iconDimensions = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }[size];

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
  }[size];

  if (variant === "sidebar") {
    const sidebarContent = (
      <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
        {/* Ribbon K Logo Mark */}
        <div className="relative flex items-center justify-center h-10 w-10 shrink-0">
          <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
            {/* Left vertical ribbon */}
            <path
              d="M10 6C10 4.89543 10.8954 4 12 4H15C16.1046 4 17 4.89543 17 6V34C17 35.1046 16.1046 36 15 36H12C10.8954 36 10 35.1046 10 34V6Z"
              fill="url(#sidebar-k-grad1)"
            />
            {/* Top diagonal ribbon */}
            <path
              d="M17 19.5L27.5 5.5C28.2 4.5 29.5 4.3 30.5 5.1L32.5 6.7C33.4 7.4 33.6 8.7 32.8 9.7L22 24.5L17 19.5Z"
              fill="url(#sidebar-k-grad2)"
            />
            {/* Bottom diagonal ribbon */}
            <path
              d="M19.5 21.5L30.5 33.8C31.3 34.7 31.2 36.1 30.2 36.8L28 38.3C27 39 25.6 38.8 24.8 37.8L15 26.5L19.5 21.5Z"
              fill="url(#sidebar-k-grad3)"
            />
            <defs>
              <linearGradient id="sidebar-k-grad1" x1="10" y1="4" x2="17" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6" />
                <stop offset="1" stopColor="#4F46E5" />
              </linearGradient>
              <linearGradient id="sidebar-k-grad2" x1="17" y1="5" x2="33" y2="25" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" />
                <stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="sidebar-k-grad3" x1="15" y1="21" x2="31" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7C3AED" />
                <stop offset="1" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="flex flex-col leading-tight">
          <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900">
            KAABIL
          </span>
          <span className="text-[10px] font-semibold text-slate-400 tracking-tight">
            Confusion &rarr; Clarity &rarr; Career
          </span>
        </div>
      </div>
    );

    if (href) {
      return (
        <Link href={href} className="focus:outline-none">
          {sidebarContent}
        </Link>
      );
    }
    return sidebarContent;
  }

  const content = (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* Orbital Icon Mark */}
      <div
        className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-primary via-primary-600 to-secondary text-white shadow-soft-sm group-hover:scale-105 group-hover:shadow-soft-md transition-all duration-300 ${iconDimensions}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:rotate-12 duration-500"
        >
          {/* Orbital Ellipse */}
          <ellipse cx="12" cy="12" rx="9" ry="4.5" transform="rotate(-30 12 12)" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
          {/* Central Four-Pointed Star / Compass Core */}
          <path
            d="M12 3L13.8 9.5L20 12L13.8 14.5L12 21L10.2 14.5L4 12L10.2 9.5L12 3Z"
            fill="white"
            stroke="white"
            strokeWidth="1"
          />
        </svg>
      </div>

      {variant !== "icon" && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span
              className={`font-heading font-extrabold tracking-tight text-text-primary ${titleSizes}`}
            >
              KAABIL
            </span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-primary border border-primary/20">
              काबिल
            </span>
          </div>
          {showTagline && variant === "full" && (
            <span className="text-[10px] font-medium tracking-wider text-text-secondary uppercase">
              Every Stream • Every Future
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
