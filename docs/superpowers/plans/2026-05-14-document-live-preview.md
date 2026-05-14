# Document Studio Live Preview Panel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a user-toggled right-side live preview panel to the document editor that shows the fully rendered document with resolved variables as the user edits.

**Architecture:** Three new units (shared `renderNode` export, `buildClientSideContext` pure function, `useDebounce` hook, `DocumentPreviewPanel` component) wired into the existing `DocumentForm` via a `showPreview` toggle. Variable context is built client-side from already-loaded `clients`/`projects` props plus a `initialVariableContext` prop passed from the server edit page.

**Tech Stack:** React (useState, useMemo, useEffect), Vitest, Tiptap JSON, existing `VariableContext` type, Tailwind CSS, Lucide icons.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `components/features/documents/document-detail-view.tsx` | Modify | Export `renderNode` so preview panel can reuse it |
| `lib/documents/variables-client.ts` | Create | Pure `buildClientSideContext` function — derives `VariableContext` from client-side data |
| `lib/documents/variables-client.test.ts` | Create | Vitest unit tests for `buildClientSideContext` |
| `hooks/use-debounce.ts` | Create | Generic `useDebounce<T>` hook |
| `components/features/documents/editor/document-preview-panel.tsx` | Create | Preview panel — paper UI + rendered doc content |
| `components/features/documents/document-form.tsx` | Modify | Add toggle state, derived context, debounce, grid switch, preview panel |
| `app/(app)/documents/[id]/edit/page.tsx` | Modify | Call `buildVariableContext`, pass as `initialVariableContext` prop |

---

### Task 1: Export `renderNode` from `DocumentDetailView`

**Files:**
- Modify: `components/features/documents/document-detail-view.tsx:90`

- [ ] **Step 1: Add `export` to `renderNode`**

In `components/features/documents/document-detail-view.tsx`, change line 90 from:

```ts
function renderNode(node: TiptapNode, ctx: VariableContext, key?: number) {
```

to:

```ts
export function renderNode(node: TiptapNode, ctx: VariableContext, key?: number) {
```

- [ ] **Step 2: Verify build still passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: no errors related to `document-detail-view`.

- [ ] **Step 3: Commit**

```bash
git add components/features/documents/document-detail-view.tsx
git commit -m "feat(documents): export renderNode for preview panel reuse"
```

---

### Task 2: `buildClientSideContext` pure function + tests

**Files:**
- Create: `lib/documents/variables-client.ts`
- Create: `lib/documents/variables-client.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/documents/variables-client.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildClientSideContext } from "./variables-client";
import { emptyVariableContext } from "./variables";
import type { ClientRow, ProjectListRow } from "@/types";

const mockClient: ClientRow = {
  id: "c1",
  user_id: "u1",
  name: "Acme Corp",
  contact_name: "Alice",
  email: "alice@acme.com",
  company: "Acme",
  phone: null,
  address: null,
  currency: null,
  notes: null,
  health_score: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};

const mockProject: ProjectListRow = {
  id: "p1",
  user_id: "u1",
  client_id: "c1",
  title: "Website Redesign",
  status: "active",
  budget: null,
  spent: null,
  start_date: null,
  deadline: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
  client: { id: "c1", name: "Acme Corp" },
};

describe("buildClientSideContext", () => {
  it("returns null client when no clientId", () => {
    const ctx = buildClientSideContext({
      clientId: undefined,
      projectId: undefined,
      clients: [mockClient],
      projects: [mockProject],
      initialCtx: emptyVariableContext(),
    });
    expect(ctx.client).toBeNull();
  });

  it("maps client fields when clientId matches", () => {
    const ctx = buildClientSideContext({
      clientId: "c1",
      projectId: undefined,
      clients: [mockClient],
      projects: [],
      initialCtx: emptyVariableContext(),
    });
    expect(ctx.client).toEqual({
      name: "Acme Corp",
      contact_name: "Alice",
      email: "alice@acme.com",
      company: "Acme",
    });
  });

  it("returns null client when clientId not found in list", () => {
    const ctx = buildClientSideContext({
      clientId: "unknown-id",
      projectId: undefined,
      clients: [mockClient],
      projects: [],
      initialCtx: emptyVariableContext(),
    });
    expect(ctx.client).toBeNull();
  });

  it("maps project title when projectId matches", () => {
    const ctx = buildClientSideContext({
      clientId: undefined,
      projectId: "p1",
      clients: [],
      projects: [mockProject],
      initialCtx: emptyVariableContext(),
    });
    expect(ctx.project).toEqual({ title: "Website Redesign" });
  });

  it("returns null project when projectId not found in list", () => {
    const ctx = buildClientSideContext({
      clientId: undefined,
      projectId: "unknown-id",
      clients: [],
      projects: [mockProject],
      initialCtx: emptyVariableContext(),
    });
    expect(ctx.project).toBeNull();
  });

  it("preserves brand from initialCtx", () => {
    const initialCtx = {
      ...emptyVariableContext(),
      brand: {
        business_name: "My Studio",
        primary_color: "#7c3aed",
        email_signature: "Thanks,\nJane",
      },
    };
    const ctx = buildClientSideContext({
      clientId: undefined,
      projectId: undefined,
      clients: [],
      projects: [],
      initialCtx,
    });
    expect(ctx.brand).toEqual(initialCtx.brand);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- lib/documents/variables-client.test.ts 2>&1 | tail -15
```

