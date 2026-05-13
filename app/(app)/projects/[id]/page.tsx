import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetailView } from "@/components/features/projects/project-detail-view";
import { FormPageShell } from "@/components/shared/form-page-shell";
import { getProjectById } from "@/lib/projects/actions";
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

  const tasksResult = await listTasksForProject(id);
  const tasks = tasksResult.ok ? tasksResult.tasks : [];

  return (
    <FormPageShell maxWidth="7xl">
      <ProjectDetailView project={project} tasks={tasks} />
    </FormPageShell>
  );
}
