"use client";

import { useRef } from "react";

import { getProjectChipRisk } from "@/lib/projects/project-utils";
import { cn } from "@/lib/utils";
import type { ProjectListRow } from "@/types";

type ProjectChipsRowProps = {
  projects: ProjectListRow[];
  activeProjectId: string;
  onSelect: (projectId: string) => void;
};

export function ProjectChipsRow({
  projects,
  activeProjectId,
  onSelect,
}: ProjectChipsRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (!rowRef.current) return;
    const buttons = rowRef.current.querySelectorAll<HTMLButtonElement>(
      "button[data-project-chip]",
    );
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = buttons[Math.min(index + 1, buttons.length - 1)];
      next?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = buttons[Math.max(index - 1, 0)];
      prev?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(projects[index].id);
    }
  }

  return (
    <div
      ref={rowRef}
      className="fade-up delay-1 flex flex-wrap gap-2"
      role="listbox"
      aria-label="Projects"
    >
      {projects.map((p, index) => {
        const active = p.id === activeProjectId;
        const risk = getProjectChipRisk(p);
        return (
          <button
            key={p.id}
            type="button"
            data-project-chip
            role="option"
            aria-selected={active}
            onClick={() => onSelect(p.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "inline-flex h-auto min-h-8 items-center gap-2 rounded-lg border px-3 py-1.5 text-left transition-colors",
              active
                ? "border-foreground bg-[var(--bg-subtle)]"
                : "border-border bg-card hover:bg-[var(--bg-subtle)]",
            )}
          >
            <span
              className={cn("status-dot", `status-dot--${risk}`)}
              aria-hidden
            />
            <span className="font-medium text-sm text-foreground">{p.title}</span>
            <span className="text-[11px] text-[var(--fg-3)]">
              {p.client?.name ?? "Client"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
