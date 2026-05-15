"use client";

import { Trash2 } from "lucide-react";
import { parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { formatActivityTimestamp } from "@/lib/dashboard/activity-utils";
import { deleteNotification, markNotificationRead } from "@/lib/notifications/actions";
import { isUnread } from "@/lib/notifications/notification-utils";
import type { NotificationRow } from "@/types";
import { cn } from "@/lib/utils";

import { NOTIFICATION_STYLES } from "./notification-styles";

type Props = {
  notification: NotificationRow;
  showUnreadAccent?: boolean;
  onNavigate?: () => void;
};

export function NotificationItem({
  notification,
  showUnreadAccent = false,
  onNavigate,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const style = NOTIFICATION_STYLES[notification.type];
  const Icon = style.icon;
  const unread = isUnread(notification);

  const handleClick = () => {
    startTransition(async () => {
      if (unread) {
        await markNotificationRead(notification.id);
      }
      onNavigate?.();
      router.push(notification.payload.href);
      router.refresh();
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    startDelete(async () => {
      await deleteNotification(notification.id);
      router.refresh();
    });
  };

  return (
    <div
      className={cn(
        "group relative flex w-full items-start gap-3 px-4 py-3",
        "transition-colors duration-100 hover:bg-muted/50",
        showUnreadAccent && unread && "bg-muted/25",
        (pending || deletePending) && "opacity-50"
      )}
    >
      {/* Left accent bar for unread */}
      {showUnreadAccent && unread && (
        <span
          aria-hidden
          className={cn(
            "absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full",
            style.accentClass
          )}
        />
      )}

      {/* Clickable area */}
      <button
        type="button"
        disabled={pending || deletePending}
        onClick={handleClick}
        className="flex min-w-0 flex-1 items-start gap-3 text-start disabled:pointer-events-none"
      >
        {/* Icon */}
        <div
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl",
            style.container
          )}
        >
          <Icon className={cn("size-3.5", style.iconClass)} />
        </div>

        {/* Text */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p
            className={cn(
              "text-[13px] leading-snug",
              unread
                ? "font-semibold text-foreground"
                : "font-medium text-foreground/75"
            )}
          >
            {notification.payload.label}
          </p>
          <p className="text-[11px] text-muted-foreground/60">
            {formatActivityTimestamp(parseISO(notification.created_at))}
          </p>
        </div>
      </button>

      {/* Right: unread dot + per-item delete */}
      <div className="flex shrink-0 flex-col items-center gap-1.5 pt-1">
        {unread && (
          <span
            aria-hidden
            className={cn("size-1.5 rounded-full", style.accentClass)}
          />
        )}
        <button
          type="button"
          disabled={deletePending || pending}
          onClick={handleDelete}
          aria-label="Delete notification"
          className={cn(
            "flex size-5 items-center justify-center rounded-md",
            "text-muted-foreground/30 opacity-0 transition-opacity group-hover:opacity-100",
            "hover:bg-muted hover:text-muted-foreground",
            "disabled:pointer-events-none"
          )}
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  );
}
