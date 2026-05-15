"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format, parseISO } from "date-fns";
import { Calendar } from "lucide-react";

import {
  taskPriorityBadgeVariant,
  taskPriorityLabel,
} from "@/lib/tasks/display";
import { isTaskOverdue } from "@/lib/tasks/task-utils";
import { cn } from "@/lib/utils";
import type { TaskRow } from "@/types";

import { Badge } from "@/components/ui/badge";

const PRIORITY_BORDER: Record<string, string> = {
  high: "border-l-red-400",
  medium: "border-l-amber-400",
  low: "border-l-slate-300",
};

type KanbanCardProps = {
  task: TaskRow;
  onClick: () => void;
  isDragOverlay?: boolean;
};

export function KanbanCard({
  task,
  onClick,
  isDragOverlay = false,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const overdue = isTaskOverdue(task);

  return (
    <div
      ref={setNodeRef}
      style={isDragOverlay ? undefined : style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={cn(
        "cursor-grab select-none touch-none rounded-lg border border-border border-l-4 bg-card p-3 shadow-sm",
        PRIORITY_BORDER[task.priority],
        "transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md",
        isDragging && !isDragOverlay && "opacity-50 shadow-none",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span aria-hidden className="shrink-0" />
        <Badge
          variant={taskPriorityBadgeVariant(task.priority)}
          className="shrink-0 text-[10px]"
        >
          {taskPriorityLabel(task.priority)}
        </Badge>
      </div>

      <p className="line-clamp-2 text-sm font-medium leading-snug">
        {task.title}
      </p>

      {task.due_date ? (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-xs",
            overdue ? "text-red-500" : "text-muted-foreground",
          )}
        >
          <Calendar className="h-3 w-3" />
          <span>{format(parseISO(task.due_date), "MMM d")}</span>
        </div>
      ) : null}
    </div>
  );
}
