"use client";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  CheckCircle2,
  Circle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateTask } from "@/lib/tasks/actions";
import type { TaskRow, TaskStatus } from "@/types";

import { KanbanCard } from "./kanban-card";
import { KanbanColumn } from "./kanban-column";
import { TaskEditSheet } from "./task-edit-sheet";

const COLUMNS = [
  {
    status: "todo" as TaskStatus,
    label: "To Do",
    icon: Circle,
    accent: "border-t-border",
    bg: "bg-muted/40",
  },
  {
    status: "in_progress" as TaskStatus,
    label: "In Progress",
    icon: RotateCcw,
    accent: "border-t-blue-400",
    bg: "bg-blue-50/60 dark:bg-blue-950/20",
  },
  {
    status: "done" as TaskStatus,
    label: "Done",
    icon: CheckCircle2,
    accent: "border-t-emerald-400",
    bg: "bg-emerald-50/60 dark:bg-emerald-950/20",
  },
  {
    status: "cancelled" as TaskStatus,
    label: "Cancelled",
    icon: XCircle,
    accent: "border-t-red-400",
    bg: "bg-red-50/40 dark:bg-red-950/20",
  },
] as const;

type KanbanBoardProps = {
  tasks: TaskRow[];
  projectId: string;
  onAddTask: (status: TaskStatus) => void;
};

export function KanbanBoard({
  tasks: initialTasks,
  projectId,
  onAddTask,
}: KanbanBoardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const activeTask = activeId
    ? (tasks.find((t) => t.id === activeId) ?? null)
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const previousStatus = task.status;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    startTransition(async () => {
      const res = await updateTask(projectId, taskId, { status: newStatus });
      if (!res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: previousStatus } : t,
          ),
        );
        toast.error(res.message ?? "Failed to update task.");
        return;
      }
      router.refresh();
    });
  }

  function handleCardClick(task: TaskRow) {
    setSelectedTask(task);
    setSheetOpen(true);
  }

  function handleSheetClose() {
    setSheetOpen(false);
    setSelectedTask(null);
  }

  function handleTaskSaved(updated: TaskRow) {
    setTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
    router.refresh();
  }

  function handleTaskDeleted(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    router.refresh();
  }

  return (
    <>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              label={col.label}
              icon={col.icon}
              accent={col.accent}
              bg={col.bg}
              tasks={tasks.filter((t) => t.status === col.status)}
              onCardClick={handleCardClick}
              onAddTask={onAddTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-1 scale-[1.02] shadow-xl">
              <KanbanCard task={activeTask} onClick={() => {}} isDragOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskEditSheet
        task={selectedTask}
        projectId={projectId}
        open={sheetOpen}
        onClose={handleSheetClose}
        onSaved={handleTaskSaved}
        onDeleted={handleTaskDeleted}
      />
    </>
  );
}
