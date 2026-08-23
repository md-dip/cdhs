import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminShell";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export const Route = createFileRoute("/tt-prodhan/password")({
  component: PasswordPage,
});

function PasswordPage() {
  const { session } = Route.useRouteContext();
  if (session.profile.role !== "super-admin") {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-deep">
            পাসওয়ার্ড ও নিরাপত্তা
          </h1>
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
  return <PasswordForm />;
}

function PasswordForm() {
  const { session } = Route.useRouteContext();
  const router = useRouter();
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const supabase = getSupabaseBrowserClient();

    // Re-verify the current password before allowing a change.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: oldPass,
    });
    if (reauthError) {
      setSubmitting(false);
      toast.error("পূর্ববর্তী পাসওয়ার্ড সঠিক নয়");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPass });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে");
      return;
    }

    toast.success("পাসওয়ার্ড পরিবর্তিত হয়েছে, পুনরায় লগইন করুন");
    await supabase.auth.signOut();
    await router.navigate({ to: "/admin-login" });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-deep">পাসওয়ার্ড ও নিরাপত্তা</h1>
        <p className="text-sm text-muted-foreground">
          পাসওয়ার্ড পরিবর্তনের পর সকল ডিভাইস থেকে অ্যাকাউন্ট লগ আউট হয়ে যাবে।
        </p>
      </div>
      <AdminCard title="পাসওয়ার্ড পরিবর্তন">
        <form className="max-w-md space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="old">
              পূর্ববর্তী পাসওয়ার্ড
            </label>
            <input
              id="old"
              type="password"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="new">
              নতুন পাসওয়ার্ড
            </label>
            <input
              id="new"
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              minLength={6}
              required
            />
          </div>
          <button
            disabled={submitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            পরিবর্তন করুন
          </button>
        </form>
      </AdminCard>
    </div>
  );
}
