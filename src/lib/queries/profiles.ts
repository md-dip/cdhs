import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: "super-admin" | "editor" | "viewer";
  active: boolean;
};

const fetchProfilesFn = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
});

export function profilesQueryOptions() {
  return queryOptions({ queryKey: ["profiles"], queryFn: () => fetchProfilesFn() });
}

export function useProfiles(): Profile[] {
  return useSuspenseQuery(profilesQueryOptions()).data;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<Profile, "name" | "role" | "active">>;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Profile;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profiles"] }),
  });
}
