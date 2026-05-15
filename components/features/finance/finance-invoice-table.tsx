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
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-[11px] font-semibold uppercase tracking-[0.08em]">
            Invoice
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-[0.08em]">
            Client
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-[0.08em]">
            Due
          </TableHead>
          <TableHead className="text-[11px] font-semibold uppercase tracking-[0.08em]">
            Status
          </TableHead>
          <TableHead className="text-right text-[11px] font-semibold uppercase tracking-[0.08em]">
            Amount
          </TableHead>
          <TableHead />
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
              className="group transition-colors hover:bg-muted/40"
            >
              <TableCell className="text-sm font-medium">
                {invoice.invoice_number ?? invoice.title}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {invoice.client?.name ?? "—"}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "text-xs",
                    isOverdue
                      ? "font-medium text-amber-600"
                      : "text-muted-foreground"
                  )}
                >
                  {invoice.due_date
                    ? format(parseISO(invoice.due_date), "MMM d, yyyy")
                    : "—"}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={documentStatusVariant(invoice.status)}
                  className="text-[11px]"
                >
                  {documentStatusLabel(invoice.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {formatMoney(invoice.computedTotal, currency)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/documents/${invoice.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
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
