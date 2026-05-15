"use server";

import { revalidatePath } from "next/cache";

import { generatePortalToken } from "@/lib/portal/generate-token";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { parseClientPortalActionInput } from "@/lib/validations/portal";

export type PortalTokenResult =
  | { ok: true; portalToken: string; portalUrl: string }
  | { ok: false; error: string };

function portalUrlFor(token: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl}/portal/${token}`;
}

async function loadOwnedClient(clientId: string) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated." };

  const { data, error } = await supabase
    .from("clients")
    .select("id, portal_token")
    .eq("id", clientId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return { ok: false as const, error: "Client not found." };
  }

  return { ok: true as const, supabase, client: data };
}

export async function ensurePortalToken(
  clientId: string,
): Promise<PortalTokenResult> {
  const parsed = parseClientPortalActionInput({ clientId });
  if (!parsed.success) {
    return { ok: false, error: "Invalid client." };
  }

  const loaded = await loadOwnedClient(parsed.data.clientId);
  if (!loaded.ok) return loaded;

  let token = loaded.client.portal_token as string | null;
  if (!token) {
    token = generatePortalToken();
    const { error } = await loaded.supabase
      .from("clients")
      .update({ portal_token: token })
      .eq("id", loaded.client.id);

    if (error) {
      return { ok: false, error: "Failed to create portal link." };
    }
  }

  revalidatePath(`/clients/${parsed.data.clientId}`);
  return {
    ok: true,
    portalToken: token,
    portalUrl: portalUrlFor(token),
  };
}

export async function regeneratePortalToken(
  clientId: string,
): Promise<PortalTokenResult> {
  const parsed = parseClientPortalActionInput({ clientId });
  if (!parsed.success) {
    return { ok: false, error: "Invalid client." };
  }

  const loaded = await loadOwnedClient(parsed.data.clientId);
  if (!loaded.ok) return loaded;

  const token = generatePortalToken();
  const { error } = await loaded.supabase
    .from("clients")
    .update({ portal_token: token })
    .eq("id", loaded.client.id);

  if (error) {
    return { ok: false, error: "Failed to regenerate portal link." };
  }

  revalidatePath(`/clients/${parsed.data.clientId}`);
  return {
    ok: true,
    portalToken: token,
    portalUrl: portalUrlFor(token),
  };
}
