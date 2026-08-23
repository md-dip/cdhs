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
  "posts",
  "pages",
  "media",
] as const;

export type CollectionKey = (typeof COLLECTION_KEYS)[number];

const fetchCollectionFn = createServerFn({ method: "GET" })
  .validator(z.object({ key: z.enum(COLLECTION_KEYS), onlyPublished: z.boolean().optional() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    let query = supabase.from(data.key).select("*").order("created_at", { ascending: false });
    if (data.onlyPublished) query = query.eq("status", "published");
    const { data: rows, error } = await query;
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
      const { data, error } = await supabase.from(key).insert(item).select().single();
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
