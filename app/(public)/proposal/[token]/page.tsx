import type { Metadata } from "next";
import { createClient as createSupabaseServerClient } from "@supabase/supabase-js";
import sanitizeHtml from "sanitize-html";

import { ProposalRespondForm } from "./proposal-respond-form";
import type { LineItemRow, TiptapDoc } from "@/types";

type PageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Review Proposal",
};

// Sanitize options — allow standard prose tags + headings; restrict link attrs to
// prevent javascript: hrefs. Content is produced by Tiptap (user-authored) and
// then sanitized server-side before rendering, making the dangerouslySetInnerHTML
// below safe (XSS-free).
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "h3"]),
  allowedAttributes: { a: ["href", "target", "rel"] },
};

// Lightweight Tiptap JSON → HTML — no DOM dependency needed server-side.
function tiptapToHtml(node: Record<string, unknown>): string {
  const type = node.type as string | undefined;
  const children = Array.isArray(node.content)
    ? (node.content as Record<string, unknown>[]).map(tiptapToHtml).join("")
    : "";

  if (type === "text") {
    let text = String(node.text ?? "");
    const marks = Array.isArray(node.marks) ? node.marks as { type: string; attrs?: Record<string, string> }[] : [];
    for (const mark of marks) {
      if (mark.type === "bold") text = `<strong>${text}</strong>`;
      else if (mark.type === "italic") text = `<em>${text}</em>`;
      else if (mark.type === "code") text = `<code>${text}</code>`;
      else if (mark.type === "link") {
        const href = mark.attrs?.href ?? "#";
        text = `<a href="${href}" target="_blank" rel="noreferrer noopener">${text}</a>`;
      }
    }
    return text;
  }
  if (type === "doc") return children;
  if (type === "paragraph") return children ? `<p>${children}</p>` : "<p></p>";
  if (type === "heading") {
    const level = (node.attrs as { level?: number } | undefined)?.level ?? 2;
    return `<h${level}>${children}</h${level}>`;
  }
  if (type === "bulletList") return `<ul>${children}</ul>`;
  if (type === "orderedList") return `<ol>${children}</ol>`;
  if (type === "listItem") return `<li>${children}</li>`;
  if (type === "blockquote") return `<blockquote>${children}</blockquote>`;
  if (type === "codeBlock") return `<pre><code>${children}</code></pre>`;
  if (type === "horizontalRule") return "<hr />";
  if (type === "hardBreak") return "<br />";
  return children;
}

