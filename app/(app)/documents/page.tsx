import type { Metadata } from "next";

import { SectionPlaceholder } from "@/components/features/section-placeholder";

export const metadata: Metadata = {
  title: "Documents",
};

export default function DocumentsPage() {
  return <SectionPlaceholder title="Documents" />;
}
