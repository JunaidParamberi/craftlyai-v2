"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import type { TaskListFilters } from "@/lib/tasks/task-utils";
import type { ProjectListRow } from "@/types";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FILTER_TRIGGER_CLASS = "h-9 w-full min-w-0 sm:w-[9.5rem]";

type TaskFiltersProps = {
  filters: TaskListFilters;
  projects: ProjectListRow[];
};

function projectLabel(projects: ProjectListRow[], id: string): string {
  if (id === "all") return "All projects";
  return projects.find((p) => p.id === id)?.title ?? "Project";
}

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

export function TaskFilters({ filters, projects }: TaskFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || (key === "sort" && value === "due")) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-1 sm:flex-wrap sm:items-center">
      <Select
        value={filters.project}
        onValueChange={(v) => setParam("project", v ?? "all")}
      >
        <SelectTrigger className={FILTER_TRIGGER_CLASS}>
          <SelectValue>
            {projectLabel(projects, filters.project)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(v) => setParam("status", v ?? "all")}
      >
        <SelectTrigger className={FILTER_TRIGGER_CLASS}>
          <SelectValue>
            {STATUS_OPTIONS.find((o) => o.value === filters.status)?.label ??
              "All statuses"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(v) => setParam("priority", v ?? "all")}
      >
        <SelectTrigger className={FILTER_TRIGGER_CLASS}>
          <SelectValue>
            {PRIORITY_OPTIONS.find((o) => o.value === filters.priority)
              ?.label ?? "All priorities"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {PRIORITY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={filters.sort}
        onValueChange={(v) => setParam("sort", v ?? "due")}
      >
        <SelectTrigger className={FILTER_TRIGGER_CLASS}>
          <SelectValue>
            {SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ??
              "Due date"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
