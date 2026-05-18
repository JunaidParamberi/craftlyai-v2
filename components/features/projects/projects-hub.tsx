"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  FileText,
  Filter,
  Layers,
  List,
  Plus,
  StickyNote,
  Timer,
} from "lucide-react";

import { ProjectExpensesPanel } from "@/components/features/expenses/project-expenses-panel";
import { DocumentsTable } from "@/components/features/documents/documents-table";
import {
  ProjectTasksPanel,
  type ProjectTaskFilters,
} from "@/components/features/projects/project-tasks-panel";
import { ProjectChipsRow } from "@/components/features/projects/project-chips-row";
import { ProjectSummaryCard } from "@/components/features/projects/project-summary-card";
import {
  PROJECTS_HUB_VIEW_STORAGE_KEY,
  projectsHubViewCookieValue,
  type ProjectsHubViewMode,
} from "@/lib/projects/hub-view-preference";
import { projectsHubSubtitle } from "@/lib/projects/project-utils";
import {
  ProjectTasksKanbanSkeleton,
  ProjectTasksListSkeleton,
} from "@/components/features/projects/project-tasks-skeletons";
import type {
  DocumentListRow,
  ExpenseListRow,
  ProjectListRow,
  TaskRow,
} from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type HubTab = "tasks" | "documents" | "time" | "expenses" | "notes";

const TABS: { id: HubTab; label: string }[] = [
  { id: "tasks", label: "Tasks" },
  { id: "documents", label: "Documents" },
  { id: "time", label: "Time" },
  { id: "expenses", label: "Expenses" },
  { id: "notes", label: "Notes" },
];

type ProjectsHubProps = {
  projects: ProjectListRow[];
  activeProject: ProjectListRow;
  tasks: TaskRow[];
  expenses: ExpenseListRow[];
  documents: DocumentListRow[];
  defaultCurrency: string;
  userDisplayName: string;
  timeHoursLabel?: string;
};

