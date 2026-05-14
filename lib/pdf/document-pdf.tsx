/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Image,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";

import type { DocumentRow, DocumentType, LineItemRow, TiptapDoc } from "@/types";
import type { VariableContext } from "@/lib/documents/variables";
import { makePdfStyles, resolvePdfFont } from "./styles";
import { renderTiptapContent } from "./tiptap-to-pdf";

const TYPE_LABELS: Record<DocumentType, string> = {
  proposal: "Proposal",
  quote: "Quote",
  invoice: "Invoice",
  other: "Document",
};

type StructuredDocData = {
  number: string | null;
  due_or_valid_date: string | null;
  date_label: string;
  payment_terms?: string | null;
  notes_footer: string | null;
  line_items: LineItemRow[];
  currency: string;
  discount_value?: number;
  discount_type?: 'percent' | 'flat';
};

type DocumentPdfProps = {
  document: Pick<DocumentRow, "id" | "type" | "title" | "created_at">;
  content: TiptapDoc;
  variableContext: VariableContext;
  brandLogoUrl?: string | null;
  primaryColor?: string | null;
  brandFont?: string | null;
  businessName?: string | null;
  invoiceData?: {
    invoice_number: string | null;
    due_date: string | null;
    payment_terms: string | null;
    notes_footer: string | null;
    line_items: LineItemRow[];
    currency: string;
    discount_value?: number;
    discount_type?: 'percent' | 'flat';
  } | null;
  quoteData?: {
    quote_number: string | null;
    valid_until: string | null;
    notes_footer: string | null;
    line_items: LineItemRow[];
    currency: string;
    discount_value?: number;
    discount_type?: 'percent' | 'flat';
  } | null;
};

