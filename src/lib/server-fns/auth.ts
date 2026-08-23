import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AdminSession = {
  user: { id: string; email: string };
  profile: { name: string; role: string; active: boolean };
};

/**
 * Verifies the current request's session against Supabase Auth (revalidates the
 * JWT server-side — deliberately uses getUser(), not getSession(), which only
 * trusts an unverified cookie) and joins the matching profile. Returns null for
 * anyone unauthenticated OR whose profile is inactive.
 */
export const getServerSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminSession | null> => {
    const supabase = getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role, active")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.active) return null;

    return {
      user: { id: user.id, email: user.email ?? "" },
      profile: { name: profile.name, role: profile.role, active: profile.active },
    };
  },
);
