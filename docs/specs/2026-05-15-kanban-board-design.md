# Kanban Board — Project Tasks View

**Phase:** 2.5 · Task 4/8  
**Date:** 2026-05-15  
**Branch:** `feat/kanban-board`  
**For:** Cursor implementation handover

---

## Overview

Add a **Board view** to the Tasks tab on `/projects/[id]`. The existing list view stays. A toggle lets users switch between List and Board. The board renders 4 kanban columns (one per task status). Dragging a card between columns updates its status. Clicking a card opens a side Sheet for editing. View preference persists per-project in localStorage.

---

## What Already Exists (reuse, don't rewrite)

| Resource | Path |
|---|---|
| Task server actions | `lib/tasks/actions.ts` — `updateTask`, `deleteTask`, `createTask`, `listTasksForProject` |
| Task display helpers | `lib/tasks/display.ts` — `taskPriorityLabel`, `taskPriorityBadgeVariant`, `taskStatusLabel`, `taskStatusBadgeVariant` |
| Task utils | `lib/tasks/task-utils.ts` — `isTaskOverdue`, `sortTasks`, `filterTasks` |
| Task types | `lib/types/index.ts` — `TaskRow`, `TaskStatus`, `TaskPriority` |
| Quick-add dialog | `components/features/tasks/quick-add-task-dialog.tsx` |
| Project tasks panel | `components/features/projects/project-tasks-panel.tsx` |
| shadcn components | `Sheet`, `ToggleGroup`, `Badge`, `Select`, `Input`, `ScrollArea`, `Button` — all in `components/ui/` |

### Task statuses (4 columns)

```typescript
type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
```

### Task priorities (card accent colors)

```typescript
type TaskPriority = "low" | "medium" | "high";
```

---

## Design Spec

### Board layout

Horizontal flex row of 4 fixed-width columns with horizontal scroll on overflow.

```
┌──────────────────────────────────────────────────────────────────┐
│  Tasks  [≡ List] [⊞ Board]                         [+ Add Task] │
│ ──────────────────────────────────────────────────────────────── │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ ○ To Do  3 │  │ ↺ In Prog 2│  │ ✓ Done   5 │  │ ✕ Cancel 1│ │
│  │────────────│  │────────────│  │────────────│  │────────────│ │
│  │ [card]     │  │ [card]     │  │ [card]     │  │ [card]     │ │
│  │ [card]     │  │ [card]     │  │ [card]     │  │            │ │
│  │ [card]     │  │            │  │ [card]     │  │            │ │
│  │            │  │            │  │ [card]     │  │            │ │
│  │ + Add task │  │ + Add task │  │ + Add task │  │ + Add task │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Board wrapper classes:**
```
flex gap-4 overflow-x-auto pb-4
```

### Column design

Each column is **272px wide**, fixed, vertically scrollable card list.

**Column container classes:**
```
min-w-[272px] max-w-[272px] flex flex-col rounded-xl border border-border
border-t-4  {accent color}  {background tint}
```

**Per-status column config:**

| Status | Label | Icon (lucide-react) | Top border | Background tint |
|---|---|---|---|---|
| `todo` | To Do | `Circle` | `border-t-border` | `bg-muted/40` |
| `in_progress` | In Progress | `RotateCcw` | `border-t-blue-400` | `bg-blue-50/60 dark:bg-blue-950/20` |
| `done` | Done | `CheckCircle2` | `border-t-emerald-400` | `bg-emerald-50/60 dark:bg-emerald-950/20` |
| `cancelled` | Cancelled | `XCircle` | `border-t-red-400` | `bg-red-50/40 dark:bg-red-950/20` |

**Column header:**
```tsx
<div className="flex items-center gap-2 px-3 py-3 border-b border-border">
  <Icon className="h-4 w-4 text-muted-foreground" />
  <span className="text-sm font-semibold">{label}</span>
  <span className="ml-auto bg-muted text-muted-foreground text-xs rounded-full px-2 py-0.5">
    {tasks.length}
  </span>