Expected: FAIL — `Cannot find module './variables-client'`

- [ ] **Step 3: Implement `buildClientSideContext`**

Create `lib/documents/variables-client.ts`:

```ts
import type { ClientRow, ProjectListRow } from "@/types";
import type { VariableContext } from "./variables";

export function buildClientSideContext({
  clientId,
  projectId,
  clients,
  projects,
  initialCtx,
}: {
  clientId: string | undefined;
  projectId: string | undefined;
  clients: ClientRow[];
  projects: ProjectListRow[];
  initialCtx: VariableContext;
}): VariableContext {
  const client = clientId
    ? (clients.find((c) => c.id === clientId) ?? null)
    : null;

  const project = projectId
    ? (projects.find((p) => p.id === projectId) ?? null)
    : null;

  return {
    brand: initialCtx.brand,
    now: new Date(),
    client: client
      ? {
          name: client.name,
          contact_name: client.contact_name,
          email: client.email,
          company: client.company,
        }
      : null,
    project: project ? { title: project.title } : null,
  };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- lib/documents/variables-client.test.ts 2>&1 | tail -15
```

Expected: PASS — 6 tests passed.

- [ ] **Step 5: Commit**

```bash
git add lib/documents/variables-client.ts lib/documents/variables-client.test.ts
git commit -m "feat(documents): add buildClientSideContext for client-side variable resolution"
```

---

### Task 3: `useDebounce` hook

**Files:**
- Create: `hooks/use-debounce.ts`

- [ ] **Step 1: Create the hook**

Create `hooks/use-debounce.ts`:

```ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep use-debounce
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add hooks/use-debounce.ts
git commit -m "feat(hooks): add generic useDebounce hook"
```

---

### Task 4: `DocumentPreviewPanel` component

**Files:**
- Create: `components/features/documents/editor/document-preview-panel.tsx`

- [ ] **Step 1: Create the component**

Create `components/features/documents/editor/document-preview-panel.tsx`:

```tsx
"use client";

import { Fragment } from "react";

import { documentTypeLabel } from "@/lib/documents/display";
import { renderNode } from "@/components/features/documents/document-detail-view";
import type { VariableContext } from "@/lib/documents/variables";
import type { DocumentType, TiptapDoc } from "@/types";

type DocumentPreviewPanelProps = {
  title: string;
  type: DocumentType;
  content: TiptapDoc;
  variableContext: VariableContext;
};

export function DocumentPreviewPanel({
  title,
  type,
  content,
  variableContext,
}: DocumentPreviewPanelProps) {
  const issued = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="overflow-y-auto rounded-2xl border border-border/70 bg-white dark:bg-zinc-950 shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_24px_48px_-32px_rgba(15,23,42,0.18)] h-full">
      <div className="max-w-[68ch] mx-auto px-10 py-10">
        <header className="flex flex-col gap-3 pb-8 border-b border-border/70">
          <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
            <span>{documentTypeLabel(type)}</span>
            <span className="opacity-50">·</span>
            <span>{issued}</span>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {title || "Untitled"}
          </h1>
        </header>
        <div className="doc-render py-8">
          {(content.content ?? []).map((node, i) => (
            <Fragment key={i}>{renderNode(node, variableContext)}</Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep document-preview-panel
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add components/features/documents/editor/document-preview-panel.tsx
git commit -m "feat(documents): add DocumentPreviewPanel component"
```

---

### Task 5: Wire preview into `DocumentForm`

**Files:**
- Modify: `components/features/documents/document-form.tsx`

- [ ] **Step 1: Add new imports**

At the top of `components/features/documents/document-form.tsx`, add to the existing imports:

```ts
import { useMemo, useState } from "react";  // add useMemo, useState to existing react import
import { Eye, EyeOff } from "lucide-react";
import { buildClientSideContext } from "@/lib/documents/variables-client";
import { emptyVariableContext, type VariableContext } from "@/lib/documents/variables";
import { useDebounce } from "@/hooks/use-debounce";
import { DocumentPreviewPanel } from "./editor/document-preview-panel";
```

Note: `useState` and `useTransition` are already imported — add `useMemo` to that import.

- [ ] **Step 2: Add `initialVariableContext` to props type**

Change the `DocumentFormProps` intersection type:

```ts
type DocumentFormProps = (CreateProps | EditProps) & {
  clients: ClientRow[];
  projects: ProjectListRow[];
  initialVariableContext?: VariableContext;
};
```

- [ ] **Step 3: Add state and derived values inside the component**

Inside `DocumentForm`, after the existing `watch` calls, add:

