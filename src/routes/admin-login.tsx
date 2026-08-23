import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/lib/queries/settings";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getServerSession } from "@/lib/server-fns/auth";

export const Route = createFileRoute("/admin-login")({
  beforeLoad: async () => {
    const session = await getServerSession();
    if (session) throw redirect({ to: "/tt-prodhan" });
  },
  head: () => ({
    meta: [
      { title: "অ্যাডমিন লগইন | Chhatni Dekhra High School" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginScreen,
});

function LoginScreen() {
  const settings = useSettings();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setSubmitting(false);
    if (error) {
      toast.error("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
      return;
    }
    toast.success("লগইন সফল হয়েছে");
    await router.navigate({ to: "/tt-prodhan" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-raise">
        <div className="panel-header px-5 py-4">
          <h1 className="text-lg font-semibold">{settings["nameBn"]}</h1>
          <p className="text-xs opacity-90">অ্যাডমিন প্যানেল লগইন</p>
        </div>
        <form className="space-y-4 p-5" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">
              ইমেইল ঠিকানা
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            <LogIn className="size-4" /> লগইন করুন
          </button>
        </form>
      </div>
    </div>
  );
}
