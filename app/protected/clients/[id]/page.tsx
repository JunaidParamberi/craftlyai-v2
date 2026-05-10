import { notFound } from "next/navigation";

import { ClientDetailView } from "@/components/features/clients/detail/client-detail-view";
import { FormPageShell } from "@/components/shared/form-page-shell";
import { getClientById } from "@/lib/clients/actions";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) {
    notFound();
  }

  return (
    <FormPageShell maxWidth="7xl">
      <ClientDetailView client={client} />
    </FormPageShell>
  );
}
