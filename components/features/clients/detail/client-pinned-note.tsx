import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";

type ClientPinnedNoteProps = {
  notes: string;
  editHref: string;
  updatedAtLabel?: string;
};

export function ClientPinnedNote({
  notes,
  editHref,
  updatedAtLabel,
}: ClientPinnedNoteProps) {
  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-4">
        <CardTitle className="text-base">Pinned note</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground"
          nativeButton={false}
          render={<Link href={editHref} />}
        >
          <Pencil className="size-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <blockquote className="rounded-xl border-s-4 border-primary bg-muted/30 px-4 py-3 text-sm leading-relaxed">
          <p className="whitespace-pre-wrap">{notes.trim()}</p>
        </blockquote>
        {updatedAtLabel ? (
          <p className="mt-3 text-muted-foreground text-xs">{updatedAtLabel}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
