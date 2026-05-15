import type { Metadata } from "next";

import { PortalDocumentList } from "@/components/features/portal/portal-document-list";
import { PortalNotFound } from "@/components/features/portal/portal-not-found";
import { PortalShell } from "@/components/features/portal/portal-shell";
import {
  getClientByPortalToken,
  getPortalBrandContext,
  listPortalDocuments,
} from "@/lib/portal/public-queries";

type PageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Client Portal",
};

export default async function ClientPortalPage({ params }: PageProps) {
  const { token } = await params;
  const client = await getClientByPortalToken(token);

  if (!client) {
    return (
      <PortalNotFound
        title="Portal not found"
        message="This client portal link is invalid or has been regenerated."
      />
    );
  }

  const [brand, documents] = await Promise.all([
    getPortalBrandContext(client.user_id),
    listPortalDocuments(client.id),
  ]);

  return (
    <PortalShell
      brand={brand}
      subtitle={`Prepared for ${client.name}`}
      footer="Your documents and payments are handled securely."
    >
      <PortalDocumentList documents={documents} clientName={client.name} />
    </PortalShell>
  );
}
