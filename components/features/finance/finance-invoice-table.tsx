"use client";

import Link from "next/link";
import { format, parseISO, isPast } from "date-fns";

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
import type { DocumentListRow } from "@/types";

type FinanceInvoice = DocumentListRow & { computedTotal: number };

type Props = { invoices: FinanceInvoice[]; currency: string };

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function FinanceInvoiceTable({ invoices, currency }: Props) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-14 text-center">
        <p className="text-sm font-medium text-foreground">
          No invoices in this period
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create an invoice to start tracking revenue
        </p>
        <Link href="/documents/new">
          <Button variant="outline" size="sm" className="mt-4">
            New invoice
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border/60">
          <TableHead className="w-[220px] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Invoice
          </TableHead>
          <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Client
          </TableHead>
          <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Due
          </TableHead>
          <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Status
          </TableHead>
          <TableHead className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Amount
          </TableHead>
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
                  {invoice.client?.name ?? (
                    <span className="text-border">—</span>
                  )}
                </span>
              </TableCell>
              <TableCell className="px-4 py-4">
                <span
                  className={cn(
                    "text-sm",
                    isOverdue
                      ? "font-medium text-amber-500"
                      : "text-muted-foreground"
                  )}
                >
                  {invoice.due_date
                    ? format(parseISO(invoice.due_date), "MMM d, yyyy")
                    : <span className="text-border">—</span>}
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
  );
}
