"use client";

import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";

const DISMISS_KEY = "craftly:ai-strip-dismissed";

type AISidekickStripProps = {
  message?: string;
  meta?: string;
  onReview?: () => void;
};

export function AISidekickStrip({
  message = "I drafted your daily digest — check outstanding invoices and upcoming deadlines.",
  meta = "Project Intelligence · Phase 3",
  onReview,
}: AISidekickStripProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (stored) {
      const dismissedDate = new Date(stored);
      const today = new Date();
      const sameDay =
        dismissedDate.getFullYear() === today.getFullYear() &&
        dismissedDate.getMonth() === today.getMonth() &&
        dismissedDate.getDate() === today.getDate();
      if (!sameDay) setDismissed(false);
    } else {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, var(--accent-soft), var(--bg-surface) 60%)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        position: "relative",
        overflow: "hidden",
        opacity: 0,
        animation: "fadeUp 0.4s ease 0.1s forwards",
      }}
    >
      {/* Accent icon */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: "var(--border-focus)",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Sparkles size={18} strokeWidth={1.6} />
      </div>

      {/* Message */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            color: "var(--fg)",
            lineHeight: 1.4,
          }}
        >
          {message}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--fg-3)",
            marginTop: 2,
          }}
        >
          {meta}
        </div>
      </div>

      {/* CTA */}
      {onReview && (
        <button
          onClick={onReview}
          style={{
            height: 26,
            padding: "0 12px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--bg-surface)",
            color: "var(--fg-2)",
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            cursor: "pointer",
            flexShrink: 0,
            transition: "border-color var(--dur-fast), color var(--dur-fast)",
          }}
        >
          Review
        </button>
      )}

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          width: 24,
          height: 24,
          borderRadius: 5,
          border: "none",
          background: "transparent",
          color: "var(--fg-3)",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <X size={13} strokeWidth={1.6} />
      </button>
    </div>
  );
}
