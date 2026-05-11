"use client";

import type { ClientRow, ProjectListRow } from "@/types";

import { ClientDetailHeader } from "@/components/features/clients/detail/client-detail-header";
import { ClientDetailTabs } from "@/components/features/clients/detail/client-detail-tabs";

type ClientDetailViewProps = {
  client: ClientRow;
  projects: ProjectListRow[];
};

export function ClientDetailView({ client, projects }: ClientDetailViewProps) {
  return (
    <div className="flex flex-col gap-8">
      <ClientDetailHeader client={client} />
      <ClientDetailTabs client={client} projects={projects} />
    </div>
  );
}
