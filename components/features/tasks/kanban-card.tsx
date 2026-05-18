"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format, parseISO } from "date-fns";

import {
  taskPriorityBadgeVariant,
  taskPriorityLabel,
} from "@/lib/tasks/display";
import { isTaskOverdue } from "@/lib/tasks/task-utils";
import { cn } from "@/lib/utils";
import type { TaskRow } from "@/types";

import { Badge } from "@/components/ui/badge";

type KanbanCardContentProps = {
  task: TaskRow;
};

export function KanbanCardContent({ task }: KanbanCardContentProps) {
  const overdue = isTaskOverdue(task);
  const isDimmed = task.status === "done" || task.status === "cancelled";
  const labels = task.labels ?? [];

  return (
    <>
      {labels.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {labels.map((l) => (
            <span key={l} className="task-label-badge">
              {l}
            </span>
          ))}
        </div>
      ) : null}

      <p
        className={cn(
          "mb-3 text-[13.5px] font-medium leading-snug",
          isDimmed && "text-[var(--fg-2)] line-through",
        )}
      >
        {task.title}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          variant={taskPriorityBadgeVariant(task.priority)}
          className="text-[10px]"
        >
          {taskPriorityLabel(task.priority)}
        </Badge>
        {task.due_date ? (
          <span
            className={cn(
              "text-[11px] tabular-nums",
              overdue ? "text-destructive" : "text-[var(--fg-3)]",
            )}
          >
            · {format(parseISO(task.due_date), "MMM d")}
          </span>
        ) : null}
      </div>
    </>
  );
}

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
        "cursor-grab select-none touch-none rounded-[10px] border border-border bg-card p-3 shadow-xs",
        "transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-sm",
        (task.status === "done" || task.status === "cancelled") && "opacity-70",
        isDragging && !isDragOverlay && "opacity-50 shadow-none",
      )}
    >
      <KanbanCardContent task={task} />
    </div>
  );
}

type KanbanCardStaticProps = {
  task: TaskRow;
  onClick: () => void;
};

/** SSR-safe card without dnd-kit attributes (avoids hydration mismatch). */
export function KanbanCardStatic({ task, onClick }: KanbanCardStaticProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-[10px] border border-border bg-card p-3 text-left shadow-xs",
        "transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-sm",
        (task.status === "done" || task.status === "cancelled") && "opacity-70",
      )}
    >
      <KanbanCardContent task={task} />
    </button>
  );
}
