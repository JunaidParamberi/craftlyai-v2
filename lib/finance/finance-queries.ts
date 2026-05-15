"use server";

import { format, parseISO } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { normalizeDocumentListRow } from "@/lib/documents/normalize-document-row";
import type { DocumentListRow } from "@/types";
import type { DateRange, FinancialSummary, MonthlyRevenuePoint } from "./types";
import {
  applyDiscount,
  calcAvgPayDays,
  calcLineItemsTotal,
  calcTaxTotal,
  calcRevenueChangePct,
} from "./revenue-calc";

function coerceDiscountType(val: string | null | undefined): "percent" | "flat" {
  return val === "flat" ? "flat" : "percent";
}
import { previousPeriodRange } from "./date-utils";

// ---------------------------------------------------------------------------
// Internal: fetch paid invoices with line items for a date range
// ---------------------------------------------------------------------------
async function fetchPaidInvoicesWithLineItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  from: Date,
  to: Date
) {
  const { data: docs, error: docsError } = await supabase
    .from("documents")
    .select("id, paid_at, sent_at, discount_value, discount_type")
    .eq("user_id", userId)
    .eq("type", "invoice")
    .eq("status", "paid")
    .gte("paid_at", from.toISOString())
    .lte("paid_at", to.toISOString());

  if (docsError) {
    console.error("[finance-queries] docs fetch error:", docsError.message);
  }
  if (!docs || docs.length === 0) return { docs: [], lineItemsByDoc: new Map() };

  const ids = docs.map((d) => d.id);
  const { data: lineItems, error: lineItemsError } = await supabase
    .from("line_items")
    .select("document_id, quantity, unit_price, tax_rate")
    .in("document_id", ids);

  if (lineItemsError) {
    console.error("[finance-queries] line items fetch error:", lineItemsError.message);
  }

  const lineItemsByDoc = new Map<string, typeof lineItems>();
  for (const li of lineItems ?? []) {
    const existing = lineItemsByDoc.get(li.document_id) ?? [];
    existing.push(li);
    lineItemsByDoc.set(li.document_id, existing);
  }

  return { docs, lineItemsByDoc };
}

// ---------------------------------------------------------------------------
// Compute total revenue for a range
// ---------------------------------------------------------------------------
async function computeRangeRevenue(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const { docs, lineItemsByDoc } = await fetchPaidInvoicesWithLineItems(
    supabase,
    userId,
    from,
    to
  );
  return docs.reduce((total, doc) => {
    const items = lineItemsByDoc.get(doc.id) ?? [];
    const subtotal = calcLineItemsTotal(items);
    const tax = calcTaxTotal(items);
    const net = applyDiscount(subtotal, coerceDiscountType(doc.discount_type), doc.discount_value ?? 0) + tax;
    return total + net;
  }, 0);
}

