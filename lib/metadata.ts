import { siteConfig } from "@/config/site";

/** Join title segments without the app suffix (layouts add that). */
export function pageTitle(...segments: string[]) {
  return segments.filter(Boolean).join(" · ");
}

export const appTitleTemplate = `%s · ${siteConfig.name}`;
