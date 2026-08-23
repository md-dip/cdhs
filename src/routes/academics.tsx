import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader, Panel } from "@/components/site/Layout";
import { classSeats, books, results } from "@/lib/site-data";
import { useT } from "@/lib/i18n";

const title = "একাডেমিক তথ্য — ছাতনী ঢেকড়া উচ্চ বিদ্যালয়";
const description = "শ্রেণি ও আসন সংখ্যা, পাঠ্যপুস্তকের তালিকা এবং এসএসসি ফলাফলের তথ্য।";

export const Route = createFileRoute("/academics")({
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
                {classSeats.map((c) => (
                  <tr key={c.name} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-2.5">{tx(c.name)}</td>
                    <td className="px-3 py-2.5">{n(c.seats)}</td>
                    <td className="px-3 py-2.5">{tx(c.group)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title={tx("পাঠ্যপুস্তকের তালিকা")}>
          <ul className="grid gap-3 text-sm md:grid-cols-3">
            {books.map(([name, code]) => (
              <li
                key={`${name}-${code}`}
                className="flex items-center justify-between rounded-md bg-secondary/70 px-4 py-3"
              >
                <span>{tx(name ?? "")}</span>
                <span className="text-xs font-medium text-brand">{n(code ?? "")}</span>
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
                  <tr key={r.year} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-2.5">{n(r.year)}</td>
                    <td className="px-3 py-2.5">{tx(r.exam)}</td>
                    <td className="px-3 py-2.5">{n(r.appeared)}</td>
                    <td className="px-3 py-2.5">{n(r.passed)}</td>
                    <td className="px-3 py-2.5">{n(r.gpa5)}</td>
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
