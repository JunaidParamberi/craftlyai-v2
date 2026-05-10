import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProfile } from "@/lib/profile/actions";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

export default async function DashboardPage() {
  const result = await getProfile();
  if (!result.ok || result.profile === null) redirect("/auth/login");

  const firstName =
    result.profile.full_name?.trim().split(/\s+/)[0] ?? "there";

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-background px-5 py-8 md:px-8 md:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-24 -top-24 size-72 rounded-full bg-primary/[0.07] blur-3xl"
        />
        <div className="relative flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Overview
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="max-w-xl text-muted-foreground text-sm md:text-base">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-0">
            <p className="font-heading text-3xl font-semibold tabular-nums tracking-tight">
              $12,450
            </p>
            <Badge variant="secondary" className="w-fit gap-1 font-normal">
              <ArrowUpRight />
              +14% vs last month
            </Badge>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active projects
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-0">
            <p className="font-heading text-3xl font-semibold tabular-nums tracking-tight">
              8
            </p>
            <p className="flex items-center gap-2 text-muted-foreground text-xs">
              <Clock />
              3 pending review
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread messages
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-0">
            <p className="font-heading text-3xl font-semibold tabular-nums tracking-tight">
              24
            </p>
            <p className="flex items-center gap-2 text-destructive text-xs">
              <TriangleAlert />
              5 require action
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" size="sm">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>
                Latest updates across clients and documents
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/protected/projects" />}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-0 pt-6">
            <div className="flex gap-3 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted">
                <CheckCircle2 className="text-primary" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-sm font-medium leading-snug">
                  Acme Corp invoice #1042 paid
                </p>
                <p className="text-muted-foreground text-xs">2 hours ago</p>
              </div>
            </div>
            <Separator />
            <div className="flex gap-3 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted">
                <FileText />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-sm font-medium leading-snug">
                  Globex UI draft review requested
                </p>
                <p className="text-muted-foreground text-xs">5 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          size="sm"
          className="border-primary/15 bg-gradient-to-b from-card to-muted/30"
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="text-primary" />
              </div>
              <CardTitle>AI assistant</CardTitle>
            </div>
            <CardDescription>
              Draft your weekly status report for Acme Corp based on recent
              commits.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-col items-stretch gap-2 pt-0">
            <Button variant="outline" type="button" className="w-full">
              Generate draft
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
