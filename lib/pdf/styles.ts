import { StyleSheet } from "@react-pdf/renderer";

// Built-in PDF fonts — no external fetch needed, always available.
// Inter/Poppins/Playfair support can be added later by bundling font files in public/fonts/.
const FONT_MAP: Record<string, string> = {
  inter: "Helvetica",
  poppins: "Helvetica",
  "playfair display": "Times-Roman",
};

export function resolvePdfFont(brandFont: string | null | undefined): string {
  if (!brandFont) return "Helvetica";
  return FONT_MAP[brandFont.toLowerCase()] ?? "Helvetica";
}

export function makePdfStyles(primaryColor: string, fontFamily: string) {
  return StyleSheet.create({
    page: {
      fontFamily,
      fontSize: 10,
      color: "#1a1a1a",
      paddingTop: 48,
      paddingBottom: 60,
      paddingHorizontal: 52,
      backgroundColor: "#ffffff",
    },

    // Header
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 28,
    },
    logo: {
      width: 80,
      height: 32,
      objectFit: "contain",
    },
    headerRight: {
      alignItems: "flex-end",
    },
    docType: {
      fontSize: 8,
      fontWeight: 600,
      letterSpacing: 1.5,
      color: primaryColor,
      marginBottom: 2,
    },
    docTitle: {
      fontSize: 14,
      fontWeight: 700,
      color: "#0f0f0f",
    },

    // Meta block
    metaBlock: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    metaLabel: {
      fontSize: 7.5,
      fontWeight: 600,
      color: "#888888",
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    metaValue: {
      fontSize: 9.5,
      color: "#1a1a1a",
    },
    metaColumn: {
      flexDirection: "column",
      gap: 6,
    },

    // Divider
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: primaryColor,
      borderBottomStyle: "solid",
      marginBottom: 20,
      opacity: 0.3,
    },

    // Content
    content: {
      flex: 1,
    },
    h1: {
      fontSize: 18,
      fontWeight: 700,
      color: primaryColor,
      marginBottom: 8,
      marginTop: 16,
    },
    h2: {
      fontSize: 14,
      fontWeight: 700,
      color: primaryColor,
      marginBottom: 6,
      marginTop: 14,
    },
    h3: {
      fontSize: 11,
      fontWeight: 700,
      color: "#0f0f0f",
      marginBottom: 4,
      marginTop: 10,
    },
    p: {
      fontSize: 10,
      lineHeight: 1.6,
      marginBottom: 8,
      color: "#1a1a1a",
    },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: primaryColor,
      borderLeftStyle: "solid",
      paddingLeft: 10,
      marginBottom: 8,
      color: "#555555",
    },
    listItem: {
      flexDirection: "row",
      marginBottom: 4,
    },
    listBullet: {
      width: 14,
      fontSize: 10,
      color: primaryColor,
    },
    listText: {
      flex: 1,
      fontSize: 10,
      lineHeight: 1.6,
      color: "#1a1a1a",
    },
    codeBlock: {
      backgroundColor: "#f4f4f5",
      borderRadius: 4,
      padding: 10,
      marginBottom: 8,
      fontFamily: "Courier",
      fontSize: 8.5,
      color: "#1a1a1a",
    },
    hr: {
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      borderBottomStyle: "solid",
      marginVertical: 12,
    },

    // Footer
    footer: {
      position: "absolute",
      bottom: 28,
      left: 52,
      right: 52,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerText: {
      fontSize: 7.5,
      color: "#aaaaaa",
    },
  });
}

export type PdfStyles = ReturnType<typeof makePdfStyles>;
