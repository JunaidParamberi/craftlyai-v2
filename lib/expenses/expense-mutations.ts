"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { normalizeExpenseRow } from "@/lib/expenses/normalize-expense-row";
import { extFromReceiptMime, extractReceiptStoragePath } from "@/lib/expenses/utils";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import {
  EXPENSE_RECEIPT_ALLOWED_MIME,
  EXPENSE_RECEIPT_MAX_BYTES,
  parseExpenseCreateInput,
  parseExpenseUpdateInput,
} from "@/lib/validations/expense";
import type { ExpenseRow } from "@/types";

const uuidSchema = z.string().uuid();
const RECEIPT_BUCKET = "expense-receipts";

type MutationError = {
  ok: false;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type CreateExpenseResult =
  | { ok: true; expense: ExpenseRow }
  | MutationError;

export type UpdateExpenseResult =
  | { ok: true; expense: ExpenseRow }
  | MutationError;

export type DeleteExpenseResult =
  | { ok: true }
  | { ok: false; message: string };

export type ReceiptMutationResult =
  | { ok: true; expense: ExpenseRow }
  | { ok: false; message: string };

function revalidateExpensePaths(projectId: string | null) {
  revalidatePath("/expenses");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
}

async function removeReceiptFromStorage(
  supabase: Awaited<ReturnType<typeof createSupabaseClient>>,
  receiptUrl: string | null,
) {
  if (!receiptUrl) return;
  const path = extractReceiptStoragePath(receiptUrl);
  if (!path) return;
  await supabase.storage.from(RECEIPT_BUCKET).remove([path]);
}

export async function createExpense(
  input: unknown,
): Promise<CreateExpenseResult> {
  const parsed = parseExpenseCreateInput(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      message: "Validation failed.",
      fieldErrors: flat.fieldErrors as Record<string, string[] | undefined>,
    };
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const payload = {
    user_id: user.id,
    project_id: parsed.data.project_id,
    category: parsed.data.category,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    date: parsed.data.date,
    vendor: parsed.data.vendor,
    notes: parsed.data.notes,
  };

  const { data, error } = await supabase
    .from("expenses")
    .insert(payload)
    .select("*")
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "Expense could not be created." };
  }

  revalidateExpensePaths(parsed.data.project_id);

  return { ok: true, expense: normalizeExpenseRow(data) };
}

export async function updateExpense(
  input: unknown,
): Promise<UpdateExpenseResult> {
  const parsed = parseExpenseUpdateInput(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      message: "Validation failed.",
      fieldErrors: flat.fieldErrors as Record<string, string[] | undefined>,
    };
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const existing = await supabase
    .from("expenses")
    .select("project_id")
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing.error || !existing.data) {
    return { ok: false, message: "Expense not found." };
  }

  const payload = {
    project_id: parsed.data.project_id,
    category: parsed.data.category,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    date: parsed.data.date,
    vendor: parsed.data.vendor,
    notes: parsed.data.notes,
  };

  const { data, error } = await supabase
    .from("expenses")
    .update(payload)
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "Expense could not be updated." };
  }

  revalidateExpensePaths(existing.data.project_id);
  if (parsed.data.project_id !== existing.data.project_id) {
    revalidateExpensePaths(parsed.data.project_id);
  }

  return { ok: true, expense: normalizeExpenseRow(data) };
}

export async function deleteExpense(id: string): Promise<DeleteExpenseResult> {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, message: "Invalid expense." };
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const existing = await supabase
    .from("expenses")
    .select("receipt_url, project_id")
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing.error || !existing.data) {
    return { ok: false, message: "Expense not found." };
  }

  const { count, error } = await supabase
    .from("expenses")
    .delete({ count: "exact" })
    .eq("id", parsedId.data)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  if (count === 0) {
    return { ok: false, message: "Expense could not be deleted." };
  }

  await removeReceiptFromStorage(supabase, existing.data.receipt_url);
  revalidateExpensePaths(existing.data.project_id);

  return { ok: true };
}

export async function uploadExpenseReceipt(
  expenseId: string,
  formData: FormData,
): Promise<ReceiptMutationResult> {
  const parsedId = uuidSchema.safeParse(expenseId);
  if (!parsedId.success) {
    return { ok: false, message: "Invalid expense." };
  }

  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a receipt file to upload." };
  }

  if (!EXPENSE_RECEIPT_ALLOWED_MIME.some((m) => m === file.type)) {
    return {
      ok: false,
      message: "Receipt must be PNG, JPEG, WebP, or PDF.",
    };
  }

  if (file.size > EXPENSE_RECEIPT_MAX_BYTES) {
    return { ok: false, message: "Receipt must be 5 MB or smaller." };
  }

  const ext = extFromReceiptMime(file.type);
  if (!ext) {
    return { ok: false, message: "Unsupported file type." };
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const existing = await supabase
    .from("expenses")
    .select("*")
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing.error || !existing.data) {
    return { ok: false, message: "Expense not found." };
  }

  const path = `${user.id}/${parsedId.data}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return { ok: false, message: uploadError.message };
  }

  const { data: pub } = supabase.storage.from(RECEIPT_BUCKET).getPublicUrl(path);
  const newUrl = pub.publicUrl;

  if (existing.data.receipt_url && existing.data.receipt_url !== newUrl) {
    await removeReceiptFromStorage(supabase, existing.data.receipt_url);
  }

  const { data, error } = await supabase
    .from("expenses")
    .update({ receipt_url: newUrl })
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return { ok: false, message: error?.message ?? "Could not save receipt." };
  }

  revalidateExpensePaths(data.project_id);

  return { ok: true, expense: normalizeExpenseRow(data) };
}

export async function removeExpenseReceipt(
  expenseId: string,
): Promise<ReceiptMutationResult> {
  const parsedId = uuidSchema.safeParse(expenseId);
  if (!parsedId.success) {
    return { ok: false, message: "Invalid expense." };
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const existing = await supabase
    .from("expenses")
    .select("*")
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing.error || !existing.data) {
    return { ok: false, message: "Expense not found." };
  }

  await removeReceiptFromStorage(supabase, existing.data.receipt_url);

  const { data, error } = await supabase
    .from("expenses")
    .update({ receipt_url: null })
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      message: error?.message ?? "Could not remove receipt.",
    };
  }

  revalidateExpensePaths(data.project_id);

  return { ok: true, expense: normalizeExpenseRow(data) };
}
