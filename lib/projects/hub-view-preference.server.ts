import { cookies } from "next/headers";

import {
  PROJECTS_HUB_VIEW_COOKIE,
  parseProjectsHubViewMode,
  type ProjectsHubViewMode,
} from "@/lib/projects/hub-view-preference";

export async function getProjectsHubViewModeFromCookies(): Promise<ProjectsHubViewMode> {
  const cookieStore = await cookies();
  return (
    parseProjectsHubViewMode(cookieStore.get(PROJECTS_HUB_VIEW_COOKIE)?.value) ??
    "board"
  );
}
