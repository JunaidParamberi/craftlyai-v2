# Global CRUD Toast Notifications — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add sonner toast notifications to every CRUD mutation in the app so users always get feedback on create/update/delete actions.

**Architecture:** Direct inline calls — `import { toast } from "sonner"` in each client component, call `toast.success()` / `toast.error()` in existing `if (result.ok)` blocks. No new abstractions. `<Toaster>` already wired in `app/layout.tsx`. Timer actions (start/stop/pause/resume) get error-only toasts; all other mutations get success + error toasts.

**Tech Stack:** sonner (already installed), existing server action return shape `{ ok, message?, error? }`

---

## Files Modified

| File | What changes |
|---|---|
| `components/features/clients/client-form.tsx` | Add `toast.success` on create + update |
| `components/features/clients/delete-client-button.tsx` | Add `toast.success` + `toast.error` |
| `components/features/projects/project-form.tsx` | Add `toast.success` on create + update |
| `components/features/projects/projects-table.tsx` | Add `toast.success` + `toast.error` on delete |
| `components/features/projects/project-tasks-panel.tsx` | Add toasts for createTask, deleteTask (success+error); toggleDone (error only) |
| `components/features/time/time-tracker.tsx` | Add `toast.error` only for all timer actions; `toast.success` for manual entry |
| `components/features/documents/mark-paid-button.tsx` | Add `toast.success` + `toast.error` |
| `components/features/documents/quote-approval-status.tsx` | Add `toast.success` + `toast.error` |
| `components/onboarding/brand-kit-form.tsx` | Add `toast.success` when `redirectAfterSave === false` (settings context) |

---

## Task 1: Client form + delete button

**Files:**
- Modify: `components/features/clients/client-form.tsx`
- Modify: `components/features/clients/delete-client-button.tsx`

- [ ] **Step 1: Add toast import to client-form.tsx**

In `components/features/clients/client-form.tsx`, add to the imports block (after the existing imports):

```tsx
import { toast } from "sonner";
```

- [ ] **Step 2: Add success toast on create**

Find the create success block (currently lines 118–120):
```tsx
        router.push(`/clients/${created.client.id}`);
        router.refresh();
        return;
```

Replace with:
```tsx
        toast.success("Client created");
        router.push(`/clients/${created.client.id}`);
        router.refresh();
        return;
```

- [ ] **Step 3: Add success toast on update**

Find the update success block (currently lines 142–143):
```tsx
      router.push(`/clients/${props.clientId}`);
      router.refresh();
```

Replace with:
```tsx
      toast.success("Client updated");
      router.push(`/clients/${props.clientId}`);
      router.refresh();
```

- [ ] **Step 4: Add toast import to delete-client-button.tsx**

In `components/features/clients/delete-client-button.tsx`, add import:

```tsx
import { toast } from "sonner";
```

- [ ] **Step 5: Add success + error toasts to delete-client-button.tsx**

Find `confirmDelete` function (currently lines 32–44):
```tsx
  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteClient(clientId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setOpen(false);
      router.push("/clients");
      router.refresh();
    });
  }
```

Replace with:
```tsx
  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteClient(clientId);
      if (!result.ok) {
        setError(result.message);
        toast.error(result.message ?? "Failed to delete client.");
        return;
      }
      setOpen(false);
      toast.success("Client deleted");
      router.push("/clients");
      router.refresh();
    });
  }
```

- [ ] **Step 6: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
git add components/features/clients/client-form.tsx components/features/clients/delete-client-button.tsx
git commit -m "feat(toasts): add success/error toasts to client CRUD"
```

---

## Task 2: Project form + project delete

**Files:**
- Modify: `components/features/projects/project-form.tsx`
- Modify: `components/features/projects/projects-table.tsx`

- [ ] **Step 1: Add toast import to project-form.tsx**

In `components/features/projects/project-form.tsx`, add:

```tsx
import { toast } from "sonner";
```

- [ ] **Step 2: Add success toast on create in project-form.tsx**

Find the create success block (currently lines 120–122):
```tsx
        router.push(`/projects/${created.project.id}`);
        router.refresh();
        return;
```

Replace with:
```tsx
        toast.success("Project created");
        router.push(`/projects/${created.project.id}`);
        router.refresh();
        return;
