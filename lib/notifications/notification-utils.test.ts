import { describe, expect, it } from "vitest";

import type { NotificationRow } from "@/types";

import {
  formatNotificationBadgeCount,
  groupNotificationsByTime,
  normalizeNotificationPayload,
  partitionNotifications,
} from "./notification-utils";

function row(
  overrides: Partial<NotificationRow> & Pick<NotificationRow, "id" | "created_at">
): NotificationRow {
  return {
    user_id: "u1",
    type: "invoice_paid",
    payload: {
      href: "/documents/d1",
      label: "Invoice paid",
      entity_id: "d1",
    },
    read_at: null,
    action_taken_at: null,
    updated_at: overrides.created_at,
    ...overrides,
  };
}

describe("normalizeNotificationPayload", () => {
  it("returns payload when valid", () => {
    expect(
      normalizeNotificationPayload({
        href: "/documents/x",
        label: "Test",
        entity_id: "x",
      })
    ).toEqual({
      href: "/documents/x",
      label: "Test",
      entity_id: "x",
    });
  });

  it("returns null when invalid", () => {
    expect(normalizeNotificationPayload({ href: "/x" })).toBeNull();
  });
});

describe("partitionNotifications", () => {
  it("splits unread and read", () => {
    const { unread, read } = partitionNotifications([
      row({ id: "1", created_at: "2026-05-15T10:00:00Z", read_at: null }),
      row({
        id: "2",
        created_at: "2026-05-14T10:00:00Z",
        read_at: "2026-05-14T12:00:00Z",
      }),
    ]);
    expect(unread).toHaveLength(1);
    expect(read).toHaveLength(1);
  });
});

describe("formatNotificationBadgeCount", () => {
  it("returns null for zero", () => {
    expect(formatNotificationBadgeCount(0)).toBeNull();
  });

  it("caps at 9+", () => {
    expect(formatNotificationBadgeCount(10)).toBe("9+");
    expect(formatNotificationBadgeCount(3)).toBe("3");
  });
});

describe("groupNotificationsByTime", () => {
  it("orders groups today before earlier", () => {
    const now = new Date("2026-05-15T14:00:00Z");
    const groups = groupNotificationsByTime(
      [
        row({
          id: "old",
          created_at: "2026-05-01T10:00:00Z",
        }),
        row({
          id: "today",
          created_at: "2026-05-15T09:00:00Z",
        }),
      ],
      now
    );
    expect(groups[0]?.group).toBe("today");
    expect(groups.at(-1)?.group).toBe("earlier");
  });
});
