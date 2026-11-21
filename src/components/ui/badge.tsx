import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "outline"
    | "demo"
    | "active"
    | "planned";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    primary: "bg-primary/10 text-primary border-primary/20 font-medium",
    secondary: "bg-secondary/10 text-secondary border-secondary/20 font-medium",
    accent: "bg-accent/15 text-slate-900 border-accent/30 font-medium",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    outline: "border-border text-text-secondary bg-white",
    demo: "bg-amber-100/80 text-amber-900 border-amber-300 font-semibold tracking-wider uppercase text-[10px]",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium",
    planned: "bg-slate-100 text-slate-600 border-slate-200 font-medium",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs transition-colors focus:outline-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
