import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader, Panel } from "@/components/site/Layout";
import { StudentsByClassPanel } from "@/components/site/StudentsByClassTable";
import { collectionQueryOptions, usePublished } from "@/lib/queries/collections";
import { useT } from "@/lib/i18n";

const title = "একাডেমিক তথ্য | ছাতনী ঢেকড়া উচ্চ বিদ্যালয়";
const description = "শ্রেণি ও আসন সংখ্যা, পাঠ্যপুস্তকের তালিকা এবং এসএসসি ফলাফলের তথ্য।";

const ACADEMICS_COLLECTIONS = ["classes", "books", "results"] as const;

export const Route = createFileRoute("/academics")({
  loader: ({ context }) =>
    Promise.all(
      ACADEMICS_COLLECTIONS.map((key) =>
        context.queryClient.ensureQueryData(collectionQueryOptions(key, { onlyPublished: true })),
      ),
    ),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Academics,
});

function Academics() {
  const { tx, n } = useT();
  const classes = usePublished("classes");
  const books = usePublished("books");
  const results = usePublished("results");
  return (
    <Layout>
      <PageHeader
        title={tx("একাডেমিক তথ্য")}
        subtitle={tx("শ্রেণি, বিভাগ, পাঠ্যপুস্তক ও ফলাফল সংক্রান্ত সকল তথ্য।")}
      />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <Panel title={tx("শ্রেণি ও আসন সংখ্যা")}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  {["শ্রেণি", "আসন সংখ্যা", "বিভাগ"]
                    .map((x) => tx(x))
                    .map((h) => (
                      <th key={h} className="px-3 py-2.5 text-start font-medium">
                        {h}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-2.5">{tx(String(c["name"] ?? ""))}</td>
                    <td className="px-3 py-2.5">{n(String(c["seats"] ?? ""))}</td>
                    <td className="px-3 py-2.5">{tx(String(c["group"] ?? ""))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <StudentsByClassPanel title={tx("শ্রেণি ও লিঙ্গভিত্তিক শিক্ষার্থীর সংখ্যা")} />

        <Panel title={tx("পাঠ্যপুস্তকের তালিকা")}>
          <ul className="grid gap-3 text-sm md:grid-cols-3">
            {books.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-md bg-secondary/70 px-4 py-3"
              >
                <span>{tx(String(b["name"] ?? ""))}</span>
                <span className="text-xs font-medium text-brand">{n(String(b["code"] ?? ""))}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={tx("এসএসসি ফলাফল")}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  {["সন", "পরীক্ষা", "অংশগ্রহণ", "উত্তীর্ণ", "জিপিএ-৫"]
                    .map((x) => tx(x))
                    .map((h) => (
                      <th key={h} className="px-3 py-2.5 text-start font-medium">
                        {h}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-2.5">{n(String(r["year"] ?? ""))}</td>
                    <td className="px-3 py-2.5">{tx(String(r["exam"] ?? ""))}</td>
                    <td className="px-3 py-2.5">{n(String(r["appeared"] ?? ""))}</td>
                    <td className="px-3 py-2.5">{n(String(r["passed"] ?? ""))}</td>
                    <td className="px-3 py-2.5">{n(String(r["gpa5"] ?? ""))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </Layout>
  );
}
