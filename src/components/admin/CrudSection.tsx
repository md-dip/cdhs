import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { toast } from "sonner";
import type { SectionConfig } from "@/lib/admin-config";
import {
  useCollection,
  useCreateRow,
  useDeleteRow,
  useUpdateRow,
  type Row,
} from "@/lib/queries/collections";
import { AdminCard } from "./AdminShell";

function emptyDraft(config: SectionConfig) {
  const draft: Record<string, string> = {};
  config.fields.forEach((f) => {
    draft[f.name] = f.name === "status" ? "published" : "";
  });
  return draft;
}

export function CrudSection({ config }: { config: SectionConfig }) {
  const rows = useCollection(config.key);
  const createRow = useCreateRow(config.key);
  const updateRow = useUpdateRow(config.key);
  const deleteRow = useDeleteRow(config.key);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>(() => emptyDraft(config));
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      Object.values(r).some((v) => typeof v === "string" && v.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  const startNew = () => {
    setEditing(null);
    setDraft(emptyDraft(config));
    setShowForm(true);
  };

  const startEdit = (row: Row) => {
    const next: Record<string, string> = {};
    config.fields.forEach((f) => {
      next[f.name] = String(row[f.name] ?? "");
    });
    setEditing(row);
    setDraft(next);
    setShowForm(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateRow.mutate(
        { id: editing.id, patch: draft },
        {
          onSuccess: () => {
            toast.success("তথ্য হালনাগাদ করা হয়েছে");
            setShowForm(false);
            setEditing(null);
          },
          onError: (err) => toast.error(err.message || "হালনাগাদ ব্যর্থ হয়েছে"),
        },
      );
    } else {
      createRow.mutate(draft, {
        onSuccess: () => {
          toast.success("নতুন তথ্য যোগ করা হয়েছে");
          setShowForm(false);
          setEditing(null);
        },
        onError: (err) => toast.error(err.message || "যোগ করা ব্যর্থ হয়েছে"),
      });
    }
  };

  const del = (row: Row) => {
    deleteRow.mutate(row.id, {
      onSuccess: () => {
        toast.success("মুছে ফেলা হয়েছে");
        if (editing?.id === row.id) setShowForm(false);
      },
      onError: (err) => toast.error(err.message || "মুছে ফেলা ব্যর্থ হয়েছে"),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> নতুন যোগ করুন
        </button>
      </div>

      {showForm ? (
        <AdminCard
          title={
            editing ? `সম্পাদনা: ${String(editing[config.columns[0]!.name] ?? "")}` : "নতুন এন্ট্রি"
          }
          subtitle="সকল ঘরে সঠিক তথ্য দিন এবং সংরক্ষণ করুন।"
        >
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            {config.fields.map((f) => (
              <div key={f.name} className={f.full || f.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="mb-1 block text-sm font-medium" htmlFor={`f-${f.name}`}>
                  {f.label}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    id={`f-${f.name}`}
                    rows={6}
                    value={draft[f.name] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                ) : f.type === "select" ? (
                  <select
                    id={`f-${f.name}`}
                    value={draft[f.name] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {(f.options ?? []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`f-${f.name}`}
                    type={f.type === "password" ? "password" : "text"}
                    value={draft[f.name] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                )}
              </div>
            ))}
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {editing ? "হালনাগাদ করুন" : "সংরক্ষণ করুন"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-input px-4 py-2 text-sm"
              >
                বাতিল
              </button>
              {editing ? (
                <button
                  type="button"
                  onClick={() => del(editing)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground"
                >
                  <Trash2 className="size-4" /> মুছে ফেলুন
                </button>
              ) : null}
            </div>
          </form>
        </AdminCard>
      ) : null}

      <AdminCard title={`সকল ${config.title}`} subtitle={`মোট ${filtered.length} টি এন্ট্রি`}>
        <div className="mb-3 flex items-center gap-2 rounded-md border border-input px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="খুঁজুন..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                {config.columns.map((c) => (
                  <th key={c.name} className="px-3 py-2 text-left font-semibold">
                    {c.label}
                  </th>
                ))}
                <th className="px-3 py-2 text-left font-semibold">অবস্থা</th>
                <th className="px-3 py-2 text-right font-semibold">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  {config.columns.map((c) => (
                    <td key={c.name} className="px-3 py-2 align-top">
                      {String(row[c.name] ?? "").slice(0, 90)}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        row.status === "unpublished"
                          ? "bg-muted text-muted-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {row.status === "unpublished" ? "অপ্রকাশিত" : "প্রকাশিত"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        title="প্রকাশ / অপ্রকাশ"
                        onClick={() =>
                          updateRow.mutate(
                            {
                              id: row.id,
                              patch: {
                                status: row.status === "unpublished" ? "published" : "unpublished",
                              },
                            },
                            {
                              onError: (err) =>
                                toast.error(err.message || "হালনাগাদ ব্যর্থ হয়েছে"),
                            },
                          )
                        }
                        className="rounded-md border border-input p-1.5 hover:bg-secondary"
                      >
                        {row.status === "unpublished" ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        title="সম্পাদনা"
                        onClick={() => startEdit(row)}
                        className="rounded-md border border-input p-1.5 hover:bg-secondary"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="মুছে ফেলুন"
                        onClick={() => del(row)}
                        className="rounded-md border border-input p-1.5 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={config.columns.length + 2}
                    className="px-3 py-6 text-center text-muted-foreground"
                  >
                    কোনো তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
