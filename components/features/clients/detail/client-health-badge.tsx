import { Heart } from "lucide-react";

import { healthPresentation } from "@/lib/clients/display";

import { Badge } from "@/components/ui/badge";

type ClientHealthBadgeProps = {
  healthScore: number | null;
};

export function ClientHealthBadge({ healthScore }: ClientHealthBadgeProps) {
  const pr = healthPresentation(healthScore);
  if (!pr) {
    return (
      <Badge variant="outline" className="gap-1 font-normal">
        <Heart className="size-3 opacity-70" />
        Health not set
      </Badge>
    );
  }

  return (
    <Badge variant={pr.variant} className="gap-1 font-normal uppercase tracking-wide">
      <Heart className="size-3 opacity-90" />
      {pr.label}
    </Badge>
  );
}
