import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader, Panel } from "@/components/site/Layout";
import { collectionQueryOptions, usePublished } from "@/lib/queries/collections";
import { useT } from "@/lib/i18n";

const title = "পরিচালনা পর্ষদ | ছাতনী ঢেকড়া উচ্চ বিদ্যালয়";
const description = "বিদ্যালয় ব্যবস্থাপনা কমিটির বর্তমান সদস্যবৃন্দের তালিকা ও পদবি।";

export const Route = createFileRoute("/committee")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      collectionQueryOptions("committee", { onlyPublished: true }),
    ),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Committee,
});

function Committee() {
  const { tx, n } = useT();
  const committee = usePublished("committee");
  return (
    <Layout>
      <PageHeader
        title={tx("পরিচালনা পর্ষদ")}
        subtitle={tx("বিদ্যালয় ব্যবস্থাপনা কমিটির বর্তমান সদস্যবৃন্দ।")}
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Panel title={tx("কমিটির সদস্যবৃন্দ")}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  {["ক্রম", "নাম", "পদবি"]
                    .map((x) => tx(x))
                    .map((h) => (
                      <th key={h} className="px-3 py-2.5 text-start font-medium">
                        {h}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {committee.map((row, i) => (
                  <tr key={row.id} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-2.5">{n(String(i + 1))}</td>
                    <td className="px-3 py-2.5">{String(row["name"] ?? "")}</td>
                    <td className="px-3 py-2.5">{tx(String(row["designation"] ?? ""))}</td>
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
