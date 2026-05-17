"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div style={{ width: 60, height: 26 }} />;

  const isDark = resolvedTheme === "dark";

  return (
    <div
      role="group"
      aria-label="Theme"
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "var(--bg-subtle)",
        borderRadius: "var(--radius-full)",
        padding: 2,
        gap: 1,
      }}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label="Light theme"
        aria-pressed={!isDark}
        style={{
          display: "grid",
          placeItems: "center",
          width: 26,
          height: 22,
          borderRadius: "var(--radius-full)",
          border: "none",
          cursor: "pointer",
          background: !isDark ? "var(--bg-surface)" : "transparent",
          color: !isDark ? "var(--fg)" : "var(--fg-3)",
          boxShadow: !isDark ? "var(--shadow-xs)" : "none",
          transition: `background var(--dur-base), color var(--dur-base), box-shadow var(--dur-base)`,
        }}
      >
        <Sun size={13} strokeWidth={1.6} />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label="Dark theme"
        aria-pressed={isDark}
        style={{
          display: "grid",
          placeItems: "center",
          width: 26,
          height: 22,
          borderRadius: "var(--radius-full)",
          border: "none",
          cursor: "pointer",
          background: isDark ? "var(--bg-surface)" : "transparent",
          color: isDark ? "var(--fg)" : "var(--fg-3)",
          boxShadow: isDark ? "var(--shadow-xs)" : "none",
          transition: `background var(--dur-base), color var(--dur-base), box-shadow var(--dur-base)`,
        }}
      >
        <Moon size={13} strokeWidth={1.6} />
      </button>
    </div>
  );
}
