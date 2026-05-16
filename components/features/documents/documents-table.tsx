"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { deleteDocument } from "@/lib/documents/document-mutations";
import {
  documentStatusLabel,
  documentTypeLabel,
} from "@/lib/documents/display";
import { statusPillClass } from "@/lib/ui/status-styles";
import { cn } from "@/lib/utils";
import type { DocumentListRow, DocumentType } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { TABLE_PAGE_SIZE as PAGE_SIZE } from "@/lib/ui/skeleton-count";

const TYPE_ACCENTS: Record<DocumentType, string> = {
  proposal: "bg-indigo-500",
  quote: "bg-amber-500",
  invoice: "bg-emerald-500",
  payment_voucher: "bg-emerald-400",
  local_purchase_order: "bg-blue-500",
  other: "bg-zinc-400",
};

type TypeFilter = "all" | DocumentType;

const TYPE_FILTER_LABELS: Record<TypeFilter, string> = {
  all: "All",
  proposal: "Proposals",
  quote: "Quotes",
  invoice: "Invoices",
  payment_voucher: "Payment Vouchers",
  local_purchase_order: "LPOs",
  other: "Other",
};

function formatUpdated(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diffMs < day) {
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (diffMs < 7 * day) {
    return d.toLocaleDateString(undefined, { weekday: "short" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type DocumentsTableProps = {
  documents: DocumentListRow[];
};

export function DocumentsTable({ documents }: DocumentsTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPage(1);
  }, [query, typeFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((d) => {
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      if (!q) return true;
      const hay = [d.title, d.client?.name, d.project?.title]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [documents, query, typeFilter]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);
  const from = total === 0 ? 0 : start + 1;
  const to = Math.min(start + PAGE_SIZE, total);

  function confirmDelete() {
    if (!pendingDelete) return;
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteDocument(pendingDelete.id);
      if (!result.ok) {
        setDeleteError(result.message);
        return;
      }
      setPendingDelete(null);
      router.refresh();
    });
  }

  return (
    <>
      <Card className="overflow-hidden border border-border shadow-sm ring-1 ring-border/50">
        <CardHeader className="border-b border-border/80 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <InputGroup className="w-full sm:max-w-sm">
              <InputGroupAddon>
                <Search className="text-muted-foreground" aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                placeholder="Filter documents…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Filter documents"
              />
            </InputGroup>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center gap-2 sm:w-auto"
                  >
                    <Filter className="size-4" />
                    Filter
                    {typeFilter !== "all" ? (
                      <span className="text-muted-foreground text-xs">
                        ({TYPE_FILTER_LABELS[typeFilter]})
                      </span>
                    ) : null}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Type</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={typeFilter}
                    onValueChange={(v) => setTypeFilter(v as TypeFilter)}
                  >
                    <DropdownMenuRadioItem value="all">
                      All types
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="proposal">
                      Proposals
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="quote">
                      Quotes
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="invoice">
                      Invoices
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="other">
                      Other
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="ps-4 sm:ps-6">Document</TableHead>
                <TableHead className="hidden md:table-cell">Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell text-end">
                  Updated
                </TableHead>
                <TableHead className="w-12 pe-4 text-end sm:pe-6">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {documents.length === 0
                      ? "No documents to show."
                      : "No documents match your search or filter."}
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="ps-4 sm:ps-6">
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={cn(
                            "mt-2 inline-block size-2 shrink-0 rounded-full",
                            TYPE_ACCENTS[d.type],
                          )}
                          aria-hidden
                        />
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <Link
                            href={`/documents/${d.id}`}
                            className="font-heading text-sm font-medium tracking-tight text-foreground hover:underline truncate"
                          >
                            {d.title}
                          </Link>
                          <p className="text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                            {documentTypeLabel(d.type)}
                            {d.project ? ` · ${d.project.title}` : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-[12rem] truncate text-muted-foreground md:table-cell">
                      {d.client?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className={statusPillClass(d.status)}>
                        {documentStatusLabel(d.status)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-end text-muted-foreground tabular-nums lg:table-cell">
                      {formatUpdated(d.updated_at)}
                    </TableCell>
                    <TableCell className="pe-4 text-end sm:pe-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full"
                              aria-label={`Actions for ${d.title}`}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            render={<Link href={`/documents/${d.id}`} />}
                          >
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            render={<Link href={`/documents/${d.id}/edit`} />}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              setDeleteError(null);
                              setPendingDelete({ id: d.id, title: d.title });
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-border/80 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            {total === 0
              ? "Showing 0 of 0 documents"
              : `Showing ${from} to ${to} of ${total} document${total === 1 ? "" : "s"}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage <= 1 || total === 0}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage >= pageCount || total === 0}
              onClick={() => setPage((p) => (p < pageCount ? p + 1 : p))}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete this document?</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {pendingDelete?.title}
              </span>
              . This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError ? (
            <p className="text-destructive text-sm" role="alert">
              {deleteError}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPendingDelete(null);
                setDeleteError(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending || !pendingDelete}
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
