# Document Studio — Live Preview Panel

**Date:** 2026-05-14
**Status:** Approved
**Scope:** `DocumentForm` (edit mode) — user-toggled right-side preview panel

---

## Problem

The document editor has no way to see how the rendered document will look without navigating away to the detail view. Variables like `{{client_name}}` show as raw tokens in the editor. Users must save and exit to verify output.

## Goal

Add a toggle-able live preview panel to the right side of the document editor that shows the fully rendered document — with variables resolved — as the user types.

---

## Layout

**Preview OFF (default):**
```
[ Editor (flex-1) ] [ Sidebar 320px ]
```
Grid: `lg:grid-cols-[1fr_320px]` — unchanged from current.

**Preview ON:**
```
[ Editor (flex-1) ] [ Preview Panel ~480px ]
```
Grid: `lg:grid-cols-[1fr_minmax(0,480px)]` — sidebar hidden, preview panel shown.

On mobile (`< lg`): no change. Sidebar and preview stack below editor in normal flow.

**Toggle button:** `Eye` / `EyeOff` icon button in the sticky bottom action bar (next to Cancel / Save). Always visible while editing.

---

## Variable Resolution

Variables resolve client-side with zero API calls — all data already in props.

**Strategy:**
1. Edit page server component calls `buildVariableContext({ clientId, projectId })` at render time → passes result as `initialVariableContext: VariableContext` prop to `DocumentForm`.
2. `DocumentForm` derives live context via `useMemo` on every `client_id` / `project_id` change:
   - `brand` + `now` → static from `initialVariableContext` (unchanged during session)
   - `client` → find `client_id` in `clients` prop array, map `{ name, contact_name, email, company }`
   - `project` → find `project_id` in `projects` prop array, map `{ title }`
3. `content_json` is debounced 500ms before being fed to the preview to avoid per-keystroke flicker.

---

## Components

### New: `DocumentPreviewPanel`

**File:** `components/features/documents/editor/document-preview-panel.tsx`

Props:
```ts
type DocumentPreviewPanelProps = {
  title: string;
  type: DocumentType;
  content: TiptapDoc;
  variableContext: VariableContext;
};
```

Renders:
- Outer: `overflow-y-auto h-full` scrollable container with paper styling (`bg-white dark:bg-zinc-950`, shadow, rounded-2xl, border)
- Inner: `max-w-[68ch] mx-auto px-10 py-10` — same proportions as `DocumentDetailView`
- Header: document title (`font-heading text-2xl`) + type badge
- Body: reuses `renderNode` logic from `DocumentDetailView` (or extracts into shared util) with live `VariableContext`
- Content is the debounced `content_json` value

### Modified: `DocumentForm`

**File:** `components/features/documents/document-form.tsx`

Changes:
- New prop: `initialVariableContext: VariableContext`
- New state: `const [showPreview, setShowPreview] = useState(false)`
- `useMemo` to derive live `VariableContext` from `watchedClient`, `watchedProject`, `clients`, `projects`, `initialVariableContext.brand`
- `useDebounce` (500ms) on `watchedContent` for preview
- Grid class switches on `showPreview`
- When `showPreview`: render `<DocumentPreviewPanel>` instead of `<aside>` sidebar
- Toggle button added to sticky footer bar

### Modified: `app/(app)/documents/[id]/edit/page.tsx`

Changes:
- Call `buildVariableContext({ clientId: document.client_id, projectId: document.project_id })`
- Pass result as `initialVariableContext` to `DocumentForm`

---

## What is NOT in scope

- Preview on the `/documents/new` (template picker) page — no `DocumentForm` there
- PDF preview — HTML render only; PDF generation stays as download-only
- Auto-open preview — always starts closed, user must toggle
- Mobile split layout — single column on mobile, no change

---

## Files Changed

| File | Change |
|---|---|
| `components/features/documents/editor/document-preview-panel.tsx` | New |
| `components/features/documents/document-form.tsx` | Add toggle, grid switch, variable context |
| `app/(app)/documents/[id]/edit/page.tsx` | Build + pass `initialVariableContext` |
