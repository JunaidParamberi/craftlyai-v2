"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { footerNav, isNavActive, primaryNav } from "@/lib/dashboard/nav";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="gap-3 border-b border-sidebar-border/70 pb-4">
        <Link
          href="/protected/dashboard"
          className="flex items-center gap-3 px-2 transition-opacity hover:opacity-90 group-data-[collapsible=icon]:justify-center"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary font-heading text-lg font-semibold text-primary-foreground shadow-sm">
            C
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="truncate font-heading text-base font-semibold tracking-tight text-sidebar-foreground">
              CraftlyAI
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Freelancer OS
            </span>
          </div>
        </Link>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="New Project"
              render={<Link href="/protected/projects/new" />}
              className={cn(
                "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground",
                "data-active:bg-primary data-active:text-primary-foreground",
              )}
            >
              <Plus />
              <span>New Project</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(pathname, item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 border-t border-sidebar-border/70 pt-4">
        <SidebarMenu>
          {footerNav.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(pathname, item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.title}
                  render={<Link href={item.href} />}
                >
                  <Icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
