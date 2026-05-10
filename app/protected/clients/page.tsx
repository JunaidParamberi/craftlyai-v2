import Link from "next/link";

import { listClients } from "@/lib/clients/actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, ChevronRight, Plus } from "lucide-react";

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
          render={<Link href="/protected/clients/new" />}
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
              render={<Link href="/protected/clients/new" />}
            >
              <Plus />
              Add your first client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {clients.map((c) => (
            <li key={c.id}>
              <Link
                href={`/protected/clients/${c.id}`}
                className="block rounded-2xl ring-1 ring-border transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="border-0 shadow-none ring-0">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <Building2 className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{c.name}</p>
                      <p className="truncate text-muted-foreground text-sm">
                        {[c.company, c.email].filter(Boolean).join(" · ") ||
                          "No company or email"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {c.currency ? (
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {c.currency}
                        </span>
                      ) : null}
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
