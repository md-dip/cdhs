import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-border bg-secondary/60">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold text-brand-deep md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
    </div>
  );
}

export function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface-card overflow-hidden ${className}`}>
      <h2 className="panel-header flex items-center gap-2 px-5 py-3.5 text-base font-semibold">
        <span className="text-gold">◆</span>
        {title}
      </h2>
      <div className="p-5">{children}</div>
    </section>
  );
}
