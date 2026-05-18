import type { Metadata } from "next";
import { Plus, Send, Sparkles, Download } from "lucide-react";

import { AIThinking } from "@/components/shared/ai-thinking";
import { HealthRing } from "@/components/shared/health-ring";
import { KpiCard } from "@/components/shared/kpi-card";
import {
  DotPulse,
  InlineLoader,
  ProgressIndeterminate,
  Spinner,
} from "@/components/shared/loaders";
import { MiniBars } from "@/components/shared/mini-bars";
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonChart,
  SkeletonKPI,
  SkeletonList,
  SkeletonTable,
  SkeletonText,
} from "@/components/shared/skeletons";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = { title: "Design system" };

const SURFACE_TOKENS = [
  { name: "Canvas", token: "--bg-canvas" },
  { name: "Surface", token: "--bg-surface" },
  { name: "Subtle", token: "--bg-subtle" },
  { name: "Sunken", token: "--bg-sunken" },
];

const FOREGROUND_TOKENS = [
  { name: "Primary", token: "--fg" },
  { name: "Secondary", token: "--fg-2" },
  { name: "Tertiary", token: "--fg-3" },
];

const ACCENT_TOKENS = [
  { name: "Accent", token: "--accent" },
  { name: "Hover", token: "--accent-hover" },
  { name: "Press", token: "--accent-press" },
  { name: "Soft", token: "--accent-soft" },
];

const SEMANTIC_TOKENS = [
  { name: "Success", token: "--success" },
  { name: "Warning", token: "--warning" },
  { name: "Danger", token: "--danger" },
  { name: "Info", token: "--info" },
];

const STATUS_KEYS = [
  "paid",
  "sent",
  "draft",
  "overdue",
  "partially_paid",
  "active",
  "planning",
  "on_hold",
  "done",
  "todo",
  "in_progress",
  "cancelled",
  "high",
  "med",
  "low",
  "approved",
];

const TYPE_SAMPLES = [
  { size: 38, name: "Display / 4xl" },
  { size: 30, name: "Display / 3xl" },
  { size: 24, name: "Display / 2xl" },
  { size: 20, name: "Display / xl" },
  { size: 15, name: "Body / md" },
  { size: 14, name: "Body / base" },
  { size: 12.5, name: "Body / sm" },
];

