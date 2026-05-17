"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { NotificationBell } from "@/components/features/notifications/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { getRouteBreadcrumb } from "@/config/nav";
import type { NotificationRow } from "@/types";

type AppHeaderProps = {
  notifications: NotificationRow[];
  unreadCount: number;
  onOpenSearch: () => void;
};

export function AppHeader({ notifications, unreadCount, onOpenSearch }: AppHeaderProps) {
  const pathname = usePathname();
  const [section, page] = getRouteBreadcrumb(pathname);

  return (
    <header
      style={{
        height: "var(--topbar-h)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-canvas)",
        flexShrink: 0,
      }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: "var(--text-sm)",
          color: "var(--fg-2)",
        }}
      >
        {section && (
          <>
            <span>{section}</span>
            <ChevronRight size={12} strokeWidth={1.6} style={{ color: "var(--fg-3)" }} />
          </>
        )}
        {page && (
          <strong style={{ color: "var(--fg)", fontWeight: 500 }}>{page}</strong>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onOpenSearch}
          style={{ gap: 6, color: "var(--fg-2)", fontSize: "var(--text-sm)" }}
        >
          <Sparkles size={14} strokeWidth={1.6} />
          Ask AI
          <kbd
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 10.5,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              padding: "1px 5px",
              borderRadius: 4,
              color: "var(--fg-3)",
              marginLeft: 2,
            }}
          >
            ⌘K
          </kbd>
        </Button>
        <NotificationBell notifications={notifications} unreadCount={unreadCount} />
        <ThemeToggle />
      </div>
    </header>
  );
}