```

- [ ] **Step 3: Add success toast on update in project-form.tsx**

Find the update success block (currently lines 144–145):
```tsx
      router.push(`/projects/${props.projectId}`);
      router.refresh();
```

Replace with:
```tsx
      toast.success("Project updated");
      router.push(`/projects/${props.projectId}`);
      router.refresh();
```

- [ ] **Step 4: Add toast import to projects-table.tsx**

In `components/features/projects/projects-table.tsx`, add:

```tsx
import { toast } from "sonner";
```

- [ ] **Step 5: Add success + error toasts to confirmDelete in projects-table.tsx**

Find `confirmDelete` function (currently lines 111–125):
```tsx
  function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteProject(pendingDelete.id);
      if (!result.ok) {
        setDeleteError(result.message);
        return;
      }
      setPendingDelete(null);
      router.refresh();
    });
  }
```

Replace with:
```tsx
  function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteProject(pendingDelete.id);
      if (!result.ok) {
        setDeleteError(result.message);
        toast.error(result.message ?? "Failed to delete project.");
        return;
      }
      setPendingDelete(null);
      toast.success("Project deleted");
      router.refresh();
    });
  }
```

- [ ] **Step 6: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
git add components/features/projects/project-form.tsx components/features/projects/projects-table.tsx
git commit -m "feat(toasts): add success/error toasts to project CRUD"
```

---

## Task 3: Tasks panel

**Files:**
- Modify: `components/features/projects/project-tasks-panel.tsx`

Rules from spec:
- `createTask` → success + error toast
- `toggleDone` (updateTask) → error only (checkbox gives visual feedback)
- `deleteTask` → success + error toast

- [ ] **Step 1: Add toast import**

In `components/features/projects/project-tasks-panel.tsx`, add:

```tsx
import { toast } from "sonner";
```

- [ ] **Step 2: Add toasts to onAddTask**

Find `onAddTask` function (currently lines 147–164):
```tsx
  function onAddTask(values: TaskDialogValues) {
    setFormError(null);
    startTransition(async () => {
      const res = await createTask(projectId, {
        title: values.title,
        priority: values.priority,
        due_date: values.due_date,
        status: "todo",
      });
      if (!res.ok) {
        setFormError(res.message);
        return;
      }
      reset(emptyTaskForm);
      setAddOpen(false);
      refresh();
    });
  }
```

Replace with:
```tsx
  function onAddTask(values: TaskDialogValues) {
    setFormError(null);
    startTransition(async () => {
      const res = await createTask(projectId, {
        title: values.title,
        priority: values.priority,
        due_date: values.due_date,
        status: "todo",
      });
      if (!res.ok) {
        setFormError(res.message);
        toast.error(res.message ?? "Failed to add task.");
        return;
      }
      toast.success("Task added");
      reset(emptyTaskForm);
      setAddOpen(false);
      refresh();
    });
  }
```

- [ ] **Step 3: Add error toast to toggleDone**

Find `toggleDone` function (currently lines 166–175):
```tsx
  function toggleDone(task: TaskRow) {
    startTransition(async () => {
      const next: TaskStatus = task.status === "done" ? "todo" : "done";
      const res = await updateTask(projectId, task.id, { status: next });
      if (!res.ok) {
        return;
      }
      refresh();
    });
  }
```

Replace with:
```tsx
  function toggleDone(task: TaskRow) {
    startTransition(async () => {
      const next: TaskStatus = task.status === "done" ? "todo" : "done";
      const res = await updateTask(projectId, task.id, { status: next });
      if (!res.ok) {
        toast.error(res.message ?? "Failed to update task.");
        return;
      }
      refresh();
    });
  }
```

- [ ] **Step 4: Add toasts to removeTask**

Find `removeTask` function (currently lines 177–185):
```tsx
  function removeTask(taskId: string) {
    startTransition(async () => {
      const res = await deleteTask(projectId, taskId);
      if (!res.ok) {
        return;
      }
      refresh();
    });
  }
```

