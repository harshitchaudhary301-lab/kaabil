import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-primary text-white shadow-soft-sm hover:bg-primary-hover hover:shadow-soft-md",
      secondary:
        "bg-secondary text-white shadow-soft-sm hover:bg-secondary-hover hover:shadow-soft-md",
      outline:
        "border border-border bg-white text-text-primary hover:bg-slate-50 hover:border-slate-300 shadow-soft-xs",
      ghost:
        "text-text-secondary hover:text-text-primary hover:bg-slate-100",
      gradient:
        "bg-gradient-primary text-white shadow-soft-sm hover:shadow-soft-md hover:brightness-105 active:brightness-95",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 shadow-soft-xs",
    };

    const sizeStyles = {
      sm: "h-9 px-3 text-xs gap-1.5",
      md: "h-11 px-5 text-sm gap-2",
      lg: "h-13 px-7 text-base gap-2.5 font-semibold",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
