"use client";

import { useEffect, useState } from "react";

export function useCountdown(targetStartMs: number | null, syncOffsetMs: number) {
  const [nowMs, setNowMs] = useState<number | null>(null);
  const secondsLeft =
    targetStartMs === null || nowMs === null
      ? null
      : Math.max(0, Math.ceil((targetStartMs - (nowMs + syncOffsetMs)) / 1000));

  useEffect(() => {
    if (!targetStartMs) {
      return;
    }

    const update = () => {
      setNowMs(Date.now());
    };

    const timeout = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 100);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [syncOffsetMs, targetStartMs]);

  return secondsLeft;
}
