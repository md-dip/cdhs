import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export const Route = createFileRoute("/accept-invite")({
  // The invite/session tokens Supabase redirects with only ever live in the
  // URL hash fragment, which never reaches the server — this page has to run
  // entirely client-side to read them.
  ssr: false,
  head: () => ({
    meta: [
      { title: "পাসওয়ার্ড সেট করুন | Chhatni Dekhra High School" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AcceptInvite,
});

function AcceptInvite() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "ready" : "invalid");
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("দুটি পাসওয়ার্ড মিলছে না");
      return;
    }
    setSubmitting(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "পাসওয়ার্ড সেট করা ব্যর্থ হয়েছে");
      return;
    }
    toast.success("পাসওয়ার্ড সেট করা হয়েছে");
    await router.navigate({ to: "/tt-prodhan" });
  };

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
        <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-10">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-raise">
          <h1 className="text-lg font-semibold text-destructive">লিংকটি অবৈধ বা মেয়াদোত্তীর্ণ</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            এই আমন্ত্রণ লিংকটি আর কাজ করছে না। সুপার অ্যাডমিনকে নতুন করে আমন্ত্রণ পাঠাতে অনুরোধ
            করুন।
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-raise">
        <div className="panel-header px-5 py-4">
          <h1 className="text-lg font-semibold">আপনার পাসওয়ার্ড সেট করুন</h1>
          <p className="text-xs opacity-90">এটি সেট করার পর অ্যাডমিন প্যানেলে প্রবেশ করতে পারবেন</p>
        </div>
        <form className="space-y-4 p-5" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">
              নতুন পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="confirm">
              পাসওয়ার্ড আবার লিখুন
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            <KeyRound className="size-4" /> পাসওয়ার্ড সংরক্ষণ করুন
          </button>
        </form>
      </div>
    </div>
  );
}
