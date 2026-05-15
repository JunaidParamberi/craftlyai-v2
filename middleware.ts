import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { isPlanAtLeast } from "@/config/plans";
import type { PlanTier } from "@/config/plans";

// Add Pro-only feature routes here as Phase 3-4 features land
const PRO_ROUTES: string[] = [];

const PUBLIC_PATHS = [
  "/auth",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/pricing",
  "/about",
  "/blog",
  "/pay",
  "/quote",
  "/proposal",
  "/portal",
  "/api",
];

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return response;

  if (PRO_ROUTES.length > 0 && PRO_ROUTES.some((r) => pathname.startsWith(r))) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(new URL("/login", request.url));

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_tier")
      .eq("id", user.id)
      .single();

    const tier = (profile?.plan_tier ?? "free") as PlanTier;
    if (!isPlanAtLeast(tier, "pro")) {
      return NextResponse.redirect(new URL("/settings/billing", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
