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
    href: "/protected/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    href: "/protected/projects",
    icon: FolderKanban,
  },
  { title: "Clients", href: "/protected/clients", icon: Users },
  { title: "Finance", href: "/protected/finance", icon: Wallet },
  { title: "Documents", href: "/protected/documents", icon: FileText },
  { title: "Time", href: "/protected/time", icon: Timer },
];

export const footerNav: NavItem[] = [
  { title: "Settings", href: "/protected/settings", icon: Settings },
  { title: "Support", href: "/protected/support", icon: LifeBuoy },
];

/** Active nav item: dashboard also matches /protected index before redirect. */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/protected/dashboard") {
    return (
      pathname === "/protected/dashboard" ||
      pathname === "/protected" ||
      pathname === "/protected/"
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
