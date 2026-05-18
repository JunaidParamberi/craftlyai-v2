export const PROJECTS_HUB_VIEW_STORAGE_KEY = "craftlyai:projects-hub:view";
export const PROJECTS_HUB_VIEW_COOKIE = "craftlyai_projects_hub_view";
export const PROJECTS_HUB_VIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ProjectsHubViewMode = "list" | "board";

export function parseProjectsHubViewMode(
  value: string | null | undefined,
): ProjectsHubViewMode | null {
  if (value === "list" || value === "board") return value;
  return null;
}

export function projectsHubViewCookieValue(mode: ProjectsHubViewMode): string {
  return `${PROJECTS_HUB_VIEW_COOKIE}=${mode}; path=/; max-age=${PROJECTS_HUB_VIEW_COOKIE_MAX_AGE}; SameSite=Lax`;
}
