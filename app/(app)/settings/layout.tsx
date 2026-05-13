import type { Metadata } from "next";
import type { ReactNode } from "react";

import { sectionTitleTemplate } from "@/lib/metadata";

export const metadata: Metadata = {
  title: {
    default: "Settings",
    template: sectionTitleTemplate("Settings"),
  },
};

export default function SettingsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
