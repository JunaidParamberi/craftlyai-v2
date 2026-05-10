import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";

import { siteConfig } from "@/config/site";

import "@/styles/globals.css";
import { cn } from "@/lib/utils";

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", dmSans.variable, fraunces.variable)}
    >
      <body
        className={cn(
          "min-h-dvh font-sans antialiased",
          dmSans.variable,
          fraunces.variable,
        )}
      >
        <ThemeProvider>
          <TooltipProvider delay={200}>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
