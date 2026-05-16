"use server";

import { unstable_cache } from "next/cache";
import { format, parseISO } from "date-fns";

import { type createClient } from "@/lib/supabase/server";
import { getServerContext } from "@/lib/supabase/get-server-context";
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
  const { data: docs, error } = await supabase
    .from("documents")
    .select(
      "id, paid_at, sent_at, discount_value, discount_type, line_items(quantity, unit_price, tax_rate)"
    )
    .eq("user_id", userId)
    .eq("type", "invoice")
    .eq("status", "paid")
    .gte("paid_at", from.toISOString())
    .lte("paid_at", to.toISOString());

  if (error) console.error("[finance-queries] fetch error:", error.message);
  return docs ?? [];
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
  const docs = await fetchPaidInvoicesWithLineItems(supabase, userId, from, to);
  return docs.reduce((total, doc) => {
    const items = (doc.line_items ?? []) as { quantity: number | string; unit_price: number | string; tax_rate: number | string | null }[];
    const subtotal = calcLineItemsTotal(items);
    const tax = calcTaxTotal(items);
    const net = applyDiscount(subtotal, coerceDiscountType(doc.discount_type), doc.discount_value ?? 0) + tax;
    return total + net;
  }, 0);
}

// ---------------------------------------------------------------------------
// getFinancialSummary
// ---------------------------------------------------------------------------
const _cachedGetFinancialSummary = unstable_cache(
  async (userId: string, fromIso: string, toIso: string): Promise<FinancialSummary> => {
    const { supabase } = await getServerContext();
    const from = new Date(fromIso);
    const to = new Date(toIso);
    const range = { from, to };
    const prev = previousPeriodRange(range);
    const now = new Date();

    const [
      paidDocs,
      prevRevenue,
      outstandingDocs,
    ] = await Promise.all([
      fetchPaidInvoicesWithLineItems(supabase, userId, from, to),
      computeRangeRevenue(supabase, userId, prev.from, prev.to),
      supabase
        .from("documents")
        .select("id, due_date, discount_value, discount_type, line_items(quantity, unit_price, tax_rate)")
        .eq("user_id", userId)
        .eq("type", "invoice")
        .in("status", ["sent", "viewed"]),
    ]);

    const totalRevenue = paidDocs.reduce((sum, doc) => {
      const items = (doc.line_items ?? []) as { quantity: number | string; unit_price: number | string; tax_rate: number | string | null }[];
      const subtotal = calcLineItemsTotal(items);
      const tax = calcTaxTotal(items);
      const net = applyDiscount(subtotal, coerceDiscountType(doc.discount_type), doc.discount_value ?? 0) + tax;
      return sum + net;
    }, 0);

    let outstanding = 0;
    let outstandingCount = 0;
    let overdue = 0;
    let overdueCount = 0;

    for (const doc of outstandingDocs.data ?? []) {
      const items = (doc.line_items ?? []) as { quantity: number | string; unit_price: number | string; tax_rate: number | string | null }[];
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
  },
  ["finance-summary"],
  { revalidate: 60, tags: ["finance", "dashboard"] }
);

export async function getFinancialSummary(
  range: DateRange
): Promise<FinancialSummary> {
  const { user } = await getServerContext();
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
  return _cachedGetFinancialSummary(user.id, range.from.toISOString(), range.to.toISOString());
}

// ---------------------------------------------------------------------------
// getMonthlyRevenue
// ---------------------------------------------------------------------------
const _cachedGetMonthlyRevenue = unstable_cache(
  async (userId: string, fromIso: string, toIso: string): Promise<MonthlyRevenuePoint[]> => {
    const { supabase } = await getServerContext();
    const from = new Date(fromIso);
    const to = new Date(toIso);

    const docs = await fetchPaidInvoicesWithLineItems(supabase, userId, from, to);

    const byMonth = new Map<string, number>();
    const currentMonthKey = format(new Date(), "yyyy-MM");

    for (const doc of docs) {
      if (!doc.paid_at) continue;
      const monthKey = format(parseISO(doc.paid_at), "yyyy-MM");
      const items = (doc.line_items ?? []) as { quantity: number | string; unit_price: number | string; tax_rate: number | string | null }[];
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
  },
  ["finance-monthly"],
  { revalidate: 60, tags: ["finance"] }
);

export async function getMonthlyRevenue(
  range: DateRange
): Promise<MonthlyRevenuePoint[]> {
  const { user } = await getServerContext();
  if (!user) return [];
  return _cachedGetMonthlyRevenue(user.id, range.from.toISOString(), range.to.toISOString());
}

// ---------------------------------------------------------------------------
// listFinanceInvoices — returns invoices with pre-computed totals (avoids N+1)
// ---------------------------------------------------------------------------
const _cachedListFinanceInvoices = unstable_cache(
  async (userId: string, fromIso: string, toIso: string): Promise<(DocumentListRow & { computedTotal: number })[]> => {
    const { supabase } = await getServerContext();
    const from = new Date(fromIso);
    const to = new Date(toIso);

    const { data: docs } = await supabase
      .from("documents")
      .select("*, clients:client_id(id, name), projects:project_id(id, title), line_items(quantity, unit_price, tax_rate)")
      .eq("user_id", userId)
      .eq("type", "invoice")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString())
      .order("created_at", { ascending: false })
      .limit(20);

    if (!docs || docs.length === 0) return [];

    return docs.map((row) => {
      const normalized = normalizeDocumentListRow(row);
      const items = (row.line_items ?? []) as { quantity: number | string; unit_price: number | string; tax_rate: number | string | null }[];
      const subtotal = calcLineItemsTotal(items);
      const tax = calcTaxTotal(items);
      const computedTotal = applyDiscount(subtotal, coerceDiscountType(row.discount_type), row.discount_value ?? 0) + tax;
      return { ...normalized, computedTotal };
    });
  },
  ["finance-invoices"],
  { revalidate: 60, tags: ["finance"] }
);

export async function listFinanceInvoices(
  range: DateRange
): Promise<(DocumentListRow & { computedTotal: number })[]> {
  const { user } = await getServerContext();
  if (!user) return [];
  return _cachedListFinanceInvoices(user.id, range.from.toISOString(), range.to.toISOString());
}
