import type { Metadata } from "next";
import type { ReactNode } from "react";

import { sectionTitleTemplate } from "@/lib/metadata";

export const metadata: Metadata = {
  title: {
    default: "Clients",
    template: sectionTitleTemplate("Clients"),
  },
};

export default function ClientsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
