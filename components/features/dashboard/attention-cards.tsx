import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  MessageSquare,
  MoreHorizontal,
  Quote,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { AttentionItem, AttentionItemType } from "@/lib/dashboard/types";

type Props = {
  items: AttentionItem[];
};

type Tone = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  action: string;
};

const TONE: Record<AttentionItemType, Tone> = {
  overdue_invoice: {
    icon: AlertTriangle,
    iconBg: "var(--danger-soft)",
    iconColor: "var(--danger)",
    action: "Send reminder",
  },
  project_deadline: {
    icon: Clock,
    iconBg: "var(--warning-soft)",
    iconColor: "var(--warning)",
    action: "Open project",
  },
  expiring_quote: {
    icon: Quote,
    iconBg: "var(--info-soft)",
    iconColor: "var(--info)",
    action: "Nudge client",
  },
  quote_no_response: {
    icon: MessageSquare,
    iconBg: "var(--info-soft)",
    iconColor: "var(--info)",
    action: "Nudge client",
  },
};

function who(item: AttentionItem): string {
  const match = item.label.match(/^(.+?)\s+(?:is|has|needs|quote)/i);
  return match ? match[1] : "";
}

export function AttentionCards({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.012em",
            color: "var(--fg)",
          }}
        >
          Needs attention
        </h2>
        <span style={{ fontSize: 12, color: "var(--fg-3)" }}>
          {items.length} item{items.length !== 1 ? "s" : ""} · scored by AI
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`,
          gap: 12,
        }}
      >
        {items.map((item) => {
          const tone = TONE[item.type];
          const Icon = tone.icon;
          const clientWho = who(item);

          return (
            <div
              key={`${item.type}-${item.id}`}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: tone.iconBg,
                    color: tone.iconColor,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} strokeWidth={1.6} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      lineHeight: 1.35,
                      color: "var(--fg)",
                    }}
                  >
                    {item.label}
                  </div>
                  {clientWho && (
                    <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
                      {clientWho}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                <Link
                  href={item.href}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    height: 30,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--bg-subtle)",
                    color: "var(--fg-2)",
                    fontSize: 12.5,
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "background 120ms, color 120ms, border-color 120ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-surface)";
                    e.currentTarget.style.color = "var(--fg)";
                    e.currentTarget.style.borderColor = "var(--border-strong)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-subtle)";
                    e.currentTarget.style.color = "var(--fg-2)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  <Sparkles size={12} strokeWidth={1.6} />
                  {tone.action}
                </Link>
                <button
                  type="button"
                  aria-label="More actions"
                  title="More actions"
                  style={{
                    width: 30,
                    height: 30,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--bg-subtle)",
                    color: "var(--fg-3)",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "background 120ms, color 120ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-surface)";
                    e.currentTarget.style.color = "var(--fg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-subtle)";
                    e.currentTarget.style.color = "var(--fg-3)";
                  }}
                >
                  <MoreHorizontal size={14} strokeWidth={1.6} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
