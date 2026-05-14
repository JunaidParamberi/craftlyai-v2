import {
  Body,
  Button,
  Column,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

interface QuoteEmailProps {
  quoteNumber: string;
  businessName: string;
  clientName: string;
  validUntil: string | null;
  notesFooter: string | null;
  lineItems: LineItem[];
  currency: string;
  approvalUrl: string;
  discountValue?: number;
  discountType?: 'percent' | 'flat';
}

function fmt(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export default function QuoteEmail({
  quoteNumber,
  businessName,
  clientName,
  validUntil,
  notesFooter,
  lineItems,
  currency,
  approvalUrl,
  discountValue = 0,
  discountType = 'percent',
}: QuoteEmailProps) {
  const subtotal = lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unit_price,
    0
  );
  const taxTotal = lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unit_price * (li.tax_rate / 100),
    0
  );
  const discount = discountType === 'flat'
    ? Math.min(discountValue, subtotal)
    : subtotal * (discountValue / 100);
  const discountedSubtotal = subtotal - discount;
  const total = discountedSubtotal + taxTotal;

  const formattedValidUntil = validUntil
    ? new Date(validUntil).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2",
            format: "woff2",
          }}
          fontWeight={600}
          fontStyle="normal"
        />
      </Head>
      <Preview>
        Quote {quoteNumber} from {businessName} — {fmt(total, currency)}
        {formattedValidUntil ? ` · valid until ${formattedValidUntil}` : ""}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.brandName}>{businessName}</Text>
          </Section>

          {/* Quote meta */}
          <Section style={styles.card}>
            <Text style={styles.quoteLabel}>QUOTE</Text>
            <Text style={styles.quoteNumber}>{quoteNumber}</Text>

            <Text style={styles.greeting}>Hi {clientName},</Text>
            <Text style={styles.bodyText}>
              Please find your quote details below. Click the button to review
              and respond.
            </Text>

            {formattedValidUntil && (
              <Section style={styles.metaRow}>
                <Row>
                  <Column style={styles.metaLabel}>
                    <Text style={styles.metaLabelText}>Valid Until</Text>
                  </Column>
                  <Column style={styles.metaValue}>
                    <Text style={styles.metaValueText}>
                      {formattedValidUntil}
                    </Text>
                  </Column>
                </Row>
              </Section>
            )}

            <Hr style={styles.divider} />

            {/* Line items header */}
            <Row style={styles.tableHeader}>
              <Column style={styles.colDesc}>
                <Text style={styles.tableHeaderText}>Description</Text>
              </Column>
              <Column style={styles.colQty}>
                <Text style={styles.tableHeaderTextRight}>Qty</Text>
              </Column>
              <Column style={styles.colPrice}>
                <Text style={styles.tableHeaderTextRight}>Unit Price</Text>
              </Column>
              <Column style={styles.colAmount}>
                <Text style={styles.tableHeaderTextRight}>Amount</Text>
              </Column>
            </Row>

            <Hr style={styles.dividerThin} />

            {/* Line items */}
            {lineItems.map((li, i) => {
              const lineAmount = li.quantity * li.unit_price;
              return (
                <Row key={i} style={styles.tableRow}>
                  <Column style={styles.colDesc}>
                    <Text style={styles.tableCell}>{li.description}</Text>
                  </Column>
                  <Column style={styles.colQty}>
                    <Text style={styles.tableCellRight}>{li.quantity}</Text>
                  </Column>
                  <Column style={styles.colPrice}>
                    <Text style={styles.tableCellRight}>
                      {fmt(li.unit_price, currency)}
                    </Text>
                  </Column>
                  <Column style={styles.colAmount}>
                    <Text style={styles.tableCellRight}>
                      {fmt(lineAmount, currency)}
                    </Text>
                  </Column>
                </Row>
              );
            })}

            <Hr style={styles.divider} />

            {/* Totals */}
            <Row style={styles.totalsRow}>
              <Column style={styles.totalsLabelCol}>
                <Text style={styles.totalsLabel}>Subtotal</Text>
              </Column>
              <Column style={styles.totalsValueCol}>
                <Text style={styles.totalsValue}>{fmt(subtotal, currency)}</Text>
              </Column>
            </Row>

            {discount > 0 && (
              <Row style={styles.totalsRow}>
                <Column style={styles.totalsLabelCol}>
                  <Text style={{ ...styles.totalsLabel, color: "#ef4444" }}>
                    {discountType === 'percent' ? `Discount (${discountValue}%)` : 'Discount'}
                  </Text>
                </Column>
                <Column style={styles.totalsValueCol}>
                  <Text style={{ ...styles.totalsValue, color: "#ef4444" }}>
                    -{fmt(discount, currency)}
                  </Text>
                </Column>
              </Row>
            )}

            {taxTotal > 0 && (
              <Row style={styles.totalsRow}>
                <Column style={styles.totalsLabelCol}>
                  <Text style={styles.totalsLabel}>Tax</Text>
                </Column>
                <Column style={styles.totalsValueCol}>
                  <Text style={styles.totalsValue}>{fmt(taxTotal, currency)}</Text>
                </Column>
              </Row>
            )}

            <Hr style={styles.dividerThin} />

            <Row style={styles.totalsRow}>
              <Column style={styles.totalsLabelCol}>
                <Text style={styles.totalLabel}>Total</Text>
              </Column>
              <Column style={styles.totalsValueCol}>
                <Text style={styles.totalValue}>{fmt(total, currency)}</Text>
              </Column>
            </Row>

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Button href={approvalUrl} style={styles.reviewButton}>
                Review Quote
              </Button>
            </Section>

            {/* Notes */}
            {notesFooter && (
              <>
                <Hr style={styles.divider} />
                <Text style={styles.notes}>{notesFooter}</Text>
              </>
            )}
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>Sent via CraftlyAI</Text>
            <Text style={styles.footerSubtext}>
              If you have questions about this quote, please contact{" "}
              {businessName} directly.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

