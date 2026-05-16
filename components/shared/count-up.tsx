"use client";

import { useEffect, useRef, useState } from "react";

import { formatCurrency } from "@/lib/utils/format";

type FormatType = "number" | "currency";

type Props = {
  value: number;
  format?: FormatType;
  duration?: number;
  className?: string;
};

function applyFormat(n: number, fmt: FormatType): string {
  if (fmt === "currency") return formatCurrency(n);
  return String(Math.round(n));
}

export function CountUp({
  value,
  format = "number",
  duration = 700,
  className,
}: Props) {
  const [displayed, setDisplayed] = useState(applyFormat(0, format));
  const frameRef = useRef<number | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    if (typeof window === "undefined") {
      setDisplayed(applyFormat(value, format));
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
      setDisplayed(applyFormat(current, format));
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
