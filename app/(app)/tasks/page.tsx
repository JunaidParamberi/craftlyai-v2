import type { Metadata } from "next";

import { TasksView } from "@/components/features/tasks/tasks-view";
import { listProjects } from "@/lib/projects/actions";
import { listAllTasksForUser } from "@/lib/tasks/task-queries";
import { parseTaskListFilters } from "@/lib/tasks/task-utils";

export const metadata: Metadata = { title: "Tasks" };

type SearchParams = Promise<{
  project?: string;
  status?: string;
  priority?: string;
  sort?: string;
  view?: string;
}>;

export default async function TasksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const initialFilters = parseTaskListFilters(params);

  const [tasksResult, projectsResult] = await Promise.all([
    listAllTasksForUser(),
    listProjects(),
  ]);

  if (!tasksResult.ok) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Tasks
        </h1>
        <p className="text-destructive text-sm">{tasksResult.message}</p>
      </div>
    );
  }

  const projects = projectsResult.ok ? projectsResult.projects : [];

  return (
    <TasksView
      tasks={tasksResult.tasks}
      projects={projects}
      initialFilters={initialFilters}
    />
  );
}
