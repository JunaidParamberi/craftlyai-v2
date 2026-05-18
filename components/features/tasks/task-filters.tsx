"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ArrowDown, Check, Filter } from "lucide-react";

import {
  buildTasksHref,
  parseTaskListFilters,
  type TaskListFilters,
  type TaskSortKey,
} from "@/lib/tasks/task-utils";
import { searchParamsToRecord, useTaskFilters } from "@/lib/tasks/use-task-filters";
import type { ProjectListRow, TaskListRow } from "@/types";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type TaskFiltersProps = {
  filters: TaskListFilters;
  projects: ProjectListRow[];
  tasks: TaskListRow[];
};

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
] as const;

const PRIORITY_OPTIONS = [
  { value: "all", label: "All priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

const SORT_OPTIONS = [
  { value: "due", label: "Due date" },
  { value: "created", label: "Created" },
  { value: "priority", label: "Priority" },
] as const;

function tabItemClass(active: boolean) {
  return cn(
    "-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-[1.5px] px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "border-foreground text-foreground"
      : "border-transparent text-muted-foreground hover:text-foreground",
  );
}

function projectTaskCount(tasks: TaskListRow[], projectId: string): number {
  return tasks.filter((t) => t.project_id === projectId).length;
}

export function TaskFilters({
  filters: filtersProp,
  projects,
  tasks,
}: TaskFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useTaskFilters(filtersProp);
  const [filterOpen, setFilterOpen] = useState(false);

  const hasAdvancedFilters =
    filters.status !== "all" || filters.priority !== "all";

  const navigate = useCallback(
    (patch: Partial<TaskListFilters>) => {
      const current = parseTaskListFilters(searchParamsToRecord(searchParams));
      router.push(buildTasksHref(patch, current), { scroll: false });
    },
    [router, searchParams],
  );

  const clearAdvanced = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("priority");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setFilterOpen(false);
  }, [pathname, router, searchParams]);

  const projectTabs = useMemo(
    () => [
      { id: "all", label: "All projects", count: tasks.length },
      ...projects.map((p) => ({
        id: p.id,
        label: p.title,
        count: projectTaskCount(tasks, p.id),
      })),
    ],
    [projects, tasks],
  );

  return (
    <div className="mb-5 flex items-center border-b border-border">
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {projectTabs.map((tab) => {
          const active = filters.project === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                navigate({ project: tab.id === "all" ? "all" : tab.id })
              }
              className={tabItemClass(active)}
            >
              {tab.label}
              <span className="rounded-full bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[10.5px] font-medium tabular-nums text-[var(--fg-3)]">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<button type="button" className={tabItemClass(false)} />}
          >
            <ArrowDown className="size-3.5" strokeWidth={1.6} />
            Due date
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[10rem]">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                value={filters.sort}
                onValueChange={(v) => {
                  if (v === "due" || v === "created" || v === "priority") {
                    navigate({ sort: v as TaskSortKey });
                  }
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <DropdownMenuRadioItem key={o.value} value={o.value}>
                    {o.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                className={tabItemClass(hasAdvancedFilters)}
              />
            }
          >
            <Filter className="size-3.5" strokeWidth={1.6} />
            Filter
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-2">
            <div className="flex flex-col gap-1">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Status
              </p>
              {STATUS_OPTIONS.map((o) => {
                const active = filters.status === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-accent/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    onClick={() => {
                      navigate({
                        status: o.value as TaskListFilters["status"],
                      });
                    }}
                  >
                    {o.label}
                    {active ? (
                      <Check className="size-3.5 text-accent" strokeWidth={2} />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="my-2 h-px bg-border" role="separator" />

            <div className="flex flex-col gap-1">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Priority
              </p>
              {PRIORITY_OPTIONS.map((o) => {
                const active = filters.priority === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-accent/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    onClick={() => {
                      navigate({
                        priority: o.value as TaskListFilters["priority"],
                      });
                    }}
                  >
                    {o.label}
                    {active ? (
                      <Check className="size-3.5 text-accent" strokeWidth={2} />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {hasAdvancedFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={clearAdvanced}
              >
                Clear filters
              </Button>
            ) : null}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
