import type { Metadata } from "next";

import { SectionPlaceholder } from "@/components/features/section-placeholder";

export const metadata: Metadata = {
  title: "Finance",
};

export default function FinancePage() {
  return <SectionPlaceholder title="Finance" />;
}
