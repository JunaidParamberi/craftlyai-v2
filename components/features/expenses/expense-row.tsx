"use client";

import Link from "next/link";
import { ExternalLink, Paperclip } from "lucide-react";

import {
  expenseCategoryBadgeVariant,
  expenseCategoryLabel,
} from "@/lib/expenses/display";
import { formatCurrency } from "@/lib/utils/format";
import type { ExpenseListRow } from "@/types";

import { ExpenseDeleteButton } from "@/components/features/expenses/expense-delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

type ExpenseRowProps = {
  expense: ExpenseListRow;
  onEdit: (expense: ExpenseListRow) => void;
  showProject?: boolean;
};

export function ExpenseRow({
  expense,
  onEdit,
  showProject = true,
}: ExpenseRowProps) {
  const label =
    expense.vendor?.trim() ||
    expenseCategoryLabel(expense.category) ||
    "Expense";

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
        {expense.date}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{label}</span>
          {expense.notes ? (
            <span className="line-clamp-1 text-muted-foreground text-xs">
              {expense.notes}
            </span>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={expenseCategoryBadgeVariant(expense.category)}>
          {expenseCategoryLabel(expense.category)}
        </Badge>
      </TableCell>
      {showProject ? (
        <TableCell>
          {expense.project ? (
            <Link
              href={`/projects/${expense.project.id}`}
              className="text-primary text-sm underline-offset-4 hover:underline"
            >
              {expense.project.title}
            </Link>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </TableCell>
      ) : null}
      <TableCell className="text-end font-medium tabular-nums">
        {formatCurrency(expense.amount, expense.currency)}
      </TableCell>
      <TableCell className="text-end">
        <div className="flex items-center justify-end gap-1">
          {expense.receipt_url ? (
            <a
              href={expense.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View receipt"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Paperclip className="size-4" />
              <ExternalLink className="sr-only" />
            </a>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(expense)}
          >
            Edit
          </Button>
          <ExpenseDeleteButton expenseId={expense.id} label={label} />
        </div>
      </TableCell>
    </TableRow>
  );
}
