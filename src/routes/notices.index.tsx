import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { Layout, PageHeader } from "@/components/site/Layout";
import { collectionQueryOptions, usePublished } from "@/lib/queries/collections";
import { useT } from "@/lib/i18n";

const title = "নোটিশ বোর্ড — ছাতনী ঢেকড়া উচ্চ বিদ্যালয়";
const description = "বিদ্যালয়ের সকল বিজ্ঞপ্তি, পরীক্ষা, ভর্তি ও উপবৃত্তি সংক্রান্ত ঘোষণা।";

export const Route = createFileRoute("/notices/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(collectionQueryOptions("notices", { onlyPublished: true })),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Notices,
});

function Notices() {
  const { tx } = useT();
  const notices = usePublished("notices");
  return (
    <Layout>
      <PageHeader
        title={tx("নোটিশ বোর্ড")}
        subtitle={tx("বিদ্যালয়ের সকল বিজ্ঞপ্তি ও ঘোষণা এখানে প্রকাশ করা হয়।")}
      />
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8">
        {notices.map((n) => (
          <article key={n.id} className="surface-card p-5">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded bg-brand px-2 py-1 font-medium text-brand-foreground">
                {tx(String(n["category"] ?? ""))}
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="size-3.5" /> {tx(String(n["date"] ?? ""))}
              </span>
            </div>
            <h2 className="mt-3 text-lg font-bold text-brand-deep">
              {tx(String(n["title"] ?? ""))}
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {tx(String(n["body"] ?? ""))}
            </p>
            <Link
              to="/notices/$slug"
              params={{ slug: String(n["slug"] ?? "") }}
              className="mt-4 inline-block rounded-md bg-secondary px-3.5 py-2 text-xs font-medium text-secondary-foreground hover:bg-brand hover:text-brand-foreground"
            >
              {tx("বিস্তারিত দেখুন")}
            </Link>
          </article>
        ))}
      </div>
    </Layout>
  );
}
