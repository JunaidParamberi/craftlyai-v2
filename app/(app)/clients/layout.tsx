import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Clients",
    template: "%s · Clients",
  },
};

export default function ClientsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
