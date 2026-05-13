/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Image,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";

import type { DocumentRow, DocumentType, TiptapDoc } from "@/types";
import type { VariableContext } from "@/lib/documents/variables";
import { makePdfStyles, resolvePdfFont } from "./styles";
import { renderTiptapContent } from "./tiptap-to-pdf";

const TYPE_LABELS: Record<DocumentType, string> = {
  proposal: "Proposal",
  quote: "Quote",
  invoice: "Invoice",
  other: "Document",
};

type DocumentPdfProps = {
  document: Pick<DocumentRow, "id" | "type" | "title" | "created_at">;
  content: TiptapDoc;
  variableContext: VariableContext;
  brandLogoUrl?: string | null;
  primaryColor?: string | null;
  brandFont?: string | null;
  businessName?: string | null;
};

export function DocumentPdf({
  document,
  content,
  variableContext,
  brandLogoUrl,
  primaryColor,
  brandFont,
  businessName,
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

        {/* Body content */}
        {renderTiptapContent(content.content, { styles, primaryColor: color })}

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
