import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader, Panel } from "@/components/site/Layout";
import { collectionQueryOptions, usePublished } from "@/lib/queries/collections";
import { parseRows } from "@/lib/rows";
import { useT } from "@/lib/i18n";

const title = "শ্রেণি ও পরীক্ষার রুটিন | ছাতনী ঢেকড়া উচ্চ বিদ্যালয়";
const description = "৯ম শ্রেণির শ্রেণি রুটিন ও অর্ধবার্ষিক পরীক্ষার সময়সূচি ২০২৬।";

export const Route = createFileRoute("/routine")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      collectionQueryOptions("routines", { onlyPublished: true }),
    ),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: RoutinePage,
});

function RoutinePage() {
  const { tx } = useT();
  const routines = usePublished("routines");
  return (
    <Layout>
      <PageHeader
        title={tx("শ্রেণি ও পরীক্ষার রুটিন")}
        subtitle={tx("প্রকাশিত সকল রুটিন নিচে দেওয়া হলো। পরিবর্তন হলে এখানেই হালনাগাদ করা হবে।")}
      />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        {routines.map((r) => (
          <Panel key={r.id} title={tx(String(r["title"] ?? ""))}>
            <p className="-mt-1 mb-4 text-xs text-muted-foreground">
              {tx(String(r["published"] ?? ""))}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    {["পিরিয়ড / তারিখ", "সময়", "বিষয়", "শিক্ষক / শ্রেণি"]
                      .map((x) => tx(x))
                      .map((h) => (
                        <th key={h} className="px-3 py-2.5 text-start font-medium">
                          {h}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {parseRows(String(r["rows"] ?? "")).map((row) => (
                    <tr key={row.join()} className="border-b border-border/70 last:border-0">
                      {row.map((cell) => (
                        <td key={cell} className="px-3 py-2.5">
                          {tx(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        ))}
      </div>
    </Layout>
  );
}