</div>
```

**Card list area (scroll):**
```tsx
<ScrollArea className="flex-1 p-2">
  {/* cards stacked vertically, gap-2 */}
</ScrollArea>
```

**Empty column state** (show when no tasks in column):
```tsx
<div className="flex flex-col items-center justify-center gap-2 py-10 mx-2
                rounded-lg border-2 border-dashed border-border/50 text-center">
  <Icon className="h-6 w-6 text-muted-foreground/40" />
  <p className="text-xs text-muted-foreground">No tasks here</p>
  <p className="text-xs text-muted-foreground/60">Drop one here</p>
</div>
```

**Drop-active state on column** (when dragging over):
```
ring-2 ring-primary/40 ring-inset  (add to column container)
```

**Add task footer button:**
```tsx
<Button variant="ghost" size="sm"
  className="w-full justify-start text-muted-foreground text-sm gap-2 mt-1">
  <Plus className="h-3.5 w-3.5" />
  Add task
</Button>
```

---

### Task card design

White card, `rounded-lg`, `shadow-sm`, `border border-border`.  
Left border (4px) color-coded by **priority**:

| Priority | Left border class |
|---|---|
| `high` | `border-l-4 border-l-red-400` |
| `medium` | `border-l-4 border-l-amber-400` |
| `low` | `border-l-4 border-l-slate-300` |

**Card layout:**
```
┌─────────────────────────────────┐
│ [High badge]          (right)   │  ← priority badge, top right
│ Fix login timeout on Safari     │  ← title, 2-line clamp, font-medium text-sm
│ ─────────────────────────────── │
│ 📅 May 20                       │  ← due date, text-xs text-muted-foreground
│   (red if overdue)              │    or text-red-500 if isTaskOverdue()
└─────────────────────────────────┘
```

**Card classes (base):**
```
bg-card rounded-lg border border-border shadow-sm p-3 cursor-grab
border-l-4 {priority border}
hover:shadow-md hover:-translate-y-0.5 transition-all duration-150
select-none
```

**Priority badge:** use `taskPriorityBadgeVariant()` from `lib/tasks/display.ts` for the `variant` prop on `<Badge>`.

**Due date:** format as `MMM D` (e.g. "May 20"). Use `isTaskOverdue(task)` from `lib/tasks/task-utils.ts` to apply `text-red-500` class.

**No assignee field** — no assignee column in DB yet.

---

### Drag-and-drop behavior

Library: **`@dnd-kit/core`** + **`@dnd-kit/utilities`**

**What dragging does:**
- Drag a card between columns → fires `updateTask(projectId, taskId, { status: newStatus })`
- Status-change only. No reorder within column.
- If dropped on same column → no-op, no server call.

**Drag states:**
| State | Visual |
|---|---|
| Card being dragged (ghost) | `opacity-50` in original position |
| Drag overlay (floating clone) | `shadow-xl rotate-1 scale-[1.02]` — floats above board |
| Drop target column (is-over) | `ring-2 ring-primary/40 ring-inset` on column container |

**Optimistic update:** update local `tasks` state immediately in `handleDragEnd` before server action resolves. If server action fails, revalidatePath will restore correct state on next render.

**DndContext collision detection:** `closestCenter`

---

### Task edit Sheet

Click any card → Sheet slides in from right.

**Sheet props:** `side="right"`, `className="w-[400px] sm:max-w-[400px]"`

**Content:**
- `SheetHeader`: Task title as `SheetTitle` (editable — use controlled Input below)
- Form fields:
  - **Title** — `Input`, full width
  - **Status** — `Select` with all 4 options using `taskStatusLabel()` for labels
  - **Priority** — `Select` with 3 options using `taskPriorityLabel()` for labels
  - **Due date** — `Input type="date"`
- `SheetFooter`: 
  - `Button variant="destructive"` — Delete (with confirm via `window.confirm` or inline alert — keep simple)
  - `Button` (primary) — Save

**Form:** react-hook-form + `taskUpdateSchema` from `lib/validations/task.ts`

**Actions:** `updateTask` and `deleteTask` from `lib/tasks/actions.ts`

**useTransition** for pending states on both buttons.

**On success:** close Sheet, revalidatePath handles UI refresh.

---

### View toggle

`ToggleGroup` (already in `components/ui/toggle-group.tsx`) with 2 items.

```tsx
<ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)}>
  <ToggleGroupItem value="list" aria-label="List view">
    <LayoutList className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="board" aria-label="Board view">
    <LayoutDashboard className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>
