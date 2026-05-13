"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { LifeBuoy, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

type AppHeaderProps = {
  userEmail: string | null;
  userInitials: string;
  onOpenSearch: () => void;
};

export function AppHeader({
  userEmail,
  userInitials,
  onOpenSearch,
}: AppHeaderProps) {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header
      className={cn(
        SHELL_HEADER_CLASS,
        "sticky top-0 z-20 flex items-center gap-3 border-b border-sidebar-border/70 bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 md:gap-4 md:px-6",
      )}
    >
      <SidebarTrigger className="shrink-0" />

      <Button
        type="button"
        variant="outline"
        className="hidden h-9 min-w-0 max-w-lg flex-1 justify-start gap-2 px-3 text-muted-foreground md:flex"
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
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">Account</span>
                  {userEmail ? (
                    <span className="truncate text-xs text-muted-foreground">
                      {userEmail}
                    </span>
                  ) : null}
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/settings" />}>
                <Settings />
                Settings
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
