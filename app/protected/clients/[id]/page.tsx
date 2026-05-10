import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientForm } from "@/components/features/clients/client-form";
import { DeleteClientButton } from "@/components/features/clients/delete-client-button";
import { getClientById } from "@/lib/clients/actions";
import { clientRowToFormValues } from "@/lib/clients/form-values";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

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

  const formDefaults = clientRowToFormValues(client);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <Link
            href="/protected/clients"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-fit gap-2 px-2 -ms-2",
            )}
          >
            <ArrowLeft />
            Clients
          </Link>
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              {client.name}
            </h1>
            {client.company ? (
              <p className="text-muted-foreground text-sm">{client.company}</p>
            ) : null}
          </div>
        </div>
        <div className="shrink-0">
          <DeleteClientButton clientId={client.id} clientName={client.name} />
        </div>
      </div>

      <ClientForm
        mode="edit"
        clientId={client.id}
        defaultValues={formDefaults}
      />
    </div>
  );
}
