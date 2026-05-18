import Link from "next/link";
import { Suspense } from "react";

import { ProjectsHub } from "@/components/features/projects/projects-hub";
import { ProjectsHubSkeleton } from "@/components/features/projects/projects-hub-skeleton";
import { getProjectsHubViewModeFromCookies } from "@/lib/projects/hub-view-preference.server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listDocumentsForProject } from "@/lib/documents/actions";
import { listExpenses } from "@/lib/expenses/actions";
import { listProjects } from "@/lib/projects/actions";
import { getProfile } from "@/lib/profile/actions";
import { listTasksForProject } from "@/lib/tasks/actions";
import { Plus } from "lucide-react";

type PageProps = {
  searchParams: Promise<{ project?: string; tab?: string }>;
};

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const projectsResult = await listProjects();

  if (!projectsResult.ok) {
    return (
      <div className="flex flex-col gap-2 px-4 py-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Projects
        </h1>
        <p className="text-destructive text-sm">{projectsResult.message}</p>
      </div>
    );
  }

  const { projects } = projectsResult;

  if (projects.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-4 py-7 sm:px-8">
        <header className="fade-up">
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.025em]">
            Projects
          </h1>
          <p className="mt-1.5 text-[15px] text-[var(--fg-2)]">
            Manage active work and deadlines in one place.
          </p>
        </header>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No projects yet</CardTitle>
            <CardDescription>
              Link work to a client, track status, and break deliverables into
              tasks—all in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button nativeButton={false} render={<Link href="/projects/new" />}>
              <Plus />
              Create your first project
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeId =
    params.project && projects.some((p) => p.id === params.project)
      ? params.project
      : projects[0].id;

  const activeProject =
    projects.find((p) => p.id === activeId) ?? projects[0];

  const [tasksResult, expensesResult, documentsResult, profileResult] =
    await Promise.all([
      listTasksForProject(activeProject.id),
      listExpenses({ projectId: activeProject.id }),
      listDocumentsForProject(activeProject.id),
      getProfile(),
    ]);

  const tasks = tasksResult.ok ? tasksResult.tasks : [];
  const expenses = expensesResult.ok ? expensesResult.expenses : [];
  const documents = documentsResult.ok ? documentsResult.documents : [];
  const defaultCurrency =
    profileResult.ok && profileResult.profile?.default_currency
      ? profileResult.profile.default_currency
      : "USD";
  const userDisplayName =
    profileResult.ok && profileResult.profile?.full_name
      ? profileResult.profile.full_name
      : "You";

  const hubViewMode = await getProjectsHubViewModeFromCookies();

  return (
    <Suspense fallback={<ProjectsHubSkeleton viewMode={hubViewMode} />}>
      <ProjectsHub
        projects={projects}
        activeProject={activeProject}
        tasks={tasks}
        expenses={expenses}
        documents={documents}
        defaultCurrency={defaultCurrency}
        userDisplayName={userDisplayName}
      />
    </Suspense>
  );
}
