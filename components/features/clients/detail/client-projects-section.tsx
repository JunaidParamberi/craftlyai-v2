import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderKanban, ArrowRight } from "lucide-react";

export function ClientProjectsSection() {
  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b border-border/60 pb-4">
        <div>
          <CardTitle className="text-base">Active projects</CardTitle>
          <CardDescription>
            Projects linked to this client will appear here.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground"
          nativeButton={false}
          render={<Link href="/protected/projects" />}
        >
          View all
          <ArrowRight className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <FolderKanban className="size-7 text-muted-foreground" />
        </div>
        <div className="max-w-sm space-y-1">
          <p className="font-medium text-sm">No projects yet</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            When you create projects for this client, you&apos;ll see status,
            dates, and billing at a glance.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/protected/projects/new" />}>
          Create project
        </Button>
      </CardContent>
    </Card>
  );
}
