"use server";

import { unstable_cache } from "next/cache";
import {
  addDays,
  differenceInCalendarDays,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";

import {
  applyDiscount,
  calcLineItemsTotal,
  calcTaxTotal,
} from "@/lib/finance/revenue-calc";
import { getServerContext } from "@/lib/supabase/get-server-context";
import { formatCurrency } from "@/lib/utils/format";
import { projectStatusLabel } from "@/lib/projects/display";
import type { ProjectStatus } from "@/types";

import {
  deduplicateAttentionItems,
  formatPipelineDaysLabel,
  classifyProjectRisk,
  parseDeadlineDate,
  sortAttentionItems,
} from "./attention-utils";
import {
  extractDocumentEvents,
  extractProjectEvents,
  mergeAndSortEvents,
  type DocumentActivitySource,
} from "./activity-utils";
import type {
  ActivePipelineResult,
  ActivityEvent,
  AttentionItem,
  DashboardCounts,
} from "./types";

const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = [
  "planning",
  "active",
  "on_hold",
];

const DEADLINE_ATTENTION_STATUSES: ProjectStatus[] = ["planning", "active"];

function coerceDiscountType(val: string | null | undefined): "percent" | "flat" {
  return val === "flat" ? "flat" : "percent";
}

function computeDocTotal(
  items: { quantity: number | string; unit_price: number | string; tax_rate?: number | string | null }[],
  discountType: string | null | undefined,
  discountValue: number | null | undefined
): number {
  const subtotal = calcLineItemsTotal(items);
  const tax = calcTaxTotal(items);
  return (
    applyDiscount(
      subtotal,
      coerceDiscountType(discountType),
      discountValue ?? 0
    ) + tax
  );
}


function clientNameFromJoin(
  client: { name: string } | { name: string }[] | null | undefined
): string | null {
  if (!client) return null;
  if (Array.isArray(client)) return client[0]?.name ?? null;
  return client.name;
}

// ---------------------------------------------------------------------------
// getDashboardCounts
// ---------------------------------------------------------------------------
const _cachedGetDashboardCounts = unstable_cache(
  async (userId: string): Promise<DashboardCounts> => {
    const { supabase } = await getServerContext();

    const now = new Date();
    const inSevenDays = addDays(now, 7).toISOString().slice(0, 10);

    const { data: projects } = await supabase
      .from("projects")
      .select("id, deadline, status")
      .eq("user_id", userId)
      .in("status", ACTIVE_PROJECT_STATUSES);

    const rows = projects ?? [];
    const nearingDeadlineCount = rows.filter((p) => {
      if (!p.deadline) return false;
      const d = parseISO(`${p.deadline}T12:00:00.000Z`);
      return d >= startOfDay(now) && p.deadline <= inSevenDays;
    }).length;

    return {
      activeProjectsCount: rows.length,
      nearingDeadlineCount,
    };
  },
  ["dashboard-counts"],
  { revalidate: 60, tags: ["dashboard"] }
);

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const { user } = await getServerContext();
  if (!user) return { activeProjectsCount: 0, nearingDeadlineCount: 0 };
  return _cachedGetDashboardCounts(user.id);
}

