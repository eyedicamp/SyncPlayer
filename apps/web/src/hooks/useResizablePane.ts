"use client";

import { useEffect, useRef, useState } from "react";

export function useResizablePane(initialPercent = 62) {
  const [leftPercent, setLeftPercent] = useState(initialPercent);
  const draggingRef = useRef(false);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!draggingRef.current) {
        return;
      }

      const width = window.innerWidth;
      const nextPercent = (event.clientX / width) * 100;
      setLeftPercent(Math.min(75, Math.max(35, nextPercent)));
    };

    const handleUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  return {
    leftPercent,
    startDragging: () => {
      draggingRef.current = true;
    }
  };
}
