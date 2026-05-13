import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Projects",
    template: "%s · Projects",
  },
};

export default function ProjectsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