// ---------------------------------------------------------------------------
// getAttentionItems
// ---------------------------------------------------------------------------
const _cachedGetAttentionItems = unstable_cache(
  async (userId: string): Promise<AttentionItem[]> => {
    const { supabase } = await getServerContext();

    const now = new Date();
    const today = startOfDay(now);
    const inThreeDays = addDays(now, 3).toISOString().slice(0, 10);
    const inSevenDays = addDays(now, 7).toISOString().slice(0, 10);
    const sevenDaysAgo = subDays(now, 7).toISOString();
    const todayStr = now.toISOString().slice(0, 10);

    const [invoicesRes, quotesRes, projectsRes] = await Promise.all([
      supabase
        .from("documents")
        .select(
          "id, invoice_number, due_date, discount_value, discount_type, clients:client_id(name), line_items(quantity, unit_price, tax_rate)"
        )
        .eq("user_id", userId)
        .eq("type", "invoice")
        .in("status", ["sent", "viewed"])
        .not("due_date", "is", null)
        .lt("due_date", todayStr),
      supabase
        .from("documents")
        .select(
          "id, quote_number, valid_until, sent_at, discount_value, discount_type, clients:client_id(name), line_items(quantity, unit_price, tax_rate)"
        )
        .eq("user_id", userId)
        .eq("type", "quote")
        .eq("status", "sent"),
      supabase
        .from("projects")
        .select("id, title, deadline, status, clients:client_id(name)")
        .eq("user_id", userId)
        .in("status", DEADLINE_ATTENTION_STATUSES)
        .not("deadline", "is", null)
        .gte("deadline", todayStr)
        .lte("deadline", inSevenDays),
    ]);

    const items: AttentionItem[] = [];

    for (const doc of invoicesRes.data ?? []) {
      const due = parseISO(`${doc.due_date}T12:00:00.000Z`);
      const daysOverdue = differenceInCalendarDays(today, startOfDay(due));
      const itemsLi = (doc.line_items ?? []) as { quantity: number | string; unit_price: number | string; tax_rate: number | string | null }[];
      const amount = computeDocTotal(
        itemsLi,
        doc.discount_type,
        doc.discount_value
      );
      const client = clientNameFromJoin(doc.clients) ?? "Client";
      const number = doc.invoice_number ?? "—";
      items.push({
        type: "overdue_invoice",
        id: doc.id,
        href: `/documents/${doc.id}`,
        label: `Invoice #${number} · ${client} · ${formatCurrency(amount)} · ${daysOverdue} days overdue`,
        urgencyDays: daysOverdue,
      });
    }

    for (const doc of quotesRes.data ?? []) {
      const client = clientNameFromJoin(doc.clients) ?? "Client";
      const number = doc.quote_number ?? "—";
      const validUntil = doc.valid_until;

      if (
        validUntil &&
        validUntil >= todayStr &&
        validUntil <= inThreeDays
      ) {
        const expires = parseISO(`${validUntil}T12:00:00.000Z`);
        const daysLeft = differenceInCalendarDays(startOfDay(expires), today);
        items.push({
          type: "expiring_quote",
          id: doc.id,
          href: `/documents/${doc.id}`,
          label: `Quote #${number} · ${client} · expires in ${daysLeft} days`,
          urgencyDays: daysLeft,
        });
        continue;
      }

      if (
        doc.sent_at &&
        doc.sent_at < sevenDaysAgo &&
        validUntil &&
        validUntil > todayStr
      ) {
        const sent = parseISO(doc.sent_at);
        const daysSince = differenceInCalendarDays(today, startOfDay(sent));
        items.push({
          type: "quote_no_response",
          id: doc.id,
          href: `/documents/${doc.id}`,
          label: `Quote #${number} · ${client} · no response in ${daysSince} days`,
          urgencyDays: daysSince,
        });
      }
    }

    for (const project of projectsRes.data ?? []) {
      if (!project.deadline) continue;
      const deadline = parseISO(`${project.deadline}T12:00:00.000Z`);
      const daysLeft = differenceInCalendarDays(startOfDay(deadline), today);
      const client = clientNameFromJoin(project.clients) ?? "Client";
      items.push({
        type: "project_deadline",
        id: project.id,
        href: `/projects/${project.id}`,
        label: `${project.title} · ${client} · due in ${daysLeft} days`,
        urgencyDays: daysLeft,
      });
    }

    return sortAttentionItems(deduplicateAttentionItems(items));
  },
  ["dashboard-attention"],
  { revalidate: 60, tags: ["dashboard"] }
);

export async function getAttentionItems(): Promise<AttentionItem[]> {
  const { user } = await getServerContext();
  if (!user) return [];
  return _cachedGetAttentionItems(user.id);
}

