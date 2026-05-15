import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { NotificationType } from "@/types";

export const NOTIFICATION_STYLES: Record<
  NotificationType,
  {
    icon: LucideIcon;
    container: string;
    iconClass: string;
    borderClass: string;
    accentClass: string;
  }
> = {
  invoice_paid: {
    icon: CheckCircle2,
    container: "bg-emerald-500/12 dark:bg-emerald-500/15",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-500",
    accentClass: "bg-emerald-500",
  },
  invoice_overdue: {
    icon: AlertCircle,
    container: "bg-red-500/12 dark:bg-red-500/15",
    iconClass: "text-red-600 dark:text-red-400",
    borderClass: "border-destructive",
    accentClass: "bg-destructive",
  },
  quote_approved: {
    icon: ThumbsUp,
    container: "bg-emerald-500/12 dark:bg-emerald-500/15",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-500",
    accentClass: "bg-emerald-500",
  },
  proposal_approved: {
    icon: ThumbsUp,
    container: "bg-emerald-500/12 dark:bg-emerald-500/15",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-500",
    accentClass: "bg-emerald-500",
  },
  quote_declined: {
    icon: ThumbsDown,
    container: "bg-red-500/12 dark:bg-red-500/15",
    iconClass: "text-red-600 dark:text-red-400",
    borderClass: "border-destructive",
    accentClass: "bg-destructive",
  },
  doc_sent: {
    icon: Send,
    container: "bg-blue-500/12 dark:bg-blue-500/15",
    iconClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-500",
    accentClass: "bg-blue-500",
  },
  task_due: {
    icon: Clock,
    container: "bg-amber-500/12 dark:bg-amber-500/15",
    iconClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-500",
    accentClass: "bg-amber-500",
  },
  task_overdue: {
    icon: Clock,
    container: "bg-amber-500/12 dark:bg-amber-500/15",
    iconClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-500",
    accentClass: "bg-amber-500",
  },
};
