import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type Status = "published" | "unpublished";
export type Row = Record<string, string | number | boolean | null> & {
  id: string;
  status?: Status;
};

const COLLECTION_KEYS = [
  "notices",
  "teachers",
  "committee",
  "routines",
  "gallery",
  "students",
  "admissions",
  "classes",
  "books",
  "results",
  "posts",
  "pages",
  "media",
] as const;

export type CollectionKey = (typeof COLLECTION_KEYS)[number];

/** Collections with an admin-driven drag-and-drop display order (see `sort_order` column). */
export const ORDERABLE_COLLECTIONS = new Set<CollectionKey>([
  "teachers",
  "committee",
  "classes",
  "books",
  "results",
]);

/**
 * True when a Postgrest error means "the `sort_order` migration (supabase/schema.sql) hasn't
 * been run against this database yet" — i.e. the column genuinely doesn't exist. Covers both
 * shapes Postgrest can return: a real Postgres error from the query planner (42703, e.g. from
 * `.order("sort_order")`) and its own schema-cache rejection for unknown JSON body keys (no
 * standard Postgres code, just a "schema cache" message — happens on `.update({ sort_order })`).
 */
function isMissingSortOrderColumn(error: { code?: string | null; message?: string } | null) {
  if (!error) return false;
  if (error.code === "42703") return true;
  return /schema cache/i.test(error.message ?? "");
}

/**
 * True when a brand-new collection's table itself hasn't been created in this database yet
 * (e.g. `results`, added alongside this code but requiring a separate SQL migration). Treated
 * as "no rows yet" rather than an error, so a page reading a not-yet-migrated collection shows
 * an empty section instead of crashing.
 */
function isMissingTable(error: { code?: string | null; message?: string } | null) {
  if (!error) return false;
  if (error.code === "42P01") return true;
  return /could not find the table/i.test(error.message ?? "");
}

function buildCollectionQuery(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  key: CollectionKey,
  onlyPublished: boolean | undefined,
  useSortOrder: boolean,
) {
  let query = useSortOrder
    ? supabase.from(key).select("*").order("sort_order", { ascending: true })
    : supabase.from(key).select("*").order("created_at", { ascending: false });
  if (onlyPublished) query = query.eq("status", "published");
  return query;
}

const fetchCollectionFn = createServerFn({ method: "GET" })
  .validator(z.object({ key: z.enum(COLLECTION_KEYS), onlyPublished: z.boolean().optional() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const orderable = ORDERABLE_COLLECTIONS.has(data.key);
    let { data: rows, error } = await buildCollectionQuery(
      supabase,
      data.key,
      data.onlyPublished,
      orderable,
    );
    // Fall back to the pre-migration ordering instead of hard-erroring, so the site stays
    // up while the sort_order migration is still pending.
    if (orderable && isMissingSortOrderColumn(error)) {
      ({ data: rows, error } = await buildCollectionQuery(
        supabase,
        data.key,
        data.onlyPublished,
        false,
      ));
    }
    if (isMissingTable(error)) return [];
    if (error) throw new Error(error.message);
    return (rows ?? []) as Row[];
  });

const fetchNoticeBySlugFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: row, error } = await supabase
      .from("notices")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as Row | null;
  });

export function noticeBySlugQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["notice-by-slug", slug],
    queryFn: () => fetchNoticeBySlugFn({ data: { slug } }),
  });
}

const fetchPageBySlugFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: row, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as Row | null;
  });

export function pageBySlugQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["page-by-slug", slug],
    queryFn: () => fetchPageBySlugFn({ data: { slug } }),
  });
}

export function collectionQueryOptions(key: CollectionKey, opts: { onlyPublished?: boolean } = {}) {
  const onlyPublished = opts.onlyPublished ?? false;
  return queryOptions({
    queryKey: ["collection", key, onlyPublished],
    queryFn: () => fetchCollectionFn({ data: { key, onlyPublished } }),
  });
}

/** Live, published-only rows — for public site pages. */
export function usePublished(key: CollectionKey): Row[] {
  return useSuspenseQuery(collectionQueryOptions(key, { onlyPublished: true })).data;
}

/** Every row regardless of status — for the admin panel (RLS still applies: only admins get this). */
export function useCollection(key: CollectionKey): Row[] {
  return useSuspenseQuery(collectionQueryOptions(key, { onlyPublished: false })).data;
}

export function useCreateRow(key: CollectionKey) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Record<string, string | number | boolean | null>) => {
      const supabase = getSupabaseBrowserClient();
      let { data, error } = await supabase.from(key).insert(item).select().single();
      // Same pending-migration case as fetchCollectionFn/useReorderRows: drop sort_order
      // and retry rather than blocking the admin from adding the row at all.
      if (error && "sort_order" in item && isMissingSortOrderColumn(error)) {
        const { sort_order: _sortOrder, ...rest } = item;
        ({ data, error } = await supabase.from(key).insert(rest).select().single());
      }
      if (error) throw new Error(error.message);
      return data as Row;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collection", key] }),
  });
}

export function useUpdateRow(key: CollectionKey) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Record<string, string | number | boolean | null>;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.from(key).update(patch).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return data as Row;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collection", key] }),
  });
}

/** Persists a full drag-and-drop reorder: `orderedIds` is the new top-to-bottom row order. */
export function useReorderRows(key: CollectionKey) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const supabase = getSupabaseBrowserClient();
      const results = await Promise.all(
        orderedIds.map((id, index) =>
          supabase.from(key).update({ sort_order: index }).eq("id", id),
        ),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        if (isMissingSortOrderColumn(failed.error)) {
          throw new Error(
            "ক্রম পরিবর্তন এখনো চালু হয়নি — ওয়েবসাইট আপডেট শেষ হওয়া পর্যন্ত অপেক্ষা করুন।",
          );
        }
        throw new Error(failed.error.message);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collection", key] }),
  });
}

export function useDeleteRow(key: CollectionKey) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from(key).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collection", key] }),
  });
}
