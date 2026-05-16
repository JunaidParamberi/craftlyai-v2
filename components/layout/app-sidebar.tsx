"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
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
      <SidebarGroupLabel className="text-[9px] font-semibold uppercase tracking-[0.1em] text-sidebar-foreground/25 px-2">
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
          forceDarkWordmark
        />
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarNavGroup label="Work" items={workNav} />
        <SidebarNavGroup label="Business" items={businessNav} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
