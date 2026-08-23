import { createServerFn } from "@tanstack/react-start";
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
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { name: data.name },
    });
    if (error) throw new Error(error.message);
  });
