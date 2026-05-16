import Link from "next/link";
import { Plus } from "lucide-react";

import { listClients } from "@/lib/clients/actions";
import { getProfile } from "@/lib/profile/actions";
import { getPlanLimit } from "@/lib/plan-usage/helpers";
import { paginatedListSkeletonCount } from "@/lib/ui/skeleton-count";
import { SkeletonCountRecorder } from "@/hooks/use-skeleton-count";
import { ClientsTable } from "@/components/features/clients/clients-table";
import { AddClientButton } from "@/components/features/clients/add-client-button";
import { PageHeader } from "@/components/shared/page-header";
import { UpgradeGhostRow } from "@/components/features/billing/upgrade-ghost-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PlanTier } from "@/config/plans";

export default async function ClientsPage() {
  const [clientsResult, profileResult] = await Promise.all([
    listClients(),
    getProfile(),
  ]);

  if (!clientsResult.ok) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Clients
        </h1>
        <p className="text-destructive text-sm">{clientsResult.message}</p>
      </div>
    );
  }

  const { clients } = clientsResult;
  const planTier = (profileResult.ok && profileResult.profile?.plan_tier
    ? profileResult.profile.plan_tier
    : "free") as PlanTier;
  const clientLimit = getPlanLimit(planTier, "clients");
  const atLimit = clients.length >= clientLimit;

  return (
    <div className="flex flex-col gap-8">
      <SkeletonCountRecorder
        id="clients:list"
        count={paginatedListSkeletonCount(clients.length)}
      />
      <PageHeader
        eyebrow="Clients"
        title="Clients"
        description="People and companies you work with. Add billing details now or come back anytime."
        actions={
          <AddClientButton
            atLimit={atLimit}
            planTier={planTier}
            clientLimit={clientLimit}
          />
        }
      />

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
        <div className="flex flex-col gap-3">
          <ClientsTable clients={clients} />
          {atLimit && (
            <UpgradeGhostRow
              title="Add more clients"
              description="Upgrade to Starter — 15 clients, unlimited documents"
            />
          )}
        </div>
      )}
    </div>
  );
}
