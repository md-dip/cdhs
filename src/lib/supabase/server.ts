import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getCookies, setCookie, setResponseHeader } from "@tanstack/react-start/server";

/**
 * Creates a fresh Supabase client bound to the current request's cookies.
 * Must be called fresh inside every server function / loader — never cache
 * this at module scope (Cloudflare Workers only populate process.env during
 * the request lifecycle, and a shared client would leak sessions across
 * concurrent requests).
 */
export function getSupabaseServerClient() {
  return createServerClient(
    process.env["VITE_SUPABASE_URL"]!,
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!,
    {
      cookies: {
        getAll() {
          return Object.entries(getCookies()).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            setCookie(name, value, options as CookieOptions);
          });
          Object.entries(headers).forEach(([key, value]) => {
            setResponseHeader(key as Parameters<typeof setResponseHeader>[0], value);
          });
        },
      },
    },
  );
}