Replace with:
```tsx
  function removeTask(taskId: string) {
    startTransition(async () => {
      const res = await deleteTask(projectId, taskId);
      if (!res.ok) {
        toast.error(res.message ?? "Failed to delete task.");
        return;
      }
      toast.success("Task deleted");
      refresh();
    });
  }
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add components/features/projects/project-tasks-panel.tsx
git commit -m "feat(toasts): add success/error toasts to task CRUD"
```

---

## Task 4: Time tracker (error-only + manual entry success)

**Files:**
- Modify: `components/features/time/time-tracker.tsx`

Timer actions (start/stop/pause/resume/updateDescription) → error toast only.
Manual entry → success + error toast.

- [ ] **Step 1: Add toast import**

In `components/features/time/time-tracker.tsx`, add:

```tsx
import { toast } from "sonner";
```

- [ ] **Step 2: Add success + error toast to onManualSubmit**

Find `onManualSubmit` — the `startTransition` call inside it (currently ~lines 315–338):
```tsx
    startTransition(async () => {
      const result = await createManualTimeEntry({
        project_id: values.project_id,
        task_id: taskIdFromForm(values.task_id),
        description: values.description,
        started_at: startedIso,
        ended_at: endedIso,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      manualForm.reset({
        project_id: values.project_id,
        task_id: TASK_SELECT_NONE,
        description: "",
        start_date: "",
        start_time: "",
        end_date: "",
        end_time: "",
      });
      setTasksForManual([]);
      router.refresh();
    });
```

Replace with:
```tsx
    startTransition(async () => {
      const result = await createManualTimeEntry({
        project_id: values.project_id,
        task_id: taskIdFromForm(values.task_id),
        description: values.description,
        started_at: startedIso,
        ended_at: endedIso,
      });
      if (!result.ok) {
        setError(result.message);
        toast.error(result.message ?? "Failed to log time entry.");
        return;
      }
      toast.success("Time entry logged");
      manualForm.reset({
        project_id: values.project_id,
        task_id: TASK_SELECT_NONE,
        description: "",
        start_date: "",
        start_time: "",
        end_date: "",
        end_time: "",
      });
      setTasksForManual([]);
      router.refresh();
    });
```

- [ ] **Step 3: Add error toast to onStartSubmit**

Find `onStartSubmit` — the error branch:
```tsx
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }
```

Replace with:
```tsx
      if (!result.ok) {
        setError(result.message);
        toast.error(result.message ?? "Failed to start timer.");
        return;
      }
      router.refresh();
    });
  }
```

- [ ] **Step 4: Add error toast to onStop**

Find `onStop` — the error branch:
```tsx
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  function onPause() {
```

Replace the onStop error branch with:
```tsx
      if (!result.ok) {
        setError(result.message);
        toast.error(result.message ?? "Failed to stop timer.");
        return;
      }
      router.refresh();
    });
  }

  function onPause() {
```

- [ ] **Step 5: Add error toast to onPause**

Find `onPause` — the error branch:
```tsx
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  function onResume() {
```

Replace with:
```tsx
      if (!result.ok) {
        setError(result.message);
        toast.error(result.message ?? "Failed to pause timer.");
        return;
      }
      router.refresh();
    });
  }

  function onResume() {
```

- [ ] **Step 6: Add error toast to onResume**

Find `onResume` — the error branch:
```tsx
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  function onRunningNoteBlur() {
```

Replace with:
```tsx
      if (!result.ok) {
        setError(result.message);
        toast.error(result.message ?? "Failed to resume timer.");
        return;
      }
      router.refresh();
    });
  }

  function onRunningNoteBlur() {
```

- [ ] **Step 7: Add error toast to onRunningNoteBlur**

Find `onRunningNoteBlur` — the error branch:
```tsx
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }
```

(This is the last function before the `return (` of the component.) Replace with:
```tsx
      if (!result.ok) {
        setError(result.message);
        toast.error(result.message ?? "Failed to save description.");
        return;
      }
      router.refresh();
    });
  }
```

- [ ] **Step 8: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 9: Commit**

```bash
git add components/features/time/time-tracker.tsx
git commit -m "feat(toasts): add error toasts to timer actions, success toast to manual entry"
```

---

## Task 5: Mark paid + convert quote

**Files:**
- Modify: `components/features/documents/mark-paid-button.tsx`
- Modify: `components/features/documents/quote-approval-status.tsx`

