import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Settings",
    template: "%s · Settings",
  },
};

export default function SettingsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
