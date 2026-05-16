"use client";

import Link from "next/link";
import { CreditCard, LifeBuoy, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

import { NotificationBell } from "@/components/features/notifications/notification-bell";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PlanUsageBars } from "@/components/features/billing/plan-usage-bars";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SHELL_HEADER_CLASS } from "@/lib/dashboard/shell";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { PLAN_ORDER } from "@/config/plans";
import type { PlanUsage } from "@/lib/plan-usage/helpers";
import type { NotificationRow } from "@/types";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
};

type AppHeaderProps = {
  userEmail: string | null;
  userInitials: string;
  planUsage: PlanUsage;
  notifications: NotificationRow[];
  unreadCount: number;
  onOpenSearch: () => void;
};

export function AppHeader({
  userEmail,
  userInitials,
  planUsage,
  notifications,
  unreadCount,
  onOpenSearch,
}: AppHeaderProps) {
  const router = useRouter();
  const showUsageBars = PLAN_ORDER.indexOf(planUsage.planTier) < PLAN_ORDER.indexOf("pro");

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header
      className={cn(
        SHELL_HEADER_CLASS,
        "sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm md:gap-4 md:px-6",
      )}
    >
      <SidebarTrigger className="shrink-0" />

      <Button
        type="button"
        variant="outline"
        className="hidden h-8 min-w-0 max-w-md flex-1 justify-start gap-2 rounded-[10px] border border-border bg-card px-3 text-muted-foreground md:flex"
        onClick={onOpenSearch}
      >
        <Search data-icon="inline-start" />
        <span className="truncate text-muted-foreground">Search…</span>
        <kbd className="pointer-events-none ms-auto hidden h-5 shrink-0 items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground select-none sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <div className="ms-auto flex shrink-0 items-center gap-2 md:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onOpenSearch}
          aria-label="Open search"
        >
          <Search />
        </Button>
        <ThemeToggle />
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full p-0"
                aria-label="Account menu"
              />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium">Account</span>
                    {userEmail ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {userEmail}
                      </span>
                    ) : null}
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs capitalize font-medium">
                    {PLAN_LABELS[planUsage.planTier] ?? planUsage.planTier}
                  </Badge>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            {showUsageBars && (
              <>
                <DropdownMenuSeparator />
                <PlanUsageBars usage={planUsage} />
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/settings" />}>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings/billing" />}>
                <CreditCard />
                Billing &amp; Plans
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/support" />}>
                <LifeBuoy />
                Support
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onClick={() => void signOut()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
