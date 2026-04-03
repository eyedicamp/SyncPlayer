"use client";

import type { BufferingPolicy } from "@syncplayer/shared";

import { Button } from "../common/Button";

export function BufferingPolicySelector({
  value,
  disabled,
  onChange
}: {
  value: BufferingPolicy;
  disabled?: boolean;
  onChange: (value: BufferingPolicy) => Promise<void>;
}) {
  return (
    <div className="rounded-3xl border border-white/8 bg-black/16 p-4">
      <p className="text-sm font-medium text-white">Buffering policy</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Choose whether a single participant buffering pauses the whole room or only resyncs that
        viewer.
      </p>
      <div className="mt-4 flex gap-3">
        <Button
          variant={value === "self_recover" ? "primary" : "secondary"}
          disabled={disabled}
          onClick={() => onChange("self_recover")}
        >
          Self recover
        </Button>
        <Button
          variant={value === "pause_all" ? "primary" : "secondary"}
          disabled={disabled}
          onClick={() => onChange("pause_all")}
        >
          Pause all
        </Button>
      </div>
    </div>
  );
}
