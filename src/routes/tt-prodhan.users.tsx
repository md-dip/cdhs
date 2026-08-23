import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminShell";
import { useProfiles, useUpdateProfile } from "@/lib/queries/profiles";
import { inviteAdminFn, removeAdminFn } from "@/lib/server-fns/users";

export const Route = createFileRoute("/tt-prodhan/users")({
  component: UsersPage,
});

const ROLE_OPTIONS = ["super-admin", "editor", "viewer"] as const;

function UsersPage() {
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
  const isSuperAdmin = session.profile.role === "super-admin";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await inviteAdminFn({ data: { name, email } });
      toast.success("আমন্ত্রণ ইমেইলে পাঠানো হয়েছে");
      setName("");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "আমন্ত্রণ পাঠানো ব্যর্থ হয়েছে");
    } finally {
      setInviting(false);
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

      {isSuperAdmin ? (
        <AdminCard
          title="নতুন অ্যাডমিন আমন্ত্রণ"
          subtitle="ইমেইলে একটি লিংক যাবে, সেখান থেকে পাসওয়ার্ড সেট করতে হবে"
        >
          <form onSubmit={invite} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="invite-name">
                নাম
              </label>
              <input
                id="invite-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="invite-email">
                ইমেইল
              </label>
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <button
              disabled={inviting}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              <UserPlus className="size-4" /> আমন্ত্রণ পাঠান
            </button>
          </form>
        </AdminCard>
      ) : null}

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
                const canEdit = isSuperAdmin && p.id !== session.user.id;
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
