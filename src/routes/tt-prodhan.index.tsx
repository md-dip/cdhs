import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminCard } from "@/components/admin/AdminShell";
import { sections } from "@/lib/admin-config";
import { useCollection } from "@/lib/queries/collections";

export const Route = createFileRoute("/tt-prodhan/")({
  component: Dashboard,
});

function Dashboard() {
  const { session } = Route.useRouteContext();
  const notices = useCollection("notices");
  const teachers = useCollection("teachers");
  const students = useCollection("students");
  const admissions = useCollection("admissions");
  const routines = useCollection("routines");
  const posts = useCollection("posts");
  const media = useCollection("media");

  const cards = [
    { label: "নোটিশ", value: notices.length },
    { label: "শিক্ষক ও কর্মচারী", value: teachers.length },
    { label: "শিক্ষার্থী", value: students.length },
    { label: "ভর্তি আবেদন", value: admissions.length },
    { label: "রুটিন", value: routines.length },
    { label: "পোস্ট ও সংবাদ", value: posts.length },
    { label: "মিডিয়া ফাইল", value: media.length },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-deep">ড্যাশবোর্ড</h1>
        <p className="text-sm text-muted-foreground">
          স্বাগতম, {session.profile.name}। এখান থেকে ওয়েবসাইটের সকল তথ্য নিয়ন্ত্রণ করা যাবে।
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-4 shadow-card">
            <p className="text-2xl font-bold text-brand-deep">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <AdminCard title="দ্রুত অ্যাকশন" subtitle="প্রয়োজনীয় অপশনে সরাসরি যান">
        <div className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <Link
              key={s.slug}
              to={`/tt-prodhan/${s.slug}` as string}
              className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-secondary"
            >
              {s.title}
            </Link>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="সাম্প্রতিক নোটিশ" subtitle="সর্বশেষ প্রকাশিত নোটিশসমূহ">
        <ul className="divide-y divide-border text-sm">
          {notices.slice(0, 5).map((n) => (
            <li key={n.id} className="flex flex-wrap justify-between gap-2 py-2">
              <span>{String(n["title"])}</span>
              <span className="text-muted-foreground">{String(n["date"] ?? "")}</span>
            </li>
          ))}
        </ul>
      </AdminCard>
    </div>
  );
}