```

**localStorage key:** `craftlyai:task-view:${projectId}` → `"list"` | `"board"`

**Default:** `"list"` if nothing stored.

**Placement:** In the Tasks tab header row, right-aligned, before the "+ Add Task" button.

---

## Files to Create

### `components/features/tasks/kanban-board.tsx`

```tsx
"use client";

import { useState, useTransition } from "react";
import { DndContext, DragEndEvent, DragOverlay, closestCenter, DragStartEvent } from "@dnd-kit/core";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { TaskEditSheet } from "./task-edit-sheet";
import { updateTask } from "@/lib/tasks/actions";
import type { TaskRow, TaskStatus } from "@/lib/types";
import { Circle, RotateCcw, CheckCircle2, XCircle } from "lucide-react";

const COLUMNS = [
  { status: "todo" as TaskStatus,        label: "To Do",       icon: Circle,       accent: "border-t-border",       bg: "bg-muted/40" },
  { status: "in_progress" as TaskStatus, label: "In Progress", icon: RotateCcw,    accent: "border-t-blue-400",     bg: "bg-blue-50/60 dark:bg-blue-950/20" },
  { status: "done" as TaskStatus,        label: "Done",        icon: CheckCircle2, accent: "border-t-emerald-400",  bg: "bg-emerald-50/60 dark:bg-emerald-950/20" },
  { status: "cancelled" as TaskStatus,   label: "Cancelled",   icon: XCircle,      accent: "border-t-red-400",      bg: "bg-red-50/40 dark:bg-red-950/20" },
] as const;

interface KanbanBoardProps {
  tasks: TaskRow[];
  projectId: string;
}

export function KanbanBoard({ tasks: initialTasks, projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [, startTransition] = useTransition();

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) ?? null : null;

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

    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));

    startTransition(() => {
      updateTask(projectId, taskId, { status: newStatus });
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
              projectId={projectId}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-1 scale-[1.02] shadow-xl">
              <KanbanCard task={activeTask} onClick={() => {}} isDragOverlay />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskEditSheet
        task={selectedTask}
        projectId={projectId}
        open={sheetOpen}
        onClose={handleSheetClose}
      />
    </>
  );
}
```

---

### `components/features/tasks/kanban-column.tsx`

```tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { KanbanCard } from "./kanban-card";
import { QuickAddTaskDialog } from "./quick-add-task-dialog";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { TaskRow, TaskStatus } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  icon: LucideIcon;
  accent: string;
  bg: string;
  tasks: TaskRow[];
  projectId: string;
  onCardClick: (task: TaskRow) => void;
}

