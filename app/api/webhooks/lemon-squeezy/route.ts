// Stub: logs incoming Lemon Squeezy webhooks. No-op until LS is live.
// TODO: verify X-Signature with LEMON_SQUEEZY_SIGNING_SECRET
// TODO: parse event type and update subscriptions table
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();

  console.log("[lemon-squeezy webhook] received:", body.slice(0, 200));

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
