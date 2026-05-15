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

import { deleteClient } from "@/lib/clients/client-mutations";
import {
  type ClientHealthBucket,
  clientHealthBucket,
  clientMonogram,
  healthPresentationCompact,
} from "@/lib/clients/display";
import type { ClientRow } from "@/types";

import { Badge } from "@/components/ui/badge";
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

type HealthFilterValue = "all" | ClientHealthBucket | "unset";

function matchesHealthFilter(
  score: number | null,
  filter: HealthFilterValue,
): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "unset") {
    return score === null;
  }
  const b = clientHealthBucket(score);
  if (b === null) {
    return false;
  }
  return b === filter;
}

const HEALTH_FILTER_LABELS: Record<HealthFilterValue, string> = {
  all: "All",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  risk: "At risk",
  unset: "Not set",
};

type ClientsTableProps = {
  clients: ClientRow[];
};

export function ClientsTable({ clients }: ClientsTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [healthFilter, setHealthFilter] = useState<HealthFilterValue>("all");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPage(1);
  }, [query, healthFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      if (!matchesHealthFilter(c.health_score, healthFilter)) {
        return false;
      }
      if (!q) {
        return true;
      }
      const hay = [c.name, c.company, c.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [clients, query, healthFilter]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);
  const from = total === 0 ? 0 : start + 1;
  const to = Math.min(start + PAGE_SIZE, total);

  function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteClient(pendingDelete.id);
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
                placeholder="Filter clients…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Filter clients"
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
                    {healthFilter !== "all" ? (
                      <span className="text-muted-foreground text-xs">
                        ({HEALTH_FILTER_LABELS[healthFilter]})
                      </span>
                    ) : null}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Health</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={healthFilter}
                    onValueChange={(v) =>
                      setHealthFilter(v as HealthFilterValue)
                    }
                  >
                    <DropdownMenuRadioItem value="all">
                      All clients
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="excellent">
                      Excellent
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="good">
                      Good
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="fair">
                      Fair
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="risk">
                      At risk
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="unset">
                      Not set
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
                <TableHead className="ps-4 sm:ps-6">Name</TableHead>
                <TableHead className="hidden md:table-cell">Company</TableHead>
                <TableHead className="hidden lg:table-cell">Email</TableHead>
                <TableHead>Health</TableHead>
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
                    {clients.length === 0
                      ? "No clients to show."
                      : "No clients match your search or filter."}
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="ps-4 sm:ps-6">
                      <div className="flex min-w-0 flex-col gap-1">
                        <Link
                          href={`/clients/${c.id}`}
                          className="flex min-w-0 items-center gap-3 font-medium text-foreground hover:underline"
                        >
                          <span
                            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
                            aria-hidden
                          >
                            {clientMonogram(c.name)}
                          </span>
                          <span className="min-w-0 truncate">{c.name}</span>
                        </Link>
                        <p className="text-muted-foreground text-xs md:hidden ps-12">
                          {[c.company, c.email].filter(Boolean).join(" · ") ||
                            "No company or email"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-[12rem] truncate text-muted-foreground md:table-cell">
                      {c.company?.trim() || "—"}
                    </TableCell>
                    <TableCell className="hidden max-w-[14rem] truncate text-muted-foreground lg:table-cell">
                      {c.email?.trim() || "—"}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const pr = healthPresentationCompact(c.health_score);
                        if (!pr) {
                          return (
                            <Badge
                              variant="outline"
                              className="font-normal text-muted-foreground"
                            >
                              Not set
                            </Badge>
                          );
                        }
                        return (
                          <Badge variant={pr.variant} className="font-normal">
                            {pr.label}
                          </Badge>
                        );
                      })()}
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
                              aria-label={`Actions for ${c.name}`}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            render={
                              <Link href={`/clients/${c.id}`} />
                            }
                          >
                            View profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            render={
                              <Link
                                href={`/clients/${c.id}/edit`}
                              />
                            }
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              setDeleteError(null);
                              setPendingDelete({ id: c.id, name: c.name });
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
              ? "Showing 0 of 0 clients"
              : `Showing ${from} to ${to} of ${total} client${total === 1 ? "" : "s"}`}
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
              onClick={() =>
                setPage((p) => (p < pageCount ? p + 1 : p))
              }
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
            <DialogTitle>Delete this client?</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {pendingDelete?.name}
              </span>{" "}
              from your workspace. You can add them again later.
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