```ts
const [showPreview, setShowPreview] = useState(false);
const debouncedContent = useDebounce(watchedContent, 500);

const liveVariableContext = useMemo(
  () =>
    buildClientSideContext({
      clientId: watchedClient || undefined,
      projectId: watchedProject || undefined,
      clients: props.clients,
      projects: props.projects,
      initialCtx: props.initialVariableContext ?? emptyVariableContext(),
    }),
  [watchedClient, watchedProject, props.clients, props.projects, props.initialVariableContext],
);
```

- [ ] **Step 4: Update the grid `div` className**

Find the `<div className="grid gap-6 lg:grid-cols-[1fr_320px]">` and replace with:

```tsx
<div
  className={cn(
    "grid gap-6",
    showPreview
      ? "lg:grid-cols-[1fr_minmax(0,480px)]"
      : "lg:grid-cols-[1fr_320px]",
  )}
>
```

- [ ] **Step 5: Add preview panel in place of sidebar when toggled**

After the `{/* Editor */}` div, replace the `<aside>` block with:

```tsx
{showPreview ? (
  <DocumentPreviewPanel
    title={watch("title")}
    type={watchedType}
    content={
      (debouncedContent as TiptapDoc) ?? props.defaultValues.content_json
    }
    variableContext={liveVariableContext}
  />
) : (
  <aside className="flex flex-col gap-4">
    {/* ... existing aside content unchanged ... */}
  </aside>
)}
```

Keep the existing `<aside>` content (Properties card + About variables card) inside the else branch — do not modify it.

- [ ] **Step 6: Add toggle button to the sticky footer**

Inside the sticky footer `<div className="rounded-full ...">`, add the toggle button before the Cancel button:

```tsx
<Button
  type="button"
  variant="ghost"
  size="icon"
  className="size-9"
  onClick={() => setShowPreview((v) => !v)}
  title={showPreview ? "Hide preview" : "Show preview"}
>
  {showPreview ? (
    <EyeOff className="size-4" />
  ) : (
    <Eye className="size-4" />
  )}
</Button>
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep document-form
```

Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add components/features/documents/document-form.tsx
git commit -m "feat(documents): add live preview toggle to DocumentForm"
```

---

### Task 6: Pass `initialVariableContext` from edit page

**Files:**
- Modify: `app/(app)/documents/[id]/edit/page.tsx`

- [ ] **Step 1: Import and call `buildVariableContext`**

Add import at top of `app/(app)/documents/[id]/edit/page.tsx`:

```ts
import { buildVariableContext } from "@/lib/documents/variables-server";
```

In the `EditDocumentPage` component body, after the existing `Promise.all`, add:

```ts
const variableContext = await buildVariableContext({
  clientId: document.client_id,
  projectId: document.project_id,
});
```

- [ ] **Step 2: Pass prop to `DocumentForm`**

Add `initialVariableContext={variableContext}` to the `<DocumentForm>` JSX:

```tsx
<DocumentForm
  mode="edit"
  documentId={document.id}
  defaultValues={documentToFormValues(document)}
  clients={clients}
  projects={projects}
  initialVariableContext={variableContext}
/>
```

- [ ] **Step 3: Verify full build**

```bash
npm run build 2>&1 | tail -30
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/documents/\[id\]/edit/page.tsx
git commit -m "feat(documents): pass initialVariableContext to DocumentForm from edit page"
```

---

### Task 7: Smoke test + merge

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open a document in edit mode**

Navigate to `/documents`, open any existing document, click Edit.

- [ ] **Step 3: Verify toggle works**

Click the `Eye` icon in the bottom action bar. The right sidebar should be replaced by the preview panel showing the document title and body with variables resolved.

- [ ] **Step 4: Verify live update**

Type in the editor. After ~500ms the preview panel should update to reflect changes.

- [ ] **Step 5: Verify variable resolution**

Select a client from the Properties tab... wait, properties are hidden when preview is on. Select a client BEFORE enabling preview. Then toggle preview — `{{client_name}}` should resolve to the client's name.

- [ ] **Step 6: Verify toggle OFF restores sidebar**

Click `EyeOff` button. Properties sidebar should return.

- [ ] **Step 7: Run all tests**

```bash
npm test 2>&1 | tail -20
```

Expected: All tests pass including the 6 new `variables-client` tests.

- [ ] **Step 8: Open PR**

```bash
git push -u origin feat/document-live-preview
gh pr create --title "feat(documents): live preview panel in document editor" --body "$(cat <<'EOF'
## Summary
- Toggle Eye/EyeOff button in editor footer shows/hides live preview panel
- Preview replaces right sidebar (480px) with paper-styled rendered document
- Variables resolve client-side using already-loaded clients/projects data
- Content debounced 500ms to prevent flicker on keystroke

## Test plan
- [ ] Open a document in edit mode
- [ ] Click Eye icon — preview panel appears with rendered content
- [ ] Type in editor — preview updates after ~500ms
- [ ] Select client before toggling preview — `{{client_name}}` resolves
- [ ] Click EyeOff — Properties sidebar returns
- [ ] `npm test` passes

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
