"use client";

import { useDroppable } from "@dnd-kit/core";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TaskRow, TaskStatus } from "@/types";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { KanbanCard } from "./kanban-card";

type KanbanColumnProps = {
  status: TaskStatus;
  label: string;
  icon: LucideIcon;
  accent: string;
  bg: string;
  tasks: TaskRow[];
  onCardClick: (task: TaskRow) => void;
  onAddTask: (status: TaskStatus) => void;
};

export function KanbanColumn({
  status,
  label,
  icon: Icon,
  accent,
  bg,
  tasks,
  onCardClick,
  onAddTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex max-w-[272px] min-w-[272px] flex-col rounded-xl border border-border border-t-4",
        accent,
        bg,
        isOver && "ring-2 ring-primary/40 ring-inset",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">{label}</span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
          {tasks.length}
        </span>
      </div>

      <ScrollArea className="max-h-[calc(100vh-320px)] flex-1 p-2">
        <div className="flex flex-col gap-2">
          {tasks.length === 0 ? (
            <div
              className="mx-1 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/50 py-10 text-center"
            >
              <Icon className="h-6 w-6 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">No tasks here</p>
              <p className="text-xs text-muted-foreground/60">
                Drop one here
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onClick={() => onCardClick(task)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sm text-muted-foreground"
          onClick={() => onAddTask(status)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </Button>
      </div>
    </div>
  );
}
