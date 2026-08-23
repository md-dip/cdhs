import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ChangeAction = "insert" | "update" | "delete";

/** A logged row is always a flat snapshot of one of the tracked tables — every column on
 * those tables is a plain scalar (text/integer/boolean), never nested JSON. */
type JsonRow = Record<string, string | number | boolean | null>;

export type ChangeLogEntry = {
  id: string;
  table_name: string;
  row_id: string;
  action: ChangeAction;
  old_data: JsonRow | null;
  new_data: JsonRow | null;
  changed_by: string | null;
  changed_at: string;
  profiles: { name: string; email: string } | null;
};

const LOG_LIMIT = 200;

const fetchChangeLogFn = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("change_log")
    .select("*, profiles(name, email)")
    .order("changed_at", { ascending: false })
    .limit(LOG_LIMIT);
  // The change_log migration may not have been run yet on this database — show an
  // empty log instead of crashing the page (matches the collections.ts pattern).
  if (error?.code === "42P01" || /could not find the table/i.test(error?.message ?? "")) {
    return [];
  }
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ChangeLogEntry[];
});

export function changeLogQueryOptions() {
  return queryOptions({
    queryKey: ["change-log"],
    queryFn: () => fetchChangeLogFn(),
  });
}

export function useChangeLog() {
  return useSuspenseQuery(changeLogQueryOptions()).data;
}

/** Restores the row a log entry is about to its state from right before that entry's change. */
export function useRevertChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: ChangeLogEntry) => {
      const supabase = getSupabaseBrowserClient();
      if (entry.action === "insert") {
        const { error } = await supabase.from(entry.table_name).delete().eq("id", entry.row_id);
        if (error) throw new Error(error.message);
        return;
      }
      if (!entry.old_data) throw new Error("পুরনো তথ্য পাওয়া যায়নি — ফিরিয়ে আনা সম্ভব নয়।");
      if (entry.action === "delete") {
        const { error } = await supabase.from(entry.table_name).insert(entry.old_data);
        if (error) throw new Error(error.message);
        return;
      }
      const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...patch } = entry.old_data;
      const { error } = await supabase.from(entry.table_name).update(patch).eq("id", entry.row_id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["change-log"] });
      queryClient.invalidateQueries({ queryKey: ["collection"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
