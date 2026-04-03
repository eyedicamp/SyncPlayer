"use client";

import { cn } from "../../lib/cn";
import { useResizablePane } from "../../hooks/useResizablePane";

export function SplitPane({
  left,
  right,
  className
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}) {
  const { leftPercent, startDragging } = useResizablePane();

  return (
    <div className={cn("flex flex-1 flex-col xl:flex-row", className)}>
      <section className="min-h-[380px] xl:min-h-0" style={{ width: `${leftPercent}%` }}>
        {left}
      </section>
      <button
        type="button"
        aria-label="Resize panels"
        onPointerDown={startDragging}
        className="hidden w-4 shrink-0 cursor-col-resize items-center justify-center xl:flex"
      >
        <span className="h-24 w-1 rounded-full bg-white/10 transition hover:bg-[var(--accent)]" />
      </button>
      <aside className="min-h-[360px] border-t border-white/10 xl:min-h-0 xl:flex-1 xl:border-l xl:border-t-0">
        {right}
      </aside>
    </div>
  );
}
