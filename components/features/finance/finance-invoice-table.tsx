"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO, isPast } from "date-fns";
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  documentStatusLabel,
  documentStatusVariant,
} from "@/lib/documents/display";
import type { FinanceInvoiceRow, InvoiceFilters, SortKey } from "@/lib/finance/types";
import { exportFinanceInvoices } from "@/lib/finance/finance-queries";

type Props = {
  invoices: FinanceInvoiceRow[];
  total: number;
  pageCount: number;
  currentPage: number;
  currentSort: SortKey;
  currency: string;
  filters: Omit<InvoiceFilters, "page">;
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function buildCsv(invoices: FinanceInvoiceRow[]): string {
  const headers = ["Invoice #", "Client", "Issue Date", "Due Date", "Status", "Amount"];
  const rows = invoices.map((inv) => [
    inv.invoice_number ?? inv.title,
    inv.client?.name ?? "",
    format(parseISO(inv.created_at), "yyyy-MM-dd"),
    inv.due_date ? format(parseISO(inv.due_date), "yyyy-MM-dd") : "",
    inv.status,
    inv.computedTotal.toFixed(2),
  ]);
  return [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function downloadBlob(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type SortableHeaderProps = {
  label: string;
  field: string;
  currentSort: SortKey;
  className?: string;
};

function SortableHeader({ label, field, currentSort, className }: SortableHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const underscoreIdx = currentSort.lastIndexOf("_");
  const currentField = currentSort.slice(0, underscoreIdx);
  const currentDir = currentSort.slice(underscoreIdx + 1);

  const isActive = currentField === field;
  const nextDir = isActive && currentDir === "asc" ? "desc" : "asc";
  const nextSort: SortKey = `${field}_${nextDir}` as SortKey;

  function handleSort() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", nextSort);
    params.delete("page");
    router.push(`/finance?${params.toString()}`);
  }

  return (
    <TableHead className={cn("cursor-pointer select-none", className)} onClick={handleSort}>
      <span className="flex items-center gap-1">
        {label}
        {isActive ? (
          currentDir === "asc" ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )
        ) : (
          <ArrowUpDown className="size-3 text-muted-foreground/40" />
        )}
      </span>
    </TableHead>
  );
}

function Pagination({
  currentPage,
  pageCount,
}: {
  currentPage: number;
  pageCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (pageCount <= 1) return null;

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/finance?${params.toString()}`);
  }

  const pages: (number | "…")[] = [];
  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(pageCount - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < pageCount - 2) pages.push("…");
    pages.push(pageCount);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        disabled={currentPage <= 1}
        onClick={() => goTo(currentPage - 1)}
      >
        ← Prev
      </Button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === currentPage ? "default" : "outline"}
            size="sm"
            className="h-7 w-7 p-0 text-xs"
            onClick={() => goTo(p)}
          >
            {p}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        disabled={currentPage >= pageCount}
        onClick={() => goTo(currentPage + 1)}
      >
        Next →
      </Button>
    </div>
  );
}

export function FinanceInvoiceTable({
  invoices,
  total,
  pageCount,
  currentPage,
  currentSort,
  currency,
  filters,
}: Props) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const all = await exportFinanceInvoices(filters);
      const csv = buildCsv(all);
      downloadBlob(csv, `invoices-${format(new Date(), "yyyy-MM-dd")}.csv`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <span className="text-base font-semibold">
          Invoices
          {total > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({total})</span>
          )}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={handleExport}
          disabled={exporting || invoices.length === 0}
        >
          <Download className="size-3" />
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-b-lg py-14 text-center">
          <p className="text-sm font-medium text-foreground">No invoices in this period</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create an invoice to start tracking revenue
          </p>
          <Link href="/documents/new">
            <Button variant="outline" size="sm" className="mt-4">
              New invoice
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/60">
                <SortableHeader
                  label="Invoice"
                  field="date"
                  currentSort={currentSort}
                  className="w-[220px] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                />
                <SortableHeader
                  label="Client"
                  field="client"
                  currentSort={currentSort}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                />
                <SortableHeader
                  label="Due"
                  field="date"
                  currentSort={currentSort}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                />
                <SortableHeader
                  label="Status"
                  field="status"
                  currentSort={currentSort}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                />
                <SortableHeader
                  label="Amount"
                  field="amount"
                  currentSort={currentSort}
                  className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                />
                <TableHead className="w-16 px-4 py-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const isOverdue =
                  invoice.status !== "paid" &&
                  invoice.due_date &&
                  isPast(parseISO(invoice.due_date));

                return (
                  <TableRow
                    key={invoice.id}
                    className="group border-border/40 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="px-6 py-4">
                      <span className="text-sm font-semibold text-foreground">
                        {invoice.invoice_number ?? invoice.title}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span className="text-sm text-muted-foreground">
                        {invoice.client?.name ?? <span className="text-border">—</span>}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span
                        className={cn(
                          "text-sm",
                          isOverdue ? "font-medium text-amber-500" : "text-muted-foreground"
                        )}
                      >
                        {invoice.due_date ? (
                          format(parseISO(invoice.due_date), "MMM d, yyyy")
                        ) : (
                          <span className="text-border">—</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Badge
                        variant={documentStatusVariant(invoice.status)}
                        className="text-[11px] font-medium"
                      >
                        {documentStatusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <span
                        className={cn(
                          "font-mono text-sm tabular-nums",
                          invoice.computedTotal === 0
                            ? "text-muted-foreground"
                            : "font-semibold text-foreground"
                        )}
                      >
                        {formatMoney(invoice.computedTotal, currency)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <Link href={`/documents/${invoice.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                        >
                          View →
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t border-border/40 px-6 py-3">
            <span className="text-xs text-muted-foreground">
              Showing{" "}
              {Math.min((currentPage - 1) * 20 + 1, total)}–
              {Math.min(currentPage * 20, total)} of {total}
            </span>
            <Pagination currentPage={currentPage} pageCount={pageCount} />
          </div>
        </>
      )}
    </div>
  );
}
