import { ProjectsHubSkeleton } from "@/components/features/projects/projects-hub-skeleton";
import { getProjectsHubViewModeFromCookies } from "@/lib/projects/hub-view-preference.server";

export default async function ProjectsLoading() {
  const viewMode = await getProjectsHubViewModeFromCookies();
  return <ProjectsHubSkeleton viewMode={viewMode} />;
}
