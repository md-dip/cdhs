import { Link, useRouter } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  BookOpen,
  Settings,
  Image,
  KeyRound,
  HelpCircle,
  Users,
} from "lucide-react";
import { sections } from "@/lib/admin-config";
import { useSettings } from "@/lib/queries/settings";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AdminSession } from "@/lib/server-fns/auth";

function NavLink({
  to,
  children,
  onNavigate,
}: {
  to: string;
  children: ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="block rounded-md px-3 py-2 text-sm text-brand-foreground/80 transition-colors hover:bg-brand hover:text-brand-foreground"
      activeOptions={{ exact: to === "/tt-prodhan" }}
      activeProps={{ className: "bg-brand text-brand-foreground" }}
    >
      {children}
    </Link>
  );
}

export function AdminShell({ children, session }: { children: ReactNode; session: AdminSession }) {
  const [open, setOpen] = useState(false);
  const settings = useSettings();
  const router = useRouter();
  const close = () => setOpen(false);

  const logout = async () => {
    await getSupabaseBrowserClient().auth.signOut();
    await router.navigate({ to: "/admin-login" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-brand-deep px-4 py-3 text-brand-foreground">
        <button
          type="button"
          aria-label="মেনু"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-1.5 hover:bg-brand lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <span className="font-semibold">{settings["nameBn"]} — অ্যাডমিন প্যানেল</span>
        <div className="ml-auto flex items-center gap-3 text-xs">
          <span className="hidden sm:inline">
            {session.profile.name} ({session.profile.role})
          </span>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 font-medium hover:bg-brand/80"
          >
            <LogOut className="size-4" /> লগ আউট
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        <aside
          className={`${open ? "block" : "hidden"} w-full shrink-0 bg-brand-deep p-3 lg:block lg:w-64`}
        >
          <p className="px-3 pb-1 pt-2 text-[11px] uppercase tracking-wide text-brand-foreground/50">
            সাধারণ
          </p>
          <NavLink to="/tt-prodhan" onNavigate={close}>
            <span className="inline-flex items-center gap-2">
              <LayoutDashboard className="size-4" /> ড্যাশবোর্ড
            </span>
          </NavLink>
          <NavLink to="/tt-prodhan/media" onNavigate={close}>
            <span className="inline-flex items-center gap-2">
              <Image className="size-4" /> মিডিয়া লাইব্রেরি
            </span>
          </NavLink>

          <p className="px-3 pb-1 pt-4 text-[11px] uppercase tracking-wide text-brand-foreground/50">
            কনটেন্ট
          </p>
          {sections.map((s) => (
            <NavLink key={s.slug} to={`/tt-prodhan/${s.slug}`} onNavigate={close}>
              <span className="inline-flex items-center gap-2">
                <BookOpen className="size-4" /> {s.title}
              </span>
            </NavLink>
          ))}

          <p className="px-3 pb-1 pt-4 text-[11px] uppercase tracking-wide text-brand-foreground/50">
            সেটিংস
          </p>
          <NavLink to="/tt-prodhan/settings" onNavigate={close}>
            <span className="inline-flex items-center gap-2">
              <Settings className="size-4" /> সাধারণ সেটিংস
            </span>
          </NavLink>
          <NavLink to="/tt-prodhan/users" onNavigate={close}>
            <span className="inline-flex items-center gap-2">
              <Users className="size-4" /> ইউজার ও অ্যাডমিন
            </span>
          </NavLink>
          <NavLink to="/tt-prodhan/password" onNavigate={close}>
            <span className="inline-flex items-center gap-2">
              <KeyRound className="size-4" /> পাসওয়ার্ড ও নিরাপত্তা
            </span>
          </NavLink>
          <NavLink to="/tt-prodhan/guide" onNavigate={close}>
            <span className="inline-flex items-center gap-2">
              <HelpCircle className="size-4" /> ব্যবহার নির্দেশিকা
            </span>
          </NavLink>
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function AdminCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <div className="panel-header px-4 py-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle ? <p className="text-xs opacity-90">{subtitle}</p> : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