// ---------------------------------------------------------------------------
// getRecentActivity
// ---------------------------------------------------------------------------
const _cachedGetRecentActivity = unstable_cache(
  async (userId: string): Promise<ActivityEvent[]> => {
    const { supabase } = await getServerContext();

    const since = subDays(new Date(), 30).toISOString();

    const [docsRes, projectsRes] = await Promise.all([
      supabase
        .from("documents")
        .select(
          "id, type, status, sent_at, paid_at, approved_at, declined_at, invoice_number, quote_number, title, updated_at, discount_value, discount_type, clients:client_id(name), line_items(quantity, unit_price, tax_rate)"
        )
        .eq("user_id", userId)
        .gte("updated_at", since)
        .order("updated_at", { ascending: false })
        .limit(30),
      supabase
        .from("projects")
        .select("id, title, status, updated_at, clients:client_id(name)")
        .eq("user_id", userId)
        .gte("updated_at", since)
        .order("updated_at", { ascending: false })
        .limit(20),
    ]);

    const docEvents = (docsRes.data ?? []).flatMap((row) => {
      const items = (row.line_items ?? []) as { quantity: number | string; unit_price: number | string; tax_rate: number | string | null }[];
      const amount = computeDocTotal(
        items,
        row.discount_type,
        row.discount_value
      );
      const source: DocumentActivitySource = {
        id: row.id,
        type: row.type,
        sent_at: row.sent_at,
        paid_at: row.paid_at,
        approved_at: row.approved_at,
        declined_at: row.declined_at,
        invoice_number: row.invoice_number,
        quote_number: row.quote_number,
        title: row.title,
        clientName: clientNameFromJoin(row.clients),
        amount,
      };
      return extractDocumentEvents(source);
    });

    const projectEvents = (projectsRes.data ?? []).flatMap((row) =>
      extractProjectEvents({
        id: row.id,
        title: row.title,
        status: row.status,
        updated_at: row.updated_at,
        clientName: clientNameFromJoin(row.clients),
      })
    );

    return mergeAndSortEvents([...docEvents, ...projectEvents], 10);
  },
  ["dashboard-activity"],
  { revalidate: 60, tags: ["dashboard"] }
);

export async function getRecentActivity(): Promise<ActivityEvent[]> {
  const { user } = await getServerContext();
  if (!user) return [];
  return _cachedGetRecentActivity(user.id);
}

// ---------------------------------------------------------------------------
// getActivePipeline
// ---------------------------------------------------------------------------
const _cachedGetActivePipeline = unstable_cache(
  async (userId: string): Promise<ActivePipelineResult> => {
    const { supabase } = await getServerContext();

    const { data, count } = await supabase
      .from("projects")
      .select("id, title, deadline, status, budget, spent, clients:client_id(name)", {
        count: "exact",
      })
      .eq("user_id", userId)
      .in("status", ACTIVE_PROJECT_STATUSES)
      .order("deadline", { ascending: true, nullsFirst: false })
      .limit(5);

    const now = new Date();
    const withDeadline = (data ?? []).filter((p) => p.deadline);
    const withoutDeadline = (data ?? []).filter((p) => !p.deadline);
    const ordered = [...withDeadline, ...withoutDeadline];

    const projects = ordered.map((row) => {
      const deadline = parseDeadlineDate(row.deadline);
      const risk = classifyProjectRisk(deadline, now);
      const budget = row.budget ?? null;
      const spent = row.spent ?? null;
      const progress = budget && budget > 0 ? Math.min(1, (spent ?? 0) / budget) : null;
      return {
        id: row.id,
        title: row.title,
        clientName: clientNameFromJoin(row.clients),
        deadline,
        risk,
        daysLabel: formatPipelineDaysLabel(deadline, now),
        statusLabel: projectStatusLabel(row.status as ProjectStatus),
        status: row.status as string,
        budget,
        spent,
        progress,
      };
    });

    return {
      projects,
      totalCount: count ?? projects.length,
    };
  },
  ["dashboard-pipeline"],
  { revalidate: 60, tags: ["dashboard"] }
);

export async function getActivePipeline(): Promise<ActivePipelineResult> {
  const { user } = await getServerContext();
  if (!user) return { projects: [], totalCount: 0 };
  return _cachedGetActivePipeline(user.id);
}
