import "server-only";

import { getBrandKit } from "@/lib/brand-kit/actions";
import { getClientById } from "@/lib/clients/client-queries";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { VariableContext } from "@/lib/documents/variables";

/**
 * Build a variable substitution context by reading the active user's client,
 * project, and brand kit. Pass nulls to skip a join. Safe to call from server
 * components / actions only.
 */
export async function buildVariableContext(args: {
  clientId?: string | null;
  projectId?: string | null;
}): Promise<VariableContext> {
  const now = new Date();
  const ctx: VariableContext = {
    client: null,
    project: null,
    brand: null,
    now,
  };

  const brandResult = await getBrandKit();
  if (brandResult.ok && brandResult.brandKit) {
    const bk = brandResult.brandKit;
    ctx.brand = {
      business_name: null,
      primary_color: bk.primary_color,
      email_signature: bk.email_signature,
      logo_url: bk.logo_url ?? null,
    };
  }

  // Business name lives on the profile row.
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, full_name")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) {
      const business =
        (profile.company_name && profile.company_name.trim()) ||
        (profile.full_name && profile.full_name.trim()) ||
        null;
      ctx.brand = {
        business_name: business,
        primary_color: ctx.brand?.primary_color ?? null,
        email_signature: ctx.brand?.email_signature ?? null,
        logo_url: ctx.brand?.logo_url ?? null,
      };
    }
  }

  if (args.clientId) {
    const client = await getClientById(args.clientId);
    if (client) {
      ctx.client = {
        name: client.name,
        contact_name: client.contact_name,
        email: client.email,
        company: client.company,
      };
    }
  }

  if (args.projectId && user) {
    const { data: project } = await supabase
      .from("projects")
      .select("title")
      .eq("id", args.projectId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (project) {
      ctx.project = { title: project.title };
    }
  }

  return ctx;
}
