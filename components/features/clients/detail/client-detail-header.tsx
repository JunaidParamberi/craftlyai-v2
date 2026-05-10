"use client";

import Link from "next/link";

import {
  clientMonogram,
  clientTaglineFromNotes,
  formatClientSince,
} from "@/lib/clients/display";
import type { ClientRow } from "@/types";
import { cn } from "@/lib/utils";

import { DeleteClientButton } from "@/components/features/clients/delete-client-button";
import { ClientHealthBadge } from "@/components/features/clients/detail/client-health-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Calendar,
  LayoutTemplate,
  MapPin,
  MoreHorizontal,
  Pencil,
} from "lucide-react";

type ClientDetailHeaderProps = {
  client: ClientRow;
};

export function ClientDetailHeader({ client }: ClientDetailHeaderProps) {
  const tagline = clientTaglineFromNotes(client.notes);
  const clientSince = formatClientSince(client.created_at);

  return (
    <TooltipProvider delay={300}>
      <div className="flex flex-col gap-6">
        <Link
          href="/clients"
          className={cn(
            "inline-flex w-fit items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground",
          )}
        >
          <ArrowLeft className="size-4" />
          Back to clients
        </Link>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-muted font-heading text-xl font-semibold text-muted-foreground">
              {clientMonogram(client.name)}
            </div>
            <div className="min-w-0 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                  {client.name}
                </h1>
                <ClientHealthBadge healthScore={client.health_score} />
              </div>
              {client.company ? (
                <p className="text-muted-foreground text-sm">{client.company}</p>
              ) : null}
              {tagline ? (
                <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
                  {tagline}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
                {client.address?.trim() ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0 opacity-80" />
                    <span className="min-w-0">{client.address.trim()}</span>
                  </span>
                ) : null}
                {clientSince ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5 shrink-0 opacity-80" />
                    Client since {clientSince}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <Button
              nativeButton={false}
              render={<Link href={`/clients/${client.id}/edit`} />}
            >
              <Pencil />
              Edit client
            </Button>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button type="button" variant="outline" disabled>
                    <LayoutTemplate />
                    Log activity
                  </Button>
                }
              />
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>
            <DeleteClientButton clientId={client.id} clientName={client.name} />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="More actions"
                  >
                    <MoreHorizontal />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  render={<Link href={`/clients/${client.id}/edit`} />}
                >
                  Edit details
                </DropdownMenuItem>
                <DropdownMenuItem disabled>Duplicate client</DropdownMenuItem>
                <DropdownMenuItem disabled>Export</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
