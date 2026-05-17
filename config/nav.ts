import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FileText,
  FolderKanban,
  Home,
  LayoutDashboard,
  ListChecks,
  Receipt,
  Timer,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export type RailSection = {
  id: string;
  icon: LucideIcon;
  label: string;
};

export type PaneItem = {
  id: string;
  icon: LucideIcon;
  label: string;
  href: string;
};

export type PaneNavSection = {
  label?: string;
  items: PaneItem[];
};

export type PaneConfig = {
  title: string;
  sections: PaneNavSection[];
};

export const RAIL_SECTIONS: RailSection[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "work", icon: Briefcase, label: "Work" },
  { id: "money", icon: Wallet, label: "Money" },
];

export const PANE_CONFIGS: Record<string, PaneConfig> = {
  home: {
    title: "Home",
    sections: [
      {
        items: [
          { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
          { id: "tasks",     icon: ListChecks,      label: "Tasks",     href: "/tasks" },
          { id: "time",      icon: Timer,           label: "Time",      href: "/time" },
        ],
      },
    ],
  },
  work: {
    title: "Work",
    sections: [
      {
        label: "CRM",
        items: [
          { id: "clients",   icon: Users,       label: "Clients",       href: "/clients" },
          { id: "projects",  icon: FolderKanban, label: "Projects",     href: "/projects" },
        ],
      },
      {
        label: "Documents",
        items: [
          { id: "documents", icon: FileText, label: "All documents", href: "/documents" },
        ],
      },
    ],
  },
  money: {
    title: "Money",
    sections: [
      {
        items: [
          { id: "finance",  icon: TrendingUp, label: "Finance",  href: "/finance" },
          { id: "expenses", icon: Receipt,    label: "Expenses", href: "/expenses" },
        ],
      },
    ],
  },
};

export const ROUTE_TO_SECTION: Record<string, string> = {
  "/dashboard": "home",
  "/tasks":     "home",
  "/time":      "home",
  "/clients":   "work",
  "/projects":  "work",
  "/documents": "work",
  "/finance":   "money",
  "/expenses":  "money",
  "/settings":  "home",
  "/support":   "home",
};

export const ROUTE_LABELS: Record<string, [string, string]> = {
  "/dashboard":        ["Home",     "Dashboard"],
  "/tasks":            ["Home",     "Tasks"],
  "/time":             ["Home",     "Time"],
  "/clients":          ["Work",     "Clients"],
  "/projects":         ["Work",     "Projects"],
  "/documents":        ["Work",     "Documents"],
  "/finance":          ["Money",    "Finance"],
  "/expenses":         ["Money",    "Expenses"],
  "/settings":         ["Settings", "General"],
  "/settings/brand":   ["Settings", "Brand kit"],
  "/settings/billing": ["Settings", "Billing"],
  "/support":          ["Help",     "Support"],
};

export function getRouteSection(pathname: string): string {
  if (ROUTE_TO_SECTION[pathname]) return ROUTE_TO_SECTION[pathname];
  for (const [route, section] of Object.entries(ROUTE_TO_SECTION)) {
    if (pathname.startsWith(`${route}/`)) return section;
  }
  return "home";
}

export function getRouteBreadcrumb(pathname: string): [string, string] {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  for (const [route, label] of Object.entries(ROUTE_LABELS)) {
    if (pathname.startsWith(`${route}/`)) return label;
  }
  return ["", ""];
}