const supabaseAdmin = createSupabaseServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function ProposalLineItemsReadOnly({
  lineItems,
  currency,
  discountValue = 0,
  discountType = "percent",
}: {
  lineItems: LineItemRow[];
  currency: string;
  discountValue?: number;
  discountType?: "percent" | "flat";
}) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(n);

  const subtotal = lineItems.reduce(
    (sum, li) => sum + Number(li.quantity) * Number(li.unit_price),
    0,
  );
  const taxTotal = lineItems.reduce(
    (sum, li) =>
      sum +
      Number(li.quantity) *
        Number(li.unit_price) *
        (Number(li.tax_rate) / 100),
    0,
  );
  const discount =
    discountType === "flat"
      ? Math.min(discountValue, subtotal)
      : subtotal * (discountValue / 100);
  const discountedSubtotal = subtotal - discount;
  const total = discountedSubtotal + taxTotal;

  return (
    <div className="flex flex-col gap-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 text-left text-[0.7rem] uppercase tracking-widest text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Description</th>
            <th className="pb-2 pr-4 font-medium text-right">Qty</th>
            <th className="pb-2 pr-4 font-medium text-right">Unit price</th>
            <th className="pb-2 pr-4 font-medium text-right">Tax %</th>
            <th className="pb-2 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((li) => (
            <tr key={li.id} className="border-b border-border/30">
              <td className="py-2 pr-4">{li.description}</td>
              <td className="py-2 pr-4 text-right">{Number(li.quantity)}</td>
              <td className="py-2 pr-4 text-right">
                {fmt(Number(li.unit_price))}
              </td>
              <td className="py-2 pr-4 text-right">{Number(li.tax_rate)}%</td>
              <td className="py-2 text-right">
                {fmt(Number(li.quantity) * Number(li.unit_price))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-col items-end gap-1 pt-2 text-sm">
        <div className="flex gap-8">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>
        {discount > 0 ? (
          <div className="flex gap-8 text-red-500">
            <span>
              {discountType === "percent"
                ? `Discount (${discountValue}%)`
                : "Discount"}
            </span>
            <span>-{fmt(discount)}</span>
          </div>
        ) : null}
        {taxTotal > 0 ? (
          <div className="flex gap-8">
            <span className="text-muted-foreground">Tax</span>
            <span>{fmt(taxTotal)}</span>
          </div>
        ) : null}
        <div className="flex gap-8 border-t border-border/50 pt-2 font-semibold">
          <span>Total</span>
          <span>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

export default async function ReviewProposalPage({ params }: PageProps) {
  const { token } = await params;

  const { data: doc, error: docError } = await supabaseAdmin
    .from("documents")
    .select(
      "id, title, proposal_number, valid_until, notes_footer, status, approved_at, declined_at, approval_message, client_id, user_id, discount_value, discount_type, content_json",
    )
    .eq("approval_token", token)
    .eq("type", "proposal")
    .single();

  if (docError || !doc) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <p className="font-display text-2xl font-semibold text-foreground">
            Proposal not found
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  if (doc.status === "approved") {
    const approvedDate = doc.approved_at
      ? new Date(doc.approved_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <svg
              className="size-7 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <p className="font-display text-2xl font-semibold text-foreground">
            Already approved
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This proposal was approved
            {approvedDate ? ` on ${approvedDate}` : ""}.
          </p>
        </div>
      </div>
    );
  }

  if (doc.status === "declined") {
    const declinedDate = doc.declined_at
      ? new Date(doc.declined_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <p className="font-display text-2xl font-semibold text-foreground">
            Already declined
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This proposal was declined
            {declinedDate ? ` on ${declinedDate}` : ""}.
          </p>
        </div>
      </div>
    );
  }

  const [lineItemsResult, clientResult, profileResult] = await Promise.all([
    supabaseAdmin
      .from("line_items")
      .select("*")
      .eq("document_id", doc.id)
      .order("sort_order", { ascending: true }),
    doc.client_id
      ? supabaseAdmin
          .from("clients")
          .select("name, currency")
          .eq("id", doc.client_id)
          .single()
      : Promise.resolve({ data: null }),
    supabaseAdmin
      .from("profiles")
      .select("company_name, full_name")
      .eq("id", doc.user_id)
      .single(),
  ]);

  const lineItems = (lineItemsResult.data ?? []) as LineItemRow[];
  const client = clientResult.data;
  const profile = profileResult.data;
  const businessName =
    profile?.company_name ?? profile?.full_name ?? "Your Business";
  const currency = client?.currency ?? "USD";

  const validUntilFormatted = doc.valid_until
    ? new Date(doc.valid_until + "T12:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  // Render Tiptap JSON to HTML server-side, then sanitize to prevent XSS.
  // sanitize-html strips all disallowed tags/attributes before the string
  // reaches the browser, so dangerouslySetInnerHTML is safe here.
  let safeContentHtml = "";
  try {
    if (doc.content_json && typeof doc.content_json === "object") {
      const rawHtml = tiptapToHtml(doc.content_json as Record<string, unknown>);
      safeContentHtml = sanitizeHtml(rawHtml, SANITIZE_OPTIONS);
    }
  } catch {
    safeContentHtml = "";
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-16">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-bold tracking-tight text-foreground">
            {businessName}
          </span>
          <p className="mt-1 text-sm text-muted-foreground">
            has shared a proposal with you
          </p>
        </div>

        {/* Proposal card */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          {/* Title + number */}
          <div className="mb-5 border-b border-border/50 pb-5">
            <h1 className="font-display text-xl font-semibold text-foreground">
              {doc.title}
            </h1>
            {doc.proposal_number ? (
              <p className="mt-0.5 font-mono text-sm text-muted-foreground">
                #{doc.proposal_number}
              </p>
            ) : null}
          </div>

          {/* Metadata */}
          <div className="mb-5 flex flex-wrap gap-6 text-sm">
            {client?.name ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                  Prepared for
                </span>
                <span className="font-medium">{client.name}</span>
              </div>
            ) : null}
            {validUntilFormatted ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                  Valid until
                </span>
                <span>{validUntilFormatted}</span>
              </div>
            ) : null}
          </div>

          {/* Tiptap content — sanitized server-side, safe to render as HTML */}
          {safeContentHtml ? (
            <div
              className="doc-render mb-6 border-b border-border/50 pb-6"
              // Content is sanitized above with sanitize-html before reaching here
              dangerouslySetInnerHTML={{ __html: safeContentHtml }}
            />
          ) : null}

          {/* Line items */}
          {lineItems.length > 0 ? (
            <div className="mb-5">
              <ProposalLineItemsReadOnly
                lineItems={lineItems}
                currency={currency}
                discountValue={Number(doc.discount_value ?? 0)}
                discountType={
                  (doc.discount_type ?? "percent") as "percent" | "flat"
                }
              />
            </div>
          ) : null}

          {/* Notes footer */}
          {doc.notes_footer ? (
            <p className="mb-5 border-t border-border/50 pt-4 text-sm text-muted-foreground whitespace-pre-line">
              {doc.notes_footer}
            </p>
          ) : null}

          {/* Approve / Decline */}
          <div className="border-t border-border/50 pt-5">
            <ProposalRespondForm approvalToken={token} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Sent via CraftlyAI · Your response will be shared with {businessName}
        </p>
      </div>
    </div>
  );
}
