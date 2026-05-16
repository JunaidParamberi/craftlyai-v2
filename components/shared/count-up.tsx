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

  useEffect(() => {
    // Reset to 0 so every mount (including back-navigation) animates cleanly
    setDisplayed(applyFormat(0, format));

    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(applyFormat(value * eased, format));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={className}>{displayed}</span>;
}
