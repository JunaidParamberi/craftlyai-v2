import { differenceInCalendarDays, parseISO, startOfDay } from "date-fns";

import type { NotificationRow } from "@/types";

export type NotificationTimeGroup = "today" | "yesterday" | "earlier";

export function normalizeNotificationPayload(
  raw: unknown
): NotificationRow["payload"] | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  if (
    typeof p.href !== "string" ||
    typeof p.label !== "string" ||
    typeof p.entity_id !== "string"
  ) {
    return null;
  }
  return { href: p.href, label: p.label, entity_id: p.entity_id };
}

export function partitionNotifications(notifications: NotificationRow[]): {
  unread: NotificationRow[];
  read: NotificationRow[];
} {
  const unread: NotificationRow[] = [];
  const read: NotificationRow[] = [];
  for (const n of notifications) {
    if (n.read_at === null) unread.push(n);
    else read.push(n);
  }
  return { unread, read };
}

export function notificationTimeGroup(
  createdAt: string,
  now = new Date()
): NotificationTimeGroup {
  const date = startOfDay(parseISO(createdAt));
  const ref = startOfDay(now);
  const diffDays = differenceInCalendarDays(ref, date);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  return "earlier";
}

export function groupNotificationsByTime(
  items: NotificationRow[],
  now = new Date()
): { group: NotificationTimeGroup; items: NotificationRow[] }[] {
  const buckets: Record<NotificationTimeGroup, NotificationRow[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  };
  const sorted = [...items].sort(
    (a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()
  );
  for (const item of sorted) {
    buckets[notificationTimeGroup(item.created_at, now)].push(item);
  }
  const order: NotificationTimeGroup[] = ["today", "yesterday", "earlier"];
  return order
    .filter((g) => buckets[g].length > 0)
    .map((group) => ({ group, items: buckets[group] }));
}

export const TIME_GROUP_LABELS: Record<NotificationTimeGroup, string> = {
  today: "Today",
  yesterday: "Yesterday",
  earlier: "Earlier",
};

export function formatNotificationBadgeCount(count: number): string | null {
  if (count <= 0) return null;
  if (count >= 10) return "9+";
  return String(count);
}

export function isUnread(notification: NotificationRow): boolean {
  return notification.read_at === null;
}
