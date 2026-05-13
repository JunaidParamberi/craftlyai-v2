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
import { BrandLockupLink } from "@/components/shared/brand-lockup";
import {
  businessNav,
  footerNav,
  isNavActive,
  type NavItem,
  workNav,
} from "@/lib/dashboard/nav";
import { SHELL_HEADER_CLASS, SIDEBAR_NAV_BUTTON_CLASS } from "@/lib/dashboard/shell";
import { cn } from "@/lib/utils";

function SidebarNavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(pathname, item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.title}
                  className={SIDEBAR_NAV_BUTTON_CLASS}
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
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader
        className={cn(
          SHELL_HEADER_CLASS,
          "flex flex-row items-center gap-0 border-b border-sidebar-border/70 px-2 py-0 group-data-[collapsible=icon]:justify-center",
        )}
      >
        <BrandLockupLink
          className="items-center"
          linkClassName="flex h-full items-center px-2 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          wordmarkWrapperClassName="group-data-[collapsible=icon]:hidden"
        />
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarNavGroup label="Work" items={workNav} />
        <SidebarNavGroup label="Business" items={businessNav} />
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
                  className={SIDEBAR_NAV_BUTTON_CLASS}
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