export function KanbanColumn({ status, label, icon: Icon, accent, bg, tasks, projectId, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-w-[272px] max-w-[272px] flex flex-col rounded-xl border border-border border-t-4",
        accent, bg,
        isOver && "ring-2 ring-primary/40 ring-inset"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">{label}</span>
        <span className="ml-auto bg-muted text-muted-foreground text-xs rounded-full px-2 py-0.5 tabular-nums">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 p-2 max-h-[calc(100vh-320px)]">
        <div className="flex flex-col gap-2">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 mx-1
                            rounded-lg border-2 border-dashed border-border/50 text-center">
              <Icon className="h-6 w-6 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">No tasks here</p>
              <p className="text-xs text-muted-foreground/60">Drop one here</p>
            </div>
          ) : (
            tasks.map((task) => (
              <KanbanCard key={task.id} task={task} onClick={() => onCardClick(task)} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add task footer */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground text-sm gap-2"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </Button>
      </div>

      <QuickAddTaskDialog
        projectId={projectId}
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultStatus={status}
      />
    </div>
  );
}
```

---

### `components/features/tasks/kanban-card.tsx`

```tsx
"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { taskPriorityLabel, taskPriorityBadgeVariant } from "@/lib/tasks/display";
import { isTaskOverdue } from "@/lib/tasks/task-utils";
import type { TaskRow } from "@/lib/types";
import { format, parseISO } from "date-fns";

const PRIORITY_BORDER: Record<string, string> = {
  high:   "border-l-red-400",
  medium: "border-l-amber-400",
  low:    "border-l-slate-300",
};

interface KanbanCardProps {
  task: TaskRow;
  onClick: () => void;
  isDragOverlay?: boolean;
}

export function KanbanCard({ task, onClick, isDragOverlay = false }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });

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
        "bg-card rounded-lg border border-border border-l-4 shadow-sm p-3 cursor-grab select-none",
        PRIORITY_BORDER[task.priority],
        "hover:shadow-md hover:-translate-y-0.5 transition-all duration-150",
        isDragging && !isDragOverlay && "opacity-50 shadow-none"
      )}
    >
      {/* Priority badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span /> {/* spacer */}
        <Badge variant={taskPriorityBadgeVariant(task.priority)} className="text-[10px] shrink-0">
          {taskPriorityLabel(task.priority)}
        </Badge>
      </div>

      {/* Title */}
      <p className="text-sm font-medium leading-snug line-clamp-2">{task.title}</p>

      {/* Due date */}
      {task.due_date && (
        <div className={cn(
          "flex items-center gap-1 mt-2 text-xs",
          overdue ? "text-red-500" : "text-muted-foreground"
        )}>
          <Calendar className="h-3 w-3" />
          <span>{format(parseISO(task.due_date), "MMM d")}</span>
        </div>
      )}
    </div>
  );
}
```

---

### `components/features/tasks/task-edit-sheet.tsx`

```tsx
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTask, deleteTask } from "@/lib/tasks/actions";
import { taskUpdateSchema } from "@/lib/validations/task";
import { taskStatusLabel, taskPriorityLabel } from "@/lib/tasks/display";
import { toast } from "sonner";
import type { TaskRow } from "@/lib/types";
import type { z } from "zod";

type FormValues = z.infer<typeof taskUpdateSchema>;

