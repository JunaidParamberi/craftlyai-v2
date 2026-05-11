import Link from "next/link";

import {
  formatProjectDate,
  projectStatusBadgePresentation,
  projectStatusLabel,
} from "@/lib/projects/display";
import type { ProjectListRow } from "@/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, FolderKanban } from "lucide-react";

type ClientProjectsSectionProps = {
  clientId: string;
  projects: ProjectListRow[];
};

export function ClientProjectsSection({
  clientId,
  projects,
}: ClientProjectsSectionProps) {
  const rows = projects.filter((p) => p.client_id === clientId);

  if (rows.length === 0) {
    return (
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b border-border/60 pb-4">
          <div>
            <CardTitle className="text-base">Active projects</CardTitle>
            <CardDescription>
              Projects linked to this client will appear here.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            nativeButton={false}
            render={<Link href="/projects" />}
          >
            View all
            <ArrowRight className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <FolderKanban className="size-7 text-muted-foreground" />
          </div>
          <div className="max-w-sm space-y-1">
            <p className="font-medium text-sm">No projects yet</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              When you create projects for this client, you&apos;ll see status,
              dates, and billing at a glance.
            </p>
          </div>
          <Button nativeButton={false} render={<Link href="/projects/new" />}>
            Create project
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b border-border/60 pb-4">
        <div>
          <CardTitle className="text-base">Projects</CardTitle>
          <CardDescription>
            {rows.length} project{rows.length === 1 ? "" : "s"} for this client.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground"
          nativeButton={false}
          render={<Link href="/projects" />}
        >
          View all
          <ArrowRight className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="ps-4 sm:ps-6">Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden pe-4 sm:table-cell sm:pe-6">
                Deadline
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => {
              const badge = projectStatusBadgePresentation(p.status);
              return (
                <TableRow key={p.id}>
                  <TableCell className="ps-4 sm:ps-6">
                    <Link
                      href={`/projects/${p.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {p.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={badge.variant} className={badge.className}>
                      {projectStatusLabel(p.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden pe-4 text-muted-foreground text-sm sm:table-cell sm:pe-6">
                    {formatProjectDate(p.deadline)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
