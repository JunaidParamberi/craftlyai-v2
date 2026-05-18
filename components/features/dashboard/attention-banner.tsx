import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import type { AttentionItem } from "@/lib/dashboard/types";

type Props = {
  items: AttentionItem[];
};

export function AttentionBanner({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Items needing attention"
      className="rounded-xl border border-[color-mix(in_srgb,var(--warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--warning)_8%,transparent)] px-4 py-4 md:px-5"
    >
      <p className="mb-3 flex items-center gap-2 font-semibold text-[var(--warning)] text-sm">
        <TriangleAlert />
        {items.length} item{items.length !== 1 ? "s" : ""} need your attention
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={`${item.type}-${item.id}`}>
            <Link
              href={item.href}
              className="flex items-center justify-between gap-3 rounded-lg bg-[color-mix(in_srgb,var(--warning)_5%,transparent)] px-3 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--warning)_12%,transparent)]"
            >
              <span className="min-w-0 text-sm leading-snug">{item.label}</span>
              <span className="shrink-0 text-[var(--warning)] text-xs font-medium">
                View →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
