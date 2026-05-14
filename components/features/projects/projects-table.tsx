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
import { toast } from "sonner";

import { deleteProject } from "@/lib/projects/actions";
import {
  type ProjectListFilterTab,
  PROJECT_LIST_FILTER_TABS,
  formatProjectDate,
  projectMatchesListFilter,
  projectStatusBadgePresentation,
  projectStatusLabel,
} from "@/lib/projects/display";
import type { ProjectListRow } from "@/types";

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

const PAGE_SIZE = 10;

type ProjectsTableProps = {
  projects: ProjectListRow[];
};

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<ProjectListFilterTab>("all");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPage(1);
  }, [query, statusTab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (!projectMatchesListFilter(p.status, statusTab)) {
        return false;
      }
      if (!q) {
        return true;
      }
      const clientName = p.client?.name ?? "";
      const hay = [p.title, clientName].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [projects, query, statusTab]);

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
      const result = await deleteProject(pendingDelete.id);
      if (!result.ok) {
        setDeleteError(result.message);
        toast.error(result.message ?? "Failed to delete project.");
        return;
      }
      setPendingDelete(null);
      toast.success("Project deleted");
      router.refresh();
    });
  }

  return (
    <>
      <Card className="overflow-hidden border border-border shadow-sm ring-1 ring-border/50">
        <CardHeader className="flex flex-col gap-4 border-b border-border/80 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <InputGroup className="w-full sm:max-w-md">
              <InputGroupAddon>
                <Search className="text-muted-foreground" aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                placeholder="Search projects…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search projects"
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
                    Status
                    {statusTab !== "all" ? (
                      <span className="text-muted-foreground text-xs">
                        (
                        {
                          PROJECT_LIST_FILTER_TABS.find((t) => t.value === statusTab)
                            ?.label
                        }
                        )
                      </span>
                    ) : null}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={statusTab}
                    onValueChange={(v) =>
                      setStatusTab(v as ProjectListFilterTab)
                    }
                  >
                    {PROJECT_LIST_FILTER_TABS.map((t) => (
                      <DropdownMenuRadioItem key={t.value} value={t.value}>
                        {t.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROJECT_LIST_FILTER_TABS.map((t) => {
              const active = statusTab === t.value;
              return (
                <Button
                  key={t.value}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setStatusTab(t.value)}
                >
                  {t.label}
                </Button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="ps-4 sm:ps-6">Project</TableHead>
                <TableHead className="hidden md:table-cell">Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Deadline</TableHead>
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
                    {projects.length === 0
                      ? "No projects yet."
                      : "No projects match your search or filter."}
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((p) => {
                  const badge = projectStatusBadgePresentation(p.status);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="ps-4 sm:ps-6">
                        <div className="flex min-w-0 flex-col gap-1">
                          <Link
                            href={`/projects/${p.id}`}
                            className="font-medium text-foreground hover:underline"
                          >
                            {p.title}
                          </Link>
                          <p className="text-muted-foreground text-xs sm:hidden">
                            {p.client?.name ?? "Unknown client"} ·{" "}
                            {formatProjectDate(p.deadline)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden max-w-[14rem] truncate text-muted-foreground md:table-cell">
                        {p.client?.name ? (
                          <Link
                            href={`/clients/${p.client.id}`}
                            className="hover:text-foreground hover:underline"
                          >
                            {p.client.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={badge.variant}
                          className={badge.className}
                        >
                          {projectStatusLabel(p.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground text-sm sm:table-cell">
                        {formatProjectDate(p.deadline)}
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
                                aria-label={`Actions for ${p.title}`}
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              render={<Link href={`/projects/${p.id}`} />}
                            >
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              render={
                                <Link href={`/projects/${p.id}/edit`} />
                              }
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                setDeleteError(null);
                                setPendingDelete({ id: p.id, title: p.title });
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-border/80 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            {total === 0
              ? "Showing 0 of 0 projects"
              : `Showing ${from} to ${to} of ${total} project${total === 1 ? "" : "s"}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage <= 1 || total === 0}
              onClick={() => setPage((pg) => Math.max(1, pg - 1))}
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
                setPage((pg) => (pg < pageCount ? pg + 1 : pg))
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
            <DialogTitle>Delete this project?</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {pendingDelete?.title}
              </span>{" "}
              and all of its tasks. This cannot be undone.
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
