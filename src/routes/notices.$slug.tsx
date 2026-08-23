import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, ArrowRight } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { noticeBySlugQueryOptions } from "@/lib/queries/collections";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/notices/$slug")({
  loader: async ({ params, context }) => {
    const notice = await context.queryClient.ensureQueryData(noticeBySlugQueryOptions(params.slug));
    if (!notice) throw notFound();
    return { notice };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "নোটিশ পাওয়া যায়নি" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.notice["title"]} — ছাতনী ঢেকড়া উচ্চ বিদ্যালয়`;
    const description = String(loaderData.notice["body"] ?? "").slice(0, 150);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: NoticeDetail,
});

function NoticeDetail() {
  const { notice } = Route.useLoaderData();
  const { tx } = useT();
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <article className="surface-card p-6">
          <h1 className="text-2xl font-bold text-brand-deep">
            {tx(String(notice["title"] ?? ""))}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded bg-brand px-2 py-1 font-medium text-brand-foreground">
              {tx(String(notice["category"] ?? ""))}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="size-3.5" /> {tx(String(notice["date"] ?? ""))}
            </span>
          </div>
          <p className="mt-5 text-sm leading-8 text-muted-foreground">
            {tx(String(notice["body"] ?? ""))}
          </p>
          <Link
            to="/notices"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-secondary px-3.5 py-2 text-xs font-medium text-secondary-foreground hover:bg-brand hover:text-brand-foreground"
          >
            {tx("নোটিশ বোর্ডে ফিরে যান")} <ArrowRight className="size-3.5" />
          </Link>
        </article>
      </div>
    </Layout>
  );
}
