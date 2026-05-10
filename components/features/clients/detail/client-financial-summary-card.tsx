import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileText } from "lucide-react";

export function ClientFinancialSummaryCard() {
  return (
    <TooltipProvider>
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardDescription className="text-xs font-semibold tracking-wide uppercase">
            Financial summary
          </CardDescription>
          <CardTitle className="sr-only">Financial summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-muted-foreground text-xs">Total billed (YTD)</p>
            <p className="font-heading text-2xl font-semibold tabular-nums tracking-tight">
              —
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-muted-foreground text-xs">Outstanding</p>
            <Badge variant="outline" className="font-normal">
              —
            </Badge>
            <span
              className="text-muted-foreground text-xs"
              title="Default terms when invoicing ships"
            >
              Net 30
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="inline-flex w-full">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled
                    type="button"
                  >
                    <FileText />
                    View invoices
                  </Button>
                </span>
              }
            />
            <TooltipContent>Coming with invoicing (Phase 2)</TooltipContent>
          </Tooltip>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Revenue and balances will sync from invoices once Document Studio
            ships.
          </p>
          <Link
            href="/protected/finance"
            className="text-primary text-xs underline-offset-4 hover:underline"
          >
            Open finance (preview)
          </Link>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
