"use client";

import { useRouter } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  emptyExpenseFormValues,
  expenseRowToFormValues,
} from "@/lib/expenses/form-values";
import {
  createExpense,
  removeExpenseReceipt,
  updateExpense,
  uploadExpenseReceipt,
} from "@/lib/expenses/expense-mutations";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_NONE_PROJECT_VALUE,
  type ExpenseCreateFormInput,
} from "@/lib/validations/expense";
import { cn } from "@/lib/utils";
import type { ExpenseListRow, ProjectListRow } from "@/types";

import { FormDatePicker } from "@/components/shared/form-date-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

const RECEIPT_ACCEPT =
  "image/png,image/jpeg,image/webp,application/pdf" as const;

type ExpenseFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  defaultCurrency: string;
  projects: ProjectListRow[];
  expense?: ExpenseListRow | null;
  lockProjectId?: string | null;
  onSuccess?: () => void;
};

function projectSelectLabel(
  value: string,
  projects: ProjectListRow[],
): string {
  if (value === EXPENSE_NONE_PROJECT_VALUE || value === "") {
    return "No project";
  }
  return projects.find((p) => p.id === value)?.title ?? "Project";
}

export function ExpenseFormSheet({
  open,
  onOpenChange,
  mode,
  defaultCurrency,
  projects,
  expense,
  lockProjectId,
  onSuccess,
}: ExpenseFormSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaults =
    mode === "edit" && expense
      ? expenseRowToFormValues(expense)
      : emptyExpenseFormValues(defaultCurrency, lockProjectId ?? undefined);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ExpenseCreateFormInput>({
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!open) return;
    const next =
      mode === "edit" && expense
        ? expenseRowToFormValues(expense)
        : emptyExpenseFormValues(defaultCurrency, lockProjectId ?? undefined);
    reset(next);
    setReceiptFile(null);
    setServerError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open, mode, expense?.id, defaultCurrency, lockProjectId, reset, expense]);

  function applyFieldErrors(
    fieldErrors: Record<string, string[] | undefined> | undefined,
  ) {
    if (!fieldErrors) return;
    (
      Object.entries(fieldErrors) as [
        keyof ExpenseCreateFormInput,
        string[] | undefined,
      ][]
    ).forEach(([key, msgs]) => {
      const msg = msgs?.[0];
      if (msg) setError(key, { message: msg });
    });
  }

  async function uploadReceiptIfNeeded(expenseId: string) {
    if (!receiptFile) return true;
    const fd = new FormData();
    fd.set("receipt", receiptFile);
    const uploaded = await uploadExpenseReceipt(expenseId, fd);
    if (!uploaded.ok) {
      toast.error(uploaded.message);
      return false;
    }
    return true;
  }

  function onSubmit(values: ExpenseCreateFormInput) {
    setServerError(null);
    clearErrors();
    startTransition(async () => {
      if (mode === "create") {
        const created = await createExpense(values);
        if (!created.ok) {
          setServerError(created.message);
          applyFieldErrors(created.fieldErrors);
          return;
        }
        const receiptOk = await uploadReceiptIfNeeded(created.expense.id);
        toast.success(
          receiptOk ? "Expense created" : "Expense saved; receipt upload failed.",
        );
        onOpenChange(false);
        onSuccess?.();
        router.refresh();
        return;
      }

      if (!expense) return;

      const updated = await updateExpense({ ...values, id: expense.id });
      if (!updated.ok) {
        setServerError(updated.message);
        applyFieldErrors(updated.fieldErrors);
        return;
      }

      const receiptOk = await uploadReceiptIfNeeded(updated.expense.id);
      toast.success(
        receiptOk ? "Expense updated" : "Expense updated; receipt upload failed.",
      );
      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    });
  }

  function handleRemoveReceipt() {
    if (!expense?.receipt_url) return;
    startTransition(async () => {
      const result = await removeExpenseReceipt(expense.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Receipt removed");
      router.refresh();
    });
  }

  function handleReceiptFile(file: File | undefined) {
    setReceiptFile(file ?? null);
  }

  const projectLocked = Boolean(lockProjectId);
  const lockedProjectTitle = lockProjectId
    ? projects.find((p) => p.id === lockProjectId)?.title
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 border-s border-border/80 p-0 shadow-2xl sm:max-w-md"
      >
        <SheetHeader className="shrink-0 border-b border-border/60 px-6 pt-6 pb-5">
          <SheetTitle className="font-heading text-xl tracking-tight">
            {mode === "create" ? "Add expense" : "Edit expense"}
          </SheetTitle>
          <SheetDescription className="text-pretty leading-relaxed">
            Track business spending and attach receipts for your records.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <form
            id="expense-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="px-6 py-6"
          >
            {serverError ? (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Could not save</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            ) : null}

            <FieldSet>
              <FieldLegend variant="label" className="sr-only">
                Expense details
              </FieldLegend>

              <FieldGroup className="gap-5">
                <Field data-invalid={errors.category ? true : undefined}>
                  <FieldLabel htmlFor="expense-category">Category</FieldLabel>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          if (v) field.onChange(v);
                        }}
                      >
                        <SelectTrigger
                          id="expense-category"
                          className="w-full min-w-0"
                          aria-invalid={errors.category ? true : undefined}
                        >
                          <span className="truncate text-start">
                            {EXPENSE_CATEGORY_LABELS[field.value] ?? "Category"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {EXPENSE_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {EXPENSE_CATEGORY_LABELS[cat]}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.category]} />
                </Field>

                <div className="grid grid-cols-[minmax(0,1fr)_5.5rem] gap-3">
                  <Field data-invalid={errors.amount ? true : undefined}>
                    <FieldLabel htmlFor="expense-amount">Amount</FieldLabel>
                    <Input
                      id="expense-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      inputMode="decimal"
                      placeholder="0.00"
                      className="tabular-nums"
                      aria-invalid={errors.amount ? true : undefined}
                      {...register("amount")}
                    />
                    <FieldError errors={[errors.amount]} />
                  </Field>
                  <Field data-invalid={errors.currency ? true : undefined}>
                    <FieldLabel htmlFor="expense-currency">Currency</FieldLabel>
                    <Input
                      id="expense-currency"
                      maxLength={3}
                      placeholder="USD"
                      className="uppercase tabular-nums"
                      aria-invalid={errors.currency ? true : undefined}
                      {...register("currency")}
                    />
                    <FieldError errors={[errors.currency]} />
                  </Field>
                </div>

                <Field data-invalid={errors.date ? true : undefined}>
                  <FieldLabel htmlFor="expense-date">Date</FieldLabel>
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                      <FormDatePicker
                        id="expense-date"
                        value={field.value}
                        onChange={field.onChange}
                        aria-invalid={errors.date ? true : undefined}
                      />
                    )}
                  />
                  <FieldError errors={[errors.date]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="expense-project">Project</FieldLabel>
                  <Controller
                    name="project_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          if (v) field.onChange(v);
                        }}
                        disabled={projectLocked}
                      >
                        <SelectTrigger
                          id="expense-project"
                          className="w-full min-w-0"
                          disabled={projectLocked}
                        >
                          <span className="truncate text-start">
                            {projectSelectLabel(field.value, projects)}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value={EXPENSE_NONE_PROJECT_VALUE}>
                              No project
                            </SelectItem>
                            {projects.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.title}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {projectLocked && lockedProjectTitle ? (
                    <FieldDescription>
                      Linked to {lockedProjectTitle} from this project.
                    </FieldDescription>
                  ) : (
                    <FieldDescription>
                      Optional — tie this expense to a client project.
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="expense-vendor">Vendor</FieldLabel>
                  <Input
                    id="expense-vendor"
                    placeholder="e.g. Adobe, Emirates"
                    autoComplete="organization"
                    {...register("vendor")}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="expense-notes">Notes</FieldLabel>
                  <Textarea
                    id="expense-notes"
                    rows={3}
                    placeholder="What was this for?"
                    className="min-h-[5rem] resize-y bg-background"
                    {...register("notes")}
                  />
                </Field>

                <FieldSeparator>Receipt</FieldSeparator>

                <Field>
                  <FieldLabel htmlFor="expense-receipt">Attachment</FieldLabel>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/25 px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      receiptFile && "border-primary/30 bg-primary/5",
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleReceiptFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {receiptFile ? (
                      <FileText
                        className="text-primary"
                        aria-hidden
                        data-icon="inline-start"
                      />
                    ) : (
                      <Upload className="text-muted-foreground" aria-hidden />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {receiptFile
                        ? receiptFile.name
                        : "Click to upload or drag and drop"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPEG, WebP, or PDF · max 5 MB
                    </span>
                    <input
                      ref={fileInputRef}
                      id="expense-receipt"
                      type="file"
                      accept={RECEIPT_ACCEPT}
                      className="sr-only"
                      onChange={(e) => {
                        handleReceiptFile(e.target.files?.[0]);
                      }}
                    />
                  </button>
                  {expense?.receipt_url ? (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        render={
                          <a
                            href={expense.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        View current receipt
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={handleRemoveReceipt}
                        disabled={isPending}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : null}
                  {!expense?.receipt_url && !receiptFile ? (
                    <FieldDescription>
                      Receipts are stored securely and linked to this expense.
                    </FieldDescription>
                  ) : null}
                </Field>
              </FieldGroup>
            </FieldSet>
          </form>
        </ScrollArea>

        <SheetFooter className="shrink-0 border-t border-border/60 bg-background/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="expense-form"
              disabled={isPending}
              className="sm:min-w-[9rem]"
            >
              {isPending
                ? "Saving…"
                : mode === "create"
                  ? "Add expense"
                  : "Save changes"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