const STATUSES = ["todo", "in_progress", "done", "cancelled"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

interface TaskEditSheetProps {
  task: TaskRow | null;
  projectId: string;
  open: boolean;
  onClose: () => void;
}

export function TaskEditSheet({ task, projectId, open, onClose }: TaskEditSheetProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(taskUpdateSchema),
    values: task
      ? { title: task.title, status: task.status, priority: task.priority, due_date: task.due_date ?? "" }
      : undefined,
  });

  function onSubmit(data: FormValues) {
    if (!task) return;
    startTransition(async () => {
      await updateTask(projectId, task.id, data);
      toast.success("Task updated");
      onClose();
    });
  }

  function onDelete() {
    if (!task) return;
    if (!window.confirm("Delete this task?")) return;
    startTransition(async () => {
      await deleteTask(projectId, task.id);
      toast.success("Task deleted");
      onClose();
    });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Edit Task</SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 mt-6 px-1">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as TaskRow["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{taskStatusLabel(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <Label>Priority</Label>
            <Select value={form.watch("priority")} onValueChange={(v) => form.setValue("priority", v as TaskRow["priority"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>{taskPriorityLabel(p)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due date */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="due_date">Due date</Label>
            <Input id="due_date" type="date" {...form.register("due_date")} />
          </div>

          <SheetFooter className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isPending}
              className="mr-auto"
            >
              Delete
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
```

---

## Files to Modify

### `components/features/projects/project-tasks-panel.tsx`

Add these changes to the existing component:

**1. Add imports:**
```tsx
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutList, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/features/tasks/kanban-board";
```

**2. Add view mode state (inside component, before return):**
```tsx
type ViewMode = "list" | "board";
const [viewMode, setViewMode] = useState<ViewMode>("list");

// Persist per-project
useEffect(() => {
  const stored = localStorage.getItem(`craftlyai:task-view:${project.id}`);
  if (stored === "board" || stored === "list") setViewMode(stored);
}, [project.id]);

function handleViewChange(mode: ViewMode) {
  setViewMode(mode);
  localStorage.setItem(`craftlyai:task-view:${project.id}`, mode);
}
```

**3. Add toggle to header row** (right-aligned, before "+ Add Task" button):
```tsx
<ToggleGroup
  type="single"
  value={viewMode}
  onValueChange={(v) => v && handleViewChange(v as ViewMode)}
  className="border rounded-md"
>
  <ToggleGroupItem value="list" aria-label="List view" className="h-8 w-8 p-0">
    <LayoutList className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="board" aria-label="Board view" className="h-8 w-8 p-0">
    <LayoutDashboard className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>
```

**4. Conditionally render board vs list:**
```tsx
{viewMode === "board" ? (
  <KanbanBoard tasks={tasks} projectId={project.id} />
) : (
  {/* existing list rendering */}
)}
```

---

### `components/features/tasks/quick-add-task-dialog.tsx`

Add optional `defaultStatus` prop:

```tsx
interface QuickAddTaskDialogProps {
  projectId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultStatus?: TaskStatus; // new optional prop
}
```

In the form `defaultValues`, use:
```tsx
defaultValues: {
  title: "",
  status: defaultStatus ?? "todo",
  priority: "medium",
  due_date: "",
}
```

> **Important:** The existing `QuickAddTaskDialog` may use different prop names. Check the actual file and adapt accordingly — do not break existing callers on the `/tasks` global page.

---

## Installation

```bash
npm install @dnd-kit/core @dnd-kit/utilities
```

> `@dnd-kit/sortable` is **not needed** — we are not sorting within columns, only moving between them.

---

## No DB Migration Needed

Status changes use the existing `updateTask` server action. No `sort_order` column required.

---

## UI Polish Checklist

Implement all of these for the "very creative, good UI/UX" bar:

- [ ] Drag overlay: `rotate-1 scale-[1.02] shadow-xl` — card floats and tilts slightly
- [ ] Ghost card while dragging: `opacity-50 shadow-none`
- [ ] Drop target column: `ring-2 ring-primary/40 ring-inset`
- [ ] Card hover: `hover:shadow-md hover:-translate-y-0.5 transition-all duration-150`
- [ ] Empty column: dashed border, centered icon + 2-line hint text
- [ ] Column count badge: muted, rounded-full, tabular numbers
- [ ] Board: `overflow-x-auto` — scroll horizontally on small screens
- [ ] Dark mode: test all column tints are visible but not overwhelming
- [ ] Card title: `line-clamp-2` — caps at 2 lines
- [ ] Overdue due date: `text-red-500`
- [ ] Sonner toast on save and delete from Sheet

---

## Verification Steps

1. `npm install` — confirm no peer dep errors
2. `npm run build` — 0 TypeScript errors
3. `npm run test` — 201+ tests pass, 0 failures
4. Browser smoke test on `/projects/[id]` Tasks tab:
   - List view loads by default
   - Toggle to Board — 4 columns visible, tasks in correct columns
   - Drag card from "To Do" to "In Progress" — moves visually, refresh confirms DB updated
   - Drag to same column — no-op
   - Click card — Sheet opens with correct data populated
   - Edit and Save — card reflects changes
   - Delete from Sheet — card disappears
   - Toggle back to List — tasks reflect all changes
   - Refresh page — board view still active (localStorage)
   - Column "+ Add task" — dialog pre-fills correct status
   - 375px viewport — board scrolls horizontally
   - Dark mode — column backgrounds visible and tasteful