// ---------------------------------------------------------------------------
// getFinancialSummary
// ---------------------------------------------------------------------------
export async function getFinancialSummary(
  range: DateRange
): Promise<FinancialSummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      totalRevenue: 0,
      outstanding: 0,
      overdue: 0,
      avgPayDays: null,
      revenueChangePct: null,
      overdueCount: 0,
      outstandingCount: 0,
    };
  }

  const prev = previousPeriodRange(range);
  const now = new Date();

  const [
    { docs: paidDocs, lineItemsByDoc: paidLineItems },
    prevRevenue,
    outstandingDocs,
  ] = await Promise.all([
    fetchPaidInvoicesWithLineItems(supabase, user.id, range.from, range.to),
    computeRangeRevenue(supabase, user.id, prev.from, prev.to),
    supabase
      .from("documents")
      .select("id, due_date, discount_value, discount_type")
      .eq("user_id", user.id)
      .eq("type", "invoice")
      .in("status", ["sent", "viewed"]),
  ]);

  const totalRevenue = paidDocs.reduce((sum, doc) => {
    const items = paidLineItems.get(doc.id) ?? [];
    const subtotal = calcLineItemsTotal(items);
    const tax = calcTaxTotal(items);
    const net = applyDiscount(subtotal, coerceDiscountType(doc.discount_type), doc.discount_value ?? 0) + tax;
    return sum + net;
  }, 0);

  const outstandingIds = (outstandingDocs.data ?? []).map((d) => d.id);
  const { data: outstandingLineItems } =
    outstandingIds.length > 0
      ? await supabase
          .from("line_items")
          .select("document_id, quantity, unit_price, tax_rate")
          .in("document_id", outstandingIds)
      : { data: [] };

  const liByOutstanding = new Map<string, typeof outstandingLineItems>();
  for (const li of outstandingLineItems ?? []) {
    const existing = liByOutstanding.get(li.document_id) ?? [];
    existing.push(li);
    liByOutstanding.set(li.document_id, existing);
  }

  let outstanding = 0;
  let outstandingCount = 0;
  let overdue = 0;
  let overdueCount = 0;

  for (const doc of outstandingDocs.data ?? []) {
    const items = liByOutstanding.get(doc.id) ?? [];
    const subtotal = calcLineItemsTotal(items);
    const tax = calcTaxTotal(items);
    const net = applyDiscount(subtotal, coerceDiscountType(doc.discount_type), doc.discount_value ?? 0) + tax;
    outstanding += net;
    outstandingCount++;
    if (doc.due_date && parseISO(doc.due_date) < now) {
      overdue += net;
      overdueCount++;
    }
  }

  const avgPayDays = calcAvgPayDays(
    paidDocs.map((d) => ({ sent_at: d.sent_at, paid_at: d.paid_at }))
  );

  return {
    totalRevenue,
    outstanding,
    overdue,
    avgPayDays,
    revenueChangePct: calcRevenueChangePct(totalRevenue, prevRevenue),
    overdueCount,
    outstandingCount,
  };
}

// ---------------------------------------------------------------------------
// getMonthlyRevenue
// ---------------------------------------------------------------------------
export async function getMonthlyRevenue(
  range: DateRange
): Promise<MonthlyRevenuePoint[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { docs, lineItemsByDoc } = await fetchPaidInvoicesWithLineItems(
    supabase,
    user.id,
    range.from,
    range.to
  );

  const byMonth = new Map<string, number>();
  const currentMonthKey = format(new Date(), "yyyy-MM");

  for (const doc of docs) {
    if (!doc.paid_at) continue;
    const monthKey = format(parseISO(doc.paid_at), "yyyy-MM");
    const items = lineItemsByDoc.get(doc.id) ?? [];
    const subtotal = calcLineItemsTotal(items);
    const tax = calcTaxTotal(items);
    const net = applyDiscount(subtotal, coerceDiscountType(doc.discount_type), doc.discount_value ?? 0) + tax;
    byMonth.set(monthKey, (byMonth.get(monthKey) ?? 0) + net);
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, revenue]) => ({
      monthKey,
      month: format(parseISO(`${monthKey}-01`), "MMM yyyy"),
      revenue,
      isCurrent: monthKey === currentMonthKey,
    }));
}

// ---------------------------------------------------------------------------
// listFinanceInvoices — returns invoices with pre-computed totals (avoids N+1)
// ---------------------------------------------------------------------------
export async function listFinanceInvoices(
  range: DateRange
): Promise<(DocumentListRow & { computedTotal: number })[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: docs } = await supabase
    .from("documents")
    .select("*, clients:client_id(id, name), projects:project_id(id, title)")
    .eq("user_id", user.id)
    .eq("type", "invoice")
    .gte("created_at", range.from.toISOString())
    .lte("created_at", range.to.toISOString())
    .order("created_at", { ascending: false })
    .limit(20);

  if (!docs || docs.length === 0) return [];

  const ids = docs.map((d) => d.id);
  const { data: lineItems } = await supabase
    .from("line_items")
    .select("document_id, quantity, unit_price, tax_rate")
    .in("document_id", ids);

  const liByDoc = new Map<string, typeof lineItems>();
  for (const li of lineItems ?? []) {
    const existing = liByDoc.get(li.document_id) ?? [];
    existing.push(li);
    liByDoc.set(li.document_id, existing);
  }

  return docs.map((row) => {
    const normalized = normalizeDocumentListRow(row);
    const items = liByDoc.get(row.id) ?? [];
    const subtotal = calcLineItemsTotal(items);
    const tax = calcTaxTotal(items);
    const computedTotal = applyDiscount(subtotal, coerceDiscountType(row.discount_type), row.discount_value ?? 0) + tax;
    return { ...normalized, computedTotal };
  });
}
