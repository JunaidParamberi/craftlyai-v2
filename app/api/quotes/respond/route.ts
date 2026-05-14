import { createClient as createSupabaseServerClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const supabaseAdmin = createSupabaseServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const approvalToken = typeof b.approval_token === "string" ? b.approval_token : null;
  const action = b.action === "approve" || b.action === "decline" ? b.action : null;
  const message = typeof b.message === "string" ? b.message : null;

  if (!approvalToken || !action) {
    return NextResponse.json(
      { error: "Missing approval_token or action" },
      { status: 400 },
    );
  }

  const { data: doc, error } = await supabaseAdmin
    .from("documents")
    .select("id, type, status")
    .eq("approval_token", approvalToken)
    .single();

  if (error || !doc) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  if (doc.type !== "quote") {
    return NextResponse.json({ error: "Not a quote" }, { status: 400 });
  }

  if (doc.status === "approved" || doc.status === "declined") {
    return NextResponse.json(
      { error: "Already responded" },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();

  await supabaseAdmin
    .from("documents")
    .update(
      action === "approve"
        ? { status: "approved", approved_at: now, approval_message: message }
        : { status: "declined", declined_at: now, approval_message: message },
    )
    .eq("id", doc.id);

  return NextResponse.json({ ok: true });
}
