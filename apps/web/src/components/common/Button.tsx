"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  children,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-[var(--accent)] text-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
        variant === "secondary" && "bg-white/8 text-white ring-1 ring-white/12",
        variant === "ghost" && "bg-transparent text-[var(--muted)] ring-1 ring-white/10",
        variant === "danger" && "bg-[var(--danger)] text-white",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
