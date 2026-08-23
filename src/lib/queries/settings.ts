import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type Settings = Record<string, string>;

const fetchSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
  if (error) throw new Error(error.message);
  return data as Settings;
});

export function settingsQueryOptions() {
  return queryOptions({
    queryKey: ["settings"],
    queryFn: () => fetchSettingsFn(),
  });
}

export function useSettings(): Settings {
  return useSuspenseQuery(settingsQueryOptions()).data;
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Record<string, string>) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("settings")
        .update(patch)
        .eq("id", 1)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Settings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], data);
    },
  });
}
