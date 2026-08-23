import { Phone, User } from "lucide-react";
import type { Row } from "@/lib/queries/collections";
import { useT } from "@/lib/i18n";

export function TeacherCard({ teacher }: { teacher: Row }) {
  const { n, tx } = useT();
  return (
    <article className="surface-card p-5 text-center">
      {teacher["photo"] ? (
        <img
          src={String(teacher["photo"])}
          alt={String(teacher["name"])}
          className="mx-auto size-20 rounded-full border-2 border-gold object-cover"
        />
      ) : (
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-secondary">
          <User className="size-8 text-brand/70" />
        </div>
      )}
      <h3 className="mt-3 text-sm font-bold text-brand-deep">{tx(String(teacher["name"]))}</h3>
      <p className="mt-1 text-xs text-brand">{tx(String(teacher["role"]))}</p>
      {teacher["subject"] ? (
        <p className="mt-1 text-xs text-muted-foreground">{tx(String(teacher["subject"]))}</p>
      ) : null}
      {teacher["phone"] ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="size-3.5" /> {n(String(teacher["phone"]))}
        </p>
      ) : null}
    </article>
  );
}
