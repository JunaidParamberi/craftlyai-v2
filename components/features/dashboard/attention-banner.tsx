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
      className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 md:px-5"
    >
      <p className="mb-3 flex items-center gap-2 font-semibold text-amber-600 text-sm dark:text-amber-500">
        <TriangleAlert />
        {items.length} item{items.length !== 1 ? "s" : ""} need your attention
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={`${item.type}-${item.id}`}>
            <Link
              href={item.href}
              className="flex items-center justify-between gap-3 rounded-lg bg-amber-500/5 px-3 py-2.5 transition-colors hover:bg-amber-500/15"
            >
              <span className="min-w-0 text-sm leading-snug">{item.label}</span>
              <span className="shrink-0 text-amber-600 text-xs font-medium dark:text-amber-500">
                View →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
