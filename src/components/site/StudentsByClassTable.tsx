import { useMemo } from "react";
import { usePublished } from "@/lib/queries/collections";
import { useT } from "@/lib/i18n";

/** Renders null when there's no student data yet — callers decide whether to show anything around it. */
export function StudentsByClassTable() {
  const { t, n, tx } = useT();
  const students = usePublished("students");
  const classes = usePublished("classes");

  const rows = useMemo(() => {
    const order = classes.map((c) => String(c["name"]));
    const names = Array.from(
      new Set([...order, ...students.map((s) => String(s["className"] ?? ""))].filter(Boolean)),
    );
    return names.map((name) => {
      const inClass = students.filter((s) => String(s["className"]) === name);
      const boys = inClass.filter((s) => String(s["gender"]) === "ছাত্র").length;
      const girls = inClass.filter((s) => String(s["gender"]) === "ছাত্রী").length;
      return { name, boys, girls, total: inClass.length };
    });
  }, [students, classes]);

  const totals = rows.reduce(
    (acc, r) => ({
      boys: acc.boys + r.boys,
      girls: acc.girls + r.girls,
      total: acc.total + r.total,
    }),
    { boys: 0, girls: 0, total: 0 },
  );

  if (!students.length) return null;

  return (
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
  );
}
