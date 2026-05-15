"use client";

import { Bell, BellOff, BellRing, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { useBrowserNotifications } from "@/hooks/use-browser-notifications";
import { clearAllNotifications, markAllNotificationsRead } from "@/lib/notifications/actions";
import {
  groupNotificationsByTime,
  partitionNotifications,
  TIME_GROUP_LABELS,
} from "@/lib/notifications/notification-utils";
import type { NotificationRow } from "@/types";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { NotificationItem } from "./notification-item";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: NotificationRow[];
  unreadCount: number;
  browserPermission: NotificationPermission;
};

function SectionLabel({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-2.5 px-4 pb-1 pt-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
        {label}
      </span>
      {count != null && count > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-semibold leading-none text-primary">
          {count}
        </span>
      )}
      <div className="h-px flex-1 bg-border/30" />
    </div>
  );
}

function NotificationSection({
  title,
  items,
  showUnreadAccent,
  onNavigate,
}: {
  title: string;
  items: NotificationRow[];
  showUnreadAccent: boolean;
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center gap-2 px-4 pb-0.5 pt-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground/40">
          {title}
        </span>
      </div>
      {items.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          showUnreadAccent={showUnreadAccent}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

function BrowserNotificationPrompt({
  permission,
}: {
  permission: NotificationPermission;
}) {
  const { requestPermission, supported } = useBrowserNotifications();

  if (!supported || permission === "granted" || permission === "denied") {
    return null;
  }

  return (
    <div className="mx-3 mb-1 mt-2 flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
      <BellRing className="size-3.5 shrink-0 text-muted-foreground" />
      <p className="min-w-0 flex-1 text-[11px] leading-snug text-muted-foreground">
        Get browser alerts for new activity
      </p>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="h-6 shrink-0 px-2.5 text-[11px] font-medium"
        onClick={requestPermission}
      >
        Enable
      </Button>
    </div>
  );
}

function BrowserNotificationDenied() {
  return (
    <div className="mx-3 mb-1 mt-2 flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2">
      <BellOff className="size-3.5 shrink-0 text-muted-foreground/50" />
      <p className="text-[11px] text-muted-foreground/60">
        Browser alerts blocked — enable in browser settings
      </p>
    </div>
  );
}

export function NotificationSheet({
  open,
  onOpenChange,
  notifications,
  unreadCount,
  browserPermission,
}: Props) {
  const router = useRouter();
  const [markAllPending, startMarkAll] = useTransition();
  const [clearPending, startClear] = useTransition();
  const { unread, read } = partitionNotifications(notifications);
  const unreadGroups = groupNotificationsByTime(unread);
  const readGroups = groupNotificationsByTime(read);

  const handleMarkAll = () => {
    startMarkAll(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  };

  const handleClearAll = () => {
    startClear(async () => {
      await clearAllNotifications();
      router.refresh();
    });
  };

  const close = () => onOpenChange(false);
  const hasAny = notifications.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-sm"
      >
        {/* Header */}
        <SheetHeader className="flex-none border-b border-border/50 px-4 pb-2.5 pt-3.5">
          {/* Title row — pr-10 clears shadcn's built-in X button */}
          <div className="flex items-center gap-2.5 pr-10">
            <div className="flex size-6 items-center justify-center rounded-md bg-muted">
              <Bell className="size-3.5 text-muted-foreground" />
            </div>
            <SheetTitle className="text-sm font-semibold tracking-tight">
              Notifications
            </SheetTitle>
            {unreadCount > 0 && (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Actions row — anchored left, away from Sheet's X */}
          {hasAny && (
            <div className="flex items-center gap-1.5 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 rounded-md px-2 text-[11px] font-medium text-muted-foreground/60 hover:text-destructive gap-1"
                disabled={clearPending || markAllPending}
                onClick={handleClearAll}
              >
                <Trash2 className="size-3" />
                Clear all
              </Button>
              {unreadCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 rounded-md px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                  disabled={markAllPending || clearPending}
                  onClick={handleMarkAll}
                >
                  Mark all read
                </Button>
              )}
            </div>
          )}
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          {/* Browser notification opt-in / denied banner */}
          {browserPermission !== "granted" && (
            browserPermission === "denied" ? (
              <BrowserNotificationDenied />
            ) : (
              <BrowserNotificationPrompt permission={browserPermission} />
            )
          )}

          {!hasAny ? (
            /* Empty state */
            <div className="flex flex-col items-center gap-5 px-6 py-16 text-center">
              <div className="relative flex size-14 items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-muted/60" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-border/40" />
                <Bell className="relative size-6 text-muted-foreground/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-semibold text-foreground">
                  All caught up
                </p>
                <p className="max-w-[200px] text-xs leading-relaxed text-muted-foreground">
                  Invoice payments, quote approvals, and client activity show up here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col pb-8 pt-1">
              {/* Unread section */}
              {unread.length > 0 && (
                <div>
                  <SectionLabel label="Unread" count={unread.length} />
                  {unreadGroups.map(({ group, items }) => (
                    <NotificationSection
                      key={`unread-${group}`}
                      title={TIME_GROUP_LABELS[group]}
                      items={items}
                      showUnreadAccent
                      onNavigate={close}
                    />
                  ))}
                </div>
              )}

              {/* Read section — "Read" divider only shown when unread section also exists */}
              {read.length > 0 && (
                <div className={unread.length > 0 ? "mt-2" : ""}>
                  {unread.length > 0 && <SectionLabel label="Read" />}
                  {readGroups.map(({ group, items }) => (
                    <NotificationSection
                      key={`read-${group}`}
                      title={TIME_GROUP_LABELS[group]}
                      items={items}
                      showUnreadAccent={false}
                      onNavigate={close}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