export function ProjectsHub({
  projects,
  activeProject,
  tasks,
  expenses,
  documents,
  defaultCurrency,
  userDisplayName,
  timeHoursLabel = "—",
}: ProjectsHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = useTransition();

  const [viewMode, setViewMode] = useState<ProjectsHubViewMode>("board");
  const [taskFilters, setTaskFilters] = useState<ProjectTaskFilters>({
    status: "all",
    priority: "all",
    sortBy: "due",
  });
  const [filterOpen, setFilterOpen] = useState(false);

  const tabParam = searchParams.get("tab");
  const activeTab: HubTab =
    tabParam === "documents" ||
    tabParam === "time" ||
    tabParam === "expenses" ||
    tabParam === "notes"
      ? tabParam
      : "tasks";

  useEffect(() => {
    const stored = localStorage.getItem(PROJECTS_HUB_VIEW_STORAGE_KEY);
    if (stored === "board" || stored === "list") {
      setViewMode(stored);
      document.cookie = projectsHubViewCookieValue(stored);
    }
  }, []);

  const subtitle = useMemo(
    () => projectsHubSubtitle(projects, defaultCurrency),
    [projects, defaultCurrency],
  );

  const setProject = useCallback(
    (projectId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("project", projectId);
      if (!params.get("tab")) {
        params.set("tab", activeTab);
      }
      startTransition(() => {
        router.push(`/projects?${params.toString()}`);
      });
    },
    [router, searchParams, activeTab],
  );

  const setTab = useCallback(
    (tab: HubTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("project", activeProject.id);
      params.set("tab", tab);
      startTransition(() => {
        router.push(`/projects?${params.toString()}`);
      });
    },
    [router, searchParams, activeProject.id],
  );

  function handleViewChange(mode: ProjectsHubViewMode) {
    setViewMode(mode);
    localStorage.setItem(PROJECTS_HUB_VIEW_STORAGE_KEY, mode);
    document.cookie = projectsHubViewCookieValue(mode);
  }

  function tabCount(tab: HubTab): string | number {
    switch (tab) {
      case "tasks":
        return tasks.length;
      case "documents":
        return documents.length;
      case "time":
        return timeHoursLabel;
      case "expenses":
        return expenses.length;
      default:
        return "";
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-4 py-7 pb-20 sm:px-8">
      <header className="fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.025em] text-foreground">
            Projects
          </h1>
          <p className="mt-1.5 text-[15px] text-[var(--fg-2)]">
            {subtitle.activeCount} active · {subtitle.inFlightLabel} in flight ·{" "}
            {subtitle.atRiskCount} at risk
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Task view"
            className="inline-flex rounded-lg border border-border bg-[var(--bg-subtle)] p-0.5"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-[26px] gap-1 px-2 text-xs",
                viewMode === "list" && "bg-card shadow-xs",
              )}
              onClick={() => handleViewChange("list")}
            >
              <List className="size-3" />
              List
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-[26px] gap-1 px-2 text-xs",
                viewMode === "board" && "bg-card shadow-xs",
              )}
              onClick={() => handleViewChange("board")}
            >
              <Layers className="size-3" />
              Board
            </Button>
          </div>
          <Button nativeButton={false} render={<Link href="/projects/new" />}>
            <Plus />
            New project
          </Button>
        </div>
      </header>

      <ProjectChipsRow
        projects={projects}
        activeProjectId={activeProject.id}
        onSelect={setProject}
      />

      <ProjectSummaryCard
        project={activeProject}
        currency={defaultCurrency}
        userDisplayName={userDisplayName}
      />

      <nav className="tabs fade-up delay-3" aria-label="Project sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="tabs__item"
            data-active={activeTab === t.id ? "true" : undefined}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id !== "notes" ? (
              <span className="tabs__count">{tabCount(t.id)}</span>
            ) : null}
          </button>
        ))}
        <div className="flex-1" aria-hidden />
        {activeTab === "tasks" ? (
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger
              render={
                <button type="button" className="tabs__item">
                  <Filter className="size-3.5" />
                  Filter
                </button>
              }
            />
            <PopoverContent align="end" className="w-64 p-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Status
                  </span>
                  <Select
                    value={taskFilters.status}
                    onValueChange={(v) => {
                      if (
                        v === "all" ||
                        v === "todo" ||
                        v === "in_progress" ||
                        v === "done" ||
                        v === "cancelled"
                      ) {
                        setTaskFilters((f) => ({ ...f, status: v }));
                      }
                    }}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="todo">To do</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Priority
                  </span>
                  <Select
                    value={taskFilters.priority}
                    onValueChange={(v) => {
                      if (
                        v === "all" ||
                        v === "low" ||
                        v === "medium" ||
                        v === "high"
                      ) {
                        setTaskFilters((f) => ({ ...f, priority: v }));
                      }
                    }}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {viewMode === "list" ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Sort
                    </span>
                    <Select
                      value={taskFilters.sortBy}
                      onValueChange={(v) => {
                        if (v === "due" || v === "created") {
                          setTaskFilters((f) => ({ ...f, sortBy: v }));
                        }
                      }}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="due">Due date</SelectItem>
                          <SelectItem value="created">Created</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <button type="button" className="tabs__item opacity-50" disabled>
            <Filter className="size-3.5" />
            Filter
          </button>
        )}
      </nav>

      {activeTab === "tasks" ? (
        isNavigating ? (
          viewMode === "list" ? (
            <ProjectTasksListSkeleton />
          ) : (
            <ProjectTasksKanbanSkeleton />
          )
        ) : (
          <ProjectTasksPanel
            projectId={activeProject.id}
            initialTasks={tasks}
            viewMode={viewMode}
            filters={taskFilters}
          />
        )
      ) : null}

      {activeTab === "documents" ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {documents.length === 0
                ? "No documents linked to this project yet."
                : `${documents.length} document${documents.length === 1 ? "" : "s"}`}
            </p>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link href={`/documents/new?projectId=${activeProject.id}`} />
              }
            >
              <FileText />
              New document
            </Button>
          </div>
          {documents.length > 0 ? (
            <DocumentsTable documents={documents} />
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Create a proposal, quote, or invoice from this project.
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

      {activeTab === "time" ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Timer className="size-6 text-muted-foreground" />
            </div>
            <div className="max-w-md space-y-2">
              <p className="font-medium text-sm">Time tracking</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Start and stop timers from the Time page. Project hours will
                appear here in a later release.
              </p>
            </div>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/time" />}>
              Open time tracker
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "expenses" ? (
        <ProjectExpensesPanel
          projectId={activeProject.id}
          expenses={expenses}
          projects={projects}
          defaultCurrency={defaultCurrency}
        />
      ) : null}

      {activeTab === "notes" ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <StickyNote className="size-6 text-muted-foreground" />
            </div>
            <div className="max-w-md space-y-2">
              <p className="font-medium text-sm">Project notes</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Internal notes and client-visible updates will live here in a
                later release.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
