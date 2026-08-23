import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  CalendarDays,
  UserCog,
  GraduationCap,
  Images,
  Building2,
  Users,
  MessageSquare,
} from "lucide-react";
import { Layout, Panel } from "@/components/site/Layout";
import { TeacherCard } from "@/components/site/TeacherCard";
import { StudentsByClassPanel } from "@/components/site/StudentsByClassTable";
import { school, slides, stats, images } from "@/lib/site-data";
import { collectionQueryOptions, usePublished } from "@/lib/queries/collections";
import { useSettings } from "@/lib/queries/settings";
import { useT } from "@/lib/i18n";

const title = "ছাতনী ঢেকড়া উচ্চ বিদ্যালয় | প্রচ্ছদ";
const description =
  "ছাতনী ঢেকড়া উচ্চ বিদ্যালয়, আদমদীঘি, বগুড়ার অফিসিয়াল ওয়েবসাইট। নোটিশ, রুটিন, ফলাফল, ভর্তি ও শিক্ষকমণ্ডলীর তথ্য।";

const HOME_COLLECTIONS = ["notices", "classes", "teachers", "gallery", "results"] as const;

const GLANCE_FALLBACK_BN =
  "১৯৬৫ সালে প্রতিষ্ঠিত এই বিদ্যালয়টি বগুড়া জেলার আদমদীঘি উপজেলার ছাতনী ঢেকড়া এলাকায় অবস্থিত। ষষ্ঠ থেকে দশম শ্রেণি পর্যন্ত বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা শাখায় পাঠদান করা হয়। ডিজিটাল বাংলাদেশ গড়ার লক্ষ্যে বিদ্যালয়ের সকল তথ্য এই ওয়েবসাইটে নিয়মিত হালনাগাদ করা হয়।";
const GLANCE_FALLBACK_EN =
  "Established in 1965, the school is located at Chhatni Dekhra in Adamdighi upazila of Bogura district. Classes six to ten are taught in the science, humanities and business studies streams. All school information is regularly updated on this website.";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    Promise.all(
      HOME_COLLECTIONS.map((key) =>
        context.queryClient.ensureQueryData(collectionQueryOptions(key, { onlyPublished: true })),
      ),
    ),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

const quickLinks = [
  { to: "/notices", label: "নোটিশ বোর্ড", labelEn: "Notice board", Icon: FileText },
  { to: "/routine", label: "শ্রেণি রুটিন", labelEn: "Class routine", Icon: CalendarDays },
  { to: "/committee", label: "পরিচালনা পর্ষদ", labelEn: "Committee", Icon: UserCog },
  { to: "/academics", label: "একাডেমিক তথ্য", labelEn: "Academics", Icon: GraduationCap },
  { to: "/gallery", label: "ছবির গ্যালারি", labelEn: "Gallery", Icon: Images },
  { to: "/about", label: "প্রতিষ্ঠান পরিচিতি", labelEn: "About school", Icon: Building2 },
  { to: "/contact", label: "যোগাযোগ", labelEn: "Contact", Icon: MessageSquare },
] as const;

