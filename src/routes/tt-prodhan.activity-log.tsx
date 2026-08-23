import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { History, RotateCcw, ShieldAlert } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminShell";
import { sections } from "@/lib/admin-config";
import { useChangeLog, useRevertChange, type ChangeLogEntry } from "@/lib/queries/changeLog";

export const Route = createFileRoute("/tt-prodhan/activity-log")({
  component: ActivityLogPage,
});

const TABLE_LABELS: Record<string, string> = {
  ...Object.fromEntries(sections.map((s) => [s.key, s.title])),
  settings: "সাধারণ সেটিংস",
};

const ACTION_LABELS: Record<ChangeLogEntry["action"], string> = {
  insert: "যোগ করেছেন",
  update: "সম্পাদনা করেছেন",
  delete: "মুছে ফেলেছেন",
};

function describeRow(tableName: string, data: Record<string, unknown> | null) {
  if (!data) return "";
  if (tableName === "settings") return "সাধারণ সেটিংস";
  if (tableName === "results") {
    const exam = String(data["exam"] ?? "").trim();
    const year = String(data["year"] ?? "").trim();
    return [exam, year].filter(Boolean).join(" ");
  }
  for (const key of ["title", "name", "caption"]) {
    const v = data[key];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

function formatBdTime(iso: string) {
  return new Intl.DateTimeFormat("bn-BD", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

function ActivityLogPage() {
  const { session } = Route.useRouteContext();
  const isSuperAdmin = session.profile.role === "super-admin";

  if (!isSuperAdmin) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">কার্যক্রম লগ</h1>
        </div>
        <AdminCard title="প্রবেশাধিকার নেই">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldAlert className="size-4 shrink-0 text-destructive" />
            এই পাতাটি শুধুমাত্র সুপার অ্যাডমিনদের জন্য।
          </p>
        </AdminCard>
      </div>
    );
  }

  return <ActivityLog />;
}

function ActivityLog() {
  const entries = useChangeLog();
  const revert = useRevertChange();
  const [tableFilter, setTableFilter] = useState("all");
  const [revertingId, setRevertingId] = useState<string | null>(null);

  const tableOptions = useMemo(() => {
    const present = new Set(entries.map((e) => e.table_name));
    return Array.from(present).sort();
  }, [entries]);

  const filtered =
    tableFilter === "all" ? entries : entries.filter((e) => e.table_name === tableFilter);

  const doRevert = (entry: ChangeLogEntry) => {
    const label = describeRow(entry.table_name, entry.old_data ?? entry.new_data) || entry.row_id;
    if (
      !window.confirm(
        `"${TABLE_LABELS[entry.table_name] ?? entry.table_name}" থেকে "${label}"-এর এই পরিবর্তনের আগের অবস্থায় ফিরিয়ে আনবেন? এটি বর্তমান তথ্য ওভাররাইট করবে এবং ফিরিয়ে আনা যাবে না।`,
      )
    ) {
      return;
    }
    setRevertingId(entry.id);
    revert.mutate(entry, {
      onSuccess: () => toast.success("আগের অবস্থায় ফিরিয়ে আনা হয়েছে"),
      onError: (err) => toast.error(err.message || "ফিরিয়ে আনা ব্যর্থ হয়েছে"),
      onSettled: () => setRevertingId(null),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">কার্যক্রম লগ</h1>
          <p className="text-sm text-muted-foreground">
            ওয়েবসাইটের যেকোনো তথ্য কে, কখন পরিবর্তন করেছেন তার তালিকা — প্রয়োজনে যেকোনো পরিবর্তন
            আগের অবস্থায় ফিরিয়ে আনুন।
          </p>
        </div>
      </div>

      <AdminCard title="সাম্প্রতিক পরিবর্তনসমূহ" subtitle={`মোট ${filtered.length} টি`}>
        <div className="mb-4 flex items-center gap-2">
          <label className="text-sm font-medium" htmlFor="table-filter">
            বিভাগ:
          </label>
          <select
            id="table-filter"
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">সকল বিভাগ</option>
            {tableOptions.map((t) => (
              <option key={t} value={t}>
                {TABLE_LABELS[t] ?? t}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <History className="size-4 shrink-0" />
            এখনো কোনো কার্যক্রম রেকর্ড করা হয়নি।
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((entry) => {
              const label = describeRow(entry.table_name, entry.old_data ?? entry.new_data);
              const who = entry.profiles?.name || entry.profiles?.email || "অজানা";
              return (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">{who}</span>{" "}
                      <span className="text-muted-foreground">
                        {TABLE_LABELS[entry.table_name] ?? entry.table_name}
                      </span>{" "}
                      {label ? <span className="font-medium">"{label}"</span> : null}{" "}
                      <span className="text-muted-foreground">{ACTION_LABELS[entry.action]}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatBdTime(entry.changed_at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => doRevert(entry)}
                    disabled={revert.isPending && revertingId === entry.id}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-60"
                  >
                    <RotateCcw className="size-3.5" />
                    আগের অবস্থায় ফিরিয়ে আনুন
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
