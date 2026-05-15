"use client";

import Link from "next/link";

import { formatLastUpdated } from "@/lib/clients/display";
import type { ClientRow, DocumentListRow, ProjectListRow } from "@/types";

import { ClientDocumentsSection } from "@/components/features/clients/detail/client-documents-section";
import { ClientPortalLinkCard } from "@/components/features/clients/detail/client-portal-link-card";

import { ClientFinancialSummaryCard } from "@/components/features/clients/detail/client-financial-summary-card";
import { ClientPinnedNote } from "@/components/features/clients/detail/client-pinned-note";
import { ClientPrimaryContactCard } from "@/components/features/clients/detail/client-primary-contact-card";
import { ClientProjectsSection } from "@/components/features/clients/detail/client-projects-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History } from "lucide-react";

type ClientDetailTabsProps = {
  client: ClientRow;
  projects: ProjectListRow[];
  documents: DocumentListRow[];
  portalUrl: string | null;
};

export function ClientDetailTabs({
  client,
  projects,
  documents,
  portalUrl,
}: ClientDetailTabsProps) {
  const editHref = `/clients/${client.id}/edit`;
  const hasNotes = Boolean(client.notes?.trim());
  const updatedLabel = formatLastUpdated(client.updated_at)
    ? `Last updated ${formatLastUpdated(client.updated_at)}`
    : undefined;

  return (
    <Tabs defaultValue="overview" className="gap-6">
      <TabsList
        variant="line"
        className="h-auto w-full min-w-0 flex-wrap justify-start gap-0 bg-transparent p-0"
      >
        <TabsTrigger value="overview">Overview & projects</TabsTrigger>
        <TabsTrigger value="documents" className="gap-2">
          Documents
          <Badge variant="secondary" className="font-normal">
            {documents.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="notes">Notes & activity</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-0">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(260px,320px)] lg:items-start">
          <div className="flex flex-col gap-8">
            <ClientProjectsSection clientId={client.id} projects={projects} />
            {hasNotes ? (
              <ClientPinnedNote
                notes={client.notes!}
                editHref={editHref}
                updatedAtLabel={updatedLabel}
              />
            ) : (
              <Card className="border-dashed border-border/80 bg-muted/20 shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Notes</CardTitle>
                  <CardDescription>
                    Capture relationship context and billing preferences—shown
                    here when added.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={editHref} />}
                  >
                    Add notes in edit
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="flex flex-col gap-6">
            <ClientPortalLinkCard
              clientId={client.id}
              initialPortalToken={client.portal_token}
            />
            <ClientFinancialSummaryCard />
            <ClientPrimaryContactCard client={client} />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="documents" className="mt-0">
        <ClientDocumentsSection documents={documents} portalUrl={portalUrl} />
      </TabsContent>

      <TabsContent value="notes" className="mt-0">
        <div className="flex flex-col gap-6">
          {hasNotes ? (
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Workspace notes</CardTitle>
                <CardDescription>
                  Same content as the pinned note on Overview—full notes field.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {client.notes!.trim()}
                </p>
              </CardContent>
            </Card>
          ) : null}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2">
              <History className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Timeline of emails, meetings, and AI suggestions will appear
                here when the activity feed is connected.
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
