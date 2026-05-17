"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { CommandPalette } from "@/components/layout/command-palette";
import { Pane } from "@/components/layout/pane";
import { Rail } from "@/components/layout/rail";
import { PlanUsageProvider } from "@/lib/plan-usage/context";
import { getRouteSection } from "@/config/nav";
import type { PlanUsage } from "@/lib/plan-usage/helpers";
import type { NotificationRow } from "@/types";

type DashboardShellProps = {
  children: React.ReactNode;
  userEmail: string | null;
  userInitials: string;
  planUsage: PlanUsage;
  notifications: NotificationRow[];
  unreadCount: number;
};

export function DashboardShell({
  children,
  userEmail,
  userInitials,
  planUsage,
  notifications,
  unreadCount,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const [section, setSection] = useState(() => getRouteSection(pathname));
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep section in sync with navigation
  useEffect(() => {
    setSection(getRouteSection(pathname));
  }, [pathname]);

  // Reset scroll on route change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // Global ⌘K handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <PlanUsageProvider value={planUsage}>
      {/* 3-col grid: rail | pane | main */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "var(--rail-w) var(--pane-w) 1fr",
          height: "100dvh",
          overflow: "hidden",
          background: "var(--bg-canvas)",
        }}
      >
        <Rail
          section={section}
          onSectionChange={setSection}
          onOpenSearch={() => setCommandOpen(true)}
        />

        <Pane
          section={section}
          userEmail={userEmail}
          userInitials={userInitials}
          planUsage={planUsage}
          onOpenSearch={() => setCommandOpen(true)}
        />

        {/* Main column: topbar + scrollable content */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <AppHeader
            notifications={notifications}
            unreadCount={unreadCount}
            onOpenSearch={() => setCommandOpen(true)}
          />
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
                padding: "28px 32px 80px",
                minHeight: "100%",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </PlanUsageProvider>
  );
}
