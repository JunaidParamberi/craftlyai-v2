"use client";

import type { ComponentType } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TaskRow, TaskStatus } from "@/types";

import { Button } from "@/components/ui/button";

import { KanbanCard, KanbanCardStatic } from "./kanban-card";

type KanbanColumnBaseProps = {
  status: TaskStatus;
  label: string;
  dotClass: string;
  tasks: TaskRow[];
  onCardClick: (task: TaskRow) => void;
  onAddTask: (status: TaskStatus) => void;
};

function KanbanColumnShell({
  status,
  label,
  dotClass,
  tasks,
  onCardClick,
  onAddTask,
  columnRef,
  isOver,
  CardComponent,
}: KanbanColumnBaseProps & {
  columnRef?: (node: HTMLElement | null) => void;
  isOver?: boolean;
  CardComponent: ComponentType<{
    task: TaskRow;
    onClick: () => void;
  }>;
}) {
  return (
    <div
      ref={columnRef}
      className={cn(
        "flex min-h-[400px] min-w-0 flex-col rounded-xl bg-[var(--bg-canvas)]",
        isOver && "ring-2 ring-primary/30 ring-inset",
      )}
    >
      <div className="flex items-center gap-2 px-1 pb-3">
        <span className={cn("status-dot", dotClass)} aria-hidden />
        <span className="text-sm font-medium">{label}</span>
        <span className="tabs__count">{tasks.length}</span>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          onClick={() => onAddTask(status)}
          aria-label={`Add task to ${label}`}
        >
          <Plus className="size-3" />
        </Button>
      </div>

      <div className="flex min-h-[60px] flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-[var(--fg-3)]">
            No tasks here
          </p>
        ) : (
          tasks.map((task) => (
            <CardComponent
              key={task.id}
              task={task}
              onClick={() => onCardClick(task)}
            />
          ))
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto justify-start px-2.5 py-1.5 text-[var(--fg-3)]"
          onClick={() => onAddTask(status)}
        >
          <Plus className="size-3" />
          Add task
        </Button>
      </div>
    </div>
  );
}

export function KanbanColumn(props: KanbanColumnBaseProps) {
  const { setNodeRef, isOver } = useDroppable({ id: props.status });

  return (
    <KanbanColumnShell
      {...props}
      columnRef={setNodeRef}
      isOver={isOver}
      CardComponent={KanbanCard}
    />
  );
}

/** SSR-safe column without dnd-kit droppable hooks. */
export function KanbanColumnStatic(props: KanbanColumnBaseProps) {
  return <KanbanColumnShell {...props} CardComponent={KanbanCardStatic} />;
}
