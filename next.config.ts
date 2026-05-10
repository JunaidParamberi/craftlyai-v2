import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  /**
   * Avoid broken webpack vendor-chunk resolution for scoped packages
   * (e.g. "Cannot find module './vendor-chunks/@supabase.js'") on server routes
   * that use `lib/supabase/server` + Server Components.
   */
  serverExternalPackages: ["@supabase/supabase-js", "@supabase/ssr"],
};

export default nextConfig;
