import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getServerSession } from "./auth";

const ROLE = z.enum(["super-admin", "editor", "viewer"]);

/**
 * Creates a new admin directly with the password the super-admin sets here —
 * no invite email involved. Uses the Supabase Admin API (secret key, never
 * exposed to the client). Every call re-checks the caller's own session
 * server-side: a route's beforeLoad only guards navigation through the
 * router, not this function's own HTTP endpoint, so the authorization check
 * has to live here too.
 */
export const createAdminFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
      role: ROLE,
    }),
  )
  .handler(async ({ data }) => {
    const session = await getServerSession();
    if (!session || session.profile.role !== "super-admin") {
      throw new Error("এই কাজটি করার অনুমতি শুধু সুপার অ্যাডমিনের রয়েছে");
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { name: data.name },
    });
    if (error) throw new Error(error.message);

    // The handle_new_user trigger already created a profiles row with default
    // role='editor', active=false — overwrite it with what was actually chosen.
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role: data.role, active: true })
      .eq("id", created.user.id);
    if (profileError) throw new Error(profileError.message);
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
