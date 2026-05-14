# Global CRUD Toast Notifications — Design Spec

**Date:** 2026-05-18
**Status:** Approved

---

## Problem

All CRUD mutations across the app give users no feedback outside the form/dialog they're in. On success, the UI refreshes silently. On error, some components show inline text but the pattern is inconsistent. The email send flows already use sonner toasts (added in previous session) — this spec extends that to every mutation in the app.

## Goal

Every create/update/delete action shows a bottom-right sonner toast. Timer actions (start/stop/pause/resume) are silent on success and only toast on error — the running timer UI already gives sufficient visual feedback.

---

## Approach

**Direct inline calls** — add `toast.success()` / `toast.error()` in each component's existing `if (result.ok)` / error handler blocks. No new abstractions. Matches the pattern already used in `send-invoice-button.tsx` and `send-quote-button.tsx`.

Sonner is already installed. `<Toaster position="bottom-right" richColors />` is already in `app/layout.tsx`.

---

## Toast Messages

### Clients
| Action | Success | Error |
|---|---|---|
| Create | "Client created" | `result.error ?? "Failed to create client"` |
| Update | "Client updated" | `result.error ?? "Failed to update client"` |
| Delete | "Client deleted" | `result.error ?? "Failed to delete client"` |

### Projects
| Action | Success | Error |
|---|---|---|
| Create | "Project created" | `result.error ?? "Failed to create project"` |
| Update | "Project updated" | `result.error ?? "Failed to update project"` |
| Delete | "Project deleted" | `result.error ?? "Failed to delete project"` |

### Tasks
| Action | Success | Error |
|---|---|---|
| Create | "Task added" | `result.error ?? "Failed to add task"` |
| Update (toggle done) | *(silent — checkbox feedback is sufficient)* | `result.error ?? "Failed to update task"` |
| Delete | "Task deleted" | `result.error ?? "Failed to delete task"` |

### Time Tracker *(error-only)*
| Action | Success | Error |
|---|---|---|
| Start timer | silent | `result.error ?? "Failed to start timer"` |
| Stop timer | silent | `result.error ?? "Failed to stop timer"` |
| Pause timer | silent | `result.error ?? "Failed to pause timer"` |
| Resume timer | silent | `result.error ?? "Failed to resume timer"` |
| Manual entry | "Time entry logged" | `result.error ?? "Failed to log time entry"` |
| Update description | silent | `result.error ?? "Failed to save description"` |

### Documents
| Action | Success | Error |
|---|---|---|
| Mark invoice paid | "Invoice marked as paid" | `result.error ?? "Failed to mark as paid"` |
| Convert quote to invoice | "Converted to invoice" | `result.error ?? "Failed to convert quote"` |

### Settings — Brand Kit
| Action | Success | Error |
|---|---|---|
| Save brand kit | "Brand kit saved" | `result.error ?? "Failed to save brand kit"` |

### Settings — Profile
| Action | Success | Error |
|---|---|---|
| Save profile | "Profile updated" | `result.error ?? "Failed to update profile"` |

---

## Files to Modify

| File | Actions touched |
|---|---|
| `components/features/clients/client-form.tsx` | createClient, updateClient |
| `components/features/clients/delete-client-button.tsx` | deleteClient |
| `components/features/projects/project-form.tsx` | createProject, updateProject |
| `components/features/projects/projects-table.tsx` | deleteProject |
| `components/features/projects/project-tasks-panel.tsx` | createTask, updateTask, deleteTask |
| `components/features/time/time-tracker.tsx` | startTimer, stopTimer, pauseTimer, resumeTimer, createManualTimeEntry, updateRunningTimerDescription |
| `components/features/documents/mark-paid-button.tsx` | markInvoicePaid |
| `components/features/documents/quote-approval-status.tsx` | convertQuoteToInvoice |
| `components/features/settings/brand-kit-form.tsx` *(or settings equivalent)* | saveBrandKit |
| `components/features/settings/profile-form.tsx` *(or settings equivalent)* | updateProfile |

> Note: Brand kit and profile have onboarding versions (`components/onboarding/`) and settings versions. Only the settings versions get toasts — onboarding flows already navigate away on success so toast would be invisible.

---

## Error Handling

Existing `serverError` inline display stays in place for form-level errors (validation, field errors). Toasts add a second layer of feedback for mutations that succeed or fail without form-level context (e.g. delete, mark paid, convert).

For components that currently only show inline errors and no success state, toasts replace the "silent refresh" pattern for success.

---

## Out of Scope

- `saveAsTemplate` / `deleteTemplate` — document editor flow, low user visibility, deferred
- `generateInvoiceNumber` / `generateQuoteNumber` — internal, no user-facing toast needed
- `upsertLineItem` / `deleteLineItem` / `reorderLineItems` / `updateInvoiceMeta` — line item changes in invoice/quote editor are immediate and visually confirmed in the table; toasts would fire too frequently
- Onboarding forms — navigate away on success, toast would be invisible
