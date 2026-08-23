import { Panel } from "@/components/site/Layout";
import { usePublished } from "@/lib/queries/collections";
import { useT, toEnDigits } from "@/lib/i18n";

function toCount(value: unknown) {
  return Number(toEnDigits(String(value ?? ""))) || 0;
}

/**
 * Reads the boys/girls headcount typed directly onto each class (শ্রেণি ও আসন), rather than
 * counting individual student records — there's no per-student admin page anymore, so a
 * per-class count is the only thing an admin can realistically keep up to date. Renders
 * nothing (including its own Panel) until at least one class has a non-zero headcount.
 */
export function StudentsByClassPanel({ title }: { title: string }) {
  const { t, n, tx } = useT();
  const classes = usePublished("classes");

  const rows = classes.map((c) => {
    const boys = toCount(c["boys"]);
    const girls = toCount(c["girls"]);
    return { name: String(c["name"] ?? ""), boys, girls, total: boys + girls };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      boys: acc.boys + r.boys,
      girls: acc.girls + r.girls,
      total: acc.total + r.total,
    }),
    { boys: 0, girls: 0, total: 0 },
  );

  if (!totals.total) return null;

  return (
    <Panel title={title}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              {[
                t("শ্রেণি", "Class"),
                t("ছাত্র", "Boys"),
                t("ছাত্রী", "Girls"),
                t("মোট", "Total"),
              ].map((h) => (
                <th key={h} className="px-3 py-2.5 text-start font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-border/70">
                <td className="px-3 py-2.5">{tx(r.name)}</td>
                <td className="px-3 py-2.5">{n(r.boys)}</td>
                <td className="px-3 py-2.5">{n(r.girls)}</td>
                <td className="px-3 py-2.5 font-medium">{n(r.total)}</td>
              </tr>
            ))}
            <tr className="bg-secondary/60 font-semibold text-brand-deep">
              <td className="px-3 py-2.5">{t("সর্বমোট", "Grand total")}</td>
              <td className="px-3 py-2.5">{n(totals.boys)}</td>
              <td className="px-3 py-2.5">{n(totals.girls)}</td>
              <td className="px-3 py-2.5">{n(totals.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
