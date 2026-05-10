import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSupabasePublishableKey } from "@/lib/supabase/publishable-key";

/** Table must not exist — PostgREST then errors in a way that proves auth + DB path work. */
const PROBE_TABLE = "_craftly_connection_probe";

function keyShape(key: string): "publishable" | "secret" | "anon_jwt" | "unknown" {
  if (key.startsWith("sb_publishable_")) return "publishable";
  if (key.startsWith("sb_secret_")) return "secret";
  if (key.startsWith("eyJ")) return "anon_jwt";
  return "unknown";
}

function parseHost(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Uses the official client so publishable vs anon JWT headers match Supabase expectations.
 */
async function probePostgrest(url: string, key: string): Promise<{
  ok: boolean;
  reason?: string;
  code?: string;
}> {
  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { error } = await supabase.from(PROBE_TABLE).select("id").limit(1);

  if (!error) {
    return { ok: true };
  }

  const code = error.code ?? "";
  const msg = error.message ?? "";
  const lower = msg.toLowerCase();

  // JWT / API key rejected at gateway or PostgREST
  if (
    code === "PGRST301" ||
    lower.includes("invalid jwt") ||
    lower.includes("jwt expired") ||
    (lower.includes("invalid") && lower.includes("api")) ||
    lower.includes("invalid api key")
  ) {
    return { ok: false, reason: msg, code };
  }

  // Missing relation / schema cache → request was authorized
  if (
    code === "PGRST205" ||
    code === "42P01" ||
    lower.includes("does not exist") ||
    lower.includes("could not find the table") ||
    lower.includes("schema cache")
  ) {
    return { ok: true };
  }

  return { ok: false, reason: msg, code };
}

/**
 * GET /api/health/supabase
 * Optional: ?debug=1 adds non-secret diagnostics (host, key shape).
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
  const debug = request.nextUrl.searchParams.get("debug") === "1";

  try {
    const primaryKey = getSupabasePublishableKey();
    const anonFallback = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    if (!baseUrl) {
      return NextResponse.json(
        { ok: false, error: "NEXT_PUBLIC_SUPABASE_URL is not set" },
        { status: 500 },
      );
    }

    const started = performance.now();

    let result = await probePostgrest(baseUrl, primaryKey);

    if (
      !result.ok &&
      anonFallback &&
      anonFallback !== primaryKey
    ) {
      result = await probePostgrest(baseUrl, anonFallback);
    }

    const latencyMs = Math.round(performance.now() - started);

    if (!result.ok) {
      const payload: Record<string, unknown> = {
        ok: false,
        error:
          result.reason ??
          "Could not verify Supabase — check URL and keys for this project.",
        code: result.code,
        latencyMs,
        hints: [
          "Open Supabase → Settings → API: Project URL must match NEXT_PUBLIC_SUPABASE_URL exactly.",
          "Use API keys from the same project (Connect dialog or API Keys).",
          "Publishable key starts with sb_publishable_. Legacy anon key is a long JWT (eyJ…).",
          "Restart the dev server after editing `.env`.",
          "Do not use a secret key (sb_secret_) in NEXT_PUBLIC_* — use publishable or anon only in the app.",
        ],
      };

      if (debug) {
        payload.checks = {
          urlHost: parseHost(baseUrl),
          primaryKeyShape: keyShape(primaryKey),
          triedAnonFallback: Boolean(anonFallback && anonFallback !== primaryKey),
        };
      }

      return NextResponse.json(payload, { status: 503 });
    }

    return NextResponse.json({
      ok: true,
      latencyMs,
      message: "Supabase reachable (PostgREST accepted credentials)",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 503 },
    );
  }
}