QuoteEmail.PreviewProps = {
  quoteNumber: "QUO-0001",
  businessName: "Acme Design Studio",
  clientName: "Jane Smith",
  validUntil: "2026-06-15",
  notesFooter: "This quote is valid for 30 days. Prices exclude any additional revisions.",
  lineItems: [
    {
      description: "Brand identity design — logo, color palette, typography",
      quantity: 1,
      unit_price: 2500,
      tax_rate: 5,
    },
    {
      description: "Brand guidelines document",
      quantity: 1,
      unit_price: 500,
      tax_rate: 5,
    },
  ],
  currency: "USD",
  approvalUrl: "https://craftlyai.app/quote/tok_preview_abc123",
} satisfies QuoteEmailProps;

const styles = {
  body: {
    backgroundColor: "#f8f9fa",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: "0",
    padding: "0",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "40px 16px",
  },
  header: {
    marginBottom: "24px",
    textAlign: "left" as const,
  },
  brandName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#18181b",
    margin: "0",
    letterSpacing: "-0.3px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "40px",
    border: "1px solid #e4e4e7",
  },
  quoteLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#71717a",
    letterSpacing: "1.5px",
    margin: "0 0 4px 0",
  },
  quoteNumber: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#18181b",
    margin: "0 0 24px 0",
    letterSpacing: "-0.5px",
  },
  greeting: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#18181b",
    margin: "0 0 8px 0",
  },
  bodyText: {
    fontSize: "14px",
    color: "#52525b",
    lineHeight: "1.6",
    margin: "0 0 24px 0",
  },
  metaRow: {
    marginBottom: "16px",
  },
  metaLabel: {
    width: "140px",
  },
  metaValue: {
    width: "auto",
  },
  metaLabelText: {
    fontSize: "12px",
    color: "#71717a",
    fontWeight: "600",
    letterSpacing: "0.3px",
    margin: "0 0 6px 0",
  },
  metaValueText: {
    fontSize: "14px",
    color: "#18181b",
    margin: "0 0 6px 0",
  },
  divider: {
    borderTop: "1px solid #e4e4e7",
    margin: "24px 0",
  },
  dividerThin: {
    borderTop: "1px solid #f4f4f5",
    margin: "8px 0",
  },
  tableHeader: {
    marginBottom: "0",
  },
  tableHeaderText: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#71717a",
    letterSpacing: "0.8px",
    textTransform: "uppercase" as const,
    margin: "0 0 8px 0",
  },
  tableHeaderTextRight: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#71717a",
    letterSpacing: "0.8px",
    textTransform: "uppercase" as const,
    textAlign: "right" as const,
    margin: "0 0 8px 0",
  },
  tableRow: {
    margin: "0",
  },
  tableCell: {
    fontSize: "14px",
    color: "#18181b",
    margin: "8px 0",
    paddingRight: "16px",
  },
  tableCellRight: {
    fontSize: "14px",
    color: "#18181b",
    textAlign: "right" as const,
    margin: "8px 0",
  },
  colDesc: {
    width: "50%",
  },
  colQty: {
    width: "10%",
  },
  colPrice: {
    width: "20%",
  },
  colAmount: {
    width: "20%",
  },
  totalsRow: {
    margin: "0",
  },
  totalsLabelCol: {
    width: "70%",
  },
  totalsValueCol: {
    width: "30%",
  },
  totalsLabel: {
    fontSize: "14px",
    color: "#52525b",
    textAlign: "right" as const,
    margin: "6px 0",
  },
  totalsValue: {
    fontSize: "14px",
    color: "#18181b",
    textAlign: "right" as const,
    margin: "6px 0",
  },
  totalLabel: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#18181b",
    textAlign: "right" as const,
    margin: "6px 0",
  },
  totalValue: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#18181b",
    textAlign: "right" as const,
    margin: "6px 0",
  },
  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0 8px 0",
  },
  reviewButton: {
    backgroundColor: "#18181b",
    color: "#ffffff",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "600",
    padding: "14px 32px",
    textDecoration: "none",
    display: "inline-block",
    letterSpacing: "-0.2px",
  },
  notes: {
    fontSize: "13px",
    color: "#52525b",
    lineHeight: "1.6",
    margin: "0",
    fontStyle: "italic",
  },
  footer: {
    textAlign: "center" as const,
    marginTop: "32px",
  },
  footerText: {
    fontSize: "12px",
    color: "#a1a1aa",
    fontWeight: "600",
    margin: "0 0 4px 0",
    letterSpacing: "0.3px",
  },
  footerSubtext: {
    fontSize: "12px",
    color: "#a1a1aa",
    margin: "0",
    lineHeight: "1.5",
  },
} as const;
