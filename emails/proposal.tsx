import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface LineItemData {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

interface ProposalEmailProps {
  proposalNumber: string;
  businessName: string;
  clientName: string;
  validUntil?: string | null;
  notesFooter?: string | null;
  lineItems: LineItemData[];
  currency: string;
  approvalUrl: string;
  discountValue?: number;
  discountType?: "percent" | "flat";
}

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n);

export default function ProposalEmail({
  proposalNumber,
  businessName,
  clientName,
  validUntil,
  notesFooter,
  lineItems,
  currency,
  approvalUrl,
  discountValue = 0,
  discountType = "percent",
}: ProposalEmailProps) {
  const subtotal = lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unit_price,
    0
  );
  const taxTotal = lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unit_price * (li.tax_rate / 100),
    0
  );
  const discount =
    discountType === "flat"
      ? Math.min(discountValue, subtotal)
      : subtotal * (discountValue / 100);
  const total = subtotal - discount + taxTotal;

  const validUntilFormatted = validUntil
    ? new Date(validUntil + "T12:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Html>
      <Head />
      <Preview>
        Proposal {proposalNumber} from {businessName} — review and approve
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brandName}>{businessName}</Text>
            <Text style={tagline}>sent you a proposal</Text>
          </Section>

          <Section style={metaSection}>
            <Row>
              <Column>
                <Text style={metaLabel}>Proposal</Text>
                <Text style={metaValue}>{proposalNumber}</Text>
              </Column>
              <Column>
                <Text style={metaLabel}>Prepared for</Text>
                <Text style={metaValue}>{clientName}</Text>
              </Column>
              {validUntilFormatted ? (
                <Column>
                  <Text style={metaLabel}>Valid until</Text>
                  <Text style={metaValue}>{validUntilFormatted}</Text>
                </Column>
              ) : null}
            </Row>
          </Section>

          <Hr style={divider} />

          {lineItems.length > 0 ? (
            <Section style={tableSection}>
              <Row style={tableHeader}>
                <Column style={{ width: "50%" }}>
                  <Text style={tableHeaderText}>Description</Text>
                </Column>
                <Column style={{ width: "15%", textAlign: "right" }}>
                  <Text style={tableHeaderText}>Qty</Text>
                </Column>
                <Column style={{ width: "20%", textAlign: "right" }}>
                  <Text style={tableHeaderText}>Unit price</Text>
                </Column>
                <Column style={{ width: "15%", textAlign: "right" }}>
                  <Text style={tableHeaderText}>Amount</Text>
                </Column>
              </Row>
              {lineItems.map((li, i) => (
                <Row key={i} style={tableRow}>
                  <Column style={{ width: "50%" }}>
                    <Text style={tableCell}>{li.description}</Text>
                  </Column>
                  <Column style={{ width: "15%", textAlign: "right" }}>
                    <Text style={tableCell}>{li.quantity}</Text>
                  </Column>
                  <Column style={{ width: "20%", textAlign: "right" }}>
                    <Text style={tableCell}>{fmt(li.unit_price, currency)}</Text>
                  </Column>
                  <Column style={{ width: "15%", textAlign: "right" }}>
                    <Text style={tableCell}>
                      {fmt(li.quantity * li.unit_price, currency)}
                    </Text>
                  </Column>
                </Row>
              ))}

              <Hr style={divider} />

              <Row>
                <Column style={{ width: "65%" }} />
                <Column style={{ width: "35%" }}>
                  <Row>
                    <Column><Text style={summaryLabel}>Subtotal</Text></Column>
                    <Column style={{ textAlign: "right" }}>
                      <Text style={summaryValue}>{fmt(subtotal, currency)}</Text>
                    </Column>
                  </Row>
                  {discount > 0 ? (
                    <Row>
                      <Column>
                        <Text style={{ ...summaryLabel, color: "#dc2626" }}>
                          {discountType === "percent"
                            ? `Discount (${discountValue}%)`
                            : "Discount"}
                        </Text>
                      </Column>
                      <Column style={{ textAlign: "right" }}>
                        <Text style={{ ...summaryValue, color: "#dc2626" }}>
                          -{fmt(discount, currency)}
                        </Text>
                      </Column>
                    </Row>
                  ) : null}
                  {taxTotal > 0 ? (
                    <Row>
                      <Column><Text style={summaryLabel}>Tax</Text></Column>
                      <Column style={{ textAlign: "right" }}>
                        <Text style={summaryValue}>{fmt(taxTotal, currency)}</Text>
                      </Column>
                    </Row>
                  ) : null}
                  <Row>
                    <Column><Text style={totalLabel}>Total</Text></Column>
                    <Column style={{ textAlign: "right" }}>
                      <Text style={totalValue}>{fmt(total, currency)}</Text>
                    </Column>
                  </Row>
                </Column>
              </Row>
            </Section>
          ) : null}

          <Section style={ctaSection}>
            <Button style={ctaButton} href={approvalUrl}>
              Review &amp; Respond to Proposal
            </Button>
          </Section>

          {notesFooter ? (
            <>
              <Hr style={divider} />
              <Section>
                <Text style={notes}>{notesFooter}</Text>
              </Section>
            </>
          ) : null}

          <Hr style={divider} />
          <Text style={footer}>
            Sent via CraftlyAI · Your response will be shared with {businessName}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#FAFAF8",
  fontFamily: "'Georgia', 'Times New Roman', serif",
  margin: 0,
  padding: "48px 0",
};
const container: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E8E5DF",
  borderRadius: "4px",
  margin: "0 auto",
  maxWidth: "620px",
  padding: "48px",
};
const header: React.CSSProperties = { marginBottom: "32px" };
const brandName: React.CSSProperties = {
  color: "#1C1C1E",
  fontSize: "22px",
  fontWeight: "600",
  letterSpacing: "-0.3px",
  margin: "0 0 4px",
};
const tagline: React.CSSProperties = {
  color: "#6B6B6B",
  fontSize: "14px",
  margin: 0,
  fontStyle: "italic",
};
const metaSection: React.CSSProperties = { margin: "24px 0" };
const metaLabel: React.CSSProperties = {
  color: "#9B9B9B",
  fontSize: "10px",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  letterSpacing: "0.08em",
  margin: "0 0 2px",
  textTransform: "uppercase",
};
const metaValue: React.CSSProperties = {
  color: "#1C1C1E",
  fontSize: "14px",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  fontWeight: "500",
  margin: 0,
};
const divider: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #E8E5DF",
  margin: "24px 0",
};
const tableSection: React.CSSProperties = { margin: "16px 0" };
const tableHeader: React.CSSProperties = {
  borderBottom: "1px solid #E8E5DF",
  paddingBottom: "8px",
};
const tableHeaderText: React.CSSProperties = {
  color: "#9B9B9B",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  fontSize: "10px",
  letterSpacing: "0.08em",
  margin: "0 0 8px",
  textTransform: "uppercase",
};
const tableRow: React.CSSProperties = { borderBottom: "1px solid #F0EDE8" };
const tableCell: React.CSSProperties = {
  color: "#1C1C1E",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  fontSize: "13px",
  margin: "8px 0",
};
const summaryLabel: React.CSSProperties = {
  color: "#6B6B6B",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  fontSize: "13px",
  margin: "4px 0",
};
const summaryValue: React.CSSProperties = {
  color: "#1C1C1E",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  fontSize: "13px",
  margin: "4px 0",
};
const totalLabel: React.CSSProperties = {
  color: "#1C1C1E",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  fontSize: "15px",
  fontWeight: "600",
  margin: "8px 0 4px",
};
const totalValue: React.CSSProperties = {
  color: "#1C1C1E",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  fontSize: "15px",
  fontWeight: "600",
  margin: "8px 0 4px",
};
const ctaSection: React.CSSProperties = {
  margin: "32px 0",
  textAlign: "center",
};
const ctaButton: React.CSSProperties = {
  backgroundColor: "#1C1C1E",
  borderRadius: "3px",
  color: "#FFFFFF",
  display: "inline-block",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  fontSize: "14px",
  fontWeight: "500",
  letterSpacing: "0.02em",
  padding: "14px 28px",
  textDecoration: "none",
};
const notes: React.CSSProperties = {
  color: "#6B6B6B",
  fontStyle: "italic",
  fontSize: "13px",
  lineHeight: "1.6",
  margin: 0,
  whiteSpace: "pre-line",
};
const footer: React.CSSProperties = {
  color: "#ADADAD",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  fontSize: "11px",
  margin: 0,
  textAlign: "center",
};
