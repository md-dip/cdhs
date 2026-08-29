import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Real health check for an external uptime monitor (see supabase/schema.sql's old
// keepalive notes / senior dev's advice) to hit every few minutes. It runs a real
// Supabase SELECT on every request — not a static/cached page — so each hit both
// (a) tells us if the site or the database is actually down, and (b) counts as
// real database activity, which keeps Supabase's free-tier project from
// auto-pausing after 7 days of inactivity. `no-store` so Cloudflare never caches
// the response and short-circuits the DB check. Point the monitor at /api/health
// and have it look for "ok":true in the body (most uptime monitors support a
// keyword check alongside the HTTP status).
const checkHealth = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("cache-control", "no-store, no-cache, must-revalidate");
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("settings").select("id").limit(1);
    if (error) throw error;
    return { ok: true, checkedAt: new Date().toISOString() };
  } catch (error) {
    console.error("Health check failed:", error);
    return { ok: false, checkedAt: new Date().toISOString() };
  }
});

export const Route = createFileRoute("/api/health")({
  loader: () => checkHealth(),
  component: HealthPage,
});

function HealthPage() {
  const data = Route.useLoaderData();
  return <pre>{JSON.stringify(data)}</pre>;
}
