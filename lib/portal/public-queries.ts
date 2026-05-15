import type { DocumentStatus, DocumentType } from "@/types";

import { generatePortalToken } from "@/lib/portal/generate-token";
import { createPortalAdminClient } from "@/lib/portal/supabase-admin";

export type PortalBrandContext = {
  businessName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  font: string;
};

export type PortalClientRow = {
  id: string;
  user_id: string;
  name: string;
  portal_token: string;
};

export type PortalDocumentItem = {
  id: string;
  type: DocumentType;
  title: string;
  status: DocumentStatus;
  updated_at: string;
  referenceNumber: string | null;
  dueOrValidLabel: string | null;
  actionUrl: string;
  actionLabel: string;
};

type DocumentPortalRow = {
  id: string;
  type: DocumentType;
  title: string;
  status: DocumentStatus;
  updated_at: string;
  invoice_number: string | null;
  quote_number: string | null;
  proposal_number: string | null;
  due_date: string | null;
  valid_until: string | null;
  pay_token: string | null;
  approval_token: string | null;
};

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function formatDateLabel(isoDate: string): string {
  return new Date(isoDate + "T12:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function referenceNumberFor(doc: DocumentPortalRow): string | null {
  if (doc.type === "invoice") return doc.invoice_number;
  if (doc.type === "quote") return doc.quote_number;
  if (doc.type === "proposal") return doc.proposal_number;
  return null;
}

function dueOrValidLabelFor(doc: DocumentPortalRow): string | null {
  if (doc.type === "invoice" && doc.due_date) {
    return `Due ${formatDateLabel(doc.due_date)}`;
  }
  if ((doc.type === "quote" || doc.type === "proposal") && doc.valid_until) {
    return `Valid until ${formatDateLabel(doc.valid_until)}`;
  }
  return null;
}

function actionForDoc(
  doc: DocumentPortalRow,
  appUrl: string,
): { actionUrl: string; actionLabel: string } | null {
  if (doc.type === "invoice") {
    if (!doc.pay_token) return null;
    const label = doc.status === "paid" ? "View invoice" : "Pay invoice";
    return { actionUrl: `${appUrl}/pay/${doc.pay_token}`, actionLabel: label };
  }
  if (doc.type === "quote" || doc.type === "proposal") {
    if (!doc.approval_token) return null;
    const isFinal =
      doc.status === "approved" || doc.status === "declined";
    const noun = doc.type === "quote" ? "quote" : "proposal";
    const label = isFinal ? `View ${noun}` : `Review ${noun}`;
    const path = doc.type === "quote" ? "quote" : "proposal";
    return {
      actionUrl: `${appUrl}/${path}/${doc.approval_token}`,
      actionLabel: label,
    };
  }
  return null;
}

async function ensureDocumentTokens(
  docs: DocumentPortalRow[],
): Promise<DocumentPortalRow[]> {
  const admin = createPortalAdminClient();
  const updated: DocumentPortalRow[] = [];

  for (const doc of docs) {
    let payToken = doc.pay_token;
    let approvalToken = doc.approval_token;
    const patch: Record<string, string> = {};

    if (doc.type === "invoice" && !payToken) {
      payToken = generatePortalToken();
      patch.pay_token = payToken;
    }
    if (
      (doc.type === "quote" || doc.type === "proposal") &&
      !approvalToken
    ) {
      approvalToken = generatePortalToken();
      patch.approval_token = approvalToken;
    }

    if (Object.keys(patch).length > 0) {
      await admin.from("documents").update(patch).eq("id", doc.id);
    }

    updated.push({
      ...doc,
      pay_token: payToken,
      approval_token: approvalToken,
    });
  }

  return updated;
}

export async function getClientByPortalToken(
  token: string,
): Promise<PortalClientRow | null> {
  const admin = createPortalAdminClient();
  const { data, error } = await admin
    .from("clients")
    .select("id, user_id, name, portal_token")
    .eq("portal_token", token)
    .maybeSingle();

  if (error || !data?.portal_token) {
    return null;
  }

  return data as PortalClientRow;
}

export async function getPortalBrandContext(
  userId: string,
): Promise<PortalBrandContext> {
  const admin = createPortalAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("company_name, full_name, brand_kit_id")
    .eq("id", userId)
    .maybeSingle();

  const businessName =
    profile?.company_name ?? profile?.full_name ?? "Your Business";

  let brandKit: {
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    font: string;
  } | null = null;

  if (profile?.brand_kit_id) {
    const { data } = await admin
      .from("brand_kits")
      .select("logo_url, primary_color, secondary_color, font")
      .eq("id", profile.brand_kit_id)
      .maybeSingle();
    brandKit = data;
  }

  if (!brandKit) {
    const { data } = await admin
      .from("brand_kits")
      .select("logo_url, primary_color, secondary_color, font")
      .eq("user_id", userId)
      .maybeSingle();
    brandKit = data;
  }

  return {
    businessName,
    logoUrl: brandKit?.logo_url ?? null,
    primaryColor: brandKit?.primary_color ?? "#18181b",
    secondaryColor: brandKit?.secondary_color ?? "#71717a",
    font: brandKit?.font ?? "Inter",
  };
}

export async function listPortalDocuments(
  clientId: string,
): Promise<PortalDocumentItem[]> {
  const admin = createPortalAdminClient();
  const appUrl = getAppUrl();

  const { data, error } = await admin
    .from("documents")
    .select(
      "id, type, title, status, updated_at, invoice_number, quote_number, proposal_number, due_date, valid_until, pay_token, approval_token",
    )
    .eq("client_id", clientId)
    .in("type", ["invoice", "quote", "proposal"])
    .in("status", [
      "sent",
      "viewed",
      "signed",
      "paid",
      "approved",
      "declined",
    ])
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const withTokens = await ensureDocumentTokens(data as DocumentPortalRow[]);

  const items: PortalDocumentItem[] = [];

  for (const doc of withTokens) {
    const action = actionForDoc(doc, appUrl);
    if (!action) continue;

    items.push({
      id: doc.id,
      type: doc.type,
      title: doc.title,
      status: doc.status,
      updated_at: doc.updated_at,
      referenceNumber: referenceNumberFor(doc),
      dueOrValidLabel: dueOrValidLabelFor(doc),
      actionUrl: action.actionUrl,
      actionLabel: action.actionLabel,
    });
  }

  return items;
}

/** Mark document as viewed when client opens a public page (sent → viewed). */
export async function recordDocumentViewed(documentId: string): Promise<void> {
  const admin = createPortalAdminClient();
  const { data: doc } = await admin
    .from("documents")
    .select("id, status, viewed_at")
    .eq("id", documentId)
    .maybeSingle();

  if (!doc || doc.viewed_at || doc.status !== "sent") {
    return;
  }

  await admin
    .from("documents")
    .update({
      status: "viewed",
      viewed_at: new Date().toISOString(),
    })
    .eq("id", documentId);
}
