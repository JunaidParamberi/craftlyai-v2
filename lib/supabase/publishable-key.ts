/**
 * Supports new publishable keys (`sb_publishable_...`) and legacy anon JWT.
 * https://supabase.com/docs/guides/api/api-keys
 */
export function getSupabasePublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env",
    );
  }
  return key;
}
