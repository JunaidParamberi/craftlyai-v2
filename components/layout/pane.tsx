"use client";

import { ChevronDown, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { PANE_CONFIGS } from "@/config/nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { PLAN_ORDER } from "@/config/plans";
import type { PlanUsage } from "@/lib/plan-usage/helpers";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
};

type PaneProps = {
  section: string;
  userEmail: string | null;
  userName: string | null;
  userInitials: string;
  planUsage: PlanUsage;
  unreadCount: number;
  openTaskCount: number;
  onOpenSearch: () => void;
};

export const OPEN_INBOX_EVENT = "craftly:open-inbox";

function getInitials(initials: string): string {
  return initials.slice(0, 2).toUpperCase();
}

const AVATAR_PALETTES = [
  ["#3550E0", "#6E83F0"],
  ["#1F8A52", "#3FB87D"],
  ["#B36A12", "#E0995E"],
  ["#C13838", "#E76B6B"],
  ["#2F6FB8", "#6FA8E6"],
  ["#6B4FA8", "#9B7FD8"],
];

function hashInitials(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffff;
  return Math.abs(h) % AVATAR_PALETTES.length;
}

export function Pane({
  section,
  userEmail,
  userName,
  userInitials,
  planUsage,
  unreadCount,
  openTaskCount,
  onOpenSearch,
}: PaneProps) {
  const pathname = usePathname();
  const router = useRouter();
  const config = PANE_CONFIGS[section];

  const showUpgrade = PLAN_ORDER.indexOf(planUsage.planTier) < PLAN_ORDER.indexOf("pro");
  const palette = AVATAR_PALETTES[hashInitials(userInitials)];

  const COUNTS: Record<string, number | undefined> = {
    inbox: unreadCount,
    tasks: openTaskCount,
  };

  function openInbox() {
    window.dispatchEvent(new Event(OPEN_INBOX_EVENT));
  }

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (!config) return null;

  return (
    <aside
      style={{
        width: "var(--pane-w)",
        borderRight: "1px solid var(--border)",
        background: "var(--bg-canvas)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px 10px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.012em",
            color: "var(--fg)",
          }}
        >
          {config.title}
        </span>
        <button
          onClick={onOpenSearch}
          title="New"
          aria-label="New item"
          style={{
            width: 26,
            height: 26,
            borderRadius: "var(--radius-md)",
            display: "grid",
            placeItems: "center",
            border: "none",
            cursor: "pointer",
            color: "var(--fg-3)",
            background: "transparent",
            transition: `background var(--dur-fast), color var(--dur-fast)`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-subtle)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--fg)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--fg-3)";
          }}
        >
          <Plus size={14} strokeWidth={1.6} />
        </button>
      </div>

      {/* Search */}
      <button
        onClick={onOpenSearch}
        aria-label="Quick search"
        style={{
          margin: "0 12px 8px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          background: "var(--bg-subtle)",
          borderRadius: "var(--radius-md)",
          color: "var(--fg-3)",
          fontSize: "var(--text-sm)",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          width: "calc(100% - 24px)",
          transition: `background var(--dur-fast)`,
          flexShrink: 0,
        }}
      >
        <Search size={13} strokeWidth={1.6} />
        <span style={{ flex: 1, color: "var(--fg-3)", fontSize: "var(--text-sm)" }}>
          Quick search…
        </span>
        <kbd
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 10.5,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            padding: "1px 5px",
            borderRadius: 4,
            color: "var(--fg-3)",
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Nav body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 16px" }}>
        {config.sections.map((sec, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            {sec.label && (
              <div
                style={{
                  padding: "6px 12px 4px",
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--fg-3)",
                }}
              >
                {sec.label}
              </div>
            )}
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isAction = item.href.startsWith("#");
              const active =
                !isAction &&
                (pathname === item.href || pathname.startsWith(`${item.href}/`));
              const count = COUNTS[item.id];
              const itemStyle: React.CSSProperties = {
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 10px",
                margin: "1px 4px",
                borderRadius: 7,
                fontSize: "var(--text-base)",
                color: active ? "var(--fg)" : "var(--fg-2)",
                fontWeight: active ? 500 : 400,
                background: active ? "var(--bg-subtle)" : "transparent",
                textDecoration: "none",
                transition: `background var(--dur-fast), color var(--dur-fast)`,
                border: "none",
                width: "calc(100% - 8px)",
                textAlign: "left",
                cursor: "pointer",
              };
              const onEnter = (e: React.MouseEvent<HTMLElement>) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--bg-subtle)";
                  e.currentTarget.style.color = "var(--fg)";
                }
              };
              const onLeave = (e: React.MouseEvent<HTMLElement>) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--fg-2)";
                }
              };
              const inner = (
                <>
                  <span style={{ color: active ? "var(--fg)" : "var(--fg-3)", flexShrink: 0 }}>
                    <Icon size={15} strokeWidth={1.6} />
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {typeof count === "number" && count > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--fg-3)",
                        fontVariantNumeric: "tabular-nums",
                        flexShrink: 0,
                      }}
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </>
              );
              if (isAction) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.id === "inbox" ? openInbox : undefined}
                    style={itemStyle}
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave}
                  >
                    {inner}
                  </button>
                );
              }
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  style={itemStyle}
                  onMouseEnter={onEnter}
                  onMouseLeave={onLeave}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User footer */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: 8,
          flexShrink: 0,
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 8px",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  width: "100%",
                  textAlign: "left",
                  transition: `background var(--dur-fast)`,
                }}
              />
            }
          >
              {/* Gradient avatar */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {getInitials(userInitials)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 500,
                    color: "var(--fg)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {userName ?? userEmail ?? "Account"}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--fg-3)" }}>
                  {PLAN_LABELS[planUsage.planTier] ?? planUsage.planTier} plan
                </div>
              </div>
              <ChevronDown size={14} strokeWidth={1.6} style={{ color: "var(--fg-3)", flexShrink: 0 }} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="min-w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium">Account</span>
                  {userEmail && (
                    <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                  )}
                </div>
                {showUpgrade && (
                  <Badge variant="outline" className="shrink-0 text-xs capitalize font-medium">
                    {PLAN_LABELS[planUsage.planTier] ?? planUsage.planTier}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/settings" />}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings/billing" />}>
                Billing &amp; Plans
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/support" />}>
                Support
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => void signOut()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
