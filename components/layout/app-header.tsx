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
import { createClient } from "@/lib/supabase/client";
import { Bell, LifeBuoy, Search, Settings } from "lucide-react";
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
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 md:gap-4 md:px-6">
      <SidebarTrigger className="md:-ms-1" />

      <Button
        type="button"
        variant="outline"
        className="hidden h-9 max-w-md flex-1 justify-start gap-2 text-muted-foreground md:flex"
        onClick={onOpenSearch}
      >
        <Search data-icon="inline-start" />
        <span className="text-muted-foreground">Search…</span>
        <kbd className="pointer-events-none ms-auto hidden h-5 items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground select-none sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="md:hidden"
        onClick={onOpenSearch}
        aria-label="Open search"
      >
        <Search />
      </Button>

      <div className="ms-auto flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          aria-label="Notifications"
        >
          <Bell />
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full p-0"
                aria-label="Account menu"
              />
            }
          >
            <Avatar className="size-9">
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
              <DropdownMenuItem render={<Link href="/protected/settings" />}>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/protected/support" />}>
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
