import { siteConfig } from "@/config/site";

export function Logo() {
  return <span className="font-semibold">{siteConfig.name}</span>;
}
