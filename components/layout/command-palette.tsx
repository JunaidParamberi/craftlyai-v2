"use client";

import { useRouter } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  Clock,
  DollarSign,
  FileText,
  LayoutDashboard,
  ListTodo,
  Plus,
  Receipt,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

type NavItem = {
  id: string;
  label: string;
  sub?: string;
  icon: React.ElementType;
  href?: string;
  isAI?: boolean;
};

const SUGGESTED: NavItem[] = [
  { id: "dashboard",  label: "Dashboard",  icon: LayoutDashboard, href: "/dashboard" },
  { id: "tasks",      label: "Tasks",      icon: ListTodo,        href: "/tasks" },
  { id: "finance",    label: "Finance",    icon: BarChart3,       href: "/finance" },
];

const GO_TO: NavItem[] = [
  { id: "clients",   label: "Clients",   icon: Users,     href: "/clients" },
  { id: "projects",  label: "Projects",  icon: Briefcase, href: "/projects" },
  { id: "documents", label: "Documents", icon: FileText,  href: "/documents" },
  { id: "expenses",  label: "Expenses",  icon: Receipt,   href: "/expenses" },
  { id: "time",      label: "Time",      icon: Clock,     href: "/time" },
  { id: "settings",  label: "Settings",  icon: Settings,  href: "/settings" },
];

const CREATE: NavItem[] = [
  { id: "new-invoice",  label: "New invoice",  icon: DollarSign, href: "/documents/new?type=invoice" },
  { id: "new-project",  label: "New project",  icon: Briefcase,  href: "/projects/new" },
  { id: "new-client",   label: "New client",   icon: Users,      href: "/clients/new" },
  { id: "new-expense",  label: "New expense",  icon: Receipt,    href: "/expenses" },
];

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function ItemIcon({ icon: Icon, isAI }: { icon: React.ElementType; isAI?: boolean }) {
  return (
    <div
      style={{
        width: 26,
        height: 26,
        borderRadius: 7,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        background: isAI ? "var(--accent-soft)" : "var(--bg-subtle)",
        color: isAI ? "var(--border-focus)" : "var(--fg-3)",
      }}
    >
      <Icon size={13} strokeWidth={1.6} />
    </div>
  );
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  function navigate(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Search CraftlyAI, navigate, or create"
      className="!top-[12vh] !translate-y-0 max-w-[640px] w-full"
    >
      <Command className="rounded-xl!">
        {/* Input row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <Sparkles
            size={16}
            strokeWidth={1.6}
            style={{ color: "var(--border-focus)", flexShrink: 0 }}
          />
          <CommandInput
            placeholder="Ask CraftlyAI, search, or jump to…"
            className="flex-1 border-0 bg-transparent p-0 text-sm shadow-none outline-none focus-visible:ring-0 h-auto!"
          />
          <kbd
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 10,
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              padding: "2px 6px",
              borderRadius: 4,
              color: "var(--fg-3)",
              flexShrink: 0,
            }}
          >
            esc
          </kbd>
        </div>

        {/* Result list */}
        <div style={{ maxHeight: "min(420px, 60vh)", overflowY: "auto" }}>
          <CommandEmpty>
            <div style={{ padding: "24px 0", color: "var(--fg-3)", fontSize: 13 }}>
              No results found
            </div>
          </CommandEmpty>

          <CommandGroup heading="Suggested">
            {SUGGESTED.map((item) => (
              <CommandItem
                key={item.id}
                value={item.label}
                onSelect={() => item.href && navigate(item.href)}
                className="gap-2.5 px-3 py-2 cursor-pointer"
              >
                <ItemIcon icon={item.icon} />
                <span style={{ fontSize: "var(--text-sm)", color: "var(--fg)" }}>
                  {item.label}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Go to">
            {GO_TO.map((item) => (
              <CommandItem
                key={item.id}
                value={item.label}
                onSelect={() => item.href && navigate(item.href)}
                className="gap-2.5 px-3 py-2 cursor-pointer"
              >
                <ItemIcon icon={item.icon} />
                <span style={{ fontSize: "var(--text-sm)", color: "var(--fg)" }}>
                  {item.label}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Create">
            {CREATE.map((item) => (
              <CommandItem
                key={item.id}
                value={item.label}
                onSelect={() => item.href && navigate(item.href)}
                className="gap-2.5 px-3 py-2 cursor-pointer"
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    background: "var(--bg-subtle)",
                    color: "var(--fg-3)",
                  }}
                >
                  <Plus size={13} strokeWidth={1.6} />
                </div>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--fg)" }}>
                  {item.label}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </div>

        {/* Footer — AI hint + kbd legend */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 14px",
            borderTop: "1px solid var(--border)",
            background: "var(--bg-canvas)",
            borderRadius: "0 0 12px 12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "var(--fg-3)",
            }}
          >
            <Sparkles size={11} strokeWidth={1.6} style={{ color: "var(--border-focus)" }} />
            <span style={{ color: "var(--border-focus)", fontWeight: 500 }}>AI</span>
            <span>Router · Haiku · Phase 3</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--fg-3)" }}>
            <span>
              <KbdHint>↑↓</KbdHint> navigate
            </span>
            <span>
              <KbdHint>↵</KbdHint> select
            </span>
            <span>
              <KbdHint>esc</KbdHint> close
            </span>
          </div>
        </div>
      </Command>
    </CommandDialog>
  );
}

function KbdHint({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 9.5,
        background: "var(--bg-subtle)",
        border: "1px solid var(--border)",
        padding: "1px 4px",
        borderRadius: 3,
        color: "var(--fg-3)",
        marginRight: 3,
      }}
    >
      {children}
    </kbd>
  );
}
