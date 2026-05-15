import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetailView } from "@/components/features/projects/project-detail-view";
import { FormPageShell } from "@/components/shared/form-page-shell";
import { listExpenses } from "@/lib/expenses/actions";
import { getProjectById, listProjects } from "@/lib/projects/actions";
import { getProfile } from "@/lib/profile/actions";
import { listTasksForProject } from "@/lib/tasks/actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  return { title: project?.title ?? "Project" };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) {
    notFound();
  }

  const [tasksResult, expensesResult, projectsResult, profileResult] =
    await Promise.all([
      listTasksForProject(id),
      listExpenses({ projectId: id }),
      listProjects(),
      getProfile(),
    ]);

  const tasks = tasksResult.ok ? tasksResult.tasks : [];
  const expenses = expensesResult.ok ? expensesResult.expenses : [];
  const projects = projectsResult.ok ? projectsResult.projects : [];
  const defaultCurrency =
    profileResult.ok && profileResult.profile?.default_currency
      ? profileResult.profile.default_currency
      : "USD";

  return (
    <FormPageShell maxWidth="7xl">
      <ProjectDetailView
        project={project}
        tasks={tasks}
        expenses={expenses}
        projects={projects}
        defaultCurrency={defaultCurrency}
      />
    </FormPageShell>
  );
}
