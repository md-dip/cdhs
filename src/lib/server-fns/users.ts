import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getServerSession } from "./auth";

/**
 * Invites a new admin by email (they set their own password via the emailed link).
 * Uses the Supabase Admin API, which requires the secret key — never exposed to
 * the client. Every call re-checks the caller's own session server-side: a
 * route's beforeLoad only guards navigation through the router, not this
 * function's own HTTP endpoint, so the authorization check has to live here too.
 */
export const inviteAdminFn = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), name: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await getServerSession();
    if (!session || session.profile.role !== "super-admin") {
      throw new Error("এই কাজটি করার অনুমতি শুধু সুপার অ্যাডমিনের রয়েছে");
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const redirectTo = new URL("/accept-invite", getRequestUrl()).toString();
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { name: data.name },
      redirectTo,
    });
    if (error) throw new Error(error.message);
  });

/**
 * Permanently removes an admin: deletes their Supabase Auth account, which
 * cascades to delete their profiles row too (profiles.id references
 * auth.users.id on delete cascade). Unlike deactivating (active = false, an
 * RLS-level toggle any super-admin can already do directly from the browser),
 * this needs the Admin API — hence a server function, not a client-side call.
 */
export const removeAdminFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const session = await getServerSession();
    if (!session || session.profile.role !== "super-admin") {
      throw new Error("এই কাজটি করার অনুমতি শুধু সুপার অ্যাডমিনের রয়েছে");
    }
    if (data.id === session.user.id) {
      throw new Error("নিজেকে মুছে ফেলা যাবে না");
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
    if (error) throw new Error(error.message);
  });
