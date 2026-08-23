import { createClient } from "@supabase/supabase-js";

/**
 * Full-privilege client using the secret key — bypasses RLS entirely.
 * Server-only, and only for the Supabase Admin API (inviting new admin users).
 * Every server function that uses this MUST independently verify the caller
 * is an authorized admin first (see getServerSession) — this client trusts
 * nothing on its own.
 */
export function getSupabaseAdminClient() {
  return createClient(process.env["VITE_SUPABASE_URL"]!, process.env["SUPABASE_SECRET_KEY"]!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
