"use client";

import { Command, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { RAIL_SECTIONS } from "@/config/nav";

type RailProps = {
  section: string;
  onSectionChange: (id: string) => void;
  onOpenSearch: () => void;
};

const btnBase: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 9,
  display: "grid",
  placeItems: "center",
  border: "none",
  cursor: "pointer",
  position: "relative",
  transition: `background var(--dur-fast), color var(--dur-fast)`,
};

export function Rail({ section, onSectionChange, onOpenSearch }: RailProps) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "var(--rail-w)",
        borderRight: "1px solid var(--border)",
        background: "var(--bg-canvas)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px 0",
        gap: 4,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link href="/dashboard" style={{ marginBottom: 12, display: "block" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: "var(--fg)",
            color: "var(--bg-canvas)",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "-0.04em",
          }}
        >
          C
        </div>
      </Link>

      {/* Section icons — fill remaining space */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {RAIL_SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSectionChange(s.id)}
              aria-label={s.label}
              aria-pressed={active}
              className="rail-btn"
              style={{
                ...btnBase,
                color: active ? "var(--fg)" : "var(--fg-3)",
                background: active ? "var(--bg-subtle)" : "transparent",
              }}
            >
              {active && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: -10,
                    top: 8,
                    bottom: 8,
                    width: 2,
                    background: "var(--border-focus)",
                    borderRadius: 2,
                  }}
                />
              )}
              <Icon size={18} strokeWidth={1.6} />
              <span className="rail-tooltip">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom: settings + cmd+K */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingBottom: 4 }}>
        <Link href="/settings">
          <button
            aria-label="Settings"
            className="rail-btn"
            style={{
              ...btnBase,
              color: pathname.startsWith("/settings") ? "var(--fg)" : "var(--fg-3)",
              background: pathname.startsWith("/settings") ? "var(--bg-subtle)" : "transparent",
            }}
          >
            <Settings size={18} strokeWidth={1.6} />
            <span className="rail-tooltip">Settings</span>
          </button>
        </Link>
        <button
          onClick={onOpenSearch}
          aria-label="Command palette (⌘K)"
          className="rail-btn"
          style={{
            ...btnBase,
            color: "var(--fg-3)",
            background: "transparent",
          }}
        >
          <Command size={18} strokeWidth={1.6} />
          <span className="rail-tooltip">Command (⌘K)</span>
        </button>
      </div>
    </aside>
  );
}