function Swatch({ name, token }: { name: string; token: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-16 rounded-md border"
        style={{
          background: `var(${token})`,
          borderColor: "var(--border)",
        }}
      />
      <div className="text-[12px] font-medium text-foreground">{name}</div>
      <code className="text-[10.5px] text-muted-foreground tracking-tight">
        {token}
      </code>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-heading text-[20px] font-semibold tracking-[-0.012em] text-foreground">
        {title}
      </h2>
      {description && (
        <p className="text-[13px] text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="flex flex-col gap-10">
      {/* Page header */}
      <div className="flex flex-col gap-2 reveal">
        <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Design system v0.1
        </p>
        <h1 className="font-heading text-[30px] font-bold tracking-[-0.03em] text-foreground max-w-2xl">
          A calm, focused system for craftspeople who run a studio of one.
        </h1>
        <p className="max-w-2xl text-[13px] text-muted-foreground">
          Linear-light density, generous whitespace, muted blue accent, Inter
          Tight display + Inter body. Every token maps to shadcn/ui CSS
          variables — swap themes by editing one block.
        </p>
      </div>

      {/* Colors */}
      <section className="flex flex-col gap-5">
        <SectionHeading
          title="Colors"
          description="All swatches resolve to tokens in styles/tokens.css. No hand-written hex in components."
        />
        <div className="flex flex-col gap-6">
          {[
            { label: "Surfaces", items: SURFACE_TOKENS },
            { label: "Foreground", items: FOREGROUND_TOKENS },
            { label: "Accent · muted blue", items: ACCENT_TOKENS },
            { label: "Semantic", items: SEMANTIC_TOKENS },
          ].map((group) => (
            <div key={group.label} className="flex flex-col gap-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {group.label}
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {group.items.map((item) => (
                  <Swatch key={item.token} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="flex flex-col gap-5">
        <SectionHeading
          title="Typography"
          description="Inter Tight (display) + Inter (body) + JetBrains Mono (code). Sentence case for headings."
        />
        <Card>
          <CardContent className="flex flex-col gap-5 pt-6">
            {TYPE_SAMPLES.map((s) => (
              <div
                key={s.name}
                className="flex flex-col gap-1 border-b border-border/60 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {s.name} · {s.size}px
                </div>
                <div
                  className="font-heading"
                  style={{ fontSize: s.size, lineHeight: 1.25 }}
                >
                  The quick brown fox jumps over the lazy dog.
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Eyebrow · 10.5px / 0.08em tracking
              </div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-foreground">
                Eyebrow label
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Buttons */}
      <section className="flex flex-col gap-5">
        <SectionHeading
          title="Buttons"
          description="Primary · outline · ghost · destructive. Sizes: sm / default / lg."
        />
        <Card>
          <CardContent className="flex flex-wrap gap-3 pt-6">
            <Button>
              <Plus />
              Primary
            </Button>
            <Button variant="outline">
              <Download />
              Outline
            </Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">
              <Send />
              Large
            </Button>
            <Button disabled>
              <Sparkles />
              Disabled
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Inputs */}
      <section className="flex flex-col gap-5">
        <SectionHeading title="Inputs" />
        <Card>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-foreground">
                Client name
              </label>
              <Input placeholder="Hawthorn & Co" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-foreground">
                Email
              </label>
              <Input type="email" placeholder="theo@hawthorn.co" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Badges */}
      <section className="flex flex-col gap-5">
        <SectionHeading
          title="Badges + Status"
          description="StatusBadge maps invoice / project / task / quote states to canonical tones."
        />
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="secondary">Secondary</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_KEYS.map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* KPI card */}
      <section className="flex flex-col gap-5">
        <SectionHeading title="KPI cards" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Revenue"
            value="$42,180"
            delta="+12%"
            trend="up"
            sub="vs last month"
          />
          <KpiCard
            label="Outstanding"
            value="$12,640"
            sub="3 unpaid invoices"
          />
          <KpiCard
            label="Overdue"
            value="1"
            sub="$2,850 at risk"
            variant="danger"
          />
          <KpiCard
            label="Avg. pay time"
            value="11.2d"
            delta="-2.1d"
            trend="up"
            sub="faster than Q1"
          />
        </div>
      </section>

      {/* Progress + Health ring + MiniBars */}
      <section className="flex flex-col gap-5">
        <SectionHeading title="Progress · Health ring · MiniBars" />
        <Card>
          <CardContent className="grid gap-8 pt-6 sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Progress
              </div>
              <Progress value={68} />
              <Progress value={34} />
              <Progress value={92} />
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Health ring
              </div>
              <div className="flex items-center gap-4">
                <HealthRing score={92} />
                <HealthRing score={68} />
                <HealthRing score={34} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Mini bars
              </div>
              <MiniBars values={[3, 5, 2, 8, 4, 6, 7]} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Skeletons */}
      <section className="flex flex-col gap-5">
        <SectionHeading
          title="Skeletons"
          description="Loading placeholders that mirror final layout. No CLS."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>KPI + List</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <SkeletonKPI />
              <SkeletonList count={3} withAvatar />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Text / Avatar / Block</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <SkeletonAvatar size={32} />
                <div className="flex-1">
                  <SkeletonText lines={2} />
                </div>
              </div>
              <Skeleton h={48} r={6} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonChart height={180} />
            </CardContent>
          </Card>
          <SkeletonCard title body lines={4} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Table</CardTitle>
          </CardHeader>
          <CardContent>
            <SkeletonTable
              rows={4}
              cols={5}
              headers={["Project", "Client", "Status", "Value", "Deadline"]}
            />
          </CardContent>
        </Card>
      </section>

      {/* Loaders */}
      <section className="flex flex-col gap-5">
        <SectionHeading
          title="Loaders"
          description="Active indicators for user-triggered or AI work. Never AIThinking + spinner together."
        />
        <Card>
          <CardContent className="grid gap-6 pt-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Spinner
              </div>
              <div className="flex items-center gap-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Dot pulse
              </div>
              <DotPulse accent />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Indeterminate
              </div>
              <ProgressIndeterminate />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                AI thinking (brand)
              </div>
              <AIThinking label="Drafting follow-up" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Inline loader
              </div>
              <InlineLoader label="Saving changes" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Card variants */}
      <section className="flex flex-col gap-5">
        <SectionHeading title="Cards" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Default card</CardTitle>
              <CardDescription>
                shadow-xs at rest, shadow-sm on hover. 12px radius. 1px border.
              </CardDescription>
            </CardHeader>
            <CardContent>
              Body content lives here. 16px padding inside.
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Small card</CardTitle>
              <CardDescription>Tighter padding.</CardDescription>
            </CardHeader>
            <CardContent>Compact variant.</CardContent>
          </Card>
          <Card
            style={{
              borderStyle: "dashed",
              background: "var(--bg-subtle)",
            }}
          >
            <CardHeader>
              <CardTitle>Dashed</CardTitle>
              <CardDescription>For explainer / placeholder.</CardDescription>
            </CardHeader>
            <CardContent>Use sparingly.</CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