export function DocumentPdf({
  document,
  content,
  variableContext,
  brandLogoUrl,
  primaryColor,
  brandFont,
  businessName,
  invoiceData,
  quoteData,
}: DocumentPdfProps) {
  const color = primaryColor || "#6366f1";
  const fontFamily = resolvePdfFont(brandFont);
  const styles = makePdfStyles(color, fontFamily);

  const issued = new Date(document.created_at).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const clientName = variableContext.client?.name ?? null;
  const clientCompany = variableContext.client?.company ?? null;
  const projectTitle = variableContext.project?.title ?? null;

  return (
    <Document
      title={document.title}
      author={businessName ?? undefined}
      creator="CraftlyAI"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <View>
            {brandLogoUrl ? (
              <Image src={brandLogoUrl} style={styles.logo} />
            ) : (
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color,
                  fontFamily,
                }}
              >
                {businessName ?? ""}
              </Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docType}>{TYPE_LABELS[document.type]}</Text>
            <Text style={styles.docTitle}>{document.title}</Text>
          </View>
        </View>

        {/* Meta block */}
        {(clientName || clientCompany || projectTitle || issued) ? (
          <View style={styles.metaBlock}>
            <View style={styles.metaColumn}>
              {clientName ? (
                <View>
                  <Text style={styles.metaLabel}>Prepared for</Text>
                  <Text style={styles.metaValue}>{clientName}</Text>
                  {clientCompany ? (
                    <Text style={{ ...styles.metaValue, color: "#666" }}>
                      {clientCompany}
                    </Text>
                  ) : null}
                </View>
              ) : null}
              {projectTitle ? (
                <View>
                  <Text style={styles.metaLabel}>Project</Text>
                  <Text style={styles.metaValue}>{projectTitle}</Text>
                </View>
              ) : null}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.metaLabel}>Date issued</Text>
              <Text style={styles.metaValue}>{issued}</Text>
            </View>
          </View>
        ) : null}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Invoice metadata band */}
        {document.type === "invoice" && invoiceData ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12, padding: "8 0" }}>
            {invoiceData.invoice_number ? (
              <View>
                <Text style={styles.metaLabel}>Invoice #</Text>
                <Text style={{ ...styles.metaValue, fontFamily, fontSize: 11 }}>{invoiceData.invoice_number}</Text>
              </View>
            ) : null}
            {invoiceData.due_date ? (
              <View>
                <Text style={styles.metaLabel}>Due date</Text>
                <Text style={styles.metaValue}>
                  {new Date(invoiceData.due_date + "T12:00:00").toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
                </Text>
              </View>
            ) : null}
            {invoiceData.payment_terms ? (
              <View>
                <Text style={styles.metaLabel}>Terms</Text>
                <Text style={styles.metaValue}>{invoiceData.payment_terms}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Quote metadata band */}
        {document.type === "quote" && quoteData ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12, padding: "8 0" }}>
            {quoteData.quote_number ? (
              <View>
                <Text style={styles.metaLabel}>Quote #</Text>
                <Text style={{ ...styles.metaValue, fontFamily, fontSize: 11 }}>{quoteData.quote_number}</Text>
              </View>
            ) : null}
            {quoteData.valid_until ? (
              <View>
                <Text style={styles.metaLabel}>Valid until</Text>
                <Text style={styles.metaValue}>
                  {new Date(quoteData.valid_until + "T12:00:00").toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Line items table — invoice */}
        {document.type === "invoice" && invoiceData && invoiceData.line_items.length > 0 ? (
          <InvoiceLineItemsPdf
            lineItems={invoiceData.line_items}
            currency={invoiceData.currency}
            styles={styles}
            color={color}
            discountValue={invoiceData.discount_value ?? 0}
            discountType={invoiceData.discount_type ?? 'percent'}
          />
        ) : null}

        {/* Line items table — quote */}
        {document.type === "quote" && quoteData && quoteData.line_items.length > 0 ? (
          <InvoiceLineItemsPdf
            lineItems={quoteData.line_items}
            currency={quoteData.currency}
            styles={styles}
            color={color}
            discountValue={quoteData.discount_value ?? 0}
            discountType={quoteData.discount_type ?? 'percent'}
          />
        ) : null}

        {/* Notes footer — invoice */}
        {document.type === "invoice" && invoiceData?.notes_footer ? (
          <View style={{ marginTop: 12, padding: "8 0", borderTop: "1 solid #e5e7eb" }}>
            <Text style={{ ...styles.metaLabel, marginBottom: 4 }}>Notes</Text>
            <Text style={{ fontSize: 9, color: "#666", lineHeight: 1.5 }}>{invoiceData.notes_footer}</Text>
          </View>
        ) : null}

        {/* Notes footer — quote */}
        {document.type === "quote" && quoteData?.notes_footer ? (
          <View style={{ marginTop: 12, padding: "8 0", borderTop: "1 solid #e5e7eb" }}>
            <Text style={{ ...styles.metaLabel, marginBottom: 4 }}>Notes</Text>
            <Text style={{ fontSize: 9, color: "#666", lineHeight: 1.5 }}>{quoteData.notes_footer}</Text>
          </View>
        ) : null}

        {/* Body content (Tiptap) — proposal, other */}
        {document.type !== "invoice" && document.type !== "quote" ? (
          renderTiptapContent(content.content, { styles, primaryColor: color })
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{businessName ?? ""}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

function InvoiceLineItemsPdf({
  lineItems,
  currency,
  styles,
  color,
  discountValue = 0,
  discountType = 'percent',
}: {
  lineItems: LineItemRow[];
  currency: string;
  styles: ReturnType<typeof makePdfStyles>;
  color: string;
  discountValue?: number;
  discountType?: 'percent' | 'flat';
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
      Number(li.quantity) * Number(li.unit_price) * (Number(li.tax_rate) / 100),
    0,
  );
  const discount = discountType === 'flat'
    ? Math.min(discountValue, subtotal)
    : subtotal * (discountValue / 100);
  const discountedSubtotal = subtotal - discount;
  const total = discountedSubtotal + taxTotal;

  const colDesc = { flex: 3 };
  const colNum = { flex: 1, textAlign: "right" as const };
  const cellStyle = { fontSize: 9, paddingVertical: 5, paddingHorizontal: 4 };
  const headerCell = { ...cellStyle, color: "#888", fontSize: 8, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.5 };

  return (
    <View style={{ marginBottom: 12 }}>
      {/* Table header */}
      <View style={{ flexDirection: "row", borderBottom: `1 solid ${color}`, paddingBottom: 4, marginBottom: 2 }}>
        <Text style={{ ...headerCell, ...colDesc }}>Description</Text>
        <Text style={{ ...headerCell, ...colNum }}>Qty</Text>
        <Text style={{ ...headerCell, ...colNum }}>Unit price</Text>
        <Text style={{ ...headerCell, ...colNum }}>Tax %</Text>
        <Text style={{ ...headerCell, ...colNum }}>Amount</Text>
      </View>
      {/* Rows */}
      {lineItems.map((li, i) => (
        <View
          key={li.id}
          style={{
            flexDirection: "row",
            borderBottom: "1 solid #f0f0f0",
            backgroundColor: i % 2 === 0 ? "#fafafa" : "#fff",
          }}
        >
          <Text style={{ ...cellStyle, ...colDesc }}>{li.description}</Text>
          <Text style={{ ...cellStyle, ...colNum }}>{Number(li.quantity)}</Text>
          <Text style={{ ...cellStyle, ...colNum }}>{fmt(Number(li.unit_price))}</Text>
          <Text style={{ ...cellStyle, ...colNum }}>{Number(li.tax_rate)}%</Text>
          <Text style={{ ...cellStyle, ...colNum }}>
            {fmt(Number(li.quantity) * Number(li.unit_price))}
          </Text>
        </View>
      ))}
      {/* Totals */}
      <View style={{ alignItems: "flex-end", marginTop: 8, gap: 3 }}>
        <View style={{ flexDirection: "row", gap: 24 }}>
          <Text style={{ fontSize: 9, color: "#888" }}>Subtotal</Text>
          <Text style={{ fontSize: 9 }}>{fmt(subtotal)}</Text>
        </View>
        {discount > 0 ? (
          <View style={{ flexDirection: "row", gap: 24 }}>
            <Text style={{ fontSize: 9, color: "#e53e3e" }}>{discountType === 'percent' ? `Discount (${discountValue}%)` : 'Discount'}</Text>
            <Text style={{ fontSize: 9, color: "#e53e3e" }}>-{fmt(discount)}</Text>
          </View>
        ) : null}
        {taxTotal > 0 ? (
          <View style={{ flexDirection: "row", gap: 24 }}>
            <Text style={{ fontSize: 9, color: "#888" }}>Tax</Text>
            <Text style={{ fontSize: 9 }}>{fmt(taxTotal)}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: "row", gap: 24, borderTop: "1 solid #e5e7eb", paddingTop: 4 }}>
          <Text style={{ fontSize: 10, fontWeight: 700 }}>Total due</Text>
          <Text style={{ fontSize: 10, fontWeight: 700, color }}>{fmt(total)}</Text>
        </View>
      </View>
    </View>
  );
}
