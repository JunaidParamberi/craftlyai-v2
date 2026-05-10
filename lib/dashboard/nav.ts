import type { LucideIcon } from "lucide-react";
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Timer,
  Users,
  Wallet,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const primaryNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  { title: "Clients", href: "/clients", icon: Users },
  { title: "Finance", href: "/finance", icon: Wallet },
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "Time", href: "/time", icon: Timer },
];

export const footerNav: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Support", href: "/support", icon: LifeBuoy },
];

/** Active nav item: dashboard also matches app root `/` before redirect. */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/" || pathname === "";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
