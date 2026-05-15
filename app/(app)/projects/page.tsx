import Link from "next/link";

import { ProjectsTable } from "@/components/features/projects/projects-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listProjects } from "@/lib/projects/actions";
import { paginatedListSkeletonCount } from "@/lib/ui/skeleton-count";
import { SkeletonCountRecorder } from "@/hooks/use-skeleton-count";
import { Plus } from "lucide-react";

export default async function ProjectsPage() {
  const result = await listProjects();

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Projects
        </h1>
        <p className="text-destructive text-sm">{result.message}</p>
      </div>
    );
  }

  const { projects } = result;

  return (
    <div className="flex flex-col gap-8">
      <SkeletonCountRecorder
        id="projects:list"
        count={paginatedListSkeletonCount(projects.length)}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Projects
          </h1>
          <p className="max-w-lg text-muted-foreground text-sm">
            Manage your active work and upcoming deadlines.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/projects/new" />}
        >
          <Plus />
          New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No projects yet</CardTitle>
            <CardDescription>
              Link work to a client, track status, and break deliverables into
              tasks—all in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              nativeButton={false}
              render={<Link href="/projects/new" />}
            >
              <Plus />
              Create your first project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ProjectsTable projects={projects} />
      )}
    </div>
  );
}
