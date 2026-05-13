import Link from "next/link";
import { ChevronRightIcon, PaletteIcon } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Settings · CraftlyAI",
};

const SETTINGS_SECTIONS = [
  {
    href: "/settings/brand",
    icon: PaletteIcon,
    title: "Brand kit",
    description: "Logo, colors, and font applied to invoices and client portals.",
  },
] as const;

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Settings
        </h1>
        <p className="max-w-lg text-sm text-muted-foreground">
          Manage your workspace preferences and account details.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_SECTIONS.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="group outline-none">
            <Card className="h-full transition-colors hover:bg-muted/40 group-focus-visible:ring-2 group-focus-visible:ring-ring">
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                  <Icon className="size-4 text-muted-foreground" aria-hidden />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <CardTitle className="text-sm font-medium">{title}</CardTitle>
                  <CardDescription className="text-xs">{description}</CardDescription>
                </div>
                <ChevronRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