- [ ] **Step 1: Add toast import to mark-paid-button.tsx**

In `components/features/documents/mark-paid-button.tsx`, add:

```tsx
import { toast } from "sonner";
```

- [ ] **Step 2: Add toasts to handleConfirm in mark-paid-button.tsx**

Find `handleConfirm` (currently lines 48–62):
```tsx
  const handleConfirm = () => {
    setLoading(true);
    setError("");
    startTransition(async () => {
      const result = await markInvoicePaid(documentId);
      if (result.ok) {
        setPaid(true);
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Failed to mark as paid.");
      }
      setLoading(false);
    });
  };
```

Replace with:
```tsx
  const handleConfirm = () => {
    setLoading(true);
    setError("");
    startTransition(async () => {
      const result = await markInvoicePaid(documentId);
      if (result.ok) {
        setPaid(true);
        setOpen(false);
        toast.success("Invoice marked as paid");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to mark as paid.");
        toast.error(result.error ?? "Failed to mark as paid.");
      }
      setLoading(false);
    });
  };
```

- [ ] **Step 3: Add toast import to quote-approval-status.tsx**

In `components/features/documents/quote-approval-status.tsx`, add:

```tsx
import { toast } from "sonner";
```

- [ ] **Step 4: Add toasts to handleConvert in quote-approval-status.tsx**

Find `handleConvert` (currently lines 36–46):
```tsx
  const handleConvert = () => {
    setError(null);
    startTransition(async () => {
      const result = await convertQuoteToInvoice(documentId);
      if (result.ok && result.invoiceId) {
        router.push(`/documents/${result.invoiceId}`);
      } else {
        setError(result.error ?? "Failed to convert quote.");
      }
    });
  };
```

Replace with:
```tsx
  const handleConvert = () => {
    setError(null);
    startTransition(async () => {
      const result = await convertQuoteToInvoice(documentId);
      if (result.ok && result.invoiceId) {
        toast.success("Converted to invoice");
        router.push(`/documents/${result.invoiceId}`);
      } else {
        setError(result.error ?? "Failed to convert quote.");
        toast.error(result.error ?? "Failed to convert quote.");
      }
    });
  };
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add components/features/documents/mark-paid-button.tsx components/features/documents/quote-approval-status.tsx
git commit -m "feat(toasts): add success/error toasts to mark paid and convert quote"
```

---

## Task 6: Brand kit (settings mode)

**Files:**
- Modify: `components/onboarding/brand-kit-form.tsx`

The form is shared between onboarding (redirects away on success) and settings (`redirectAfterSave={false}`). Only the settings path needs a toast — onboarding navigates away before the toast renders.

- [ ] **Step 1: Add toast import**

In `components/onboarding/brand-kit-form.tsx`, add:

```tsx
import { toast } from "sonner";
```

- [ ] **Step 2: Add toast in the settings success branch**

Find the `else { setSavedOk(true); }` branch in `onSubmit` (currently ~lines 154–156):
```tsx
      } else {
        setSavedOk(true);
      }
```

Replace with:
```tsx
      } else {
        setSavedOk(true);
        toast.success("Brand kit saved");
      }
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add components/onboarding/brand-kit-form.tsx
git commit -m "feat(toasts): add success toast to brand kit save in settings"
```

---

## Task 7: Smoke test + push

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Smoke test each flow**

Test paths:
1. `/clients/new` — create client → should see "Client created" toast + redirect
2. `/clients/[id]` — edit client → save → "Client updated" toast
3. `/clients/[id]` — delete client → "Client deleted" toast
4. `/projects/new` — create project → "Project created" toast
5. `/projects` — delete a project via table dropdown → "Project deleted" toast
6. `/projects/[id]` — add a task → "Task added" toast; delete a task → "Task deleted" toast
7. `/time` — log manual entry → "Time entry logged" toast; start/stop/pause/resume timer → no toast on success
8. Any invoice → "Mark as paid" → "Invoice marked as paid" toast
9. Approved quote → "Convert to invoice" → "Converted to invoice" toast
10. `/settings/brand` → save → "Brand kit saved" toast

- [ ] **Step 3: Fix any TypeScript errors found**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Push to dev**

```bash
git push origin dev
```
