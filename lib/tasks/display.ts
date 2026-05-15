import type { ComponentProps } from "react";

import type { TaskPriority, TaskStatus } from "@/types";

import type { Badge } from "@/components/ui/badge";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

export function taskPriorityLabel(p: TaskPriority): string {
  switch (p) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return p;
  }
}

export function taskPriorityBadgeVariant(
  p: TaskPriority,
): NonNullable<BadgeVariant> {
  if (p === "high") return "destructive";
  if (p === "medium") return "secondary";
  return "outline";
}

/** @deprecated Prefer taskPriorityBadgeVariant */
export function taskPriorityBadgeClass(p: TaskPriority): string {
  if (p === "high") {
    return "font-normal";
  }
  if (p === "medium") {
    return "font-normal";
  }
  return "font-normal text-muted-foreground";
}

export function taskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case "todo":
      return "To do";
    case "in_progress":
      return "In progress";
    case "done":
      return "Done";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function taskStatusBadgeVariant(
  status: TaskStatus,
): NonNullable<BadgeVariant> {
  if (status === "in_progress") return "default";
  if (status === "cancelled") return "outline";
  return "secondary";
}

/** @deprecated Prefer taskStatusBadgeVariant */
export function taskStatusBadgeClass(status: TaskStatus): string {
  if (status === "in_progress") {
    return "font-normal bg-primary/15 text-primary border-primary/20";
  }
  if (status === "cancelled") {
    return "font-normal text-muted-foreground";
  }
  return "font-normal";
}
