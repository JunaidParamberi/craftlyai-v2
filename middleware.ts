import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Exclude Next internals, APIs, and file-like URLs so middleware never runs on
     * CSS/JS/font chunks or dev endpoints (fixes plain HTML / missing Tailwind after navigation).
     * Use `_next` / `api/` prefixes so routes like `/apiary` still match middleware.
     */
    "/((?!_next|__nextjs|api(?:/|$)|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|mjs|map|woff2?|ttf|eot)$).*)",
  ],
};
