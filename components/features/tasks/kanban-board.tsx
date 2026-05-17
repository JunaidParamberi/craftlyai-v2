"use client";

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
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
import { useEffect, useRef, useState, useTransition } from "react";
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
    accent: "[border-top-color:var(--border-focus)]",
    bg: "[background:color-mix(in_srgb,var(--border-focus)_5%,transparent)]",
  },
  {
    status: "done" as TaskStatus,
    label: "Done",
    icon: CheckCircle2,
    accent: "[border-top-color:var(--success,#1F8A52)]",
    bg: "[background:color-mix(in_srgb,var(--success,#1F8A52)_5%,transparent)]",
  },
  {
    status: "cancelled" as TaskStatus,
    label: "Cancelled",
    icon: XCircle,
    accent: "[border-top-color:var(--danger,#C13838)]",
    bg: "[background:color-mix(in_srgb,var(--danger,#C13838)_5%,transparent)]",
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
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [, startTransition] = useTransition();
  const boardScrollRef = useRef<HTMLDivElement>(null);
  const lastPointerXRef = useRef<number | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    if (!activeId || !boardScrollRef.current) return;

    function applyEdgeScroll(clientX: number) {
      const scrollEl = boardScrollRef.current;
      if (!scrollEl) return;

      const rect = scrollEl.getBoundingClientRect();
      const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
      if (maxScroll <= 0) return;

      const margin = Math.min(96, Math.max(44, rect.width * 0.22));
      const leftEdge = rect.left + margin;
      const rightEdge = rect.right - margin;

      if (clientX < leftEdge) {
        const depth = Math.min(1, (leftEdge - clientX) / margin);
        scrollEl.scrollLeft = Math.max(
          0,
          scrollEl.scrollLeft - (8 + depth * 28),
        );
      } else if (clientX > rightEdge) {
        const depth = Math.min(1, (clientX - rightEdge) / margin);
        scrollEl.scrollLeft = Math.min(
          maxScroll,
          scrollEl.scrollLeft + (8 + depth * 28),
        );
      }
    }

    function onPointerMove(e: PointerEvent) {
      lastPointerXRef.current = e.clientX;
      applyEdgeScroll(e.clientX);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const tick = () => {
      const x = lastPointerXRef.current;
      if (x != null) applyEdgeScroll(x);
    };
    const intervalId = window.setInterval(tick, 45);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.clearInterval(intervalId);
      lastPointerXRef.current = null;
    };
  }, [activeId]);

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
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={boardScrollRef}
          className="flex min-h-0 min-w-0 w-full gap-4 overflow-x-auto overscroll-x-contain pb-4 [-webkit-overflow-scrolling:touch]"
        >
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
