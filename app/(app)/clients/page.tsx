import Link from "next/link";

import { listClients } from "@/lib/clients/actions";

import { ClientsTable } from "@/components/features/clients/clients-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";

export default async function ClientsPage() {
  const result = await listClients();

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Clients
        </h1>
        <p className="text-destructive text-sm">{result.message}</p>
      </div>
    );
  }

  const { clients } = result;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Clients
          </h1>
          <p className="max-w-lg text-muted-foreground text-sm">
            People and companies you work with. Add billing details now or come
            back anytime.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/clients/new" />}
        >
          <Plus />
          Add client
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No clients yet</CardTitle>
            <CardDescription>
              When you add a client, they appear here with quick links to their
              profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              nativeButton={false}
              render={<Link href="/clients/new" />}
            >
              <Plus />
              Add your first client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ClientsTable clients={clients} />
      )}
    </div>
  );
}
