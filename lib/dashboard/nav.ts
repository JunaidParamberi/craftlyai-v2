import type { LucideIcon } from "lucide-react";
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  Timer,
  Users,
  Wallet,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const workNav: NavItem[] = [
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
  { title: "Time", href: "/time", icon: Timer },
];

export const businessNav: NavItem[] = [
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "Finance", href: "/finance", icon: Wallet },
];

/** Active nav item: dashboard also matches app root `/` before redirect. */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/" || pathname === "";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
