"use client";

import { useEffect, useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
  userEmail: string | null;
  userInitials: string;
};

export function DashboardShell({
  children,
  userEmail,
  userInitials,
}: DashboardShellProps) {
  const [commandOpen, setCommandOpen] = useState(false);

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
    <SidebarProvider>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <AppSidebar />
      <SidebarInset className="overflow-hidden md:peer-data-[variant=inset]:m-0">
        <AppHeader
          userEmail={userEmail}
          userInitials={userInitials}
          onOpenSearch={() => setCommandOpen(true)}
        />
        <div className="flex flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
