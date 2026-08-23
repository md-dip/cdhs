import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, UserPlus, ShieldAlert } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminShell";
import { useProfiles, useUpdateProfile } from "@/lib/queries/profiles";
import { createAdminFn, removeAdminFn } from "@/lib/server-fns/users";

export const Route = createFileRoute("/tt-prodhan/users")({
  component: UsersPage,
});

const ROLE_OPTIONS = ["super-admin", "editor", "viewer"] as const;

function UsersPage() {
  const { session } = Route.useRouteContext();
  if (session.profile.role !== "super-admin") {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">ইউজার ও অ্যাডমিন</h1>
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
  return <UsersContent />;
}

function UsersContent() {
  const { session } = Route.useRouteContext();
  const profiles = useProfiles();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const removeAdmin = useMutation({
    mutationFn: (id: string) => removeAdminFn({ data: { id } }),
    onSuccess: () => {
      toast.success("অ্যাডমিন মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "মুছে ফেলা ব্যর্থ হয়েছে"),
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof ROLE_OPTIONS)[number]>("editor");
  const [creating, setCreating] = useState(false);

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createAdminFn({ data: { name, email, password, role } });
      toast.success("নতুন অ্যাডমিন যোগ করা হয়েছে");
      setName("");
      setEmail("");
      setPassword("");
      setRole("editor");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "যোগ করা ব্যর্থ হয়েছে");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-deep">ইউজার ও অ্যাডমিন</h1>
        <p className="text-sm text-muted-foreground">
          অ্যাডমিন প্যানেলে প্রবেশাধিকারপ্রাপ্ত সকল ব্যবহারকারীর তালিকা।
        </p>
      </div>

      <AdminCard
        title="নতুন অ্যাডমিন যোগ করুন"
        subtitle="নাম, ইমেইল, পাসওয়ার্ড ও অনুমতি দিয়ে সরাসরি অ্যাকাউন্ট তৈরি হবে — কোনো ইমেইল পাঠানো হবে না"
      >
        <form onSubmit={createAdmin} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="new-name">
              নাম
            </label>
            <input
              id="new-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="new-email">
              ইমেইল
            </label>
            <input
              id="new-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="new-password">
              পাসওয়ার্ড
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="new-role">
              অনুমতি
            </label>
            <select
              id="new-role"
              value={role}
              onChange={(e) => setRole(e.target.value as (typeof ROLE_OPTIONS)[number])}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button
            disabled={creating}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 md:col-span-2"
          >
            <UserPlus className="size-4" /> যোগ করুন
          </button>
        </form>
      </AdminCard>

      <AdminCard title="সকল অ্যাডমিন" subtitle={`মোট ${profiles.length} জন`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">নাম</th>
                <th className="px-3 py-2 text-left font-semibold">ইমেইল</th>
                <th className="px-3 py-2 text-left font-semibold">অনুমতি</th>
                <th className="px-3 py-2 text-left font-semibold">সক্রিয়</th>
                <th className="px-3 py-2 text-right font-semibold">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const canEdit = p.id !== session.user.id;
                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">{p.email}</td>
                    <td className="px-3 py-2">
                      {canEdit ? (
                        <select
                          value={p.role}
                          onChange={(e) =>
                            updateProfile.mutate(
                              {
                                id: p.id,
                                patch: { role: e.target.value as (typeof ROLE_OPTIONS)[number] },
                              },
                              {
                                onError: (err) =>
                                  toast.error(err.message || "হালনাগাদ ব্যর্থ হয়েছে"),
                              },
                            )
                          }
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      ) : (
                        p.role
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() =>
                            updateProfile.mutate(
                              { id: p.id, patch: { active: !p.active } },
                              {
                                onError: (err) =>
                                  toast.error(err.message || "হালনাগাদ ব্যর্থ হয়েছে"),
                              },
                            )
                          }
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            p.active
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {p.active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </button>
                      ) : (
                        <span>{p.active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(`${p.name} (${p.email}) কে স্থায়ীভাবে মুছে ফেলবেন?`)
                            ) {
                              removeAdmin.mutate(p.id);
                            }
                          }}
                          disabled={removeAdmin.isPending}
                          className="rounded-md border border-input p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-60"
                          aria-label="মুছে ফেলুন"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
