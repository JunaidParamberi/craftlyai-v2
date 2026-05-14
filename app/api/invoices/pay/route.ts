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

  const payToken =
    body !== null &&
    typeof body === "object" &&
    "pay_token" in body &&
    typeof (body as Record<string, unknown>).pay_token === "string"
      ? ((body as Record<string, unknown>).pay_token as string)
      : null;

  if (!payToken) {
    return NextResponse.json({ error: "Missing pay_token" }, { status: 400 });
  }

  const { data: doc, error } = await supabaseAdmin
    .from("documents")
    .select("id, status")
    .eq("pay_token", payToken)
    .single();

  if (error || !doc) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (doc.status === "paid") {
    return NextResponse.json({ error: "Already paid" }, { status: 409 });
  }

  await supabaseAdmin
    .from("documents")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", doc.id);

  return NextResponse.json({ ok: true });
}