function Index() {
  const [i, setI] = useState(0);
  const { t, n, tx, bt } = useT();
  const settings = useSettings();
  const notices = usePublished("notices");
  const gallery = usePublished("gallery");
  const heroSlides = useMemo(() => {
    const marked = gallery.filter((g) => g["showOnHome"] === "on");
    return marked.length > 0
      ? marked.map((g) => ({ src: String(g["src"] ?? ""), caption: String(g["caption"] ?? "") }))
      : slides;
  }, [gallery]);
  useEffect(() => {
    setI(0);
  }, [heroSlides.length]);
  useEffect(() => {
    const tm = setInterval(() => setI((p) => (p + 1) % heroSlides.length), 5000);
    return () => clearInterval(tm);
  }, [heroSlides.length]);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="relative overflow-hidden rounded-lg shadow-[var(--shadow-raise)]">
          {heroSlides.map((s, idx) => (
            <img
              key={s.caption + idx}
              src={s.src}
              alt={s.caption}
              className={`h-[280px] w-full object-cover md:h-[420px] ${idx === i ? "block" : "hidden"}`}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-deep/80 to-transparent px-6 py-5">
            <p className="text-lg font-medium text-brand-foreground">
              {tx(heroSlides[i]?.caption ?? "")}
            </p>
          </div>
          <button
            aria-label={t("আগের ছবি", "Previous slide")}
            onClick={() => setI((p) => (p - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-brand-deep/60 p-2 text-brand-foreground hover:bg-brand-deep"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            aria-label={t("পরের ছবি", "Next slide")}
            onClick={() => setI((p) => (p + 1) % heroSlides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-brand-deep/60 p-2 text-brand-foreground hover:bg-brand-deep"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="mt-6 flex overflow-hidden rounded-lg border border-border bg-surface">
          <div className="flex shrink-0 items-center gap-2 bg-maroon px-4 py-3 text-sm font-semibold text-brand-foreground">
            <Bell className="size-4" /> {t("সর্বশেষ নোটিশ", "Latest notices")}
          </div>
          <div className="flex flex-1 items-center overflow-hidden">
            <div className="flex w-max animate-marquee gap-10 whitespace-nowrap px-6 text-sm">
              {[...notices.slice(0, 4), ...notices.slice(0, 4)].map((nt, idx) => (
                <Link
                  key={`${String(nt["slug"])}-${idx}`}
                  to="/notices/$slug"
                  params={{ slug: String(nt["slug"]) }}
                  className="text-foreground hover:text-brand"
                >
                  ◆ {tx(String(nt["title"]))}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Panel title={t("এক নজরে বিদ্যালয়", "School at a glance")}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-md bg-secondary/70 px-4 py-5 text-center">
                    <div className="text-2xl font-bold text-brand-deep">{n(s.value)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t(s.label, s.labelEn)}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                {bt(
                  settings["glanceBn"] || GLANCE_FALLBACK_BN,
                  settings["glanceEn"] || GLANCE_FALLBACK_EN,
                )}
              </p>
            </Panel>

            <Panel title={t("প্রধান শিক্ষকের বাণী", "Message from the Headmaster")}>
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="shrink-0 text-center">
                  <img
                    src={settings["headPhoto"] || images.headmaster}
                    alt={tx(settings["headName"] ?? "")}
                    className="mx-auto size-36 rounded-md border-2 border-gold object-cover"
                  />
                  <p className="mt-3 font-semibold text-brand-deep">
                    {tx(settings["headName"] ?? "")}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx(settings["headTitle"] ?? "")}</p>
                </div>
                <blockquote className="border-s-4 border-gold ps-5 text-sm leading-7 text-muted-foreground">
                  {bt(
                    String(settings["headMessageBn"] ?? ""),
                    String(settings["headMessageEn"] ?? ""),
                  )}
                </blockquote>
              </div>
            </Panel>

            <Panel title={t("পাবলিক পরীক্ষার ফলাফল", "Public exam results")}>
              <ResultsTable />
            </Panel>
          </div>

          <aside className="space-y-6">
            <Panel title={t("নোটিশ বোর্ড", "Notice board")}>
              <ul className="-mt-2 divide-y divide-border">
                {notices.map((nt) => (
                  <li key={nt.id} className="py-3">
                    <Link
                      to="/notices/$slug"
                      params={{ slug: String(nt["slug"]) }}
                      className="text-sm font-medium text-foreground hover:text-brand"
                    >
                      {tx(String(nt["title"]))}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">{tx(String(nt["date"]))}</p>
                  </li>
                ))}
              </ul>
              <Link
                to="/notices"
                className="mt-4 block rounded-md bg-brand px-4 py-2.5 text-center text-sm font-medium text-brand-foreground hover:bg-brand-deep"
              >
                {t("সকল নোটিশ", "All notices")}
              </Link>
            </Panel>

            <Panel title={t("প্রয়োজনীয় লিংক", "Useful links")}>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map(({ to, label, labelEn, Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex flex-col items-center gap-2 rounded-md bg-secondary/70 px-3 py-5 text-center text-xs text-secondary-foreground hover:bg-secondary"
                  >
                    <Icon className="size-5 text-brand" />
                    {t(label, labelEn)}
                  </Link>
                ))}
              </div>
            </Panel>

            <Panel title={t("প্রতিষ্ঠানের তথ্য", "Institution info")}>
              <dl className="-mt-2 divide-y divide-border text-sm">
                {[
                  [t("ইআইআইএন", "EIIN"), school.eiin],
                  [t("স্থাপিত", "Established"), settings["founded"] || school.founded],
                  [t("বোর্ড", "Board"), t(school.board, "Rajshahi")],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium">{n(String(v))}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </aside>
        </div>

        <div className="mt-6 space-y-6">
          <StudentsByClassPanel
            title={t("শ্রেণি ও লিঙ্গ অনুযায়ী শিক্ষার্থী", "Students by class and gender")}
          />
          <TeachersPanel />
        </div>
      </div>
    </Layout>
  );
}

function ResultsTable() {
  const { t, n, tx } = useT();
  const results = usePublished("results");
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-start text-muted-foreground">
            {[
              t("সন", "Year"),
              t("পরীক্ষা", "Exam"),
              t("অংশগ্রহণ", "Appeared"),
              t("উত্তীর্ণ", "Passed"),
              t("জিপিএ-৫", "GPA-5"),
            ].map((h) => (
              <th key={h} className="px-3 py-2.5 text-start font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id} className="border-b border-border/70 last:border-0">
              <td className="px-3 py-2.5">{n(String(r["year"] ?? ""))}</td>
              <td className="px-3 py-2.5">{tx(String(r["exam"] ?? ""))}</td>
              <td className="px-3 py-2.5">{n(String(r["appeared"] ?? ""))}</td>
              <td className="px-3 py-2.5">{n(String(r["passed"] ?? ""))}</td>
              <td className="px-3 py-2.5">{n(String(r["gpa5"] ?? ""))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const HOME_TEACHER_LIMIT = 7;

function TeachersPanel() {
  const { t } = useT();
  const teachers = usePublished("teachers");
  const overflowing = teachers.length > HOME_TEACHER_LIMIT;
  const shown = overflowing ? teachers.slice(0, HOME_TEACHER_LIMIT) : teachers;
  return (
    <Panel title={t("শিক্ষকমণ্ডলী ও কর্মচারী", "Teachers & staff")}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((tc) => (
          <TeacherCard key={tc.id} teacher={tc} />
        ))}
        {overflowing ? (
          <Link
            to="/teachers"
            className="surface-card flex flex-col items-center justify-center gap-2 p-5 text-center text-brand hover:bg-secondary/60"
          >
            <Users className="size-8" />
            <span className="text-sm font-bold">
              {t("সম্পূর্ণ তালিকা দেখুন", "View full list")}
            </span>
          </Link>
        ) : null}
      </div>
    </Panel>
  );
}
