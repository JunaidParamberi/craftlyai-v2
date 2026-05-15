"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PlanUsageProvider } from "@/lib/plan-usage/context";
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
  const [commandOpen, setCommandOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return (
    <PlanUsageProvider value={planUsage}>
      <SidebarProvider className="flex h-dvh min-h-0 w-full overflow-hidden">
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        <AppSidebar />
        <SidebarInset className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
          <div
            ref={scrollRef}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain"
          >
            <AppHeader
              userEmail={userEmail}
              userInitials={userInitials}
              planUsage={planUsage}
              notifications={notifications}
              unreadCount={unreadCount}
              onOpenSearch={() => setCommandOpen(true)}
            />
            <div className="flex flex-col gap-6 p-4 md:p-6">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PlanUsageProvider>
  );
}
