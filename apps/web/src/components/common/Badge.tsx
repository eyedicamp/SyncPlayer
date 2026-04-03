import { cn } from "../../lib/cn";

export function Badge({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]",
        className
      )}
    >
      {children}
    </span>
  );
}
