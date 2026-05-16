"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
};

export function CountUp({
  value,
  format = (n) => String(Math.round(n)),
  duration = 700,
  className,
}: Props) {
  const [displayed, setDisplayed] = useState(format(0));
  const frameRef = useRef<number | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    if (typeof window === "undefined") {
      setDisplayed(format(value));
      return;
    }

    const startTime = performance.now();
    const startValue = 0;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * eased;
      setDisplayed(format(current));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // intentionally only runs on mount — value after first render is "target"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <span className={className}>{displayed}</span>;
}
