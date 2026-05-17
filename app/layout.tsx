import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { branding } from "@/config/branding";
import { siteConfig } from "@/config/site";
import { appTitleTemplate } from "@/lib/metadata";

import "@/styles/globals.css";
import { cn } from "@/lib/utils";

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const metadataBase =
  process.env.NEXT_PUBLIC_APP_URL != null &&
  process.env.NEXT_PUBLIC_APP_URL.length > 0
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined;

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: siteConfig.name,
    template: appTitleTemplate,
  },
  description: siteConfig.description,
  icons: {
    icon: [{ url: branding.appIcon, type: "image/png" }],
    apple: [{ url: branding.appIcon, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    images: [{ url: branding.appIcon }],
  },
  twitter: {
    card: "summary",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [branding.appIcon],
  },
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
      className={cn(
        "font-sans",
        inter.variable,
        interTight.variable,
        jetbrainsMono.variable,
      )}
    >
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-dvh font-sans antialiased",
          inter.variable,
          interTight.variable,
          jetbrainsMono.variable,
        )}
      >
        <ThemeProvider>
          <TooltipProvider delay={200}>{children}</TooltipProvider>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
